import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, Droplets, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
}

interface FluidSimulationFallbackProps {
    particleCount?: number;
    showWebGPUWarning?: boolean;
}

/**
 * Canvas2D Fallback Fluid Simulation
 * 
 * This component provides a degraded but functional fluid simulation
 * for browsers that don't support WebGPU (Chrome < 113, Firefox, Safari).
 * 
 * Uses simplified Euler integration instead of MLS-MPM.
 * Limited to ~1000 particles for acceptable performance.
 */
const FluidSimulationFallback: React.FC<FluidSimulationFallbackProps> = ({
    particleCount = 1000,
    showWebGPUWarning = true
}) => {
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const [isPlaying, setIsPlaying] = React.useState(true);
    const [fps, setFps] = React.useState(0);
    const particlesRef = React.useRef<Particle[]>([]);
    const animationRef = React.useRef<number>(0);

    // Initialize particles
    React.useEffect(() => {
        const particles: Particle[] = [];
        const canvas = canvasRef.current;
        if (!canvas) return;

        const centerX = canvas.width * 0.5;
        const centerY = canvas.height * 0.4;
        const spread = Math.min(canvas.width, canvas.height) * 0.2;

        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: centerX + (Math.random() - 0.5) * spread,
                y: centerY + (Math.random() - 0.5) * spread,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2
            });
        }
        particlesRef.current = particles;
    }, [particleCount]);

    // Animation loop
    React.useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let lastTime = performance.now();
        let frameCount = 0;

        const gravity = 0.1;
        const damping = 0.99;
        const bounce = 0.7;

        const simulate = () => {
            if (!isPlaying) {
                animationRef.current = requestAnimationFrame(simulate);
                return;
            }

            // Clear canvas with trail effect
            ctx.fillStyle = 'rgba(0, 5, 15, 0.15)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Update and draw particles
            const particles = particlesRef.current;
            
            for (const p of particles) {
                // Apply gravity
                p.vy += gravity;

                // Apply damping
                p.vx *= damping;
                p.vy *= damping;

                // Update position
                p.x += p.vx;
                p.y += p.vy;

                // Boundary collisions
                if (p.x < 0) { p.x = 0; p.vx *= -bounce; }
                if (p.x > canvas.width) { p.x = canvas.width; p.vx *= -bounce; }
                if (p.y < 0) { p.y = 0; p.vy *= -bounce; }
                if (p.y > canvas.height) { p.y = canvas.height; p.vy *= -bounce; }

                // Draw particle with velocity-based color
                const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
                const hue = 200 + speed * 20; // Blue to cyan based on speed
                const alpha = Math.min(0.8, 0.3 + speed * 0.1);
                
                ctx.beginPath();
                ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
                ctx.fillStyle = `hsla(${hue}, 80%, 60%, ${alpha})`;
                ctx.fill();
            }

            // FPS counter
            frameCount++;
            const now = performance.now();
            if (now - lastTime >= 1000) {
                setFps(frameCount);
                frameCount = 0;
                lastTime = now;
            }

            animationRef.current = requestAnimationFrame(simulate);
        };

        animationRef.current = requestAnimationFrame(simulate);

        return () => {
            cancelAnimationFrame(animationRef.current);
        };
    }, [isPlaying]);

    const reset = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const centerX = canvas.width * 0.5;
        const centerY = canvas.height * 0.4;
        const spread = Math.min(canvas.width, canvas.height) * 0.2;

        particlesRef.current = particlesRef.current.map(() => ({
            x: centerX + (Math.random() - 0.5) * spread,
            y: centerY + (Math.random() - 0.5) * spread,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2
        }));
    };

    const addPerturbation = () => {
        for (const p of particlesRef.current) {
            p.vx += (Math.random() - 0.5) * 10;
            p.vy += (Math.random() - 0.5) * 10;
        }
    };

    return (
        <Card className="bg-slate-900 border-slate-800 overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xl flex items-center gap-2">
                    <Droplets className="w-5 h-5 text-blue-500" />
                    Simulador de Fluidos (Canvas2D)
                </CardTitle>
                <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-500">{fps} FPS</span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border-blue-600/30"
                    >
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={addPerturbation}
                        className="text-amber-400 border-amber-600/30 hover:bg-amber-600/20"
                    >
                        Perturbar
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={reset}
                        className="text-slate-400 hover:text-white"
                    >
                        <RotateCcw className="w-4 h-4" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {showWebGPUWarning && (
                    <Alert variant="destructive" className="bg-amber-900/20 border-amber-600/30">
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                        <AlertTitle className="text-amber-400">Modo de Compatibilidad</AlertTitle>
                        <AlertDescription className="text-amber-200/70">
                            Tu navegador no soporta WebGPU. Esta simulación usa Canvas2D con física simplificada 
                            (Euler en lugar de MLS-MPM). Para la experiencia completa, usa Chrome 113+ o Edge 113+.
                        </AlertDescription>
                    </Alert>
                )}
                
                <div className="relative aspect-square w-full max-w-2xl mx-auto bg-black rounded-lg border border-slate-700 overflow-hidden">
                    <canvas
                        ref={canvasRef}
                        width={512}
                        height={512}
                        className="w-full h-full cursor-crosshair"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs font-mono text-slate-400">
                    <div className="p-2 bg-slate-800/50 rounded">
                        <p>Partículas: {particleCount.toLocaleString()}</p>
                        <p>Algoritmo: Euler Integration</p>
                    </div>
                    <div className="p-2 bg-slate-800/50 rounded">
                        <p>Renderizado: Canvas 2D</p>
                        <p className="text-amber-400">⚠️ Modo degradado</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default FluidSimulationFallback;
