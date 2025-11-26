import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface UserStatistics {
    problems_visited: number;
    total_time_seconds: number;
    bookmarks_count: number;
    achievements_count: number;
    total_points: number;
    last_active_at: string | null;
}

export const useUserStatistics = (userId?: string) => {
    return useQuery({
        queryKey: ['userStatistics', userId],
        queryFn: async () => {
            if (!userId) return null;

            // Query the materialized view
            const { data, error } = await supabase
                .from('user_statistics')
                .select('*')
                .eq('user_id', userId)
                .maybeSingle();

            if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
                throw error;
            }

            // If no statistics exist yet, return defaults
            if (!data) {
                return {
                    problems_visited: 0,
                    total_time_seconds: 0,
                    bookmarks_count: 0,
                    achievements_count: 0,
                    total_points: 0,
                    last_active_at: null,
                } as UserStatistics;
            }

            return data as UserStatistics;
        },
        enabled: !!userId,
        staleTime: 1000 * 60, // 1 minute
    });
};

// Helper to format time
export const formatTimeSpent = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}min`;

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (minutes === 0) return `${hours}h`;
    return `${hours}h ${minutes}min`;
};
