import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Bookmark, BookmarkCheck, Award } from "lucide-react";
import {
    ProblemHeader,
    DifficultySelector,
    ReferenceList,
    type DifficultyLevel,
} from "@/components/problem";
import { useAuth } from "@/hooks/useAuth";
import { useMillenniumProblem } from "@/hooks/useMillenniumProblem";
import { useUserProgress } from "@/hooks/useUserProgress";
import { useActivityTracker } from "@/hooks/useActivityTracker";
import { millenniumProblems } from "@/data/millennium-problems";
import { VisualizationContainer } from "@/components/problem";
import { RicciFlowVisualization } from "@/components/problems/poincare/RicciFlowVisualization";
import { TopologicalSphere } from "@/components/problems/poincare/TopologicalSphere";

const PoincareConjecture = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [difficulty, setDifficulty] = useState<DifficultyLevel>("simple");

    const { data: problemData, isLoading } = useMillenniumProblem("poincare");
    const problem = problemData || millenniumProblems.find(p => p.slug === "poincare")!;

    const problemId = problemData?.id || 7;
    const { updateLevel, toggleBookmark, isBookmarked, updateTimeSpent } = useUserProgress(problemId, user?.id);

    useActivityTracker("poincare", "overview");

    useEffect(() => {
        if (user) updateLevel(difficulty);
    }, [difficulty, user]);

    useEffect(() => {
        if (!user) return;
        const interval = setInterval(() => updateTimeSpent(30), 30000);
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
                            <Button variant={isBookmarked ? "default" : "outline"} size="sm" onClick={() => toggleBookmark()} className="gap-2">
                                {isBookmarked ? <><BookmarkCheck className="w-4 h-4" />Guardado</> : <><Bookmark className="w-4 h-4" />Guardar</>}
                            </Button>
                        )}
                    </div>
                </div>
            </header>

            <ProblemHeader problem={problem} />

            {/* SOLVED Banner */}
            <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-y border-green-500/30">
                <div className="container mx-auto px-6 py-8">
                    <div className="flex items-center justify-center gap-4 flex-wrap">
                        <Award className="w-12 h-12 text-green-500" />
                        <div className="text-center">
                            <h2 className="text-3xl font-bold text-green-500">¡RESUELTO EN 2003!</h2>
                            <p className="text-lg text-muted-foreground mt-2">
                                Grigori Perelman demostró la conjetura usando Ricci Flow
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <section className="container mx-auto px-6 py-16">
                <DifficultySelector
                    currentLevel={difficulty}
                    onLevelChange={setDifficulty}
                    className="mb-16"
                    simpleContent={
                        <div className="space-y-4">
                            <p className="text-lg">
                                Imagina que vives en la superficie de una pelota. Puedes caminar en cualquier dirección,
                                pero siempre terminas volviendo a donde empezaste. Esto se debe a que la pelota es una <strong>esfera</strong>.
                            </p>
                            <p>
                                La Conjetura de Poincaré pregunta: <strong>Si vives en un espacio 3D donde toda "cuerda" se puede
                                    encoger hasta un punto, ¿ese espacio es topológicamente equivalente a una esfera 3D?</strong>
                            </p>
                            <p className="text-xl font-semibold text-primary mt-4">
                                En otras palabras: si el espacio se comporta como una esfera (puedes encoger cualquier lazo),
                                entonces ES una esfera (al menos topológicamente).
                            </p>
                        </div>
                    }
                    intermediateContent={
                        <div className="space-y-4">
                            <p className="text-lg">
                                Una 3-variedad es simplemente conexa si todo lazo puede contraerse a un punto.
                                En 2D, solo la esfera S² tiene esta propiedad.
                            </p>
                            <div className="bg-muted p-4 rounded-lg space-y-3">
                                <p><strong>Poincaré Conjetura:</strong> Toda 3-variedad compacta simplemente conexa es homeomorfa a S³</p>
                                <p><strong>Ricci Flow:</strong> Ecuación diferencial parcial que deforma la métrica</p>
                                <p><strong>Perelman (2003):</strong> Resolvió usando Ricci flow con surgery</p>
                            </div>
                            <p>
                                La prueba de Perelman revolucionó geometría diferencial y topología.
                            </p>
                        </div>
                    }
                    advancedContent={
                        <div className="space-y-4">
                            <p className="text-lg font-mono">
                                {problem.description?.advanced || "Sea M³ una variedad Riemanniana compacta simplemente conexa"}
                            </p>
                            <div className="bg-muted p-4 rounded-lg font-mono text-sm space-y-2">
                                <p>π₁(M) = {'{'}e{'}'} ⟹ M ≅ S³</p>
                                <p>Ricci flow: ∂g/∂t = -2Ric(g)</p>
                                <p>Geometrización de Thurston ⟸ Poincaré</p>
                            </div>
                            <p>
                                <strong>Solución:</strong> Perelman probó que el Ricci flow con surgery converge a geometrías estándar,
                                demostrando la geometrización completa de Thurston (de la cual Poincaré es un caso especial).
                            </p>
                            <p>
                                Ténicas clave: Entropía  de Perelman, no-colapso, extensión del flujo, F-functional, W-functional.
                            </p>
                        </div>
                    }
                />

                {/* Visualizations Section */}
                <div className="space-y-12 my-20">
                    <h2 className="text-4xl font-bold mb-8">Visualizaciones Interactivas</h2>

                    <VisualizationContainer
                        title="Flujo de Ricci"
                        description="Observa cómo el flujo suaviza la curvatura de la variedad"
                        fullscreenEnabled
                    >
                        <RicciFlowVisualization />
                    </VisualizationContainer>

                    <VisualizationContainer
                        title="3-Esfera Topológica"
                        description="Proyección de una 3-esfera simplemente conexa"
                        fullscreenEnabled
                    >
                        <TopologicalSphere />
                    </VisualizationContainer>
                </div>

                <div className="mt-20">
                    <ReferenceList
                        title="Referencias Clave"
                        references={[
                            {
                                title: problem.clay_paper_author + " - The Poincaré Conjecture",
                                authors: [problem.clay_paper_author],
                                year: problem.clay_paper_year,
                                url: problem.clay_paper_url,
                                description: "Paper oficial del Clay Mathematics Institute",
                            },
                            {
                                title: "The entropy formula for the Ricci flow and its geometric applications",
                                authors: ["Grigori Perelman"],
                                year: 2002,
                                url: "https://arxiv.org/abs/math/0211159",
                                description: "Primer paper de Perelman sobre Ricci flow",
                            },
                            ...(problem.keyReferences || []),
                        ]}
                    />

                    <div className="mt-12 p-8 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-lg border border-green-500/20">
                        <h3 className="text-2xl font-bold mb-6">Historia y Legado</h3>
                        <div className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="p-6 bg-background/50 rounded-lg">
                                    <h4 className="font-bold text-lg mb-3">📅 1904</h4>
                                    <p className="text-sm">Henri Poincaré formula la conjetura en su trabajo sobre topología</p>
                                </div>
                                <div className="p-6 bg-background/50 rounded-lg">
                                    <h4 className="font-bold text-lg mb-3">🔬 2003</h4>
                                    <p className="text-sm">Grigori Perelman publica tres papers en arXiv con la demostración</p>
                                </div>
                                <div className="p-6 bg-background/50 rounded-lg">
                                    <h4 className="font-bold text-lg mb-3">🏆 2006</h4>
                                    <p className="text-sm">Perelman recibe la Medalla Fields, pero la rechaza</p>
                                </div>
                                <div className="p-6 bg-background/50 rounded-lg">
                                    <h4 className="font-bold text-lg mb-3">💰 2010</h4>
                                    <p className="text-sm">Clay Institute otorga $1M a Perelman, quien también lo rechaza</p>
                                </div>
                            </div>

                            <div className="bg-green-500/10 p-6 rounded-lg border-l-4 border-green-500">
                                <h4 className="font-bold text-lg mb-3">La Decisión de Perelman</h4>
                                <p className="text-sm mb-4">
                                    Grigori Perelman es el único matemático que ha resuelto un Problema del Milenio. Sin embargo,
                                    rechazó tanto la Medalla Fields como el premio de $1,000,000, diciendo:
                                </p>
                                <blockquote className="italic border-l-4 border-green-500/50 pl-4 text-sm">
                                    "No quiero estar exhibido como un animal en un zoológico. No soy un héroe de las matemáticas.
                                    Ni siquiera soy tan exitoso. Por eso no quiero que todos me miren."
                                </blockquote>
                                <p className="text-sm mt-4">
                                    También citó que Richard Hamilton (quien desarrolló Ricci flow inicialmente) merecía igual crédito.
                                </p>
                            </div>

                            <div className="p-6 bg-background/50 rounded-lg">
                                <h4 className="font-bold text-lg mb-3">🌟 Impacto Científico</h4>
                                <ul className="space-y-2 text-sm">
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-500">•</span>
                                        <span>Demostró la <strong>Geometrización de Thurston</strong>, un resultado mucho más general</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-500">•</span>
                                        <span>Revolucionó el uso de <strong>Ricci flow</strong> en geometría diferencial</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-500">•</span>
                                        <span>Introdujo técnicas innovadoras de entropía y surgery</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-500">•</span>
                                        <span>Clasificó completamente todas las 3-variedades compactas</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default PoincareConjecture;
