import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Bookmark, BookmarkCheck } from "lucide-react";
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
import { EllipticCurvePlotter } from "@/components/problems/birch-sd/EllipticCurvePlotter";
import { LFunctionPlot } from "@/components/problems/birch-sd/LFunctionPlot";

const BirchSwinnertonDyer = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [difficulty, setDifficulty] = useState<DifficultyLevel>("simple");

    const { data: problemData, isLoading } = useMillenniumProblem("birch-sd");
    const problem = problemData || millenniumProblems.find(p => p.slug === "birch-sd")!;

    const problemId = problemData?.id || 6;
    const { updateLevel, toggleBookmark, isBookmarked, updateTimeSpent } = useUserProgress(problemId, user?.id);

    useActivityTracker("birch-sd", "overview");

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

            <section className="container mx-auto px-6 py-16">
                <DifficultySelector
                    currentLevel={difficulty}
                    onLevelChange={setDifficulty}
                    className="mb-16"
                    simpleContent={
                        <div className="space-y-4">
                            <p className="text-lg">
                                Las curvas elípticas son ecuaciones especiales como y² = x³ + ax + b. A pesar de su fórmula simple,
                                estas curvas esconden misterios profundos sobre <strong>puntos racionales</strong> (coordenadas que son fracciones).
                            </p>
                            <p>
                                La Conjetura de Birch y Swinnerton-Dyer conecta dos cosas aparentemente no relacionadas:
                            </p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li><strong>Aritmética:</strong> ¿Cuántos puntos racionales tiene la curva?</li>
                                <li><strong>Análisis:</strong> Una función especial L(s) asociada a la curva</li>
                            </ul>
                            <p className="text-xl font-semibold text-primary mt-4">
                                La conjetura dice que la información analítica (función L) predice perfactamente la información aritmética (puntos racionales).
                            </p>
                        </div>
                    }
                    intermediateContent={
                        <div className="space-y-4">
                            <p className="text-lg">
                                Una curva elíptica E sobre ℚ tiene asociada una L-function L(E,s) que codifica información profunda
                                sobre la curva.
                            </p>
                            <div className="bg-muted p-4 rounded-lg space-y-3">
                                <p><strong>Rango:</strong> Número de generadores del grupo de puntos racionales</p>
                                <p><strong>L-function:</strong> Serie infinita que converge para Re(s) {'>'} 3/2</p>
                                <p><strong>BSD Conjetura:</strong> orden de cero de L(E,s) en s=1 = rango de E(ℚ)</p>
                            </div>
                            <p>
                                Probada para rango 0 y 1, y muchos casos especiales. El caso general sigue abierto.
                            </p>
                        </div>
                    }
                    advancedContent={
                        <div className="space-y-4">
                            <p className="text-lg font-mono">
                                {problem.description?.advanced || "E: y² = x³ + ax + b, curva elíptica sobre ℚ"}
                            </p>
                            <div className="bg-muted p-4 rounded-lg font-mono text-sm space-y-2">
                                <p>L(E,s) = Π_p L_p(E,s)</p>
                                <p>ord_(s=1) L(E,s) = rank E(ℚ)</p>
                                <p>lim_(s→1) L(E,s)/(s-1)^r = C · regulator · |Ш|</p>
                            </div>
                            <p>
                                Conexiones: Teoría de Iwasawa, conjetura de Gross-Zagier, fórmula de clase analítica,
                                modularidad de curvas elípticas (Wiles), grupo de Tate-Shafarevich.
                            </p>
                        </div>
                    }
                />

                {/* Visualizations Section */}
                <div className="space-y-12 my-20">
                    <h2 className="text-4xl font-bold mb-8">Visualizaciones Interactivas</h2>

                    <VisualizationContainer
                        title="Curva Elíptica Interactiva"
                        description="Explora curvas elípticas ajustando parámetros a y b"
                        fullscreenEnabled
                    >
                        <EllipticCurvePlotter />
                    </VisualizationContainer>

                    <VisualizationContainer
                        title="L-Function y Rango"
                        description="Visualización de la L-function y su cero en s=1"
                        fullscreenEnabled
                    >
                        <LFunctionPlot />
                    </VisualizationContainer>
                </div>

                <div className="mt-20">
                    <ReferenceList
                        title="Referencias Clave"
                        references={[
                            {
                                title: problem.clayPaper.author + " - The Birch and Swinnerton-Dyer Conjecture",
                                authors: [problem.clayPaper.author],
                                year: problem.clayPaper.year,
                                url: problem.clayPaper.url,
                                description: "Paper oficial del Clay Mathematics Institute",
                            },
                            ...(problem.keyReferences || []),
                        ]}
                    />

                    <div className="mt-12 p-8 bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg border border-primary/10">
                        <h3 className="text-2xl font-bold mb-6">Importancia y Aplicaciones</h3>
                        <div className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="p-6 bg-background/50 rounded-lg">
                                    <h4 className="font-bold text-lg mb-3">🔐 Criptografía</h4>
                                    <p className="text-sm">Las curvas elípticas son fundamentales en criptografía moderna (ECC - Elliptic Curve Cryptography)</p>
                                </div>
                                <div className="p-6 bg-background/50 rounded-lg">
                                    <h4 className="font-bold text-lg mb-3">📚 Último Teorema de Fermat</h4>
                                    <p className="text-sm">Andrew Wiles usó curvas elípticas para demostrar el Último Teorema de Fermat en 1995</p>
                                </div>
                                <div className="p-6 bg-background/50 rounded-lg">
                                    <h4 className="font-bold text-lg mb-3">🏆 Birch & Swinnerton-Dyer</h4>
                                    <p className="text-sm">Formulada en los años 1960s usando computadoras de la Universidad de Cambridge</p>
                                </div>
                                <div className="p-6 bg-background/50 rounded-lg">
                                    <h4 className="font-bold text-lg mb-3">💰 Premio</h4>
                                    <p className="text-sm">$1,000,000 USD por demostración</p>
                                </div>
                            </div>

                            <div className="bg-primary/10 p-6 rounded-lg border-l-4 border-primary">
                                <h4 className="font-bold text-lg mb-3">Dato Curioso</h4>
                                <p className="text-sm">
                                    Bryan Birch y Peter Swinnerton-Dyer formularon la conjetura después de realizar cálculos numéricos
                                    extensivos en la computadora EDSAC de Cambridge. Los datos computacionales sugieren la conjetura,
                                    pero una demostración rigurosa sigue evasiva.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default BirchSwinnertonDyer;
