import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, RotateCcw } from "lucide-react";

export const AlgebraicCyclesVisualization = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isPlaying, setIsPlaying] = useState(true);
    const [dimension, setDimension] = useState(2);
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
        let time = 0;

        const animate = () => {
            if (!isPlaying) {
                animationRef.current = requestAnimationFrame(animate);
                return;
            }

            ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            time += 0.01;

            // Draw complex algebraic surface
            const points: [number, number][] = [];
            const resolution = 50;

            for (let i = 0; i < resolution; i++) {
                const theta = (i / resolution) * Math.PI * 2;

                // Parametric surface with dimension parameter
                const r = 80 + 30 * Math.sin(dimension * theta + time);
                const x = centerX + r * Math.cos(theta);
                const y = centerY + r * Math.sin(theta) + 20 * Math.sin(time * 2);

                points.push([x, y]);
            }

            // Draw surface mesh
            ctx.strokeStyle = 'rgba(100, 150, 255, 0.3)';
            ctx.lineWidth = 1;
            for (let i = 0; i < points.length; i++) {
                const [x1, y1] = points[i];
                const [x2, y2] = points[(i + 1) % points.length];

                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.stroke();
            }

            // Draw algebraic cycles (highlighted curves)
            for (let cycle = 0; cycle < dimension; cycle++) {
                ctx.strokeStyle = `hsl(${(cycle * 120 + time * 50) % 360}, 70%, 60%)`;
                ctx.lineWidth = 3;
                ctx.beginPath();

                const offset = (cycle / dimension) * Math.PI * 2;

                for (let i = 0; i <= resolution; i++) {
                    const theta = (i / resolution) * Math.PI * 2 + offset;
                    const r = 80 + 30 * Math.sin(dimension * theta + time);
                    const x = centerX + r * Math.cos(theta);
                    const y = centerY + r * Math.sin(theta) + 20 * Math.sin(time * 2);

                    if (i === 0) {
                        ctx.moveTo(x, y);
                    } else {
                        ctx.lineTo(x, y);
                    }
                }
                ctx.closePath();
                ctx.stroke();

                // Draw glowing points on cycles
                for (let i = 0; i < 5; i++) {
                    const theta = ((i / 5) * Math.PI * 2 + time + offset) % (Math.PI * 2);
                    const r = 80 + 30 * Math.sin(dimension * theta + time);
                    const x = centerX + r * Math.cos(theta);
                    const y = centerY + r * Math.sin(theta) + 20 * Math.sin(time * 2);

                    const gradient = ctx.createRadialGradient(x, y, 0, x, y, 8);
                    gradient.addColorStop(0, `hsl(${(cycle * 120 + time * 50) % 360}, 70%, 70%)`);
                    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

                    ctx.fillStyle = gradient;
                    ctx.beginPath();
                    ctx.arc(x, y, 8, 0, Math.PI * 2);
                    ctx.fill();
                }
            }

            // Draw dimension indicator
            ctx.fillStyle = '#fff';
            ctx.font = '14px monospace';
            ctx.textAlign = 'left';
            ctx.fillText(`Dimensión: ${dimension}`, 10, 30);
            ctx.fillText(`Ciclos algebraicos: ${dimension}`, 10, 50);

            // Info box
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(10, canvas.height - 80, 300, 70);
            ctx.fillStyle = '#aaa';
            ctx.font = '12px sans-serif';
            ctx.fillText('Superficie algebraica compleja', 20, canvas.height - 60);
            ctx.fillText('Ciclos = subespacios algebraicos', 20, canvas.height - 40);
            ctx.fillText('Conjetura: relación con cohomología', 20, canvas.height - 20);

            animationRef.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [isPlaying, dimension]);

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

                <Button variant="outline" size="sm" onClick={() => setDimension(2)}>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reiniciar
                </Button>

                <div className="flex items-center gap-2 flex-1 min-w-[250px]">
                    <span className="text-sm text-muted-foreground whitespace-nowrap">Dimensión:</span>
                    <Slider
                        value={[dimension]}
                        onValueChange={(v) => setDimension(v[0])}
                        min={1}
                        max={6}
                        step={1}
                        className="flex-1"
                    />
                    <span className="text-sm font-mono w-8 text-right">{dimension}</span>
                </div>
            </div>

            <p className="text-sm text-muted-foreground">
                Visualización simplificada de una superficie algebraica compleja y sus ciclos algebraicos.
                La <strong>Conjetura de Hodge</strong> propone que ciertos ciclos topológicos en variedades
                algebraicas complejas son combinaciones de ciclos algebraicos. Los colores representan
                diferentes ciclos de dimensión k en la variedad.
            </p>
        </div>
    );
};
