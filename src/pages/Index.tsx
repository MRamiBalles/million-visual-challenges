import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Brain, Infinity, Waves, Atom, Calculator, Network, CheckCircle2, Sparkles, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const millenniumProblems = [
  {
    id: 1,
    title: "P vs NP",
    shortDesc: "¿Es verificar tan difícil como resolver?",
    field: "Ciencias de la Computación",
    icon: Brain,
    color: "hsl(280, 100%, 70%)",
    status: "unsolved",
    route: "/pvsnp",
    prize: "$1,000,000",
  },
  {
    id: 2,
    title: "Hipótesis de Riemann",
    shortDesc: "El patrón oculto de los números primos",
    field: "Teoría de Números",
    icon: Infinity,
    color: "hsl(195, 100%, 50%)",
    status: "unsolved",
    route: "/riemann",
    prize: "$1,000,000",
  },
  {
    id: 3,
    title: "Navier-Stokes",
    shortDesc: "¿Existe solución suave para todo fluido?",
    field: "Ecuaciones Diferenciales",
    icon: Waves,
    color: "hsl(210, 100%, 60%)",
    status: "unsolved",
    route: "/navier-stokes",
    prize: "$1,000,000",
  },
  {
    id: 4,
    title: "Yang-Mills & Mass Gap",
    shortDesc: "Teoría cuántica de campos gauge",
    field: "Física Matemática",
    icon: Atom,
    color: "hsl(30, 100%, 60%)",
    status: "unsolved",
    route: "/yang-mills",
    prize: "$1,000,000",
  },
  {
    id: 5,
    title: "Conjetura de Hodge",
    shortDesc: "Geometría algebraica vs topología",
    field: "Geometría Algebraica",
    icon: Network,
    color: "hsl(340, 100%, 65%)",
    status: "unsolved",
    route: "/hodge",
    prize: "$1,000,000",
  },
  {
    id: 6,
    title: "Birch & Swinnerton-Dyer",
    shortDesc: "Curvas elípticas y funciones L",
    field: "Teoría de Números",
    icon: Calculator,
    color: "hsl(120, 60%, 50%)",
    status: "unsolved",
    route: "/birch-sd",
    prize: "$1,000,000",
  },
  {
    id: 7,
    title: "Conjetura de Poincaré",
    shortDesc: "Clasificación de 3-variedades",
    field: "Topología",
    icon: CheckCircle2,
    color: "hsl(160, 84%, 39%)",
    status: "solved",
    route: "/poincare",
    prize: "✓ Resuelto 2003",
  },
];

const Index = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative overflow-hidden bg-gradient-header border-b border-border"
      >
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div className="container mx-auto px-6 py-20 relative z-10">
          <div className="absolute top-4 right-6">
            <div className="flex items-center gap-2">
              {user && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate("/dashboard")}
                  >
                    Dashboard
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate("/experiments")}
                  >
                    Mis Experimentos
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate("/community")}
                  >
                    Galería
                  </Button>
                </>
              )}
              {user ? (
                <Button variant="outline" size="sm" onClick={signOut} className="gap-2">
                  <LogOut className="w-4 h-4" />
                  Cerrar Sesión
                </Button>
              ) : (
                <Button variant="outline" size="sm" onClick={() => navigate("/auth")}>
                  Iniciar Sesión
                </Button>
              )}
            </div>
          </div>

          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center max-w-4xl mx-auto"
          >
            <Badge className="mb-6 text-base px-4 py-2" variant="secondary">
              Clay Mathematics Institute • Año 2000
            </Badge>
            
            <h1 className="text-6xl md:text-8xl font-bold mb-6">
              <span className="bg-gradient-accent bg-clip-text text-transparent">
                Los Problemas
              </span>
              <br />
              <span className="text-foreground">del Milenio</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Siete desafíos matemáticos monumentales. Cada uno con un premio de{" "}
              <span className="text-primary font-bold">$1 millón de dólares</span>.
              Solo uno ha sido resuelto en 25 años.
            </p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-8 flex items-center justify-center gap-3 text-sm text-muted-foreground"
            >
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
                <span>6 sin resolver</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-muted-foreground" />
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>1 resuelto</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-muted-foreground" />
              <span>$7M en premios</span>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Problems Grid */}
      <section className="container mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {millenniumProblems.map((problem, index) => {
            const Icon = problem.icon;
            
            return (
              <motion.div
                key={problem.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
              >
                <Card
                  className="group relative overflow-hidden bg-card border-border hover:border-primary/50 transition-all duration-300 cursor-pointer h-full"
                  onClick={() => navigate(problem.route)}
                >
                  {/* Gradient overlay */}
                  <motion.div
                    className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity"
                    style={{
                      background: `linear-gradient(135deg, ${problem.color} 0%, transparent 100%)`,
                    }}
                  />

                  <div className="p-6 relative z-10">
                    {/* Icon */}
                    <motion.div
                      className="mb-4"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <div
                        className="w-16 h-16 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${problem.color}20` }}
                      >
                        <Icon
                          className="w-8 h-8"
                          style={{ color: problem.color }}
                        />
                      </div>
                    </motion.div>

                    {/* Status Badge */}
                    <Badge
                      variant={problem.status === "solved" ? "default" : "secondary"}
                      className="mb-3"
                    >
                      {problem.status === "solved" ? "✓ Resuelto" : problem.prize}
                    </Badge>

                    {/* Title */}
                    <h3 className="text-2xl font-bold mb-2 text-foreground group-hover:text-primary transition-colors">
                      {problem.title}
                    </h3>

                    {/* Description */}
                    <p className="text-muted-foreground mb-4 leading-relaxed">
                      {problem.shortDesc}
                    </p>

                    {/* Field */}
                    <div className="flex items-center gap-2 text-sm">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: problem.color }}
                      />
                      <span className="text-muted-foreground">{problem.field}</span>
                    </div>
                  </div>

                  {/* Hover effect */}
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-1"
                    style={{ backgroundColor: problem.color }}
                    initial={{ scaleX: 0 }}
                    whileHover={{ scaleX: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                </Card>
              </motion.div>
            );
          })}

          {/* Bonus Card - AI Visual Challenges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
          >
            <Card
              className="group relative overflow-hidden bg-gradient-primary border-2 border-primary/30 hover:border-primary transition-all duration-300 cursor-pointer h-full"
              onClick={() => navigate("/ai-challenges")}
            >
              <div className="p-6 relative z-10">
                <motion.div
                  className="mb-4"
                  whileHover={{ scale: 1.1, rotate: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="w-16 h-16 rounded-xl bg-primary/20 flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-primary" />
                  </div>
                </motion.div>

                <Badge variant="outline" className="mb-3 border-primary text-primary">
                  Bonus • Problema Moderno
                </Badge>

                <h3 className="text-2xl font-bold mb-2 text-foreground group-hover:text-primary transition-colors">
                  Desafíos de IA Visual
                </h3>

                <p className="text-muted-foreground mb-4 leading-relaxed">
                  Los 6 problemas al escalar contenido visual generado por IA a un millón
                </p>

                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="text-muted-foreground">Inteligencia Artificial</span>
                </div>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      </section>

      {/* Info Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="bg-card border-y border-border py-16"
      >
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-6 text-foreground">
            Sobre los Problemas del Milenio
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed mb-6">
            En el año 2000, el Clay Mathematics Institute seleccionó siete problemas matemáticos
            fundamentales que habían resistido solución durante décadas o incluso siglos. Cada problema
            representa un desafío profundo en su campo y su resolución tendría implicaciones
            revolucionarias para las matemáticas y la ciencia.
          </p>
          <p className="text-muted-foreground">
            Solo <span className="text-primary font-semibold">Grigori Perelman</span> ha resuelto uno:
            la Conjetura de Poincaré en 2003 (rechazó el premio).
          </p>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="bg-gradient-header border-t border-border py-12">
        <div className="container mx-auto px-6 text-center">
          <p className="text-muted-foreground mb-4">
            Basado en los problemas oficiales del{" "}
            <a
              href="https://www.claymath.org/millennium-problems/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Clay Mathematics Institute
            </a>
          </p>
          <p className="text-sm text-muted-foreground">
            Visualizaciones interactivas • Explicaciones multinivel • Referencias académicas
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
