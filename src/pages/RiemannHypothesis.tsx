import { ProblemLayout } from "@/components/layout/ProblemLayout";
import { ZetaLand } from "@/components/visualizations/ZetaLand";
import { CodePlayground } from "@/components/compute/CodePlayground";
import { PrimeDistributionVisualization } from "@/components/problems/riemann/PrimeDistributionVisualization";
import { ZetaFunctionVisualization } from "@/components/problems/riemann/ZetaFunctionVisualization";
import { CriticalLineVisualization } from "@/components/problems/riemann/CriticalLineVisualization";
import { useActivityTracker } from "@/hooks/useActivityTracker";
import { Card } from "@/components/ui/card";

const RiemannHypothesis = () => {
  useActivityTracker("riemann", "overview");

  return (
    <ProblemLayout
      slug="riemann"
      visualizer={<ZetaLand />}
    >
      <div className="space-y-16 mt-16 border-t border-border pt-16">

        {/* Intro */}
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">La Música de los Primos</h2>
          <p className="text-muted-foreground">
            Los números primos no son aleatorios; siguen una música oculta escrita en la Función Zeta.
          </p>
        </div>

        {/* Interactive Lab */}
        <Card className="p-6 bg-card/30 backdrop-blur overflow-hidden border-indigo-500/30">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span className="text-2xl">⚡</span> The Infinite Lab
          </h3>
          <p className="text-sm text-muted-foreground mb-6">
            Write Python code to analyze the Zeta function directly in your browser. Calculations run locally via WebAssembly.
          </p>
          <CodePlayground
            title="Zeta Zero Hunter"
            description="Calculate non-trivial zeros using complex analysis."
            initialCode={`# Calculate Riemann Zeta function values
import cmath

def zeta_approx(s, terms=1000):
    result = 0
    for n in range(1, terms + 1):
        result += 1 / (n ** s)
    return result

print("Calculating Zeta(2) - Basler Problem:")
z2 = zeta_approx(2)
print(f"Approx: {z2}")
print(f"Goal:   {3.14159**2 / 6}")

print("\\nSearching for zeros on critical line 0.5 + ti...")
# Simple search near t=14.13 (First zero)
t = 14.0
step = 0.01

for i in range(50):
   s = complex(0.5, t)
   val = zeta_approx(s, terms=500) 
   if abs(val) < 0.5:
       print(f"Near t={t:.2f}, |Z(s)|={abs(val):.4f}")
   t += step
`}
          />
        </Card>

        {/* Prime Distribution */}
        <Card className="p-6 bg-card/30 backdrop-blur overflow-hidden">
          <h3 className="text-xl font-bold mb-4">El Misterio de la Distribución</h3>
          <p className="text-sm text-muted-foreground mb-6">
            A simple vista, los primos aparecen sin orden. Gauss predijo su densidad (Li(x)), pero el error sigue un patrón.
          </p>
          <div className="rounded-xl border border-border bg-black/20 p-4">
            <PrimeDistributionVisualization />
          </div>
        </Card>

        {/* Zeta Function */}
        <Card className="p-6 bg-card/30 backdrop-blur overflow-hidden">
          <h3 className="text-xl font-bold mb-4">El Mapa del Tesoro: ζ(s)</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Riemann extendió la suma de Euler al plano complejo. Donde esta función se hace cero, ahí está la clave.
          </p>
          <div className="rounded-xl border border-border bg-black/20 p-4 h-[500px] flex items-center justify-center">
            <ZetaFunctionVisualization />
          </div>
        </Card>

        {/* Critical Line */}
        <Card className="p-6 bg-card/30 backdrop-blur overflow-hidden">
          <h3 className="text-xl font-bold mb-4">La Línea Crítica</h3>
          <p className="text-sm text-muted-foreground mb-6">
            La hipótesis afirma que TODOS los ceros "interesantes" caen en la línea vertical 1/2. Si uno solo está fuera, la teoría colapsa.
          </p>
          <div className="rounded-xl border border-border bg-black/20 p-4">
            <CriticalLineVisualization />
          </div>
        </Card>

      </div>
    </ProblemLayout>
  );
};

export default RiemannHypothesis;