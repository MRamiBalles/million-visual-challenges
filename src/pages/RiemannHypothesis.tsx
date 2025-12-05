import { ProblemLayout } from "@/components/layout/ProblemLayout";
import { ZetaLand } from "@/components/visualizations/ZetaLand";
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