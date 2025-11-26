import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Save, Loader2, CheckCircle, AlertCircle, Share2, Copy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ExperimentSaverProps {
  problemSlug: string;
  experimentType: string;
  experimentData: any;
  onSaved?: () => void;
}

export const ExperimentSaver = ({ 
  problemSlug, 
  experimentType, 
  experimentData,
  onSaved 
}: ExperimentSaverProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [shareToken, setShareToken] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSave = async () => {
    if (!title.trim()) {
      toast({
        title: "Título requerido",
        description: "Por favor ingresa un título para tu experimento.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      toast({
        title: "Autenticación requerida",
        description: "Debes iniciar sesión para guardar experimentos.",
        variant: "destructive",
      });
      setIsSaving(false);
      return;
    }

    // Generate share token if experiment is public
    let token = null;
    if (isPublic) {
      const { data: tokenData, error: tokenError } = await supabase
        .rpc("generate_share_token");
      
      if (tokenError) {
        console.error("Error generating token:", tokenError);
      } else {
        token = tokenData;
      }
    }

    const { data, error } = await supabase.from("experiments").insert({
      user_id: session.user.id,
      problem_slug: problemSlug,
      experiment_type: experimentType,
      experiment_data: experimentData,
      title: title.trim(),
      description: description.trim() || null,
      is_public: isPublic,
      share_token: token,
    }).select().single();

    setIsSaving(false);

    if (error) {
      console.error("Error saving experiment:", error);
      toast({
        title: "Error al guardar",
        description: "No se pudo guardar el experimento. Intenta de nuevo.",
        variant: "destructive",
      });
      return;
    }

    setSaved(true);
    if (data?.share_token) {
      setShareToken(data.share_token);
    }

    toast({
      title: "¡Experimento guardado!",
      description: isPublic ? "Tu experimento es público y compartible." : "Tu experimento se guardó correctamente.",
    });

    setTimeout(() => {
      setIsOpen(false);
      setSaved(false);
      setTitle("");
      setDescription("");
      setIsPublic(false);
      setShareToken(null);
      onSaved?.();
    }, 3000);
  };

  const copyShareLink = () => {
    if (shareToken) {
      const url = `${window.location.origin}/shared/${shareToken}`;
      navigator.clipboard.writeText(url);
      toast({
        title: "Enlace copiado",
        description: "El enlace se copió al portapapeles.",
      });
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        size="sm"
        className="gap-2"
      >
        <Save className="w-4 h-4" />
        Guardar Experimento
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => !isSaving && !saved && setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <Card className="w-full max-w-md p-6 space-y-4">
                <h2 className="text-2xl font-bold text-foreground">
                  Guardar Experimento
                </h2>

                {!saved ? (
                  <>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">
                        Título *
                      </label>
                      <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Ej: Mi mejor ruta TSP"
                        disabled={isSaving}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">
                        Descripción (opcional)
                      </label>
                      <Textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Añade notas sobre este experimento..."
                        rows={3}
                        disabled={isSaving}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                      <div className="space-y-0.5">
                        <Label htmlFor="public-switch" className="text-sm font-medium">
                          Hacer público
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Permitir que otros vean este experimento en la galería comunitaria
                        </p>
                      </div>
                      <Switch
                        id="public-switch"
                        checked={isPublic}
                        onCheckedChange={setIsPublic}
                        disabled={isSaving}
                      />
                    </div>

                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        onClick={() => setIsOpen(false)}
                        disabled={isSaving}
                      >
                        Cancelar
                      </Button>
                      <Button
                        onClick={handleSave}
                        disabled={isSaving || !title.trim()}
                        className="gap-2"
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Guardando...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            Guardar
                          </>
                        )}
                      </Button>
                    </div>
                  </>
                ) : (
                  <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    className="py-8 flex flex-col items-center gap-3"
                  >
                    <CheckCircle className="w-16 h-16 text-green-500" />
                    <p className="text-lg font-semibold text-foreground">
                      ¡Guardado correctamente!
                    </p>
                    
                    {shareToken && (
                      <div className="w-full mt-4 space-y-3">
                        <div className="bg-muted/50 p-4 rounded-lg">
                          <p className="text-sm text-muted-foreground mb-2">
                            Enlace para compartir:
                          </p>
                          <div className="flex gap-2">
                            <Input
                              value={`${window.location.origin}/shared/${shareToken}`}
                              readOnly
                              className="text-sm"
                            />
                            <Button
                              onClick={copyShareLink}
                              variant="outline"
                              size="sm"
                              className="gap-2"
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};