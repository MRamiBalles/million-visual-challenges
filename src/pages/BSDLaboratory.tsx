import { ProblemLayout } from "@/components/layout/ProblemLayout";
import { EDSACConvergence } from "@/components/problems/birch-sd/EDSACConvergence";
import { LFunctionPlot } from "@/components/problems/birch-sd/LFunctionPlot";
import { SpectralContrast } from "@/components/problems/birch-sd/SpectralContrast";
import { SpectralLandscape } from "@/components/problems/birch-sd/SpectralLandscape";
import { SpectralDensity } from "@/components/problems/birch-sd/SpectralDensity";
import { PrismaticIntegrity } from "@/components/problems/birch-sd/PrismaticIntegrity";
import { BirchOriginPlot } from "@/components/problems/birch-sd/BirchOriginPlot";
import { RankDistributionPie } from "@/components/problems/birch-sd/RankDistributionPie";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Microscope, History, Zap, ShieldCheck, AlertCircle, CheckCircle2, FlaskConical, Shield, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";
import verificationData from "@/data/iran_verification.json";

const BSDLaboratory = () => {
    return (
        <ProblemLayout slug="birch-sd">
            <div className="space-y-12 mt-12 mb-20 animate-in fade-in duration-700">
                {/* Header Section */}
                <div className="text-center max-w-4xl mx-auto space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-mono uppercase tracking-[0.2em]">
                        <Microscope className="w-3 h-3" />
                        Verification Environment v2.0
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-white via-white to-white/40 bg-clip-text text-transparent">
                        BSD Verification Laboratory
                    </h1>
                    <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                        Entorno experimental para la contrastación de la aritmética clásica de curvas elípticas
                        contra las nuevas teorías espectrales y prismáticas (2024-2025).
                    </p>
                </div>

                <Tabs defaultValue="spectral" className="w-full">
                    <div className="flex justify-center mb-10">
                        <TabsList className="bg-black/60 border border-white/10 p-1 rounded-xl">
                            <TabsTrigger value="historical" className="inline-flex items-center gap-2 px-6">
                                <History className="w-4 h-4" />
                                Base Histórica
                            </TabsTrigger>
                            <TabsTrigger value="spectral" className="inline-flex items-center gap-2 px-6">
                                <Zap className="w-4 h-4 text-purple-400" />
                                Rama Espectral
                            </TabsTrigger>
                            <TabsTrigger value="report" className="inline-flex items-center gap-2 px-6">
                                <ShieldCheck className="w-4 h-4 text-green-400" />
                                Reporte
                            </TabsTrigger>
                            <TabsTrigger value="prismatic" className="inline-flex items-center gap-2 px-6">
                                <Shield className="w-4 h-4 text-cyan-400" />
                                Prismatic
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="historical" className="space-y-8 animate-in slide-in-from-left-4 duration-500">
                        <BirchOriginPlot />
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <EDSACConvergence />
                            <LFunctionPlot />
                        </div>
                    </TabsContent>

                    <TabsContent value="spectral" className="space-y-8 animate-in zoom-in-95 duration-500">
                        <SpectralContrast />

                        {/* Hamiltonian Landscape */}
                        <SpectralLandscape />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                            <div className="p-6 bg-purple-500/5 rounded-2xl border border-purple-500/20">
                                <h3 className="text-lg font-bold text-white mb-2">Hamiltoniano de Whittaker</h3>
                                <p className="text-sm text-white/50 leading-relaxed">
                                    En este enfoque, la curva elíptica se trata como una partícula en un potencial logarítmico.
                                    El rango analítico surge como el autovalor fundamental del sistema.
                                </p>
                                <Badge variant="outline" className="mt-4 border-purple-500/30 text-purple-300">
                                    Source: Whittaker 2025
                                </Badge>
                            </div>
                            <div className="p-6 bg-blue-500/5 rounded-2xl border border-blue-500/20">
                                <h3 className="text-lg font-bold text-white mb-2">Fórmula de Irán (Matak 2025)</h3>
                                <p className="text-sm text-white/50 leading-relaxed">
                                    Candidato teórico para la unificación analítico-aritmética. El laboratorio detectó un factor residual de 2.0 en Rango 2, sugiriendo la necesidad de refinamiento en factores de Tamagawa locales.
                                </p>
                                <Badge variant="outline" className="mt-4 border-blue-500/30 text-blue-300">
                                    Status: Proposed Framework under Calibration
                                </Badge>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="report" className="animate-in slide-in-from-right-4 duration-500">
                        <div className="max-w-4xl mx-auto space-y-8">
                            <div className="flex items-center justify-between border-b border-white/10 pb-4">
                                <h2 className="text-2xl font-bold">Auditoría de Inconsistencias Aritméticas</h2>
                                <Badge variant="outline" className="gap-2 border-yellow-500/30 text-yellow-400">
                                    <FlaskConical className="w-3 h-3" />
                                    Fase 2: Datos Experimentales
                                </Badge>
                            </div>

                            <div className="grid gap-4">
                                {Object.values(verificationData).map((result: any) => (
                                    <div
                                        key={result.label}
                                        className={`p-5 rounded-xl border flex flex-col md:flex-row gap-4 items-start md:items-center justify-between transition-all ${result.status === "PASS"
                                            ? "bg-green-500/5 border-green-500/20 hover:bg-green-500/10"
                                            : "bg-yellow-500/5 border-yellow-500/20 hover:bg-yellow-500/10"
                                            }`}
                                    >
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-3">
                                                <Badge className={`font-mono ${result.status === "PASS" ? "bg-green-500/20 text-green-300" : "bg-yellow-500/20 text-yellow-300"
                                                    }`}>
                                                    {result.label}
                                                </Badge>
                                                <span className="text-xs text-muted-foreground uppercase tracking-wider font-bold">
                                                    Rango {result.rank}
                                                </span>
                                            </div>
                                            <p className="text-sm text-white/70">
                                                {result.details}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-6 min-w-[200px]">
                                            <div className="flex flex-col items-end">
                                                <span className="text-[10px] text-white/40 uppercase">Ratio Calculado</span>
                                                <span className={`font-mono font-bold ${result.status === "PASS" ? "text-green-400" : "text-yellow-400"
                                                    }`}>
                                                    {result.ratio.toFixed(5)}
                                                </span>
                                            </div>
                                            <div className={`p-2 rounded-full ${result.status === "PASS" ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"
                                                }`}>
                                                {result.status === "PASS" ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
                                <RankDistributionPie />
                                <div className="p-8 bg-black/60 rounded-2xl border border-white/10 flex flex-col justify-center">
                                    <h3 className="text-xl font-bold text-white mb-4">Vindicación Estadística (2025)</h3>
                                    <p className="text-sm text-white/50 leading-relaxed mb-4">
                                        Alexander Smith demostró que los rangos altos son anomalías estadísticas.
                                        El 100% de las curvas siguen la distribución de Goldfeld.
                                    </p>
                                    <div className="p-4 bg-purple-500/10 rounded-xl border border-purple-500/20 italic text-[10px] text-purple-400">
                                        "Este resultado cierra la brecha entre la intuición original de Birch y la realidad asintótica del universo de las curvas elípticas."
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="prismatic" className="space-y-8 animate-in zoom-in-95 duration-500">
                        <SpectralDensity />
                        <PrismaticIntegrity />
                    </TabsContent>
                </Tabs>
            </div>
        </ProblemLayout>
    );
};

export default BSDLaboratory;
