import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Brain, BookOpen, Sparkles, ExternalLink } from "lucide-react";
import { ZetaFunctionVisualization } from "@/components/problems/riemann/ZetaFunctionVisualization";
import { PrimeDistributionVisualization } from "@/components/problems/riemann/PrimeDistributionVisualization";
import { CriticalLineVisualization } from "@/components/problems/riemann/CriticalLineVisualization";
import { millenniumProblems } from "@/data/millennium-problems";
import { useAuth } from "@/hooks/useAuth";

const RiemannHypothesis = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [explanationLevel, setExplanationLevel] = useState<"simple" | "intermediate" | "advanced">("simple");
  
  const problem = millenniumProblems.find(p => p.slug === "riemann")!;

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
            <Badge className="mb-4" style={{ backgroundColor: "hsl(195, 100%, 50%, 0.2)", color: "hsl(195, 100%, 50%)" }}>
              {problem.field}
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 text-foreground">
              Hipótesis de Riemann
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
                <div className="text-2xl font-bold text-primary mb-1">1859</div>
                <div className="text-sm text-muted-foreground">Bernhard Riemann</div>
              </Card>
              <Card className="p-4 bg-card/50 backdrop-blur">
                <div className="text-2xl font-bold text-primary mb-1">$1M</div>
                <div className="text-sm text-muted-foreground">Premio</div>
              </Card>
              <Card className="p-4 bg-card/50 backdrop-blur">
                <div className="text-2xl font-bold text-primary mb-1">10¹³</div>
                <div className="text-sm text-muted-foreground">Ceros verificados</div>
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
                  Distribución de Números Primos
                </h2>
                <p className="text-muted-foreground mb-6 max-w-3xl">
                  Los números primos parecen distribuirse aleatoriamente, pero la función zeta de Riemann
                  sugiere que hay un patrón oculto profundo.
                </p>
                <PrimeDistributionVisualization />
              </div>

              <div>
                <h2 className="text-3xl font-bold mb-3 text-foreground">
                  Función Zeta de Riemann ζ(s)
                </h2>
                <p className="text-muted-foreground mb-6 max-w-3xl">
                  La función zeta mapea números complejos. Los "ceros no triviales" son donde ζ(s) = 0.
                  La hipótesis dice que todos están en la línea Re(s) = 1/2.
                </p>
                <ZetaFunctionVisualization />
              </div>

              <div>
                <h2 className="text-3xl font-bold mb-3 text-foreground">
                  La Línea Crítica
                </h2>
                <p className="text-muted-foreground mb-6 max-w-3xl">
                  Visualización de los primeros ceros no triviales en el plano complejo. 
                  Todos los verificados están exactamente en Re(s) = 1/2.
                </p>
                <CriticalLineVisualization />
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
                  ¿Qué es la Hipótesis de Riemann?
                </h2>
                
                <div className="space-y-6 text-muted-foreground">
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-3">Los Números Primos</h3>
                    <p className="leading-relaxed">
                      Los números primos (2, 3, 5, 7, 11, 13...) son los "átomos" de las matemáticas: 
                      todo número se construye multiplicando primos. Pero su distribución parece caótica.
                    </p>
                  </div>

                  <div className="bg-primary/5 border-l-4 border-primary p-4 rounded-r">
                    <p className="text-foreground font-semibold mb-2">La pregunta fundamental:</p>
                    <p>
                      ¿Existe un patrón preciso que describa <strong>dónde aparecen los primos</strong>?
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-3">La Función Zeta ζ(s)</h3>
                    <p className="leading-relaxed mb-3">
                      En 1859, Bernhard Riemann conectó los primos con una función misteriosa:
                    </p>
                    <div className="bg-muted/30 p-4 rounded font-mono text-center text-lg">
                      ζ(s) = 1 + 1/2ˢ + 1/3ˢ + 1/4ˢ + ...
                    </div>
                    <p className="leading-relaxed mt-3">
                      Esta función tiene "ceros" (puntos donde vale 0) que están misteriosamente 
                      relacionados con la distribución de los primos.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-3">La Hipótesis</h3>
                    <p className="leading-relaxed mb-3">
                      Riemann propuso que todos los ceros no triviales de ζ(s) tienen parte real = 1/2.
                      Es decir, están en la "línea crítica" Re(s) = 1/2 del plano complejo.
                    </p>
                    <div className="bg-accent/10 p-4 rounded">
                      <p className="font-semibold text-foreground mb-2">Si es cierto:</p>
                      <p className="text-sm">
                        Tendríamos la descripción más precisa posible de cómo se distribuyen los primos.
                        Impacto en criptografía, teoría de números, física cuántica.
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-3">Estado Actual</h3>
                    <p className="leading-relaxed">
                      Se han verificado más de <strong>10 billones</strong> de ceros y todos están en la línea.
                      Pero nadie ha podido demostrar que <strong>todos infinitos ceros</strong> están ahí.
                      Es uno de los problemas más importantes y difíciles de las matemáticas.
                    </p>
                  </div>

                  <div className="bg-muted/30 p-6 rounded-lg">
                    <h3 className="text-xl font-semibold text-foreground mb-3">Conexiones sorprendentes</h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        <span><strong>Física cuántica:</strong> Los ceros de zeta se comportan como niveles de energía de átomos pesados</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        <span><strong>Criptografía:</strong> La seguridad RSA depende de que factorizar sea difícil, relacionado con primos</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        <span><strong>Teoría del caos:</strong> Los primos exhiben patrones caóticos pero deterministas</span>
                      </li>
                    </ul>
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
                        The Riemann Hypothesis - Clay Mathematics Institute Official Problem Statement
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

export default RiemannHypothesis;