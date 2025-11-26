import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LikeRequest {
  experimentId: string;
}

// Rate limit: 10 likes per minute
const RATE_LIMIT_WINDOW = 60; // seconds
const MAX_LIKES = 10;

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

    const { experimentId }: LikeRequest = await req.json();

    if (!experimentId) {
      return new Response(JSON.stringify({ error: 'Invalid input' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if like already exists
    const { data: existingLike } = await supabaseClient
      .from('experiment_likes')
      .select('id')
      .eq('user_id', user.id)
      .eq('experiment_id', experimentId)
      .single();

    if (existingLike) {
      // Unlike - remove the like
      const { error: deleteError } = await supabaseClient
        .from('experiment_likes')
        .delete()
        .eq('id', existingLike.id);

      if (deleteError) {
        console.error('Unlike error:', deleteError);
        return new Response(JSON.stringify({ error: 'Failed to remove like' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ success: true, liked: false }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check rate limit for new likes
    const rateLimitStart = new Date(Date.now() - RATE_LIMIT_WINDOW * 1000).toISOString();
    const { data: recentActions, error: rateLimitError } = await supabaseClient
      .from('rate_limits')
      .select('id')
      .eq('user_id', user.id)
      .eq('action_type', 'like')
      .gte('created_at', rateLimitStart);

    if (rateLimitError) {
      console.error('Rate limit check error:', rateLimitError);
      return new Response(JSON.stringify({ error: 'Rate limit check failed' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (recentActions && recentActions.length >= MAX_LIKES) {
      return new Response(
        JSON.stringify({
          error: 'Rate limit exceeded. Please wait a minute before liking again.',
        }),
        {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Add the like
    const { error: insertError } = await supabaseClient
      .from('experiment_likes')
      .insert({
        user_id: user.id,
        experiment_id: experimentId,
      });

    if (insertError) {
      console.error('Like insert error:', insertError);
      return new Response(JSON.stringify({ error: 'Failed to add like' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Record the action for rate limiting
    await supabaseClient.from('rate_limits').insert({
      user_id: user.id,
      action_type: 'like',
    });

    return new Response(JSON.stringify({ success: true, liked: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in toggle-like function:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});