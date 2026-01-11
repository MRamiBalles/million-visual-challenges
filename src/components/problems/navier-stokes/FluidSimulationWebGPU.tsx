import * as React from 'react';
import { WebGPUFluid, FluidParams } from '@/simulation/navier-stokes/WebGPUFluid';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, Droplets } from 'lucide-react';

const FluidSimulationWebGPU: React.FC = () => {
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const [engine, setEngine] = React.useState<WebGPUFluid | null>(null);
    const [isPlaying, setIsPlaying] = React.useState(true);
    const [fps, setFps] = React.useState(0);
    const [particleCount] = React.useState(50000);
    const [sigma, setSigma] = React.useState(0);
    const [substeps, setSubsteps] = React.useState(2);

    React.useEffect(() => {
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

            if (canvasRef.current) {
                const context = canvasRef.current.getContext('webgpu');
                if (context) {
                    context.configure({
                        device,
                        format: navigator.gpu.getPreferredCanvasFormat(),
                        alphaMode: 'premultiplied',
                    });
                }
            }

            setEngine(fluidEngine);

            // Basic render logic setup...
        }

        initWebGPU();
    }, []);

    React.useEffect(() => {
        let animationFrame: number;
        let lastTime = performance.now();
        let frames = 0;

        function loop() {
            if (engine && isPlaying && canvasRef.current) {
                const context = canvasRef.current.getContext('webgpu');
                if (context) {
                    engine.step(substeps);
                    engine.render(context);
                }

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

    const toggleSimulation = () => setIsPlaying(!isPlaying);

    const triggerBifurcation = () => {
        if (engine) {
            engine.injectPerturbation(sigma);
        }
    };

    const resetSymmetric = () => {
        if (engine) {
            engine.reinitBifurcation();
        }
    };

    return (
        <Card className="bg-slate-900 border-slate-800 overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xl flex items-center gap-2">
                    <Droplets className="w-5 h-5 text-blue-500" />
                    Simulador WebGPU MLS-MPM
                </CardTitle>
                <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-500">{fps} FPS</span>
                    <div className="flex items-center gap-4">
                        <Button
                            variant={isPlaying ? "outline" : "default"}
                            onClick={toggleSimulation}
                            className="bg-blue-600 hover:bg-blue-700 text-white border-none"
                        >
                            {isPlaying ? "Pausar" : "Simular"}
                        </Button>

                        <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-md border border-slate-800">
                            <span className="text-xs text-slate-400 font-mono">$\sigma$:</span>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={sigma}
                                onChange={(e) => setSigma(parseFloat(e.target.value))}
                                className="w-24 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                            />
                            <span className="text-xs text-blue-400 font-mono w-8">{sigma.toFixed(2)}</span>
                        </div>

                        <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-md border border-slate-800" title="Sub-stepping (Reduce viscosidad numérica)">
                            <span className="text-xs text-slate-400 font-mono">Δt_sub:</span>
                            <input
                                type="range"
                                min="1"
                                max="10"
                                step="1"
                                value={substeps}
                                onChange={(e) => setSubsteps(parseInt(e.target.value))}
                                className="w-16 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                            />
                            <span className="text-xs text-green-400 font-mono w-4">{substeps}</span>
                        </div>

                        <Button
                            variant="outline"
                            onClick={triggerBifurcation}
                            className="text-amber-400 border-amber-900/50 hover:bg-amber-900/20"
                        >
                            Inyectar $\bar{"{"}v{"}"}$
                        </Button>

                        <Button
                            variant="ghost"
                            onClick={resetSymmetric}
                            className="text-slate-500 hover:text-white"
                        >
                            Reset Simetría
                        </Button>
                    </div>
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
                        <p>Precisión: f32 (Fixed-Point Atomics)</p>
                        <p>Advección: BFECC (High-Fidelity)</p>
                        <p>Layout: Structure of Arrays (SoA)</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default FluidSimulationWebGPU;
