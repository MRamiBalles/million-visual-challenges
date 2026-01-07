// Paper Summarizer Edge Function
// Generates a three‑level summary (simple, intermediate, advanced) for a research paper using OpenAI GPT‑4.
// Rate‑limited to 5 requests per minute per user.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { checkRateLimit, RateLimitError } from "../_shared/rateLimit.ts"

// Validate OPENAI_API_KEY is configured
const openaiKey = Deno.env.get("OPENAI_API_KEY")
if (!openaiKey) {
    console.error('[paper-summarizer] FATAL: OPENAI_API_KEY not configured')
    throw new Error('OPENAI_API_KEY environment variable is required')
}

console.log('[paper-summarizer] Initialized successfully')

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders })
    }

    try {
        const authHeader = req.headers.get('Authorization')
        if (!authHeader) {
            return new Response(JSON.stringify({ error: "Unauthenticated" }), {
                status: 401,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
        }

        const supabase = createClient(
            Deno.env.get("SUPABASE_URL")!,
            Deno.env.get("SUPABASE_ANON_KEY")!,
            { global: { headers: { Authorization: authHeader } } }
        )

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return new Response(JSON.stringify({ error: "Unauthenticated" }), {
                status: 401,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
        }

        const { paperId, title, abstract } = await req.json()

        // Input validation
        if (!paperId || typeof paperId !== 'string') {
            return new Response(JSON.stringify({ error: "paperId is required" }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
        }

        // Validate UUID format for paperId
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
        if (!uuidRegex.test(paperId)) {
            return new Response(JSON.stringify({ error: "Invalid paperId format" }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
        }

        if (!title || typeof title !== 'string') {
            return new Response(JSON.stringify({ error: "title is required" }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
        }

        // Validate and sanitize title (max 500 chars)
        const MAX_TITLE_LENGTH = 500
        if (title.length > MAX_TITLE_LENGTH) {
            return new Response(JSON.stringify({ 
                error: `Title too long (max ${MAX_TITLE_LENGTH} characters)` 
            }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
        }
        const sanitizedTitle = title.trim().replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')

        // Validate and sanitize abstract (max 5000 chars)
        const MAX_ABSTRACT_LENGTH = 5000
        if (abstract && typeof abstract === 'string' && abstract.length > MAX_ABSTRACT_LENGTH) {
            return new Response(JSON.stringify({ 
                error: `Abstract too long (max ${MAX_ABSTRACT_LENGTH} characters)` 
            }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
        }
        const sanitizedAbstract = abstract 
            ? abstract.trim().replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
            : ''

        console.log('[paper-summarizer] Request:', {
            userId: user.id.substring(0, 8) + '...',
            paperId,
            hasTitle: !!sanitizedTitle,
            hasAbstract: !!sanitizedAbstract
        })

        // Rate limiting - returns info about current usage
        const limitInfo = await checkRateLimit(user.id, "paper-summarizer", 5)

        const prompt = `Summarize this mathematics research paper in three levels:\n\nTitle: ${sanitizedTitle}\nAbstract: ${sanitizedAbstract}\n\nProvide:\n1. Simple (undergraduate) – 2‑3 sentences\n2. Intermediate (graduate) – one paragraph\n3. Advanced (researcher) – detailed summary with key contributions.\n\nReturn JSON with keys: simple, intermediate, advanced.`

        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${openaiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "gpt-4",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.3,
            }),
        })

        const data = await response.json()
        const summary = data.choices[0].message.content

        // Store summary in the research_papers table (JSONB column ai_summary)
        const serviceSupabase = createClient(
            Deno.env.get("SUPABASE_URL")!,
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
        )
        const { error: updateError } = await serviceSupabase
            .from("research_papers")
            .update({ ai_summary: summary })
            .eq("id", paperId)

        if (updateError) {
            console.error("Failed to store summary:", updateError)
            return new Response(JSON.stringify({ error: "DB update failed" }), {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
        }

        console.log('[paper-summarizer] Success:', { paperId, userId: user.id.substring(0, 8) + '...' })

        return new Response(JSON.stringify({
            summary,
            rateLimit: {
                remaining: limitInfo.remaining,
                limit: limitInfo.limit,
                resetAt: limitInfo.resetAt
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    } catch (e) {
        // Handle rate limit errors with 429 status
        if (e instanceof RateLimitError) {
            console.warn('[paper-summarizer] Rate limit exceeded:', e.info)
            return new Response(JSON.stringify({
                error: "Rate limit exceeded",
                message: e.message,
                rateLimit: {
                    current: e.info.current,
                    limit: e.info.limit,
                    resetAt: e.info.resetAt
                }
            }), {
                status: 429,
                headers: {
                    ...corsHeaders,
                    'Content-Type': 'application/json',
                    'Retry-After': Math.ceil((e.info.resetAt.getTime() - Date.now()) / 1000).toString()
                }
            })
        }

        console.error('[paper-summarizer] Error:', e)
        return new Response(JSON.stringify({ error: "Internal server error" }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
    }
})
