// Supabase Edge Function: arxiv-scraper
// Fetches new papers from arXiv related to Millennium Problems
// RESTRICTED: Admin users only

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ArxivEntry {
    id: string;
    updated: string;
    published: string;
    title: string;
    summary: string;
    author: Array<{ name: string }>;
    link: Array<{ $: { href: string; rel: string; type?: string } }>;
    category: Array<{ $: { term: string } }>;
    "arxiv:primary_category": Array<{ $: { term: string } }>;
}

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        // AUTHENTICATION CHECK
        const authHeader = req.headers.get("Authorization");
        if (!authHeader) {
            console.error("No authorization header provided");
            return new Response(
                JSON.stringify({ success: false, error: "Authentication required" }),
                { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Create client with user's auth to verify identity
        const supabaseAuth = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_ANON_KEY") ?? "",
            { global: { headers: { Authorization: authHeader } } }
        );

        // Verify user is authenticated
        const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
        if (authError || !user) {
            console.error("Authentication failed:", authError?.message);
            return new Response(
                JSON.stringify({ success: false, error: "Invalid or expired token" }),
                { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        console.log(`User ${user.id} attempting to access arxiv-scraper`);

        // ADMIN CHECK - Verify user has admin role
        const { data: roleData, error: roleError } = await supabaseAuth
            .from("user_roles")
            .select("role")
            .eq("user_id", user.id)
            .eq("role", "admin")
            .maybeSingle();

        if (roleError) {
            console.error("Error checking admin role:", roleError.message);
            return new Response(
                JSON.stringify({ success: false, error: "Error verifying permissions" }),
                { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        if (!roleData) {
            console.warn(`User ${user.id} attempted admin-only operation without admin role`);
            return new Response(
                JSON.stringify({ success: false, error: "Admin access required" }),
                { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        console.log(`Admin user ${user.id} authorized for arxiv-scraper`);

        // Use service role for database operations (admin verified above)
        const supabase = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
        );

        const { problemSlug, maxResults = 10 } = await req.json();

        // Validate maxResults to prevent abuse
        const safeMaxResults = Math.min(Math.max(1, maxResults), 50);

        // Define search queries for each problem
        const searchQueries: Record<string, string> = {
            pvsnp: "P versus NP OR computational complexity OR NP-complete",
            riemann: "Riemann hypothesis OR zeta function OR prime distribution",
            "navier-stokes": "Navier-Stokes OR fluid dynamics OR existence smoothness",
            "yang-mills": "Yang-Mills OR mass gap OR quantum field theory",
            hodge: "Hodge conjecture OR algebraic cycles OR cohomology",
            "birch-sd": "Birch Swinnerton-Dyer OR elliptic curves OR L-functions",
            poincare: "Poincaré conjecture OR Ricci flow OR 3-manifolds",
        };

        const query = problemSlug ? searchQueries[problemSlug] : null;

        if (!query) {
            return new Response(
                JSON.stringify({ success: false, error: "Invalid problem slug" }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Get problem_id from slug
        const { data: problem, error: problemError } = await supabase
            .from("millennium_problems")
            .select("id")
            .eq("slug", problemSlug)
            .single();

        if (problemError) {
            console.error("Error finding problem:", problemError.message);
            return new Response(
                JSON.stringify({ success: false, error: "Problem not found" }),
                { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Fetch from arXiv API
        const arxivUrl = `http://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(
            query
        )}&start=0&max_results=${safeMaxResults}&sortBy=submittedDate&sortOrder=descending`;

        console.log(`Fetching from arXiv: ${arxivUrl}`);

        const response = await fetch(arxivUrl);
        const xmlText = await response.text();

        // Parse XML
        const entries = parseArxivXML(xmlText);
        console.log(`Found ${entries.length} papers from arXiv`);

        const newPapers = [];

        for (const entry of entries) {
            const arxivId = entry.id.split("/abs/")[1] || entry.id;

            // Check if paper already exists
            const { data: existing } = await supabase
                .from("research_papers")
                .select("id")
                .eq("arxiv_id", arxivId)
                .single();

            if (existing) {
                console.log(`Paper ${arxivId} already exists, skipping`);
                continue;
            }

            // Extract authors
            const authors = entry.author?.map((a) => a.name) || [];

            // Get PDF URL
            const pdfLink = entry.link?.find((l) => l.$?.type === "application/pdf");
            const pdf_url = pdfLink?.$?.href || null;

            // Insert paper
            const { data: paper, error: insertError } = await supabase
                .from("research_papers")
                .insert({
                    problem_id: problem.id,
                    title: entry.title.trim(),
                    authors,
                    abstract: entry.summary.trim(),
                    arxiv_id: arxivId,
                    published_date: entry.published,
                    pdf_url,
                })
                .select()
                .single();

            if (insertError) {
                console.error("Error inserting paper:", insertError);
                continue;
            }

            newPapers.push(paper);
        }

        console.log(`Successfully added ${newPapers.length} new papers`);

        return new Response(
            JSON.stringify({
                success: true,
                problemSlug,
                newPapersCount: newPapers.length,
                totalSearched: entries.length,
                papers: newPapers,
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    } catch (error) {
        console.error("Error:", error);
        return new Response(
            JSON.stringify({
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
            }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});

// Basic XML parser for arXiv response
function parseArxivXML(xmlText: string): ArxivEntry[] {
    const entries: ArxivEntry[] = [];
    const entryMatches = xmlText.matchAll(/<entry>([\s\S]*?)<\/entry>/g);

    for (const entryMatch of entryMatches) {
        const entryXml = entryMatch[1];

        const entry: Partial<ArxivEntry> = {
            id: extractTag(entryXml, "id"),
            title: extractTag(entryXml, "title"),
            summary: extractTag(entryXml, "summary"),
            published: extractTag(entryXml, "published"),
            updated: extractTag(entryXml, "updated"),
            author: [],
            link: [],
        };

        // Extract authors
        const authorMatches = entryXml.matchAll(/<author>[\s\S]*?<name>(.*?)<\/name>[\s\S]*?<\/author>/g);
        for (const authorMatch of authorMatches) {
            entry.author!.push({ name: authorMatch[1] });
        }

        // Extract links
        const linkMatches = entryXml.matchAll(/<link\s+href="(.*?)"\s+rel="(.*?)"(?:\s+type="(.*?)")?\s*\/>/g);
        for (const linkMatch of linkMatches) {
            entry.link!.push({
                $: {
                    href: linkMatch[1],
                    rel: linkMatch[2],
                    type: linkMatch[3],
                },
            });
        }

        entries.push(entry as ArxivEntry);
    }

    return entries;
}

function extractTag(xml: string, tagName: string): string {
    const match = xml.match(new RegExp(`<${tagName}>(.*?)<\/${tagName}>`, "s"));
    return match ? match[1].trim() : "";
}
