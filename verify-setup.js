#!/usr/bin/env node

/**
 * Verification Script for Million Visual Challenges Setup
 * Checks if all required components are properly configured
 */

const fs = require('fs');
const path = require('path');

const checks = [];
let passedChecks = 0;
let failedChecks = 0;

console.log('\n🔍 Million Visual Challenges - Setup Verification\n');
console.log('═'.repeat(60));

// Helper functions
function check(name, condition, successMsg, failMsg, optional = false) {
    checks.push({ name, condition, successMsg, failMsg, optional });
}

function printCheck(name, passed, message, optional = false) {
    const icon = passed ? '✅' : (optional ? '⚠️ ' : '❌');
    const status = passed ? 'PASS' : (optional ? 'SKIP' : 'FAIL');
    console.log(`${icon} ${name}: ${status}`);
    if (message) {
        console.log(`   ${message}`);
    }
}

// Check 1: Node modules installed
check(
    'Dependencies Installed',
    fs.existsSync(path.join(__dirname, 'node_modules')),
    'node_modules directory found',
    'Run "npm install" to install dependencies'
);

// Check 2: .env file exists
check(
    'Environment Variables',
    fs.existsSync(path.join(__dirname, '.env')),
    '.env file configured',
    '.env file missing (copy from .env.example)',
    false
);

// Check 3: Supabase config
check(
    'Supabase Config',
    fs.existsSync(path.join(__dirname, 'supabase', 'config.toml')),
    'Supabase project linked',
    'Run "supabase link" to connect to your project'
);

// Check 4: Migration files
const migrationsDir = path.join(__dirname, 'supabase', 'migrations');
const hasMigrations = fs.existsSync(migrationsDir) &&
    fs.readdirSync(migrationsDir).some(f => f.includes('millennium_problems'));

check(
    'Database Migrations',
    hasMigrations,
    'Migration files found',
    'Migration files missing - check supabase/migrations/'
);

// Check 5: TypeScript types
check(
    'TypeScript Types',
    fs.existsSync(path.join(__dirname, 'src', 'types', 'database.ts')),
    'Database types generated',
    'src/types/database.ts missing'
);

// Check 6: Edge Functions
check(
    'Edge Functions',
    fs.existsSync(path.join(__dirname, 'supabase', 'functions', 'arxiv-scraper', 'index.ts')),
    'arxiv-scraper function found',
    'Edge function missing',
    true // optional for MVP
);

// Check 7: Documentation
const docs = ['README.md', 'SETUP.md', 'implementation_plan.md'].every(
    doc => fs.existsSync(path.join(__dirname, doc)) ||
        fs.existsSync(path.join(__dirname, '.gemini', 'artifacts', doc))
);
check(
    'Documentation',
    docs,
    'All documentation files present',
    'Some documentation missing'
);

// Check 8: Package.json scripts
let packageJson;
try {
    packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
    const hasScripts = packageJson.scripts &&
        packageJson.scripts.dev &&
        packageJson.scripts.build;

    check(
        'NPM Scripts',
        hasScripts,
        'Build scripts configured',
        'package.json scripts missing'
    );
} catch (e) {
    check('NPM Scripts', false, '', 'package.json not found or invalid');
}

// Check 9: Key dependencies
if (packageJson) {
    const deps = packageJson.dependencies || {};
    const hasSupabase = deps['@supabase/supabase-js'];
    const hasReact = deps.react;
    const hasTailwind = deps.tailwindcss ||
        (packageJson.devDependencies && packageJson.devDependencies.tailwindcss);

    check(
        'Core Dependencies',
        hasSupabase && hasReact && hasTailwind,
        'Supabase, React, and TailwindCSS installed',
        'Some core dependencies missing'
    );
}

// Check 10: Git repository
check(
    'Git Repository',
    fs.existsSync(path.join(__dirname, '.git')),
    'Git initialized',
    'Git not initialized (optional)',
    true
);

console.log();

// Run all checks
checks.forEach(({ name, condition, successMsg, failMsg, optional }) => {
    const passed = typeof condition === 'function' ? condition() : condition;

    if (passed) {
        passedChecks++;
        printCheck(name, true, successMsg);
    } else {
        if (optional) {
            printCheck(name, false, failMsg, true);
        } else {
            failedChecks++;
            printCheck(name, false, failMsg);
        }
    }
});

// Summary
console.log('\n' + '═'.repeat(60));
console.log(`\n📊 Results: ${passedChecks}/${checks.filter(c => !c.optional).length} required checks passed`);

if (failedChecks > 0) {
    console.log('\n⚠️  Setup incomplete. Please fix the failed checks above.\n');
    console.log('📖 See SETUP.md for detailed instructions.\n');
    process.exit(1);
} else {
    console.log('\n✨ Setup verified successfully!\n');
    console.log('🚀 Next steps:');
    console.log('   1. Apply database migrations: supabase db push');
    console.log('   2. Start development server: npm run dev');
    console.log('   3. Visit http://localhost:5173\n');
    console.log('📚 See implementation_plan.md for the development roadmap.\n');
    process.exit(0);
}
