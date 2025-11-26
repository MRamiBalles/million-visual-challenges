import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  Edit, 
  Globe, 
  Github, 
  Twitter, 
  Award, 
  TrendingUp,
  Clock,
  FileText,
  Heart,
  Save
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { millenniumProblems } from "@/data/millennium-problems";
import { z } from "zod";

interface Profile {
  id: string;
  user_id: string;
  username: string;
  display_name: string;
  bio: string | null;
  avatar_url: string | null;
  website_url: string | null;
  twitter_handle: string | null;
  github_handle: string | null;
}

interface UserBadge {
  id: string;
  badges: {
    name: string;
    description: string;
    icon: string;
  };
}

const profileSchema = z.object({
  display_name: z.string().trim().min(1, "El nombre es requerido").max(100, "Máximo 100 caracteres"),
  bio: z.string().max(500, "Máximo 500 caracteres").optional().or(z.literal("")),
  website_url: z.string().trim()
    .refine((val) => !val || z.string().url().safeParse(val).success, {
      message: "URL inválida"
    })
    .optional()
    .or(z.literal("")),
  twitter_handle: z.string().trim()
    .refine((val) => !val || /^@?[A-Za-z0-9_]{1,15}$/.test(val), {
      message: "Handle de Twitter inválido (máx 15 caracteres)"
    })
    .optional()
    .or(z.literal("")),
  github_handle: z.string().trim()
    .refine((val) => !val || /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i.test(val), {
      message: "Usuario de GitHub inválido"
    })
    .optional()
    .or(z.literal("")),
});

const Profile = () => {
  const navigate = useNavigate();
  const { username } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  
  const [editForm, setEditForm] = useState({
    display_name: "",
    bio: "",
    website_url: "",
    twitter_handle: "",
    github_handle: "",
  });

  const [stats, setStats] = useState({
    totalTime: 0,
    experimentsCount: 0,
    problemsExplored: 0,
    likesReceived: 0,
  });

  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [collections, setCollections] = useState<any[]>([]);

  useEffect(() => {
    if (username) {
      loadProfile(username);
    }
  }, [username]);

  const loadProfile = async (username: string) => {
    setLoading(true);

    // Load profile
    const { data: profileData, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("username", username)
      .single();

    if (error || !profileData) {
      toast({
        title: "Error",
        description: "No se pudo cargar el perfil",
        variant: "destructive",
      });
      navigate("/");
      return;
    }

    setProfile(profileData);
    setIsOwnProfile(user?.id === profileData.user_id);
    setEditForm({
      display_name: profileData.display_name || "",
      bio: profileData.bio || "",
      website_url: profileData.website_url || "",
      twitter_handle: profileData.twitter_handle || "",
      github_handle: profileData.github_handle || "",
    });

    // Load stats
    await loadUserStats(profileData.user_id);
    await loadUserBadges(profileData.user_id);
    await loadUserCollections(profileData.user_id);

    setLoading(false);
  };

  const loadUserStats = async (userId: string) => {
    const [activityData, experimentsData] = await Promise.all([
      supabase.from("user_activity").select("*").eq("user_id", userId),
      supabase.from("experiments").select("likes_count").eq("user_id", userId),
    ]);

    if (activityData.data) {
      const totalTime = activityData.data.reduce((sum, a) => sum + a.duration_seconds, 0);
      const problemsExplored = new Set(activityData.data.map((a) => a.problem_slug)).size;
      setStats((prev) => ({ ...prev, totalTime, problemsExplored }));
    }

    if (experimentsData.data) {
      const experimentsCount = experimentsData.data.length;
      const likesReceived = experimentsData.data.reduce(
        (sum, exp) => sum + (exp.likes_count || 0),
        0
      );
      setStats((prev) => ({ ...prev, experimentsCount, likesReceived }));
    }
  };

  const loadUserBadges = async (userId: string) => {
    const { data } = await supabase
      .from("user_badges")
      .select(`
        id,
        badges (
          name,
          description,
          icon
        )
      `)
      .eq("user_id", userId)
      .order("earned_at", { ascending: false });

    if (data) {
      setUserBadges(data as any);
    }
  };

  const loadUserCollections = async (userId: string) => {
    const { data } = await supabase
      .from("collections")
      .select("*")
      .eq("user_id", userId)
      .eq("is_public", true)
      .order("created_at", { ascending: false });

    if (data) {
      setCollections(data);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0]);
    }
  };

  const handleSaveProfile = async () => {
    if (!user || !profile) return;

    // Validate form data
    const validation = profileSchema.safeParse(editForm);
    if (!validation.success) {
      const firstError = validation.error.errors[0];
      toast({
        title: "Error de validación",
        description: firstError.message,
        variant: "destructive",
      });
      return;
    }

    let avatarUrl = profile.avatar_url;

    // Upload avatar if changed
    if (avatarFile) {
      const fileExt = avatarFile.name.split(".").pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, avatarFile, { upsert: true });

      if (uploadError) {
        toast({
          title: "Error",
          description: "No se pudo subir el avatar",
          variant: "destructive",
        });
        return;
      }

      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

      avatarUrl = urlData.publicUrl;
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        ...editForm,
        avatar_url: avatarUrl,
      })
      .eq("user_id", user.id);

    if (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el perfil",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Perfil actualizado",
        description: "Tu perfil se ha guardado correctamente",
      });
      setIsEditing(false);
      if (profile.username) {
        loadProfile(profile.username);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
          <p className="text-muted-foreground">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-background">
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-header border-b border-border sticky top-0 z-50 backdrop-blur-sm"
      >
        <div className="container mx-auto px-6 py-4">
          <Button variant="ghost" onClick={() => navigate("/")} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Volver
          </Button>
        </div>
      </motion.header>

      <section className="container mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-5xl mx-auto"
        >
          {/* Profile Header */}
          <Card className="p-8 mb-8">
            <div className="flex items-start gap-6 mb-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.display_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl font-bold text-primary">
                      {profile.display_name?.charAt(0) || "U"}
                    </span>
                  )}
                </div>
                {isOwnProfile && isEditing && (
                  <div className="mt-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="text-sm"
                    />
                  </div>
                )}
              </div>

              <div className="flex-1">
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <Label>Nombre</Label>
                      <Input
                        value={editForm.display_name}
                        onChange={(e) =>
                          setEditForm({ ...editForm, display_name: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label>Bio</Label>
                      <Textarea
                        value={editForm.bio}
                        onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label>Sitio Web</Label>
                      <Input
                        value={editForm.website_url}
                        onChange={(e) =>
                          setEditForm({ ...editForm, website_url: e.target.value })
                        }
                        placeholder="https://..."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Twitter</Label>
                        <Input
                          value={editForm.twitter_handle}
                          onChange={(e) =>
                            setEditForm({ ...editForm, twitter_handle: e.target.value })
                          }
                          placeholder="@usuario"
                        />
                      </div>
                      <div>
                        <Label>GitHub</Label>
                        <Input
                          value={editForm.github_handle}
                          onChange={(e) =>
                            setEditForm({ ...editForm, github_handle: e.target.value })
                          }
                          placeholder="usuario"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <h1 className="text-3xl font-bold mb-2">{profile.display_name}</h1>
                    <p className="text-muted-foreground mb-4">@{profile.username}</p>
                    {profile.bio && <p className="text-foreground mb-4">{profile.bio}</p>}
                    <div className="flex items-center gap-4 flex-wrap">
                      {profile.website_url && (
                        <a
                          href={profile.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
                        >
                          <Globe className="w-4 h-4" />
                          Sitio Web
                        </a>
                      )}
                      {profile.twitter_handle && (
                        <a
                          href={`https://twitter.com/${profile.twitter_handle.replace("@", "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
                        >
                          <Twitter className="w-4 h-4" />
                          {profile.twitter_handle}
                        </a>
                      )}
                      {profile.github_handle && (
                        <a
                          href={`https://github.com/${profile.github_handle}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
                        >
                          <Github className="w-4 h-4" />
                          {profile.github_handle}
                        </a>
                      )}
                    </div>
                  </>
                )}
              </div>

              {isOwnProfile && (
                <div className="flex gap-2">
                  {isEditing ? (
                    <>
                      <Button onClick={handleSaveProfile} className="gap-2">
                        <Save className="w-4 h-4" />
                        Guardar
                      </Button>
                      <Button variant="outline" onClick={() => setIsEditing(false)}>
                        Cancelar
                      </Button>
                    </>
                  ) : (
                    <Button onClick={() => setIsEditing(true)} className="gap-2">
                      <Edit className="w-4 h-4" />
                      Editar
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary mb-1">
                  {formatTime(stats.totalTime)}
                </div>
                <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                  <Clock className="w-4 h-4" />
                  Tiempo Total
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary mb-1">
                  {stats.experimentsCount}
                </div>
                <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                  <FileText className="w-4 h-4" />
                  Experimentos
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary mb-1">
                  {stats.problemsExplored}/7
                </div>
                <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  Problemas
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary mb-1">
                  {stats.likesReceived}
                </div>
                <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                  <Heart className="w-4 h-4" />
                  Likes
                </div>
              </div>
            </div>
          </Card>

          {/* Tabs */}
          <Tabs defaultValue="badges" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="badges">Logros</TabsTrigger>
              <TabsTrigger value="collections">Colecciones</TabsTrigger>
            </TabsList>

            <TabsContent value="badges">
              <Card className="p-6">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Logros Desbloqueados ({userBadges.length})
                </h3>
                {userBadges.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Aún no hay logros desbloqueados
                  </p>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {userBadges.map((userBadge) => (
                      <div
                        key={userBadge.id}
                        className="flex flex-col items-center p-4 rounded-lg bg-gradient-to-br from-primary/10 to-secondary/20 border border-primary/20"
                      >
                        <div className="text-4xl mb-2">{userBadge.badges.icon}</div>
                        <h4 className="font-semibold text-sm text-center mb-1">
                          {userBadge.badges.name}
                        </h4>
                        <p className="text-xs text-muted-foreground text-center">
                          {userBadge.badges.description}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </TabsContent>

            <TabsContent value="collections">
              <Card className="p-6">
                <h3 className="text-xl font-bold mb-6">Colecciones Públicas</h3>
                {collections.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Aún no hay colecciones públicas
                  </p>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {collections.map((collection) => (
                      <Card
                        key={collection.id}
                        className="p-4 hover:border-primary/50 transition-all cursor-pointer"
                        onClick={() => navigate(`/collections/${collection.id}`)}
                      >
                        <h4 className="font-semibold mb-2">{collection.name}</h4>
                        {collection.description && (
                          <p className="text-sm text-muted-foreground">
                            {collection.description}
                          </p>
                        )}
                      </Card>
                    ))}
                  </div>
                )}
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </section>
    </div>
  );
};

export default Profile;
