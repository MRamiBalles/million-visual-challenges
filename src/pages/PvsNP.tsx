import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Bookmark, BookmarkCheck } from "lucide-react";
import {
  ProblemHeader,
  DifficultySelector,
  ReferenceList,
  VisualizationContainer,
  type DifficultyLevel,
} from "@/components/problem";
import { TSPVisualization } from "@/components/problems/pvsnp/TSPVisualization";
import { ComplexityGraph } from "@/components/problems/pvsnp/ComplexityGraph";
import { TuringMachineDemo } from "@/components/problems/pvsnp/TuringMachineDemo";
import { VerificationDemo } from "@/components/problems/pvsnp/VerificationDemo";
import { useAuth } from "@/hooks/useAuth";
import { useMillenniumProblem } from "@/hooks/useMillenniumProblem";
import { useUserProgress } from "@/hooks/useUserProgress";
import { useActivityTracker } from "@/hooks/useActivityTracker";
import { millenniumProblems } from "@/data/millennium-problems";

const PvsNP = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [difficulty, setDifficulty] = useState<DifficultyLevel>("simple");

  // Fetch problem data from Supabase (fallback to local data during migration)
  const { data: problemData, isLoading } = useMillenniumProblem("pvsnp");
  const problem = problemData || millenniumProblems.find(p => p.slug === "pvsnp")!;

  // User progress tracking
  const problemId = problemData?.id || 1; // Fallback ID during migration
  const {
    updateLevel,
    toggleBookmark,
    isBookmarked,
    updateTimeSpent
  } = useUserProgress(problemId, user?.id);

  // Track activity
  useActivityTracker("pvsnp", "overview");

  // Sync difficulty level with user progress
  useEffect(() => {
    if (user) {
      updateLevel(difficulty);
    }
  }, [difficulty, user]);

  // Track time spent (update every 30 seconds)
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      updateTimeSpent(30); // 30 seconds
    }, 30000);

    return () => clearInterval(interval);
  }, [user, updateTimeSpent]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-16">
          <Skeleton className="h-64 w-full mb-8" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <header className="border-b border-border sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Problemas del Milenio
            </Button>

            {user && (
              <Button
                variant={isBookmarked ? "default" : "outline"}
                size="sm"
                onClick={() => toggleBookmark()}
                className="gap-2"
              >
                {isBookmarked ? (
                  <>
                    <BookmarkCheck className="w-4 h-4" />
                    Guardado
                  </>
                ) : (
                  <>
                    <Bookmark className="w-4 h-4" />
                    Guardar
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Problem Header */}
      <ProblemHeader problem={problem} />

      {/* Main Content */}
      <section className="container mx-auto px-6 py-16">
        {/* Difficulty Selector with Explanations */}
        <DifficultySelector
          currentLevel={difficulty}
          onLevelChange={setDifficulty}
          className="mb-16"
          simpleContent={
            <div className="space-y-4">
              <p className="text-lg leading-relaxed">
                {problem.description?.simple || problem.description_simple}
              </p>
              <p className="leading-relaxed">
                Imagina que te dan un sudoku completo. Es fácil verificar si está bien resuelto:
                solo revisas que cada fila, columna y cuadro tenga los números del 1 al 9 sin repetirse.
                Esto es <strong>verificar</strong>.
              </p>
              <p className="leading-relaxed">
                Pero <strong>resolver</strong> el sudoku desde cero (encontrar los números que faltan)
                es mucho más difícil. Tienes que probar diferentes combinaciones hasta dar con la correcta.
              </p>
              <p className="leading-relaxed text-xl font-semibold text-primary mt-4">
                P vs NP pregunta: ¿es verificar más fácil que resolver, o son igual de difíciles?
              </p>
            </div>
          }
          intermediateContent={
            <div className="space-y-4">
              <p className="text-lg leading-relaxed">
                {problem.description?.intermediate || problem.description_intermediate}
              </p>
              <div className="bg-muted p-4 rounded-lg space-y-3">
                <p><strong>Clase P:</strong> Problemas resolubles en tiempo polinomial (n², n³, etc.)</p>
                <p><strong>Clase NP:</strong> Problemas cuyas soluciones verificables en tiempo polinomial</p>
                <p><strong>NP-Completos:</strong> Los problemas "más difíciles" de NP. Si resuelves uno rápido, ¡resuelves todos!</p>
              </div>
              <p className="leading-relaxed">
                Sabemos que <code className="bg-muted px-2 py-1 rounded">P ⊆ NP</code> (todo lo que se puede resolver rápido,
                se puede verificar rápido). La pregunta es: ¿son iguales o diferentes?
              </p>
            </div>
          }
          advancedContent={
            <div className="space-y-4">
              <p className="text-lg font-mono leading-relaxed">
                {problem.description?.advanced || problem.description_advanced}
              </p>
              <div className="bg-muted p-4 rounded-lg font-mono text-sm space-y-2">
                <p>P = {"{"} problemas decidibles por DTM en tiempo O(n^k) {"}"}</p>
                <p>NP = {"{"} problemas decidibles por NDTM en tiempo O(n^k) {"}"}</p>
                <p>P = NP ⟺ P-complete = NP-complete</p>
              </div>
              <p className="leading-relaxed">
                La cuestión equivale a determinar si <code className="bg-muted px-2 py-1 rounded">DTIME(n^k) = NTIME(n^k)</code> para todo k.
                La mayoría de los teóricos creen que P ≠ NP basándose en evidencia computacional y complejidad de circuitos,
                pero una demostración formal permanece esquiva después de 50+ años.
              </p>
            </div>
          }
        />

        {/* Visualizations Section */}
        <div className="space-y-12">
          <h2 className="text-4xl font-bold mb-8">Visualizaciones Interactivas</h2>

          {/* Verification vs Resolution */}
          <VisualizationContainer
            title="Verificar vs Resolver"
            description="Experimenta la diferencia entre verificar una solución y encontrarla"
          >
            <VerificationDemo />
          </VisualizationContainer>

          {/* TSP */}
          <VisualizationContainer
            title="Problema del Viajante (TSP)"
            description="Ejemplo clásico de problema NP-Completo. Encuentra la ruta más corta visitando todas las ciudades."
            fullscreenEnabled
          >
            <TSPVisualization />
          </VisualizationContainer>

          {/* Complexity Growth */}
          <VisualizationContainer
            title="Crecimiento de Complejidad: P vs NP"
            description="Compara cómo escala el tiempo de ejecución entre algoritmos polinomiales y exponenciales"
          >
            <ComplexityGraph />
          </VisualizationContainer>

          {/* Turing Machine */}
          <VisualizationContainer
            title="Máquina de Turing"
            description="Modelo computacional fundamental usado para definir P y NP formalmente"
          >
            <TuringMachineDemo />
          </VisualizationContainer>
        </div>

        {/* References Section */}
        <div className="mt-20">
          <ReferenceList
            title="Referencias Clave"
            references={[
              {
                title: problem.clay_paper_author + " - The P versus NP Problem",
                authors: [problem.clay_paper_author],
                year: problem.clay_paper_year,
                url: problem.clay_paper_url,
                description: "Paper oficial del Clay Mathematics Institute",
              },
              ...(problem.keyReferences || []),
            ]}
          />

          {/* Applications */}
          <div className="mt-12 p-8 bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg border border-primary/10">
            <h3 className="text-2xl font-bold mb-6">Aplicaciones en el Mundo Real</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {(problem.applications || []).map((app, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                  <div>
                    <p className="font-semibold">{app}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PvsNP;
