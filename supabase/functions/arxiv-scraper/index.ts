import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { XMLParser } from "https://esm.sh/fast-xml-parser@4.2.5"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        console.log("Fetching problem IDs...")
        // Get Problem IDs map
        const { data: problems } = await supabase
            .from('millennium_problems')
            .select('id, slug')

        if (!problems) throw new Error("Could not fetch problems")

        const problemMap: Record<string, number> = {}
        problems.forEach(p => problemMap[p.slug] = p.id)

        console.log("Problem Map:", problemMap)

        // Arxiv Queries
        // P vs NP -> cs.CC (Computational Complexity)
        // Riemann -> math.NT (Number Theory)
        // Navier-Stokes -> math.AP (Analysis of PDEs)
        // Hodge -> math.AG (Algebraic Geometry)
        // Poincaré (Solved, but Topology) -> math.GT
        // Birch and Swinnerton-Dyer -> math.NT
        // Yang-Mills -> math-ph (Mathematical Physics)

        const categories = [
            { cat: 'cs.CC', problem: 'pvsnp', keywords: ['p vs np', 'polynomial time', 'traveling salesman'] },
            { cat: 'math.NT', problem: 'riemann', keywords: ['riemann', 'zeta function', 'prime distribution'] },
            { cat: 'math.AP', problem: 'navier-stokes', keywords: ['navier-stokes', 'fluid dynamics'] },
        ]

        const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_" });
        const computedPapers = []

        for (const item of categories) {
            console.log(`Querying ${item.cat}...`)
            const response = await fetch(
                `http://export.arxiv.org/api/query?search_query=cat:${item.cat}&sortBy=submittedDate&sortOrder=descending&max_results=5`
            )
            const xml = await response.text()
            const result = parser.parse(xml)

            const entries = result.feed.entry
            const entriesArray = Array.isArray(entries) ? entries : [entries];

            for (const entry of entriesArray) {
                // Check relevance via keywords if generic category
                const title = entry.title?.toString() || ""
                const summary = entry.summary?.toString() || ""
                const fullText = (title + " " + summary).toLowerCase()

                // Simple relevance check
                const isRelevant = item.keywords.some(k => fullText.includes(k))

                if (isRelevant) {
                    const authors = Array.isArray(entry.author)
                        ? entry.author.map((a: any) => a.name)
                        : [entry.author.name];

                    computedPapers.push({
                        problem_id: problemMap[item.problem],
                        title: title.replace(/\n/g, ' ').trim(),
                        authors: authors,
                        abstract: summary.replace(/\n/g, ' ').trim(),
                        publication_date: entry.published,
                        source_url: entry.id,
                        pdf_url: entry.link?.find((l: any) => l["@_title"] === "pdf")?.["@_href"] || entry.id.replace("abs", "pdf"),
                    })
                }
            }
        }

        console.log(`Found ${computedPapers.length} relevant papers.`)

        // Upsert papers
        if (computedPapers.length > 0) {
            // We use source_url as unique key implicitly if strict constraint exists, 
            // else we might duplicate. Ideally we should have a unique constraint on source_url.
            // For now, we utilize 'upsert' assuming 'source_url' or 'title' + 'problem_id' unique.
            // Actually simplest is checking existence or assume Supabase handles constraints. 
            // Let's rely on `source_url` being unique if configured, or just insert.

            // Better: Fetch existing URLs to filter
            const existingUrls = (await supabase.from('research_papers').select('source_url')).data?.map(p => p.source_url) || []

            const newPapers = computedPapers.filter(p => !existingUrls.includes(p.source_url))

            if (newPapers.length > 0) {
                const { error } = await supabase.from('research_papers').insert(newPapers)
                if (error) console.error("Insert error:", error)
                else console.log(`Inserted ${newPapers.length} new papers.`)
            } else {
                console.log("No new unique papers to insert.")
            }
        }

        return new Response(
            JSON.stringify({ success: true, count: computedPapers.length }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return new Response(
            JSON.stringify({ error: errorMessage }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
    }
})
