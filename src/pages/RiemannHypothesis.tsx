import { useState } from "react";
import { ProblemLayout } from "@/components/layout/ProblemLayout";
import { ZetaLand } from "@/components/visualizations/ZetaLand";
import { CodePlayground } from "@/components/compute/CodePlayground";
import { PrimeDistributionVisualization } from "@/components/problems/riemann/PrimeDistributionVisualization";
import { ZetaFunctionVisualization } from "@/components/problems/riemann/ZetaFunctionVisualization";
import { CriticalLineVisualization } from "@/components/problems/riemann/CriticalLineVisualization";
import { RiemannEraTimeline, RiemannEra } from "@/components/problems/riemann/RiemannEraTimeline";
import { useActivityTracker } from "@/hooks/useActivityTracker";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";

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
                  Focus: Prime Distribution & Basic Zeta Visualization
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
                    <h3 className="text-xl font-bold mb-4">El Paisaje Zeta Clásico</h3>
                    <p className="text-sm text-muted-foreground mb-6">
                      Riemann extendió la suma de Euler al plano complejo. La hipótesis afirma que todos los ceros no triviales yacen en Re(s) = 1/2.
                    </p>
                    <div className="rounded-xl border border-white/5 bg-black/40 p-4 h-[400px] flex items-center justify-center">
                      <ZetaFunctionVisualization />
                    </div>
                  </Card>
                </div>
              </>
            )}

            {/* 
                  ERA 2: CHAOS & PHYSICS (1970s - 2000s)
                  Focus: Critical Line & GUE Connection
                */}
            {currentEra === "chaos" && (
              <div className="grid grid-cols-1 gap-6">
                <Card className="p-6 bg-card/30 backdrop-blur overflow-hidden border-indigo-500/10">
                  <h3 className="text-xl font-bold mb-4">La Conexión con el Caos Cuántico</h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    En los 70s, Montgomery y Dyson descubrieron que los ceros de Zeta se repelen entre sí exactamente como los autovalores de matrices aleatorias (GUE) usadas en física nuclear.
                  </p>
                  <div className="rounded-xl border border-white/5 bg-black/40 p-4">
                    <CriticalLineVisualization />
                  </div>
                </Card>

                <div className="p-12 border border-dashed border-white/10 rounded-xl text-center">
                  <p className="text-white/40 italic">
                    [Próximamente: Sintonizador Espectral (SpectralTuner) - Modele el Interferómetro de Riemann]
                  </p>
                </div>
              </div>
            )}

            {/* 
                  ERA 3: COMPUTATION (2004 - 2024)
                  Focus: Interactive Python Lab & High Precision
                */}
            {currentEra === "compute" && (
              <div className="space-y-6">
                <Card className="p-6 bg-card/30 backdrop-blur overflow-hidden border-indigo-500/30">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <span className="text-2xl">⚡</span> Laboratorio Computacional
                  </h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    Ejecute algoritmos de búsqueda de ceros directamente en el navegador. Utilice bibliotecas científicas para replicar los cálculos de Odlyzko.
                  </p>
                  <CodePlayground
                    title="Zeta Zero Hunter"
                    description="Calcule ceros no triviales usando el algoritmo de Euler-Maclaurin simplificado."
                    initialCode={`# Búsqueda de Ceros en la Línea Crítica
import cmath

def zeta_approx(s, terms=1000):
    result = 0
    for n in range(1, terms + 1):
        result += 1 / (n ** s)
    return result

print("Buscando primer cero cerca de t=14.13...")
t_start = 14.0
step = 0.01

for i in range(30):
   t = t_start + i*step
   s = complex(0.5, t)
   val = zeta_approx(s, terms=500) 
   if abs(val) < 0.1:
       print(f"--> DETECTADO: t={t:.2f}, |Z(s)|={abs(val):.5f}")
   else:
       pass # print(f"t={t:.2f} | {abs(val):.2f}")
`}
                  />
                </Card>

                <div className="p-12 border border-dashed border-white/10 rounded-xl text-center">
                  <p className="text-white/40 italic">
                    [Próximamente: Valley Scanner (Orellana 2025) - Topografía WebGL de Z(t)]
                  </p>
                </div>
              </div>
            )}

            {/* 
                  ERA 4: VERIFICATION REVOLUTION (2025 - 2026)
                  Focus: FormalProof & AI Falsifiability
                */}
            {currentEra === "verification" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="p-12 border border-dashed border-green-500/20 bg-green-500/5 rounded-xl text-center flex flex-col justify-center items-center h-64">
                  <ShieldCheck className="w-12 h-12 text-green-500/40 mb-4" />
                  <h4 className="text-green-400 font-bold mb-2">Formal Auditor (Washburn 2025)</h4>
                  <p className="text-white/40 italic text-sm max-w-xs">
                    Visualización del grafo de dependencias en Lean 4 y "Diff Semántico" de axiomas.
                  </p>
                </div>

                <div className="p-12 border border-dashed border-purple-500/20 bg-purple-500/5 rounded-xl text-center flex flex-col justify-center items-center h-64">
                  <Cpu className="w-12 h-12 text-purple-500/40 mb-4" />
                  <h4 className="text-purple-400 font-bold mb-2">AI Falsifiability (Wu 2025)</h4>
                  <p className="text-white/40 italic text-sm max-w-xs">
                    Mapas de calor SHAP y Teorema de Inaplicabilidad para contraejemplos.
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

      </div>
    </ProblemLayout>
  );
};

// Imports for icons used in placeholders
import { ShieldCheck, Cpu } from "lucide-react";

export default RiemannHypothesis;
