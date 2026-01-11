import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, ShieldAlert, Binary, Layers } from 'lucide-react';

export const KarazoupisParadox = () => {
    const [step, setStep] = useState(0);

    const steps = [
        { title: "Definiendo Axiomas OS", color: "text-blue-400", desc: "Positividad de Reflexión y Covarianza en R^4." },
        { title: "Aplicando Mass Gap (Δ > 0)", color: "text-cyan-400", desc: "Existencia de un estado fundamental con masa." },
        { title: "Inyectando Libertad Asintótica", color: "text-yellow-400", desc: "Comportamiento logarítmico a altas energías." },
        { title: "CONFLICTO DETECTADO", color: "text-red-500", desc: "La intersección es vacía en el continuo. Colapso del espectro." }
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setStep(s => (s + 1) % steps.length);
        }, 3000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="relative w-full h-[400px] flex items-center justify-center overflow-hidden bg-black/40 rounded-3xl border border-white/5">
            {/* Visual background circles */}
            <div className={`absolute w-64 h-64 border-2 rounded-full transition-all duration-1000 ${step >= 0 ? 'border-blue-500/20 scale-100 opacity-100' : 'scale-0 opacity-0'}`} />
            <div className={`absolute w-56 h-56 border-2 rounded-full transition-all duration-1000 ${step >= 1 ? 'border-cyan-500/20 scale-100 opacity-100' : 'scale-0 opacity-0'}`} />
            <div className={`absolute w-48 h-48 border-2 rounded-full transition-all duration-1000 ${step >= 2 ? 'border-yellow-500/20 scale-100 opacity-100' : 'scale-0 opacity-0'}`} />

            {step === 3 && (
                <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: [1, 1.2, 1], opacity: 1 }}
                    className="absolute inset-0 flex items-center justify-center bg-red-500/10 backdrop-blur-sm z-10"
                >
                    <div className="text-center font-mono">
                        <AlertTriangle className="w-16 h-12 text-red-500 mx-auto mb-2 animate-pulse" />
                        <h4 className="text-red-500 font-bold tracking-tighter text-2xl">CONTINUUM_NULL_INTERSECTION</h4>
                        <p className="text-[10px] text-red-400 mt-2 uppercase">Paradox: Mass Gap requires Discrete Information Lattice</p>
                    </div>
                </motion.div>
            )}

            <div className="z-20 text-center max-w-sm px-6">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-2"
                    >
                        <h3 className={`text-xl font-black tracking-tight ${steps[step].color}`}>
                            {steps[step].title}
                        </h3>
                        <p className="text-xs text-slate-400 font-mono italic">
                            {steps[step].desc}
                        </p>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Matrix rain effect simplified */}
            <div className="absolute top-4 left-4 flex flex-col gap-1">
                <div className="flex gap-2 items-center">
                    <div className={`w-2 h-2 rounded-full ${step >= 0 ? 'bg-blue-500' : 'bg-slate-800'}`} />
                    <span className="text-[8px] font-mono text-slate-600">AX_OS_VALID</span>
                </div>
                <div className="flex gap-2 items-center">
                    <div className={`w-2 h-2 rounded-full ${step >= 1 ? 'bg-cyan-500' : 'bg-slate-800'}`} />
                    <span className="text-[8px] font-mono text-slate-600">GAP_EXISTENCE_CHECK</span>
                </div>
                <div className="flex gap-2 items-center">
                    <div className={`w-2 h-2 rounded-full ${step >= 2 ? 'bg-yellow-500' : 'bg-slate-800'}`} />
                    <span className="text-[8px] font-mono text-slate-600">ASYMPT_FREEDOM_AUDIT</span>
                </div>
            </div>

            <div className="absolute bottom-6 flex gap-4 opacity-30">
                <Layers className="w-4 h-4 text-slate-400" />
                <Binary className="w-4 h-4 text-slate-400" />
                <ShieldAlert className="w-4 h-4 text-slate-400" />
            </div>
        </div>
    );
};

// AnimatePresence imported from framer-motion above
