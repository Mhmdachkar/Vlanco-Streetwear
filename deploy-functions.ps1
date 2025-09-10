# Deploy all Supabase Edge Functions
Write-Host "🚀 Deploying Supabase Edge Functions..." -ForegroundColor Green

# Check if supabase CLI is available
$supabaseCmd = "npx supabase"
try {
    $version = & npx supabase --version 2>&1
    Write-Host "✅ Found Supabase CLI version: $version" -ForegroundColor Green
} catch {
    Write-Host "❌ Supabase CLI not found. Please install it first:" -ForegroundColor Red
    Write-Host "npx supabase@latest --version" -ForegroundColor Yellow
    exit 1
}

# Check if we're in the right directory
if (!(Test-Path "supabase/functions")) {
    Write-Host "❌ supabase/functions directory not found. Please run this from the project root." -ForegroundColor Red
    exit 1
}

# Login check
Write-Host "🔐 Checking Supabase login status..." -ForegroundColor Blue
$loginStatus = supabase auth status 2>&1
if ($loginStatus -match "not logged in") {
    Write-Host "❌ Not logged in to Supabase. Please run: supabase auth login" -ForegroundColor Red
    exit 1
}

# List of functions to deploy
$functions = @(
    "analytics-track",
    "cart-merge", 
    "checkout-create-session",
    "discounts-apply",
    "inventory-hold",
    "inventory-sync",
    "notifications-enqueue",
    "reviews-submit",
    "stripe-webhook"
)

$successCount = 0
$failCount = 0

foreach ($func in $functions) {
    Write-Host "📦 Deploying function: $func" -ForegroundColor Cyan
    
    $result = & npx supabase functions deploy $func 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Successfully deployed: $func" -ForegroundColor Green
        $successCount++
    } else {
        Write-Host "❌ Failed to deploy: $func" -ForegroundColor Red
        Write-Host "Error: $result" -ForegroundColor Red
        $failCount++
    }
    
    Start-Sleep -Seconds 1
}

Write-Host "`n📊 Deployment Summary:" -ForegroundColor Yellow
Write-Host "✅ Successful: $successCount" -ForegroundColor Green
Write-Host "❌ Failed: $failCount" -ForegroundColor Red

if ($failCount -eq 0) {
    Write-Host "`n🎉 All functions deployed successfully!" -ForegroundColor Green
    Write-Host "You can now test the functions in your application." -ForegroundColor Cyan
} else {
    Write-Host "`n⚠️  Some functions failed to deploy. Please check the errors above." -ForegroundColor Yellow
}
