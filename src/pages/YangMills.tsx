import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Zap,
    Activity,
    ShieldAlert,
    Database,
    Binary,
    Network,
    Search,
    ArrowRight,
    Beaker,
    FileText
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useActivityTracker } from '@/hooks/useActivityTracker';
import { GlueballSpectrum } from '@/components/problems/yang-mills/GlueballSpectrum';
import { MERARenormalization } from '@/components/problems/yang-mills/MERARenormalization';
import { KarazoupisParadox } from '@/components/problems/yang-mills/KarazoupisParadox';

const YangMills = () => {
    const [activePhase, setActivePhase] = useState<'crisis' | 'evidence' | 'resolution'>('crisis');
    const [isSimulating, setIsSimulating] = useState(false);

    useActivityTracker("yang-mills", "active_research");

    const runAxiomCheck = async () => {
        setIsSimulating(true);
        await new Promise(r => setTimeout(r, 2000));
        setIsSimulating(false);
    };

    return (
        <div className="min-h-screen bg-[#050510] text-slate-200 font-sans selection:bg-cyan-500/30 font-display">
            {/* Header */}
            <header className="border-b border-white/5 bg-black/40 backdrop-blur-xl sticky top-0 z-50">
                <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center">
                            <Zap className="w-5 h-5 text-white" />
                        </div>
                        <h1 className="text-xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                            YANG-MILLS LABORATORY
                        </h1>
                        <Badge variant="outline" className="ml-2 border-cyan-500/20 text-cyan-400 text-[10px]">
                            2026 AUDIT: X(2370)
                        </Badge>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-6 py-8">
                {/* Stage Navigator */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <button
                        onClick={() => setActivePhase('crisis')}
                        className={`p-4 rounded-xl border transition-all text-left ${activePhase === 'crisis'
                                ? 'bg-red-500/10 border-red-500/30'
                                : 'bg-white/5 border-white/10'
                            }`}
                    >
                        <ShieldAlert className={`w-5 h-5 mb-2 ${activePhase === 'crisis' ? 'text-red-400' : 'text-slate-500'}`} />
                        <h3 className="text-sm font-bold lowercase">crisis_del_continuo</h3>
                        <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider">Paradoja de Karazoupis</p>
                    </button>

                    <button
                        onClick={() => setActivePhase('evidence')}
                        className={`p-4 rounded-xl border transition-all text-left ${activePhase === 'evidence'
                                ? 'bg-cyan-500/10 border-cyan-500/30'
                                : 'bg-white/5 border-white/10'
                            }`}
                    >
                        <Beaker className={`w-5 h-5 mb-2 ${activePhase === 'evidence' ? 'text-cyan-400' : 'text-slate-500'}`} />
                        <h3 className="text-sm font-bold lowercase">evidencia_fisica</h3>
                        <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider">Resonancia X(2370) BESIII</p>
                    </button>

                    <button
                        onClick={() => setActivePhase('resolution')}
                        className={`p-4 rounded-xl border transition-all text-left ${activePhase === 'resolution'
                                ? 'bg-indigo-500/10 border-indigo-500/30'
                                : 'bg-white/5 border-white/10'
                            }`}
                    >
                        <Network className={`w-5 h-5 mb-2 ${activePhase === 'resolution' ? 'text-indigo-400' : 'text-slate-500'}`} />
                        <h3 className="text-sm font-bold lowercase">la_resolucion</h3>
                        <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider">MERA Entanglement</p>
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <div className="lg:col-span-3 space-y-6">
                        <AnimatePresence mode="wait">
                            {activePhase === 'crisis' && (
                                <motion.div
                                    key="crisis"
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.98 }}
                                    className="space-y-6"
                                >
                                    <KarazoupisParadox />

                                    <Card className="p-6 bg-red-500/5 border-red-500/20">
                                        <h4 className="text-[10px] font-bold text-red-400 mb-3 uppercase tracking-[0.2em] flex items-center gap-2">
                                            <ShieldAlert className="w-4 h-4" /> AUDIT_LOG: AX_OS_VACUUM_COLLAPSE
                                        </h4>
                                        <p className="text-sm leading-relaxed text-slate-300">
                                            La representación espectral en el continuo ($\mathbb{R}^4$) es incompatible con la libertad asintótica logarítmica. 
                                            Para preservar el Gap de Masa ($\Delta > 0$), el continuo debe emerger de una red discreta.
                                        </p>
                                    </Card>
                                </motion.div>
                            )}

                            {activePhase === 'evidence' && (
                                <motion.div
                                    key="evidence"
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.98 }}
                                    className="space-y-6"
                                >
                                    <div className="aspect-video rounded-3xl bg-black/60 border border-cyan-500/20 relative overflow-hidden flex items-center justify-center p-8">
                                        <GlueballSpectrum />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Card className="p-5 bg-cyan-500/5 border-cyan-500/20">
                                            <Badge className="bg-cyan-500/20 text-cyan-400 mb-2 font-display uppercase tracking-widest text-[10px]">PSEUDOSCALAR 0-+</Badge>
                                            <p className="text-3xl font-black text-white tracking-tighter">2395 <span className="text-sm text-slate-500 font-normal">MeV</span></p>
                                            <p className="text-[10px] text-slate-400 mt-2 uppercase tracking-wider">BESIII X(2370) Candidate</p>
                                        </Card>
                                        <Card className="p-5 bg-white/5 border-white/10 opacity-60">
                                            <Badge variant="outline" className="border-slate-700 text-slate-500 mb-2 font-display uppercase tracking-widest text-[10px]">SCALAR 0++</Badge>
                                            <p className="text-3xl font-black text-slate-400 tracking-tighter">~1710 <span className="text-sm text-slate-600 font-normal">MeV</span></p>
                                            <p className="text-[10px] text-slate-500 mt-2 uppercase tracking-wider">Mixed Meson State</p>
                                        </Card>
                                    </div>
                                </motion.div>
                            )}

                            {activePhase === 'resolution' && (
                                <motion.div
                                    key="resolution"
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.98 }}
                                    className="space-y-6"
                                >
                                    <div className="aspect-video rounded-3xl bg-black/60 border border-indigo-500/20 relative overflow-hidden">
                                        <MERARenormalization />
                                    </div>

                                    <Card className="p-6 bg-indigo-500/10 border-indigo-500/20">
                                        <div className="flex items-start gap-5">
                                            <div className="p-3 rounded-xl bg-indigo-500/20 text-indigo-400">
                                                <Network className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-white mb-2 uppercase tracking-widest text-xs">Entanglement Renormalization</h4>
                                                <p className="text-sm text-slate-400 leading-relaxed">
                                                    El Gap de Masa ($\Delta$) emerge como el coste computacional del entrelazamiento cuántico.
                                                    La masa es la métrica de complejidad del espacio-tiempo emergente.
                                                </p>
                                            </div>
                                        </div>
                                    </Card>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <Card className="p-5 bg-white/5 border-white/10">
                            <h3 className="text-[10px] font-bold text-slate-400 mb-5 uppercase tracking-[0.25em] flex items-center gap-2">
                                <Database className="w-3 h-3 text-cyan-500" /> CORE_YM_ENGINE
                            </h3>
                            <div className="grid gap-2">
                                <Button variant="ghost" className="w-full justify-between text-[11px] h-10 border border-white/5 font-mono group">
                                    <span className="flex items-center gap-2 text-slate-400 group-hover:text-cyan-400 transition-colors">
                                        <Binary className="w-3 h-3" /> Two-Level Algo
                                    </span>
                                    <ArrowRight className="w-3 h-3" />
                                </Button>
                                <Button
                                    onClick={runAxiomCheck}
                                    disabled={isSimulating}
                                    variant="ghost"
                                    className="w-full justify-between text-[11px] h-10 border border-white/5 font-mono group"
                                >
                                    <span className="flex items-center gap-2 text-slate-400 group-hover:text-red-400 transition-colors">
                                        <ShieldAlert className="w-3 h-3" /> Axiom Auditor
                                    </span>
                                    {isSimulating ? <Activity className="w-3 h-3 animate-spin text-red-500" /> : <ArrowRight className="w-3 h-3" />}
                                </Button>
                            </div>
                        </Card>

                        <Card className="p-5 bg-white/5 border-white/10 relative overflow-hidden">
                            <div className="absolute -top-4 -right-4 w-12 h-12 bg-indigo-500/10 blur-xl rounded-full" />
                            <h3 className="text-[10px] font-bold text-slate-500 mb-4 uppercase tracking-[0.2em] flex items-center gap-2">
                                <FileText className="w-3 h-3" /> PAPER_V2026.TEX
                            </h3>
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <div className="flex justify-between text-[9px] uppercase tracking-tighter">
                                        <span className="text-slate-500">Evidence Audit</span>
                                        <span className="text-cyan-400">100%</span>
                                    </div>
                                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                        <div className="w-full h-full bg-cyan-500" />
                                    </div>
                                </div>
                                <Button className="w-full h-8 text-[10px] bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg">
                                    VER MANUSCRITO
                                </Button>
                            </div>
                        </Card>

                        <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 to-black border border-white/10 group cursor-pointer">
                            <Search className="w-8 h-8 text-slate-600 mb-4 group-hover:text-cyan-400 transition-colors" />
                            <h4 className="text-sm font-bold text-white mb-1">Guerra de Pruebas</h4>
                            <p className="text-[10px] text-slate-500 uppercase tracking-tighter leading-tight">
                                Arbitraje en tiempo real: Discreto vs Continuo.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default YangMills;
