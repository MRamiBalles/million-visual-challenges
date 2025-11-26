# Setup Guide - Million Visual Challenges

## Prerequisites

- Node.js 18+ and npm
- Supabase CLI (`npm install -g supabase`)
- Git
- (Optional) OpenAI API key for AI features

## Initial Setup

### 1. Clone and Install Dependencies

```bash
# Navigate to project
cd million-visual-challenges

# Install dependencies
npm install
```

### 2. Configure Supabase

```bash
# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref vjskpckixgukiffaxypl

# Pull current schema (if needed)
supabase db pull
```

### 3. Run Database Migrations

```bash
# Apply all migrations to your Supabase database
supabase db push

# Verify migrations were successful
supabase db reset --debug
```

The migrations will create:
- `millennium_problems` - Core table with all 7 problems  
- `research_papers` - Academic papers with AI summaries
- `visualizations` - Interactive visualizations configuration
- `discussions` - Community forums with LaTeX support
- `user_progress` - Learning progress tracking
- And 4 more tables...

### 4. Environment Variables

Create `.env.local` if not exists:

```bash
# Already configured in .env:
VITE_SUPABASE_URL=https://vjskpckixgukiffaxypl.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key

# Add for AI features (optional for MVP):
VITE_OPENAI_API_KEY=your-openai-api-key-here
```

For Edge Functions, create `supabase/functions/.env.local`:

```bash
cp supabase/functions/.env.example supabase/functions/.env.local
# Then edit .env.local with your keys
```

### 5. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:5173`

## Database Verification

After running migrations, verify the tables exist:

```bash
# List all tables
supabase db diff

# OR check in Supabase Dashboard:
# https://supabase.com/dashboard/project/vjskpckixgukiffaxypl/editor
```

You should see:
- ✅ millennium_problems (7 rows - all problems seeded)
- ✅ research_papers
- ✅ key_references
- ✅ visualizations
- ✅ applications
- ✅ user_progress
- ✅ discussions
- ✅ discussion_votes
- ✅ ai_updates_log

## Deploy Edge Functions (Optional)

```bash
# Deploy arxiv-scraper function
supabase functions deploy arxiv-scraper

# Set environment variables in Supabase Dashboard:
# Project Settings > Edge Functions > Add Secret
# - OPENAI_API_KEY
# - Other API keys from .env.example
```

## Testing Edge Functions Locally

```bash
# Serve functions locally
supabase functions serve

# In another terminal, test arxiv-scraper:
curl -X POST http://localhost:54321/functions/v1/arxiv-scraper \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{"problemSlug": "pvsnp", "maxResults": 5}'
```

## Next Steps

1. **Phase 1**: Start developing problem pages (P vs NP, Riemann first)
2. **Phase 2**: Build visualizations with Three.js
3. **Phase 3**: Add AI integration for paper summaries

See `implementation_plan.md` for detailed roadmap.

## Troubleshooting

### Migrations fail
```bash
# Reset database and reapply
supabase db reset

# Check migration files
ls -la supabase/migrations/
```

### Can't connect to Supabase
```bash
# Verify project ID
cat supabase/config.toml

# Check .env variables
cat .env
```

### Edge function errors
```bash
# Check logs
supabase functions logs arxiv-scraper

# Serve with debug
supabase functions serve --debug
```

## Useful Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run preview          # Preview production build

# Database
supabase db reset        # Reset DB and rerun all migrations
supabase db diff         # Show schema diff
supabase db push         # Push local migrations
supabase db pull         # Pull remote schema

# Edge Functions
supabase functions list  # List all functions
supabase functions serve # Run functions locally
supabase functions deploy [name] # Deploy function

# Testing
npm run test             # Run tests (when set up)
npm run lint             # Run linter
npm run typecheck        # TypeScript check
```

## Resources

- **Implementation Plan**: See `implementation_plan.md`
- **Task List**: See `.gemini/artifacts/task.md`  
- **Workflow Guide**: See `.agent/workflows/development-workflow.md`
- **Supabase Dashboard**: https://supabase.com/dashboard/project/vjskpckixgukiffaxypl
- **Clay Mathematics**: https://www.claymath.org/millennium-problems/
