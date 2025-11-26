// Custom hook to fetch Millennium Problem data from Supabase
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { MillenniumProblem } from "@/types/database";

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
            return data as MillenniumProblem;
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
            return data as MillenniumProblem[];
        },
        staleTime: 1000 * 60 * 10,
    });
};
