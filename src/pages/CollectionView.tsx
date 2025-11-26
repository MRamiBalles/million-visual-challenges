import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Heart, Eye, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { millenniumProblems } from "@/data/millennium-problems";

interface Collection {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  is_public: boolean;
  created_at: string;
}

interface CollectionExperiment {
  id: string;
  title: string;
  problem_slug: string;
  likes_count: number;
  view_count: number;
  share_token: string;
  added_at: string;
}

const CollectionView = () => {
  const { collectionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [experiments, setExperiments] = useState<CollectionExperiment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (collectionId) {
      loadCollection();
    }
  }, [collectionId]);

  const loadCollection = async () => {
    setLoading(true);

    // Load collection
    const { data: collectionData, error: collectionError } = await supabase
      .from("collections")
      .select("*")
      .eq("id", collectionId)
      .single();

    if (collectionError || !collectionData) {
      toast({
        title: "Error",
        description: "No se encontró la colección",
        variant: "destructive",
      });
      navigate("/");
      return;
    }

    // Check if user has access
    if (!collectionData.is_public && collectionData.user_id !== user?.id) {
      toast({
        title: "Acceso Denegado",
        description: "Esta colección es privada",
        variant: "destructive",
      });
      navigate("/");
      return;
    }

    setCollection(collectionData);

    // Load experiments in collection
    const { data: experimentsData } = await supabase
      .from("collection_experiments")
      .select(`
        added_at,
        experiments (
          id,
          title,
          problem_slug,
          likes_count,
          view_count,
          share_token
        )
      `)
      .eq("collection_id", collectionId)
      .order("added_at", { ascending: false });

    if (experimentsData) {
      const formattedExperiments = experimentsData
        .map((item: any) => ({
          ...item.experiments,
          added_at: item.added_at,
        }))
        .filter((exp: any) => exp.id); // Filter out null experiments
      setExperiments(formattedExperiments);
    }

    setLoading(false);
  };

  const getProblemInfo = (slug: string) => {
    return millenniumProblems.find((p) => p.slug === slug);
  };

  const viewExperiment = (experiment: CollectionExperiment) => {
    navigate(`/shared/${experiment.share_token}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
          <p className="text-muted-foreground">Cargando colección...</p>
        </div>
      </div>
    );
  }

  if (!collection) return null;

  return (
    <div className="min-h-screen bg-background">
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-header border-b border-border sticky top-0 z-50 backdrop-blur-sm"
      >
        <div className="container mx-auto px-6 py-4">
          <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Volver
          </Button>
        </div>
      </motion.header>

      <section className="container mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto"
        >
          <Card className="p-8 mb-8">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-4xl font-bold mb-2">{collection.name}</h1>
                {collection.description && (
                  <p className="text-muted-foreground">{collection.description}</p>
                )}
              </div>
              {!collection.is_public && (
                <Badge variant="secondary" className="gap-2">
                  <Lock className="w-4 h-4" />
                  Privada
                </Badge>
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              {experiments.length} {experiments.length === 1 ? "experimento" : "experimentos"}
            </div>
          </Card>

          {experiments.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">Esta colección está vacía</p>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {experiments.map((experiment, index) => {
                const problem = getProblemInfo(experiment.problem_slug);

                return (
                  <motion.div
                    key={experiment.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card
                      className="p-6 h-full flex flex-col hover:border-primary/50 transition-all cursor-pointer group"
                      onClick={() => viewExperiment(experiment)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <Badge
                          variant="secondary"
                          style={{
                            backgroundColor:
                              problem?.field === "Ciencias de la Computación"
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

                      <div className="mt-auto pt-4 border-t border-border">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Eye className="w-4 h-4" />
                            {experiment.view_count}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Heart className="w-4 h-4" />
                            {experiment.likes_count}
                          </div>
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

export default CollectionView;
