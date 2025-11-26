// Shared rate‑limit helper for Supabase Edge Functions
// Usage: await checkRateLimit(userId, 'paper-summarizer', 5) // 5 requests per minute
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)

/**
 * Checks whether the user exceeded the allowed number of actions in the last minute.
 * If the limit is exceeded, throws an error that can be returned as a 429 response.
 */
export async function checkRateLimit(userId: string, action: string, limitPerMinute: number) {
    // Insert a new record (will be cleaned up later by the cleanup function)
    const { error: insertError } = await supabase.from('rate_limits').insert({
        user_id: userId,
        action_type: action,
    })
    if (insertError) {
        console.error('Rate limit insert error:', insertError)
        throw new Error('Rate limit check failed')
    }

    // Count actions in the last 60 seconds
    const { data, error } = await supabase
        .from('rate_limits')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('action_type', action)
        .gte('created_at', new Date(Date.now() - 60 * 1000).toISOString())

    if (error) {
        console.error('Rate limit count error:', error)
        throw new Error('Rate limit check failed')
    }

    const count = data?.length ?? 0
    if (count > limitPerMinute) {
        throw new Error('Rate limit exceeded')
    }
}
