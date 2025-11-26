import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export const useAdmin = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isModerator, setIsModerator] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      setIsModerator(false);
      setLoading(false);
      return;
    }

    checkAdminStatus();
  }, [user]);

  const checkAdminStatus = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);

      if (error) {
        console.error("Error checking admin status:", error);
        setLoading(false);
        return;
      }

      const roles = data?.map((r) => r.role) || [];
      setIsAdmin(roles.includes("admin"));
      setIsModerator(roles.includes("moderator") || roles.includes("admin"));
    } catch (error) {
      console.error("Error in checkAdminStatus:", error);
    }

    setLoading(false);
  };

  return { isAdmin, isModerator, loading };
};