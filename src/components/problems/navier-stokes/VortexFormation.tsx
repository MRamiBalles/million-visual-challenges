import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw } from "lucide-react";

export const VortexFormation = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isPlaying, setIsPlaying] = useState(true);
    const animationRef = useRef<number>();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        // Multiple vortices
        const vortices = [
            { x: centerX - 150, y: centerY, strength: 5, rotation: 0 },
            { x: centerX + 150, y: centerY, strength: -5, rotation: 0 },
        ];

        const particles: Array<{
            x: number;
            y: number;
            trail: Array<{ x: number; y: number }>;
        }> = [];

        // Initialize particles in circle
        for (let i = 0; i < 200; i++) {
            const angle = (i / 200) * Math.PI * 2;
            const radius = 250;
            particles.push({
                x: centerX + Math.cos(angle) * radius,
                y: centerY + Math.sin(angle) * radius,
                trail: [],
            });
        }

        const animate = () => {
            if (!isPlaying) {
                animationRef.current = requestAnimationFrame(animate);
                return;
            }

            ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Update vortex rotations
            vortices.forEach((v) => {
                v.rotation += 0.02;
            });

            // Update particles
            particles.forEach((p) => {
                let totalVx = 0;
                let totalVy = 0;

                // Calculate influence from all vortices
                vortices.forEach((v) => {
                    const dx = p.x - v.x;
                    const dy = p.y - v.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist > 1) {
                        // Tangential velocity (vortex)
                        const vx = (-dy / dist) * v.strength * (200 / dist);
                        const vy = (dx / dist) * v.strength * (200 / dist);
                        totalVx += vx;
                        totalVy += vy;
                    }
                });

                // Update position
                p.x += totalVx * 0.1;
                p.y += totalVy * 0.1;

                // Keep trail
                p.trail.push({ x: p.x, y: p.y });
                if (p.trail.length > 20) {
                    p.trail.shift();
                }

                // Draw trail
                if (p.trail.length > 1) {
                    ctx.strokeStyle = "rgba(100, 200, 255, 0.3)";
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(p.trail[0].x, p.trail[0].y);
                    for (let i = 1; i < p.trail.length; i++) {
                        ctx.lineTo(p.trail[i].x, p.trail[i].y);
                    }
                    ctx.stroke();
                }

                // Draw particle
                const speed = Math.sqrt(totalVx * totalVx + totalVy * totalVy);
                const hue = Math.min(200, speed * 10);
                ctx.fillStyle = `hsl(${hue}, 70%, 60%)`;
                ctx.beginPath();
                ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
                ctx.fill();
            });

            // Draw vortex centers
            vortices.forEach((v, i) => {
                ctx.strokeStyle = v.strength > 0 ? "#ff6b6b" : "#4ecdc4";
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(v.x, v.y, 20, 0, Math.PI * 2);
                ctx.stroke();

                // Draw rotation indicator
                ctx.beginPath();
                ctx.moveTo(v.x, v.y);
                ctx.lineTo(
                    v.x + Math.cos(v.rotation) * 20,
                    v.y + Math.sin(v.rotation) * 20
                );
                ctx.stroke();

                // Label
                ctx.fillStyle = "#fff";
                ctx.font = "12px monospace";
                ctx.textAlign = "center";
                ctx.fillText(
                    v.strength > 0 ? "CCW" : "CW",
                    v.x,
                    v.y - 30
                );
            });

            animationRef.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [isPlaying]);

    return (
        <div className="space-y-4">
            <canvas
                ref={canvasRef}
                className="w-full h-96 bg-black rounded-lg border border-border"
            />

            <div className="flex items-center gap-4">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsPlaying(!isPlaying)}
                >
                    {isPlaying ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                    {isPlaying ? "Pausar" : "Reproducir"}
                </Button>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.location.reload()}
                >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reiniciar
                </Button>
            </div>

            <p className="text-sm text-muted-foreground">
                Visualización de dos vórtices contra-rotatorios. Los vórtices son estructuras fundamentales
                en fluidos turbulentos y aparecen en las ecuaciones de Navier-Stokes.
            </p>
        </div>
    );
};
