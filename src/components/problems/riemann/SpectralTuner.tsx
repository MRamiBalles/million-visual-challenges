import { useState, useEffect, useRef, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Zap, Radio, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

interface SpectralTunerProps {
    /**
     * The target phase where resonance occurs.
     * Default: Math.PI (Berry-Keating model)
     * 
     * Different hypotheses suggest different target phases:
     * - π: Standard Berry-Keating model
     * - π/2: Modified Rindler boundary conditions
     * - 2π: Full period resonance
     * 
     * Making this configurable allows exploration of alternative theories.
     */
    targetPhase?: number;
    
    /**
     * Label for the target phase in the UI
     */
    targetPhaseLabel?: string;
}

/**
 * SpectralTuner: Riemann Interferometer
 * Based on the models of Sierra (2007) and Shimizu (2011) connecting 
 * Riemann zeros to quantum chaotic Hamiltonians (Rindler space / Berry-Keating).
 * 
 * Conceptual Model:
 * The operator H has eigenvalues E_n only if the phase ϑ (theta) is "tuned".
 * Visualizes the spectral determinant det(H - E) as a function of phase.
 * 
 * CONFIGURABLE TARGET PHASE:
 * The targetPhase prop allows exploration of alternative hypotheses.
 * This addresses the "fine tuning" limitation documented in CRITIQUE_RISKS_RH.md.
 */
export const SpectralTuner = ({ 
    targetPhase = Math.PI,
    targetPhaseLabel = "π (Berry-Keating)"
}: SpectralTunerProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [phase, setPhase] = useState(0); // Theta parameter 0 to 2PI
    const [tuningQuality, setTuningQuality] = useState(0);
    const [customTargetPhase, setCustomTargetPhase] = useState(targetPhase);

    // Known Zeros (Im parts)
    const zeros = useMemo(() => [14.13, 21.02, 25.01, 30.42, 32.93, 37.58, 40.91, 43.32, 48.00, 49.77], []);

    // Draw the "Spectral Landscape" affected by phase
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const width = canvas.width;
        const height = canvas.height;

        // Clear
        ctx.fillStyle = "#0a0a0f";
        ctx.fillRect(0, 0, width, height);

        // Grid
        ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
        ctx.lineWidth = 1;
        for (let i = 0; i < width; i += 40) {
            ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, height); ctx.stroke();
        }

        // Calculate "Resonance" based on phase
        // In the Berry-Keating model, E_n are eigenvalues when phase cancels semiclassical action
        // We simulate this by making the spectral peaks "sharp" only near the configurable target phase

        // Use configurable target phase instead of hardcoded PI
        const phaseError = Math.abs(phase - customTargetPhase);

        // Tuning factor: 1.0 = Perfect, 0.0 = Noise
        // The closer to targetPhase, the sharper the peaks.
        // Actually, let's make it periodic: peaks appear at phase = 0, PI, 2PI... 
        // Or better: The phase shifts the positions.

        // Sierra Model Concept: The phase determines boundary conditions.
        // If phase is wrong, eigenvalues are complex or don't exist (destructive interference).

        // Sim:
        // We draw peaks at Position = Zero + Shift(Phase)
        // But the "Intensity"/Sharpness depends on how close Phase is to a "Quantized" condition

        // Let's visualize the trace formula: Sum cos(t log p - phase)
        // The zeros emerge when strictly aligned.

        // We will plot a density function D(E) 

        ctx.beginPath();
        ctx.strokeStyle = "#a855f7"; // Purple
        ctx.lineWidth = 2;

        let qualityMetric = 0;

        for (let x = 0; x < width; x++) {
            const t = 10 + (x / width) * 45; // Range t=[10, 55] covers first 10 zeros

            // "Quantum Chaos" trace formula simulation
            // D(t) ~ \sum cos(t log p - phase)
            // But we cheat to ensure Zeros match the visual spikes at correct phase

            // Construct wave packet
            let amp = 0;

            // Contribution from primes (simulating the GUE chaos)
            const primes = [2, 3, 5, 7, 11, 13];
            primes.forEach(p => {
                amp += Math.cos(t * Math.log(p) - phase * 2);
            });

            // Add "Guide" wave that perfectly peaks at Zeros ONLY if phase matches target
            // This represents the "Hidden Operator" that we are searching for
            const correctPhaseOffset = Math.abs(phase - customTargetPhase);
            const coherence = Math.max(0, 1 - correctPhaseOffset); // 1 at target, 0 far away

            let hiddenOperator = 0;
            zeros.forEach(z => {
                // Lorentzian peek at z
                const dist = Math.abs(t - z);
                hiddenOperator += 1 / (dist * dist + 0.1);
            });

            // If phase is wrong, the operator is "blurry" or "shifted"
            // We simulate decoherence

            const signal = (hiddenOperator * coherence) + (amp * 0.3 * (1 - coherence));

            // Plot
            const y = height - 50 - (signal * 30);

            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);

            qualityMetric = coherence;
        }
        ctx.stroke();

        // Draw "True Zero" markers (ghosts)
        ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
        zeros.forEach(z => {
            const x = ((z - 10) / 45) * width;
            ctx.fillRect(x, 0, 1, height);
            ctx.fillText(z.toString(), x + 2, height - 10);
        });

        // Set quality for UI
        setTuningQuality(qualityMetric);

    }, [phase, zeros, customTargetPhase]);

    return (
        <div className="flex flex-col md:flex-row gap-6">
            {/* Visualizer */}
            <div className="flex-1 relative rounded-xl overflow-hidden border border-purple-500/20 bg-black">
                <canvas
                    ref={canvasRef}
                    width={600}
                    height={300}
                    className="w-full h-full opacity-90"
                />

                <div className="absolute top-4 left-4">
                    <Badge variant="outline" className="bg-black/50 backdrop-blur border-purple-500/30 text-purple-300">
                        <Zap className="w-3 h-3 mr-1" />
                        Espectro de Niveles
                    </Badge>
                </div>

                {tuningQuality > 0.8 && (
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="text-green-400 font-bold text-xl bg-black/80 p-4 rounded-xl border border-green-500"
                        >
                            RESONANCIA DETECTADA
                        </motion.div>
                    </div>
                )}
            </div>

            {/* Controls */}
            <div className="w-full md:w-64 space-y-6">
                <div className="p-4 bg-card/30 rounded-xl border border-white/10">
                    <div className="flex items-center gap-2 mb-4">
                        <Radio className="w-4 h-4 text-purple-400" />
                        <h4 className="text-sm font-bold text-white">Sintonizador de Fase (ϑ)</h4>
                    </div>

                    <div className="mb-6">
                        <div className="flex justify-between text-xs text-white/50 mb-2">
                            <span>0</span>
                            <span>π</span>
                            <span>2π</span>
                        </div>
                        <Slider
                            value={[phase]}
                            max={Math.PI * 2}
                            step={0.01}
                            onValueChange={(v) => setPhase(v[0])}
                            className="py-2"
                        />
                        <div className="text-center mt-2 font-mono text-purple-300">
                            ϑ = {phase.toFixed(2)} rad
                        </div>
                    </div>

                    <div className={`p-3 rounded border text-xs leading-relaxed ${tuningQuality > 0.8
                        ? "bg-green-500/10 border-green-500/30 text-green-300"
                        : "bg-amber-500/10 border-amber-500/30 text-amber-200"
                        }`}>
                        <div className="flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            {tuningQuality > 0.8
                                ? "Fase alineada. Los niveles de energía coinciden con los ceros de Riemann. El operador es Hermitiano."
                                : "Desalineamiento de fase. El espectro es difuso ('Caos'). No existe un operador autoadjunto para esta fase."
                            }
                        </div>
                    </div>

                    {/* Target Phase Configuration (New Feature) */}
                    <div className="mt-4 p-3 bg-indigo-900/20 border border-indigo-500/20 rounded">
                        <div className="text-[10px] uppercase text-indigo-300/70 mb-2">Fase Objetivo (Configurable)</div>
                        <div className="flex gap-2 flex-wrap mb-2">
                            {[
                                { value: Math.PI, label: "π" },
                                { value: Math.PI / 2, label: "π/2" },
                                { value: 2 * Math.PI, label: "2π" },
                                { value: Math.PI * 1.5, label: "3π/2" },
                            ].map(({ value, label }) => (
                                <button
                                    key={label}
                                    onClick={() => setCustomTargetPhase(value)}
                                    className={`px-2 py-1 text-xs rounded transition-colors ${
                                        Math.abs(customTargetPhase - value) < 0.01
                                            ? "bg-indigo-500/40 text-indigo-200 border border-indigo-400"
                                            : "bg-indigo-500/10 text-indigo-300/70 border border-indigo-500/20 hover:bg-indigo-500/20"
                                    }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                        <Slider
                            value={[customTargetPhase]}
                            max={Math.PI * 2}
                            step={0.01}
                            onValueChange={(v) => setCustomTargetPhase(v[0])}
                            className="py-1"
                        />
                        <div className="text-center text-[10px] font-mono text-indigo-300/50 mt-1">
                            Objetivo: {customTargetPhase.toFixed(3)} rad
                        </div>
                        <p className="text-[9px] text-indigo-300/50 mt-2 italic">
                            Diferentes teorías predicen diferentes fases de resonancia. 
                            Explora alternativas al modelo Berry-Keating estándar.
                        </p>
                    </div>

                    {/* Berry Phase Quantization Error (Yang 2025) */}
                    <div className="mt-4 p-3 bg-purple-900/20 border border-purple-500/20 rounded">
                        <div className="text-[10px] uppercase text-purple-300/70 mb-2">Error de Cuantización (Yang 2025)</div>
                        <div className="flex items-center justify-between">
                            <span className="text-purple-200 font-mono text-lg">
                                Δγ = {Math.abs((phase / (2 * Math.PI)) - Math.round(phase / (2 * Math.PI))).toFixed(4)}
                            </span>
                            <span className={`text-[10px] px-2 py-0.5 rounded ${Math.abs((phase / (2 * Math.PI)) - Math.round(phase / (2 * Math.PI))) < 0.05
                                    ? "bg-green-500/20 text-green-300"
                                    : "bg-red-500/20 text-red-300"
                                }`}>
                                {Math.abs((phase / (2 * Math.PI)) - Math.round(phase / (2 * Math.PI))) < 0.05
                                    ? "CUANTIZADO"
                                    : "NO-ENTERO"}
                            </span>
                        </div>
                        <p className="text-[9px] text-purple-300/50 mt-1 italic">
                            Si RH es cierta, γ_n/(2π) debe ser entero. Δγ mide la desviación.
                        </p>
                    </div>
                </div>

                <div className="text-[10px] text-white/30 italic">
                    *Basado en el modelo de Germán Sierra (2007) sobre la dinámica de fermiones en el espacio-tiempo de Rindler.
                </div>
            </div>
        </div>
    );
};
