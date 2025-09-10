# Comprehensive Setup Verification Script
Write-Host "🔍 VLANCO Streetwear Verse - Setup Verification" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

$errors = @()
$warnings = @()
$success = @()

# 1. Check Environment Variables
Write-Host "`n📋 Checking Environment Variables..." -ForegroundColor Yellow

$requiredEnvVars = @(
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'STRIPE_SECRET_KEY'
)

foreach ($envVar in $requiredEnvVars) {
    $envValue = Get-Item "Env:$envVar" -ErrorAction SilentlyContinue
    if ($envValue) {
        $success += "✅ $envVar is set"
        Write-Host "  ✅ $envVar is set" -ForegroundColor Green
    } else {
        $errors += "❌ $envVar is missing"
        Write-Host "  ❌ $envVar is missing" -ForegroundColor Red
    }
}

# 2. Check Supabase Functions
Write-Host "`n🔧 Checking Supabase Functions..." -ForegroundColor Yellow

$functionsDir = "supabase/functions"
if (Test-Path $functionsDir) {
    $functions = Get-ChildItem $functionsDir -Directory | Where-Object { $_.Name -ne "_shared" }
    
    $expectedFunctions = @(
        'analytics-track',
        'cart-merge',
        'checkout-create-session',
        'discounts-apply',
        'notifications-enqueue',
        'reviews-submit',
        'stripe-webhook'
    )
    
    foreach ($expectedFunction in $expectedFunctions) {
        if ($functions.Name -contains $expectedFunction) {
            $success += "✅ Function $expectedFunction exists"
            Write-Host "  ✅ Function $expectedFunction exists" -ForegroundColor Green
        } else {
            $errors += "❌ Function $expectedFunction missing"
            Write-Host "  ❌ Function $expectedFunction missing" -ForegroundColor Red
        }
    }
} else {
    $errors += "❌ Supabase functions directory not found"
    Write-Host "  ❌ Supabase functions directory not found" -ForegroundColor Red
}

# 3. Check Database Migration
Write-Host "`n🗃️ Checking Database Migration..." -ForegroundColor Yellow

$migrationDir = "supabase/migrations"
if (Test-Path $migrationDir) {
    $migrations = Get-ChildItem $migrationDir -Filter "*.sql"
    if ($migrations.Count -gt 0) {
        $success += "✅ Database migrations found ($($migrations.Count) files)"
        Write-Host "  ✅ Database migrations found ($($migrations.Count) files)" -ForegroundColor Green
    } else {
        $warnings += "⚠️ No database migrations found"
        Write-Host "  ⚠️ No database migrations found" -ForegroundColor Yellow
    }
} else {
    $errors += "❌ Migrations directory not found"
    Write-Host "  ❌ Migrations directory not found" -ForegroundColor Red
}

# 4. Check Key Files
Write-Host "`n📁 Checking Key Files..." -ForegroundColor Yellow

$keyFiles = @(
    'src/integrations/supabase/client.ts',
    'src/hooks/useCart.tsx',
    'src/hooks/useAuth.tsx',
    'src/services/analyticsService.ts',
    'src/services/edgeFunctions.ts',
    'package.json'
)

foreach ($file in $keyFiles) {
    if (Test-Path $file) {
        $success += "✅ $file exists"
        Write-Host "  ✅ $file exists" -ForegroundColor Green
    } else {
        $errors += "❌ $file missing"
        Write-Host "  ❌ $file missing" -ForegroundColor Red
    }
}

# 5. Check Node Modules
Write-Host "`n📦 Checking Dependencies..." -ForegroundColor Yellow

if (Test-Path "node_modules") {
    $success += "✅ Node modules installed"
    Write-Host "  ✅ Node modules installed" -ForegroundColor Green
} else {
    $errors += "❌ Node modules not installed (run npm install)"
    Write-Host "  ❌ Node modules not installed (run npm install)" -ForegroundColor Red
}

# 6. Test Supabase CLI
Write-Host "`n🔧 Checking Supabase CLI..." -ForegroundColor Yellow

try {
    $supabaseVersion = & npx supabase --version 2>&1
    $success += "✅ Supabase CLI available (version: $supabaseVersion)"
    Write-Host "  ✅ Supabase CLI available (version: $supabaseVersion)" -ForegroundColor Green
} catch {
    $errors += "❌ Supabase CLI not available"
    Write-Host "  ❌ Supabase CLI not available" -ForegroundColor Red
}

# Summary
Write-Host "`n📊 SETUP VERIFICATION SUMMARY" -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Cyan

Write-Host "`n✅ SUCCESS ($($success.Count)):" -ForegroundColor Green
foreach ($item in $success) {
    Write-Host "  $item" -ForegroundColor Green
}

if ($warnings.Count -gt 0) {
    Write-Host "`n⚠️ WARNINGS ($($warnings.Count)):" -ForegroundColor Yellow
    foreach ($item in $warnings) {
        Write-Host "  $item" -ForegroundColor Yellow
    }
}

if ($errors.Count -gt 0) {
    Write-Host "`n❌ ERRORS ($($errors.Count)):" -ForegroundColor Red
    foreach ($item in $errors) {
        Write-Host "  $item" -ForegroundColor Red
    }
    
    Write-Host "`n🔧 NEXT STEPS:" -ForegroundColor Yellow
    Write-Host "  1. Create .env file with required environment variables" -ForegroundColor White
    Write-Host "  2. Run: npm install" -ForegroundColor White
    Write-Host "  3. Deploy functions: npx supabase functions deploy <function-name> --no-verify-jwt" -ForegroundColor White
    Write-Host "  4. Apply database migration: npx supabase db reset" -ForegroundColor White
} else {
    Write-Host "`n🎉 SETUP VERIFICATION COMPLETE!" -ForegroundColor Green
    Write-Host "  Your VLANCO Streetwear Verse project is properly configured!" -ForegroundColor Green
    Write-Host "`n🚀 READY TO TEST:" -ForegroundColor Cyan
    Write-Host "  1. Start the dev server: npm run dev" -ForegroundColor White
    Write-Host "  2. Visit the T-Shirt collection page" -ForegroundColor White
    Write-Host "  3. Use the debug tools to test all functionality" -ForegroundColor White
    Write-Host "  4. Test the complete user journey: Browse → Add to Cart → Checkout" -ForegroundColor White
}

Write-Host "`n=================================================" -ForegroundColor Cyan
