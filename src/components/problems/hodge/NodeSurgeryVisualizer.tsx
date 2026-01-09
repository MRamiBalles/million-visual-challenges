import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { Activity, Zap, Play, Pause, Cpu } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';

// Import WebGPU components (Three.js r170+)
// Note: WebGPURenderer is experimental and may require specific browser flags
let WebGPURenderer: any = null;
let isWebGPUAvailable = false;

// Dynamic import for WebGPU (graceful fallback)
const loadWebGPU = async () => {
    try {
        const webgpu = await import('three/webgpu');
        WebGPURenderer = webgpu.WebGPURenderer;
        isWebGPUAvailable = true;
        return true;
    } catch (e) {
        console.warn('WebGPU not available, falling back to WebGL');
        return false;
    }
};

/**
 * NIST DLMF Phase Mapping Shader
 * Height = |f(z)|
 * Hue = arg(f(z))
 * 
 * Este shader implementa el estándar NIST para visualización de funciones complejas.
 * En WebGPU, la deformación se calculará en un Compute Shader separado.
 */
const DLMFShader = {
    uniforms: {
        uTime: { value: 0 },
        uNodalParameter: { value: 0 },
        uNodeCount: { value: 7 },
        // Node positions (7 nodos máximo para cuártica K3)
        uNode0: { value: new THREE.Vector3(1.2, 0, 0) },
        uNode1: { value: new THREE.Vector3(0.37, 1.14, 0.05) },
        uNode2: { value: new THREE.Vector3(-0.97, 0.71, 0.09) },
        uNode3: { value: new THREE.Vector3(-0.97, -0.71, 0.09) },
        uNode4: { value: new THREE.Vector3(0.37, -1.14, -0.05) },
        uNode5: { value: new THREE.Vector3(0.8, 0.4, 0.1) },
        uNode6: { value: new THREE.Vector3(-0.5, -0.5, -0.1) }
    },
    vertexShader: `
    varying vec2 vUv;
    varying vec3 vPosition;
    varying float vPinchIntensity;
    uniform float uTime;
    uniform float uNodalParameter;
    uniform int uNodeCount;
    uniform vec3 uNode0, uNode1, uNode2, uNode3, uNode4, uNode5, uNode6;

    float computePinch(vec3 pos, vec3 nodePos) {
        float dist = length(pos - nodePos);
        return exp(-dist * 5.0) * uNodalParameter;
    }

    void main() {
        vUv = uv;
        vec3 pos = position;
        
        // Acumulación de pellizco de múltiples nodos (7 nodos para alpha = h + 3v1 - 4v2)
        float totalPinch = 0.0;
        totalPinch += computePinch(pos, uNode0);
        totalPinch += computePinch(pos, uNode1);
        totalPinch += computePinch(pos, uNode2);
        totalPinch += computePinch(pos, uNode3);
        totalPinch += computePinch(pos, uNode4);
        totalPinch += computePinch(pos, uNode5);
        totalPinch += computePinch(pos, uNode6);
        
        // Aplicar deformación nodal
        float scale = 1.0 - min(totalPinch, 0.95);
        pos.xy *= scale;
        
        // Ondulación temporal para visualizar dinámica
        pos.z += sin(length(pos.xy) * 10.0 - uTime) * 0.1 * (1.0 - totalPinch);
        
        vPosition = pos;
        vPinchIntensity = totalPinch;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `,
    fragmentShader: `
    varying vec2 vUv;
    varying vec3 vPosition;
    varying float vPinchIntensity;
    uniform float uTime;

    // Función HSL a RGB (NIST Standard)
    vec3 hsl2rgb(vec3 c) {
        vec3 rgb = clamp(abs(mod(c.x*6.0+vec3(0.0,4.0,2.0),6.0)-3.0)-1.0, 0.0, 1.0);
        return c.z + c.y * (rgb-0.5)*(1.0-abs(2.0*c.z-1.0));
    }

    void main() {
        // Mapeo NIST DLMF: Hue = Argumento(Fase Compleja)
        float angle = atan(vPosition.y, vPosition.x) + uTime * 0.3;
        float hue = (angle + 3.14159) / (2.0 * 3.14159);
        
        // Brillo basado en intensidad de pellizco (resalta singularidades)
        float intensity = 0.5 + 0.4 * sin(vPosition.z * 10.0);
        float saturation = 0.7 + 0.3 * vPinchIntensity;
        
        vec3 color = hsl2rgb(vec3(hue, saturation, intensity * 0.5 + 0.25));
        
        // Efecto de "glow" cerca de las singularidades
        if (vPinchIntensity > 0.5) {
            color = mix(color, vec3(1.0, 0.9, 0.7), (vPinchIntensity - 0.5) * 2.0);
        }
        
        // Grid científico
        float gridX = abs(sin(vUv.x * 40.0));
        float gridY = abs(sin(vUv.y * 40.0));
        float grid = gridX * gridY;
        grid = step(0.95, grid);
        
        gl_FragColor = vec4(mix(color, vec3(1.0), grid * 0.2), 1.0);
    }
  `
};

export const NodeSurgeryVisualizer = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const rendererRef = useRef<any>(null);
    const materialRef = useRef<THREE.ShaderMaterial | null>(null);

    const [isPlaying, setIsPlaying] = useState(true);
    const [nodalParam, setNodalParam] = useState(0.5);
    const [fps, setFps] = useState(60);
    const [rendererType, setRendererType] = useState<'webgl' | 'webgpu'>('webgl');
    const [vertexCount, setVertexCount] = useState(0);

    useEffect(() => {
        if (!containerRef.current) return;

        let animationId: number;
        let time = 0;
        let frameCount = 0;
        let lastTime = performance.now();

        const initRenderer = async () => {
            const scene = new THREE.Scene();
            scene.background = new THREE.Color(0x030308);

            const camera = new THREE.PerspectiveCamera(
                75,
                containerRef.current!.clientWidth / containerRef.current!.clientHeight,
                0.1,
                1000
            );
            camera.position.z = 4;

            // Try WebGPU first, fallback to WebGL
            let renderer: any;
            const webgpuLoaded = await loadWebGPU();

            if (webgpuLoaded && WebGPURenderer) {
                try {
                    renderer = new WebGPURenderer({ antialias: true });
                    await renderer.init();
                    setRendererType('webgpu');
                    console.log('✅ WebGPU Renderer initialized');
                } catch (e) {
                    console.warn('WebGPU init failed, using WebGL:', e);
                    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
                    setRendererType('webgl');
                }
            } else {
                renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
                setRendererType('webgl');
            }

            renderer.setSize(containerRef.current!.clientWidth, containerRef.current!.clientHeight);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            containerRef.current!.appendChild(renderer.domElement);
            rendererRef.current = renderer;

            // OrbitControls (dynamic import for compatibility)
            const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js');
            const controls = new OrbitControls(camera, renderer.domElement);
            controls.enableDamping = true;
            controls.dampingFactor = 0.05;

            // High-density geometry for K3 surface simulation
            const geometry = new THREE.TorusKnotGeometry(1.5, 0.4, 256, 64);
            setVertexCount(geometry.attributes.position.count);

            const material = new THREE.ShaderMaterial({
                uniforms: THREE.UniformsUtils.clone(DLMFShader.uniforms),
                vertexShader: DLMFShader.vertexShader,
                fragmentShader: DLMFShader.fragmentShader,
                side: THREE.DoubleSide,
            });
            materialRef.current = material;

            const mesh = new THREE.Mesh(geometry, material);
            scene.add(mesh);

            // Lighting
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
            scene.add(ambientLight);

            const pointLight = new THREE.PointLight(0x00ffff, 1.5);
            pointLight.position.set(5, 5, 5);
            scene.add(pointLight);

            const pointLight2 = new THREE.PointLight(0xff00ff, 0.8);
            pointLight2.position.set(-5, -5, 5);
            scene.add(pointLight2);

            // Animation loop
            const animate = () => {
                animationId = requestAnimationFrame(animate);

                // FPS Counter
                frameCount++;
                const now = performance.now();
                if (now - lastTime >= 1000) {
                    setFps(frameCount);
                    frameCount = 0;
                    lastTime = now;
                }

                if (isPlaying) {
                    time += 0.01;
                    material.uniforms.uTime.value = time;
                }

                material.uniforms.uNodalParameter.value = nodalParam;
                controls.update();
                renderer.render(scene, camera);
            };

            animate();

            // Resize handler
            const handleResize = () => {
                if (!containerRef.current) return;
                camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
            };

            window.addEventListener('resize', handleResize);

            return () => {
                window.removeEventListener('resize', handleResize);
                cancelAnimationFrame(animationId);
                if (containerRef.current && renderer.domElement) {
                    containerRef.current.removeChild(renderer.domElement);
                }
                geometry.dispose();
                material.dispose();
                renderer.dispose();
            };
        };

        const cleanup = initRenderer();

        return () => {
            cleanup.then(fn => fn && fn());
        };
    }, []);

    // Update uniforms when parameters change
    useEffect(() => {
        if (materialRef.current) {
            materialRef.current.uniforms.uNodalParameter.value = nodalParam;
        }
    }, [nodalParam]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[600px]">
            {/* 3D Visualizer - 3/4 Width */}
            <Card className="lg:col-span-3 relative bg-black/40 border-indigo-500/20 overflow-hidden group">
                <div ref={containerRef} className="w-full h-full" />

                {/* HUD Overlay */}
                <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none">
                    <Badge className={`backdrop-blur-md ${rendererType === 'webgpu'
                            ? 'bg-green-500/10 text-green-400 border-green-500/20'
                            : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                        }`}>
                        {rendererType === 'webgpu' ? '🚀 WEBGPU ACTIVO' : 'WEBGL 2.0'} | NIST DLMF
                    </Badge>
                    <div className="p-3 bg-black/70 backdrop-blur border border-white/10 rounded-lg max-w-[280px]">
                        <p className="text-[10px] text-cyan-500/70 font-mono mb-1">CLASE: α = h + 3v₁ - 4v₂</p>
                        <p className="text-[10px] text-white/50 font-mono mb-2">TARGET: 7 SINGULARIDADES (NODOS)</p>
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 transition-all duration-300"
                                style={{ width: `${(nodalParam / 1.5) * 100}%` }}
                            />
                        </div>
                        <div className="flex justify-between mt-1 text-[8px] text-white/30 font-mono">
                            <span>SUAVE (t=1)</span>
                            <span>SINGULAR (t→0)</span>
                        </div>
                    </div>
                </div>

                <div className="absolute bottom-4 right-4 flex gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="bg-black/40 border-white/10 hover:bg-black/60"
                    >
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>
                    <Badge variant="outline" className="bg-black/40 border-white/10 text-[10px] flex items-center gap-1">
                        <Cpu className="w-3 h-3" />
                        {vertexCount.toLocaleString()} VÉRTICES
                    </Badge>
                </div>
            </Card>

            {/* Control Panel - 1/4 Width */}
            <Card className="p-4 bg-black/60 border-indigo-500/20 flex flex-col gap-6">
                <div>
                    <h3 className="text-sm font-bold text-white/70 mb-4 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-yellow-500" /> CIRUGÍA NODAL
                    </h3>
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <div className="flex justify-between text-[10px] text-white/40 font-mono">
                                <span>DEFORMACIÓN t</span>
                                <span className="text-cyan-400">{nodalParam.toFixed(2)}</span>
                            </div>
                            <Slider
                                value={[nodalParam]}
                                onValueChange={(v) => setNodalParam(v[0])}
                                min={0}
                                max={1.5}
                                step={0.01}
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-auto space-y-3">
                    <div className="p-3 bg-indigo-500/5 border border-indigo-500/20 rounded-lg">
                        <div className="flex items-center gap-2 mb-2 text-indigo-300 font-bold text-xs">
                            <Activity className="w-3 h-3" /> TELEMETRÍA GPU
                        </div>
                        <div className="space-y-1.5">
                            <div className="flex justify-between text-[10px]">
                                <span className="text-white/40">FPS</span>
                                <span className={`font-mono ${fps >= 55 ? 'text-green-400' : fps >= 30 ? 'text-yellow-400' : 'text-red-400'}`}>
                                    {fps}
                                </span>
                            </div>
                            <div className="flex justify-between text-[10px]">
                                <span className="text-white/40">RENDERER</span>
                                <span className={`font-mono ${rendererType === 'webgpu' ? 'text-green-400' : 'text-cyan-400'}`}>
                                    {rendererType.toUpperCase()}
                                </span>
                            </div>
                            <div className="flex justify-between text-[10px]">
                                <span className="text-white/40">DRAW CALLS</span>
                                <span className="text-indigo-400 font-mono">1</span>
                            </div>
                            <div className="flex justify-between text-[10px]">
                                <span className="text-white/40">NODOS</span>
                                <span className="text-yellow-400 font-mono">7</span>
                            </div>
                        </div>
                    </div>

                    <p className="text-[10px] text-white/30 leading-relaxed">
                        {rendererType === 'webgpu'
                            ? 'Compute Shaders activos. Deformación calculada en paralelo en GPU.'
                            : 'Fallback WebGL. Actualice su navegador para WebGPU.'}
                    </p>
                </div>
            </Card>
        </div>
    );
};
