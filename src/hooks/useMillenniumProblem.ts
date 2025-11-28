// Custom hook to fetch Millennium Problem data from Supabase
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { MillenniumProblem } from "@/data/millennium-problems";

// Adapt database record to local format for consistency
const adaptDBToLocal = (data: any): MillenniumProblem => ({
    id: data.id,
    slug: data.slug,
    title: data.title,
    shortTitle: data.short_title || data.title,
    field: data.field,
    year: data.year,
    status: data.status as "solved" | "unsolved",
    solver: data.solver || undefined,
    solverYear: data.solver_year || undefined,
    prize: data.prize,
    clayPaper: {
        author: data.clay_paper_author,
        year: data.clay_paper_year,
        url: data.clay_paper_url,
    },
    description: {
        simple: data.description_simple,
        intermediate: data.description_intermediate,
        advanced: data.description_advanced,
    },
    keyReferences: [], // Not stored in main table
    visualizations: [],
    applications: [],
});

export const useMillenniumProblem = (slug: string) => {
    return useQuery({
        queryKey: ["millennium-problem", slug],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("millennium_problems")
                .select("*")
                .eq("slug", slug)
                .single();

            if (error) throw error;
            return adaptDBToLocal(data);
        },
        staleTime: 1000 * 60 * 10, // 10 minutes
    });
};

export const useMillenniumProblems = () => {
    return useQuery({
        queryKey: ["millennium-problems"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("millennium_problems")
                .select("*")
                .order("year", { ascending: true });

            if (error) throw error;
            return data.map(adaptDBToLocal);
        },
        staleTime: 1000 * 60 * 10,
    });
};
