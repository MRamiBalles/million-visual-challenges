import { motion } from "framer-motion";
import { History, Calculator, Cpu, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export type RiemannEra = "foundations" | "chaos" | "compute" | "verification";

interface RiemannEraTimelineProps {
    currentEra: RiemannEra;
    onEraChange: (era: RiemannEra) => void;
}

const eras: { id: RiemannEra; label: string; year: string; icon: any; description: string }[] = [
    {
        id: "foundations",
        label: "Fundación",
        year: "1859 - 1914",
        icon: History,
        description: "Desde el paper original de Riemann hasta el Teorema de los Números Primos."
    },
    {
        id: "chaos",
        label: "Caos Espectral",
        year: "1970s - 2000s",
        icon: Cpu, // Using Cpu as placeholder for "Physics/Chaos" or maybe Activity/Zap
        description: "Montgomery-Odlyzko, Matrices Aleatorias (GUE) y la conexión con el Caos Cuántico."
    },
    {
        id: "compute",
        label: "Era Computacional",
        year: "2004 - 2024",
        icon: Calculator,
        description: "Odlyzko, Hiary y la verificación numérica de 10^13 ceros."
    },
    {
        id: "verification",
        label: "Revolución (Verificación)",
        year: "2025 - 2026",
        icon: ShieldCheck,
        description: "Lean 4, IA Causal (Wu), Escáner de Valles (Orellana) y Morfismos Extendidos."
    }
];

export const RiemannEraTimeline = ({ currentEra, onEraChange }: RiemannEraTimelineProps) => {
    return (
        <div className="w-full mb-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {eras.map((era) => {
                    const isActive = currentEra === era.id;
                    const Icon = era.icon;

                    return (
                        <motion.button
                            key={era.id}
                            onClick={() => onEraChange(era.id)}
                            className={cn(
                                "relative overflow-hidden p-4 rounded-xl border text-left transition-all duration-300",
                                isActive
                                    ? "bg-indigo-500/20 border-indigo-500/50 shadow-[0_0_30px_rgba(99,102,241,0.15)]"
                                    : "bg-black/20 border-white/5 hover:bg-white/5 hover:border-white/10"
                            )}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="activeEraGlow"
                                    className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent"
                                    initial={false}
                                    transition={{ duration: 0.3 }}
                                />
                            )}

                            <div className="relative z-10 flex flex-col h-full justify-between gap-3">
                                <div className="flex justify-between items-start">
                                    <div className={cn("p-2 rounded-lg", isActive ? "bg-indigo-500/20 text-indigo-300" : "bg-white/5 text-white/40")}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <span className={cn("text-xs font-mono font-bold", isActive ? "text-indigo-300" : "text-white/20")}>
                                        {era.year}
                                    </span>
                                </div>

                                <div>
                                    <h3 className={cn("font-bold mb-1 transition-colors", isActive ? "text-white" : "text-white/60")}>
                                        {era.label}
                                    </h3>
                                    <p className="text-[10px] text-white/40 leading-relaxed line-clamp-3">
                                        {era.description}
                                    </p>
                                </div>
                            </div>
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
};
