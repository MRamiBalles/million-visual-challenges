import React, { useEffect, useRef, useState } from 'react';
import { WebGPUFluid, FluidParams } from '../../simulation/navier-stokes/WebGPUFluid';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, Droplets } from 'lucide-react';

const FluidSimulationWebGPU: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [engine, setEngine] = useState<WebGPUFluid | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [fps, setFps] = useState(0);

    useEffect(() => {
        async function initWebGPU() {
            if (!navigator.gpu) {
                console.error("WebGPU not supported");
                return;
            }

            const adapter = await navigator.gpu.requestAdapter();
            if (!adapter) return;
            const device = await adapter.requestDevice();

            const params: FluidParams = {
                dt: 0.1,
                gravity: -0.05,
                particleCount: 50000,
                gridRes: 64,
            };

            const fluidEngine = new WebGPUFluid(device, params);
            setEngine(fluidEngine);

            // Basic render loop (Point rendering for now)
            const context = canvasRef.current?.getContext('webgpu');
            if (!context) return;

            // ... (WebGPU Render Pipeline Setup would go here for screen-space rendering)
            // For the initial act, we will use the compute engine and a simple visualizer.
        }

        initWebGPU();
    }, []);

    useEffect(() => {
        let animationFrame: number;
        let lastTime = performance.now();
        let frames = 0;

        function loop() {
            if (engine && isPlaying) {
                engine.step();
                // Render logic here

                frames++;
                const now = performance.now();
                if (now - lastTime >= 1000) {
                    setFps(frames);
                    frames = 0;
                    lastTime = now;
                }
            }
            animationFrame = requestAnimationFrame(loop);
        }

        animationFrame = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(animationFrame);
    }, [engine, isPlaying]);

    return (
        <Card className="bg-slate-900 border-slate-800 overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xl flex items-center gap-2">
                    <Droplets className="w-5 h-5 text-blue-500" />
                    Simulador WebGPU MLS-MPM
                </CardTitle>
                <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-500">{fps} FPS</span>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="h-8 w-8 p-0"
                    >
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                    >
                        <RotateCcw className="w-4 h-4" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="relative aspect-square w-full max-w-2xl mx-auto bg-black rounded-lg border border-slate-700 overflow-hidden">
                    <canvas
                        ref={canvasRef}
                        className="w-full h-full cursor-crosshair"
                    />
                    {!engine && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                            <p className="text-slate-400 animate-pulse">Iniciando WebGPU...</p>
                        </div>
                    )}
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4 text-xs font-mono text-slate-400">
                    <div className="p-2 bg-slate-800/50 rounded">
                        <p>Partículas: 50,000</p>
                        <p>Algoritmo: MLS-MPM</p>
                    </div>
                    <div className="p-2 bg-slate-800/50 rounded">
                        <p>Precisión: f32 (Atomic Bit-cast)</p>
                        <p>Render: Screen-Space Fluid</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default FluidSimulationWebGPU;
