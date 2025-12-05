import { ProblemLayout } from "@/components/layout/ProblemLayout";
import { TSPVisualizer } from "@/components/visualizations/TSPVisualizer";
import { ComplexityGraph } from "@/components/problems/pvsnp/ComplexityGraph";
import { TuringMachineDemo } from "@/components/problems/pvsnp/TuringMachineDemo";
import { VerificationDemo } from "@/components/problems/pvsnp/VerificationDemo";
import { useActivityTracker } from "@/hooks/useActivityTracker";
import { Card } from "@/components/ui/card";
import { useSearchParams } from "react-router-dom";

const PvsNP = () => {
  // Track page view
  useActivityTracker("pvsnp", "overview");
  const [searchParams] = useSearchParams();
  const seed = searchParams.get("seed") || undefined;

  return (
    <ProblemLayout
      slug="pvsnp"
      visualizer={<TSPVisualizer seed={seed} />}
    >
      <div className="space-y-16 mt-16 border-t border-border pt-16">

        {/* Intro Section for Deep Dives */}
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Exploración Avanzada</h2>
          <p className="text-muted-foreground">
            Más allá del Problema del Viajante, P vs NP se conecta con los fundamentos mismos de la computación.
          </p>
        </div>

        {/* Verification Demo */}
        <Card className="p-6 bg-card/30 backdrop-blur overflow-hidden">
          <h3 className="text-xl font-bold mb-4">Verificar vs Resolver</h3>
          <p className="text-sm text-muted-foreground mb-6">
            La esencia del problema: verificar una solución dada (Sudoku lleno) es rápido. Encontrarla desde cero es lento.
          </p>
          <div className="rounded-xl border border-border bg-black/20 p-4">
            <VerificationDemo />
          </div>
        </Card>

        {/* Complexity Graph */}
        <Card className="p-6 bg-card/30 backdrop-blur overflow-hidden">
          <h3 className="text-xl font-bold mb-4">El Muro Exponencial</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Visualiza cómo la complejidad O(2^n) explota comparada con O(n^2), haciendo imposibles los problemas grandes.
          </p>
          <div className="rounded-xl border border-border bg-black/20 p-4 h-[400px] flex items-center justify-center">
            <ComplexityGraph />
          </div>
        </Card>

        {/* Turing Machine */}
        <Card className="p-6 bg-card/30 backdrop-blur overflow-hidden">
          <h3 className="text-xl font-bold mb-4">La Máquina de Turing</h3>
          <p className="text-sm text-muted-foreground mb-6">
            El modelo matemático que define formalmente "cómputo". P y NP se definen sobre máquinas deterministas vs no-deterministas.
          </p>
          <div className="rounded-xl border border-border bg-black/20 p-4">
            <TuringMachineDemo />
          </div>
        </Card>

      </div>
    </ProblemLayout>
  );
};

export default PvsNP;
