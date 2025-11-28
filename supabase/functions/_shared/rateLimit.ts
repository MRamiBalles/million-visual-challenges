// Shared rate‑limit helper for Supabase Edge Functions
// Usage: const limitInfo = await checkRateLimit(userId, 'paper-summarizer', 5)
// Returns metadata about rate limit status for client-side display
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!, 
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

export interface RateLimitInfo {
  allowed: boolean
  current: number
  limit: number
  remaining: number
  resetAt: Date
  windowStart: Date
}

export class RateLimitError extends Error {
  constructor(
    message: string,
    public readonly info: RateLimitInfo
  ) {
    super(message)
    this.name = 'RateLimitError'
  }
}

/**
 * Checks whether the user exceeded the allowed number of actions in the last minute.
 * 
 * @param userId - The user ID to check rate limits for
 * @param action - The action type (e.g., 'paper-summarizer', 'research-qa')
 * @param limitPerMinute - Maximum number of requests allowed per minute
 * @returns RateLimitInfo object with current usage statistics
 * @throws RateLimitError if the limit is exceeded
 * @throws Error if there's a database issue
 * 
 * @example
 * ```typescript
 * try {
 *   const limitInfo = await checkRateLimit(userId, 'paper-summarizer', 5)
 *   console.log(`Remaining: ${limitInfo.remaining}/${limitInfo.limit}`)
 * } catch (error) {
 *   if (error instanceof RateLimitError) {
 *     return new Response(JSON.stringify({ 
 *       error: 'Rate limit exceeded',
 *       ...error.info 
 *     }), { status: 429 })
 *   }
 * }
 * ```
 */
export async function checkRateLimit(
  userId: string, 
  action: string, 
  limitPerMinute: number
): Promise<RateLimitInfo> {
  const windowStart = new Date(Date.now() - 60 * 1000)
  const resetAt = new Date(Date.now() + 60 * 1000)

  // Insert a new record (will be cleaned up later by the cleanup function)
  const { error: insertError } = await supabase
    .from('rate_limits')
    .insert({
      user_id: userId,
      action_type: action,
    })
  
  if (insertError) {
    console.error('[RateLimit] Insert error:', {
      userId,
      action,
      error: insertError.message,
      code: insertError.code
    })
    throw new Error('Rate limit check failed: Unable to record request')
  }

  // Count actions in the last 60 seconds using proper count metadata
  const { count, error: countError } = await supabase
    .from('rate_limits')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('action_type', action)
    .gte('created_at', windowStart.toISOString())

  if (countError) {
    console.error('[RateLimit] Count error:', {
      userId,
      action,
      error: countError.message,
      code: countError.code
    })
    throw new Error('Rate limit check failed: Unable to count requests')
  }

  // FIX: Use count from metadata, not data.length (data is null with head: true)
  const requestCount = count ?? 0
  const remaining = Math.max(0, limitPerMinute - requestCount)
  const allowed = requestCount <= limitPerMinute

  const limitInfo: RateLimitInfo = {
    allowed,
    current: requestCount,
    limit: limitPerMinute,
    remaining,
    resetAt,
    windowStart
  }

  // Detailed logging for monitoring
  console.log('[RateLimit] Check:', {
    userId: userId.substring(0, 8) + '...',
    action,
    current: requestCount,
    limit: limitPerMinute,
    remaining,
    allowed,
    windowStart: windowStart.toISOString()
  })

  if (!allowed) {
    const waitSeconds = Math.ceil((resetAt.getTime() - Date.now()) / 1000)
    console.warn('[RateLimit] EXCEEDED:', {
      userId: userId.substring(0, 8) + '...',
      action,
      current: requestCount,
      limit: limitPerMinute,
      waitSeconds
    })
    
    throw new RateLimitError(
      `Rate limit exceeded. Current: ${requestCount}/${limitPerMinute}. Try again in ${waitSeconds}s.`,
      limitInfo
    )
  }

  return limitInfo
}
