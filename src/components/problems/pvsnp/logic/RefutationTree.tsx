import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Terminal, Play, RotateCcw, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProofStep {
    id: number;
    text: string;
    isError: boolean;
}

const P_PROOF_STEPS: ProofStep[] = [
    { id: 1, text: "Iniciando verificación de certificado...", isError: false },
    { id: 2, text: "Analizando grafo de implicación (2-SAT)", isError: false },
    { id: 3, text: "Identificando ciclos de contradicción...", isError: false },
    { id: 4, text: "Contradicción detectada: x1 ∧ ¬x1", isError: true },
    { id: 5, text: "Refutación completa: El sistema no tiene solución.", isError: false },
];

const NP_PROOF_STEPS: ProofStep[] = [
    { id: 1, text: "Iniciando algoritmo de búsqueda PLS...", isError: false },
    { id: 2, text: "Explorando árbol de resolución rwPHP...", isError: false },
    { id: 3, text: "Moviéndose a mínimo local...", isError: false },
    { id: 4, text: "Calculando descenso de gradiente discreto...", isError: false },
    { id: 5, text: "Error: Ciclo infinito detectado en rwPHP.", isError: true },
    { id: 6, text: "Reiniciando búsqueda... (Exponencial)", isError: false },
];

export function RefutationTree() {
    const [isNP, setIsNP] = useState(true);
    const [isRestricted, setIsRestricted] = useState(false);
    const [steps, setSteps] = useState<ProofStep[]>([]);
    const [isRunning, setIsRunning] = useState(false);
    const [currentStepIdx, setCurrentStepIdx] = useState(0);

    const startGame = () => {
        setIsRunning(true);
        setSteps([]);
        setCurrentStepIdx(0);
    };

    useEffect(() => {
        if (isRunning) {
            const sourceSteps = isNP ? NP_PROOF_STEPS : P_PROOF_STEPS;

            // If restricted, we might skip some intermediate steps or add restriction logs
            if (isRestricted && currentStepIdx === 0) {
                setSteps([{ id: 0, text: "Aplicando restricción aleatoria ρ...", isError: false }]);
                // For P, move faster to the end
            }

            if (currentStepIdx < sourceSteps.length) {
                const delay = isRestricted && !isNP ? 400 : 800;
                const timer = setTimeout(() => {
                    const nextStep = sourceSteps[currentStepIdx];

                    // If restricted and P, we might "detect" the error immediately after first checks
                    if (isRestricted && !isNP && currentStepIdx === 2) {
                        setSteps(prev => [...prev, { id: 99, text: "ρ-Colapso: Contradicción inmediata en hoja simplificada.", isError: true }]);
                        setIsRunning(false);
                        return;
                    }

                    setSteps(prev => [...prev, nextStep]);
                    setCurrentStepIdx(prev => prev + 1);
                }, delay);
                return () => clearTimeout(timer);
            } else if (isNP) {
                // Infinite loop for NP
                const timeout = isRestricted ? 1500 : 2000;
                const timer = setTimeout(() => {
                    setCurrentStepIdx(0);
                    setSteps(prev => isRestricted ? [prev[0]] : []); // Keep restriction log if active
                }, timeout);
                return () => clearTimeout(timer);
            } else {
                setIsRunning(false);
            }
        }
    }, [isRunning, currentStepIdx, isNP, isRestricted]);

    return (
        <Card className="bg-slate-950 border-purple-500/30 overflow-hidden">
            <CardHeader className="bg-purple-900/20 border-b border-purple-500/20 pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-md flex items-center gap-2 text-purple-300 font-mono">
                        <Terminal className="w-4 h-4" />
                        Metamathematics: Refuter Game
                    </CardTitle>
                    <Badge variant="outline" className="text-[10px] bg-purple-500/10 text-purple-400 border-purple-500/30 font-mono">
                        rwPHP(PLS)
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="p-4">
                <div className="flex flex-wrap gap-2 mb-4">
                    <div className="flex gap-1 bg-black/40 p-1 rounded-md border border-white/10">
                        <Button
                            variant={!isNP ? "secondary" : "ghost"}
                            size="sm"
                            className="text-[10px] h-6 px-2"
                            onClick={() => { setIsNP(false); setIsRunning(false); setSteps([]); }}
                        >
                            2-SAT (P)
                        </Button>
                        <Button
                            variant={isNP ? "secondary" : "ghost"}
                            size="sm"
                            className="text-[10px] h-6 px-2"
                            onClick={() => { setIsNP(true); setIsRunning(false); setSteps([]); }}
                        >
                            3-SAT (NP)
                        </Button>
                    </div>

                    <Button
                        variant={isRestricted ? "secondary" : "outline"}
                        size="sm"
                        className={`text-[10px] h-7 px-2 ${isRestricted ? 'bg-orange-500/20 text-orange-400 border-orange-500/50' : ''}`}
                        onClick={() => { setIsRestricted(!isRestricted); setIsRunning(false); setSteps([]); }}
                    >
                        <Search className="w-3 h-3 mr-1" /> Restricción ρ
                    </Button>

                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-cyan-400 h-7 ml-auto border border-cyan-500/30 hover:bg-cyan-500/10"
                        onClick={startGame}
                        disabled={isRunning}
                    >
                        <Play className="w-3 h-3 mr-1" /> Ejecutar
                    </Button>
                </div>

                <div className="bg-black/60 rounded border border-white/5 p-3 min-h-[160px] font-mono text-[11px] relative">
                    <AnimatePresence>
                        {steps.map((step, idx) => (
                            <motion.div
                                key={`${step.id}-${idx}`}
                                initial={{ opacity: 0, x: -5 }}
                                animate={{ opacity: 1, x: 0 }}
                                className={`mb-1 flex items-start gap-2 ${step.isError ? 'text-red-400' : 'text-purple-200'}`}
                            >
                                <Search className={`w-3 h-3 mt-0.5 ${step.isError ? 'animate-pulse' : ''}`} />
                                <span>{step.text}</span>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    {isRunning && (
                        <div className="flex items-center gap-1 mt-2 text-purple-400">
                            <span className="w-1 h-1 bg-purple-400 rounded-full animate-bounce" />
                            <span className="w-1 h-1 bg-purple-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                            <span className="w-1 h-1 bg-purple-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                        </div>
                    )}

                    {isRestricted && !isRunning && steps.length === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                            <div className="text-[40px] font-bold text-orange-500">ρ</div>
                        </div>
                    )}
                </div>

                <div className="mt-3 p-2 bg-purple-500/5 rounded border border-purple-500/20 text-[10px] text-purple-200/70 leading-tight">
                    <div className="flex gap-2">
                        <AlertTriangle className="w-4 h-4 shrink-0 text-purple-500" />
                        <p>
                            <strong>Cápsula rwPHP:</strong> La restricción aleatoria simplifica el árbol. Un problema en P colapsa y revela el error de inmediato. Un problema en NP resiste la simplificación, atrapando al refutador en ciclos locales inútiles (Haken/Razborov argument).
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export default RefutationTree;
