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
import { GaugeFieldVisualization } from "@/components/problems/yang-mills/GaugeFieldVisualization";
import { ConfinementVisualization } from "@/components/problems/yang-mills/ConfinementVisualization";
import { MassGapVisualization } from "@/components/problems/yang-mills/MassGapVisualization";

const YangMills = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [difficulty, setDifficulty] = useState<DifficultyLevel>("simple");

    // Fetch problem data from Supabase (fallback to local data during migration)
    const { data: problemData, isLoading } = useMillenniumProblem("yang-mills");
    const problem = problemData || millenniumProblems.find(p => p.slug === "yang-mills")!;

    // User progress tracking
    const problemId = problemData?.id || 4; // Fallback ID during migration
    const {
        updateLevel,
        toggleBookmark,
        isBookmarked,
        updateTimeSpent
    } = useUserProgress(problemId, user?.id);

    // Track activity
    useActivityTracker("yang-mills", "overview");

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
                                Imagina que quieres entender de qué están hechas las partículas más pequeñas del universo:
                                quarks y gluones. Estas partículas se comportan de manera muy extraña.
                            </p>
                            <p className="leading-relaxed">
                                Cuando intentas separar dos quarks, en lugar de alejarse, aparece más energía y se crean
                                <strong> nuevos quarks</strong>. Es como si estuvieran conectados por una liga elástica invisible
                                que nunca se rompe.
                            </p>
                            <p className="leading-relaxed text-xl font-semibold text-primary mt-4">
                                El problema de Yang-Mills pregunta: ¿Por qué los quarks nunca pueden existir solos?
                                ¿Podemos demostrarlo matemáticamente usando la teoría cuántica de campos?
                            </p>
                        </div>
                    }
                    intermediateContent={
                        <div className="space-y-4">
                            <p className="text-lg leading-relaxed">
                                {problem.description.intermediate}
                            </p>
                            <div className="bg-muted p-4 rounded-lg space-y-3">
                                <p><strong>Teoría de Gauge:</strong> Marco matemático para describir fuerzas fundamentales</p>
                                <p><strong>QCD (Cromodinámica Cuántica):</strong> Teoría de Yang-Mills para la fuerza nuclear fuerte</p>
                                <p><strong>Confinamiento:</strong> Los quarks nunca se observan aislados, siempre en grupos</p>
                                <p><strong>Mass Gap:</strong> Diferencia de energía entre vacío y primer estado excitado {'>'} 0</p>
                            </div>
                            <p className="leading-relaxed">
                                Aunque QCD predice correctamente el comportamiento de partículas en aceleradores,
                                no podemos probar matemáticamente que el <code className="bg-muted px-2 py-1 rounded">mass gap</code> existe
                                o que el confinamiento es absoluto.
                            </p>
                        </div>
                    }
                    advancedContent={
                        <div className="space-y-4">
                            <p className="text-lg font-mono leading-relaxed">
                                {problem.description.advanced}
                            </p>
                            <div className="bg-muted p-4 rounded-lg font-mono text-sm space-y-2">
                                <p>ℒ_YM = -¼ F^a_μν F^aμν</p>
                                <p>F^a_μν = ∂_μ A^a_ν - ∂_ν A^a_μ + g f^abc A^b_μ A^c_ν</p>
                                <p>Grupo de gauge: SU(3) para QCD</p>
                                <p>Mass gap: m = inf{'{'}E : E eigenvalue of H, E {'>'} 0{'}'} {'>'} 0</p>
                            </div>
                            <p className="leading-relaxed">
                                <strong>Millennium Prize:</strong> Probar existencia de teoría cuántica de Yang-Mills en ℝ⁴
                                con grupo de gauge SU(N), demostrando mass gap Δ {'>'} 0 y confinamiento de color.
                                Alternativamente, construcción rigurosa de QCD como teoría cuántica de campos.
                            </p>
                            <p className="leading-relaxed">
                                Conexiones: Instantones, monopolos magnéticos, dualidad S, AdS/CFT, teoría de cuerdas,
                                ecuaciones de auto-dualidad, topología de variedades de gauge.
                            </p>
                        </div>
                    }
                />

                {/* Visualizations Section */}
                <div className="space-y-12 my-20">
                    <h2 className="text-4xl font-bold mb-8">Visualizaciones Interactivas</h2>

                    <VisualizationContainer
                        title="Campo de Gauge SU(3)"
                        description="Visualización del campo de gluones que conectan quarks en QCD"
                        fullscreenEnabled
                    >
                        <GaugeFieldVisualization />
                    </VisualizationContainer>

                    <VisualizationContainer
                        title="Confinamiento de Quarks"
                        description="Demostración de por qué los quarks nunca existen aislados"
                        fullscreenEnabled
                    >
                        <ConfinementVisualization />
                    </VisualizationContainer>

                    <VisualizationContainer
                        title="Espectro de Masa"
                        description="Visualización del mass gap en la teoría cuántica de campos"
                        fullscreenEnabled
                    >
                        <MassGapVisualization />
                    </VisualizationContainer>
                </div>

                {/* References Section */}
                <ReferenceList
                    title="Referencias Clave"
                    references={[
                        {
                            title: problem.clayPaper.author + " - Quantum Yang-Mills Theory",
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
                    <h3 className="text-2xl font-bold mb-6">Importancia y Aplicaciones</h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {(problem.applications || [
                            "Comprensión de la fuerza nuclear fuerte",
                            "Física de partículas en aceleradores (LHC)",
                            "Estructura interna de protones y neutrones",
                            "Energía de fusión nuclear",
                            "Evolución del universo temprano",
                            "Cromodinámica Cuántica en lattice",
                            "Teoría de campos gauge en física teórica",
                            "Conexión con teoría de cuerdas",
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
                        <h4 className="font-bold text-lg mb-4">Datos Fascinantes</h4>
                        <ul className="space-y-3 text-sm">
                            <li className="flex items-start gap-2">
                                <span className="text-primary">🏆</span>
                                <span><strong>Chen Ning Yang</strong> y <strong>Robert Mills</strong> propusieron la teoría en 1954</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary">🎨</span>
                                <span>Los quarks tienen <strong>"carga de color"</strong> (rojo, verde, azul) - no tiene nada que ver con colores reales</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary">🔬</span>
                                <span>Nunca hemos visto un quark aislado en ningún experimento</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary">⚡</span>
                                <span>Los <strong>gluones</strong> son las partículas que transmiten la fuerza fuerte (como los fotones para electromagnetismo)</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary">🧮</span>
                                <span>QCD es extremadamente precisa: predice masas de hadrones con error {'<'} 1%</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary">🌌</span>
                                <span>El <strong>99% de la masa</strong> de protones/neutrones viene de la energía del campo de gluones, no de los quarks</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary">💰</span>
                                <span>Premio de <strong>$1,000,000 USD</strong> por demostración rigurosa del mass gap</span>
                            </li>
                        </ul>
                    </div>

                    {/* Physics Context */}
                    <div className="mt-8 p-6 bg-primary/5 rounded-lg border-l-4 border-primary">
                        <h4 className="font-bold text-lg mb-3">Contexto en Física de Partículas</h4>
                        <p className="text-sm leading-relaxed">
                            Yang-Mills es el fundamento del <strong>Modelo Estándar</strong> de física de partículas.
                            Tres de las cuatro fuerzas fundamentales (fuerte, débil, electromagnética) se describen
                            mediante teorías de Yang-Mills. Solo la gravedad queda fuera. Resolver este problema
                            matemáticamente podría revelar profundas conexiones entre física cuántica y geometría.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default YangMills;
