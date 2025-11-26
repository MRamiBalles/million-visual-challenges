import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Trash2, ExternalLink, Search, Calendar, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { millenniumProblems } from "@/data/millennium-problems";

interface Experiment {
  id: string;
  problem_slug: string;
  experiment_type: string;
  experiment_data: any;
  title: string;
  description: string | null;
  created_at: string;
  user_id: string;
}

const ExperimentsGallery = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    
    loadExperiments();
  }, [user, navigate]);

  const loadExperiments = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("experiments")
      .select("*")
      .eq("user_id", user?.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading experiments:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los experimentos.",
        variant: "destructive",
      });
    } else {
      setExperiments(data || []);
    }
    setLoading(false);
  };

  const deleteExperiment = async (id: string) => {
    const { error } = await supabase
      .from("experiments")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el experimento.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Eliminado",
        description: "Experimento eliminado correctamente.",
      });
      loadExperiments();
    }
  };

  const getProblemInfo = (slug: string) => {
    return millenniumProblems.find(p => p.slug === slug);
  };

  const filteredExperiments = experiments.filter(exp =>
    exp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    exp.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
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
              Volver
            </Button>
            
            <Badge variant="secondary" className="gap-2">
              <User className="w-4 h-4" />
              {experiments.length} experimentos
            </Badge>
          </div>
        </div>
      </motion.header>

      <section className="container mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-3 text-foreground">
            Mis Experimentos
          </h1>
          <p className="text-muted-foreground mb-8">
            Todos tus experimentos guardados de los Problemas del Milenio
          </p>

          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Buscar experimentos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              <p className="mt-4 text-muted-foreground">Cargando experimentos...</p>
            </div>
          ) : filteredExperiments.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground mb-4">
                {searchQuery
                  ? "No se encontraron experimentos con ese criterio."
                  : "Aún no has guardado ningún experimento."}
              </p>
              <Button onClick={() => navigate("/")}>
                Explorar Problemas
              </Button>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredExperiments.map((experiment, index) => {
                const problem = getProblemInfo(experiment.problem_slug);
                
                return (
                  <motion.div
                    key={experiment.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="p-6 h-full flex flex-col hover:border-primary/50 transition-all">
                      <div className="flex items-start justify-between mb-3">
                        <Badge
                          variant="secondary"
                          style={{
                            backgroundColor: problem?.field === "Ciencias de la Computación"
                              ? "hsl(280, 100%, 70%, 0.2)"
                              : "hsl(var(--secondary))",
                          }}
                        >
                          {problem?.title || experiment.problem_slug}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteExperiment(experiment.id)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      <h3 className="text-xl font-bold mb-2 text-foreground">
                        {experiment.title}
                      </h3>

                      {experiment.description && (
                        <p className="text-sm text-muted-foreground mb-4 flex-1">
                          {experiment.description}
                        </p>
                      )}

                      <div className="space-y-2 pt-4 border-t border-border">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          {new Date(experiment.created_at).toLocaleDateString("es-ES", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </div>

                        <div className="text-xs text-muted-foreground">
                          Tipo: <span className="font-mono">{experiment.experiment_type}</span>
                        </div>
                      </div>

                      <Button
                        onClick={() => navigate(`/${experiment.problem_slug}`)}
                        variant="outline"
                        size="sm"
                        className="mt-4 gap-2 w-full"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Ir al problema
                      </Button>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </section>
    </div>
  );
};

export default ExperimentsGallery;