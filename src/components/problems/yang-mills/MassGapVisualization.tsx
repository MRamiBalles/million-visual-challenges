import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause } from "lucide-react";

export const MassGapVisualization = () => {
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

        const padding = 60;
        const graphHeight = canvas.height - padding * 2;
        const graphWidth = canvas.width - padding * 2;

        let time = 0;

        const animate = () => {
            if (!isPlaying) {
                animationRef.current = requestAnimationFrame(animate);
                return;
            }

            ctx.fillStyle = "#000";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            time += 0.02;

            // Energy levels
            const vacuumLevel = padding + graphHeight;
            const massGap = 100; // Gap in pixels
            const firstExcited = vacuumLevel - massGap;

            // Draw axis
            ctx.strokeStyle = '#666';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(padding, padding);
            ctx.lineTo(padding, canvas.height - padding);
            ctx.lineTo(canvas.width - padding, canvas.height - padding);
            ctx.stroke();

            // Y-axis label
            ctx.fillStyle = '#fff';
            ctx.font = '14px sans-serif';
            ctx.save();
            ctx.translate(20, canvas.height / 2);
            ctx.rotate(-Math.PI / 2);
            ctx.textAlign = 'center';
            ctx.fillText('Energía', 0, 0);
            ctx.restore();

            // Ground state (vacuum)
            ctx.strokeStyle = '#44ff44';
            ctx.lineWidth = 3;
            ctx.setLineDash([]);
            ctx.beginPath();
            ctx.moveTo(padding, vacuumLevel);
            ctx.lineTo(canvas.width - padding, vacuumLevel);
            ctx.stroke();

            ctx.fillStyle = '#44ff44';
            ctx.font = '16px monospace';
            ctx.textAlign = 'left';
            ctx.fillText('Vacío (E = 0)', padding + 10, vacuumLevel - 10);

            // Mass gap region
            ctx.fillStyle = 'rgba(255, 100, 100, 0.2)';
            ctx.fillRect(padding, firstExcited, graphWidth, massGap);

            // Mass gap arrow and label
            ctx.strokeStyle = '#ff4444';
            ctx.fillStyle = '#ff4444';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(canvas.width - 100, vacuumLevel);
            ctx.lineTo(canvas.width - 100, firstExcited);
            ctx.stroke();

            // Arrowheads
            ctx.beginPath();
            ctx.moveTo(canvas.width - 100, firstExcited);
            ctx.lineTo(canvas.width - 105, firstExcited + 10);
            ctx.lineTo(canvas.width - 95, firstExcited + 10);
            ctx.closePath();
            ctx.fill();

            ctx.beginPath();
            ctx.moveTo(canvas.width - 100, vacuumLevel);
            ctx.lineTo(canvas.width - 105, vacuumLevel - 10);
            ctx.lineTo(canvas.width - 95, vacuumLevel - 10);
            ctx.closePath();
            ctx.fill();

            ctx.font = 'bold 14px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('Δ (mass gap)', canvas.width - 130, vacuumLevel - massGap / 2);
            ctx.font = '12px monospace';
            ctx.fillText('> 0', canvas.width - 50, vacuumLevel - massGap / 2);

            // First excited state
            ctx.strokeStyle = '#4444ff';
            ctx.lineWidth = 3;
            ctx.setLineDash([10, 5]);
            ctx.beginPath();
            ctx.moveTo(padding, firstExcited);
            ctx.lineTo(canvas.width - padding, firstExcited);
            ctx.stroke();

            ctx.fillStyle = '#4444ff';
            ctx.font = '14px monospace';
            ctx.textAlign = 'left';
            ctx.setLineDash([]);
            ctx.fillText('Primer estado excitado', padding + 10, firstExcited - 10);

            // Higher excited states
            for (let i = 1; i < 4; i++) {
                const level = firstExcited - (i * 40);
                ctx.strokeStyle = `rgba(100, 100, 255, ${1 - i * 0.2})`;
                ctx.lineWidth = 2;
                ctx.setLineDash([5, 5]);
                ctx.beginPath();
                ctx.moveTo(padding, level);
                ctx.lineTo(canvas.width - padding, level);
                ctx.stroke();
            }

            // Animated particles showing transitions
            const particles = 5;
            for (let i = 0; i < particles; i++) {
                const phase = (time + i * 2) % (Math.PI * 2);
                const x = padding + 50 + i * 60;

                if (Math.sin(phase) > 0) {
                    // Going up
                    const progress = Math.sin(phase);
                    const y = vacuumLevel - progress * massGap;

                    ctx.fillStyle = `hsla(${i * 70}, 80%, 60%, ${progress})`;
                    ctx.beginPath();
                    ctx.arc(x, y, 4, 0, Math.PI * 2);
                    ctx.fill();

                    // Trail
                    ctx.strokeStyle = `hsla(${i * 70}, 80%, 60%, ${progress * 0.3})`;
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.moveTo(x, vacuumLevel);
                    ctx.lineTo(x, y);
                    ctx.stroke();
                }
            }

            // Info text
            ctx.fillStyle = '#aaa';
            ctx.font = '12px sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText('La conjetura de Yang-Mills requiere probar que Δ > 0', padding, canvas.height - 20);

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
                Representación del espectro de energía en teoría cuántica de campos Yang-Mills.
                El <strong>mass gap (Δ)</strong> es la diferencia de energía entre el estado fundamental (vacío)
                y el primer estado excitado. La conjetura de Yang-Mills afirma que Δ {'>'} 0, es decir,
                existe una brecha mínima de energía, lo que explica por qué las partículas tienen masa.
            </p>
        </div>
    );
};
