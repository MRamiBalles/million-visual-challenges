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
            if (currentStepIdx < sourceSteps.length) {
                const timer = setTimeout(() => {
                    setSteps(prev => [...prev, sourceSteps[currentStepIdx]]);
                    setCurrentStepIdx(prev => prev + 1);
                }, 800);
                return () => clearTimeout(timer);
            } else if (isNP) {
                // Infinite loop for NP
                const timer = setTimeout(() => {
                    setCurrentStepIdx(0);
                    setSteps([]);
                }, 2000);
                return () => clearTimeout(timer);
            } else {
                setIsRunning(false);
            }
        }
    }, [isRunning, currentStepIdx, isNP]);

    return (
        <Card className="bg-slate-950 border-purple-500/30 overflow-hidden">
            <CardHeader className="bg-purple-900/20 border-b border-purple-500/20 pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-md flex items-center gap-2 text-purple-300 font-mono">
                        <Terminal className="w-4 h-4" />
                        Metamathematics: The Refuter Game
                    </CardTitle>
                    <Badge variant="outline" className="text-[10px] bg-purple-500/10 text-purple-400 border-purple-500/30">
                        rwPHP(PLS)
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="p-4">
                <div className="flex gap-2 mb-4">
                    <Button
                        variant={!isNP ? "secondary" : "outline"}
                        size="sm"
                        className="text-[10px] h-7"
                        onClick={() => { setIsNP(false); setIsRunning(false); setSteps([]); }}
                    >
                        2-SAT (P)
                    </Button>
                    <Button
                        variant={isNP ? "secondary" : "outline"}
                        size="sm"
                        className="text-[10px] h-7"
                        onClick={() => { setIsNP(true); setIsRunning(false); setSteps([]); }}
                    >
                        3-SAT (NP)
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-cyan-400 h-7 ml-auto"
                        onClick={startGame}
                        disabled={isRunning}
                    >
                        <Play className="w-3 h-3 mr-1" /> Ejecutar
                    </Button>
                </div>

                <div className="bg-black/60 rounded border border-white/5 p-3 min-h-[160px] font-mono text-[11px]">
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
                </div>

                <div className="mt-3 p-2 bg-yellow-500/5 rounded border border-yellow-500/20 text-[10px] text-yellow-200/70">
                    <div className="flex gap-2">
                        <AlertTriangle className="w-4 h-4 shrink-0 text-yellow-500" />
                        <p>
                            <strong>Fundamento:</strong> En 2-SAT, la refutación es decidible en tiempo lineal.
                            En 3-SAT (NP-completo), la búsqueda de fallos en demostraciones falsas (rwPHP) exhibe una complejidad exponencial, ilustrando la barrera entre $\mathsf{P}$ y $\mathsf{TFNP}$.
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
