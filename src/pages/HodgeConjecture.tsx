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
import { AlgebraicCyclesVisualization } from "@/components/problems/hodge/AlgebraicCyclesVisualization";
import { CohomologyRing } from "@/components/problems/hodge/CohomologyRing";

const HodgeConjecture = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [difficulty, setDifficulty] = useState<DifficultyLevel>("simple");

    const { data: problemData, isLoading } = useMillenniumProblem("hodge");
    const problem = problemData || millenniumProblems.find(p => p.slug === "hodge")!;

    const problemId = problemData?.id || 5;
    const { updateLevel, toggleBookmark, isBookmarked, updateTimeSpent } = useUserProgress(problemId, user?.id);

    useActivityTracker("hodge", "overview");

    useEffect(() => {
        if (user) updateLevel(difficulty);
    }, [difficulty, user]);

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
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <header className="border-b border-border sticky top-0 z-50 bg-background/95 backdrop-blur">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <Button variant="ghost" onClick={() => navigate("/")} className="gap-2">
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
                                {isBookmarked ? <><BookmarkCheck className="w-4 h-4" />Guardado</> : <><Bookmark className="w-4 h-4" />Guardar</>}
                            </Button>
                        )}
                    </div>
                </div>
            </header>

            <ProblemHeader problem={problem} />

            <section className="container mx-auto px-6 py-16">
                <DifficultySelector
                    currentLevel={difficulty}
                    onLevelChange={setDifficulty}
                    className="mb-16"
                    simpleContent={
                        <div className="space-y-4">
                            <p className="text-lg ">
                                Imagina que tienes una esfera. Es una superficie 2D en un espacio 3D. Si la cortas con un plano,
                                obtienes círculos. Estos círculos son "cicl os algebraicos" - formas que podemos describir con ecuaciones.
                            </p>
                            <p>
                                La Hipótesis de Hodge pregunta: <strong>¿Toda forma complicada en una variedad algebraica puede
                                    construirse combinando estas formas simples algebraicas?</strong>
                            </p>
                            <p className="text-xl font-semibold text-primary mt-4">
                                Es como preguntar si todo objeto geométrico complejo se puede construir pegando piezas algebraicas básicas.
                            </p>
                        </div>
                    }
                    intermediateContent={
                        <div className="space-y-4">
                            <p className="text-lg">
                                En geometría algebraica, estudiamos variedades - espacios definidos por ecuaciones polinómicas.
                                La cohomología estudia los "agujeros" y estructura topológica de estos espacios.
                            </p>
                            <div className="bg-muted p-4 rounded-lg space-y-3">
                                <p><strong>Ciclos Algebraicos:</strong> Subvariedades definidas por ecuaciones</p>
                                <p><strong>Clases de Hodge:</strong> Objetos topológicos de un tipo especial</p>
                                <p><strong>La Conjetura:</strong> ¿Toda clase de Hodge  viene de un ciclo algebraico?</p>
                            </div>
                            <p>
                                Solo probada para curvas (1D) y superficies (2D). Dimensiones superiores permanecen abiertas.
                            </p>
                        </div>
                    }
                    advancedContent={
                        <div className="space-y-4">
                            <p className="text-lg font-mono">
                                {problem.description?.advanced || "Sea X  una variedad algebraica proyectiva compleja suave."}
                            </p>
                            <div className="bg-muted p-4 rounded-lg font-mono text-sm space-y-2">
                                <p>H^(p,p)(X) ∩ H^(2p)(X, ℚ) generado por clases de ciclos algebraicos</p>
                                <p>Cohomolog\u00eda de Hodge: H^k(X,ℂ) = ⊕ H^(p,q)(X)</p>
                            </div>
                            <p>
                                Conexiones: Teoría de Hodge, variedades de Calabi-Yau, motivos, grupos de Chow,
                                ciclos algebraicos superiores, cohomología étale.
                            </p>
                        </div>
                    }
                />

                {/* Visualizations Section */}
                <div className="space-y-12 my-20">
                    <h2 className="text-4xl font-bold mb-8">Visualizaciones Interactivas</h2>

                    <VisualizationContainer
                        title="Ciclos Algebraicos"
                        description="Visualización de ciclos algebraicos en una variedad compleja"
                        fullscreenEnabled
                    >
                        <AlgebraicCyclesVisualization />
                    </VisualizationContainer>

                    <VisualizationContainer
                        title="Anillo de Cohomología"
                        description="Estructura del anillo de cohomología de Hodge"
                        fullscreenEnabled
                    >
                        <CohomologyRing />
                    </VisualizationContainer>
                </div>

                <div className="mt-20">
                    <ReferenceList
                        title="Referencias Clave"
                        references={[
                            {
                                title: problem.clay_paper_author + " - The Hodge Conjecture",
                                authors: [problem.clay_paper_author],
                                year: problem.clay_paper_year,
                                url: problem.clay_paper_url,
                                description: "Paper oficial del Clay Mathematics Institute",
                            },
                            ...(problem.keyReferences || []),
                        ]}
                    />

                    <div className="mt-12 p-8 bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg border border-primary/10">
                        <h3 className="text-2xl font-bold mb-6">Contexto e Importancia</h3>
                        <div className="space-y-4">
                            <p>
                                La Hipótesis de Hodge conecta <strong>geometría algebraica</strong> (ecuaciones polinómicas) con
                                <strong> topología</strong> (forma y estructura de espacios). Es fundamental para (entender la estructura profunda
                                de variedades algebraicas.
                            </p>
                            <div className="grid md:grid-cols-2 gap-4 mt-6">
                                <div className="p-4 bg-background/50 rounded">
                                    <h4 className="font-bold mb-2">🏆 William Hodge</h4>
                                    <p className="text-sm">Matemático escocés que formuló la conjetura en 1950 basándose en su teoría de formas harmónicas</p>
                                </div>
                                <div className="p-4 bg-background/50 rounded">
                                    <h4 className="font-bold mb-2">📐 Geometría Algebraica</h4>
                                    <p className="text-sm">La conjetura es central en geometría algebraica moderna y teoría de motivos</p>
                                </div>
                                <div className="p-4 bg-background/50 rounded">
                                    <h4 className="font-bold mb-2">🔬 Casos Conocidos</h4>
                                    <p className="text-sm">Probada para curvas, superficies, y algunos casos especiales en dimensiones superiores</p>
                                </div>
                                <div className="p-4 bg-background/50 rounded">
                                    <h4 className="font-bold mb-2">💰 Premio</h4>
                                    <p className="text-sm">$1,000,000 USD por demostración o contraejemplo</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HodgeConjecture;
