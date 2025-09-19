# Setup Netlify Environment Variables for Stripe Integration
# This script helps you configure the required environment variables for your Netlify deployment

Write-Host "🚀 Setting up Netlify Environment Variables for Stripe Integration" -ForegroundColor Green
Write-Host ""

# Check if Netlify CLI is installed
try {
    $netlifyVersion = netlify --version 2>$null
    if ($LASTEXITCODE -ne 0) {
        throw "Netlify CLI not found"
    }
    Write-Host "✅ Netlify CLI found: $netlifyVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Netlify CLI not found. Please install it first:" -ForegroundColor Red
    Write-Host "   npm install -g netlify-cli" -ForegroundColor Yellow
    Write-Host "   Or visit: https://docs.netlify.com/cli/get-started/" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "📋 Required Environment Variables:" -ForegroundColor Cyan
Write-Host "   1. VITE_STRIPE_PUBLISHABLE_KEY - Your Stripe publishable key" -ForegroundColor White
Write-Host "   2. VITE_SUPABASE_URL - Your Supabase project URL" -ForegroundColor White
Write-Host "   3. VITE_SUPABASE_ANON_KEY - Your Supabase anon key" -ForegroundColor White
Write-Host ""

# Prompt for Stripe publishable key
$stripeKey = Read-Host "Enter your Stripe publishable key (starts with pk_test_ or pk_live_)"

if (-not $stripeKey -or $stripeKey -eq "") {
    Write-Host "❌ Stripe publishable key is required" -ForegroundColor Red
    exit 1
}

if (-not $stripeKey.StartsWith("pk_")) {
    Write-Host "⚠️  Warning: Stripe publishable key should start with 'pk_'" -ForegroundColor Yellow
}

# Prompt for Supabase URL
$supabaseUrl = Read-Host "Enter your Supabase URL"

if (-not $supabaseUrl -or $supabaseUrl -eq "") {
    Write-Host "❌ Supabase URL is required" -ForegroundColor Red
    exit 1
}

# Prompt for Supabase anon key
$supabaseAnonKey = Read-Host "Enter your Supabase anon key"

if (-not $supabaseAnonKey -or $supabaseAnonKey -eq "") {
    Write-Host "❌ Supabase anon key is required" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🔧 Setting environment variables..." -ForegroundColor Cyan

try {
    # Set environment variables using Netlify CLI
    netlify env:set VITE_STRIPE_PUBLISHABLE_KEY $stripeKey
    netlify env:set VITE_SUPABASE_URL $supabaseUrl
    netlify env:set VITE_SUPABASE_ANON_KEY $supabaseAnonKey
    
    Write-Host "✅ Environment variables set successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🚀 Next steps:" -ForegroundColor Cyan
    Write-Host "   1. Trigger a new deployment on Netlify" -ForegroundColor White
    Write-Host "   2. Test the checkout functionality" -ForegroundColor White
    Write-Host "   3. Verify that the Stripe integration works" -ForegroundColor White
    Write-Host ""
    Write-Host "💡 Alternative: You can also set these in your Netlify dashboard:" -ForegroundColor Yellow
    Write-Host "   Site Settings → Environment Variables" -ForegroundColor White
    
} catch {
    Write-Host "❌ Error setting environment variables: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Manual setup:" -ForegroundColor Yellow
    Write-Host "   1. Go to your Netlify dashboard" -ForegroundColor White
    Write-Host "   2. Navigate to Site Settings → Environment Variables" -ForegroundColor White
    Write-Host "   3. Add the following variables:" -ForegroundColor White
    Write-Host "      - VITE_STRIPE_PUBLISHABLE_KEY: $stripeKey" -ForegroundColor White
    Write-Host "      - VITE_SUPABASE_URL: $supabaseUrl" -ForegroundColor White
    Write-Host "      - VITE_SUPABASE_ANON_KEY: $supabaseAnonKey" -ForegroundColor White
}

Write-Host ""
Write-Host "✨ Setup complete!" -ForegroundColor Green
