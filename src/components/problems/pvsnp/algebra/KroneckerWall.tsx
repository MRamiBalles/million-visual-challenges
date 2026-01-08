/**
 * KroneckerWall.tsx
 * 
 * Visualization of the "Five Threshold" - the algebraic obstruction at k=5
 * where polynomial patterns in Kronecker coefficients collapse.
 * 
 * Source: Lee (2025) - "Geometric Complexity Theory and Algebraic Obstructions"
 */

import { useEffect, useState } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Cell,
    ReferenceLine,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Target } from 'lucide-react';
import { motion } from 'framer-motion';

interface KroneckerPoint {
    k: number;
    actual_coefficient: number;
    hogben_prediction: number;
    correction: number;
    is_stable: boolean;
    discriminant: number;
    factorization_pattern: string;
}

interface KroneckerData {
    sequence: KroneckerPoint[];
    five_threshold: {
        location: number;
        phenomenon: string;
        algebraic_cause: string;
        implication: string;
    };
    visualization_data: {
        bar_chart: { k: number; correction: number }[];
        jump_annotation: {
            x: number;
            label: string;
            description: string;
        };
    };
    meta: {
        engine: string;
        source: string;
    };
}

// Mock data matching kronecker_fault.py output
const mockData: KroneckerData = {
    sequence: [
        { k: 1, actual_coefficient: 1, hogben_prediction: 1, correction: 0, is_stable: true, discriminant: 0, factorization_pattern: 'Stable' },
        { k: 2, actual_coefficient: 6, hogben_prediction: 6, correction: 0, is_stable: true, discriminant: 0, factorization_pattern: 'Stable' },
        { k: 3, actual_coefficient: 28, hogben_prediction: 28, correction: 0, is_stable: true, discriminant: 0, factorization_pattern: 'Stable' },
        { k: 4, actual_coefficient: 91, hogben_prediction: 91, correction: 0, is_stable: true, discriminant: 0, factorization_pattern: 'Stable' },
        { k: 5, actual_coefficient: 260, hogben_prediction: 231, correction: 29, is_stable: false, discriminant: -3, factorization_pattern: 'OBSTRUCTION' },
        { k: 6, actual_coefficient: 650, hogben_prediction: 561, correction: 89, is_stable: false, discriminant: -3, factorization_pattern: 'OBSTRUCTION' },
        { k: 7, actual_coefficient: 1470, hogben_prediction: 1225, correction: 245, is_stable: false, discriminant: -3, factorization_pattern: 'OBSTRUCTION' },
    ],
    five_threshold: {
        location: 5,
        phenomenon: 'Discontinuous jump in correction sequence',
        algebraic_cause: 'Negative discriminant in Lee\'s formula (Δ = -3)',
        implication: 'Elementary combinatorics fails beyond k=4',
    },
    visualization_data: {
        bar_chart: [
            { k: 1, correction: 0 },
            { k: 2, correction: 0 },
            { k: 3, correction: 0 },
            { k: 4, correction: 0 },
            { k: 5, correction: 29 },
            { k: 6, correction: 89 },
            { k: 7, correction: 245 },
        ],
        jump_annotation: { x: 5, label: 'MURO DE CINCO', description: 'The Five Threshold' },
    },
    meta: {
        engine: 'kronecker_fault.py',
        source: 'Lee (2025) - Geometric Complexity Theory',
    },
};

export function KroneckerWall() {
    const [data, setData] = useState<KroneckerData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetch('/data/kronecker_fault.json')
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
            <Card className="bg-black/40 border-orange-500/30 backdrop-blur-sm">
                <CardContent className="flex items-center justify-center h-96">
                    <Target className="w-8 h-8 animate-pulse text-orange-400" />
                </CardContent>
            </Card>
        );
    }

    const chartData = data.visualization_data.bar_chart;
    const threshold = data.five_threshold;

    return (
        <Card className="bg-black/40 border-orange-500/30 backdrop-blur-sm">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                    <CardTitle className="text-lg flex items-center gap-2 text-orange-300">
                        <Target className="w-5 h-5" />
                        El Muro de Cinco: Obstrucción Algebraica
                    </CardTitle>
                    <Badge
                        variant="outline"
                        className="bg-red-500/20 text-red-300 border-red-500/30"
                    >
                        k = {threshold.location} → Δ = -3
                    </Badge>
                </div>
            </CardHeader>

            <CardContent>
                <div className="h-64 mb-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                            <XAxis
                                dataKey="k"
                                stroke="#666"
                                label={{ value: 'Parámetro de Partición (k)', position: 'bottom', fill: '#888' }}
                            />
                            <YAxis
                                stroke="#666"
                                label={{ value: 'Corrección C_k', angle: -90, position: 'left', fill: '#888' }}
                            />
                            <Tooltip
                                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        const point = payload[0].payload;
                                        const seqPoint = data.sequence.find((s) => s.k === point.k);
                                        return (
                                            <div className="bg-gray-900 p-3 border border-gray-700 rounded-lg text-white text-xs">
                                                <p className="font-bold">k = {point.k}</p>
                                                <p>Corrección: <span className={point.correction > 0 ? 'text-red-400' : 'text-green-400'}>
                                                    {point.correction > 0 ? '+' : ''}{point.correction}
                                                </span></p>
                                                {seqPoint && (
                                                    <>
                                                        <p>Real: {seqPoint.actual_coefficient}</p>
                                                        <p>Hogben: {seqPoint.hogben_prediction}</p>
                                                        {!seqPoint.is_stable && (
                                                            <p className="text-red-400 font-bold mt-1">⚠️ OBSTRUCCIÓN</p>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <ReferenceLine
                                x={4.5}
                                stroke="#ef4444"
                                strokeWidth={2}
                                strokeDasharray="5 5"
                                label={{ value: 'UMBRAL', fill: '#ef4444', fontSize: 10 }}
                            />
                            <Bar dataKey="correction" radius={[4, 4, 0, 0]}>
                                {chartData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={entry.correction > 0 ? '#ef4444' : '#22c55e'}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Threshold Info */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-red-500/10 rounded-lg border border-red-500/30 mb-4"
                >
                    <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-5 h-5 text-red-400" />
                        <span className="font-bold text-red-300">COLAPSO DETECTADO</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div>
                            <p className="text-gray-400">Causa:</p>
                            <p className="text-white">{threshold.algebraic_cause}</p>
                        </div>
                        <div>
                            <p className="text-gray-400">Implicación:</p>
                            <p className="text-white">{threshold.implication}</p>
                        </div>
                    </div>
                </motion.div>

                {/* Scientific Disclaimer */}
                <div className="flex items-start gap-2 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
                    <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-yellow-200/80">
                        <strong>Fuente:</strong> Teoría GCT de Lee (2025). La secuencia C_k = A_k - Hogben(k)
                        permanece en 0 hasta k=4, luego salta. Esto indica una obstrucción algebraica
                        (discriminante negativo), NO una prueba de P ≠ NP.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}

export default KroneckerWall;
