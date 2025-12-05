import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { MillenniumProblem, ResearchPaper, UserProgress } from "@/types/database";

interface UseProblemData {
    problem: MillenniumProblem | null;
    papers: ResearchPaper[];
    userProgress: UserProgress | null;
    isLoading: boolean;
    error: Error | null;
}

export const useProblem = (slug: string): UseProblemData => {
    const { user } = useAuth();

    const { data: problem, isLoading: isProblemLoading, error: problemError } = useQuery({
        queryKey: ["problem", slug],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("millennium_problems")
                .select("*")
                .eq("slug", slug)
                .single();

            if (error) throw error;
            return data as MillenniumProblem;
        },
        enabled: !!slug,
    });

    const { data: papers, isLoading: isPapersLoading } = useQuery({
        queryKey: ["papers", slug],
        queryFn: async () => {
            if (!problem?.id) return [];

            const { data, error } = await supabase
                .from("research_papers")
                .select("*")
                .eq("problem_id", problem.id)
                .order("created_at", { ascending: false });

            if (error) throw error;
            // Map database fields to expected type
            return (data || []).map(p => ({
                ...p,
                year: p.published_date ? new Date(p.published_date).getFullYear() : null,
                doi: null,
                source_url: p.pdf_url,
                citations_count: p.citation_count || 0,
                ai_key_insights: null,
                is_ai_verified: false,
                is_verified: false,
                verified_by: null,
                verified_at: null,
                added_by: null,
            })) as ResearchPaper[];
        },
        enabled: !!problem?.id,
    });

    const { data: userProgress, isLoading: isProgressLoading } = useQuery({
        queryKey: ["user_progress", slug, user?.id],
        queryFn: async () => {
            if (!user?.id || !problem?.id) return null;

            const { data, error } = await supabase
                .from("user_progress")
                .select("*")
                .eq("user_id", user.id)
                .eq("problem_id", problem.id)
                .maybeSingle();

            if (error) throw error;
            return data as UserProgress;
        },
        enabled: !!user?.id && !!problem?.id,
    });

    return {
        problem: problem || null,
        papers: papers || [],
        userProgress: userProgress || null,
        isLoading: isProblemLoading || isPapersLoading || isProgressLoading,
        error: (problemError as Error) || null,
    };
};
