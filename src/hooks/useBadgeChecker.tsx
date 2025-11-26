import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  criteria_type: string;
  criteria_value: number;
}

export const useBadgeChecker = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;

    checkAndAwardBadges();
  }, [user]);

  const checkAndAwardBadges = async () => {
    if (!user) return;

    // Load all badges
    const { data: badges } = await supabase
      .from("badges")
      .select("*");

    if (!badges) return;

    // Load user's current badges
    const { data: userBadges } = await supabase
      .from("user_badges")
      .select("badge_id")
      .eq("user_id", user.id);

    const earnedBadgeIds = new Set(userBadges?.map((ub) => ub.badge_id) || []);

    // Check each badge criteria
    for (const badge of badges) {
      if (earnedBadgeIds.has(badge.id)) continue;

      const earned = await checkBadgeCriteria(badge);
      if (earned) {
        await awardBadge(badge);
      }
    }
  };

  const checkBadgeCriteria = async (badge: Badge): Promise<boolean> => {
    if (!user) return false;

    switch (badge.criteria_type) {
      case "time_spent": {
        const { data } = await supabase
          .from("user_activity")
          .select("duration_seconds")
          .eq("user_id", user.id);

        const totalTime = data?.reduce((sum, activity) => sum + activity.duration_seconds, 0) || 0;
        return totalTime >= badge.criteria_value;
      }

      case "problems_explored": {
        const { data } = await supabase
          .from("user_activity")
          .select("problem_slug")
          .eq("user_id", user.id);

        const uniqueProblems = new Set(data?.map((a) => a.problem_slug) || []);
        return uniqueProblems.size >= badge.criteria_value;
      }

      case "experiments_shared": {
        const { count } = await supabase
          .from("experiments")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("is_public", true);

        return (count || 0) >= badge.criteria_value;
      }

      case "likes_received": {
        const { data } = await supabase
          .from("experiments")
          .select("likes_count")
          .eq("user_id", user.id);

        const totalLikes = data?.reduce((sum, exp) => sum + (exp.likes_count || 0), 0) || 0;
        return totalLikes >= badge.criteria_value;
      }

      default:
        return false;
    }
  };

  const awardBadge = async (badge: Badge) => {
    if (!user) return;

    const { error } = await supabase
      .from("user_badges")
      .insert({
        user_id: user.id,
        badge_id: badge.id,
      });

    if (!error) {
      toast({
        title: "¡Nuevo logro desbloqueado!",
        description: `${badge.icon} ${badge.name}: ${badge.description}`,
      });
    }
  };

  return { checkAndAwardBadges };
};
