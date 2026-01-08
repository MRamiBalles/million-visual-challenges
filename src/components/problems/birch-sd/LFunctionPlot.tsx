import { useEffect, useRef, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Info } from "lucide-react";
import curvesData from "@/data/curves.json";

export const LFunctionPlot = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [selectedCurve, setSelectedCurve] = useState("32a3"); // Rank 1 as default
    const [isPlaying, setIsPlaying] = useState(true);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);

        const width = rect.width;
        const height = rect.height;
        const centerX = width / 2;
        const centerY = height / 2;
        const scale = 50;

        const curve = (curvesData as any)[selectedCurve];
        const { rank, l_values } = curve;

        const animate = () => {
            ctx.clearRect(0, 0, width, height);

            // Draw Background Grid
            ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
            ctx.lineWidth = 1;
            for (let i = -5; i <= 5; i++) {
                const x = centerX + i * scale;
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, height);
                ctx.stroke();

                const y = centerY + i * scale;
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(width, y);
                ctx.stroke();
            }

            // Draw axes
            ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(0, centerY);
            ctx.lineTo(width, centerY);
            ctx.moveTo(centerX, 0);
            ctx.lineTo(centerX, height);
            ctx.stroke();

            // Labels
            ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
            ctx.font = "12px Inter, sans-serif";
            ctx.fillText("s = 1", centerX + 5, 20);
            ctx.fillText("L(E, s)", 10, centerY - 10);

            // Highlight s=1 (Critical Point)
            ctx.setLineDash([5, 5]);
            ctx.strokeStyle = "#fbbf24";
            ctx.beginPath();
            ctx.moveTo(centerX, 0);
            ctx.lineTo(centerX, height);
            ctx.stroke();
            ctx.setLineDash([]);

            // Plot L-function approximation (Taylor expansion near s=1)
            // L(s) ≈ (a_r / r!) * (s-1)^r
            const ar = rank === 0 ? l_values.L_at_1 :
                rank === 1 ? l_values.L_prime_at_1 :
                    l_values.L_double_prime_at_1;

            const factorial = (n: number): number => n <= 1 ? 1 : n * factorial(n - 1);
            const coeff = ar / factorial(rank);

            ctx.strokeStyle = "#3b82f6";
            ctx.lineWidth = 3;
            ctx.beginPath();

            let firstPoint = true;
            for (let px = padding; px < width - padding; px += 2) {
                const s = (px - centerX) / scale + 1;
                // Higher order terms for global "feel"
                const ds = s - 1;
                let y_val = coeff * Math.pow(ds, rank);

                // Add a decay factor to keep it on screen for large s
                y_val /= (1 + 0.1 * ds * ds);

                const screenY = centerY - y_val * scale;

                if (screenY > 0 && screenY < height) {
                    if (firstPoint) {
                        ctx.moveTo(px, screenY);
                        firstPoint = false;
                    } else {
                        ctx.lineTo(px, screenY);
                    }
                }
            }
            ctx.stroke();

            // Draw rank markers
            if (rank > 0) {
                ctx.fillStyle = "#3b82f6";
                ctx.beginPath();
                ctx.arc(centerX, centerY, 5, 0, Math.PI * 2);
                ctx.fill();
                ctx.font = "bold 14px Inter";
                ctx.fillText(`Cero de orden ${rank}`, centerX + 10, centerY - 10);
            } else {
                const intersectY = centerY - l_values.L_at_1 * scale;
                ctx.fillStyle = "#22c55e";
                ctx.beginPath();
                ctx.arc(centerX, intersectY, 5, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillText(`L(1) = ${l_values.L_at_1.toFixed(3)}`, centerX + 10, intersectY - 10);
            }
        };

        const padding = 20;
        animate();
    }, [selectedCurve]);

    return (
        <Card className="bg-black/95 border-blue-500/20 overflow-hidden">
            <CardHeader className="border-b border-white/5 bg-white/5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                            <LineChart className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <CardTitle className="text-lg text-white/90">Análisis Analítico: L(E, s)</CardTitle>
                            <p className="text-xs text-white/40">Comportamiento de la función L en el punto crítico s=1</p>
                        </div>
                    </div>
                    <Tabs value={selectedCurve} onValueChange={setSelectedCurve} className="w-full md:w-auto">
                        <TabsList className="bg-black/40 border border-white/10">
                            <TabsTrigger value="496a1" className="text-xs">Rango 0</TabsTrigger>
                            <TabsTrigger value="32a3" className="text-xs">Rango 1</TabsTrigger>
                            <TabsTrigger value="389a1" className="text-xs">Rango 2</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="relative aspect-[16/9] md:aspect-[21/9] bg-[#020202]">
                    <canvas ref={canvasRef} className="w-full h-full" />

                    <div className="absolute top-4 left-4 p-3 bg-black/60 backdrop-blur-md rounded-lg border border-white/10 max-w-[250px]">
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] text-white/40 uppercase tracking-wider">Ecuación</span>
                                <span className="text-xs font-mono text-blue-300">{(curvesData as any)[selectedCurve].equation}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] text-white/40 uppercase tracking-wider">Rango Real</span>
                                <Badge variant="outline" className="text-[10px] bg-blue-500/10 border-blue-500/30 text-blue-300">
                                    {(curvesData as any)[selectedCurve].rank}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={selectedCurve}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="absolute bottom-4 right-4 p-4 bg-blue-900/20 backdrop-blur-md rounded-xl border border-blue-500/30 max-w-[300px]"
                        >
                            <div className="flex gap-3">
                                <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-1" />
                                <div className="text-xs text-blue-100/80 leading-relaxed">
                                    <strong className="text-blue-300">Interpretación:</strong> {(curvesData as any)[selectedCurve].rank === 0
                                        ? "L(1) ≠ 0. La curva no tiene puntos de orden infinito (rango 0)."
                                        : `L(s) tiene un cero de orden ${(curvesData as any)[selectedCurve].rank} en s=1, prediciendo un rango de ${(curvesData as any)[selectedCurve].rank}.`}
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </CardContent>
        </Card>
    );
};
