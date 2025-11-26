import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Brain, BookOpen, Sparkles, ExternalLink } from "lucide-react";
import { TSPVisualization } from "@/components/problems/pvsnp/TSPVisualization";
import { ComplexityGraph } from "@/components/problems/pvsnp/ComplexityGraph";
import { TuringMachineDemo } from "@/components/problems/pvsnp/TuringMachineDemo";
import { VerificationDemo } from "@/components/problems/pvsnp/VerificationDemo";
import { millenniumProblems } from "@/data/millennium-problems";
import { useAuth } from "@/hooks/useAuth";
import { ExperimentSaver } from "@/components/ExperimentSaver";

const PvsNP = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [explanationLevel, setExplanationLevel] = useState<"simple" | "intermediate" | "advanced">("simple");
  
  const problem = millenniumProblems.find(p => p.slug === "pvsnp")!;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-header border-b border-border sticky top-0 z-50 backdrop-blur-sm"
      >
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
            
            <div className="flex items-center gap-2">
              {!user && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/auth")}
                >
                  Iniciar Sesión
                </Button>
              )}
              <Badge variant="secondary" className="gap-2">
                <Brain className="w-4 h-4" />
                {problem.prize}
              </Badge>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="bg-gradient-primary border-b border-border">
        <div className="container mx-auto px-6 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto text-center"
          >
            <Badge className="mb-4" style={{ backgroundColor: "hsl(280, 100%, 70%, 0.2)", color: "hsl(280, 100%, 70%)" }}>
              {problem.field}
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 text-foreground">
              P versus NP
            </h1>
            
            <p className="text-xl text-muted-foreground leading-relaxed mb-8">
              {problem.description[explanationLevel]}
            </p>

            {/* Level Selector */}
            <div className="flex items-center justify-center gap-2 mb-8">
              {(["simple", "intermediate", "advanced"] as const).map((level) => (
                <Button
                  key={level}
                  variant={explanationLevel === level ? "default" : "outline"}
                  size="sm"
                  onClick={() => setExplanationLevel(level)}
                >
                  {level === "simple" && "👋 Simple"}
                  {level === "intermediate" && "🎓 Intermedio"}
                  {level === "advanced" && "🔬 Avanzado"}
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
              <Card className="p-4 bg-card/50 backdrop-blur">
                <div className="text-2xl font-bold text-primary mb-1">1971</div>
                <div className="text-sm text-muted-foreground">Stephen Cook</div>
              </Card>
              <Card className="p-4 bg-card/50 backdrop-blur">
                <div className="text-2xl font-bold text-primary mb-1">$1M</div>
                <div className="text-sm text-muted-foreground">Premio</div>
              </Card>
              <Card className="p-4 bg-card/50 backdrop-blur">
                <div className="text-2xl font-bold text-primary mb-1">∞</div>
                <div className="text-sm text-muted-foreground">Intentos</div>
              </Card>
              <Card className="p-4 bg-card/50 backdrop-blur">
                <div className="text-2xl font-bold text-destructive mb-1">Sin resolver</div>
                <div className="text-sm text-muted-foreground">Estado</div>
              </Card>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-6 py-16">
        <Tabs defaultValue="visualization" className="space-y-8">
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-3">
            <TabsTrigger value="visualization" className="gap-2">
              <Sparkles className="w-4 h-4" />
              Visualizaciones
            </TabsTrigger>
            <TabsTrigger value="explanation" className="gap-2">
              <BookOpen className="w-4 h-4" />
              Explicación
            </TabsTrigger>
            <TabsTrigger value="references" className="gap-2">
              <ExternalLink className="w-4 h-4" />
              Referencias
            </TabsTrigger>
          </TabsList>

          {/* Visualizations Tab */}
          <TabsContent value="visualization" className="space-y-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div>
                <h2 className="text-3xl font-bold mb-3 text-foreground">
                  Verificar vs Resolver
                </h2>
                <p className="text-muted-foreground mb-6 max-w-3xl">
                  La esencia de P vs NP: es fácil verificar una solución, pero ¿es igual de fácil encontrarla?
                </p>
                <VerificationDemo />
              </div>

              <div>
                <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                  <h2 className="text-3xl font-bold text-foreground">
                    El Problema del Viajante (TSP)
                  </h2>
                  {user && (
                    <ExperimentSaver
                      problemSlug="pvsnp"
                      experimentType="tsp"
                      experimentData={{ cities: 8 }}
                    />
                  )}
                </div>
                <p className="text-muted-foreground mb-6 max-w-3xl">
                  Un ejemplo clásico de problema NP-Complete. Intenta encontrar la ruta más corta
                  visitando todas las ciudades exactamente una vez.
                </p>
                <TSPVisualization />
              </div>

              <div>
                <h2 className="text-3xl font-bold mb-3 text-foreground">
                  Crecimiento: P vs NP
                </h2>
                <p className="text-muted-foreground mb-6 max-w-3xl">
                  Compara cómo crece el tiempo de ejecución entre algoritmos polinomiales (P)
                  y exponenciales (NP).
                </p>
                <ComplexityGraph />
              </div>

              <div>
                <h2 className="text-3xl font-bold mb-3 text-foreground">
                  Máquina de Turing
                </h2>
                <p className="text-muted-foreground mb-6 max-w-3xl">
                  El modelo computacional fundamental usado para definir P y NP formalmente.
                </p>
                <TuringMachineDemo />
              </div>
            </motion.div>
          </TabsContent>

          {/* Explanation Tab */}
          <TabsContent value="explanation" className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto"
            >
              <Card className="p-8">
                <h2 className="text-3xl font-bold mb-6 text-foreground">
                  ¿Qué es P vs NP?
                </h2>
                
                <div className="space-y-6 text-muted-foreground">
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-3">La Pregunta Fundamental</h3>
                    <p className="leading-relaxed">
                      Imagina que te doy un sudoku completo. Es fácil verificar si está correcto: solo
                      revisa que cada fila, columna y cuadro tenga los números del 1 al 9 sin repetirse.
                      Pero ¿es igual de fácil <strong>resolver</strong> el sudoku desde cero?
                    </p>
                  </div>

                  <div className="bg-primary/5 border-l-4 border-primary p-4 rounded-r">
                    <p className="text-foreground font-semibold mb-2">P vs NP pregunta:</p>
                    <p>
                      Si un problema tiene una solución que podemos <strong>verificar rápidamente</strong>,
                      ¿también podemos <strong>encontrar</strong> esa solución rápidamente?
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-3">Clase P (Polinomial)</h3>
                    <p className="leading-relaxed">
                      Problemas que podemos resolver eficientemente. El tiempo crece de manera "razonable"
                      con el tamaño del problema (n², n³, etc.).
                    </p>
                    <div className="mt-3 space-y-2">
                      <div className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        <span>Ordenar una lista de números</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        <span>Encontrar el camino más corto en un mapa</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        <span>Multiplicar dos números grandes</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-3">Clase NP (Polinomial No-determinístico)</h3>
                    <p className="leading-relaxed">
                      Problemas donde podemos verificar una solución propuesta rápidamente, pero no
                      sabemos si existe un algoritmo rápido para encontrarla.
                    </p>
                    <div className="mt-3 space-y-2">
                      <div className="flex items-start gap-2">
                        <span className="text-accent">•</span>
                        <span>Problema del Viajante (TSP)</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-accent">•</span>
                        <span>Sudoku</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-accent">•</span>
                        <span>Factorización de números grandes (base de RSA)</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-3">¿Por qué importa?</h3>
                    <p className="leading-relaxed mb-3">
                      Si P = NP (es decir, si verificar rápido implica resolver rápido), las consecuencias
                      serían revolucionarias:
                    </p>
                    <div className="space-y-3">
                      <Card className="p-4 bg-card">
                        <div className="font-semibold text-foreground mb-1">🔒 Criptografía colapsaría</div>
                        <p className="text-sm">
                          Toda la seguridad en internet se basa en que ciertos problemas son difíciles
                          de resolver pero fáciles de verificar.
                        </p>
                      </Card>
                      <Card className="p-4 bg-card">
                        <div className="font-semibold text-foreground mb-1">🧬 Medicina revolucionada</div>
                        <p className="text-sm">
                          Podríamos diseñar proteínas y medicamentos óptimos resolviendo problemas
                          que hoy son intratables.
                        </p>
                      </Card>
                      <Card className="p-4 bg-card">
                        <div className="font-semibold text-foreground mb-1">🤖 IA superinteligente</div>
                        <p className="text-sm">
                          Muchos problemas de optimización en AI/ML se resolverían perfectamente.
                        </p>
                      </Card>
                    </div>
                  </div>

                  <div className="bg-muted/30 p-6 rounded-lg">
                    <h3 className="text-xl font-semibold text-foreground mb-3">Consenso Actual</h3>
                    <p className="leading-relaxed">
                      La mayoría de los científicos creen que <strong>P ≠ NP</strong>, es decir,
                      que hay problemas intrínsecamente difíciles de resolver aunque sean fáciles
                      de verificar. Pero después de 50+ años, ¡nadie ha podido demostrarlo!
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          </TabsContent>

          {/* References Tab */}
          <TabsContent value="references" className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto"
            >
              <h2 className="text-3xl font-bold mb-6 text-foreground">
                Referencias Académicas
              </h2>

              <div className="space-y-4">
                <Card className="p-6 border-l-4 border-primary">
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-3 rounded-lg">
                      <BookOpen className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-2 text-foreground">
                        {problem.clayPaper.author} ({problem.clayPaper.year})
                      </h3>
                      <p className="text-muted-foreground mb-3">
                        The P versus NP Problem - Clay Mathematics Institute Official Problem Statement
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(problem.clayPaper.url, "_blank")}
                        className="gap-2"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Leer Paper
                      </Button>
                    </div>
                  </div>
                </Card>

                {problem.keyReferences.map((ref, index) => (
                  <Card key={index} className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="bg-muted p-3 rounded-lg">
                        <BookOpen className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-2 text-foreground">
                          {ref.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          {ref.authors.join(", ")} • {ref.year}
                        </p>
                        {ref.citations && (
                          <Badge variant="secondary" className="mb-3">
                            {ref.citations.toLocaleString()} citas
                          </Badge>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(ref.url, "_blank")}
                          className="gap-2"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Ver Fuente
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <Card className="p-6 bg-muted/30 mt-8">
                <h3 className="font-bold text-lg mb-4 text-foreground">Aplicaciones del Mundo Real</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {problem.applications.map((app, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <span className="text-muted-foreground">{app}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
};

export default PvsNP;
