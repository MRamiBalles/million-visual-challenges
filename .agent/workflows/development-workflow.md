---
description: Development workflow and best practices for Million Visual Challenges
---

# Development Workflow - Million Visual Challenges

## Daily Development Flow

### 1. Start Your Day
```bash
# Pull latest changes
git pull origin main

# Install any new dependencies
npm install

# Start development server
npm run dev
```

### 2. Before Creating a New Feature
```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Example: git checkout -b feature/riemann-zeta-visualization
```

### 3. Development Process

**Code with Best Practices:**
- Write TypeScript with strict mode
- Use functional components with hooks
- Follow component structure in `/src/components`
- Add proper TypeScript types
- Use TailwindCSS for styling
- Follow shadcn/ui patterns

**Testing:**
```bash
# Run tests
npm run test

# Run tests in watch mode
npm run test:watch

# Check coverage
npm run test:coverage
```

### 4. Before Committing

```bash
# Format code
npm run format

# Lint
npm run lint

# Type check
npm run typecheck

# Run all checks
npm run validate
```

### 5. Commit Changes
```bash
# Stage changes
git add .

# Commit with meaningful message
git commit -m "feat(riemann): add zeta function 3D visualization"

# Push to your branch
git push origin feature/your-feature-name
```

**Commit Message Convention:**
- `feat(scope): description` - New feature
- `fix(scope): description` - Bug fix
- `docs(scope): description` - Documentation
- `refactor(scope): description` - Code refactoring
- `test(scope): description` - Tests
- `chore(scope): description` - Maintenance

### 6. Create Pull Request
- Go to GitHub
- Create PR from your feature branch to `main`
- Add description of changes
- Link related issues
- Request review (if team exists)

## Working with Supabase

### Local Development Setup
```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Pull latest schema
supabase db pull
```

### Creating Database Migrations
```bash
# Create new migration
supabase migration new your_migration_name

# Example: supabase migration new add_citations_table

# Edit the migration file in supabase/migrations/

# Apply migration locally
supabase db reset

# Push to remote
supabase db push
```

### Testing Edge Functions Locally
```bash
# Serve edge functions locally
supabase functions serve

# Invoke function
supabase functions invoke function-name --data '{"key":"value"}'
```

### Deploy Edge Functions
```bash
# Deploy a function
supabase functions deploy function-name

# Deploy all functions
supabase functions deploy
```

## Creating New Problem Pages

### 1. Add Data to `millennium-problems.ts`
```typescript
{
  id: X,
  slug: "problem-slug",
  title: "Full Problem Title",
  // ... rest of the data
}
```

### 2. Create Page Component
```bash
# Create file: src/pages/YourProblem.tsx
```

### 3. Component Structure Template
```typescript
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const YourProblem = () => {
  const [difficulty, setDifficulty] = useState<"simple" | "intermediate" | "advanced">("simple");
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="hero-gradient py-20">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl font-bold mb-4">Problem Title</h1>
          <p className="text-xl">Brief description</p>
        </div>
      </section>
      
      {/* Difficulty Selector */}
      <Tabs value={difficulty} onValueChange={(v) => setDifficulty(v as any)}>
        <TabsList>
          <TabsTrigger value="simple">Simple</TabsTrigger>
          <TabsTrigger value="intermediate">Intermedio</TabsTrigger>
          <TabsTrigger value="advanced">Avanzado</TabsTrigger>
        </TabsList>
        
        {/* Content for each level */}
      </Tabs>
      
      {/* Visualizations */}
      <section className="py-20">
        {/* Your custom visualizations */}
      </section>
      
      {/* References */}
      <section className="py-20 bg-muted">
        {/* Academic references */}
      </section>
    </div>
  );
};

export default YourProblem;
```

### 4. Add Route to App.tsx
```typescript
import YourProblem from "./pages/YourProblem";

// In Routes:
<Route path="/problem-slug" element={<YourProblem />} />
```

## Creating Visualizations

### Using Three.js / React Three Fiber

```bash
# Install dependencies
npm install three @react-three/fiber @react-three/drei
```

```typescript
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

const Visualization3D = () => {
  return (
    <Canvas camera={{ position: [0, 0, 5] }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      {/* Your 3D objects */}
      <OrbitControls />
    </Canvas>
  );
};
```

### Using D3.js

```bash
npm install d3 @types/d3
```

```typescript
import { useEffect, useRef } from "react";
import * as d3 from "d3";

const D3Visualization = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  
  useEffect(() => {
    if (!svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    // Your D3 code
  }, []);
  
  return <svg ref={svgRef} width={800} height={600} />;
};
```

## AI Integration Workflow

### Adding New Edge Function

```bash
# Create function
supabase functions new function-name

# Navigate to the function
cd supabase/functions/function-name
```

**Template:**
```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )
    
    // Your logic here
    
    return new Response(
      JSON.stringify({ success: true }),
      { headers: { "Content-Type": "application/json" } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
})
```

### Testing with OpenAI API

```typescript
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: Deno.env.get('OPENAI_API_KEY'),
});

const completion = await openai.chat.completions.create({
  model: "gpt-4-turbo-preview",
  messages: [
    { role: "system", content: "You are a mathematics expert..." },
    { role: "user", content: userQuestion }
  ],
});
```

## Performance Optimization

### Code Splitting
```typescript
// Use React.lazy for route-based splitting
import { lazy } from "react";

const PvsNP = lazy(() => import("./pages/PvsNP"));
```

### Image Optimization
```bash
# Convert images to WebP
npm install sharp

# Use in build process or manually
```

### Bundle Analysis
```bash
# Install bundle analyzer
npm install --save-dev vite-bundle-visualizer

# Add to vite.config.ts
import { visualizer } from "vite-bundle-visualizer";

export default defineConfig({
  plugins: [react(), visualizer()],
});

# Build and analyze
npm run build
```

## Troubleshooting

### Common Issues

**Port already in use:**
```bash
# Kill process on port 5173
npx kill-port 5173

# Or use different port
npm run dev -- --port 3000
```

**Supabase connection issues:**
```bash
# Check environment variables
cat .env

# Restart Supabase
supabase stop
supabase start
```

**TypeScript errors:**
```bash
# Clear cache and rebuild
rm -rf node_modules package-lock.json
npm install
npm run typecheck
```

## Deployment

### Deploy to Production

```bash
# Build production bundle
npm run build

# Test production build locally
npm run preview
```

**Via Lovable:**
- Go to Lovable dashboard
- Click "Share" → "Publish"
- Production URL will be generated

**Manual deployment (Vercel):**
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Deploy to production
vercel --prod
```

## Resources

- **Documentation**: See `/docs` folder
- **Component Library**: Check Storybook (if set up)
- **API Docs**: See `implementation_plan.md`
- **Issues**: GitHub Issues tab
- **Discussions**: GitHub Discussions

## Code Review Checklist

Before submitting PR, ensure:
- [ ] Code follows TypeScript best practices
- [ ] No TypeScript errors (`npm run typecheck`)
- [ ] All tests pass (`npm run test`)
- [ ] Code is formatted (`npm run format`)
- [ ] No linting errors (`npm run lint`)
- [ ] Components are properly typed
- [ ] Accessibility considered (ARIA labels, keyboard navigation)
- [ ] Mobile responsive
- [ ] Performance tested (Lighthouse)
- [ ] Documentation updated if needed
