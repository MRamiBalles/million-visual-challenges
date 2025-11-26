import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Heart, Eye, Share2, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { millenniumProblems } from "@/data/millennium-problems";

interface SharedExperimentData {
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

const SharedExperiment = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [experiment, setExperiment] = useState<SharedExperimentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    if (token) {
      loadExperiment();
    }
  }, [token]);

  useEffect(() => {
    if (user && experiment) {
      checkIfLiked();
    }
  }, [user, experiment]);

  const loadExperiment = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("experiments")
      .select("*")
      .eq("share_token", token)
      .eq("is_public", true)
      .single();

    if (error || !data) {
      toast({
        title: "Error",
        description: "No se encontró el experimento compartido.",
        variant: "destructive",
      });
      navigate("/");
      return;
    }

    setExperiment(data);
    
    // Increment view count
    const { data: current } = await supabase
      .from("experiments")
      .select("view_count")
      .eq("id", data.id)
      .single();

    if (current) {
      await supabase
        .from("experiments")
        .update({ view_count: (current.view_count || 0) + 1 })
        .eq("id", data.id);
    }

    setLoading(false);
  };

  const checkIfLiked = async () => {
    if (!user || !experiment) return;

    const { data } = await supabase
      .from("experiment_likes")
      .select("id")
      .eq("experiment_id", experiment.id)
      .eq("user_id", user.id)
      .single();

    setIsLiked(!!data);
  };

  const toggleLike = async () => {
    if (!user) {
      toast({
        title: "Inicia sesión",
        description: "Debes iniciar sesión para dar like.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    if (!experiment) return;

    if (isLiked) {
      const { error } = await supabase
        .from("experiment_likes")
        .delete()
        .eq("experiment_id", experiment.id)
        .eq("user_id", user.id);

      if (!error) {
        setIsLiked(false);
        setExperiment({
          ...experiment,
          likes_count: Math.max(0, experiment.likes_count - 1),
        });
      }
    } else {
      const { error } = await supabase
        .from("experiment_likes")
        .insert({
          experiment_id: experiment.id,
          user_id: user.id,
        });

      if (!error) {
        setIsLiked(true);
        setExperiment({
          ...experiment,
          likes_count: experiment.likes_count + 1,
        });
      }
    }
  };

  const copyShareLink = () => {
    const url = `${window.location.origin}/shared/${token}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Enlace copiado",
      description: "El enlace se copió al portapapeles.",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
          <p className="text-muted-foreground">Cargando experimento...</p>
        </div>
      </div>
    );
  }

  if (!experiment) {
    return null;
  }

  const problem = millenniumProblems.find(p => p.slug === experiment.problem_slug);

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
              onClick={() => navigate("/community")}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Galería Comunitaria
            </Button>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={copyShareLink}
                className="gap-2"
              >
                <Share2 className="w-4 h-4" />
                Compartir
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      <section className="container mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <div className="mb-6">
            <Badge className="mb-4" variant="secondary">
              {problem?.title || experiment.problem_slug}
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
              {experiment.title}
            </h1>
            {experiment.description && (
              <p className="text-lg text-muted-foreground">
                {experiment.description}
              </p>
            )}
          </div>

          <Card className="p-6 mb-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Eye className="w-5 h-5" />
                  <span className="text-lg font-semibold">{experiment.view_count}</span>
                  <span className="text-sm">vistas</span>
                </div>

                <button
                  onClick={toggleLike}
                  className={`flex items-center gap-2 transition-colors ${
                    isLiked ? "text-red-500" : "text-muted-foreground hover:text-red-500"
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
                  <span className="text-lg font-semibold">{experiment.likes_count}</span>
                  <span className="text-sm">likes</span>
                </button>
              </div>

              <Badge variant="outline">
                {new Date(experiment.created_at).toLocaleDateString("es-ES", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </Badge>
            </div>
          </Card>

          <Card className="p-8 bg-muted/30">
            <h2 className="text-2xl font-bold mb-4 text-foreground">
              Datos del Experimento
            </h2>
            
            <div className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Tipo de experimento</div>
                <div className="font-mono text-foreground">{experiment.experiment_type}</div>
              </div>

              <div>
                <div className="text-sm text-muted-foreground mb-2">Configuración</div>
                <pre className="bg-background p-4 rounded-lg overflow-auto text-sm">
                  {JSON.stringify(experiment.experiment_data, null, 2)}
                </pre>
              </div>
            </div>
          </Card>

          <div className="mt-8 flex gap-4 justify-center">
            <Button
              onClick={() => navigate(`/${experiment.problem_slug}`)}
              className="gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Explorar este problema
            </Button>
            <Button
              onClick={() => navigate("/community")}
              variant="outline"
            >
              Ver más experimentos
            </Button>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default SharedExperiment;