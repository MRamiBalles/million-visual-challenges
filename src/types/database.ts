// TypeScript types for Millennium Problems Platform
// Auto-generated from Supabase schema

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      millennium_problems: {
        Row: {
          id: number
          slug: string
          title: string
          short_title: string | null
          field: string
          year: number
          status: 'solved' | 'unsolved'
          solver: string | null
          solver_year: number | null
          prize: string
          description_simple: string
          description_intermediate: string
          description_advanced: string
          clay_paper_author: string
          clay_paper_year: number
          clay_paper_url: string
          cover_image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['millennium_problems']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['millennium_problems']['Insert']>
      }
      research_papers: {
        Row: {
          id: string
          problem_id: number | null
          title: string
          authors: string[]
          year: number | null
          arxiv_id: string | null
          doi: string | null
          abstract: string | null
          pdf_url: string | null
          source_url: string | null
          citations_count: number
          ai_summary: string | null
          ai_key_insights: string[] | null
          is_ai_verified: boolean
          is_verified: boolean
          verified_by: string | null
          verified_at: string | null
          added_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['research_papers']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['research_papers']['Insert']>
      }
      key_references: {
        Row: {
          id: string
          problem_id: number | null
          title: string
          authors: string[]
          year: number
          url: string
          citations: number
          description: string | null
          display_order: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['key_references']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['key_references']['Insert']>
      }
      visualizations: {
        Row: {
          id: string
          problem_id: number | null
          name: string
          description: string | null
          type: '3d' | '2d' | 'interactive' | 'simulation' | 'chart'
          config: Json
          thumbnail_url: string | null
          component_path: string | null
          is_active: boolean
          display_order: number
          view_count: number
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['visualizations']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['visualizations']['Insert']>
      }
      applications: {
        Row: {
          id: string
          problem_id: number | null
          name: string
          description: string | null
          field: string
          examples: string[] | null
          display_order: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['applications']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['applications']['Insert']>
      }
      user_progress: {
        Row: {
          id: string
          user_id: string
          problem_id: number
          current_level: 'simple' | 'intermediate' | 'advanced'
          completed_sections: Json
          total_time_spent: number
          bookmarked: boolean
          last_visited_at: string | null
          completion_percentage: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['user_progress']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['user_progress']['Insert']>
      }
      discussions: {
        Row: {
          id: string
          problem_id: number
          user_id: string
          parent_id: string | null
          title: string | null
          content: string
          latex_content: string | null
          upvotes: number
          downvotes: number
          is_verified: boolean
          verified_by: string | null
          verified_at: string | null
          is_edited: boolean
          is_deleted: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['discussions']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['discussions']['Insert']>
      }
      discussion_votes: {
        Row: {
          id: string
          discussion_id: string
          user_id: string
          vote_type: 'upvote' | 'downvote'
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['discussion_votes']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['discussion_votes']['Insert']>
      }
      ai_updates_log: {
        Row: {
          id: string
          problem_id: number | null
          update_type: 'paper_summary' | 'qa_answer' | 'content_generation'
          source: string | null
          source_id: string | null
          model_used: string | null
          prompt_tokens: number | null
          completion_tokens: number | null
          total_cost: number | null
          result: Json | null
          success: boolean
          error_message: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['ai_updates_log']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['ai_updates_log']['Insert']>
      }
    }
    Views: {}
    Functions: {
      has_role: {
        Args: { _user_id: string; _role: 'user' | 'moderator' | 'admin' }
        Returns: boolean
      }
    }
    Enums: {
      app_role: 'user' | 'moderator' | 'admin'
    }
  }
}

// Convenience types
export type MillenniumProblem = Database['public']['Tables']['millennium_problems']['Row']
export type ResearchPaper = Database['public']['Tables']['research_papers']['Row']
export type KeyReference = Database['public']['Tables']['key_references']['Row']
export type Visualization = Database['public']['Tables']['visualizations']['Row']
export type Application = Database['public']['Tables']['applications']['Row']
export type UserProgress = Database['public']['Tables']['user_progress']['Row']
export type Discussion = Database['public']['Tables']['discussions']['Row']
export type DiscussionVote = Database['public']['Tables']['discussion_votes']['Row']
export type AIUpdateLog = Database['public']['Tables']['ai_updates_log']['Row']

// Insert types
export type InsertMillenniumProblem = Database['public']['Tables']['millennium_problems']['Insert']
export type InsertResearchPaper = Database['public']['Tables']['research_papers']['Insert']
export type InsertDiscussion = Database['public']['Tables']['discussions']['Insert']
export type InsertUserProgress = Database['public']['Tables']['user_progress']['Insert']

// arXiv API types
export interface ArxivEntry {
  id: string
  updated: string
  published: string
  title: string
  summary: string
  authors: Array<{ name: string }>
  links: Array<{ href: string; rel: string; type?: string }>
  categories: Array<{ term: string }>
}

export interface ArxivSearchResponse {
  totalResults: number
  entries: ArxivEntry[]
}

// OpenAI types
export interface PaperSummaryRequest {
  title: string
  abstract: string
  authors: string[]
  year?: number
}

export interface PaperSummaryResponse {
  summary: string
  keyInsights: string[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  relatedTopics: string[]
}
