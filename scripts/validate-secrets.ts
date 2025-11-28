#!/usr/bin/env deno run --allow-net --allow-env --allow-read

/**
 * Validation Script for Supabase Edge Functions
 * 
 * This script validates that all required secrets are configured
 * and that the functions can communicate with external APIs.
 * 
 * Usage:
 *   deno run --allow-net --allow-env --allow-read validate-secrets.ts
 * 
 * OR if you have the functions .env.local file:
 *   cd supabase/functions && deno run ../../scripts/validate-secrets.ts
 */

// ANSI color codes for terminal output
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

interface SecretCheck {
    name: string
    required: boolean
    validator?: (value: string) => Promise<boolean>
    description: string
}

const secrets: SecretCheck[] = [
    {
        name: 'OPENAI_API_KEY',
        required: true,
        description: 'OpenAI API key for GPT-4 and embeddings',
        validator: async (key: string) => {
            try {
                const response = await fetch('https://api.openai.com/v1/models', {
                    headers: { 'Authorization': `Bearer ${key}` }
                })
                return response.ok
            } catch {
                return false
            }
        }
    },
    {
        name: 'SUPABASE_URL',
        required: true,
        description: 'Supabase project URL',
    },
    {
        name: 'SUPABASE_ANON_KEY',
        required: true,
        description: 'Supabase anonymous (public) key',
    },
    {
        name: 'SUPABASE_SERVICE_ROLE_KEY',
        required: true,
        description: 'Supabase service role key (for admin operations)',
    },
    {
        name: 'SEMANTIC_SCHOLAR_API_KEY',
        required: false,
        description: 'Semantic Scholar API key (optional, for paper metadata)',
    },
    {
        name: 'CROSSREF_API_EMAIL',
        required: false,
        description: 'Email for polite CrossRef API access (optional)',
    },
]

async function validateSecrets() {
    log('\n🔍 Validating Supabase Edge Functions Secrets\n', colors.bold + colors.blue)

    let hasErrors = false
    let hasWarnings = false

    for (const secret of secrets) {
        const value = Deno.env.get(secret.name)

        if (!value) {
            if (secret.required) {
                log(`❌ MISSING (required): ${secret.name}`, colors.red)
                log(`   ${secret.description}`, colors.reset)
                hasErrors = true
            } else {
                log(`⚠️  MISSING (optional): ${secret.name}`, colors.yellow)
                log(`   ${secret.description}`, colors.reset)
                hasWarnings = true
            }
            continue
        }

        // Basic validation
        log(`✓ ${secret.name}: configured`, colors.green)

        // Advanced validation if validator is provided
        if (secret.validator) {
            log(`   Validating ${secret.name}...`, colors.blue)
            try {
                const isValid = await secret.validator(value)
                if (isValid) {
                    log(`   ✓ ${secret.name} is valid and working`, colors.green)
                } else {
                    log(`   ❌ ${secret.name} validation failed - check the value`, colors.red)
                    hasErrors = true
                }
            } catch (error) {
                log(`   ❌ ${secret.name} validation error: ${error}`, colors.red)
                hasErrors = true
            }
        }
    }

    log('\n' + '='.repeat(50) + '\n', colors.blue)

    if (hasErrors) {
        log('❌ VALIDATION FAILED', colors.red + colors.bold)
        log('\nSome required secrets are missing or invalid.', colors.red)
        log('Please check the configuration and try again.\n', colors.red)
        log('See supabase/functions/SECRETS.md for setup instructions.\n', colors.blue)
        Deno.exit(1)
    } else if (hasWarnings) {
        log('⚠️  VALIDATION PASSED WITH WARNINGS', colors.yellow + colors.bold)
        log('\nAll required secrets are configured, but some optional secrets are missing.', colors.yellow)
        log('The functions will work, but some features may be limited.\n', colors.yellow)
        Deno.exit(0)
    } else {
        log('✅ ALL SECRETS VALIDATED SUCCESSFULLY', colors.green + colors.bold)
        log('\nAll secrets are properly configured and working!\n', colors.green)
        Deno.exit(0)
    }
}

// Load .env.local if it exists
try {
    const envPath = new URL('../supabase/functions/.env.local', import.meta.url).pathname
    const envContent = await Deno.readTextFile(envPath)

    for (const line of envContent.split('\n')) {
        const trimmed = line.trim()
        if (trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('--')) {
            const [key, ...valueParts] = trimmed.split('=')
            const value = valueParts.join('=').trim()
            if (key && value) {
                Deno.env.set(key.trim(), value)
            }
        }
    }
    log('📄 Loaded environment from .env.local\n', colors.blue)
} catch {
    log('⚠️  No .env.local file found, using system environment variables\n', colors.yellow)
}

// Run validation
await validateSecrets()
