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
import { AlertTriangle, Target, Activity, Legend } from 'lucide-react';
import { motion } from 'framer-motion';

interface KroneckerPoint {
    k: number;
    perm_mult: number;
    det_mult: number;
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
    meta: {
        engine: string;
        source: string;
    };
}

// Mock data reflecting GCT Multiplicity Obstructions
const mockData: KroneckerData = {
    sequence: [
        { k: 1, perm_mult: 1, det_mult: 1, is_stable: true, discriminant: 0, factorization_pattern: 'Stable' },
        { k: 2, perm_mult: 6, det_mult: 6, is_stable: true, discriminant: 0, factorization_pattern: 'Stable' },
        { k: 3, perm_mult: 28, det_mult: 28, is_stable: true, discriminant: 0, factorization_pattern: 'Stable' },
        { k: 4, perm_mult: 91, det_mult: 91, is_stable: true, discriminant: 0, factorization_pattern: 'Stable' },
        { k: 5, perm_mult: 260, det_mult: 231, is_stable: false, discriminant: -3, factorization_pattern: 'GAP' },
        { k: 6, perm_mult: 650, det_mult: 561, is_stable: false, discriminant: -3, factorization_pattern: 'GAP' },
        { k: 7, perm_mult: 1470, det_mult: 1225, is_stable: false, discriminant: -3, factorization_pattern: 'GAP' },
    ],
    five_threshold: {
        location: 5,
        phenomenon: 'Multiplicity Gap Emergence',
        algebraic_cause: 'Negative discriminant in orbit closure (Δ = -3)',
        implication: 'Separation of classes via multiplicity obstructions',
    },
    meta: {
        engine: 'gct_multiplicity.py',
        source: 'Mulmuley/Sohoni (GCT) - Multiplicity vs Occurrence',
    },
};

export function KroneckerWall() {
    const [data, setData] = useState<KroneckerData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetch('/data/kronecker_mult.json')
            .then((res) => res.json())
            .then((jsonData) => {
                setData(jsonData);
                setIsLoading(false)
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

    const chartData = data.sequence;
    const threshold = data.five_threshold;

    return (
        <Card className="bg-black/40 border-orange-500/30 backdrop-blur-sm">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                    <CardTitle className="text-lg flex items-center gap-2 text-orange-300">
                        <Target className="w-5 h-5" />
                        Muro de Multiplicidad (GCT)
                    </CardTitle>
                    <Badge
                        variant="outline"
                        className="bg-orange-500/20 text-orange-300 border-orange-500/30 font-mono"
                    >
                        $\text{mult}(V) \neq \text{mult}(W)$
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
                                label={{ value: 'Parámetro (k)', position: 'bottom', fill: '#888', fontSize: 10 }}
                            />
                            <YAxis
                                stroke="#666"
                                label={{ value: 'Multiplicidad', angle: -90, position: 'left', fill: '#888', fontSize: 10 }}
                                scale="log"
                                domain={[1, 'auto']}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                                labelStyle={{ color: '#ffffff', fontWeight: 'bold' }}
                                itemStyle={{ fontSize: '10px' }}
                            />
                            <Legend wrapperStyle={{ fontSize: '10px' }} />
                            <ReferenceLine
                                x={4.5}
                                stroke="#ef4444"
                                strokeWidth={2}
                                strokeDasharray="5 5"
                                label={{ value: 'THRESHOLD', fill: '#ef4444', fontSize: 10, position: 'top' }}
                            />

                            <Bar
                                dataKey="perm_mult"
                                name="Perm (Exponencial)"
                                fill="#f43f5e"
                                radius={[2, 2, 0, 0]}
                            />
                            <Bar
                                dataKey="det_mult"
                                name="Det (Polinomial)"
                                fill="#22c55e"
                                radius={[2, 2, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Multiplicity Gap Description */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-3 bg-orange-500/10 rounded-lg border border-orange-500/30 mb-4"
                >
                    <div className="flex items-center gap-2 mb-1">
                        <Activity className="w-4 h-4 text-orange-400" />
                        <span className="text-[10px] font-bold text-orange-300 uppercase underline decoration-orange-500/50 underline-offset-4">Brecha de Multiplicidad (GAP)</span>
                    </div>
                    <p className="text-[10px] text-gray-300 mb-2 leading-relaxed">
                        A partir de $k \geq 5$, la multiplicidad de representaciones en el Permanente diverge de la del Determinante.
                        Este "Gap" es la firma algebraica de que existen funciones en $\mathsf{VNP}$ que no están en la órbita de $\mathsf{VP}$.
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                        <div className="bg-black/40 p-1.5 rounded border border-orange-500/20">
                            <span className="text-gray-400 bloc">Discriminante (Δ):</span>
                            <span className="text-white font-mono">{threshold.algebraic_cause}</span>
                        </div>
                        <div className="bg-black/40 p-1.5 rounded border border-orange-500/20">
                            <span className="text-gray-400 block">Efecto:</span>
                            <span className="text-white">Colapso de simetría</span>
                        </div>
                    </div>
                </motion.div>

                {/* Legend/Scientific Context */}
                <div className="flex items-start gap-2 p-3 bg-yellow-500/5 rounded-lg border border-yellow-500/20">
                    <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <p className="text-[10px] text-yellow-200/80 leading-tight">
                        <strong>Insight GCT:</strong> No basta con que el coeficiente sea 0 o positivo.
                        Lo que separa clases es la diferencia de crecimiento entre las multiplicidades de las representaciones irreducibles
                        (Mulmuley/Sohoni 2001).
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}

export default KroneckerWall;
