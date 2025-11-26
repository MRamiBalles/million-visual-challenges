import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, RotateCcw } from "lucide-react";

export const EllipticCurvePlotter = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isPlaying, setIsPlaying] = useState(true);
    const [a, setA] = useState(-1);
    const [b, setB] = useState(1);
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
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(0, centerY);
            ctx.lineTo(canvas.width, centerY);
            ctx.moveTo(centerX, 0);
            ctx.lineTo(centerX, canvas.height);
            ctx.stroke();

            // Grid
            ctx.strokeStyle = '#222';
            for (let i = -10; i <= 10; i++) {
                ctx.beginPath();
                ctx.moveTo(centerX + i * scale, 0);
                ctx.lineTo(centerX + i * scale, canvas.height);
                ctx.stroke();

                ctx.beginPath();
                ctx.moveTo(0, centerY + i * scale);
                ctx.lineTo(canvas.width, centerY + i * scale);
                ctx.stroke();
            }

            // Check discriminant
            const discriminant = -16 * (4 * a * a * a + 27 * b * b);
            const isValid = discriminant !== 0;

            if (!isValid) {
                ctx.fillStyle = '#ff4444';
                ctx.font = '16px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('⚠️ Discriminante = 0 (curva singular)', centerX, 30);
            }

            // Draw elliptic curve: y² = x³ + ax + b
            ctx.strokeStyle = isValid ? '#4488ff' : '#ff4444';
            ctx.lineWidth = 2;

            // Positive y branch
            ctx.beginPath();
            let firstPoint = true;
            for (let px = -canvas.width / 2; px < canvas.width / 2; px += 2) {
                const x = px / scale;
                const y2 = x * x * x + a * x + b;

                if (y2 >= 0) {
                    const y = Math.sqrt(y2);
                    const screenX = centerX + x * scale;
                    const screenY = centerY - y * scale;

                    if (screenY >= 0 && screenY <= canvas.height) {
                        if (firstPoint) {
                            ctx.moveTo(screenX, screenY);
                            firstPoint = false;
                        } else {
                            ctx.lineTo(screenX, screenY);
                        }
                    }
                } else {
                    firstPoint = true;
                }
            }
            ctx.stroke();

            // Negative y branch
            ctx.beginPath();
            firstPoint = true;
            for (let px = -canvas.width / 2; px < canvas.width / 2; px += 2) {
                const x = px / scale;
                const y2 = x * x * x + a * x + b;

                if (y2 >= 0) {
                    const y = -Math.sqrt(y2);
                    const screenX = centerX + x * scale;
                    const screenY = centerY - y * scale;

                    if (screenY >= 0 && screenY <= canvas.height) {
                        if (firstPoint) {
                            ctx.moveTo(screenX, screenY);
                            firstPoint = false;
                        } else {
                            ctx.lineTo(screenX, screenY);
                        }
                    }
                } else {
                    firstPoint = true;
                }
            }
            ctx.stroke();

            // Animated rational points
            if (isValid) {
                for (let i = 0; i < 3; i++) {
                    const phase = time + i * 2;
                    const x = 2 * Math.cos(phase);
                    const y2 = x * x * x + a * x + b;

                    if (y2 >= 0) {
                        const y = Math.sqrt(y2) * (i % 2 === 0 ? 1 : -1);
                        const screenX = centerX + x * scale;
                        const screenY = centerY - y * scale;

                        const gradient = ctx.createRadialGradient(screenX, screenY, 0, screenX, screenY, 10);
                        gradient.addColorStop(0, `hsl(${(i * 120 + time * 50) % 360}, 80%, 70%)`);
                        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

                        ctx.fillStyle = gradient;
                        ctx.beginPath();
                        ctx.arc(screenX, screenY, 10, 0, Math.PI * 2);
                        ctx.fill();

                        // Point marker
                        ctx.fillStyle = '#fff';
                        ctx.beginPath();
                        ctx.arc(screenX, screenY, 3, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }
            }

            // Equation display
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 16px monospace';
            ctx.textAlign = 'left';
            ctx.fillText(`y² = x³ ${a >= 0 ? '+' : ''}${a}x ${b >= 0 ? '+' : ''}${b}`, 10, 30);

            // Discriminant
            ctx.font = '12px monospace';
            const discColor = discriminant > 0 ? '#4f4' : discriminant < 0 ? '#f44' : '#ff4';
            ctx.fillStyle = discColor;
            ctx.fillText(`Δ = ${discriminant.toFixed(0)}`, 10, 50);

            // Info
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(10, canvas.height - 80, 320, 70);
            ctx.fillStyle = '#aaa';
            ctx.font = '11px sans-serif';
            ctx.fillText('Los puntos brillantes representan puntos racionales', 20, canvas.height - 60);
            ctx.fillText('Conjetura BSD: conecta puntos racionales con L-function', 20, canvas.height - 40);
            ctx.fillText(`Δ ≠ 0 para curva no singular`, 20, canvas.height - 20);

            animationRef.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [isPlaying, a, b]);

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

                <Button variant="outline" size="sm" onClick={() => { setA(-1); setB(1); }}>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reiniciar
                </Button>

                <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                    <span className="text-sm text-muted-foreground whitespace-nowrap">a:</span>
                    <Slider
                        value={[a]}
                        onValueChange={(v) => setA(v[0])}
                        min={-5}
                        max={5}
                        step={0.5}
                        className="flex-1"
                    />
                    <span className="text-sm font-mono w-12 text-right">{a.toFixed(1)}</span>
                </div>

                <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                    <span className="text-sm text-muted-foreground whitespace-nowrap">b:</span>
                    <Slider
                        value={[b]}
                        onValueChange={(v) => setB(v[0])}
                        min={-5}
                        max={5}
                        step={0.5}
                        className="flex-1"
                    />
                    <span className="text-sm font-mono w-12 text-right">{b.toFixed(1)}</span>
                </div>
            </div>

            <p className="text-sm text-muted-foreground">
                Curva elíptica en forma de Weierstrass: <strong>y² = x³ + ax + b</strong>.
                La conjetura de Birch y Swinnerton-Dyer relaciona el número de puntos racionales
                (soluciones con coordenadas racionales) con el comportamiento de la L-function asociada.
                Ajusta los parámetros <em>a</em> y <em>b</em> para explorar diferentes curvas.
            </p>
        </div>
    );
};
