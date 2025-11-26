// Paper Summarizer Edge Function
// Generates a three‑level summary (simple, intermediate, advanced) for a research paper using OpenAI GPT‑4.
// Rate‑limited to 5 requests per minute per user.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { checkRateLimit } from "../_shared/rateLimit.ts"

const openaiKey = Deno.env.get("OPENAI_API_KEY")!

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

        // Rate limiting
        await checkRateLimit(user.id, "paper-summarizer", 5)

        const prompt = `Summarize this mathematics research paper in three levels:\n\nTitle: ${title}\nAbstract: ${abstract}\n\nProvide:\n1. Simple (undergraduate) – 2‑3 sentences\n2. Intermediate (graduate) – one paragraph\n3. Advanced (researcher) – detailed summary with key contributions.\n\nReturn JSON with keys: simple, intermediate, advanced.`

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

        return new Response(JSON.stringify({ summary }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    } catch (e) {
        console.error(e)
        return new Response(JSON.stringify({ error: "Internal server error" }), { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        })
    }
})
