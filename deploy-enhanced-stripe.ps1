# Enhanced Stripe Integration Deployment Script
# This script helps deploy the enhanced Stripe integration

Write-Host "🚀 Enhanced Stripe Integration Deployment" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Please run this script from the project root directory" -ForegroundColor Red
    exit 1
}

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "❌ .env file not found!" -ForegroundColor Red
    Write-Host "Please create a .env file with your configuration first." -ForegroundColor Yellow
    Write-Host "Run: .\create-env.ps1" -ForegroundColor Gray
    exit 1
}

# Read environment variables
Write-Host "`n📋 Reading environment variables..." -ForegroundColor Yellow
$envVars = @{}
Get-Content ".env" | ForEach-Object {
    if ($_ -match '^([^#][^=]*?)=(.*)$') {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim()
        $envVars[$key] = $value
    }
}

# Check required variables
$requiredVars = @(
    'VITE_STRIPE_PUBLISHABLE_KEY',
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY'
)

$missingVars = @()
foreach ($var in $requiredVars) {
    if (-not $envVars.ContainsKey($var) -or [string]::IsNullOrWhiteSpace($envVars[$var]) -or $envVars[$var] -like "*your_*") {
        $missingVars += $var
    }
}

if ($missingVars.Count -gt 0) {
    Write-Host "❌ Missing or placeholder variables in .env file:" -ForegroundColor Red
    foreach ($var in $missingVars) {
        Write-Host "   - $var" -ForegroundColor Red
    }
    Write-Host "`n🔧 Please update your .env file with actual values:" -ForegroundColor Yellow
    Write-Host "   - Get Stripe keys from: https://dashboard.stripe.com/test/apikeys" -ForegroundColor Gray
    Write-Host "   - Get Supabase keys from: https://supabase.com/dashboard" -ForegroundColor Gray
    exit 1
}

Write-Host "✅ Environment variables validated" -ForegroundColor Green

# Check if Supabase CLI is installed
Write-Host "`n🔍 Checking Supabase CLI..." -ForegroundColor Yellow
try {
    $supabaseVersion = supabase --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Supabase CLI found: $supabaseVersion" -ForegroundColor Green
    } else {
        throw "Supabase CLI not found"
    }
} catch {
    Write-Host "❌ Supabase CLI not found!" -ForegroundColor Red
    Write-Host "Please install Supabase CLI:" -ForegroundColor Yellow
    Write-Host "   npm install -g supabase" -ForegroundColor Gray
    Write-Host "   Or visit: https://supabase.com/docs/guides/cli" -ForegroundColor Gray
    exit 1
}

# Check if Supabase project is linked
Write-Host "`n🔗 Checking Supabase project link..." -ForegroundColor Yellow
try {
    $projectInfo = supabase status 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Supabase project is linked" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Supabase project not linked. Please run:" -ForegroundColor Yellow
        Write-Host "   supabase link --project-ref YOUR_PROJECT_ID" -ForegroundColor Gray
        Write-Host "   Get your project ID from: https://supabase.com/dashboard" -ForegroundColor Gray
    }
} catch {
    Write-Host "⚠️ Could not check Supabase project status" -ForegroundColor Yellow
}

# Deploy edge functions
Write-Host "`n🚀 Deploying edge functions..." -ForegroundColor Yellow

$functions = @(
    "enhanced-stripe-webhook",
    "checkout-local-session"
)

foreach ($function in $functions) {
    Write-Host "Deploying $function..." -ForegroundColor Cyan
    try {
        supabase functions deploy $function
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ $function deployed successfully" -ForegroundColor Green
        } else {
            Write-Host "❌ Failed to deploy $function" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ Error deploying $function: $_" -ForegroundColor Red
    }
}

# Set up Supabase secrets
Write-Host "`n🔐 Setting up Supabase secrets..." -ForegroundColor Yellow

$secretsArgs = @()
if ($envVars.ContainsKey('STRIPE_SECRET_KEY')) {
    $secretsArgs += "STRIPE_SECRET_KEY=$($envVars['STRIPE_SECRET_KEY'])"
}
if ($envVars.ContainsKey('STRIPE_WEBHOOK_SECRET')) {
    $secretsArgs += "STRIPE_WEBHOOK_SECRET=$($envVars['STRIPE_WEBHOOK_SECRET'])"
}
if ($envVars.ContainsKey('SERVICE_ROLE_SECRET')) {
    $secretsArgs += "SUPABASE_SERVICE_ROLE_KEY=$($envVars['SERVICE_ROLE_SECRET'])"
}

if ($secretsArgs.Count -gt 0) {
    try {
        $secretsCommand = "supabase secrets set " + ($secretsArgs -join " ")
        Invoke-Expression $secretsCommand
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Secrets set successfully" -ForegroundColor Green
        } else {
            Write-Host "❌ Failed to set secrets" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ Error setting secrets: $_" -ForegroundColor Red
    }
} else {
    Write-Host "⚠️ No secrets to set (STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, SERVICE_ROLE_SECRET)" -ForegroundColor Yellow
}

# Check if database schema needs to be created
Write-Host "`n🗄️ Checking database schema..." -ForegroundColor Yellow
Write-Host "Please ensure the following tables exist in your Supabase database:" -ForegroundColor Cyan
Write-Host "   - orders" -ForegroundColor Gray
Write-Host "   - order_items" -ForegroundColor Gray
Write-Host "`nIf they don't exist, run the SQL commands from the integration guide." -ForegroundColor Yellow

# Build the project
Write-Host "`n🔨 Building project..." -ForegroundColor Yellow
try {
    npm run build
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Project built successfully" -ForegroundColor Green
    } else {
        Write-Host "❌ Build failed" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Error building project: $_" -ForegroundColor Red
    exit 1
}

# Final instructions
Write-Host "`n🎉 Enhanced Stripe Integration Deployment Complete!" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Green

Write-Host "`n📋 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Configure Stripe webhooks in your Stripe dashboard:" -ForegroundColor White
Write-Host "   - URL: https://your-project-id.supabase.co/functions/v1/enhanced-stripe-webhook" -ForegroundColor Gray
Write-Host "   - Events: checkout.session.completed, payment_intent.succeeded, payment_intent.payment_failed" -ForegroundColor Gray

Write-Host "`n2. Test the integration:" -ForegroundColor White
Write-Host "   - Use test cards: 4242 4242 4242 4242" -ForegroundColor Gray
Write-Host "   - Check webhook events in Stripe dashboard" -ForegroundColor Gray
Write-Host "   - Verify orders are created in Supabase" -ForegroundColor Gray

Write-Host "`n3. Go live:" -ForegroundColor White
Write-Host "   - Switch to live Stripe keys" -ForegroundColor Gray
Write-Host "   - Update webhook endpoints" -ForegroundColor Gray
Write-Host "   - Test with real payment methods" -ForegroundColor Gray

Write-Host "`n📚 Documentation:" -ForegroundColor Yellow
Write-Host "   - Integration Guide: ENHANCED_STRIPE_INTEGRATION_GUIDE.md" -ForegroundColor Gray
Write-Host "   - Stripe Dashboard: https://dashboard.stripe.com" -ForegroundColor Gray
Write-Host "   - Supabase Dashboard: https://supabase.com/dashboard" -ForegroundColor Gray

Write-Host "`n🚀 Your enhanced Stripe integration is ready!" -ForegroundColor Green
