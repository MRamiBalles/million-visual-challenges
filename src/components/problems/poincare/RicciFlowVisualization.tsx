import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, RotateCcw } from "lucide-react";

export const RicciFlowVisualization = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isPlaying, setIsPlaying] = useState(true);
    const [flowTime, setFlowTime] = useState(0);
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
        let animTime = 0;

        const animate = () => {
            if (!isPlaying) {
                animationRef.current = requestAnimationFrame(animate);
                return;
            }

            ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            animTime += 0.005;

            // Simulate Ricci flow on a 3-sphere
            // Flow smooths out irregularities in curvature
            const t = flowTime;
            const smoothness = 1 / (1 + t * 0.5); // Curvature becomes more uniform

            // Draw 3-sphere projection as nested circles
            const numLayers = 8;

            for (let layer = 0; layer < numLayers; layer++) {
                const layerProgress = layer / numLayers;
                const baseRadius = 40 + layerProgress * 100;

                // Apply Ricci flow: irregular shapes smooth into perfect spheres
                const irregularity = smoothness * 20 * Math.sin(layerProgress * Math.PI * 4);

                const numPoints = 60;
                const points: [number, number][] = [];

                for (let i = 0; i <= numPoints; i++) {
                    const angle = (i / numPoints) * Math.PI * 2;

                    // Initial irregular shape smooths to circle
                    const perturbation = irregularity * Math.sin(angle * 3 + animTime);
                    const r = baseRadius + perturbation;

                    const x = centerX + r * Math.cos(angle);
                    const y = centerY + r * Math.sin(angle);
                    points.push([x, y]);
                }

                // Draw layer
                ctx.strokeStyle = `hsla(${200 + layerProgress * 60}, 70%, ${40 + layerProgress * 30}%, ${0.6 - t * 0.05})`;
                ctx.lineWidth = 2;
                ctx.beginPath();
                points.forEach(([x, y], i) => {
                    if (i === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                });
                ctx.closePath();
                ctx.stroke();

                // Curvature indicators
                if (layer % 2 === 0) {
                    for (let i = 0; i < numPoints; i += 10) {
                        const [x, y] = points[i];
                        const curvature = Math.abs(irregularity) / 20;

                        const gradient = ctx.createRadialGradient(x, y, 0, x, y, 5);
                        const hue = curvature > 0.5 ? 0 : 120; // Red for high curvature, green for low
                        gradient.addColorStop(0, `hsla(${hue}, 80%, 60%, ${0.8})`);
                        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

                        ctx.fillStyle = gradient;
                        ctx.beginPath();
                        ctx.arc(x, y, 5, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }
            }

            // Central core (represents the manifold's "center")
            const coreGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 40);
            coreGradient.addColorStop(0, `hsla(220, 80%, 70%, ${0.8 - t * 0.1})`);
            coreGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = coreGradient;
            ctx.beginPath();
            ctx.arc(centerX, centerY, 40, 0, Math.PI * 2);
            ctx.fill();

            // Flow time indicator
            ctx.fillStyle = '#fff';
            ctx.font = '16px monospace';
            ctx.textAlign = 'left';
            ctx.fillText(`Tiempo de flujo: ${t.toFixed(2)}`, 10, 30);

            ctx.font = '12px sans-serif';
            ctx.fillStyle = t < 2 ? '#ff8844' : t < 5 ? '#ffff44' : '#44ff44';
            const status = t < 2 ? 'Curvaturas irregulares...' : t < 5 ? 'Suavizando...' : '¡Esfera perfecta!';
            ctx.fillText(status, 10, 50);

            // Smoothness metric
            const smoothnessPercent = ((1 - smoothness) * 100).toFixed(0);
            ctx.fillStyle = '#aaa';
            ctx.fillText(`Uniformidad: ${smoothnessPercent}%`, 10, 70);

            // Info panel
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.fillRect(10, canvas.height - 100, 350, 90);
            ctx.fillStyle = '#aaa';
            ctx.font = '11px sans-serif';
            ctx.fillText('El Flujo de Ricci suaviza la curvatura de la variedad', 20, canvas.height - 80);
            ctx.fillText('Puntos de color: Rojo = alta curvatura, Verde = baja', 20, canvas.height - 60);
            ctx.fillText('Perelman demostró que toda 3-esfera compacta', 20, canvas.height - 40);
            ctx.fillText('simplemente conexa se contrae a un punto bajo Ricci Flow', 20, canvas.height - 20);

            animationRef.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [isPlaying, flowTime]);

    const handleTimeChange = (value: number[]) => {
        setFlowTime(value[0]);
        setIsPlaying(false);
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

                <Button variant="outline" size="sm" onClick={() => { setFlowTime(0); setIsPlaying(true); }}>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reiniciar
                </Button>

                <div className="flex items-center gap-2 flex-1 min-w-[250px]">
                    <span className="text-sm text-muted-foreground whitespace-nowrap">Tiempo:</span>
                    <Slider
                        value={[flowTime]}
                        onValueChange={handleTimeChange}
                        min={0}
                        max={10}
                        step={0.1}
                        className="flex-1"
                    />
                    <span className="text-sm font-mono w-12 text-right">{flowTime.toFixed(1)}</span>
                </div>
            </div>

            <p className="text-sm text-muted-foreground">
                Visualización simplificada del <strong>Flujo de Ricci</strong> en una 3-esfera.
                Grigori Perelman usó el Flujo de Ricci para demostrar la Conjetura de Poincaré,
                probando que toda 3-variedad compacta simplemente conexa es homeomorfa a una 3-esfera.
                El flujo suaviza las irregularidades en la curvatura hasta que la variedad se vuelve
                perfectamente esférica.
            </p>
        </div>
    );
};
