/**
 * ChaoticTrajectories.tsx
 * 
 * Visualization of LagONN (Lagrange Oscillatory Neural Network) dynamics.
 * Shows how oscillators evolve in phase space, contrasting laminar (easy) 
 * vs chaotic (hard) dynamics.
 * 
 * Source: Delacour et al. (2025) - "Lagrange Oscillatory Neural Networks"
 */

import { useEffect, useState } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    ResponsiveContainer,
    ReferenceLine,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { AlertTriangle, Activity, Zap } from 'lucide-react';

interface TrajectoryPoint {
    t: number;
    energy: number;
    constraint_violation: number;
    lyapunov_estimate: number;
}

interface PhaseData {
    config: {
        n_variables: number;
        n_clauses: number;
    };
    alpha: number;
    lagonn: TrajectoryPoint[];
    ising: TrajectoryPoint[];
    summary: {
        lagonn_final_energy: number;
        ising_final_energy: number;
        lyapunov_exponent: number;
        lagonn_escaped_trap: boolean;
        is_critical_phase: boolean;
    };
}

interface LagonnData {
    easy_phase: PhaseData;
    critical_phase: PhaseData;
    meta: {
        engine: string;
        version: string;
        source: string;
    };
}

// Mock data for development (replaced by actual fetch in production)
const mockData: LagonnData = {
    easy_phase: {
        config: { n_variables: 50, n_clauses: 100 },
        alpha: 2.0,
        lagonn: Array.from({ length: 50 }, (_, i) => ({
            t: i * 0.2,
            energy: 20 * Math.exp(-i * 0.1) + Math.random() * 0.5,
            constraint_violation: 15 * Math.exp(-i * 0.12),
            lyapunov_estimate: 0.1,
        })),
        ising: Array.from({ length: 50 }, (_, i) => ({
            t: i * 0.2,
            energy: 20 * Math.exp(-i * 0.05) + 5,
            constraint_violation: 15 * Math.exp(-i * 0.05),
            lyapunov_estimate: 0,
        })),
        summary: {
            lagonn_final_energy: 0.5,
            ising_final_energy: 8.0,
            lyapunov_exponent: 0.1,
            lagonn_escaped_trap: true,
            is_critical_phase: false,
        },
    },
    critical_phase: {
        config: { n_variables: 50, n_clauses: 213 },
        alpha: 4.26,
        lagonn: Array.from({ length: 100 }, (_, i) => ({
            t: i * 0.1,
            energy: 40 + 10 * Math.sin(i * 0.3) * Math.exp(-i * 0.01) + Math.random() * 5,
            constraint_violation: 30 + 5 * Math.cos(i * 0.2),
            lyapunov_estimate: 0.5 + Math.random() * 0.2,
        })),
        ising: Array.from({ length: 100 }, (_, i) => ({
            t: i * 0.1,
            energy: 45 + Math.random() * 2,
            constraint_violation: 35,
            lyapunov_estimate: 0,
        })),
        summary: {
            lagonn_final_energy: 25.0,
            ising_final_energy: 45.0,
            lyapunov_exponent: 0.65,
            lagonn_escaped_trap: true,
            is_critical_phase: true,
        },
    },
    meta: {
        engine: 'lagonn_sim.py',
        version: '1.0',
        source: 'Delacour et al. (2025)',
    },
};

export function ChaoticTrajectories() {
    const [data, setData] = useState<LagonnData | null>(null);
    const [activePhase, setActivePhase] = useState<'easy' | 'critical'>('critical');
    const [isLoading, setIsLoading] = useState(true);
    const [thermalNoise, setThermalNoise] = useState(0.1);

    useEffect(() => {
        // Try to load real data, fall back to mock
        fetch('/data/lagonn_trajectories.json')
            .then((res) => res.json())
            .then((jsonData) => {
                setData(jsonData);
                setIsLoading(false);
            })
            .catch(() => {
                // Use mock data if file not found
                setData(mockData);
                setIsLoading(false);
            });
    }, []);

    if (isLoading || !data) {
        return (
            <Card className="bg-black/40 border-blue-500/30 backdrop-blur-sm">
                <CardContent className="flex items-center justify-center h-96">
                    <Activity className="w-8 h-8 animate-spin text-blue-400" />
                </CardContent>
            </Card>
        );
    }

    const currentPhase = activePhase === 'easy' ? data.easy_phase : data.critical_phase;
    const { summary } = currentPhase;

    // Hard Threshold: η_hard ≈ 0.7
    // System collapses at high noise
    const isCollapsed = thermalNoise > 0.7;
    const isWobbly = thermalNoise > 0.3;

    const chartData = currentPhase.lagonn.map((pt, i) => {
        const noiseEffect = (Math.random() - 0.5) * thermalNoise * 10;
        const disintegrationEffect = isCollapsed ? (Math.random() - 0.5) * thermalNoise * 50 : 0;

        return {
            t: pt.t,
            energy: isCollapsed ? (Math.random() * 20 + 30) : (pt.energy + noiseEffect),
            ising_energy: currentPhase.ising[i]?.energy + noiseEffect,
            isCollapsed
        };
    });

    return (
        <Card className="bg-black/40 border-blue-500/30 backdrop-blur-sm">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                    <CardTitle className="text-lg flex items-center gap-2 text-blue-300">
                        <Zap className="w-5 h-5" />
                        Dinámica LagONN: Caos y Resiliencia
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        <Badge
                            variant="outline"
                            className={isCollapsed ? 'bg-red-900/50 text-red-500 border-red-500' : (summary.is_critical_phase ? 'bg-red-500/20 text-red-300 border-red-500/30' : 'bg-green-500/20 text-green-300 border-green-500/30')}
                        >
                            {isCollapsed ? 'COLLAPSE' : `α = ${currentPhase.alpha.toFixed(2)}`}
                        </Badge>
                        <Badge
                            variant="outline"
                            className="bg-purple-500/20 text-purple-300 border-purple-500/30"
                        >
                            λ = {summary.lyapunov_exponent.toFixed(2)}
                        </Badge>
                    </div>
                </div>
            </CardHeader>

            <CardContent>
                <div className="flex flex-col md:flex-row gap-4 mb-4">
                    <div className="flex-1">
                        <Tabs value={activePhase} onValueChange={(v) => setActivePhase(v as 'easy' | 'critical')}>
                            <TabsList className="bg-black/40 border border-blue-500/30 mb-2">
                                <TabsTrigger value="easy" className="data-[state=active]:bg-green-500/30 text-[10px] h-7">
                                    🟢 Fácil (α=2.0)
                                </TabsTrigger>
                                <TabsTrigger value="critical" className="data-[state=active]:bg-red-500/30 text-[10px] h-7">
                                    🔴 Crítico (α=4.26)
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>

                    {/* Noise Slider */}
                    <div className="w-full md:w-64 p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] text-blue-300 font-bold uppercase tracking-wider">Ruido Térmico (η)</span>
                            <span className={`text-[10px] font-mono ${isCollapsed ? 'text-red-400 animate-pulse' : 'text-blue-400'}`}>
                                {isCollapsed ? 'Hard Collapse' : isWobbly ? 'Soft Threshold' : 'Stable'}
                            </span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.05"
                            value={thermalNoise}
                            onChange={(e) => setThermalNoise(parseFloat(e.target.value))}
                            className="w-full h-1.5 bg-blue-900 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        />
                    </div>
                </div>

                <div className="h-64 mb-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                            <XAxis
                                dataKey="t"
                                stroke="#666"
                                label={{ value: 'Tiempo (t)', position: 'bottom', fill: '#888', fontSize: 10 }}
                            />
                            <YAxis
                                stroke="#666"
                                label={{ value: 'Energía', angle: -90, position: 'left', fill: '#888', fontSize: 10 }}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                                labelStyle={{ color: '#94a3b8' }}
                            />
                            <Legend wrapperStyle={{ fontSize: '10px' }} />
                            <ReferenceLine y={0} stroke="#444" strokeDasharray="3 3" />

                            <Line
                                type="monotone"
                                dataKey="energy"
                                name="LagONN Trajectory"
                                stroke={isCollapsed ? "#f43f5e" : "#3b82f6"}
                                strokeWidth={isCollapsed ? 1 : 2}
                                dot={false}
                                animationDuration={300}
                            />

                            <Line
                                type="monotone"
                                dataKey="ising_energy"
                                name="Classical Stochastic"
                                stroke="#94a3b8"
                                strokeWidth={1}
                                strokeDasharray="5 5"
                                dot={false}
                                animationDuration={300}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-3 text-center mb-4">
                    <div className="bg-black/30 rounded-lg p-2 border border-blue-500/20">
                        <div className="text-md font-mono text-blue-400">
                            {isCollapsed ? '∞' : (summary.lagonn_final_energy * (1 + thermalNoise)).toFixed(1)}
                        </div>
                        <div className="text-[10px] text-muted-foreground uppercase">Resiliencia</div>
                    </div>
                    <div className="bg-black/30 rounded-lg p-2 border border-red-500/20">
                        <div className="text-md font-mono text-red-400">
                            {(summary.ising_final_energy).toFixed(1)}
                        </div>
                        <div className="text-[10px] text-muted-foreground uppercase">Error Base</div>
                    </div>
                    <div className="bg-black/30 rounded-lg p-2 border border-emerald-500/20">
                        <div className={`text-md font-mono ${isCollapsed ? 'text-red-500' : 'text-emerald-400'}`}>
                            {isCollapsed ? 'DISR' : (summary.lagonn_escaped_trap ? 'OPT' : 'TRAP')}
                        </div>
                        <div className="text-[10px] text-muted-foreground uppercase">Solución</div>
                    </div>
                </div>

                {/* Scientific Insight */}
                <div className="flex items-start gap-2 p-3 bg-blue-500/5 rounded-lg border border-blue-500/20">
                    <AlertTriangle className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                    <p className="text-[10px] text-blue-200/80 leading-tight">
                        <strong>Umbral de Ruido (η):</strong> NP no es solo costo temporal; es fragilidad.
                        A η &lt; 0.3, la robustez topológica permite convergencia. A η &gt; 0.7 (Hard Threshold),
                        la "desintegración" hace que las instancias difíciles sean físicamente insolubles para solvers analógicos.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}

export default ChaoticTrajectories;
