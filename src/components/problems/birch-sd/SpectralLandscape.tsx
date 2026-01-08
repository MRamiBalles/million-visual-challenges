import { useState, useEffect, useRef, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, Zap, Radio } from "lucide-react";
import { motion } from "framer-motion";
import curvesData from "@/data/curves.json";

/**
 * SpectralLandscape: D3-style Hamiltonian Landscape Visualization
 * 
 * Visualizes the spectral sum S_N(t) = sum_{p<=N} a_p / p^(1/2+it)
 * showing how eigenvalues align at s=1 (t=0) for different ranks.
 * 
 * - Rank 0: Random walk (noise)
 * - Rank 1: Linear drift (bias)
 * - Rank 2: Parabolic structure (resonance)
 */

type CurveKey = "496a1" | "32a3" | "389a1";

const curveColors: Record<CurveKey, { primary: string; glow: string; bg: string }> = {
    "496a1": { primary: "#f59e0b", glow: "rgba(245, 158, 11, 0.4)", bg: "rgba(245, 158, 11, 0.05)" },
    "32a3": { primary: "#22c55e", glow: "rgba(34, 197, 94, 0.4)", bg: "rgba(34, 197, 94, 0.05)" },
    "389a1": { primary: "#a855f7", glow: "rgba(168, 85, 247, 0.5)", bg: "rgba(168, 85, 247, 0.08)" },
};

export const SpectralLandscape = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [selectedCurve, setSelectedCurve] = useState<CurveKey>("389a1");
    const [tValue, setTValue] = useState(0); // Imaginary part t in s = 1/2 + it
    const [nMax, setNMax] = useState(50); // Truncation limit

    const curveData = curvesData[selectedCurve];
    const apPrimes = curveData.spectral_data.ap_primes;
    const apSequence = curveData.spectral_data.ap_sequence;
    const rank = curveData.rank;

    // Compute the spectral sum S_N(t)
    const spectralSum = useMemo(() => {
        const points: { n: number; real: number; imag: number; magnitude: number; phase: number }[] = [];
        let sumReal = 0;
        let sumImag = 0;

        for (let i = 0; i < Math.min(nMax, apPrimes.length); i++) {
            const p = apPrimes[i];
            const ap = apSequence[i];

            // a_p / p^(1/2 + it) = a_p * p^(-1/2) * exp(-it * log(p))
            const pSqrt = Math.sqrt(p);
            const logP = Math.log(p);
            const angle = -tValue * logP;

            sumReal += (ap / pSqrt) * Math.cos(angle);
            sumImag += (ap / pSqrt) * Math.sin(angle);

            const magnitude = Math.sqrt(sumReal * sumReal + sumImag * sumImag);
            const phase = Math.atan2(sumImag, sumReal);

            points.push({ n: i + 1, real: sumReal, imag: sumImag, magnitude, phase });
        }
        return points;
    }, [apPrimes, apSequence, tValue, nMax]);

    // Canvas Rendering
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const width = canvas.width;
        const height = canvas.height;
        const centerX = width / 2;
        const centerY = height / 2;

        // Clear
        ctx.fillStyle = "#0a0a0f";
        ctx.fillRect(0, 0, width, height);

        // Grid
        ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
        ctx.lineWidth = 1;
        for (let i = 0; i <= 10; i++) {
            const x = (i / 10) * width;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
            const y = (i / 10) * height;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }

        // Axes
        ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, centerY);
        ctx.lineTo(width, centerY);
        ctx.moveTo(centerX, 0);
        ctx.lineTo(centerX, height);
        ctx.stroke();

        // Plot the spectral walk (Real vs Imaginary)
        const colors = curveColors[selectedCurve];
        const scale = 15;

        // Glow effect
        ctx.shadowBlur = 15;
        ctx.shadowColor = colors.glow;
        ctx.strokeStyle = colors.primary;
        ctx.lineWidth = 2;
        ctx.beginPath();

        spectralSum.forEach((pt, i) => {
            const px = centerX + pt.real * scale;
            const py = centerY - pt.imag * scale;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        });
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Draw points
        spectralSum.forEach((pt, i) => {
            const px = centerX + pt.real * scale;
            const py = centerY - pt.imag * scale;
            ctx.fillStyle = colors.primary;
            ctx.beginPath();
            ctx.arc(px, py, 3, 0, Math.PI * 2);
            ctx.fill();
        });

        // Origin marker
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(centerX, centerY, 5, 0, Math.PI * 2);
        ctx.fill();

        // Final point (resonance marker)
        if (spectralSum.length > 0) {
            const last = spectralSum[spectralSum.length - 1];
            const px = centerX + last.real * scale;
            const py = centerY - last.imag * scale;
            ctx.strokeStyle = colors.primary;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(px, py, 10, 0, Math.PI * 2);
            ctx.stroke();
        }

        // Labels
        ctx.fillStyle = "rgba(255,255,255,0.4)";
        ctx.font = "10px monospace";
        ctx.fillText("Re(S)", width - 40, centerY - 8);
        ctx.fillText("Im(S)", centerX + 8, 15);

    }, [spectralSum, selectedCurve]);

    const lastPoint = spectralSum[spectralSum.length - 1];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-gradient-to-br from-black via-zinc-950 to-black rounded-2xl border border-white/10 shadow-2xl"
        >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Activity className="w-5 h-5 text-purple-400" />
                        <h3 className="text-xl font-bold text-white uppercase tracking-tighter">
                            Paisaje Hamiltoniano UESDF <span className="text-[10px] text-purple-500 font-mono ml-2">(Whittaker 2025)</span>
                        </h3>
                    </div>
                    <p className="text-xs text-white/40">
                        Visualización del Marco Determinista Unificado Energía-Espacio. La anulación de L(1) es una transición de fase espectral.
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Canvas */}
                <div className="lg:col-span-2 relative">
                    <canvas
                        ref={canvasRef}
                        width={600}
                        height={400}
                        className="w-full h-auto rounded-xl border border-white/5 bg-black"
                    />
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                        <Badge className={`font-mono ${rank === 0 ? "bg-amber-500/20 text-amber-300" :
                            rank === 1 ? "bg-green-500/20 text-green-300" :
                                "bg-purple-500/20 text-purple-300"
                            }`}>
                            Rango {rank}
                        </Badge>
                        <Badge variant="outline" className="font-mono text-white/50 border-white/10">
                            t = {tValue.toFixed(2)}
                        </Badge>
                    </div>
                </div>

                {/* Controls & Diagnostics */}
                <div className="space-y-6">
                    {/* T Slider */}
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-white/60 uppercase tracking-wider font-bold">Parámetro Temporal (t)</span>
                            <span className="font-mono text-sm text-white">{tValue.toFixed(2)}</span>
                        </div>
                        <Slider
                            value={[tValue]}
                            onValueChange={(v) => setTValue(v[0])}
                            min={-5}
                            max={5}
                            step={0.1}
                            className="cursor-pointer"
                        />
                        <p className="text-[10px] text-white/30">
                            t=0 corresponde al punto crítico s=1. Explore cómo la suma diverge/converge.
                        </p>
                    </div>

                    {/* N Max Slider */}
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-white/60 uppercase tracking-wider font-bold">Términos (N)</span>
                            <span className="font-mono text-sm text-white">{nMax}</span>
                        </div>
                        <Slider
                            value={[nMax]}
                            onValueChange={(v) => setNMax(v[0])}
                            min={5}
                            max={100}
                            step={1}
                            className="cursor-pointer"
                        />
                    </div>

                    {/* Live Diagnostics */}
                    <div className="p-4 bg-purple-500/5 rounded-xl border border-purple-500/20 space-y-2">
                        <div className="flex items-center gap-2">
                            <Radio className="w-4 h-4 text-purple-400 animate-pulse" />
                            <span className="text-xs text-purple-300 uppercase tracking-wider font-bold">Diagnóstico en Vivo</span>
                        </div>
                        {lastPoint && (
                            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                                <div className="p-2 bg-black/30 rounded">
                                    <span className="text-white/40">|S_N|</span>
                                    <span className="block text-white font-bold">{lastPoint.magnitude.toFixed(4)}</span>
                                </div>
                                <div className="p-2 bg-black/30 rounded">
                                    <span className="text-white/40">Fase</span>
                                    <span className="block text-white font-bold">{(lastPoint.phase * 180 / Math.PI).toFixed(1)}°</span>
                                </div>
                                <div className="p-2 bg-black/30 rounded">
                                    <span className="text-white/40">Re(S)</span>
                                    <span className="block text-white font-bold">{lastPoint.real.toFixed(4)}</span>
                                </div>
                                <div className="p-2 bg-black/30 rounded">
                                    <span className="text-white/40">Im(S)</span>
                                    <span className="block text-white font-bold">{lastPoint.imag.toFixed(4)}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Rank Interpretation */}
            <div className={`mt-6 p-4 rounded-xl border ${rank === 0 ? "bg-amber-500/5 border-amber-500/20" :
                rank === 1 ? "bg-green-500/5 border-green-500/20" :
                    "bg-purple-500/5 border-purple-500/20"
                }`}>
                <h4 className={`font-bold text-sm mb-1 ${rank === 0 ? "text-amber-400" :
                    rank === 1 ? "text-green-400" :
                        "text-purple-400"
                    }`}>
                    {rank === 0 && "Interpretación UESDF: Paseo Aleatorio (Rango 0)"}
                    {rank === 1 && "Interpretación UESDF: Deriva Lineal (Rango 1)"}
                    {rank === 2 && "Interpretación UESDF: Transición de Fase / Resonancia Parabólica (Rango 2)"}
                </h4>
                <p className="text-xs text-white/60 leading-relaxed">
                    {rank === 0 && "Sin transición de fase en s=1. La trayectoria espectral no muestra sesgo direccional, comportándose como ruido estadístico."}
                    {rank === 1 && "Transición de fase simple en s=1. El sesgo lineal en la fase acumulada refleja la contribución del punto racional generador. Requiere Mapa de Abel-Jacobi p-ádico (BDP) para su construcción física."}
                    {rank === 2 && "Transición de fase crítica en s=1. La 'doble densidad' de estados genera la estructura parabólica característica del Factor 2.0. La construcción del punto requiere ciclos diagonales en variedades de Kuga-Sato."}
                </p>
            </div>
        </motion.div>
    );
};

export default SpectralLandscape;
