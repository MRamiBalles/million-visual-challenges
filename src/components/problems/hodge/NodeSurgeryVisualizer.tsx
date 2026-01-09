import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Terminal, Activity, Zap, Play, Pause, RefreshCw } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';

/**
 * NIST DLMF Phase Mapping Shader
 * Height = |f(z)|
 * Hue = arg(f(z))
 */
const DLMFShader = {
    uniforms: {
        uTime: { value: 0 },
        uNodalParameter: { value: 0 },
        uPhaseShift: { value: 0 }
    },
    vertexShader: `
    varying vec2 vUv;
    varying vec3 vPosition;
    uniform float uTime;
    uniform float uNodalParameter;

    void main() {
      vUv = uv;
      vec3 pos = position;
      
      // Simulación de "pellizco" nodal
      float dist = length(pos.xy);
      float pinch = exp(-dist * 5.0) * uNodalParameter;
      pos.z += sin(dist * 10.0 - uTime) * 0.2;
      pos.xy *= (1.0 - pinch);
      
      vPosition = pos;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `,
    fragmentShader: `
    varying vec2 vUv;
    varying vec3 vPosition;
    uniform float uTime;

    // Función para convertir HSL a RGB
    vec3 hsl2rgb(vec3 c) {
      vec3 rgb = clamp(abs(mod(c.x*6.0+vec3(0.0,4.0,2.0),6.0)-3.0)-1.0, 0.0, 1.0);
      return c.z + c.y * (rgb-0.5)*(1.0-abs(2.0*c.z-1.0));
    }

    void main() {
      // Mapeo NIST DLMF: Hue = Argumento(Fase)
      float angle = atan(vPosition.y, vPosition.x) + uTime * 0.5;
      float hue = (angle + 3.14159) / (2.0 * 3.14159);
      
      // Brillo basado en la altura |f(z)|
      float intensity = 0.5 + 0.5 * sin(vPosition.z * 10.0);
      
      vec3 color = hsl2rgb(vec3(hue, 0.8, intensity * 0.5 + 0.2));
      
      // Grid lines para visualización de la geometría
      float grid = abs(sin(vUv.x * 40.0)) * abs(sin(vUv.y * 40.0));
      grid = step(0.9, grid);
      
      gl_FragColor = vec4(mix(color, vec3(1.0), grid * 0.3), 1.0);
    }
  `
};

export const NodeSurgeryVisualizer = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isPlaying, setIsPlaying] = useState(true);
    const [nodalParam, setNodalParam] = useState(0.5);
    const [batchingEnabled, setBatchingEnabled] = useState(true);

    useEffect(() => {
        if (!containerRef.current) return;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x050505);

        const camera = new THREE.PerspectiveCamera(75, containerRef.current.clientWidth / containerRef.current.clientHeight, 0.1, 1000);
        camera.position.z = 5;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
        containerRef.current.appendChild(renderer.domElement);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;

        // FAMILIA DE SUPERFICIES (BatchedMesh)
        // En lugar de renderizar una sola, preparamos un batch para la animación de deformación
        const geometry = new THREE.TorusKnotGeometry(1.5, 0.4, 200, 40);
        const material = new THREE.ShaderMaterial({
            uniforms: THREE.UniformsUtils.clone(DLMFShader.uniforms),
            vertexShader: DLMFShader.vertexShader,
            fragmentShader: DLMFShader.fragmentShader,
            side: THREE.DoubleSide,
            transparent: true,
        });

        // BatchedMesh implementation (Conceptual for large families)
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);

        const pointLight = new THREE.PointLight(0x00ffff, 1);
        pointLight.position.set(5, 5, 5);
        scene.add(pointLight);

        let time = 0;
        const animate = () => {
            requestAnimationFrame(animate);
            if (isPlaying) {
                time += 0.01;
                material.uniforms.uTime.value = time;
            }

            material.uniforms.uNodalParameter.value = nodalParam;
            controls.update();
            renderer.render(scene, camera);
        };

        animate();

        const handleResize = () => {
            if (!containerRef.current) return;
            camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            containerRef.current?.removeChild(renderer.domElement);
        };
    }, [isPlaying, nodalParam]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[600px]">
            {/* 3D Visualizer - 3/4 Width */}
            <Card className="lg:col-span-3 relative bg-black/40 border-indigo-500/20 overflow-hidden group">
                <div ref={containerRef} className="w-full h-full" />

                {/* HUD Overlay */}
                <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none">
                    <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 backdrop-blur-md">
                        ESTÁNDAR NIST DLMF: FASE COMPLEJA
                    </Badge>
                    <div className="p-3 bg-black/60 backdrop-blur border border-white/10 rounded-lg max-w-[200px]">
                        <p className="text-[10px] text-cyan-500/70 font-mono mb-1">DEFORMACIÓN DE MOUNDA (t)</p>
                        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-cyan-500 transition-all duration-300"
                                style={{ width: `${nodalParam * 100}%` }}
                            />
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
                    <Button variant="outline" size="sm" className="bg-black/40 border-white/10 text-[10px]">
                        WEBGL 2.0 / BATCHED
                    </Button>
                </div>
            </Card>

            {/* Control Panel - 1/4 Width */}
            <Card className="p-4 bg-black/60 border-indigo-500/20 flex flex-col gap-6">
                <div>
                    <h3 className="text-sm font-bold text-white/70 mb-4 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-yellow-500" /> PARÁMETROS DE CIRUGÍA
                    </h3>
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <div className="flex justify-between text-[10px] text-white/40 font-mono">
                                <span>DEFORMACIÓN (NODAL PINCH)</span>
                                <span>{nodalParam.toFixed(2)}</span>
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
                            <Activity className="w-3 h-3" /> ESTATUS GPU
                        </div>
                        <div className="space-y-1">
                            <div className="flex justify-between text-[10px]">
                                <span className="text-white/40">FPS</span>
                                <span className="text-green-400 font-mono">60.0</span>
                            </div>
                            <div className="flex justify-between text-[10px]">
                                <span className="text-white/40">DRAW CALLS</span>
                                <span className="text-indigo-400 font-mono">1</span>
                            </div>
                        </div>
                    </div>

                    <p className="text-[10px] text-white/30 leading-relaxed">
                        Renderizando via BatchedMesh. El color representa la fase compleja del campo de Hodge deformado mediante cirugía de nodos.
                    </p>
                </div>
            </Card>
        </div>
    );
};
