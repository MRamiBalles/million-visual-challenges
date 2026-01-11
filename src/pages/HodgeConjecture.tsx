import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Terminal as TerminalIcon, Cpu, Code, Database, Search, ShieldCheck, RefreshCw } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useMillenniumProblem } from "@/hooks/useMillenniumProblem";
import { useUserProgress } from "@/hooks/useUserProgress";
import { useActivityTracker } from "@/hooks/useActivityTracker";
import { millenniumProblems } from "@/data/millennium-problems";
import { NodeSurgeryVisualizer } from "@/components/problems/hodge/NodeSurgeryVisualizer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";

const HodgeConjecture = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<"terminal" | "visualizer" | "docs">("terminal");
    const [terminalLines, setTerminalLines] = useState<string[]>([]);
    const [isCalculating, setIsCalculating] = useState(false);

    const { data: problemData, isLoading } = useMillenniumProblem("hodge");
    const problem = problemData || millenniumProblems.find(p => p.slug === "hodge")!;

    useActivityTracker("hodge", "terminal_research");

    // Simulación del ciclo "Reason-Code-Observe" para la Simulación de Estrés
    const runInference = async () => {
        setIsCalculating(true);
        const steps = [
            "> [PLAN] Solicitud: Cirugía Nodal para clase alpha = h + 3v1 - 4v2...",
            "> [THOUGHT] Calculando número de nodos k = |3| + |-4| = 7.",
            "> [CHECK] Verificando límite de Mounda: 7 <= 10 (Cuártica). OK.",
            "> [CODE] Generando script para sistema ⟨alpha, gamma_i⟩ = -2m_i...",
            "> [EXEC] Ejecutando solver en Docker Sandbox (scipy.linalg)...",
            "> [OBSERVE] Matriz de intersección NO singular. 7 Nodos localizados en p_1...p_7.",
            "> [FINAL] Transfiriendo coordenadas de nodos al BatchedMesh Shader."
        ];

        for (const step of steps) {
            setTerminalLines(prev => [...prev, step]);
            await new Promise(r => setTimeout(r, 800));
        }
        setIsCalculating(false);
        setActiveTab("visualizer");
    };

    if (isLoading) {
        return <div className="min-h-screen bg-[#050505] p-24"><Skeleton className="h-full w-full opacity-10" /></div>;
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-cyan-500/30">
            {/* Header Técnico */}
            <header className="border-b border-white/5 bg-black/80 backdrop-blur-xl sticky top-0 z-50">
                <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Button variant="ghost" onClick={() => navigate("/")} className="text-white/40 hover:text-white">
                            <ArrowLeft className="w-4 h-4 mr-2" /> EXIT_CORE
                        </Button>
                        <div className="h-4 w-[1px] bg-white/10" />
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="border-cyan-500/30 text-cyan-400 bg-cyan-500/5">
                                HODGE_CONJECTURE_V2026
                            </Badge>
                            <span className="text-[10px] font-mono text-white/20">AGENT_MATH_CONNECTED</span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-6 py-12">
                {/* Intro Section */}
                <div className="mb-12">
                    <h1 className="text-6xl font-black mb-4 tracking-tighter">
                        CONJETURA DE <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-600">HODGE</span>
                    </h1>
                    <p className="text-white/40 max-w-2xl font-mono text-sm uppercase tracking-widest">
                        Terminal de Investigación Ejecutable: Geometría Algebraica, Ciclos y Cohomología.
                    </p>
                </div>

                {/* Tabs Navigation */}
                <div className="flex gap-1 mb-8 bg-white/5 p-1 rounded-lg w-fit">
                    {[
                        { id: "terminal", icon: <TerminalIcon className="w-4 h-4" />, label: "RAZONAMIENTO" },
                        { id: "visualizer", icon: <Cpu className="w-4 h-4" />, label: "VISUALIZADOR_3D" },
                        { id: "docs", icon: <Database className="w-4 h-4" />, label: "RECURSOS_RAG" }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all text-xs font-bold font-mono ${activeTab === tab.id
                                ? "bg-cyan-500 text-black shadow-lg shadow-cyan-500/20"
                                : "text-white/40 hover:text-white/60 hover:bg-white/5"
                                }`}
                        >
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <AnimatePresence mode="wait">
                    {activeTab === "terminal" && (
                        <motion.div
                            key="terminal"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
                        >
                            <Card className="lg:col-span-2 bg-[#0a0a0a] border-white/5 p-6 font-mono text-xs overflow-hidden h-[500px] flex flex-col shadow-2xl">
                                <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-4">
                                    <div className="flex gap-2">
                                        <div className="w-2 h-2 rounded-full bg-red-500/50" />
                                        <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
                                        <div className="w-2 h-2 rounded-full bg-green-500/50" />
                                    </div>
                                    <span className="text-white/20">AGENT_REASONING_ENGINE_V1</span>
                                </div>
                                <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-4">
                                    <div className="text-cyan-500">Welcome to Hodge Terminal. Waiting for instruction...</div>
                                    {terminalLines.map((line, i) => (
                                        <div key={i} className={line.startsWith("> [OBS") ? "text-green-400" : "text-white/60"}>
                                            {line}
                                        </div>
                                    ))}
                                    {isCalculating && (
                                        <div className="flex items-center gap-2 text-white/30 italic">
                                            <RefreshCw className="w-3 h-3 animate-spin" /> Procesando petición...
                                        </div>
                                    )}
                                </div>
                                <div className="mt-4 pt-4 border-t border-white/5 flex gap-4">
                                    <input
                                        type="text"
                                        placeholder="Ej: Calcula la cirugía de nodos para clase h + 2v1"
                                        className="bg-transparent flex-1 outline-none text-cyan-400 placeholder:text-white/10"
                                        onKeyDown={(e) => e.key === 'Enter' && runInference()}
                                    />
                                    <Button size="sm" onClick={runInference} disabled={isCalculating} className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold">
                                        EJECUTAR
                                    </Button>
                                </div>
                            </Card>

                            <div className="space-y-6">
                                <Card className="bg-gradient-to-br from-indigo-500/10 to-transparent border-indigo-500/20 p-6">
                                    <h3 className="text-indigo-400 font-bold text-sm mb-4 flex items-center gap-2">
                                        <ShieldCheck className="w-4 h-4" /> VERIFICACIÓN FORMAL
                                    </h3>
                                    <p className="text-[10px] text-white/40 font-mono leading-relaxed mb-6">
                                        Cualquier script generado es validado via SymPyBench contra la correspondencia de De Rham.
                                    </p>
                                    <div className="space-y-2">
                                        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                            <div className="h-full w-[85%] bg-indigo-500" />
                                        </div>
                                        <div className="flex justify-between text-[8px] font-mono text-white/20 uppercase">
                                            <span>PRECISIÓN SIMBÓLICA</span>
                                            <span>85% (RETOOL_SCORE)</span>
                                        </div>
                                    </div>
                                </Card>
                                <Card className="bg-black/40 border-white/5 p-6 h-fit">
                                    <h4 className="text-[10px] font-mono text-white/20 uppercase mb-4 tracking-tighter">Últimas Consultas</h4>
                                    <div className="space-y-3">
                                        {['Degeneración de Mounda', 'Cohomología de K3', 'Ciclos de Hodge Curvas'].map(t => (
                                            <div key={t} className="text-[10px] py-2 px-3 bg-white/5 rounded hover:bg-white/10 cursor-pointer transition-colors border border-white/5 text-white/60">
                                                {t}
                                            </div>
                                        ))}
                                    </div>
                                </Card>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === "visualizer" && (
                        <motion.div
                            key="visualizer"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.02 }}
                        >
                            <NodeSurgeryVisualizer />
                        </motion.div>
                    )}

                    {activeTab === "docs" && (
                        <motion.div
                            key="docs"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
                        >
                            {[
                                { title: "Hodge (1950)", author: "W. Hodge", year: 1950, color: "blue" },
                                { title: "Node Surgery", author: "Mounda", year: 2025, color: "cyan" },
                                { title: "Fredholm Det", author: "Shimizu", year: 2025, color: "indigo" },
                                { title: "RAG Docs", author: "MVC System", year: 2026, color: "green" }
                            ].map((doc, i) => (
                                <Card key={i} className="p-4 bg-black/40 border-white/5 hover:border-cyan-500/30 transition-all group cursor-pointer">
                                    <div className={`w-1 h-8 bg-${doc.color}-500 mb-4`} />
                                    <h4 className="text-xs font-bold mb-1">{doc.title}</h4>
                                    <div className="text-[10px] text-white/30 font-mono italic">{doc.author} ({doc.year})</div>
                                    <Search className="w-3 h-3 text-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity mt-4" />
                                </Card>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            <footer className="border-t border-white/5 py-8 mt-24">
                <div className="container mx-auto px-6 text-center text-white/20 text-[10px] font-mono tracking-widest uppercase">
                    Million Visual Challenges // Hodge Conjecture // Agentic Math Core
                </div>
            </footer>
        </div>
    );
};

export default HodgeConjecture;
