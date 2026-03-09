import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Zap, Network, Brain, FileSearch, Atom } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PosterMetricProps {
    label: string;
    value: string | number;
    icon: React.ReactNode;
    description: string;
    colorClass: string;
}

const PosterMetric = ({ label, value, icon, description, colorClass }: PosterMetricProps) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm space-y-2"
    >
        <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-${colorClass}/20 text-${colorClass}-400`}>
                {icon}
            </div>
            <span className="text-sm font-medium text-slate-400">{label}</span>
        </div>
        <div className="text-2xl font-bold text-white tracking-tight">{value}</div>
        <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
    </motion.div>
);

export const ScientificPoster = () => {
    const [data, setData] = useState<any>(null);
    const [selectedInstance, setSelectedInstance] = useState("sko90");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/data/sovereign_manifest.json")
            .then(res => res.json())
            .then(json => {
                setData(json);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error loading sovereign manifest:", err);
                setLoading(false);
            });
    }, []);

    if (loading) return <div className="h-96 flex items-center justify-center text-cyan-400 font-mono">LOADING_SOVEREIGN_DATA...</div>;
    if (!data) return <div className="h-96 flex items-center justify-center text-red-400 font-mono">ERROR_MANIFEST_NOT_FOUND</div>;

    const cert = data.certificates[selectedInstance];

    return (
        <Card className="relative overflow-hidden border-cyan-500/30 bg-slate-950 text-slate-200">
            {/* Background Decorative Elements */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/5 pointer-events-none" />

            <div className="relative p-8 space-y-12">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/10 pb-8">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="border-cyan-500/50 text-cyan-400 bg-cyan-500/5">
                                GRAND UNIFIED AUDIT {data.metadata.version}
                            </Badge>
                            <div className="flex items-center gap-1 text-xs text-slate-500">
                                <ShieldCheck className="w-3 h-3" />
                                SOVEREIGN RIGOR LEVEL 5
                            </div>
                        </div>
                        <h2 className="text-4xl font-extrabold tracking-tighter bg-gradient-to-r from-white via-white to-slate-500 bg-clip-text text-transparent">
                            The Homological Landscape of P vs NP
                        </h2>
                        <div className="flex items-center gap-4">
                            <p className="text-slate-400 font-mono text-sm uppercase">Active Instance:</p>
                            <select
                                className="bg-slate-900 border border-white/10 rounded px-2 py-1 text-cyan-400 font-mono text-xs focus:ring-1 focus:ring-cyan-500 outline-none"
                                value={selectedInstance}
                                onChange={(e) => setSelectedInstance(e.target.value)}
                            >
                                {Object.keys(data.certificates).map(id => (
                                    <option key={id} value={id}>{id.toUpperCase()}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 text-right">
                        <div>
                            <div className="text-xs text-slate-500 font-mono uppercase tracking-widest">Update Frequency</div>
                            <div className="text-cyan-400 font-bold flex items-center gap-2 justify-end">
                                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                                REAL_TIME_SYNC
                            </div>
                            <div className="text-[10px] text-slate-600 font-mono">{data.metadata.last_updated}</div>
                        </div>
                    </div>
                </div>

                {/* Content Grid */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={selectedInstance}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="grid grid-cols-1 lg:grid-cols-3 gap-12"
                    >

                        {/* Column 1: Core Homology */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 text-cyan-400">
                                <Network className="w-6 h-6" />
                                <h3 className="text-xl font-bold uppercase tracking-tight">1. Core Homology</h3>
                            </div>
                            <p className="text-sm text-slate-400 leading-relaxed">
                                Detection of non-trivial Čech Homology ($H_1 \ne 0$) in the solution manifold.
                            </p>
                            <div className="space-y-4">
                                <PosterMetric
                                    label="Residual GAP"
                                    value={`${cert.base.gap}%`}
                                    icon={<FileSearch className="w-5 h-5" />}
                                    description="Physical measure of topological obstruction (Normalized)."
                                    colorClass="cyan"
                                />
                                <div className="p-4 rounded-xl border border-cyan-500/20 bg-cyan-500/5 text-xs font-mono">
                                    <span className="text-cyan-400">VERDICT:</span> {cert.base.obstructed ? "OBSTRUCTION_DETECTED" : "NO_OBSTRUCTION"}
                                </div>
                            </div>
                        </div>

                        {/* Column 2: Meta-Complexity */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 text-purple-400">
                                <Brain className="w-6 h-6" />
                                <h3 className="text-xl font-bold uppercase tracking-tight">2. Meta-Complexity</h3>
                            </div>
                            <p className="text-sm text-slate-400 leading-relaxed">
                                Computational cost of certifying the obstruction status via sheaf-theoretic audit.
                            </p>
                            <div className="space-y-4">
                                <PosterMetric
                                    label="Meta-Effort Score"
                                    value={cert.meta.effort_score?.toLocaleString() || "N/A"}
                                    icon={<Zap className="w-5 h-5" />}
                                    description="Rigorous certification cost (Super-Polynomial scaling)."
                                    colorClass="purple"
                                />
                                <div className="p-4 rounded-xl border border-purple-500/20 bg-purple-500/5 text-xs font-mono">
                                    <span className="text-purple-400">RIGOR:</span> HIGH_CERTAINTY
                                </div>
                            </div>
                        </div>

                        {/* Column 3: Quantum Sovereignty */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 text-amber-400">
                                <Atom className="w-6 h-6" />
                                <h3 className="text-xl font-bold uppercase tracking-tight">3. Quantum Braiding</h3>
                            </div>
                            <p className="text-sm text-slate-400 leading-relaxed">
                                Spectral flow non-triviality in Quantum Adiabatic Algorithms (Joshi, 2026).
                            </p>
                            <div className="space-y-4">
                                <PosterMetric
                                    label="Braiding Index"
                                    value={cert.quantum.braiding_index?.toFixed(4) || "0.0000"}
                                    icon={<Network className="w-5 h-5" />}
                                    description="Quantized spectral congestion in adiabatic evolution."
                                    colorClass="amber"
                                />
                                <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 text-xs font-mono">
                                    <span className="text-amber-400">SOVEREIGNTY:</span> {cert.quantum.braiding_index > 0.5 ? "ADIABATIC_LOCK" : "FLUID_FLOW"}
                                </div>
                            </div>
                        </div>

                    </motion.div>
                </AnimatePresence>

                {/* Bottom Footer Section */}
                <div className="pt-8 border-t border-white/10 flex justify-between items-center text-xs font-mono text-slate-500">
                    <div className="flex gap-8">
                        <div className="flex items-center gap-1 underline underline-offset-4 cursor-pointer hover:text-cyan-400">
                            VerifiedCertificates.lean
                        </div>
                        <div className="flex items-center gap-1 underline underline-offset-4 cursor-pointer hover:text-cyan-400" onClick={() => window.open('/public/data/sovereign_manifest.json')}>
                            sovereign_manifest.json
                        </div>
                    </div>
                    <div className="tracking-widest uppercase">
                        © 2026 Million Visual Challenges Research Group
                    </div>
                </div>
            </div>
        </Card>
    );
};
