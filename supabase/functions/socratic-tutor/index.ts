import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { messages, context } = await req.json();

        const openAiKey = Deno.env.get('OPENAI_API_KEY');

        if (!openAiKey) {
            // Mock response if no key
            return new Response(
                JSON.stringify({
                    reply: `[Simulation Mode] I see you are asking about ${context}. To truly understand it, what do you think is the fundamental contradiction? (Add OPENAI_API_KEY to secrets to enable my full brain)`
                }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        const systemPrompt = `
      You are Socrates, a wise and patient mathematical tutor. 
      The user is studying the Millennium Prize Problem: "${context}".
      
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
                    ...messages
                ],
                temperature: 0.7,
            }),
        });

        const data = await response.json();
        const reply = data.choices[0].message.content;

        return new Response(
            JSON.stringify({ reply }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return new Response(
            JSON.stringify({ error: errorMessage }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
    }
});
