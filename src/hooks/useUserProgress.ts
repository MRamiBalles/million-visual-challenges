// Custom hook for user progress tracking
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { UserProgress, InsertUserProgress } from "@/types/database";
import type { DifficultyLevel } from "@/components/problem";

export const useUserProgress = (problemId: number, userId?: string) => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    // Fetch progress
    const { data: progress, isLoading } = useQuery({
        queryKey: ["user-progress", userId, problemId],
        queryFn: async () => {
            if (!userId) return null;

            const { data, error } = await supabase
                .from("user_progress")
                .select("*")
                .eq("user_id", userId)
                .eq("problem_id", problemId)
                .single();

            if (error && error.code !== "PGRST116") throw error; // PGRST116 = no rows
            return data as UserProgress | null;
        },
        enabled: !!userId,
    });

    // Update level
    const updateLevel = useMutation({
        mutationFn: async (level: DifficultyLevel) => {
            if (!userId) throw new Error("User not authenticated");

            const { data, error } = await supabase
                .from("user_progress")
                .upsert({
                    user_id: userId,
                    problem_id: problemId,
                    current_level: level,
                    last_visited_at: new Date().toISOString(),
                }, { onConflict: "user_id,problem_id" })
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["user-progress", userId, problemId] });
        },
    });

    // Toggle bookmark
    const toggleBookmark = useMutation({
        mutationFn: async () => {
            if (!userId) throw new Error("User not authenticated");

            const newBookmarkState = !progress?.bookmarked;

            const { data, error } = await supabase
                .from("user_progress")
                .upsert({
                    user_id: userId,
                    problem_id: problemId,
                    bookmarked: newBookmarkState,
                    last_visited_at: new Date().toISOString(),
                }, { onConflict: "user_id,problem_id" })
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["user-progress", userId, problemId] });
            toast({
                title: data.bookmarked ? "Guardado en favoritos" : "Eliminado de favoritos",
                description: data.bookmarked ? "Puedes encontrar este problema en tu perfil" : "",
            });
        },
    });

    // Update time spent
    const updateTimeSpent = useMutation({
        mutationFn: async (seconds: number) => {
            if (!userId) return null;

            const currentTime = progress?.total_time_spent || 0;

            const { data, error } = await supabase
                .from("user_progress")
                .upsert({
                    user_id: userId,
                    problem_id: problemId,
                    total_time_spent: currentTime + seconds,
                    last_visited_at: new Date().toISOString(),
                }, { onConflict: "user_id,problem_id" })
                .select()
                .single();

            if (error) throw error;
            return data;
        },
    });

    return {
        progress,
        isLoading,
        updateLevel: updateLevel.mutate,
        toggleBookmark: toggleBookmark.mutate,
        updateTimeSpent: updateTimeSpent.mutate,
        isBookmarked: progress?.bookmarked || false,
    };
};
