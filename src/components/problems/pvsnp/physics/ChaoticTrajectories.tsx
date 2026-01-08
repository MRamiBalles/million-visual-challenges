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

    return (
        <Card className="bg-black/40 border-blue-500/30 backdrop-blur-sm">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                    <CardTitle className="text-lg flex items-center gap-2 text-blue-300">
                        <Zap className="w-5 h-5" />
                        Dinámica LagONN: Caos Transitorio
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        <Badge
                            variant="outline"
                            className={`${summary.is_critical_phase
                                    ? 'bg-red-500/20 text-red-300 border-red-500/30'
                                    : 'bg-green-500/20 text-green-300 border-green-500/30'
                                }`}
                        >
                            α = {currentPhase.alpha.toFixed(2)}
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
                <Tabs value={activePhase} onValueChange={(v) => setActivePhase(v as 'easy' | 'critical')}>
                    <TabsList className="bg-black/40 border border-blue-500/30 mb-4">
                        <TabsTrigger value="easy" className="data-[state=active]:bg-green-500/30">
                            🟢 Fase Fácil (α=2.0)
                        </TabsTrigger>
                        <TabsTrigger value="critical" className="data-[state=active]:bg-red-500/30">
                            🔴 Fase Crítica (α≈4.26)
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value={activePhase}>
                        <div className="h-64 mb-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart>
                                    <XAxis
                                        dataKey="t"
                                        stroke="#666"
                                        label={{ value: 'Tiempo (t)', position: 'bottom', fill: '#888' }}
                                        data={currentPhase.lagonn}
                                    />
                                    <YAxis
                                        stroke="#666"
                                        label={{ value: 'Energía', angle: -90, position: 'left', fill: '#888' }}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                                        labelStyle={{ color: '#94a3b8' }}
                                    />
                                    <Legend />
                                    <ReferenceLine y={0} stroke="#444" strokeDasharray="3 3" />

                                    {/* LagONN trajectory */}
                                    <Line
                                        data={currentPhase.lagonn}
                                        type="monotone"
                                        dataKey="energy"
                                        name="LagONN"
                                        stroke="#3b82f6"
                                        dot={false}
                                        strokeWidth={2}
                                    />

                                    {/* Standard Ising trajectory */}
                                    <Line
                                        data={currentPhase.ising}
                                        type="monotone"
                                        dataKey="energy"
                                        name="Ising (sin λ)"
                                        stroke="#ef4444"
                                        dot={false}
                                        strokeWidth={2}
                                        strokeDasharray="5 5"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-3 gap-3 text-center mb-4">
                            <div className="bg-black/30 rounded-lg p-2 border border-blue-500/20">
                                <div className="text-lg font-mono text-blue-400">
                                    {summary.lagonn_final_energy.toFixed(1)}
                                </div>
                                <div className="text-xs text-muted-foreground">LagONN Final</div>
                            </div>
                            <div className="bg-black/30 rounded-lg p-2 border border-red-500/20">
                                <div className="text-lg font-mono text-red-400">
                                    {summary.ising_final_energy.toFixed(1)}
                                </div>
                                <div className="text-xs text-muted-foreground">Ising Final</div>
                            </div>
                            <div className="bg-black/30 rounded-lg p-2 border border-emerald-500/20">
                                <div className="text-lg font-mono text-emerald-400">
                                    {summary.lagonn_escaped_trap ? '✅' : '❌'}
                                </div>
                                <div className="text-xs text-muted-foreground">Escapó Trampa</div>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>

                {/* Scientific Disclaimer */}
                <div className="flex items-start gap-2 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
                    <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-yellow-200/80">
                        <strong>Fuente:</strong> Modelo LagONN de Delacour et al. (2025). Los
                        multiplicadores de Lagrange "empujan" al sistema fuera de mínimos locales
                        sin necesidad de ruido térmico. λ &gt; 0 indica caos transitorio.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}

export default ChaoticTrajectories;
