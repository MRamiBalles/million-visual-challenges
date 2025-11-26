import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Achievement {
    id: string;
    slug: string;
    name: string;
    description: string | null;
    icon: string | null;
    category: 'learning' | 'progress' | 'community' | 'research';
    points: number;
    criteria: Record<string, any>;
    created_at: string;
}

export interface UserAchievement {
    id: string;
    user_id: string;
    achievement_id: string;
    unlocked_at: string;
    progress: Record<string, any>;
    achievement: Achievement;
}

export const useAchievements = (userId?: string) => {
    // Fetch all available achievements
    const { data: allAchievements, isLoading: isLoadingAll } = useQuery({
        queryKey: ['achievements'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('achievements')
                .select('*')
                .order('points', { ascending: true });

            if (error) throw error;
            return data as Achievement[];
        },
        staleTime: Infinity, // Achievements don't change often
    });

    // Fetch user's unlocked achievements
    const { data: userAchievements, isLoading: isLoadingUser } = useQuery({
        queryKey: ['userAchievements', userId],
        queryFn: async () => {
            if (!userId) return [];

            const { data, error } = await supabase
                .from('user_achievements')
                .select(`
          *,
          achievement:achievements(*)
        `)
                .eq('user_id', userId)
                .order('unlocked_at', { ascending: false });

            if (error) throw error;
            return data as UserAchievement[];
        },
        enabled: !!userId,
        staleTime: 1000 * 60, // 1 minute
    });

    // Calculate unlocked vs total
    const unlockedCount = userAchievements?.length || 0;
    const totalCount = allAchievements?.length || 0;
    const completionPercentage = totalCount > 0
        ? Math.round((unlockedCount / totalCount) * 100)
        : 0;

    // Get unlocked achievement IDs for easy checking
    const unlockedIds = new Set(
        userAchievements?.map(ua => ua.achievement_id) || []
    );

    const isUnlocked = (achievementId: string) => unlockedIds.has(achievementId);

    return {
        allAchievements: allAchievements || [],
        userAchievements: userAchievements || [],
        unlockedCount,
        totalCount,
        completionPercentage,
        isUnlocked,
        isLoading: isLoadingAll || isLoadingUser,
    };
};
