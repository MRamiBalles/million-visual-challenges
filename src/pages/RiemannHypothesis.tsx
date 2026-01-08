import { useState } from "react";
import { ProblemLayout } from "@/components/layout/ProblemLayout";
import { ZetaLand } from "@/components/visualizations/ZetaLand";
import { CodePlayground } from "@/components/compute/CodePlayground";
import { PrimeDistributionVisualization } from "@/components/problems/riemann/PrimeDistributionVisualization";
import { ZetaFunctionVisualization } from "@/components/problems/riemann/ZetaFunctionVisualization";
import { CriticalLineVisualization } from "@/components/problems/riemann/CriticalLineVisualization";
import { ZetaLandscape3D } from "@/components/problems/riemann/ZetaLandscape3D";
import { SpectralTuner } from "@/components/problems/riemann/SpectralTuner";
import { ValleyScanner } from "@/components/problems/riemann/ValleyScanner";
import { FormalAuditor } from "@/components/problems/riemann/FormalAuditor";
import { AIFalsifiability } from "@/components/problems/riemann/AIFalsifiability";
import { RiemannEraTimeline, RiemannEra } from "@/components/problems/riemann/RiemannEraTimeline";
import { useActivityTracker } from "@/hooks/useActivityTracker";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Cpu } from "lucide-react";

const RiemannHypothesis = () => {
  useActivityTracker("riemann", "overview");
  const [currentEra, setCurrentEra] = useState<RiemannEra>("verification");

  return (
    <ProblemLayout
      slug="riemann"
      visualizer={<ZetaLand />}
    >
      <div className="space-y-8 mt-8 border-t border-border pt-8">

        {/* Intro Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <Badge variant="outline" className="mb-4 border-indigo-500/30 text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 px-4 py-1">
            Centro de Comando de Verificación (RH-2026)
          </Badge>
          <h2 className="text-4xl font-bold mb-4 tracking-tight text-white">
            La Hipótesis de Riemann
          </h2>
          <p className="text-lg text-white/50 leading-relaxed">
            De la intuición clásica a la verificación asistida por IA. Explore la evolución del problema matemático más importante de la historia a través de 4 eras tecnológicas.
          </p>
        </div>

        {/* Timeline Navigation */}
        <RiemannEraTimeline currentEra={currentEra} onEraChange={setCurrentEra} />

        {/* Dynamic Content Area */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentEra}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            {/* 
                  ERA 1: FOUNDATIONS (1859 - 1914)
                */}
            {currentEra === "foundations" && (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="p-6 bg-card/30 backdrop-blur overflow-hidden border-indigo-500/10">
                    <h3 className="text-xl font-bold mb-4">El Misterio de la Distribución</h3>
                    <p className="text-sm text-muted-foreground mb-6">
                      A simple vista, los primos aparecen sin orden. Gauss predijo su densidad (Li(x)), pero el error sigue un patrón exacto dictado por los ceros de Zeta.
                    </p>
                    <div className="rounded-xl border border-white/5 bg-black/40 p-4">
                      <PrimeDistributionVisualization />
                    </div>
                  </Card>

                  <Card className="p-6 bg-card/30 backdrop-blur overflow-hidden border-indigo-500/10">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                      Paisaje Zeta 3D (Reconstrucción)
                    </h3>
                    <p className="text-sm text-muted-foreground mb-6">
                      Una visualización moderna de la extensión analítica de Riemann y la topología de la franja crítica.
                    </p>
                    <div className="rounded-xl border border-white/5 bg-black/40 p-4 h-full">
                      <ZetaLandscape3D />
                    </div>
                  </Card>
                </div>
              </>
            )}

            {/* 
                  ERA 2: CHAOS & PHYSICS (1970s - 2000s)
                */}
            {currentEra === "chaos" && (
              <div className="grid grid-cols-1 gap-6">
                <Card className="p-6 bg-card/30 backdrop-blur overflow-hidden border-indigo-500/10">
                  <h3 className="text-xl font-bold mb-4">La Conexión con el Caos Cuántico</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-1 border-r border-white/5 pr-4">
                      <p className="text-sm text-muted-foreground mb-4">
                        Los ceros de Zeta se repelen entre sí como los autovalores de matrices Hermitianas aleatorias (GUE). Esta "música" coincide con los niveles de energía de núcleos pesados (Montgomery-Odlyzko).
                      </p>
                      <div className="rounded-xl border border-white/5 bg-black/40 p-4 mb-4">
                        <CriticalLineVisualization />
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <SpectralTuner />
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* 
                  ERA 3: COMPUTATION (2004 - 2024)
                */}
            {currentEra === "compute" && (
              <div className="space-y-6">
                <Card className="p-6 bg-card/30 backdrop-blur overflow-hidden border-indigo-500/30">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <span className="text-2xl">⚡</span> Laboratorio Computacional
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <CodePlayground
                      title="Zeta Zero Hunter"
                      description="Algoritmo de Euler-Maclaurin simplificado."
                      initialCode={`# Búsqueda de Ceros en la Línea Critica\nimport cmath\n\ndef zeta_approx(s, terms=100):\n    res = 0\n    for n in range(1, terms):\n        res += n**(-s)\n    return res\n\nprint("Buscando cerca de t=14.13...")\nval = zeta_approx(0.5 + 14.13j)\nprint(f"|Z| = {abs(val):.4f}")`}
                    />

                    <div className="space-y-4">
                      <div className="p-4 bg-amber-900/10 border border-amber-500/20 rounded-xl">
                        <h4 className="text-amber-400 text-sm font-bold mb-2">Scanner de Valles (Orellana 2025)</h4>
                        <p className="text-xs text-amber-200/60 mb-4">
                          Visualización topográfica de $Z(t)$ para $N \approx 10^{20}$. Detecta el "Fenómeno de Lehmer" donde pares de ceros casi violan la hipótesis.
                        </p>
                        <ValleyScanner />
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* 
                  ERA 4: VERIFICATION REVOLUTION (2025 - 2026)
                */}
            {currentEra === "verification" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="p-6 bg-card/30 backdrop-blur border-green-500/10">
                    <FormalAuditor />
                  </Card>

                  <Card className="p-6 bg-card/30 backdrop-blur border-purple-500/10">
                    <AIFalsifiability />
                  </Card>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

      </div>
    </ProblemLayout>
  );
};

export default RiemannHypothesis;
