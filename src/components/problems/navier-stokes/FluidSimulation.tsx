import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, RotateCcw } from "lucide-react";

export const FluidSimulation = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isPlaying, setIsPlaying] = useState(true);
    const [viscosity, setViscosity] = useState(50);
    const animationRef = useRef<number>();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Set canvas size
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;

        // Particle system for fluid visualization
        const particles: Array<{
            x: number;
            y: number;
            vx: number;
            vy: number;
            age: number;
        }> = [];

        const maxParticles = 300;
        const particleLife = 200;

        // Initialize particles
        for (let i = 0; i < maxParticles; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                age: Math.random() * particleLife,
            });
        }

        let time = 0;

        const animate = () => {
            if (!isPlaying) {
                animationRef.current = requestAnimationFrame(animate);
                return;
            }

            ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            time += 0.01;

            // Update and draw particles
            particles.forEach((p, i) => {
                // Navier-Stokes inspired flow field
                const flowX = Math.sin(p.y * 0.01 + time) * 0.5;
                const flowY = Math.cos(p.x * 0.01 + time) * 0.5;

                // Apply viscosity (damping)
                const damping = 1 - (viscosity / 100) * 0.05;
                p.vx = (p.vx + flowX) * damping;
                p.vy = (p.vy + flowY) * damping;

                // Update position
                p.x += p.vx;
                p.y += p.vy;

                // Wrap around edges
                if (p.x < 0) p.x = canvas.width;
                if (p.x > canvas.width) p.x = 0;
                if (p.y < 0) p.y = canvas.height;
                if (p.y > canvas.height) p.y = 0;

                // Age particle
                p.age++;
                if (p.age > particleLife) {
                    p.age = 0;
                    p.x = Math.random() * canvas.width;
                    p.y = Math.random() * canvas.height;
                }

                // Draw particle
                const alpha = 1 - p.age / particleLife;
                const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
                const hue = (speed * 50) % 360;

                ctx.fillStyle = `hsla(${hue}, 70%, 50%, ${alpha * 0.6})`;
                ctx.beginPath();
                ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
                ctx.fill();

                // Draw velocity trail
                ctx.strokeStyle = `hsla(${hue}, 70%, 50%, ${alpha * 0.3})`;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p.x - p.vx * 5, p.y - p.vy * 5);
                ctx.stroke();
            });

            animationRef.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [isPlaying, viscosity]);

    const handleReset = () => {
        setViscosity(50);
        setIsPlaying(true);
    };

    return (
        <div className="space-y-4">
            <canvas
                ref={canvasRef}
                className="w-full h-96 bg-black rounded-lg border border-border"
            />

            <div className="flex items-center gap-4 flex-wrap">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsPlaying(!isPlaying)}
                >
                    {isPlaying ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                    {isPlaying ? "Pausar" : "Reproducir"}
                </Button>

                <Button variant="outline" size="sm" onClick={handleReset}>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reiniciar
                </Button>

                <div className="flex  items-center gap-2 flex-1 min-w-[200px]">
                    <span className="text-sm text-muted-foreground whitespace-nowrap">Viscosidad:</span>
                    <Slider
                        value={[viscosity]}
                        onValueChange={(v) => setViscosity(v[0])}
                        min={0}
                        max={100}
                        step={1}
                        className="flex-1"
                    />
                    <span className="text-sm font-mono w-12 text-right">{viscosity}%</span>
                </div>
            </div>

            <p className="text-sm text-muted-foreground">
                Esta simulación muestra un fluido en 2D siguiendo principios de las ecuaciones de Navier-Stokes.
                Las partículas siguen un campo de flujo y la viscosidad controla la resistencia al movimiento.
            </p>
        </div>
    );
};
