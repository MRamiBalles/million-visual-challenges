import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, AlertOctagon, CheckCircle2, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * AIFalsifiability: Wu 2025 Causal AI Audit
 * 
 * Features:
 * 1. SHAP Heatmap: Visualizes AI attention/attribution on the Critical Line.
 * 2. Inapplicability Theorem: Logic that rejects counterexamples if they lack causal weight.
 * 3. Epistemological Warning: "Right for the wrong reasons" detector.
 */

export const AIFalsifiability = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [selectedPoint, setSelectedPoint] = useState<{ x: number, y: number } | null>(null);
    const [aiVerdict, setAiVerdict] = useState<"verifying" | "rejected" | "proven" | "inconclusive" | null>(null);
    const [shapScore, setShapScore] = useState(0);

    // Draw Heatmap
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const w = canvas.width;
        const h = canvas.height;

        // Background
        ctx.fillStyle = "#0f172a";
        ctx.fillRect(0, 0, w, h);

        // Draw Critical Line visualization (Vertical center)
        const cx = w / 2;

        // Heatmap Logic:
        // High attention on the critical line (Re(s)=0.5)
        // Wu (2025) showed AI only learns features from the critical line.

        for (let x = 0; x < w; x += 4) {
            for (let y = 0; y < h; y += 4) {
                // Dist from critical line
                const dist = Math.abs(x - cx) / (w / 2);

                // SHAP value: High near center, low elsewhere
                // Add some "Noise" to simulate learning
                const noise = Math.random() * 0.2;
                const importance = Math.max(0, 1 - dist * 4) + noise;

                if (importance > 0.1) {
                    const alpha = importance * 0.6;
                    ctx.fillStyle = `rgba(147, 51, 234, ${alpha})`; // Purple
                    ctx.fillRect(x, y, 4, 4);
                }
            }
        }

        // Draw Axis
        ctx.strokeStyle = "#fff";
        ctx.setLineDash([5, 5]);
        ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, h); ctx.stroke();
        ctx.setLineDash([]);

        // Labels
        ctx.fillStyle = "#fff";
        ctx.font = "10px monospace";
        ctx.fillText("Re(s) = 0.5", cx + 5, 20);

        // Click Marker
        if (selectedPoint) {
            ctx.strokeStyle = "#22c55e"; // Green target
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(selectedPoint.x, selectedPoint.y, 8, 0, Math.PI * 2);
            ctx.stroke();

            // Pulse
            ctx.beginPath();
            ctx.arc(selectedPoint.x, selectedPoint.y, 12, 0, Math.PI * 2);
            ctx.strokeStyle = "rgba(34, 197, 94, 0.5)";
            ctx.stroke();
        }

    }, [selectedPoint]);

    const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        setSelectedPoint({ x, y });
        setAiVerdict("verifying");

        // Calculate Logic
        const w = rect.width;
        const cx = w / 2;
        const dist = Math.abs(x - cx) / (w / 2); // 0 to 1

        // Wu's Theorem applied:
        // 1. Is it a Zero? (Simulation: Only if exactly on line... strictly we verify if Z(s)=0)
        // 2. Is there Causal Signal? (SHAP score)

        const causalWeight = Math.max(0, 1 - dist * 3); // Simulated SHAP score
        setShapScore(causalWeight);

        setTimeout(() => {
            if (causalWeight < 0.3) {
                // Low SHAP -> Inconclusive / Inapplicable
                setAiVerdict("inconclusive");
            } else {
                // High SHAP -> AI is confident
                // Since user clicks are random, it's likely NOT a zero unless perfectly lucky
                setAiVerdict("rejected");
            }
        }, 800);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative rounded-xl overflow-hidden border border-purple-500/20 bg-black cursor-crosshair group">
                <canvas
                    ref={canvasRef}
                    width={400}
                    height={300}
                    className="w-full h-full opacity-90"
                    onClick={handleCanvasClick}
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="bg-black/80 text-xs text-white px-2 py-1 rounded border border-white/10">
                        Clic para proponer contraejemplo
                    </span>
                </div>
            </div>

            <div className="space-y-6">
                <Card className="p-4 bg-purple-900/10 border-purple-500/20">
                    <h3 className="text-sm font-bold text-purple-300 mb-2 flex items-center gap-2">
                        <Brain className="w-4 h-4" />
                        AI Causal Reasoner (Wu 2025)
                    </h3>
                    <p className="text-xs text-purple-200/60 mb-4">
                        Este modelo no solo clasifica, sino que atribuye "Culpabilidad" a las variables de entrada usando valores SHAP.
                    </p>

                    <div className="space-y-2">
                        <div className="flex justify-between text-xs text-white/40">
                            <span>Atribución Causal (SHAP)</span>
                            <span>{shapScore.toFixed(2)}</span>
                        </div>
                        <div className="h-2 bg-black rounded overflow-hidden">
                            <motion.div
                                className="h-full bg-gradient-to-r from-purple-900 via-purple-500 to-green-400"
                                initial={{ width: 0 }}
                                animate={{ width: `${shapScore * 100}%` }}
                            />
                        </div>
                    </div>
                </Card>

                <AnimatePresence mode="wait">
                    {aiVerdict === "verifying" && (
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="p-4 rounded border border-white/10 bg-white/5 flex items-center gap-3"
                        >
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white"></div>
                            <span className="text-sm text-white/60">Verificando Hipótesis...</span>
                        </motion.div>
                    )}

                    {aiVerdict === "rejected" && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                            className="p-4 rounded border border-green-500/20 bg-green-500/5"
                        >
                            <h4 className="flex items-center gap-2 text-green-400 font-bold text-sm mb-1">
                                <CheckCircle2 className="w-4 h-4" />
                                Contraejemplo Rechazado
                            </h4>
                            <p className="text-xs text-green-200/60">
                                La IA confirma con alta confianza causal que este punto no es un cero de Zeta.
                            </p>
                        </motion.div>
                    )}

                    {aiVerdict === "inconclusive" && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                            className="p-4 rounded border border-amber-500/20 bg-amber-500/5"
                        >
                            <h4 className="flex items-center gap-2 text-amber-400 font-bold text-sm mb-1">
                                <AlertOctagon className="w-4 h-4" />
                                Rechazo No Concluyente
                            </h4>
                            <p className="text-xs text-amber-200/60 mb-2">
                                <strong>Teorema de Inaplicabilidad:</strong> El valor SHAP es demasiado bajo ({shapScore.toFixed(2)}).
                            </p>
                            <div className="text-[10px] bg-amber-900/20 p-2 rounded text-amber-300/50">
                                "La IA no puede rechazar este punto por las razones matemáticas correctas (falta de señal causal en la vecindad)."
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};
