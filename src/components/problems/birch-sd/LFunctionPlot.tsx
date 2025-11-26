import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause } from "lucide-react";

export const LFunctionPlot = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isPlaying, setIsPlaying] = useState(true);
    const [rank, setRank] = useState(1);
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
        const scale = 40;
        let time = 0;

        const animate = () => {
            if (!isPlaying) {
                animationRef.current = requestAnimationFrame(animate);
                return;
            }

            ctx.fillStyle = "#000";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            time += 0.01;

            // Draw axes
            ctx.strokeStyle = '#444';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(50, centerY);
            ctx.lineTo(canvas.width - 20, centerY);
            ctx.stroke();

            // Y-axis
            ctx.beginPath();
            ctx.moveTo(50, 20);
            ctx.lineTo(50, canvas.height - 20);
            ctx.stroke();

            // Labels
            ctx.fillStyle = '#aaa';
            ctx.font = '12px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('Re(s)', canvas.width - 30, centerY + 20);
            ctx.textAlign = 'right';
            ctx.fillText('L(s)', 45, 30);

            // Critical line annotation
            ctx.strokeStyle = '#ff4444';
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(centerX, 20);
            ctx.lineTo(centerX, canvas.height - 20);
            ctx.stroke();
            ctx.setLineDash([]);

            ctx.fillStyle = '#ff4444';
            ctx.font = '11px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('s = 1 (crítico)', centerX, 15);

            // Draw L-function approximation
            ctx.strokeStyle = '#4488ff';
            ctx.lineWidth = 2;
            ctx.beginPath();

            let firstPoint = true;
            for (let px = 60; px < canvas.width - 30; px += 2) {
                const s = ((px - 50) / (canvas.width - 70)) * 4; // s from 0 to 4

                // Simplified L-function: has a zero at s=1 with multiplicity = rank
                let L_val;
                if (rank === 0) {
                    // No zero at s=1
                    L_val = 1 / (s + 0.5);
                } else {
                    // Zero of order 'rank' at s=1
                    L_val = Math.pow(Math.abs(s - 1), rank) / ((s + 0.5) * (s + 1));
                }

                const y = centerY - L_val * scale * 2;

                if (y >= 20 && y <= canvas.height - 20) {
                    if (firstPoint) {
                        ctx.moveTo(px, y);
                        firstPoint = false;
                    } else {
                        ctx.lineTo(px, y);
                    }
                }
            }
            ctx.stroke();

            // Highlight zero at s=1 if rank > 0
            if (rank > 0) {
                const zeroX = 50 + ((canvas.width - 70) / 4) * 1; // s=1

                for (let i = 0; i < rank; i++) {
                    const gradient = ctx.createRadialGradient(zeroX, centerY, 0, zeroX, centerY, 15 + i * 5);
                    gradient.addColorStop(0, `hsla(60, 100%, 60%, ${0.8})`);
                    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

                    ctx.fillStyle = gradient;
                    ctx.beginPath();
                    ctx.arc(zeroX, centerY, 15 + i * 5 + 5 * Math.sin(time + i), 0, Math.PI * 2);
                    ctx.fill();
                }

                ctx.fillStyle = '#fff';
                ctx.beginPath();
                ctx.arc(zeroX, centerY, 5, 0, Math.PI * 2);
                ctx.fill();
            }

            // Info panel
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.fillRect(10, canvas.height - 120, 320, 110);

            ctx.fillStyle = '#fff';
            ctx.font = 'bold 14px monospace';
            ctx.textAlign = 'left';
            ctx.fillText(`Rango analítico: ${rank}`, 20, canvas.height - 95);

            ctx.fillStyle = '#aaa';
            ctx.font = '11px sans-serif';
            ctx.fillText('La conjetura BSD predice:', 20, canvas.height - 75);
            ctx.fillText('• Orden del cero en s=1 = rango del grupo de puntos', 20, canvas.height - 55);
            ctx.fillText(`• Actual: cero de orden ${rank}`, 20, canvas.height - 35);
            ctx.fillText(`• Predicción: rango algebraico = ${rank}`, 20, canvas.height - 15);

            animationRef.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [isPlaying, rank]);

    return (
        <div className="space-y-4">
            <canvas
                ref={canvasRef}
                className="w-full h-96 bg-black rounded-lg border border-border"
            />

            <div className="flex items-center gap-4 flex-wrap">
                <Button variant="outline" size="sm" onClick={() => setIsPlaying(!isPlaying)}>
                    {isPlaying ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                    {isPlaying ? "Pausar" : "Reproducir"}
                </Button>

                <div className="flex items-center gap-2 flex-1 min-w-[250px]">
                    <span className="text-sm text-muted-foreground whitespace-nowrap">Rango:</span>
                    <Slider
                        value={[rank]}
                        onValueChange={(v) => setRank(v[0])}
                        min={0}
                        max={3}
                        step={1}
                        className="flex-1"
                    />
                    <span className="text-sm font-mono w-8 text-right">{rank}</span>
                </div>
            </div>

            <p className="text-sm text-muted-foreground">
                Gráfica simplificada de la <strong>L-function</strong> asociada a una curva elíptica.
                La conjetura BSD establece que el orden del cero de L(s) en s=1 es igual al rango
                del grupo de puntos racionales de la curva. El rango mide cuántos generadores
                independientes tiene el grupo.
            </p>
        </div>
    );
};
