import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause } from "lucide-react";

export const VelocityField = () => {
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

        const gridSize = 30;
        const cols = Math.floor(canvas.width / gridSize);
        const rows = Math.floor(canvas.height / gridSize);

        let time = 0;

        const animate = () => {
            if (!isPlaying) {
                animationRef.current = requestAnimationFrame(animate);
                return;
            }

            ctx.fillStyle = "#000";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            time += 0.02;

            // Draw velocity field arrows
            for (let i = 0; i < cols; i++) {
                for (let j = 0; j < rows; j++) {
                    const x = i * gridSize + gridSize / 2;
                    const y = j * gridSize + gridSize / 2;

                    // Calculate velocity at this point (flow field)
                    const vx = Math.sin(y * 0.01 + time) * 15;
                    const vy = Math.cos(x * 0.01 + time) * 15;

                    const magnitude = Math.sqrt(vx * vx + vy * vy);
                    const angle = Math.atan2(vy, vx);

                    // Color based on magnitude
                    const hue = (magnitude / 20) * 180;
                    ctx.strokeStyle = `hsl(${hue}, 70%, 60%)`;
                    ctx.fillStyle = `hsl(${hue}, 70%, 60%)`;
                    ctx.lineWidth = 1.5;

                    // Draw arrow
                    const arrowLength = magnitude;
                    const headLength = 5;

                    ctx.beginPath();
                    ctx.moveTo(x, y);
                    ctx.lineTo(x + vx, y + vy);
                    ctx.stroke();

                    // Arrow head
                    ctx.beginPath();
                    ctx.moveTo(x + vx, y + vy);
                    ctx.lineTo(
                        x + vx - headLength * Math.cos(angle - Math.PI / 6),
                        y + vy - headLength * Math.sin(angle - Math.PI / 6)
                    );
                    ctx.lineTo(
                        x + vx - headLength * Math.cos(angle + Math.PI / 6),
                        y + vy - headLength * Math.sin(angle + Math.PI / 6)
                    );
                    ctx.lineTo(x + vx, y + vy);
                    ctx.fill();
                }
            }

            // Draw legend
            ctx.fillStyle = "#fff";
            ctx.font = "12px monospace";
            ctx.fillText("Velocidad baja", 10, canvas.height - 30);
            ctx.fillStyle = "#4ecdc4";
            ctx.fillRect(120, canvas.height - 40, 30, 10);

            ctx.fillStyle = "#fff";
            ctx.fillText("Velocidad alta", 10, canvas.height - 10);
            ctx.fillStyle = "#ff6b6b";
            ctx.fillRect(120, canvas.height - 20, 30, 10);

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
            </div>

            <p className="text-sm text-muted-foreground">
                Campo vectorial de velocidades en un fluido. Cada flecha muestra la dirección y magnitud
                de la velocidad en ese punto. El color indica la intensidad del flujo.
            </p>
        </div>
    );
};
