// Research Q&A Edge Function (RAG)
// Generates answers to user questions using paper embeddings and GPT‑4.
// Rate‑limited to 10 requests per minute per user.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { checkRateLimit } from "../_shared/rateLimit.ts"

const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
)

const openaiKey = Deno.env.get("OPENAI_API_KEY")!

serve(async (req) => {
    try {
        const { question, problemId, userId } = await req.json()
        if (!userId) {
            return new Response(JSON.stringify({ error: "Unauthenticated" }), { status: 401 })
        }

        // Rate limiting (10 per minute)
        await checkRateLimit(userId, "research-qa", 10)

        // 1. Create embedding for the question
        const embedResp = await fetch("https://api.openai.com/v1/embeddings", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${openaiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "text-embedding-ada-002",
                input: question,
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
            return new Response(JSON.stringify({ error: "RAG lookup failed" }), { status: 500 })
        }

        const context = relevantChunks
            .map((c: any) => c.chunk_text)
            .join("\n\n")

        // 3. Build prompt for GPT‑4
        const prompt = `You are a mathematics tutor specialized in Millennium Prize Problems.\n\nContext from research papers:\n${context}\n\nQuestion: ${question}\n\nProvide a clear, accurate answer. If the context is insufficient, say so and give general guidance. Use LaTeX notation where appropriate.`

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

        // 4. Store conversation in qa_history
        const { error: insertError } = await supabase.from("qa_history").insert({
            user_id: userId,
            problem_id: problemId,
            question,
            answer,
            context_papers: relevantChunks.map((c: any) => c.paper_id),
        })
        if (insertError) {
            console.error("Failed to log QA history:", insertError)
        }

        // 5. Return answer with source metadata
        return new Response(JSON.stringify({ answer, sources: relevantChunks }), {
            headers: { "Content-Type": "application/json" },
        })
    } catch (e) {
        console.error(e)
        return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 })
    }
})
