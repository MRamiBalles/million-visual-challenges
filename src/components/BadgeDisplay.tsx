import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Award } from "lucide-react";

interface UserBadge {
  id: string;
  badge_id: string;
  earned_at: string;
  badges: {
    name: string;
    description: string;
    icon: string;
  };
}

const BadgeDisplay = () => {
  const { user } = useAuth();
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadUserBadges();
    }
  }, [user]);

  const loadUserBadges = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("user_badges")
      .select(`
        id,
        badge_id,
        earned_at,
        badges (
          name,
          description,
          icon
        )
      `)
      .eq("user_id", user.id)
      .order("earned_at", { ascending: false });

    if (error) {
      console.error("Error loading badges:", error);
    } else if (data) {
      setUserBadges(data as any);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-secondary rounded w-1/3"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-secondary rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (userBadges.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
          <Award className="w-12 h-12 mb-3 opacity-50" />
          <h3 className="font-semibold mb-2">Sin logros aún</h3>
          <p className="text-sm text-center">
            Explora problemas y comparte experimentos para desbloquear badges
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
        <Award className="w-5 h-5" />
        Tus Logros ({userBadges.length})
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {userBadges.map((userBadge) => (
          <div
            key={userBadge.id}
            className="flex flex-col items-center p-4 rounded-lg bg-gradient-to-br from-primary/10 to-secondary/20 border border-primary/20 hover:border-primary/40 transition-all"
          >
            <div className="text-4xl mb-2">{userBadge.badges.icon}</div>
            <h4 className="font-semibold text-sm text-center mb-1">
              {userBadge.badges.name}
            </h4>
            <p className="text-xs text-muted-foreground text-center mb-2">
              {userBadge.badges.description}
            </p>
            <Badge variant="outline" className="text-xs">
              {new Date(userBadge.earned_at).toLocaleDateString("es-ES", {
                month: "short",
                day: "numeric",
              })}
            </Badge>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default BadgeDisplay;
