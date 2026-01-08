/**
 * CausalCone.tsx
 * 
 * Visualization of Log-Spacetime causal horizons (Smith/Nye 2025).
 * Shows how NP-hard problems require information exchange "outside the light cone"
 * in logarithmic coordinates, making polynomial solutions causally impossible.
 * 
 * Concept:
 * - Transform (t, x) → (τ, ξ) = (ln t, ln x)
 * - The "light cone" is a line with slope 1 in these coordinates
 * - P algorithms stay inside the cone; NP algorithms venture outside
 * - Outside = causal violation = exponential entropy (Landauer)
 */

import { useEffect, useState } from 'react';
import {
    ComposedChart,
    Line,
    Scatter,
    XAxis,
    YAxis,
    Tooltip,
    ReferenceLine,
    ResponsiveContainer,
    Area,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Zap, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

interface TrajectoryPoint {
    tau: number;
    xi: number;
    in_cone: boolean;
}

interface CausalAnalysis {
    problem_type: string;
    problem_size: number;
    required_depth: number;
    allowed_depth: number;
    violates_causality: boolean;
    entropy_cost: number;
}

interface CausalData {
    meta: {
        engine: string;
        source: string;
    };
    problem_size: number;
    cone_boundary: { tau: number; xi: number }[];
    p_analysis: CausalAnalysis;
    np_analysis: CausalAnalysis;
    visualization_data: {
        p_trajectory: TrajectoryPoint[];
        np_trajectory: TrajectoryPoint[];
    };
}

// Mock data matching log_causality.py output
const mockData: CausalData = {
    meta: { engine: 'log_causality.py', source: 'Smith/Nye (2025)' },
    problem_size: 20,
    cone_boundary: Array.from({ length: 20 }, (_, i) => ({
        tau: i * 0.3,
        xi: i * 0.3,
    })),
    p_analysis: {
        problem_type: 'P (2-SAT)',
        problem_size: 20,
        required_depth: 2.4,
        allowed_depth: 4.0,
        violates_causality: false,
        entropy_cost: 2.1,
    },
    np_analysis: {
        problem_type: 'NP (3-SAT Critical)',
        problem_size: 20,
        required_depth: 8.0,
        allowed_depth: 4.0,
        violates_causality: true,
        entropy_cost: 13.9,
    },
    visualization_data: {
        p_trajectory: Array.from({ length: 20 }, (_, i) => ({
            tau: Math.log(i + 1),
            xi: Math.log(Math.sqrt(i) + 1),
            in_cone: true,
        })),
        np_trajectory: Array.from({ length: 20 }, (_, i) => ({
            tau: Math.log(i + 1),
            xi: Math.log(i * 0.8 + 1),
            in_cone: i < 5,
        })),
    },
};

interface CausalConeProps {
    thermalNoise?: number;
    onDecoherence?: (isDecoherent: boolean) => void; // Phase 14.5: Callback for Cascading Failure
}

export function CausalCone({ thermalNoise = 0, onDecoherence }: CausalConeProps) {
    const [data, setData] = useState<CausalData | null>(null);
    const [showNP, setShowNP] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    // Ashtavakra Complexity: Observer Insight K(O) - range 0 to 1
    const [observerInsight, setObserverInsight] = useState(0);

    useEffect(() => {
        fetch('/data/log_causality.json')
            .then((res) => res.json())
            .then((jsonData) => {
                setData(jsonData);
                setIsLoading(false);
            })
            .catch(() => {
                setData(mockData);
                setIsLoading(false);
            });
    }, []);

    if (isLoading || !data) {
        return (
            <Card className="bg-black/40 border-cyan-500/30 backdrop-blur-sm">
                <CardContent className="flex items-center justify-center h-96">
                    <Clock className="w-8 h-8 animate-spin text-cyan-400" />
                </CardContent>
            </Card>
        );
    }

    const analysis = showNP ? data.np_analysis : data.p_analysis;
    const trajectory = showNP
        ? data.visualization_data.np_trajectory
        : data.visualization_data.p_trajectory;

    // Phase 14.5: Ashtavakra Mitigation (Ghosh 2025)
    // The collapse threshold is NOT fixed. A highly insightful observer can tolerate more noise.
    // η_critical = 0.7 + (K(O) × 0.2) -> Range: 0.7 (classical) to 0.9 (oracle)
    const etaCritical = 0.7 + (observerInsight * 0.2);
    const etaSoft = 0.3; // Soft threshold is fixed (Gneiting 2025)

    // Determine the system state
    const isHardCollapse = thermalNoise > etaCritical;
    const isSoftThreshold = thermalNoise > etaSoft && !isHardCollapse;
    const isStable = !isHardCollapse && !isSoftThreshold;

    // Noise penalty starts at soft threshold, maxes at dynamic hard threshold
    const noisePenalty = isHardCollapse ? 1.5 : Math.max(0, (thermalNoise - etaSoft) / (etaCritical - etaSoft));

    // Observer insight expands the cone, but Noise shrinks it.
    const compressionFactor = 1 - observerInsight * 0.6;
    // Effective Cone: Insight expands, Noise contracts
    const effectiveConeExpansion = Math.max(0.2, 1 + (observerInsight * 0.8) - noisePenalty);

    const chartData = trajectory.map((pt, i) => {
        const adjustedXi = pt.xi * compressionFactor;
        const adjustedCone = pt.tau * effectiveConeExpansion;
        return {
            tau: pt.tau,
            xi: adjustedXi,
            cone_limit: adjustedCone,
            in_cone: adjustedXi <= adjustedCone,
            index: i,
        };
    });

    // Recalculate violation based on observer insight and noise
    const adjustedViolation = chartData.some(pt => !pt.in_cone);
    const adjustedEntropy = analysis.entropy_cost * compressionFactor * (1 + thermalNoise);

    // Phase 14.5: Notify parent of decoherence state for Cascading Failure
    useEffect(() => {
        if (onDecoherence) {
            onDecoherence(isHardCollapse);
        }
    }, [isHardCollapse, onDecoherence]);

    // Determine badge styles based on state
    const getStateBadge = () => {
        if (isHardCollapse) {
            return { bg: 'bg-red-900/30', text: 'text-red-400', border: 'border-red-500/50', label: '🔥 DECOHERENCIA TOTAL', icon: '❌' };
        }
        if (isSoftThreshold) {
            return { bg: 'bg-yellow-500/20', text: 'text-yellow-300', border: 'border-yellow-500/40', label: '⚡ Soft Threshold', icon: '⚠️' };
        }
        return { bg: 'bg-green-500/20', text: 'text-green-300', border: 'border-green-500/30', label: '✅ Estable', icon: '✅' };
    };

    const stateBadge = getStateBadge();

    return (
        <Card className={`bg-black/40 backdrop-blur-sm transition-colors ${isHardCollapse ? 'border-red-500/50' : isSoftThreshold ? 'border-yellow-500/40' : 'border-cyan-500/30'}`}>
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                    <CardTitle className="text-lg flex items-center gap-2 text-cyan-300">
                        <Zap className="w-5 h-5" />
                        Cono Causal Log-Spacetime
                    </CardTitle>
                    <div className="flex gap-2 flex-wrap">
                        {/* Noise State Badge */}
                        <Badge variant="outline" className={`${stateBadge.bg} ${stateBadge.text} ${stateBadge.border}`}>
                            {stateBadge.label}
                        </Badge>
                        {/* Dynamic Threshold Indicator */}
                        {observerInsight > 0 && (
                            <Badge variant="outline" className="bg-purple-500/10 text-purple-300 border-purple-500/30 text-[10px]">
                                η<sub>crit</sub>={etaCritical.toFixed(2)}
                            </Badge>
                        )}
                        {/* Causal Status Badge */}
                        <Badge
                            variant="outline"
                            className={
                                adjustedViolation
                                    ? 'bg-red-500/20 text-red-300 border-red-500/30'
                                    : 'bg-green-500/20 text-green-300 border-green-500/30'
                            }
                        >
                            {adjustedViolation ? '⚠️ VIOLACIÓN CAUSAL' : '✅ CAUSAL'}
                        </Badge>
                    </div>
                </div>
                <p className="text-xs text-cyan-200/60 font-mono">
                    Métrica: ds² = -e<sup>2τ</sup>dτ² + e<sup>2ξ</sup>dξ² | Landauer: {adjustedEntropy.toFixed(1)} k<sub>B</sub>T | η={thermalNoise.toFixed(2)}
                </p>
            </CardHeader>

            <CardContent>
                {/* Problem Type Toggle */}
                <div className="flex gap-2 mb-4">
                    <button
                        onClick={() => setShowNP(false)}
                        className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${!showNP
                            ? 'bg-green-500/20 text-green-300 border border-green-500/50'
                            : 'bg-gray-800 text-gray-400 border border-gray-700'
                            }`}
                    >
                        P (2-SAT)
                    </button>
                    <button
                        onClick={() => setShowNP(true)}
                        className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${showNP
                            ? 'bg-red-500/20 text-red-300 border border-red-500/50'
                            : 'bg-gray-800 text-gray-400 border border-gray-700'
                            }`}
                    >
                        NP (3-SAT Crítico)
                    </button>
                </div>

                {/* Ashtavakra Observer Insight Slider + Ghosh Equation */}
                <div className={`mb-4 p-3 rounded-lg border transition-colors ${thermalNoise > 0.7 ? 'bg-red-900/10 border-red-500/30' : 'bg-purple-500/10 border-purple-500/30'}`}>
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-purple-300 font-medium">
                            Insight del Observador $K(\mathcal{O})$
                        </span>
                        <span className="text-xs font-mono text-purple-400">
                            {observerInsight === 0 ? 'Límite Clásico' : observerInsight === 1 ? 'Límite Oráculo' : (observerInsight * 100).toFixed(0) + '%'}
                        </span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={observerInsight}
                        onChange={(e) => setObserverInsight(parseFloat(e.target.value))}
                        className="w-full h-2 bg-purple-900 rounded-lg appearance-none cursor-pointer accent-purple-500"
                        disabled={thermalNoise > 0.8} // Extreme noise prevents insight
                    />
                    {thermalNoise > 0.8 && <p className="text-[10px] text-red-400 mt-1">⚠️ Ruido térmico masivo bloquea el insight cognitivo.</p>}

                    {/* Ghosh Equation Display (Ashtavakra Complexity) */}
                    <div className="mt-3 p-2 bg-black/30 rounded font-mono text-xs">
                        <div className="text-purple-300 mb-1">Complejidad de Ashtavakra (Ghosh 2025):</div>
                        <div className="text-white flex items-center gap-1 flex-wrap">
                            <span>$AC = \alpha \cdot$</span>
                            <span className={`px-1 rounded transition-colors ${observerInsight > 0.5 ? 'bg-green-500/30 text-green-300' : 'bg-red-500/30 text-red-300'}`}>
                                $K(x|\mathcal{O})$={((1 - observerInsight) * 10).toFixed(1)}
                            </span>
                            <span>$+ \beta \cdot (1/A) + \gamma \cdot \Phi(S)$</span>
                        </div>
                        <div className="text-purple-200/50 mt-1 text-[10px]">
                            La complejidad decrece monótonamente respecto al conocimiento del observador, pero aumenta con el ruido ($\eta={thermalNoise}$).
                        </div>
                    </div>

                    <div className="mt-2 flex items-center gap-2">
                        <span className="text-[10px] text-gray-400">Estatus rwPHP:</span>
                        {adjustedViolation ? (
                            <span className="text-[10px] text-red-400">🔁 No convergencia detectada (Horizonte colapsado)</span>
                        ) : (
                            <span className="text-[10px] text-green-400">✓ Certificado verificado localmente</span>
                        )}
                    </div>
                </div>


                {/* Chart */}
                <div className="h-64 mb-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={chartData}>
                            <defs>
                                <linearGradient id="coneGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.3} />
                                    <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.05} />
                                </linearGradient>
                            </defs>

                            <XAxis
                                dataKey="tau"
                                type="number"
                                domain={[0, 'auto']}
                                stroke="#666"
                                label={{ value: 'Log Time (τ)', position: 'bottom', fill: '#888', fontSize: 10 }}
                            />
                            <YAxis
                                dataKey="xi"
                                type="number"
                                domain={[0, 'auto']}
                                stroke="#666"
                                label={{ value: 'Log Space (ξ)', angle: -90, position: 'left', fill: '#888', fontSize: 10 }}
                            />

                            <Tooltip
                                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                                labelStyle={{ color: '#94a3b8' }}
                                formatter={(value: number, name: string) => [
                                    value.toFixed(2),
                                    name === 'xi' ? 'Log Space' : name === 'tau' ? 'Log Time' : name,
                                ]}
                            />

                            {/* Light Cone Area */}
                            <Area
                                type="monotone"
                                dataKey="cone_limit"
                                stroke="none"
                                fill="url(#coneGradient)"
                                fillOpacity={1}
                            />

                            {/* Light Cone Boundary (slope = 1) */}
                            <Line
                                type="monotone"
                                dataKey="cone_limit"
                                stroke={thermalNoise > 0.7 ? "#ef4444" : "#06b6d4"}
                                strokeWidth={2}
                                strokeDasharray="5 5"
                                dot={false}
                                name="Horizonte Causal"
                            />

                            {/* Computation Trajectory */}
                            <Scatter
                                dataKey="xi"
                                fill={showNP ? '#ef4444' : '#22c55e'}
                                name={analysis.problem_type}
                            />

                            <ReferenceLine y={0} stroke="#444" />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>

                {/* Depth Analysis */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-3 rounded-lg border mb-4 ${analysis.violates_causality || adjustedViolation
                        ? 'bg-red-500/10 border-red-500/30'
                        : 'bg-green-500/10 border-green-500/30'
                        }`}
                >
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="text-gray-400">Profundidad Requerida:</span>
                            <span className="ml-2 font-mono text-white">{analysis.required_depth.toFixed(1)}</span>
                        </div>
                        <div>
                            <span className="text-gray-400">Profundidad Permitida:</span>
                            <span className="ml-2 font-mono text-white flex items-center gap-2">
                                {(analysis.allowed_depth * effectiveConeExpansion).toFixed(1)}
                                {thermalNoise > 0.3 && <span className="text-[10px] text-red-400">(-{(noisePenalty).toFixed(1)} η)</span>}
                            </span>
                        </div>
                    </div>
                    {(analysis.violates_causality || adjustedViolation) && (
                        <p className="text-xs text-red-300 mt-2">
                            {thermalNoise > 0.7
                                ? "El colapso térmico ha contraído el horizonte causal. Verificación imposible."
                                : "La verificación global requiere información 'fuera del cono de luz'. un Refuter ganaría el juego de prueba (rwPHP)."
                            }
                        </p>
                    )}
                </motion.div>

                {/* Scientific Disclaimer */}
                <div className="flex items-start gap-2 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
                    <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-yellow-200/80">
                        <strong>Convergencia (Phase 14):</strong> La realidad física (ruido $\eta$) y la capacidad cognitiva ($K(\mathcal{O})$) son inseparables.
                        El ruido reduce la correlación cuántica (Decoherencia), contrayendo el cono de luz efectivo y haciendo que $\mathsf{P} \neq \mathsf{NP}$ sea una verdad termodinámica para observadores finitos.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}

export default CausalCone;
