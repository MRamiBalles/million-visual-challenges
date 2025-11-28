#!/usr/bin/env deno run --allow-net --allow-env --allow-read

/**
 * Rate Limit Testing Script
 * 
 * Tests the rate limiting functionality by making multiple rapid requests
 * to verify that limits are correctly enforced.
 * 
 * Usage:
 *   deno run --allow-net --allow-env scripts/test-rate-limit.ts
 * 
 * Options:
 *   --local     Test against local functions (default: http://localhost:54321)
 *   --prod      Test against production
 *   --function  Function to test (paper-summarizer | research-qa)
 *   --count     Number of requests to make (default: 10)
 */

const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    bold: '\x1b[1m',
}

function log(message: string, color: string = colors.reset) {
    console.log(`${color}${message}${colors.reset}`)
}

interface TestConfig {
    baseUrl: string
    functionName: string
    requestCount: number
    anonKey: string
}

function parseArgs(): TestConfig {
    const args = Deno.args
    const isProd = args.includes('--prod')
    const functionName = args.find(arg => arg === 'paper-summarizer' || arg === 'research-qa') || 'paper-summarizer'
    const countArg = args.find(arg => arg.startsWith('--count='))
    const requestCount = countArg ? parseInt(countArg.split('=')[1]) : 10

    const baseUrl = isProd
        ? `https://${Deno.env.get('VITE_SUPABASE_PROJECT_ID')}.supabase.co/functions/v1`
        : 'http://localhost:54321/functions/v1'

    const anonKey = Deno.env.get('VITE_SUPABASE_PUBLISHABLE_KEY') ||
        Deno.env.get('SUPABASE_ANON_KEY') || ''

    return { baseUrl, functionName, requestCount, anonKey }
}

async function testRateLimit(config: TestConfig) {
    log('\n🧪 Testing Rate Limit Functionality\n', colors.bold + colors.blue)
    log(`Function: ${config.functionName}`, colors.blue)
    log(`Base URL: ${config.baseUrl}`, colors.blue)
    log(`Request Count: ${config.requestCount}\n`, colors.blue)

    const results: Array<{
        attempt: number
        status: number
        success: boolean
        rateLimit?: any
        error?: string
        retryAfter?: string
    }> = []

    const payload = config.functionName === 'paper-summarizer'
        ? { paperId: `test-${Date.now()}`, title: 'Test Paper', abstract: 'Test abstract for rate limit testing.' }
        : { question: 'What is P vs NP?', problemId: 'pvsnp' }

    for (let i = 1; i <= config.requestCount; i++) {
        log(`Request ${i}/${config.requestCount}...`, colors.blue)

        try {
            const response = await fetch(`${config.baseUrl}/${config.functionName}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${config.anonKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            })

            const data = await response.json()
            const result = {
                attempt: i,
                status: response.status,
                success: response.ok,
                rateLimit: data.rateLimit,
                error: data.error,
                retryAfter: response.headers.get('Retry-After'),
            }

            results.push(result)

            if (response.ok) {
                log(`  ✓ Success (${response.status})`, colors.green)
                if (data.rateLimit) {
                    log(`    Remaining: ${data.rateLimit.remaining}/${data.rateLimit.limit}`, colors.green)
                }
            } else if (response.status === 429) {
                log(`  ⚠️  Rate Limited (429)`, colors.yellow)
                log(`    ${data.message}`, colors.yellow)
                if (result.retryAfter) {
                    log(`    Retry-After: ${result.retryAfter}s`, colors.yellow)
                }
            } else {
                log(`  ❌ Error (${response.status}): ${data.error}`, colors.red)
            }

            // Small delay between requests
            await new Promise(resolve => setTimeout(resolve, 100))

        } catch (error) {
            log(`  ❌ Request failed: ${error}`, colors.red)
            results.push({
                attempt: i,
                status: 0,
                success: false,
                error: String(error),
            })
        }
    }

    // Summary
    log('\n' + '='.repeat(50), colors.blue)
    log('\n📊 Test Summary\n', colors.bold + colors.blue)

    const successful = results.filter(r => r.success).length
    const rateLimited = results.filter(r => r.status === 429).length
    const errors = results.filter(r => !r.success && r.status !== 429).length

    log(`Total Requests: ${results.length}`, colors.blue)
    log(`✓ Successful: ${successful}`, colors.green)
    log(`⚠️  Rate Limited: ${rateLimited}`, colors.yellow)
    log(`❌ Errors: ${errors}`, colors.red)

    // Find the point where rate limiting kicked in
    const firstRateLimited = results.find(r => r.status === 429)
    if (firstRateLimited) {
        log(`\n✅ Rate limiting working correctly!`, colors.green + colors.bold)
        log(`   First rate limit occurred at request #${firstRateLimited.attempt}`, colors.green)
    } else {
        log(`\n⚠️  No rate limiting detected`, colors.yellow + colors.bold)
        log(`   This may indicate rate limiting is not working properly`, colors.yellow)
        log(`   OR the limit is higher than ${config.requestCount} requests`, colors.yellow)
    }

    // Rate limit info from last successful request
    const lastSuccess = [...results].reverse().find(r => r.success)
    if (lastSuccess?.rateLimit) {
        log(`\n📈 Last Rate Limit Info:`, colors.blue)
        log(`   Current: ${lastSuccess.rateLimit.limit - lastSuccess.rateLimit.remaining}/${lastSuccess.rateLimit.limit}`, colors.blue)
        log(`   Remaining: ${lastSuccess.rateLimit.remaining}`, colors.blue)
        log(`   Resets at: ${new Date(lastSuccess.rateLimit.resetAt).toLocaleTimeString()}`, colors.blue)
    }

    log('\n')
}

// Main execution
try {
    const config = parseArgs()

    if (!config.anonKey) {
        log('❌ Missing SUPABASE_ANON_KEY environment variable', colors.red)
        log('   Set VITE_SUPABASE_PUBLISHABLE_KEY or SUPABASE_ANON_KEY', colors.red)
        Deno.exit(1)
    }

    await testRateLimit(config)
} catch (error) {
    log(`\n❌ Test failed: ${error}\n`, colors.red)
    Deno.exit(1)
}
