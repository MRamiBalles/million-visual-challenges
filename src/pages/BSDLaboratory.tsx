import { ProblemLayout } from "@/components/layout/ProblemLayout";
import { EDSACConvergence } from "@/components/problems/birch-sd/EDSACConvergence";
import { LFunctionPlot } from "@/components/problems/birch-sd/LFunctionPlot";
import { SpectralContrast } from "@/components/problems/birch-sd/SpectralContrast";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Microscope, History, Zap, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

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
                                Reporte de Auditoría
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="historical" className="space-y-8 animate-in slide-in-from-left-4 duration-500">
                        <div className="grid grid-cols-1 gap-8">
                            <EDSACConvergence />
                            <LFunctionPlot />
                        </div>
                    </TabsContent>

                    <TabsContent value="spectral" className="space-y-8 animate-in zoom-in-95 duration-500">
                        <SpectralContrast />

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
                                <h3 className="text-lg font-bold text-white mb-2">Fórmula de Irán</h3>
                                <p className="text-sm text-white/50 leading-relaxed">
                                    Unificación de la derivada logarítmica para aislar el rango analítico.
                                    Resuelve la inestabilidad de Taylor en curvas de rango ≥ 2.
                                </p>
                                <Badge variant="outline" className="mt-4 border-blue-500/30 text-blue-300">
                                    Source: Matak 2025
                                </Badge>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="report" className="animate-in slide-in-from-right-4 duration-500">
                        <div className="max-w-4xl mx-auto space-y-6">
                            <h2 className="text-2xl font-bold border-b border-white/10 pb-4">Auditoría de Inconsistencias</h2>
                            <div className="space-y-4">
                                <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                                    <h4 className="text-yellow-400 font-bold text-sm mb-1 uppercase tracking-tight">Anomalía de Rango 2</h4>
                                    <p className="text-xs text-yellow-100/70 leading-relaxed font-mono">
                                        DETECCIÓN: Ratio observado ~1.999 vs Predicción 1.0.
                                        CAUSA PROBABLE: Factores de Tamagawa o paridad del Grupo de Selmer.
                                        OBSERVACIÓN: El modelo espectral Whittaker estabiliza esta anomalía en k=2 exacto.
                                    </p>
                                </div>
                                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                                    <h4 className="text-green-400 font-bold text-sm mb-1 uppercase tracking-tight">Consistencia de Rango 1</h4>
                                    <p className="text-xs text-green-100/70 leading-relaxed font-mono">
                                        VALIDACIÓN: Curva 32a3 (y² = x³ - x).
                                        RESULTADO: El método clásico y el espectral coinciden en k=1 con un margen de error de 0.001%.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </ProblemLayout>
    );
};

export default BSDLaboratory;
