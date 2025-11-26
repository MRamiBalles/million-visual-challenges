import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Heart, Eye, Search, TrendingUp, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { millenniumProblems } from "@/data/millennium-problems";

interface PublicExperiment {
  id: string;
  problem_slug: string;
  experiment_type: string;
  experiment_data: any;
  title: string;
  description: string | null;
  created_at: string;
  view_count: number;
  likes_count: number;
  share_token: string;
  user_id: string;
}

const CommunityGallery = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [experiments, setExperiments] = useState<PublicExperiment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"recent" | "popular">("popular");
  const [likedExperiments, setLikedExperiments] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadExperiments();
    if (user) {
      loadUserLikes();
    }
  }, [sortBy, user]);

  const loadExperiments = async () => {
    setLoading(true);
    
    let query = supabase
      .from("experiments")
      .select("*")
      .eq("is_public", true);

    if (sortBy === "recent") {
      query = query.order("created_at", { ascending: false });
    } else {
      query = query.order("likes_count", { ascending: false });
    }

    const { data, error } = await query.limit(50);

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

  const loadUserLikes = async () => {
    if (!user) return;

    const { data } = await supabase
      .from("experiment_likes")
      .select("experiment_id")
      .eq("user_id", user.id);

    if (data) {
      setLikedExperiments(new Set(data.map(like => like.experiment_id)));
    }
  };

  const toggleLike = async (experimentId: string) => {
    if (!user) {
      toast({
        title: "Inicia sesión",
        description: "Debes iniciar sesión para dar like.",
        variant: "destructive",
      });
      return;
    }

    const isLiked = likedExperiments.has(experimentId);

    if (isLiked) {
      const { error } = await supabase
        .from("experiment_likes")
        .delete()
        .eq("experiment_id", experimentId)
        .eq("user_id", user.id);

      if (!error) {
        setLikedExperiments(prev => {
          const newSet = new Set(prev);
          newSet.delete(experimentId);
          return newSet;
        });
        loadExperiments(); // Refresh to update counts
      }
    } else {
      const { error } = await supabase
        .from("experiment_likes")
        .insert({
          experiment_id: experimentId,
          user_id: user.id,
        });

      if (!error) {
        setLikedExperiments(prev => new Set(prev).add(experimentId));
        loadExperiments(); // Refresh to update counts
      }
    }
  };

  const incrementViewCount = async (experimentId: string) => {
    // Get current view count and increment
    const { data: current } = await supabase
      .from("experiments")
      .select("view_count")
      .eq("id", experimentId)
      .single();

    if (current) {
      await supabase
        .from("experiments")
        .update({ view_count: (current.view_count || 0) + 1 })
        .eq("id", experimentId);
    }
  };

  const viewExperiment = (experiment: PublicExperiment) => {
    incrementViewCount(experiment.id);
    navigate(`/shared/${experiment.share_token}`);
  };

  const getProblemInfo = (slug: string) => {
    return millenniumProblems.find(p => p.slug === slug);
  };

  const filteredExperiments = experiments.filter(exp =>
    exp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    exp.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    getProblemInfo(exp.problem_slug)?.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            
            <Badge variant="secondary">
              {experiments.length} experimentos públicos
            </Badge>
          </div>
        </div>
      </motion.header>

      <section className="container mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-3 text-foreground">
            Galería Comunitaria
          </h1>
          <p className="text-muted-foreground mb-8">
            Descubre experimentos compartidos por la comunidad
          </p>

          <div className="flex items-center gap-4 mb-6 flex-wrap">
            <div className="flex-1 min-w-[250px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Buscar experimentos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => setSortBy("popular")}
                variant={sortBy === "popular" ? "default" : "outline"}
                size="sm"
                className="gap-2"
              >
                <TrendingUp className="w-4 h-4" />
                Populares
              </Button>
              <Button
                onClick={() => setSortBy("recent")}
                variant={sortBy === "recent" ? "default" : "outline"}
                size="sm"
                className="gap-2"
              >
                <Calendar className="w-4 h-4" />
                Recientes
              </Button>
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
                  : "Aún no hay experimentos públicos. ¡Sé el primero en compartir!"}
              </p>
              {!searchQuery && (
                <Button onClick={() => navigate("/experiments")}>
                  Compartir un experimento
                </Button>
              )}
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredExperiments.map((experiment, index) => {
                const problem = getProblemInfo(experiment.problem_slug);
                const isLiked = likedExperiments.has(experiment.id);
                
                return (
                  <motion.div
                    key={experiment.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="p-6 h-full flex flex-col hover:border-primary/50 transition-all cursor-pointer group"
                      onClick={() => viewExperiment(experiment)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <Badge
                          variant="secondary"
                          style={{
                            backgroundColor: problem?.field === "Ciencias de la Computación"
                              ? "hsl(280, 100%, 70%, 0.2)"
                              : problem?.field === "Teoría de Números"
                              ? "hsl(195, 100%, 50%, 0.2)"
                              : "hsl(var(--secondary))",
                          }}
                        >
                          {problem?.title || experiment.problem_slug}
                        </Badge>
                      </div>

                      <h3 className="text-xl font-bold mb-2 text-foreground group-hover:text-primary transition-colors">
                        {experiment.title}
                      </h3>

                      {experiment.description && (
                        <p className="text-sm text-muted-foreground mb-4 flex-1 line-clamp-3">
                          {experiment.description}
                        </p>
                      )}

                      <div className="space-y-3 pt-4 border-t border-border">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Eye className="w-4 h-4" />
                              {experiment.view_count}
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleLike(experiment.id);
                              }}
                              className={`flex items-center gap-1 text-sm transition-colors ${
                                isLiked ? "text-red-500" : "text-muted-foreground hover:text-red-500"
                              }`}
                            >
                              <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
                              {experiment.likes_count}
                            </button>
                          </div>

                          <Badge variant="outline" className="text-xs">
                            {new Date(experiment.created_at).toLocaleDateString("es-ES", {
                              month: "short",
                              day: "numeric",
                            })}
                          </Badge>
                        </div>
                      </div>
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

export default CommunityGallery;