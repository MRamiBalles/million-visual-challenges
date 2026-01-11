import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, AlertTriangle, CheckCircle2, Zap } from "lucide-react";
import { motion } from "framer-motion";
import curvesData from "@/data/curves.json";
import verificationData from "@/data/iran_verification.json";

/**
 * PrismaticIntegrity: Defect Detector for BSD Arithmetic
 * 
 * Compares:
 * 1. Analytic Value: L^(r)(E,1) / (r! · Ω_E · R_E)
 * 2. Algebraic Value: Π c_p · |Sha|_conjectural
 * 
 * The "Integrity Defect" reveals normalization issues that
 * Prismatic/Syntomic cohomology aims to resolve.
 */

type CurveKey = "496a1" | "32a3" | "389a1";

const curveColors: Record<CurveKey, { primary: string; glow: string }> = {
    "496a1": { primary: "#f59e0b", glow: "rgba(245, 158, 11, 0.3)" },
    "32a3": { primary: "#22c55e", glow: "rgba(34, 197, 94, 0.3)" },
    "389a1": { primary: "#a855f7", glow: "rgba(168, 85, 247, 0.4)" },
};

export const PrismaticIntegrity = () => {
    const [selectedCurve, setSelectedCurve] = useState<CurveKey>("389a1");

    const curveData = curvesData[selectedCurve];
    const verification = (verificationData as Record<CurveKey, any>)[selectedCurve];
    const rank = curveData.rank;
    const bsd = curveData.bsd_invariants;
    const lValues = curveData.l_values;

    // Compute BSD components
    const analyticValue = useMemo(() => {
        // L^(r)(1) / r!
        if (rank === 0) return lValues.L_at_1;
        if (rank === 1) return lValues.L_prime_at_1;
        if (rank === 2) return lValues.L_double_prime_at_1 / 2; // /2!
        return 0;
    }, [lValues, rank]);

    const algebraicDenominator = useMemo(() => {
        // Ω · R · Tam / |Tors|^2
        const omega = bsd.real_period;
        const reg = rank === 0 ? 1 : bsd.regulator;
        const tam = bsd.tamagawa_product;
        const tors = bsd.torsion_order;

        return (omega * reg * tam) / (tors * tors);
    }, [bsd, rank]);

    const integrityDefect = analyticValue / algebraicDenominator;
    const expectedSha = bsd.sha_order;

    // Determine defect classification
    const defectClass = useMemo(() => {
        if (Math.abs(integrityDefect - 1.0) < 0.01) return "INTEGRAL";
        if (Math.abs(integrityDefect - 0.25) < 0.05) return "TORSION_DEFECT"; // 1/4 (p=2 square)
        if (Math.abs(integrityDefect - 4.0) < 0.5) return "TORSION_DEFECT"; // 4 (p=2 square)
        if (Math.abs(integrityDefect - 2.0) < 0.1) return "PERIOD_DEFECT"; // c_∞
        if (Math.abs(integrityDefect - 0.5) < 0.05) return "PERIOD_DEFECT"; // 1/c_∞
        return "UNKNOWN";
    }, [integrityDefect]);

    // Simplectic Test (p=2): Carmeli & Feng (2025)
    // Check if the residual defect is a square.
    const isSquareFreeDefect = useMemo(() => {
        // Simple check for common squares in BSD: 1, 4, 9, 1/4, 1/9
        const squares = [1, 4, 9, 0.25, 0.1111];
        return !squares.some(sq => Math.abs(integrityDefect - sq) < 0.05);
    }, [integrityDefect]);


    const defectColor = defectClass === "INTEGRAL" ? "green" :
        defectClass === "UNKNOWN" ? "red" : "yellow";

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-gradient-to-br from-black via-zinc-950 to-black rounded-2xl border border-white/10 shadow-2xl"
        >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Shield className="w-5 h-5 text-cyan-400" />
                        <h3 className="text-xl font-bold text-white">Detector de Integridad Prismática</h3>
                    </div>
                    <p className="text-xs text-white/40">
                        Compara el coeficiente líder analítico vs algebraico para detectar defectos de normalización.
                    </p>
                </div>
                <Tabs value={selectedCurve} onValueChange={(v) => setSelectedCurve(v as CurveKey)}>
                    <TabsList className="bg-black/60 border border-white/10">
                        <TabsTrigger value="496a1" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-300">
                            496a1 (R=0)
                        </TabsTrigger>
                        <TabsTrigger value="32a3" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-300">
                            32a3 (R=1)
                        </TabsTrigger>
                        <TabsTrigger value="389a1" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300">
                            389a1 (R=2)
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {/* Analytic Side */}
                <div className="p-4 bg-blue-500/5 rounded-xl border border-blue-500/20">
                    <span className="text-[10px] text-blue-300 uppercase tracking-wider font-bold">Lado Analítico</span>
                    <div className="mt-2 space-y-1 text-xs font-mono text-white/70">
                        <div className="flex justify-between">
                            <span>L^(r)(1)/r!</span>
                            <span className="text-white">{analyticValue.toFixed(7)}</span>
                        </div>
                    </div>
                </div>

                {/* Algebraic Side */}
                <div className="p-4 bg-purple-500/5 rounded-xl border border-purple-500/20">
                    <span className="text-[10px] text-purple-300 uppercase tracking-wider font-bold">Lado Algebraico</span>
                    <div className="mt-2 space-y-1 text-xs font-mono text-white/70">
                        <div className="flex justify-between">
                            <span>Ω·R·Tam/|T|²</span>
                            <span className="text-white">{algebraicDenominator.toFixed(7)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>|Sha| esperado</span>
                            <span className="text-white">{expectedSha}</span>
                        </div>
                    </div>
                </div>

                {/* Defect Gauge */}
                <div className={`p-4 rounded-xl border ${defectColor === "green" ? "bg-green-500/10 border-green-500/30" :
                    defectColor === "yellow" ? "bg-yellow-500/10 border-yellow-500/30" :
                        "bg-red-500/10 border-red-500/30"
                    }`}>
                    <div className="flex items-center gap-2">
                        {defectColor === "green" ? <CheckCircle2 className="w-4 h-4 text-green-400" /> :
                            <AlertTriangle className="w-4 h-4 text-yellow-400" />}
                        <span className="text-[10px] uppercase tracking-wider font-bold text-white/60">Defecto</span>
                    </div>
                    <span className={`block text-2xl font-bold font-mono mt-1 ${defectColor === "green" ? "text-green-400" :
                        defectColor === "yellow" ? "text-yellow-400" :
                            "text-red-400"
                        }`}>
                        {integrityDefect.toFixed(5)}
                    </span>
                    <span className="text-[10px] text-white/40">
                        {defectClass === "INTEGRAL" && "Integridad Perfecta"}
                        {defectClass === "TORSION_DEFECT" && "Defecto de Torsión (×4 o ÷4)"}
                        {defectClass === "PERIOD_DEFECT" && "Defecto de Periodo (c_∞)"}
                        {defectClass === "UNKNOWN" && "Defecto Desconocido"}
                    </span>
                </div>

                {/* Prismatic Action */}
                <div className={`p-4 rounded-xl border ${defectClass === "INTEGRAL"
                    ? "bg-green-500/5 border-green-500/20"
                    : "bg-cyan-500/5 border-cyan-500/20"
                    }`}>
                    <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-cyan-400" />
                        <span className="text-[10px] text-cyan-300 uppercase tracking-wider font-bold">Acción Prismática</span>
                    </div>
                    <div className="mt-2 space-y-2">
                        <p className="text-xs text-white/60 leading-relaxed">
                            {defectClass === "INTEGRAL" && "No se requiere corrección. La aritmética clásica es suficiente."}
                            {defectClass === "TORSION_DEFECT" && "Aplicar Operación de Steenrod Sintómica para corregir la dualidad de torsión (Carmeli & Feng 2025)."}
                            {defectClass === "PERIOD_DEFECT" && "El F-gauge prismático debe normalizar el periodo por componentes conexas (c_∞ = 2)."}
                            {defectClass === "UNKNOWN" && "Defecto no clasificado. Requiere análisis manual."}
                        </p>
                        {!isSquareFreeDefect && defectClass !== "INTEGRAL" && (
                            <Badge variant="outline" className="text-[9px] bg-green-500/10 text-green-400 border-green-500/20">
                                TEST P=2 PASS: RESIDUO CUADRÁTICO
                            </Badge>
                        )}
                        {isSquareFreeDefect && defectClass === "PERIOD_DEFECT" && (
                            <Badge variant="outline" className="text-[9px] bg-amber-500/10 text-amber-400 border-amber-500/20">
                                SIMPLEPTICIDAD: OK (c_∞ ≠ cuadrado)
                            </Badge>
                        )}
                    </div>
                </div>
            </div>

            {/* Component Breakdown */}
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <h4 className="text-sm font-bold text-white mb-3">Desglose de Invariantes BSD</h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs font-mono">
                    <div className="p-2 bg-black/30 rounded text-center">
                        <span className="text-white/40 block">Rango</span>
                        <span className="text-white font-bold">{rank}</span>
                    </div>
                    <div className="p-2 bg-black/30 rounded text-center">
                        <span className="text-white/40 block">Ω (Periodo)</span>
                        <span className="text-white font-bold">{bsd.real_period.toFixed(4)}</span>
                    </div>
                    <div className="p-2 bg-black/30 rounded text-center">
                        <span className="text-white/40 block">R (Regulador)</span>
                        <span className="text-white font-bold">{bsd.regulator.toFixed(4)}</span>
                    </div>
                    <div className="p-2 bg-black/30 rounded text-center">
                        <span className="text-white/40 block">|Tors|</span>
                        <span className="text-white font-bold">{bsd.torsion_order}</span>
                    </div>
                    <div className="p-2 bg-black/30 rounded text-center">
                        <span className="text-white/40 block">Π c_p</span>
                        <span className="text-white font-bold">{bsd.tamagawa_product}</span>
                    </div>
                </div>
            </div>

            {/* Theoretical Context */}
            <div className={`mt-6 p-4 rounded-xl border ${defectClass === "INTEGRAL" ? "bg-green-500/5 border-green-500/20" : "bg-cyan-500/5 border-cyan-500/20"
                }`}>
                <h4 className={`font-bold text-sm mb-1 ${defectClass === "INTEGRAL" ? "text-green-400" : "text-cyan-400"
                    }`}>
                    Contexto Teórico (Audit v2.1): Proxy Geométrico
                </h4>
                <p className="text-xs text-white/60 leading-relaxed">
                    Este motor utiliza las <strong>operaciones de Steenrod sintómicas</strong> (Carmeli & Feng 2025) como un <strong>proxy geométrico</strong>. Aunque probaron la simplecticidad para el grupo de Brauer Br(X) de superficies sobre cuerpos finitos, aquí extrapolamos la estructura a Sha(E/ℚ). La transferencia directa es condicional a la finitud de Sha y la conjetura de Tate para divisores.
                </p>
            </div>
        </motion.div>
    );
};

export default PrismaticIntegrity;
