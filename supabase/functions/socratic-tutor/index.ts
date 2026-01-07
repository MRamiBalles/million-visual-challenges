import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { checkRateLimit, RateLimitError } from "../_shared/rateLimit.ts";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Validate message format
interface ChatMessage {
    role: string;
    content: string;
}

function isValidMessage(msg: unknown): msg is ChatMessage {
    return (
        typeof msg === 'object' &&
        msg !== null &&
        'role' in msg &&
        'content' in msg &&
        typeof (msg as ChatMessage).role === 'string' &&
        typeof (msg as ChatMessage).content === 'string' &&
        ['user', 'assistant', 'system'].includes((msg as ChatMessage).role) &&
        (msg as ChatMessage).content.length > 0 &&
        (msg as ChatMessage).content.length <= 2000
    );
}

function sanitizeText(text: string): string {
    return text.trim().replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        // 1. Require authentication
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            console.warn('[socratic-tutor] Missing auth header');
            return new Response(
                JSON.stringify({ error: 'Authentication required' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
            );
        }

        // 2. Verify user session
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL')!,
            Deno.env.get('SUPABASE_ANON_KEY')!,
            { global: { headers: { Authorization: authHeader } } }
        );

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            console.warn('[socratic-tutor] Auth failed:', authError?.message);
            return new Response(
                JSON.stringify({ error: 'Invalid authentication' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
            );
        }

        // 3. Rate limiting (10 requests per minute)
        try {
            await checkRateLimit(user.id, 'socratic-tutor', 10);
        } catch (error) {
            if (error instanceof RateLimitError) {
                return new Response(
                    JSON.stringify({ 
                        error: 'Rate limit exceeded', 
                        remaining: error.info.remaining,
                        resetAt: error.info.resetAt 
                    }),
                    { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 429 }
                );
            }
            throw error;
        }

        // 4. Parse and validate input
        const body = await req.json();
        const { messages, context } = body;

        // Validate messages array
        if (!Array.isArray(messages) || messages.length === 0) {
            return new Response(
                JSON.stringify({ error: 'Messages must be a non-empty array' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
            );
        }

        if (messages.length > 50) {
            return new Response(
                JSON.stringify({ error: 'Too many messages (max 50)' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
            );
        }

        for (const msg of messages) {
            if (!isValidMessage(msg)) {
                return new Response(
                    JSON.stringify({ error: 'Invalid message format: each message must have role (user/assistant/system) and content (1-2000 chars)' }),
                    { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
                );
            }
        }

        // Validate and sanitize context
        if (!context || typeof context !== 'string') {
            return new Response(
                JSON.stringify({ error: 'Context is required and must be a string' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
            );
        }

        if (context.length > 500) {
            return new Response(
                JSON.stringify({ error: 'Context too long (max 500 characters)' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
            );
        }

        const sanitizedContext = sanitizeText(context);
        const sanitizedMessages = messages.map(msg => ({
            role: msg.role,
            content: sanitizeText(msg.content)
        }));

        console.log('[socratic-tutor] Request from user:', user.id.substring(0, 8) + '...', 'messages:', messages.length);

        const openAiKey = Deno.env.get('OPENAI_API_KEY');

        if (!openAiKey) {
            // Mock response if no key
            return new Response(
                JSON.stringify({
                    reply: `[Simulation Mode] I see you are asking about ${sanitizedContext}. To truly understand it, what do you think is the fundamental contradiction? (Add OPENAI_API_KEY to secrets to enable my full brain)`
                }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        const systemPrompt = `
      You are Socrates, a wise and patient mathematical tutor. 
      The user is studying the Millennium Prize Problem: "${sanitizedContext}".
      
      YOUR GOAL: Help the user understand the problem deeply without giving away answers or solutions directly.
      
      RULES:
      1. NEVER provide a direct solution or "give away" the insight.
      2. ALWAYS ask a probing question that leads the user to the next logical step.
      3. Use analogies from nature or daily life to explain complex abstract concepts.
      4. Be encouraging but rigorous.
      5. Keep responses concise (under 3 sentences usually).
      
      If the user asks "What is the answer?", reply "What do *you* think the answer might look like?"
    `;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${openAiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                    { role: 'system', content: systemPrompt },
                    ...sanitizedMessages
                ],
                temperature: 0.7,
            }),
        });

        const data = await response.json();
        
        if (!data.choices || !data.choices[0]?.message?.content) {
            console.error('[socratic-tutor] Invalid OpenAI response:', JSON.stringify(data));
            return new Response(
                JSON.stringify({ error: 'Failed to get AI response' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
            );
        }

        const reply = data.choices[0].message.content;

        return new Response(
            JSON.stringify({ reply }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('[socratic-tutor] Error:', errorMessage);
        return new Response(
            JSON.stringify({ error: 'An error occurred processing your request' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
    }
});
