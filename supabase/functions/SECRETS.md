# Secrets Management - Million Visual Challenges

## Overview

This document describes all required and optional secrets for running Million Visual Challenges edge functions and services.

## Required Secrets

### OPENAI_API_KEY

**Purpose**: Required for AI features (paper summarization, research Q&A)  
**Used by**:
-`supabase/functions/paper-summarizer` - GPT-4 for multilevel summaries
- `supabase/functions/research-qa` - GPT-4 for Q&A and embeddings

**How to obtain**:
1. Sign up at [platform.openai.com](https://platform.openai.com)
2. Navigate to API Keys section
3. Create new secret key
4. Copy the key (starts with `sk-`)

**Estimated cost**: ~$24/month with moderate usage, up to $800/month without rate limiting

---

## Optional Secrets

### SEM ANTIC_SCHOLAR_API_KEY

**Purpose**: Enhanced academic paper metadata  
**Used by**: `supabase/functions/arxiv-scraper`  
**Status**: Optional - fallbacks exist

**How to obtain**:
1. Visit [Semantic Scholar API](https://www.semanticscholar.org/product/api)
2. Request API access
3. Free tier available for research/academic use

### CROSSREF_API_EMAIL

**Purpose**: Polite crawling for CrossRef API  
**Used by**: Paper metadata enrichment  
**Format**: Your email address

---

## Configuration Instructions

### Local Development

1. **Create `.env.local` file** (never commit this):

```bash
cd supabase/functions
cp .env.example .env.local
```

2. **Edit `.env.local` with your secrets**:

```bash
# Required
OPENAI_API_KEY=sk-your-actual-key-here

# Optional
SEMANTIC_SCHOLAR_API_KEY=your-key-here
CROSSREF_API_EMAIL=your-email@example.com
```

3. **Verify configuration**:

```bash
# Serve functions locally
supabase functions serve

# Test paper-summarizer
curl -X POST http://localhost:54321/functions/v1/paper-summarizer \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"paperId":"test","title":"Test Paper","abstract":"Test abstract..."}'
```

---

### Production (Supabase Dashboard)

1. **Navigate to Supabase Dashboard**:
   - URL: https://supabase.com/dashboard/project/vjskpckixgukiffaxypl/settings/functions
   - Go to: Project Settings → Edge Functions → Secrets

2. **Add each secret**:
   - Click "Add Secret"
   - Name: `OPENAI_API_KEY`
   - Value: Your OpenAI API key
   - Click "Add Secret"

3. **Verify deployment**:

```bash
# Deploy function
supabase functions deploy paper-summarizer

# Check logs
supabase functions logs paper-summarizer --tail
```

You should see: `[paper-summarizer] Initialized successfully`

---

### Using Supabase CLI (Advanced)

```bash
# Set secrets via CLI
supabase secrets set OPENAI_API_KEY=sk-your-key-here

# List all secrets (values are hidden)
supabase secrets list

# Unset a secret
supabase secrets unset SEMANTIC_SCHOLAR_API_KEY
```

---

## Security Best Practices

### ✅ DO

- Use separate API keys for development and production
- Rotate keys regularly (every 90 days recommended)
- Monitor API usage and costs
- Set up cost alerts in OpenAI dashboard
- Use environment-specific keys
- Add `.env.local` to `.gitignore`

### ❌ DON'T

- Commit secrets to version control
- Share production keys in Slack/email
- Use production keys in local development
- Hard-code secrets in source code
- Leave default example values in production

---

## Validation

### Startup Validation

All edge functions validate required secrets on startup:

```typescript
// This happens automatically
const openaiKey = Deno.env.get("OPENAI_API_KEY")
if (!openaiKey) {
  console.error('[function-name] FATAL: OPENAI_API_KEY not configured')
  throw new Error('OPENAI_API_KEY environment variable is required')
}
```

### Manual Validation

Create `scripts/validate-secrets.ts`:

```typescript
const requiredSecrets = ['OPENAI_API_KEY', 'SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']
const optionalSecrets = ['SEMANTIC_SCHOLAR_API_KEY', 'CROSSREF_API_EMAIL']

console.log('Validating secrets...\n')

requiredSecrets.forEach(secret => {
  const value = Deno.env.get(secret)
  if (!value) {
    console.error(`❌ MISSING (required): ${secret}`)
    Deno.exit(1)
  }
  console.log(`✅ ${secret}: configured`)
})

optionalSecrets.forEach(secret => {
  const value = Deno.env.get(secret)
  if (!value) {
    console.warn(`⚠️ MISSING (optional): ${secret}`)
  } else {
    console.log(`✅ ${secret}: configured`)
  }
})

console.log('\n✅ All required secrets configured!')
```

---

## Troubleshooting

### Issue: "OPENAI_API_KEY not configured" error

**Cause**: Secret not set or typo in name

**Solution**:
1. Verify secret name is exactly `OPENAI_API_KEY` (case-sensitive)
2. Check it's set in the correct environment
3. Redeploy function after adding secret
4. Check logs: `supabase functions logs function-name`

### Issue: "Invalid API key" from OpenAI

**Cause**: Incorrect key or key is revoked

**Solution**:
1. Verify key starts with `sk-`
2. Test key directly:
   ```bash
   curl https://api.openai.com/v1/models \
     -H "Authorization: Bearer YOUR_KEY"
   ```
3. Generate new key if needed
4. Update in all environments

### Issue: High OpenAI costs

**Cause**: Rate limiting not working or abuse

**Solution**:
1. Verify rate limiting is working (check logs)
2. Set up OpenAI usage limits in dashboard
3. Monitor `rate_limits` table in database
4. Consider implementing stricter limits

---

## Cost Monitoring

### OpenAI Dashboard

1. Visit [platform.openai.com/usage](https://platform.openai.com/usage)
2. Set usage limits:
   - Hard limit: $50/month (adjust as needed)
   - Email alerts at $25/month
3. Monitor daily usage

### Database Monitoring

```sql
-- Check rate limit usage
SELECT 
  action_type,
  COUNT(*) as requests,
  COUNT(DISTINCT user_id) as unique_users
FROM rate_limits
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY action_type;

-- Top users by request count
SELECT 
  user_id,
  action_type,
  COUNT(*) as requests
FROM rate_limits
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY user_id, action_type
ORDER BY requests DESC
LIMIT 10;
```

---

## Rotation Schedule

| Secret | Rotation Frequency | Process |
|--------|-------------------|---------|
| OPENAI_API_KEY | Every 90 days | Create new → Update all envs → Revoke old |
| SEMANTIC_SCHOLAR_API_KEY | Yearly or if compromised | Request new → Update → Deactivate old |

---

## Emergency Response

### If a secret is compromised:

1. **Immediate**:
   - Revoke the compromised key immediately
   - Generate new key
   - Update production ASAP

2. **Within 1 hour**:
   - Update all environments (dev, staging, prod)
   - Notify team
   - Review access logs

3. **Within 24 hours**:
   - Audit who had access
   - Review recent unusual activity
   - Update security procedures
   - Post-mortem if needed

---

## Related Documentation

- [SETUP.md](../SETUP.md) - General setup instructions
- [CONTRIBUTING.md](../CONTRIBUTING.md) - Development workflow
- [Edge Functions Docs](https://supabase.com/docs/guides/functions) - Supabase official docs

---

## Contact

For secret-related issues or security concerns:
- **Email**: ramiballes96@gmail.com
- **GitHub Issues**: [Security] tag for sensitive topics
- **Emergency**: If you discover a security vulnerability, email directly (do not create public issue)
