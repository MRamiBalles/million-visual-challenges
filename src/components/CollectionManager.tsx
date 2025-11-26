import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FolderPlus, MoreVertical, Check } from "lucide-react";

interface Collection {
  id: string;
  name: string;
  description: string | null;
  is_public: boolean;
}

interface CollectionManagerProps {
  experimentId: string;
}

const CollectionManager = ({ experimentId }: CollectionManagerProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [savedCollections, setSavedCollections] = useState<Set<string>>(new Set());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreateMode, setIsCreateMode] = useState(false);
  
  const [newCollection, setNewCollection] = useState({
    name: "",
    description: "",
    is_public: true,
  });

  useEffect(() => {
    if (user) {
      loadCollections();
      loadSavedCollections();
    }
  }, [user, experimentId]);

  const loadCollections = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("collections")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading collections:", error);
    } else if (data) {
      setCollections(data);
    }
  };

  const loadSavedCollections = async () => {
    if (!user) return;

    const { data } = await supabase
      .from("collection_experiments")
      .select("collection_id")
      .eq("experiment_id", experimentId)
      .in(
        "collection_id",
        collections.map((c) => c.id)
      );

    if (data) {
      setSavedCollections(new Set(data.map((item) => item.collection_id)));
    }
  };

  const handleCreateCollection = async () => {
    if (!user || !newCollection.name.trim()) return;

    const { data, error } = await supabase
      .from("collections")
      .insert({
        user_id: user.id,
        name: newCollection.name,
        description: newCollection.description || null,
        is_public: newCollection.is_public,
      })
      .select()
      .single();

    if (error) {
      toast({
        title: "Error",
        description: "No se pudo crear la colección",
        variant: "destructive",
      });
    } else if (data) {
      toast({
        title: "Colección creada",
        description: "La colección se ha creado correctamente",
      });
      setCollections([data, ...collections]);
      setNewCollection({ name: "", description: "", is_public: true });
      setIsCreateMode(false);
      
      // Add experiment to new collection
      await toggleExperimentInCollection(data.id);
    }
  };

  const toggleExperimentInCollection = async (collectionId: string) => {
    if (!user) return;

    const isSaved = savedCollections.has(collectionId);

    if (isSaved) {
      const { error } = await supabase
        .from("collection_experiments")
        .delete()
        .eq("collection_id", collectionId)
        .eq("experiment_id", experimentId);

      if (!error) {
        setSavedCollections((prev) => {
          const newSet = new Set(prev);
          newSet.delete(collectionId);
          return newSet;
        });
        toast({
          title: "Eliminado",
          description: "Experimento eliminado de la colección",
        });
      }
    } else {
      const { error } = await supabase
        .from("collection_experiments")
        .insert({
          collection_id: collectionId,
          experiment_id: experimentId,
        });

      if (!error) {
        setSavedCollections((prev) => new Set(prev).add(collectionId));
        toast({
          title: "Guardado",
          description: "Experimento agregado a la colección",
        });
      }
    }
  };

  if (!user) return null;

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <FolderPlus className="w-4 h-4" />
          Guardar en Colección
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Guardar en Colección</DialogTitle>
          <DialogDescription>
            Selecciona las colecciones donde quieres guardar este experimento
          </DialogDescription>
        </DialogHeader>

        {isCreateMode ? (
          <div className="space-y-4">
            <div>
              <Label>Nombre de la colección</Label>
              <Input
                value={newCollection.name}
                onChange={(e) =>
                  setNewCollection({ ...newCollection, name: e.target.value })
                }
                placeholder="Mi colección favorita"
              />
            </div>
            <div>
              <Label>Descripción (opcional)</Label>
              <Textarea
                value={newCollection.description}
                onChange={(e) =>
                  setNewCollection({ ...newCollection, description: e.target.value })
                }
                rows={3}
                placeholder="Describe tu colección..."
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={newCollection.is_public}
                onCheckedChange={(checked) =>
                  setNewCollection({ ...newCollection, is_public: checked as boolean })
                }
              />
              <Label>Hacer pública</Label>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreateCollection} className="flex-1">
                Crear y Guardar
              </Button>
              <Button variant="outline" onClick={() => setIsCreateMode(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {collections.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  No tienes colecciones aún
                </p>
              ) : (
                collections.map((collection) => {
                  const isSaved = savedCollections.has(collection.id);
                  return (
                    <Card
                      key={collection.id}
                      className={`p-3 cursor-pointer transition-all ${
                        isSaved ? "border-primary bg-primary/5" : ""
                      }`}
                      onClick={() => toggleExperimentInCollection(collection.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold">{collection.name}</h4>
                          {collection.description && (
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {collection.description}
                            </p>
                          )}
                        </div>
                        {isSaved && <Check className="w-5 h-5 text-primary" />}
                      </div>
                    </Card>
                  );
                })
              )}
            </div>
            <Button
              onClick={() => setIsCreateMode(true)}
              variant="outline"
              className="w-full gap-2"
            >
              <FolderPlus className="w-4 h-4" />
              Nueva Colección
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CollectionManager;
