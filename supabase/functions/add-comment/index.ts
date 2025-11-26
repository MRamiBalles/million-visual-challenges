import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CommentRequest {
  experimentId: string;
  commentText: string;
}

// Rate limit: 5 comments per minute
const RATE_LIMIT_WINDOW = 60; // seconds
const MAX_COMMENTS = 5;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get the user
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { experimentId, commentText }: CommentRequest = await req.json();

    if (!experimentId || !commentText || commentText.trim().length === 0) {
      return new Response(JSON.stringify({ error: 'Invalid input' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (commentText.length > 2000) {
      return new Response(JSON.stringify({ error: 'Comment too long (max 2000 characters)' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check rate limit
    const rateLimitStart = new Date(Date.now() - RATE_LIMIT_WINDOW * 1000).toISOString();
    const { data: recentActions, error: rateLimitError } = await supabaseClient
      .from('rate_limits')
      .select('id')
      .eq('user_id', user.id)
      .eq('action_type', 'comment')
      .gte('created_at', rateLimitStart);

    if (rateLimitError) {
      console.error('Rate limit check error:', rateLimitError);
      return new Response(JSON.stringify({ error: 'Rate limit check failed' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (recentActions && recentActions.length >= MAX_COMMENTS) {
      return new Response(
        JSON.stringify({
          error: 'Rate limit exceeded. Please wait a minute before commenting again.',
        }),
        {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Insert the comment
    const { data: comment, error: commentError } = await supabaseClient
      .from('experiment_comments')
      .insert({
        experiment_id: experimentId,
        user_id: user.id,
        comment_text: commentText.trim(),
      })
      .select()
      .single();

    if (commentError) {
      console.error('Comment insert error:', commentError);
      return new Response(JSON.stringify({ error: 'Failed to add comment' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Record the action for rate limiting
    await supabaseClient.from('rate_limits').insert({
      user_id: user.id,
      action_type: 'comment',
    });

    return new Response(JSON.stringify({ success: true, comment }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in add-comment function:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});