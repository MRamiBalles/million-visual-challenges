import { useState, useEffect, useRef, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, TrendingUp, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import curvesData from "@/data/curves.json";

/**
 * SpectralDensity: Sato-Tate Distribution Histogram
 * 
 * Visualizes the distribution of Frobenius angles θ_p where a_p = 2√p cos(θ_p).
 * 
 * Expected Distribution (Sato-Tate):
 * - Rank 0: Perfect (2/π) sin²θ distribution
 * - Rank ≥1: Potential deviations ("bias") in the center
 */

type CurveKey = "496a1" | "32a3" | "389a1";

const curveColors: Record<CurveKey, { primary: string; bg: string }> = {
    "496a1": { primary: "#f59e0b", bg: "rgba(245, 158, 11, 0.15)" },
    "32a3": { primary: "#22c55e", bg: "rgba(34, 197, 94, 0.15)" },
    "389a1": { primary: "#a855f7", bg: "rgba(168, 85, 247, 0.2)" },
};

// Sato-Tate theoretical density: (2/π) sin²θ
const satoTateDensity = (theta: number) => (2 / Math.PI) * Math.pow(Math.sin(theta), 2);

export const SpectralDensity = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [selectedCurve, setSelectedCurve] = useState<CurveKey>("389a1");
    const [showTheoretical, setShowTheoretical] = useState(true);

    const curveData = curvesData[selectedCurve];
    const apPrimes = curveData.spectral_data.ap_primes;
    const apSequence = curveData.spectral_data.ap_sequence;
    const rank = curveData.rank;

    // Compute Frobenius angles θ_p
    const frobeniusAngles = useMemo(() => {
        const angles: number[] = [];
        for (let i = 0; i < apPrimes.length; i++) {
            const p = apPrimes[i];
            const ap = apSequence[i];
            // a_p = 2√p cos(θ_p) => θ_p = arccos(a_p / 2√p)
            const sqrtP = Math.sqrt(p);
            const cosTheta = ap / (2 * sqrtP);
            // Clamp to [-1, 1] due to numerical precision
            const clampedCos = Math.max(-1, Math.min(1, cosTheta));
            const theta = Math.acos(clampedCos);
            angles.push(theta);
        }
        return angles;
    }, [apPrimes, apSequence]);

    // Build histogram
    const numBins = 20;
    const histogram = useMemo(() => {
        const bins = new Array(numBins).fill(0);
        const binWidth = Math.PI / numBins;

        frobeniusAngles.forEach(theta => {
            const binIndex = Math.min(numBins - 1, Math.floor(theta / binWidth));
            bins[binIndex]++;
        });

        // Normalize to density
        const total = frobeniusAngles.length;
        return bins.map(count => (count / total) / binWidth);
    }, [frobeniusAngles, numBins]);

    // Compute deviation from Sato-Tate
    const deviation = useMemo(() => {
        const binWidth = Math.PI / numBins;
        let totalDeviation = 0;

        for (let i = 0; i < numBins; i++) {
            const thetaMid = (i + 0.5) * binWidth;
            const expected = satoTateDensity(thetaMid);
            const observed = histogram[i];
            totalDeviation += Math.abs(observed - expected);
        }

        return totalDeviation / numBins;
    }, [histogram, numBins]);

    // Canvas Rendering
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const width = canvas.width;
        const height = canvas.height;
        const padding = { top: 30, right: 30, bottom: 50, left: 60 };
        const plotWidth = width - padding.left - padding.right;
        const plotHeight = height - padding.top - padding.bottom;

        // Clear
        ctx.fillStyle = "#0a0a0f";
        ctx.fillRect(0, 0, width, height);

        // Grid lines
        ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
        ctx.lineWidth = 1;
        for (let i = 0; i <= 5; i++) {
            const y = padding.top + (i / 5) * plotHeight;
            ctx.beginPath();
            ctx.moveTo(padding.left, y);
            ctx.lineTo(width - padding.right, y);
            ctx.stroke();
        }

        // Theoretical Sato-Tate curve
        if (showTheoretical) {
            ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();

            const maxDensity = 2 / Math.PI; // max of sin²θ is 1, so max density is 2/π
            for (let x = 0; x <= plotWidth; x++) {
                const theta = (x / plotWidth) * Math.PI;
                const density = satoTateDensity(theta);
                const y = padding.top + plotHeight * (1 - density / (maxDensity * 1.2));
                if (x === 0) ctx.moveTo(padding.left + x, y);
                else ctx.lineTo(padding.left + x, y);
            }
            ctx.stroke();
            ctx.setLineDash([]);
        }

        // Histogram bars
        const colors = curveColors[selectedCurve];
        const binWidth = plotWidth / numBins;
        const maxDensity = 2 / Math.PI;

        histogram.forEach((density, i) => {
            const x = padding.left + i * binWidth;
            const barHeight = (density / (maxDensity * 1.2)) * plotHeight;
            const y = padding.top + plotHeight - barHeight;

            // Bar fill
            ctx.fillStyle = colors.bg;
            ctx.fillRect(x + 1, y, binWidth - 2, barHeight);

            // Bar border
            ctx.strokeStyle = colors.primary;
            ctx.lineWidth = 1;
            ctx.strokeRect(x + 1, y, binWidth - 2, barHeight);
        });

        // Axes
        ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padding.left, padding.top);
        ctx.lineTo(padding.left, height - padding.bottom);
        ctx.lineTo(width - padding.right, height - padding.bottom);
        ctx.stroke();

        // X-axis labels
        ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
        ctx.font = "10px monospace";
        ctx.textAlign = "center";
        ctx.fillText("0", padding.left, height - padding.bottom + 15);
        ctx.fillText("π/2", padding.left + plotWidth / 2, height - padding.bottom + 15);
        ctx.fillText("π", padding.left + plotWidth, height - padding.bottom + 15);

        // X-axis title
        ctx.fillText("θ (Frobenius Angle)", padding.left + plotWidth / 2, height - 10);

        // Y-axis title
        ctx.save();
        ctx.translate(15, padding.top + plotHeight / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText("Density", 0, 0);
        ctx.restore();

    }, [histogram, selectedCurve, showTheoretical]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-gradient-to-br from-black via-zinc-950 to-black rounded-2xl border border-white/10 shadow-2xl"
        >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <BarChart3 className="w-5 h-5 text-blue-400" />
                        <h3 className="text-xl font-bold text-white">Distribución Espectral de Sato-Tate</h3>
                    </div>
                    <p className="text-xs text-white/40">
                        Histograma de ángulos de Frobenius θ_p donde a_p = 2√p cos(θ_p).
                    </p>
                </div>
                <Tabs value={selectedCurve} onValueChange={(v) => setSelectedCurve(v as CurveKey)}>
                    <TabsList className="bg-black/60 border border-white/10">
                        <TabsTrigger value="496a1" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-300">
                            496a1 (R=0)
                        </TabsTrigger>
                        <TabsTrigger value="32a3" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-300">
                            32a3 (R=1)
                        </TabsTrigger>
                        <TabsTrigger value="389a1" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300">
                            389a1 (R=2)
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Main Canvas */}
                <div className="lg:col-span-3 relative">
                    <canvas
                        ref={canvasRef}
                        width={700}
                        height={350}
                        className="w-full h-auto rounded-xl border border-white/5 bg-black"
                    />
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                        <Badge className={`font-mono ${rank === 0 ? "bg-amber-500/20 text-amber-300" :
                                rank === 1 ? "bg-green-500/20 text-green-300" :
                                    "bg-purple-500/20 text-purple-300"
                            }`}>
                            Rango {rank}
                        </Badge>
                    </div>
                    {/* Legend */}
                    <div className="absolute bottom-3 right-3 flex items-center gap-4 text-[10px] font-mono">
                        <div className="flex items-center gap-1">
                            <div className="w-4 h-[2px] bg-white/30" style={{ borderStyle: "dashed" }}></div>
                            <span className="text-white/50">Sato-Tate Teórico</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: curveColors[selectedCurve].bg, border: `1px solid ${curveColors[selectedCurve].primary}` }}></div>
                            <span className="text-white/50">Observado</span>
                        </div>
                    </div>
                </div>

                {/* Diagnostics */}
                <div className="space-y-4">
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                        <span className="text-xs text-white/40 uppercase tracking-wider">Primos Analizados</span>
                        <span className="block text-2xl font-bold text-white font-mono">{apPrimes.length}</span>
                    </div>

                    <div className={`p-4 rounded-xl border ${deviation < 0.05 ? "bg-green-500/10 border-green-500/20" :
                            deviation < 0.1 ? "bg-yellow-500/10 border-yellow-500/20" :
                                "bg-red-500/10 border-red-500/20"
                        }`}>
                        <div className="flex items-center gap-2 mb-1">
                            {deviation < 0.05 ? <TrendingUp className="w-4 h-4 text-green-400" /> : <AlertTriangle className="w-4 h-4 text-yellow-400" />}
                            <span className="text-xs text-white/60 uppercase tracking-wider">Desviación ST</span>
                        </div>
                        <span className={`block text-xl font-bold font-mono ${deviation < 0.05 ? "text-green-400" :
                                deviation < 0.1 ? "text-yellow-400" :
                                    "text-red-400"
                            }`}>
                            {(deviation * 100).toFixed(2)}%
                        </span>
                        <p className="text-[10px] text-white/40 mt-1">
                            {deviation < 0.05 ? "Ajuste perfecto a Sato-Tate" :
                                deviation < 0.1 ? "Desviación moderada (sesgo de rango)" :
                                    "Desviación significativa"}
                        </p>
                    </div>

                    <button
                        onClick={() => setShowTheoretical(!showTheoretical)}
                        className={`w-full p-3 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all ${showTheoretical
                                ? "bg-blue-500/10 border-blue-500/30 text-blue-300"
                                : "bg-white/5 border-white/10 text-white/50"
                            }`}
                    >
                        {showTheoretical ? "Ocultar Teórico" : "Mostrar Teórico"}
                    </button>
                </div>
            </div>

            {/* Interpretation */}
            <div className={`mt-6 p-4 rounded-xl border ${rank === 0 ? "bg-amber-500/5 border-amber-500/20" :
                    rank === 1 ? "bg-green-500/5 border-green-500/20" :
                        "bg-purple-500/5 border-purple-500/20"
                }`}>
                <h4 className={`font-bold text-sm mb-1 ${rank === 0 ? "text-amber-400" :
                        rank === 1 ? "text-green-400" :
                            "text-purple-400"
                    }`}>
                    {rank === 0 && "Interpretación: Distribución Universalista (Rango 0)"}
                    {rank === 1 && "Interpretación: Sesgo Central Detectable (Rango 1)"}
                    {rank === 2 && "Interpretación: Bias de Transición de Fase (Rango 2)"}
                </h4>
                <p className="text-xs text-white/60 leading-relaxed">
                    {rank === 0 && "La curva sin puntos racionales infinitos sigue perfectamente la distribución de Sato-Tate équidistribuida."}
                    {rank === 1 && "El punto racional generador introduce un sesgo sutil en la distribución central, típico de modularidad."}
                    {rank === 2 && "La 'doble densidad' de estados en el centro del espectro es la manifestación estadística del Factor 2.0 detectado aritméticamente."}
                </p>
            </div>
        </motion.div>
    );
};

export default SpectralDensity;
