# Scripts Directory

This directory contains helper scripts for development, testing, and deployment of Million Visual Challenges.

## Available Scripts

### 1. validate-secrets.ts

**Purpose**: Validates that all required environment variables are configured correctly.

**Usage**:
```bash
# From project root
deno run --allow-net --allow-env --allow-read scripts/validate-secrets.ts

# OR from functions directory (auto-loads .env.local)
cd supabase/functions
deno run --allow-net --allow-env --allow-read ../../scripts/validate-secrets.ts
```

**What it checks**:
- ✅ Required secrets (OPENAI_API_KEY, SUPABASE_URL, etc.)
- ✅ Optional secrets (SEMANTIC_SCHOLAR_API_KEY, etc.)
- ✅ OpenAI API key validity (makes test request)
- ✅ Colored terminal output for easy reading

**Exit codes**:
- `0`: All required secrets valid
- `1`: Missing or invalid required secrets

---

### 2. test-rate-limit.ts

**Purpose**: Tests rate limiting functionality by making multiple rapid requests.

**Usage**:
```bash
# Test against local functions (default)
deno run --allow-net --allow-env scripts/test-rate-limit.ts

# Test against production
deno run --allow-net --allow-env scripts/test-rate-limit.ts --prod

# Test specific function
deno run --allow-net --allow-env scripts/test-rate-limit.ts paper-summarizer

# Custom request count
deno run --allow-net --allow-env scripts/test-rate-limit.ts --count=15
```

**Options**:
- `--local`: Test local functions (default)
- `--prod`: Test production functions
- `--function`: Specify function (paper-summarizer | research-qa)
- `--count=N`: Number of requests to make (default: 10)

**What it tests**:
- ✅ Rate limiting enforcement
- ✅ HTTP 429 responses
- ✅ Retry-After headers
- ✅ Rate limit metadata in responses
- ✅ Detailed test summary and analysis

---

## Prerequisites

### Deno Installation

These scripts require Deno runtime. Install it:

**Windows**:
```powershell
irm https://deno.land/install.ps1 | iex
```

**macOS/Linux**:
```bash
curl -fsSL https://deno.land/install.sh | sh
```

**Verify installation**:
```bash
deno --version
```

### Environment Variables

For local testing, create `supabase/functions/.env.local`:

```bash
cp supabase/functions/.env.example supabase/functions/.env.local
# Edit .env.local with your actual keys
```

Required variables:
- `OPENAI_API_KEY`: Your OpenAI API key
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key

---

## Typical Workflow

### Before Deployment

1. **Validate secrets**:
   ```bash
   deno run --allow-net --allow-env --allow-read scripts/validate-secrets.ts
   ```

2. **If validation fails**, check:
   - `.env.local` file exists
   - Keys are correctly formatted
   - No typos in secret names

### After Deployment

1. **Test rate limiting locally**:
   ```bash
   # Start local functions
   supabase functions serve
   
   # In another terminal
   deno run --allow-net --allow-env scripts/test-rate-limit.ts --count=7
   ```

2. **Test rate limiting in production**:
   ```bash
   deno run --allow-net --allow-env scripts/test-rate-limit.ts --prod --count=7
   ```

3. **Expected results**:
   - First 5 requests succeed (for paper-summarizer)
   - First 10 requests succeed (for research-qa)
   - Subsequent requests return 429
   - Retry-After header present

---

## Troubleshooting

### "Permission denied" errors

Add the required permissions:
```bash
deno run --allow-net --allow-env --allow-read scripts/script-name.ts
```

### "OpenAI API key validation failed"

Check:
1. Key starts with `sk-`
2. Key has not been revoked
3. Test manually:
   ```bash
   curl https://api.openai.com/v1/models \
     -H "Authorization: Bearer YOUR_KEY"
   ```

### "Cannot find .env.local"

Create it:
```bash
cd supabase/functions
cp .env.example .env.local
# Edit with your actual keys
```

### Rate limit test shows no 429 responses

Possible causes:
1. Not enough requests (increase `--count`)
2. Rate limiting not deployed
3. Database issues (check `rate_limits` table)
4. Each test uses different user (tests require auth)

---

## Adding New Scripts

When creating new scripts:

1. **Use TypeScript** for type safety
2. **Add execution permissions**:
   ```bash
   chmod +x scripts/your-script.ts
   ```
3. **Add shebang**:
   ```typescript
   #!/usr/bin/env deno run --allow-net --allow-env
   ```
4. **Document in this README**
5. **Follow existing patterns**:
   - Colored terminal output
   - Clear error messages
   - Usage examples in comments

---

## Related Documentation

- **SECRETS.md**: Detailed secrets configuration guide
- **DEPLOYMENT_CHECKLIST.md**: Complete deployment checklist
- **walkthrough.md**: Implementation walkthrough

---

## Contact

Questions or issues with scripts?
- **Email**: ramiballes96@gmail.com
- **GitHub**: [Create Issue](https://github.com/MRamiBalles/million-visual-challenges/issues)
