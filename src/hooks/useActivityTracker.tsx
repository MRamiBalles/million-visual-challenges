import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export const useActivityTracker = (problemSlug: string, visualizationType: string) => {
  const { user } = useAuth();
  const startTimeRef = useRef<number>(Date.now());
  const hasTrackedRef = useRef(false);

  useEffect(() => {
    // Reset timer when component mounts
    startTimeRef.current = Date.now();
    hasTrackedRef.current = false;

    // Track activity when component unmounts
    return () => {
      if (user && !hasTrackedRef.current) {
        const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
        
        // Only track if user spent at least 5 seconds
        if (duration >= 5) {
          hasTrackedRef.current = true;
          
          supabase
            .from("user_activity")
            .insert({
              user_id: user.id,
              problem_slug: problemSlug,
              visualization_type: visualizationType,
              duration_seconds: duration,
            })
            .then(({ error }) => {
              if (error) {
                console.error("Error tracking activity:", error);
              }
            });
        }
      }
    };
  }, [user, problemSlug, visualizationType]);

  return null;
};