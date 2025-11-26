import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, RotateCcw } from "lucide-react";

export const ConfinementVisualization = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isPlaying, setIsPlaying] = useState(true);
    const [separation, setSeparation] = useState(50);
    const animationRef = useRef<number>();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;

        const centerY = canvas.height / 2;
        let time = 0;

        const animate = () => {
            if (!isPlaying) {
                animationRef.current = requestAnimationFrame(animate);
                return;
            }

            ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            time += 0.01;

            // Quark positions
            const quark1X = canvas.width / 2 - separation;
            const quark2X = canvas.width / 2 + separation;

            // Energy calculation (increases with separation)
            const energy = (separation / 100) * 200;

            // Draw flux tube (string between quarks)
            const tubeWidth = 5 + energy * 0.1;

            // Create gradient for flux tube
            const gradient = ctx.createLinearGradient(quark1X, centerY, quark2X, centerY);
            gradient.addColorStop(0, '#ff4444');
            gradient.addColorStop(0.5, '#ffff44');
            gradient.addColorStop(1, '#4444ff');

            // Draw tube with oscillation
            ctx.strokeStyle = gradient;
            ctx.lineWidth = tubeWidth;
            ctx.beginPath();
            for (let x = quark1X; x <= quark2X; x += 2) {
                const progress = (x - quark1X) / (quark2X - quark1X);
                const oscillation = Math.sin(progress * Math.PI * 4 + time * 3) * 8;
                ctx.lineTo(x, centerY + oscillation);
            }
            ctx.stroke();

            // Draw energy field particles
            for (let i = 0; i < 30; i++) {
                const x = quark1X + (quark2X - quark1X) * (i / 30);
                const y = centerY + Math.sin((i / 30) * Math.PI * 4 + time * 3) * 8;
                const size = 1 + Math.sin(time * 2 + i) * 0.5;

                ctx.fillStyle = `hsla(${(time * 50 + i * 12) % 360}, 80%, 70%, 0.6)`;
                ctx.beginPath();
                ctx.arc(x, y, size, 0, Math.PI * 2);
                ctx.fill();
            }

            // Draw quarks
            [quark1X, quark2X].forEach((x, i) => {
                const color = i === 0 ? '#ff4444' : '#4444ff';

                // Glow
                const glow = ctx.createRadialGradient(x, centerY, 0, x, centerY, 20);
                glow.addColorStop(0, color);
                glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
                ctx.fillStyle = glow;
                ctx.beginPath();
                ctx.arc(x, centerY, 20, 0, Math.PI * 2);
                ctx.fill();

                // Core
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.arc(x, centerY, 8, 0, Math.PI * 2);
                ctx.fill();

                // Label
                ctx.fillStyle = '#fff';
                ctx.font = 'bold 12px monospace';
                ctx.textAlign = 'center';
                ctx.fillText(i === 0 ? 'q' : 'q̄', x, centerY);
            });

            // Draw energy meter
            ctx.fillStyle = '#fff';
            ctx.font = '14px monospace';
            ctx.textAlign = 'left';
            ctx.fillText(`Energía: ${energy.toFixed(0)} GeV`, 10, 30);
            ctx.fillText(`Separación: ${(separation / 10).toFixed(1)} fm`, 10, 50);

            // Energy bar
            const barWidth = 200;
            const barHeight = 20;
            const barX = 10;
            const barY = 60;

            ctx.strokeStyle = '#666';
            ctx.strokeRect(barX, barY, barWidth, barHeight);

            const fillWidth = Math.min((energy / 200) * barWidth, barWidth);
            const barGradient = ctx.createLinearGradient(barX, barY, barX + barWidth, barY);
            barGradient.addColorStop(0, '#44ff44');
            barGradient.addColorStop(0.5, '#ffff44');
            barGradient.addColorStop(1, '#ff4444');

            ctx.fillStyle = barGradient;
            ctx.fillRect(barX, barY, fillWidth, barHeight);

            // Warning if energy is high enough to create pair
            if (separation > 80) {
                ctx.fillStyle = '#ff4444';
                ctx.font = 'bold 16px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('⚠️ Energía suficiente para crear par quark-antiquark', canvas.width / 2, canvas.height - 30);
            }

            animationRef.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [isPlaying, separation]);

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

                <Button variant="outline" size="sm" onClick={() => setSeparation(50)}>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reiniciar
                </Button>

                <div className="flex items-center gap-2 flex-1 min-w-[250px]">
                    <span className="text-sm text-muted-foreground whitespace-nowrap">Separación:</span>
                    <Slider
                        value={[separation]}
                        onValueChange={(v) => setSeparation(v[0])}
                        min={10}
                        max={150}
                        step={1}
                        className="flex-1"
                    />
                    <span className="text-sm font-mono w-16 text-right">{(separation / 10).toFixed(1)} fm</span>
                </div>
            </div>

            <p className="text-sm text-muted-foreground">
                Visualización del confinamiento de quarks. Al intentar separar un quark de su antiquark,
                la energía del campo aumenta linealmente con la distancia (tubo de flujo). Cuando la energía
                es suficiente, se crean nuevos pares quark-antiquark en lugar de separar los originales.
                <strong> Por esto nunca observamos quarks aislados.</strong>
            </p>
        </div>
    );
};
