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
import { ZetaFunctionVisualization } from "@/components/problems/riemann/ZetaFunctionVisualization";
import { PrimeDistributionVisualization } from "@/components/problems/riemann/PrimeDistributionVisualization";
import { CriticalLineVisualization } from "@/components/problems/riemann/CriticalLineVisualization";
import { useAuth } from "@/hooks/useAuth";
import { useMillenniumProblem } from "@/hooks/useMillenniumProblem";
import { useUserProgress } from "@/hooks/useUserProgress";
import { useActivityTracker } from "@/hooks/useActivityTracker";
import { millenniumProblems } from "@/data/millennium-problems";

const RiemannHypothesis = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [difficulty, setDifficulty] = useState<DifficultyLevel>("simple");

  // Fetch problem data from Supabase (fallback to local data during migration)
  const { data: problemData, isLoading } = useMillenniumProblem("riemann");
  const problem = problemData || millenniumProblems.find(p => p.slug === "riemann")!;

  // User progress tracking
  const problemId = problemData?.id || 2; // Fallback ID during migration
  const {
    updateLevel,
    toggleBookmark,
    isBookmarked,
    updateTimeSpent
  } = useUserProgress(problemId, user?.id);

  // Track activity
  useActivityTracker("riemann", "overview");

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
      updateTimeSpent(30);
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
                Los números primos (2, 3, 5, 7, 11, 13...) son los bloques fundamentales de todos los números.
                Pero su distribución parece completamente aleatoria. ¿Hay algún patrón?
              </p>
              <p className="leading-relaxed">
                Bernhard Riemann en 1859 descubrió una función matemática misteriosa (la función zeta)
                que parece contener el secreto de cómo se distribuyen los primos.
              </p>
              <p className="leading-relaxed text-xl font-semibold text-primary mt-4">
                La Hipótesis de Riemann predice exactamente dónde están los "ceros" de esta función,
                lo que revelaría el patrón oculto de los números primos.
              </p>
            </div>
          }
          intermediateContent={
            <div className="space-y-4">
              <p className="text-lg leading-relaxed">
                {problem.description?.intermediate || problem.description_intermediate}
              </p>
              <div className="bg-muted p-4 rounded-lg space-y-3">
                <p><strong>Función Zeta:</strong> ζ(s) = 1 + 1/2ˢ + 1/3ˢ + 1/4ˢ + ...</p>
                <p><strong>Ceros Triviales:</strong> En s = -2, -4, -6, ... (conocidos y aburridos)</p>
                <p><strong>Ceros No Triviales:</strong> En el plano complejo, relacionados con distribución de primos</p>
                <p><strong>La Hipótesis:</strong> Todos los ceros no triviales tienen Re(s) = 1/2</p>
              </div>
              <p className="leading-relaxed">
                Se han verificado más de <code className="bg-muted px-2 py-1 rounded">10¹³ ceros</code> y todos
                están exactamente en la línea Re(s) = 1/2. Pero nadie ha probado que <em>todos infinitos ceros</em> están ahí.
              </p>
            </div>
          }
          advancedContent={
            <div className="space-y-4">
              <p className="text-lg font-mono leading-relaxed">
                {problem.description?.advanced || problem.description_advanced}
              </p>
              <div className="bg-muted p-4 rounded-lg font-mono text-sm space-y-2">
                <p>ζ(s) = Σ(n=1 to ∞) n⁻ˢ para Re(s) {'>'} 1</p>
                <p>Continuación analítica a ℂ \ {'{'}1{'}'}</p>
                <p>RH: ζ(s) = 0, s ∈ ℂ \ {'{ℝ'} {'⟹'} Re(s) = 1/2</p>
                <p>Equivalente: |π(x) - Li(x)| = O(x^(1/2) log x)</p>
              </div>
              <p className="leading-relaxed">
                La RH es equivalente a múltiples conjeturas en teoría analítica de números. Su conexión con
                matrices aleatorias (GUE) sugiere profundas relaciones con física cuántica. La función zeta
                exhibe propiedades universales de sistemas cuánticos caóticos.
              </p>
            </div>
          }
        />

        {/* Visualizations Section */}
        <div className="space-y-12">
          <h2 className="text-4xl font-bold mb-8">Visualizaciones Interactivas</h2>

          {/* Prime Distribution */}
          <VisualizationContainer
            title="Distribución de Números Primos"
            description="Los números primos parecen aleatorios, pero la función zeta sugiere un patrón profundo"
            fullscreenEnabled
          >
            <PrimeDistributionVisualization />
          </VisualizationContainer>

          {/* Zeta Function */}
          <VisualizationContainer
            title="Función Zeta de Riemann ζ(s)"
            description="Visualización en el plano complejo. Los ceros no triviales están donde ζ(s) = 0"
            fullscreenEnabled
          >
            <ZetaFunctionVisualization />
          </VisualizationContainer>

          {/* Critical Line */}
          <VisualizationContainer
            title="La Línea Crítica"
            description="Todos los ceros verificados están exactamente en Re(s) = 1/2"
            fullscreenEnabled
          >
            <CriticalLineVisualization />
          </VisualizationContainer>
        </div>

        {/* References Section */}
        <div className="mt-20">
          <ReferenceList
            title="Referencias Clave"
            references={[
              {
                title: problem.clay_paper_author + " - The Riemann Hypothesis",
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
            <h3 className="text-2xl font-bold mb-6">Aplicaciones e Impacto</h3>
            <div className="grid md::grid-cols-2 lg:grid-cols-3 gap-6">
              {(problem.applications || []).map((app, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                  <div>
                    <p className="font-semibold">{app}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Fun Facts */}
            <div className="mt-8 p-6 bg-background/50 rounded-lg">
              <h4 className="font-bold text-lg mb-4">Datos Sorprendentes</h4>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-primary">🔢</span>
                  <span>Se han verificado más de <strong>10,000,000,000,000</strong> ceros y todos están en la línea crítica</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">⚛️</span>
                  <span>Los ceros de zeta se comportan como niveles de energía de núcleos atómicos pesados (Random Matrix Theory)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">🔐</span>
                  <span>La seguridad RSA depende de que factorizar números grandes sea difícil, conectado con la distribución de primos</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">💰</span>
                  <span>Problema abierto desde 1859 (165+ años) con premio de $1,000,000 USD</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default RiemannHypothesis;