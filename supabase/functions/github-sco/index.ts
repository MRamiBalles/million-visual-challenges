import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { checkRateLimit } from "../_shared/rateLimit.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const GITHUB_API = 'https://api.github.com';
const REPO_OWNER = 'MRamiBalles';
const REPO_NAME = 'PvsNP';

interface GitHubFile {
  name: string;
  path: string;
  type: 'file' | 'dir';
  size?: number;
  download_url?: string;
}

interface ExperimentData {
  name: string;
  path: string;
  content?: string;
  lastModified?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authentication check
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = user.id;

    // Rate limiting: 20 requests per minute per user
    await checkRateLimit(userId, 'github-sco', 20);

    const { action, path } = await req.json();
    
    console.log(`[github-sco] Action: ${action}, Path: ${path || 'root'}`);

    switch (action) {
      case 'list-experiments': {
        // Fetch experiments folder
        const response = await fetch(
          `${GITHUB_API}/repos/${REPO_OWNER}/${REPO_NAME}/contents/experiments`,
          {
            headers: {
              'Accept': 'application/vnd.github.v3+json',
              'User-Agent': 'Lovable-SCO-Integration'
            }
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error('[github-sco] GitHub API error:', response.status, errorText);
          throw new Error(`GitHub API error: ${response.status}`);
        }

        const files: GitHubFile[] = await response.json();
        const experiments = files
          .filter(f => f.name.endsWith('.py') || f.name.endsWith('.md'))
          .map(f => ({
            name: f.name,
            path: f.path,
            type: f.type,
            downloadUrl: f.download_url
          }));

        return new Response(JSON.stringify({ experiments }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'list-engines': {
        // Fetch engines folder
        const response = await fetch(
          `${GITHUB_API}/repos/${REPO_OWNER}/${REPO_NAME}/contents/engines`,
          {
            headers: {
              'Accept': 'application/vnd.github.v3+json',
              'User-Agent': 'Lovable-SCO-Integration'
            }
          }
        );

        if (!response.ok) {
          throw new Error(`GitHub API error: ${response.status}`);
        }

        const files: GitHubFile[] = await response.json();
        return new Response(JSON.stringify({ engines: files }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'get-file': {
        if (!path) {
          throw new Error('Path is required for get-file action');
        }

        const response = await fetch(
          `${GITHUB_API}/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}`,
          {
            headers: {
              'Accept': 'application/vnd.github.v3+json',
              'User-Agent': 'Lovable-SCO-Integration'
            }
          }
        );

        if (!response.ok) {
          throw new Error(`GitHub API error: ${response.status}`);
        }

        const file = await response.json();
        
        // Decode base64 content
        let content = '';
        if (file.content) {
          content = atob(file.content.replace(/\n/g, ''));
        }

        return new Response(JSON.stringify({ 
          name: file.name,
          path: file.path,
          content,
          size: file.size,
          sha: file.sha
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'get-readme': {
        const response = await fetch(
          `${GITHUB_API}/repos/${REPO_OWNER}/${REPO_NAME}/readme`,
          {
            headers: {
              'Accept': 'application/vnd.github.v3+json',
              'User-Agent': 'Lovable-SCO-Integration'
            }
          }
        );

        if (!response.ok) {
          throw new Error(`GitHub API error: ${response.status}`);
        }

        const readme = await response.json();
        const content = atob(readme.content.replace(/\n/g, ''));

        return new Response(JSON.stringify({ content }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'get-commits': {
        const response = await fetch(
          `${GITHUB_API}/repos/${REPO_OWNER}/${REPO_NAME}/commits?per_page=10`,
          {
            headers: {
              'Accept': 'application/vnd.github.v3+json',
              'User-Agent': 'Lovable-SCO-Integration'
            }
          }
        );

        if (!response.ok) {
          throw new Error(`GitHub API error: ${response.status}`);
        }

        const commits = await response.json();
        const formatted = commits.map((c: any) => ({
          sha: c.sha.substring(0, 7),
          message: c.commit.message,
          date: c.commit.author.date,
          author: c.commit.author.name
        }));

        return new Response(JSON.stringify({ commits: formatted }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'get-repo-info': {
        const response = await fetch(
          `${GITHUB_API}/repos/${REPO_OWNER}/${REPO_NAME}`,
          {
            headers: {
              'Accept': 'application/vnd.github.v3+json',
              'User-Agent': 'Lovable-SCO-Integration'
            }
          }
        );

        if (!response.ok) {
          throw new Error(`GitHub API error: ${response.status}`);
        }

        const repo = await response.json();
        
        return new Response(JSON.stringify({
          name: repo.name,
          fullName: repo.full_name,
          description: repo.description,
          stars: repo.stargazers_count,
          forks: repo.forks_count,
          language: repo.language,
          updatedAt: repo.updated_at,
          defaultBranch: repo.default_branch
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error) {
    console.error('[github-sco] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
