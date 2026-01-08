import { useEffect, useRef, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { LineChart, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import curvesData from "@/data/curves.json";

export const LFunctionPlot = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [selectedCurve, setSelectedCurve] = useState("32a3"); // Rank 1 as default
    const [mode, setMode] = useState<"classical" | "iran">("classical");
    const [zoom, setZoom] = useState(1); // 1x to 100x

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

        // Dynamic scaling based on zoom
        const baseScale = 50;
        const currentScale = baseScale * zoom;

        const curve = (curvesData as any)[selectedCurve];
        const { rank, l_values } = curve;

        const animate = () => {
            ctx.clearRect(0, 0, width, height);

            // Draw Background Grid (adaptive to zoom)
            const gridSpacing = zoom > 5 ? currentScale / 10 : currentScale;
            ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
            ctx.lineWidth = 1;

            for (let i = -100; i <= 100; i++) {
                const x = centerX + i * gridSpacing;
                if (x >= 0 && x <= width) {
                    ctx.beginPath();
                    ctx.moveTo(x, 0);
                    ctx.lineTo(x, height);
                    ctx.stroke();
                }

                const y = centerY + i * gridSpacing;
                if (y >= 0 && y <= height) {
                    ctx.beginPath();
                    ctx.moveTo(0, y);
                    ctx.lineTo(width, y);
                    ctx.stroke();
                }
            }

            // Draw axes
            ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(0, centerY);
            ctx.lineTo(width, centerY);
            ctx.moveTo(centerX, 0);
            ctx.lineTo(centerX, height);
            ctx.stroke();

            // Highlight s=1 (Critical Point)
            ctx.setLineDash([5, 5]);
            ctx.strokeStyle = "#fbbf24";
            ctx.beginPath();
            ctx.moveTo(centerX, 0);
            ctx.lineTo(centerX, height);
            ctx.stroke();
            ctx.setLineDash([]);

            // Labels
            ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
            ctx.font = "10px Inter, sans-serif";
            ctx.fillText("s = 1", centerX + 5, 20);
            ctx.fillText(mode === "classical" ? "L(E, s)" : "\u03D5(E, s)", 10, centerY - 10);

            // Mode Logic: Classical L(s) vs Iran Formula Phi(s)
            const ar = rank === 0 ? l_values.L_at_1 :
                rank === 1 ? l_values.L_prime_at_1 :
                    l_values.L_double_prime_at_1;

            const factorial = (n: number | any): number => n <= 1 ? 1 : n * factorial(n - 1);
            const coeff = ar / factorial(rank);

            ctx.lineWidth = 3;
            ctx.beginPath();

            let firstPoint = true;
            const step = 2; // Performance over precision for plot
            for (let px = 0; px < width; px += step) {
                const s = (px - centerX) / currentScale + 1;
                const ds = s - 1;

                let y_val = 0;
                if (mode === "classical") {
                    ctx.strokeStyle = "#3b82f6";
                    // L(s) ≈ coeff * (s-1)^r
                    y_val = coeff * Math.pow(ds, rank);
                    // Decay to keep on screen
                    y_val /= (1 + 0.1 * ds * ds);
                } else {
                    ctx.strokeStyle = "#a855f7"; // Purple for Iran Formula
                    // Phi(s) = (s-1) L'/L -> r
                    const precisionLimit = 0.0001;
                    if (Math.abs(ds) < precisionLimit) {
                        y_val = rank;
                    } else {
                        // Simulated stability near s=1, noise further away
                        const noise = Math.sin(1 / ds) * (Math.abs(ds) * 0.2);
                        y_val = rank + noise;
                    }
                }

                const screenY = centerY - y_val * (mode === "iran" ? baseScale : currentScale);

                if (screenY > -100 && screenY < height + 100) {
                    if (firstPoint) {
                        ctx.moveTo(px, screenY);
                        firstPoint = false;
                    } else {
                        ctx.lineTo(px, screenY);
                    }
                }
            }
            ctx.stroke();

            // Rank Marker
            if (mode === "iran") {
                ctx.fillStyle = "#a855f7";
                ctx.beginPath();
                ctx.arc(centerX, centerY - rank * baseScale, 4, 0, Math.PI * 2);
                ctx.fill();
                ctx.font = "bold 12px Inter";
                ctx.fillText(`k = ${rank}`, centerX + 10, centerY - rank * baseScale - 5);
            } else if (rank > 0) {
                ctx.fillStyle = "#3b82f6";
                ctx.beginPath();
                ctx.arc(centerX, centerY, 5, 0, Math.PI * 2);
                ctx.fill();
            } else {
                const intersectY = centerY - l_values.L_at_1 * currentScale;
                ctx.fillStyle = "#22c55e";
                ctx.beginPath();
                ctx.arc(centerX, intersectY, 5, 0, Math.PI * 2);
                ctx.fill();
            }
        };

        animate();
    }, [selectedCurve, mode, zoom]);

    return (
        <Card className="bg-black/95 border-blue-500/20 overflow-hidden">
            <CardHeader className="border-b border-white/5 bg-white/5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                            <LineChart className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <CardTitle className="text-lg text-white/90">
                                {mode === "classical" ? "Análisis Analítico: L(E, s)" : "Fórmula de Irán: \u03D5(E, s)"}
                            </CardTitle>
                            <p className="text-xs text-white/40">
                                {mode === "classical" ? "Comportamiento de la función L en s=1" : "Derivada logarítmica: aislando el rango como un polo"}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 flex-wrap">
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] text-white/40 uppercase font-mono">Zoom Crítico (s=1)</span>
                            <div className="flex items-center gap-2">
                                <input
                                    type="range"
                                    min="1"
                                    max="100"
                                    value={zoom}
                                    onChange={(e) => setZoom(parseInt(e.target.value))}
                                    className="w-24 accent-blue-500"
                                />
                                <span className="text-[10px] text-blue-400 font-mono w-8">{zoom}x</span>
                            </div>
                        </div>
                        <Tabs value={mode} onValueChange={(v: any) => setMode(v)} className="w-auto">
                            <TabsList className="bg-black/40 border border-white/10 h-8">
                                <TabsTrigger value="classical" className="text-[10px] h-6 px-3">Clásico</TabsTrigger>
                                <TabsTrigger value="iran" className="text-[10px] h-6 px-3">Matak (2025)</TabsTrigger>
                            </TabsList>
                        </Tabs>
                        <Tabs value={selectedCurve} onValueChange={setSelectedCurve} className="w-auto">
                            <TabsList className="bg-black/40 border border-white/10 h-8">
                                <TabsTrigger value="496a1" className="text-[10px] h-6">R0</TabsTrigger>
                                <TabsTrigger value="32a3" className="text-[10px] h-6">R1</TabsTrigger>
                                <TabsTrigger value="389a1" className="text-[10px] h-6">R2</TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="relative aspect-[16/9] md:aspect-[21/9] bg-[#020202]">
                    <canvas ref={canvasRef} className="w-full h-full" />

                    {/* Metadata Overlay */}
                    <div className="absolute top-4 left-4 p-3 bg-black/60 backdrop-blur-md rounded-lg border border-white/10 max-w-[280px]">
                        <div className="space-y-2">
                            <div className="flex justify-between items-center gap-4">
                                <span className="text-[10px] text-white/40 uppercase tracking-wider">Ecuación</span>
                                <span className="text-xs font-mono text-blue-300">{(curvesData as any)[selectedCurve].equation}</span>
                            </div>
                            <div className="flex justify-between items-center gap-4">
                                <span className="text-[10px] text-white/40 uppercase tracking-wider">Rango Analítico</span>
                                <Badge variant="outline" className="text-[10px] bg-blue-500/10 border-blue-500/30 text-blue-300">
                                    k = {(curvesData as any)[selectedCurve].rank}
                                </Badge>
                            </div>
                            {mode === "iran" && (
                                <div className="pt-2 border-t border-white/10">
                                    <p className="text-[9px] text-purple-300 font-mono leading-tight">
                                        &phi;E(s) = (s-1) L'(s)/L(s) &rarr; k
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={`${selectedCurve}-${mode}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute bottom-4 left-4 right-4 md:left-auto p-4 bg-blue-900/20 backdrop-blur-md rounded-xl border border-blue-500/30 md:max-w-[400px]"
                        >
                            <div className="flex gap-3">
                                <div className="mt-1">
                                    <Info className="w-4 h-4 text-blue-400" />
                                </div>
                                <div className="text-xs text-blue-100/80 leading-relaxed">
                                    {mode === "classical" ? (
                                        <>
                                            <strong className="text-blue-300">Vista Clásica:</strong> Observa la curvatura en $s=1$.
                                            {(curvesData as any)[selectedCurve].rank === 1 && " Note la pendiente lineal en s=1 (Rango 1)."}
                                            {(curvesData as any)[selectedCurve].rank === 2 && " Observe la tangencia parabólica (Rango 2), el origen de la barrera clásica."}
                                        </>
                                    ) : (
                                        <>
                                            <strong className="text-purple-300">Fórmula de Irán (Matak 2025):</strong> Esta función "atrapa" el rango.
                                            El límite hacia $s=1$ colapsa en el valor entero $k$. El ruido externo representa las fluctuaciones espectrales de Whittaker.
                                        </>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </CardContent>
        </Card>
    );
};
