import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, Send, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Comment {
  id: string;
  comment_text: string;
  created_at: string;
  user_id: string;
  profiles: {
    username: string;
    display_name: string;
    avatar_url: string | null;
  };
}

interface ExperimentCommentsProps {
  experimentId: string;
}

const ExperimentComments = ({ experimentId }: ExperimentCommentsProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadComments();
    
    // Set up realtime subscription
    const channel = supabase
      .channel(`experiment_comments:${experimentId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "experiment_comments",
          filter: `experiment_id=eq.${experimentId}`,
        },
        () => {
          loadComments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [experimentId]);

  const loadComments = async () => {
    const { data, error } = await supabase
      .from("experiment_comments")
      .select(`
        id,
        comment_text,
        created_at,
        user_id,
        profiles (
          username,
          display_name,
          avatar_url
        )
      `)
      .eq("experiment_id", experimentId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading comments:", error);
    } else if (data) {
      setComments(data as any);
    }
  };

  const handleSubmitComment = async () => {
    if (!user) {
      toast({
        title: "Inicia sesión",
        description: "Debes iniciar sesión para comentar",
        variant: "destructive",
      });
      return;
    }

    if (!newComment.trim()) {
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .from("experiment_comments")
      .insert({
        experiment_id: experimentId,
        user_id: user.id,
        comment_text: newComment.trim(),
      });

    if (error) {
      toast({
        title: "Error",
        description: "No se pudo publicar el comentario",
        variant: "destructive",
      });
    } else {
      setNewComment("");
      toast({
        title: "Comentario publicado",
        description: "Tu comentario se ha agregado correctamente",
      });
    }

    setLoading(false);
  };

  const handleDeleteComment = async (commentId: string) => {
    const { error } = await supabase
      .from("experiment_comments")
      .delete()
      .eq("id", commentId)
      .eq("user_id", user?.id);

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
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
        <MessageSquare className="w-5 h-5" />
        Comentarios ({comments.length})
      </h3>

      {/* New Comment Form */}
      {user ? (
        <div className="mb-6">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Escribe un comentario..."
            rows={3}
            className="mb-3"
          />
          <Button
            onClick={handleSubmitComment}
            disabled={loading || !newComment.trim()}
            className="gap-2"
          >
            <Send className="w-4 h-4" />
            Publicar
          </Button>
        </div>
      ) : (
        <Card className="p-4 mb-6 bg-muted/30">
          <p className="text-sm text-muted-foreground text-center">
            <Button variant="link" onClick={() => navigate("/auth")} className="p-0">
              Inicia sesión
            </Button>{" "}
            para dejar un comentario
          </p>
        </Card>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Aún no hay comentarios. ¡Sé el primero en comentar!
          </p>
        ) : (
          comments.map((comment) => (
            <Card key={comment.id} className="p-4">
              <div className="flex items-start gap-3">
                <div
                  className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden cursor-pointer"
                  onClick={() => navigate(`/profile/${comment.profiles.username}`)}
                >
                  {comment.profiles.avatar_url ? (
                    <img
                      src={comment.profiles.avatar_url}
                      alt={comment.profiles.display_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-bold text-primary">
                      {comment.profiles.display_name?.charAt(0) || "U"}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span
                        className="font-semibold cursor-pointer hover:text-primary"
                        onClick={() => navigate(`/profile/${comment.profiles.username}`)}
                      >
                        {comment.profiles.display_name}
                      </span>
                      <span className="text-sm text-muted-foreground ml-2">
                        @{comment.profiles.username}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {new Date(comment.created_at).toLocaleDateString("es-ES", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {user?.id === comment.user_id && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleDeleteComment(comment.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <p className="text-foreground whitespace-pre-wrap">
                    {comment.comment_text}
                  </p>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </Card>
  );
};

export default ExperimentComments;
