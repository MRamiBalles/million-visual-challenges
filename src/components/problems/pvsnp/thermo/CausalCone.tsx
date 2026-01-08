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

export function CausalCone() {
    const [data, setData] = useState<CausalData | null>(null);
    const [showNP, setShowNP] = useState(true);
    const [isLoading, setIsLoading] = useState(true);

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

    // Combine trajectory with cone reference
    const chartData = trajectory.map((pt, i) => ({
        ...pt,
        cone_limit: pt.tau, // Light cone boundary: ξ = τ
        index: i,
    }));

    return (
        <Card className="bg-black/40 border-cyan-500/30 backdrop-blur-sm">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                    <CardTitle className="text-lg flex items-center gap-2 text-cyan-300">
                        <Zap className="w-5 h-5" />
                        Cono Causal Log-Spacetime
                    </CardTitle>
                    <Badge
                        variant="outline"
                        className={
                            analysis.violates_causality
                                ? 'bg-red-500/20 text-red-300 border-red-500/30'
                                : 'bg-green-500/20 text-green-300 border-green-500/30'
                        }
                    >
                        {analysis.violates_causality ? '⚠️ VIOLACIÓN CAUSAL' : '✅ CAUSAL'}
                    </Badge>
                </div>
                <p className="text-xs text-cyan-200/60 font-mono">
                    Métrica: ds² = -e<sup>2τ</sup>dτ² + e<sup>2ξ</sup>dξ² | Landauer: {analysis.entropy_cost.toFixed(1)} k<sub>B</sub>T
                </p>
            </CardHeader>

            <CardContent>
                {/* Toggle */}
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
                                stroke="#06b6d4"
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
                    className={`p-3 rounded-lg border mb-4 ${analysis.violates_causality
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
                            <span className="ml-2 font-mono text-white">{analysis.allowed_depth.toFixed(1)}</span>
                        </div>
                    </div>
                    {analysis.violates_causality && (
                        <p className="text-xs text-red-300 mt-2">
                            La verificación global requiere información "fuera del cono de luz".
                            Un Refuter ganaría el juego de prueba (rwPHP).
                        </p>
                    )}
                </motion.div>

                {/* Scientific Disclaimer */}
                <div className="flex items-start gap-2 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
                    <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-yellow-200/80">
                        <strong>Interpretación:</strong> La violación causal no significa "viajar más
                        rápido que la luz". Significa que para resolver en tiempo polinomial, el
                        algoritmo necesitaría acceder a información causalmente desconectada en la
                        geometría logarítmica (Smith 2025, Nye 2025).
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}

export default CausalCone;
