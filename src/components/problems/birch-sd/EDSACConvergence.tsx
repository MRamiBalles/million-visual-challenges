import { useEffect, useRef, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HelpCircle, Play, Pause, RotateCcw, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import curvesData from "@/data/curves.json";

interface CurvePoint {
    x: number; // log(log(p))
    y: number; // log(cumulative_product)
    p: number; // prime
}

interface Dataset {
    label: string;
    rank: number;
    points: CurvePoint[];
    color: string;
}

export const EDSACConvergence = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isPlaying, setIsPlaying] = useState(true);
    const [progress, setProgress] = useState(0);
    const [datasets, setDatasets] = useState<Dataset[]>([]);
    const [hoverPoint, setHoverPoint] = useState<{ label: string; p: number; y: number } | null>(null);

    // Initial data processing
    useEffect(() => {
        const colors = {
            "496a1": "#22c55e", // Rank 0 - Green
            "32a3": "#3b82f6",   // Rank 1 - Blue
            "389a1": "#ef4444",  // Rank 2 - Red
        };

        const processed = Object.entries(curvesData).map(([label, data]) => {
            const spectral = (data as any).spectral_data;
            if (!spectral) return null;

            let product = 1;
            const points: CurvePoint[] = [];

            spectral.ap_primes.forEach((p: number, i: number) => {
                const ap = spectral.ap_sequence[i];
                const np = p + 1 - ap;
                product *= (np / p);

                // x = log(log(p)), y = log(product)
                // log(log(p)) becomes very small for small p, so we offset or start from p > 2
                if (p > 2) {
                    points.push({
                        x: Math.log(Math.log(p)),
                        y: Math.log(product),
                        p: p
                    });
                }
            });

            return {
                label,
                rank: data.rank,
                points,
                color: colors[label as keyof typeof colors] || "#888"
            };
        }).filter(d => d !== null) as Dataset[];

        setDatasets(processed);
    }, []);

    // Animation and Drawing
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || datasets.length === 0) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);

        const width = rect.width;
        const height = rect.height;
        const padding = 50;

        const render = () => {
            ctx.clearRect(0, 0, width, height);

            // Draw Background Grid (Log-Log style)
            ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
            ctx.lineWidth = 1;

            // X-axis (log(log(p)))
            const minX = Math.min(...datasets.flatMap(d => d.points.map(p => p.x)));
            const maxX = Math.max(...datasets.flatMap(d => d.points.map(p => p.x)));
            const minY = Math.min(...datasets.flatMap(d => d.points.map(p => p.y)));
            const maxY = Math.max(...datasets.flatMap(d => d.points.map(p => p.y)));

            const scaleX = (x: number) => padding + (x - minX) / (maxX - minX) * (width - 2 * padding);
            const scaleY = (y: number) => height - padding - (y - minY) / (maxY - minY) * (height - 2 * padding);

            // Draw Axes
            ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
            ctx.beginPath();
            ctx.moveTo(padding, height - padding);
            ctx.lineTo(width - padding, height - padding);
            ctx.moveTo(padding, padding);
            ctx.lineTo(padding, height - padding);
            ctx.stroke();

            // Labels
            ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
            ctx.font = "10px Inter, sans-serif";
            ctx.fillText("log(log(X))", width - padding - 20, height - padding + 20);
            ctx.save();
            ctx.translate(padding - 35, padding + 40);
            ctx.rotate(-Math.PI / 2);
            ctx.fillText("log( Π Np/p )", 0, 0);
            ctx.restore();

            // Draw Datasets
            datasets.forEach((dataset) => {
                ctx.strokeStyle = dataset.color;
                ctx.lineWidth = 2;
                ctx.beginPath();

                const limit = Math.floor(progress * dataset.points.length);
                dataset.points.slice(0, limit).forEach((pt, i) => {
                    const x = scaleX(pt.x);
                    const y = scaleY(pt.y);
                    if (i === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                });
                ctx.stroke();

                // Draw end point "glow"
                if (limit > 0) {
                    const lastPt = dataset.points[limit - 1];
                    const x = scaleX(lastPt.x);
                    const y = scaleY(lastPt.y);

                    ctx.fillStyle = dataset.color;
                    ctx.beginPath();
                    ctx.arc(x, y, 3, 0, Math.PI * 2);
                    ctx.fill();

                    ctx.shadowBlur = 10;
                    ctx.shadowColor = dataset.color;
                    ctx.stroke();
                    ctx.shadowBlur = 0;
                }

                // Reference Slope Line
                // log(prod) = r * log(log(x)) + C
                // We show the "ideal" slope for comparison
                ctx.setLineDash([5, 5]);
                ctx.strokeStyle = `${dataset.color}44`;
                ctx.beginPath();
                const startX = dataset.points[0].x;
                const endX = dataset.points[dataset.points.length - 1].x;
                const startY = dataset.points[0].y;
                // y = r * x + b => b = startY - r * startX
                const b = startY - dataset.rank * startX;
                const finalY = dataset.rank * endX + b;

                ctx.moveTo(scaleX(startX), scaleY(startY));
                ctx.lineTo(scaleX(endX), scaleY(finalY));
                ctx.stroke();
                ctx.setLineDash([]);
            });
        };

        render();

        let animation: number;
        const update = () => {
            if (isPlaying && progress < 1) {
                setProgress(prev => Math.min(1, prev + 0.005));
            }
            render();
            animation = requestAnimationFrame(update);
        };

        animation = requestAnimationFrame(update);
        return () => cancelAnimationFrame(animation);
    }, [datasets, isPlaying, progress]);

    return (
        <Card className="bg-black/95 border-primary/20 overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent pointer-events-none" />

            <CardHeader className="border-b border-white/5 bg-white/5 backdrop-blur-md">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-xl flex items-center gap-2 text-white/90">
                            <Activity className="w-5 h-5 text-green-400" />
                            Convergencia EDSAC (1960s)
                        </CardTitle>
                        <p className="text-xs text-white/40 font-mono mt-1">
                            Modelo Histórico: Π (Nₚ/p) ~ C · (log X)ʳ
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setIsPlaying(!isPlaying)}
                            className="p-2 hover:bg-white/10 rounded-full transition-colors"
                        >
                            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </button>
                        <button
                            onClick={() => setProgress(0)}
                            className="p-2 hover:bg-white/10 rounded-full transition-colors"
                        >
                            <RotateCcw className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-0">
                <div className="relative aspect-[16/9] md:aspect-[21/9] w-full bg-[#050505]">
                    {/* Retro Grid Background */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
                        <div className="w-full h-full" style={{
                            backgroundImage: 'radial-gradient(circle, #333 1px, transparent 1px)',
                            backgroundSize: '30px 30px'
                        }} />
                    </div>

                    <canvas
                        ref={canvasRef}
                        className="w-full h-full relative z-10"
                    />

                    {/* Oscilloscope Glow Effect */}
                    <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(0,255,0,0.05)]" />
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-white/5 bg-white/5">
                    {datasets.map((d) => (
                        <div key={d.label} className="space-y-2 p-3 rounded-lg border border-white/5 bg-white/5">
                            <div className="flex items-center justify-between">
                                <span className="font-mono text-xs text-white/60">Curva {d.label}</span>
                                <Badge variant="outline" style={{ borderColor: `${d.color}44`, color: d.color }}>
                                    Rango {d.rank}
                                </Badge>
                            </div>
                            <div className="text-[10px] text-white/40 leading-relaxed">
                                {d.rank === 0 && "Pendiente ≈ 0: No presenta acumulación asintótica de puntos."}
                                {d.rank === 1 && "Pendiente ≈ 1: Crecimiento logarítmico coherente con Heegner."}
                                {d.rank === 2 && "Pendiente ≈ 2: Crecimiento cuadrático. Requiere mayor N para estabilizar."}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="px-6 py-4 bg-yellow-500/5 border-t border-yellow-500/10 flex gap-3">
                    <HelpCircle className="w-4 h-4 text-yellow-400 mt-1 flex-shrink-0" />
                    <div className="text-xs text-yellow-200/70">
                        <span className="font-bold text-yellow-400">Insight Científico:</span> Al graficar en escala log-log de log(X), la pendiente de la línea punteada (referencia teórica) coincide con el rango. Nota el "ruido" inicial en las curvas reales, que es lo que dificultó a Birch y Swinnerton-Dyer identificar el rango analítico exacto inicialmente.
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
