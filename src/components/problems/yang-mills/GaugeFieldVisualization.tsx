import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw } from "lucide-react";

export const GaugeFieldVisualization = () => {
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

        // Quarks (3 colored particles)
        const quarks = [
            { x: centerX - 80, y: centerY, color: '#ff4444', label: 'R' }, // Red
            { x: centerX + 40, y: centerY - 70, color: '#44ff44', label: 'G' }, // Green
            { x: centerX + 40, y: centerY + 70, color: '#4444ff', label: 'B' }, // Blue
        ];

        let time = 0;

        const animate = () => {
            if (!isPlaying) {
                animationRef.current = requestAnimationFrame(animate);
                return;
            }

            // Clear with slight fade
            ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            time += 0.02;

            // Draw gluon field lines between quarks
            quarks.forEach((q1, i) => {
                quarks.forEach((q2, j) => {
                    if (i >= j) return;

                    // Oscillating gluon field
                    const strength = 0.5 + 0.5 * Math.sin(time + i + j);

                    // Draw wavy line (gluon exchange)
                    ctx.strokeStyle = `rgba(255, 255, 0, ${strength * 0.6})`;
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.moveTo(q1.x, q1.y);

                    // Create wavy path
                    const steps = 20;
                    for (let step = 0; step <= steps; step++) {
                        const t = step / steps;
                        const x = q1.x + (q2.x - q1.x) * t;
                        const y = q1.y + (q2.y - q1.y) * t;

                        // Add wave
                        const perpX = -(q2.y - q1.y);
                        const perpY = q2.x - q1.x;
                        const length = Math.sqrt(perpX * perpX + perpY * perpY);
                        const wave = Math.sin(t * Math.PI * 3 + time * 2) * 10 * Math.sin(time);

                        ctx.lineTo(
                            x + (perpX / length) * wave,
                            y + (perpY / length) * wave
                        );
                    }
                    ctx.stroke();

                    // Draw gluon particles along the line
                    for (let p = 0; p < 3; p++) {
                        const t = (p / 3 + time * 0.3) % 1;
                        const x = q1.x + (q2.x - q1.x) * t;
                        const y = q1.y + (q2.y - q1.y) * t;

                        const perpX = -(q2.y - q1.y);
                        const perpY = q2.x - q1.x;
                        const length = Math.sqrt(perpX * perpX + perpY * perpY);
                        const wave = Math.sin(t * Math.PI * 3 + time * 2) * 10 * Math.sin(time);

                        ctx.fillStyle = `hsla(${(time * 50 + p * 120) % 360}, 70%, 60%, 0.8)`;
                        ctx.beginPath();
                        ctx.arc(
                            x + (perpX / length) * wave,
                            y + (perpY / length) * wave,
                            3,
                            0,
                            Math.PI * 2
                        );
                        ctx.fill();
                    }
                });
            });

            // Draw quarks
            quarks.forEach((quark, i) => {
                // Quark glow
                const gradient = ctx.createRadialGradient(
                    quark.x, quark.y, 0,
                    quark.x, quark.y, 25
                );
                gradient.addColorStop(0, quark.color);
                gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(quark.x, quark.y, 25, 0, Math.PI * 2);
                ctx.fill();

                // Quark core
                ctx.fillStyle = quark.color;
                ctx.beginPath();
                ctx.arc(quark.x, quark.y, 8, 0, Math.PI * 2);
                ctx.fill();

                // Label
                ctx.fillStyle = '#fff';
                ctx.font = 'bold 14px monospace';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(quark.label, quark.x, quark.y);
            });

            // Draw legend
            ctx.fillStyle = '#fff';
            ctx.font = '12px sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText('Quarks con carga de color:', 10, 20);
            ctx.fillText('R (rojo), G (verde), B (azul)', 10, 35);
            ctx.fillText('Líneas onduladas = gluones', 10, canvas.height - 20);

            animationRef.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [isPlaying]);

    const handleReset = () => {
        setIsPlaying(true);
    };

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

                <Button variant="outline" size="sm" onClick={handleReset}>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reiniciar
                </Button>
            </div>

            <p className="text-sm text-muted-foreground">
                Visualización del campo de gauge SU(3) mostrando tres quarks (rojo, verde, azul)
                conectados por gluones. Los gluones son los portadores de la fuerza nuclear fuerte
                en la Cromodinámica Cuántica (QCD).
            </p>
        </div>
    );
};
