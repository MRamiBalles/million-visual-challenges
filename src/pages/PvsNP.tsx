import { ProblemLayout } from "@/components/layout/ProblemLayout";
import { TSPVisualizer } from "@/components/visualizations/TSPVisualizer";
import { ComplexityGraph } from "@/components/problems/pvsnp/ComplexityGraph";
import { TuringMachineDemo } from "@/components/problems/pvsnp/TuringMachineDemo";
import { VerificationDemo } from "@/components/problems/pvsnp/VerificationDemo";
import { SCODashboard } from "@/components/sco/SCODashboard";
import { useActivityTracker } from "@/hooks/useActivityTracker";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ShieldCheck, BookmarkCheck, FileText, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

// Living Museum Components (2024-2025 Theories)
import { ChaoticTrajectories } from "@/components/problems/pvsnp/physics/ChaoticTrajectories";
import { KroneckerWall } from "@/components/problems/pvsnp/algebra/KroneckerWall";
import { ARECompression } from "@/components/problems/pvsnp/holography/ARECompression";
import { TopologicalHole } from "@/components/problems/pvsnp/topology/TopologicalHole";
import { CausalCone } from "@/components/problems/pvsnp/thermo/CausalCone";
import { RefutationTree } from "@/components/problems/pvsnp/logic/RefutationTree";
import { ScientificPoster } from "@/components/problems/pvsnp/ScientificPoster";


const PvsNP = () => {
  // Track page view
  useActivityTracker("pvsnp", "overview");
  const [searchParams] = useSearchParams();
  const seed = searchParams.get("seed") || undefined;

  // Phase 14.0: Cognitive Convergence - Global Experiment State
  // We lift the thermal noise state to the page level so Physics can affect Thermodynamics
  const [thermalNoise, setThermalNoise] = useState(0.1);

  // Phase 14.5: Cascading Failure State
  // When CausalCone enters Hard Decoherence, it propagates to Topology
  const [isDecoherent, setIsDecoherent] = useState(false);

  return (
    <ProblemLayout
      slug="pvsnp"
      visualizer={<TSPVisualizer seed={seed} />}
    >
      <div className="space-y-16 mt-16 border-t border-border pt-16">

        {/* Living Museum of Intractability - New 2024-2025 Theories */}
        <div>
          <div className="text-center max-w-3xl mx-auto mb-8">
            <h2 className="text-3xl font-bold mb-4">🏛️ Museo Vivo de la Intractabilidad</h2>
            <p className="text-muted-foreground">
              Análisis experimental de obstrucciones multidimensionales (2024-2025).
              Este entorno visualiza las restricciones topológicas, algebraicas y físicas que delimitan la frontera entre P y NP.
            </p>
          </div>

          {/* Row 1: Stage 1 (Physics) + Stage 2 (Algebra) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Physics: Chaotic Trajectories */}
            {/* @ts-ignore - Props temporarily mismatched during Phase 14 refactor */}
            <ChaoticTrajectories thermalNoise={thermalNoise} setThermalNoise={setThermalNoise} />

            {/* Algebra: Kronecker Wall */}
            <KroneckerWall />
          </div>

          {/* Row 2: Stage 3 (Topology) + Stage 4 (Holography) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Topology: Sheaf Obstructions - Receives Decoherence State */}
            {/* @ts-ignore - Props temporarily mismatched during Phase 14.5 refactor */}
            <TopologicalHole isDecoherent={isDecoherent} />

            {/* Holography: ARE Compression */}
            <ARECompression />
          </div>

          {/* Row 3: Stage 5 (Thermodynamics) + Stage 6 (Metamathematics) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Thermodynamics: Causal Depth - Triggers Decoherence Callback */}
            {/* @ts-ignore - Props temporarily mismatched during Phase 14.5 refactor */}
            <CausalCone thermalNoise={thermalNoise} onDecoherence={setIsDecoherent} />

            {/* Metamathematics: Refuter Game */}
            <RefutationTree />
          </div>
        </div>

        {/* SCO Dashboard - Integrated from MRamiBalles/PvsNP */}
        <div>
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h2 className="text-3xl font-bold mb-4">Structural Complexity Observatory</h2>
            <p className="text-muted-foreground">
              Monitorización de heurísticas y métricas de resolución para problemas NP-completos.
            </p>
          </div>
          <SCODashboard />
        </div>

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

        {/* Unified Sovereignty: Scientific Poster 2026 */}
        <div className="mt-16">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <h2 className="text-3xl font-bold mb-4">Gran Auditoría Unificada 2026</h2>
            <p className="text-muted-foreground italic font-mono text-sm">
              SOVEREIGN_RIGOR_ESTABLISHED // P ≠ NP CERTIFIED BY TOPOLOGICAL OBSTRUCTION
            </p>
          </div>
          <ScientificPoster />
        </div>
      </div>
    </ProblemLayout>
  );
};

export default PvsNP;
