// Research Q&A Edge Function (RAG)
// Generates answers to user questions using paper embeddings and GPT‑4.
// Rate‑limited to 10 requests per minute per user.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { checkRateLimit, RateLimitError } from "../_shared/rateLimit.ts"

// Validate OPENAI_API_KEY is configured
const openaiKey = Deno.env.get("OPENAI_API_KEY")
if (!openaiKey) {
    console.error('[research-qa] FATAL: OPENAI_API_KEY not configured')
    throw new Error('OPENAI_API_KEY environment variable is required')
}

console.log('[research-qa] Initialized successfully')

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

        const { question, problemId } = await req.json()
        const userId = user.id

        // Input validation
        if (!question || typeof question !== 'string') {
            return new Response(JSON.stringify({ error: "Question is required" }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
        }

        // Validate question length (max 2000 chars to prevent token cost abuse)
        const MAX_QUESTION_LENGTH = 2000
        if (question.length > MAX_QUESTION_LENGTH) {
            return new Response(JSON.stringify({ 
                error: `Question too long (max ${MAX_QUESTION_LENGTH} characters)` 
            }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
        }

        // Sanitize question - trim and remove control characters
        const sanitizedQuestion = question.trim().replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')

        if (sanitizedQuestion.length === 0) {
            return new Response(JSON.stringify({ error: "Question cannot be empty" }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
        }

        // Validate problemId if provided
        if (problemId !== undefined && problemId !== null) {
            if (typeof problemId !== 'number' || !Number.isInteger(problemId) || problemId < 1) {
                return new Response(JSON.stringify({ error: "Invalid problemId" }), {
                    status: 400,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                })
            }
        }

        console.log('[research-qa] Request:', {
            userId: userId.substring(0, 8) + '...',
            problemId,
            questionLength: sanitizedQuestion.length
        })

        // Rate limiting (10 per minute) - returns info about current usage
        const limitInfo = await checkRateLimit(userId, "research-qa", 10)

        // 1. Create embedding for the question (using sanitized input)
        const embedResp = await fetch("https://api.openai.com/v1/embeddings", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${openaiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "text-embedding-ada-002",
                input: sanitizedQuestion,
            }),
        })
        const embedData = await embedResp.json()
        const embedding = embedData.data[0].embedding

        // 2. Retrieve relevant paper chunks via stored procedure
        const { data: relevantChunks, error: rpcError } = await supabase
            .rpc("match_paper_chunks", {
                query_embedding: embedding,
                match_threshold: 0.7,
                match_count: 5,
                problem_filter: problemId,
            })

        if (rpcError) {
            console.error("RAG RPC error:", rpcError)
            return new Response(JSON.stringify({ error: "RAG lookup failed" }), {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
        }

        const context = relevantChunks
            .map((c: any) => c.chunk_text)
            .join("\n\n")

        // 3. Build prompt for GPT‑4 (using sanitized question)
        const prompt = `You are a mathematics tutor specialized in Millennium Prize Problems.\n\nContext from research papers:\n${context}\n\nQuestion: ${sanitizedQuestion}\n\nProvide a clear, accurate answer. If the context is insufficient, say so and give general guidance. Use LaTeX notation where appropriate.`

        const chatResp = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${openaiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "gpt-4",
                messages: [
                    { role: "system", content: "You are an expert mathematics tutor." },
                    { role: "user", content: prompt },
                ],
                temperature: 0.7,
            }),
        })
        const chatData = await chatResp.json()
        const answer = chatData.choices[0].message.content

        // 4. Store conversation in qa_history (using sanitized question)
        const { error: insertError } = await supabase.from("qa_history").insert({
            user_id: userId,
            problem_id: problemId,
            question: sanitizedQuestion,
            answer,
            context_papers: relevantChunks.map((c: any) => c.paper_id),
        })
        if (insertError) {
            console.warn('[research-qa] Failed to log QA history:', insertError)
        }

        console.log('[research-qa] Success:', {
            userId: userId.substring(0, 8) + '...',
            problemId,
            sourcesCount: relevantChunks.length
        })

        // 5. Return answer with source metadata and rate limit info
        return new Response(JSON.stringify({
            answer,
            sources: relevantChunks,
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
            console.warn('[research-qa] Rate limit exceeded:', e.info)
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

        console.error('[research-qa] Error:', e)
        return new Response(JSON.stringify({ error: "Internal server error" }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
    }
})
