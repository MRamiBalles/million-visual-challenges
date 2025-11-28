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
import { useAuth } from "@/hooks/useAuth";
import { useMillenniumProblem } from "@/hooks/useMillenniumProblem";
import { useUserProgress } from "@/hooks/useUserProgress";
import { useActivityTracker } from "@/hooks/useActivityTracker";
import { millenniumProblems } from "@/data/millennium-problems";
import { FluidSimulation } from "@/components/problems/navier-stokes/FluidSimulation";
import { VortexFormation } from "@/components/problems/navier-stokes/VortexFormation";
import { VelocityField } from "@/components/problems/navier-stokes/VelocityField";

const NavierStokes = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [difficulty, setDifficulty] = useState<DifficultyLevel>("simple");

    // Fetch problem data from Supabase (fallback to local data during migration)
    const { data: problemData, isLoading } = useMillenniumProblem("navier-stokes");
    const problem = problemData || millenniumProblems.find(p => p.slug === "navier-stokes")!;

    // User progress tracking
    const problemId = problemData?.id || 3; // Fallback ID during migration
    const {
        updateLevel,
        toggleBookmark,
        isBookmarked,
        updateTimeSpent
    } = useUserProgress(problemId, user?.id);

    // Track activity
    useActivityTracker("navier-stokes", "overview");

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
                                {problem.description.simple}
                            </p>
                            <p className="leading-relaxed">
                                Imagina que intentas predecir exactamente cómo se moverá el agua en un río, el aire alrededor
                                de un avión, o el humo de una chimenea. Esto parece simple, pero matemáticamente es
                                <strong> increíblemente complejo</strong>.
                            </p>
                            <p className="leading-relaxed">
                                Las ecuaciones de Navier-Stokes describen cómo se mueven los fluidos (líquidos y gases).
                                Fueron propuestas en el siglo XIX, y las usamos todos los días para diseñar aviones,
                                predecir el clima, y mucho más.
                            </p>
                            <p className="leading-relaxed text-xl font-semibold text-primary mt-4">
                                El problema: No podemos probar matemáticamente que estas ecuaciones siempre tienen
                                una solución "suave" (sin explosiones infinitas) para cualquier condición inicial.
                            </p>
                        </div>
                    }
                    intermediateContent={
                        <div className="space-y-4">
                            <p className="text-lg leading-relaxed">
                                {problem.description.intermediate}
                            </p>
                            <div className="bg-muted p-4 rounded-lg space-y-3">
                                <p><strong>Problema de Existencia:</strong> ¿Existen soluciones para cualquier condición inicial?</p>
                                <p><strong>Problema de Suavidad:</strong> ¿Las soluciones son siempre suaves (sin singularidades)?</p>
                                <p><strong>Turbulencia:</strong> El comportamiento caótico es difícil de modelar matemáticamente</p>
                                <p><strong>Blow-up:</strong> ¿Pueden las velocidades o presiones volverse infinitas en tiempo finito?</p>
                            </div>
                            <p className="leading-relaxed">
                                En 3 dimensiones, no sabemos si las soluciones siempre existen y son suaves.
                                En 2D el problema está resuelto, pero 3D (el mundo real) sigue abierto.
                            </p>
                        </div>
                    }
                    advancedContent={
                        <div className="space-y-4">
                            <p className="text-lg font-mono leading-relaxed">
                                {problem.description.advanced}
                            </p>
                            <div className="bg-muted p-4 rounded-lg font-mono text-sm space-y-2">
                                <p>∂u/∂t + (u·∇)u = -∇p/ρ + ν∇²u + f</p>
                                <p>∇·u = 0 (incompresibilidad)</p>
                                <p>u(x,0) = u₀(x) ∈ H^s(ℝ³)</p>
                            </div>
                            <p className="leading-relaxed">
                                <strong>Millennium Prize:</strong> Probar existencia global y regularidad de soluciones débiles
                                en ℝ³ para datos iniciales suaves, O demostrar formación de singularidades en tiempo finito.
                                Equivalentemente, probar que ||u(·,t)||_∞ permanece acotado para todo t {'>'} 0.
                            </p>
                            <p className="leading-relaxed">
                                Conexiones: Ecuaciones de Euler (límite ν→0), turbulencia de Kolmogorov, cascadas de energía,
                                teoría de regularidad parcial (Caffarelli-Kohn-Nirenberg), espacios de Besov críticos.
                            </p>
                        </div>
                    }
                />

                {/* Visualizations Section */}
                <div className="space-y-12">
                    <h2 className="text-4xl font-bold mb-8">Visualizaciones Interactivas</h2>

                    <VisualizationContainer
                        title="Simulación de Fluido 2D"
                        description="Observa cómo un fluido se mueve y forma vórtices. En 2D, las soluciones son siempre suaves."
                        fullscreenEnabled
                    >
                        <FluidSimulation />
                    </VisualizationContainer>

                    <VisualizationContainer
                        title="Formación de Vórtices"
                        description="Los vórtices (remolinos) son estructuras fundamentales en la dinámica de fluidos"
                        fullscreenEnabled
                    >
                        <VortexFormation />
                    </VisualizationContainer>

                    <VisualizationContainer
                        title="Campo de Velocidades"
                        description="Visualización del campo vectorial de velocidades en un fluido"
                        fullscreenEnabled
                    >
                        <VelocityField />
                    </VisualizationContainer>
                </div>

                {/* References Section */}
                <div className="mt-20">
                    <ReferenceList
                        title="Referencias Clave"
                        references={[
                            {
                                title: problem.clayPaper.author + " - Existence and Smoothness of the Navier-Stokes Equation",
                                authors: [problem.clayPaper.author],
                                year: problem.clayPaper.year,
                                url: problem.clayPaper.url,
                                description: "Paper oficial del Clay Mathematics Institute",
                            },
                            ...(problem.keyReferences || []),
                        ]}
                    />

                    {/* Applications */}
                    <div className="mt-12 p-8 bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg border border-primary/10">
                        <h3 className="text-2xl font-bold mb-6">Aplicaciones en el Mundo Real</h3>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {(problem.applications || [
                                "Diseño aerodinámico de aviones y automóviles",
                                "Predicción meteorológica y modelos climáticos",
                                "Ingeniería naval y diseño de barcos",
                                "Turbinas eólicas y energía renovable",
                                "Sistemas de refrigeración y HVAC",
                                "Biomecánica: flujo sanguíneo",
                                "Industria petrolera: flujo en tuberías",
                                "Oceanografía y corrientes marinas",
                            ]).map((app, index) => (
                                <div key={index} className="flex items-start gap-3">
                                    <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                                    <div>
                                        <p className="font-semibold">{app}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Key Facts */}
                        <div className="mt-8 p-6 bg-background/50 rounded-lg">
                            <h4 className="font-bold text-lg mb-4">Datos Importantes</h4>
                            <ul className="space-y-3 text-sm">
                                <li className="flex items-start gap-2">
                                    <span className="text-primary">🔬</span>
                                    <span>Las ecuaciones fueron formuladas independientemente por <strong>Claude-Louis Navier</strong> (1822) y <strong>George Gabriel Stokes</strong> (1845)</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-primary">✅</span>
                                    <span>En <strong>2 dimensiones</strong>, el problema está resuelto: las soluciones siempre existen y son suaves</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-primary">❓</span>
                                    <span>En <strong>3 dimensiones</strong> (el mundo real), sigue siendo un misterio matemático</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-primary">💻</span>
                                    <span>A pesar de no tener prueba matemática, las simulaciones numéricas funcionan extremadamente bien en la práctica</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-primary">🌪️</span>
                                    <span>La <strong>turbulencia</strong> es uno de los fenómenos físicos más complejos y peor entendidos</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-primary">💰</span>
                                    <span>Premio de <strong>$1,000,000 USD</strong> por resolver el problema de existencia y suavidad</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default NavierStokes;
