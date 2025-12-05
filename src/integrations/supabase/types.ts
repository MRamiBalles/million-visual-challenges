export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          category: string
          created_at: string
          criteria: Json
          description: string | null
          icon: string | null
          id: string
          name: string
          points: number
          slug: string
        }
        Insert: {
          category: string
          created_at?: string
          criteria?: Json
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          points?: number
          slug: string
        }
        Update: {
          category?: string
          created_at?: string
          criteria?: Json
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          points?: number
          slug?: string
        }
        Relationships: []
      }
      ai_logs: {
        Row: {
          cost_usd: number | null
          created_at: string | null
          error_message: string | null
          execution_time_ms: number | null
          function_name: string
          id: string
          input_tokens: number | null
          model: string | null
          output_tokens: number | null
          success: boolean | null
          user_id: string | null
        }
        Insert: {
          cost_usd?: number | null
          created_at?: string | null
          error_message?: string | null
          execution_time_ms?: number | null
          function_name: string
          id?: string
          input_tokens?: number | null
          model?: string | null
          output_tokens?: number | null
          success?: boolean | null
          user_id?: string | null
        }
        Update: {
          cost_usd?: number | null
          created_at?: string | null
          error_message?: string | null
          execution_time_ms?: number | null
          function_name?: string
          id?: string
          input_tokens?: number | null
          model?: string | null
          output_tokens?: number | null
          success?: boolean | null
          user_id?: string | null
        }
        Relationships: []
      }
      badges: {
        Row: {
          created_at: string
          criteria_type: string
          criteria_value: number
          description: string
          icon: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          criteria_type: string
          criteria_value: number
          description: string
          icon: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          criteria_type?: string
          criteria_value?: number
          description?: string
          icon?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      collection_experiments: {
        Row: {
          added_at: string
          collection_id: string
          experiment_id: string
          id: string
        }
        Insert: {
          added_at?: string
          collection_id: string
          experiment_id: string
          id?: string
        }
        Update: {
          added_at?: string
          collection_id?: string
          experiment_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "collection_experiments_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_experiments_experiment_id_fkey"
            columns: ["experiment_id"]
            isOneToOne: false
            referencedRelation: "experiments"
            referencedColumns: ["id"]
          },
        ]
      }
      collections: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_public: boolean
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      experiment_comments: {
        Row: {
          comment_text: string
          created_at: string
          experiment_id: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          comment_text: string
          created_at?: string
          experiment_id: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          comment_text?: string
          created_at?: string
          experiment_id?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "experiment_comments_experiment_id_fkey"
            columns: ["experiment_id"]
            isOneToOne: false
            referencedRelation: "experiments"
            referencedColumns: ["id"]
          },
        ]
      }
      experiment_likes: {
        Row: {
          created_at: string
          experiment_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          experiment_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          experiment_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "experiment_likes_experiment_id_fkey"
            columns: ["experiment_id"]
            isOneToOne: false
            referencedRelation: "experiments"
            referencedColumns: ["id"]
          },
        ]
      }
      experiments: {
        Row: {
          created_at: string
          description: string | null
          experiment_data: Json
          experiment_type: string
          id: string
          is_public: boolean | null
          likes_count: number | null
          problem_slug: string
          share_token: string | null
          title: string
          updated_at: string
          user_id: string
          view_count: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          experiment_data: Json
          experiment_type: string
          id?: string
          is_public?: boolean | null
          likes_count?: number | null
          problem_slug: string
          share_token?: string | null
          title: string
          updated_at?: string
          user_id: string
          view_count?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          experiment_data?: Json
          experiment_type?: string
          id?: string
          is_public?: boolean | null
          likes_count?: number | null
          problem_slug?: string
          share_token?: string | null
          title?: string
          updated_at?: string
          user_id?: string
          view_count?: number | null
        }
        Relationships: []
      }
      millennium_problems: {
        Row: {
          clay_paper_author: string
          clay_paper_url: string
          clay_paper_year: number
          cover_image_url: string | null
          created_at: string | null
          description_advanced: string
          description_intermediate: string
          description_simple: string
          field: string
          id: number
          prize: string | null
          short_title: string
          slug: string
          solver: string | null
          solver_year: number | null
          status: string
          title: string
          updated_at: string | null
          year: number
        }
        Insert: {
          clay_paper_author: string
          clay_paper_url: string
          clay_paper_year: number
          cover_image_url?: string | null
          created_at?: string | null
          description_advanced: string
          description_intermediate: string
          description_simple: string
          field: string
          id?: number
          prize?: string | null
          short_title: string
          slug: string
          solver?: string | null
          solver_year?: number | null
          status?: string
          title: string
          updated_at?: string | null
          year?: number
        }
        Update: {
          clay_paper_author?: string
          clay_paper_url?: string
          clay_paper_year?: number
          cover_image_url?: string | null
          created_at?: string | null
          description_advanced?: string
          description_intermediate?: string
          description_simple?: string
          field?: string
          id?: number
          prize?: string | null
          short_title?: string
          slug?: string
          solver?: string | null
          solver_year?: number | null
          status?: string
          title?: string
          updated_at?: string | null
          year?: number
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          experiment_id: string | null
          from_user_id: string | null
          id: string
          message: string
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          experiment_id?: string | null
          from_user_id?: string | null
          id?: string
          message: string
          read?: boolean
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          experiment_id?: string | null
          from_user_id?: string | null
          id?: string
          message?: string
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_experiment_id_fkey"
            columns: ["experiment_id"]
            isOneToOne: false
            referencedRelation: "experiments"
            referencedColumns: ["id"]
          },
        ]
      }
      paper_embeddings: {
        Row: {
          chunk_index: number
          chunk_text: string
          created_at: string | null
          embedding: string | null
          id: string
          paper_id: string | null
          updated_at: string | null
        }
        Insert: {
          chunk_index: number
          chunk_text: string
          created_at?: string | null
          embedding?: string | null
          id?: string
          paper_id?: string | null
          updated_at?: string | null
        }
        Update: {
          chunk_index?: number
          chunk_text?: string
          created_at?: string | null
          embedding?: string | null
          id?: string
          paper_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "paper_embeddings_paper_id_fkey"
            columns: ["paper_id"]
            isOneToOne: false
            referencedRelation: "research_papers"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          education_level: string | null
          github_handle: string | null
          id: string
          is_public: boolean
          location: string | null
          preferences: Json | null
          research_interests: string[] | null
          twitter_handle: string | null
          updated_at: string
          user_id: string
          username: string | null
          website_url: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          education_level?: string | null
          github_handle?: string | null
          id?: string
          is_public?: boolean
          location?: string | null
          preferences?: Json | null
          research_interests?: string[] | null
          twitter_handle?: string | null
          updated_at?: string
          user_id: string
          username?: string | null
          website_url?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          education_level?: string | null
          github_handle?: string | null
          id?: string
          is_public?: boolean
          location?: string | null
          preferences?: Json | null
          research_interests?: string[] | null
          twitter_handle?: string | null
          updated_at?: string
          user_id?: string
          username?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      qa_history: {
        Row: {
          answer: string
          context_papers: string[] | null
          created_at: string | null
          id: string
          model: string | null
          problem_id: number | null
          question: string
          tokens_used: number | null
          user_id: string | null
        }
        Insert: {
          answer: string
          context_papers?: string[] | null
          created_at?: string | null
          id?: string
          model?: string | null
          problem_id?: number | null
          question: string
          tokens_used?: number | null
          user_id?: string | null
        }
        Update: {
          answer?: string
          context_papers?: string[] | null
          created_at?: string | null
          id?: string
          model?: string | null
          problem_id?: number | null
          question?: string
          tokens_used?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "qa_history_problem_id_fkey"
            columns: ["problem_id"]
            isOneToOne: false
            referencedRelation: "millennium_problems"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_limits: {
        Row: {
          action_type: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          action_type: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          action_type?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      research_papers: {
        Row: {
          abstract: string | null
          ai_summary: Json | null
          arxiv_id: string | null
          authors: string[]
          citation_count: number | null
          created_at: string | null
          id: string
          pdf_url: string | null
          problem_id: number | null
          published_date: string | null
          relevance_score: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          abstract?: string | null
          ai_summary?: Json | null
          arxiv_id?: string | null
          authors: string[]
          citation_count?: number | null
          created_at?: string | null
          id?: string
          pdf_url?: string | null
          problem_id?: number | null
          published_date?: string | null
          relevance_score?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          abstract?: string | null
          ai_summary?: Json | null
          arxiv_id?: string | null
          authors?: string[]
          citation_count?: number | null
          created_at?: string | null
          id?: string
          pdf_url?: string | null
          problem_id?: number | null
          published_date?: string | null
          relevance_score?: number | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "research_papers_problem_id_fkey"
            columns: ["problem_id"]
            isOneToOne: false
            referencedRelation: "millennium_problems"
            referencedColumns: ["id"]
          },
        ]
      }
      user_achievements: {
        Row: {
          achievement_id: string
          id: string
          progress: Json
          unlocked_at: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          id?: string
          progress?: Json
          unlocked_at?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          id?: string
          progress?: Json
          unlocked_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
        ]
      }
      user_activity: {
        Row: {
          created_at: string
          duration_seconds: number
          id: string
          problem_slug: string
          session_date: string
          user_id: string
          visualization_type: string
        }
        Insert: {
          created_at?: string
          duration_seconds: number
          id?: string
          problem_slug: string
          session_date?: string
          user_id: string
          visualization_type: string
        }
        Update: {
          created_at?: string
          duration_seconds?: number
          id?: string
          problem_slug?: string
          session_date?: string
          user_id?: string
          visualization_type?: string
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          badge_id: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          badge_id: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          badge_id?: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_progress: {
        Row: {
          bookmarked: boolean
          completed_sections: Json
          completion_percentage: number
          created_at: string
          current_level: string
          id: string
          last_visited_at: string
          problem_id: number
          total_time_spent: number
          updated_at: string
          user_id: string
        }
        Insert: {
          bookmarked?: boolean
          completed_sections?: Json
          completion_percentage?: number
          created_at?: string
          current_level?: string
          id?: string
          last_visited_at?: string
          problem_id: number
          total_time_spent?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          bookmarked?: boolean
          completed_sections?: Json
          completion_percentage?: number
          created_at?: string
          current_level?: string
          id?: string
          last_visited_at?: string
          problem_id?: number
          total_time_spent?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_progress_problem_id_fkey"
            columns: ["problem_id"]
            isOneToOne: false
            referencedRelation: "millennium_problems"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      user_statistics: {
        Row: {
          achievements_count: number | null
          bookmarks_count: number | null
          last_active_at: string | null
          problems_visited: number | null
          total_points: number | null
          total_time_seconds: number | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      cleanup_old_rate_limits: { Args: never; Returns: undefined }
      generate_share_token: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      match_paper_chunks: {
        Args: {
          match_count?: number
          match_threshold?: number
          problem_filter?: number
          query_embedding: string
        }
        Returns: {
          chunk_index: number
          chunk_text: string
          id: string
          paper_id: string
          similarity: number
        }[]
      }
    }
    Enums: {
      app_role: "user" | "moderator" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["user", "moderator", "admin"],
    },
  },
} as const
