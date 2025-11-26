import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Eye, MessageSquare, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Comment {
  id: string;
  comment_text: string;
  created_at: string;
  experiment_id: string;
  user_id: string;
  profiles: {
    username: string;
    display_name: string;
  };
}

interface Experiment {
  id: string;
  title: string;
  description: string;
  created_at: string;
  user_id: string;
  likes_count: number;
  view_count: number;
  profiles: {
    username: string;
    display_name: string;
  };
}

const ContentModeration = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [comments, setComments] = useState<Comment[]>([]);
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    setLoading(true);

    // Load comments
    const { data: commentsData } = await supabase
      .from("experiment_comments")
      .select(`
        id,
        comment_text,
        created_at,
        experiment_id,
        user_id,
        profiles (username, display_name)
      `)
      .order("created_at", { ascending: false })
      .limit(100);

    // Load experiments
    const { data: experimentsData } = await supabase
      .from("experiments")
      .select(`
        id,
        title,
        description,
        created_at,
        user_id,
        likes_count,
        view_count,
        profiles (username, display_name)
      `)
      .eq("is_public", true)
      .order("created_at", { ascending: false })
      .limit(50);

    setComments((commentsData as any) || []);
    setExperiments((experimentsData as any) || []);
    setLoading(false);
  };

  const deleteComment = async (commentId: string) => {
    const { error } = await supabase
      .from("experiment_comments")
      .delete()
      .eq("id", commentId);

    if (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el comentario",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Comentario eliminado",
        description: "El comentario se ha eliminado correctamente",
      });
      loadContent();
    }
  };

  const deleteExperiment = async (experimentId: string) => {
    const { error } = await supabase
      .from("experiments")
      .delete()
      .eq("id", experimentId);

    if (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el experimento",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Experimento eliminado",
        description: "El experimento se ha eliminado correctamente",
      });
      loadContent();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
          <p className="text-muted-foreground">Cargando contenido...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Moderación de Contenido</h2>

      <Tabs defaultValue="comments" className="w-full">
        <TabsList>
          <TabsTrigger value="comments" className="gap-2">
            <MessageSquare className="w-4 h-4" />
            Comentarios ({comments.length})
          </TabsTrigger>
          <TabsTrigger value="experiments" className="gap-2">
            <FileText className="w-4 h-4" />
            Experimentos ({experiments.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="comments" className="space-y-4 mt-6">
          {comments.map((comment) => (
            <Card key={comment.id} className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{comment.profiles.display_name}</span>
                    <span className="text-sm text-muted-foreground">
                      @{comment.profiles.username}
                    </span>
                    <Badge variant="secondary">
                      {new Date(comment.created_at).toLocaleDateString("es-ES")}
                    </Badge>
                  </div>
                  <p className="text-foreground">{comment.comment_text}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => navigate(`/community`)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => deleteComment(comment.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="experiments" className="space-y-4 mt-6">
          {experiments.map((experiment) => (
            <Card key={experiment.id} className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg">{experiment.title}</h3>
                    <Badge variant="secondary">
                      {new Date(experiment.created_at).toLocaleDateString("es-ES")}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{experiment.description}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Por: {experiment.profiles.display_name}</span>
                    <span>❤️ {experiment.likes_count}</span>
                    <span>👁️ {experiment.view_count}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => navigate(`/community`)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => deleteExperiment(experiment.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ContentModeration;