# Setup Stripe Secrets for Supabase Edge Functions
Write-Host "🔐 Setting up Stripe secrets for Supabase Edge Functions..." -ForegroundColor Cyan
Write-Host "=========================================================" -ForegroundColor Cyan

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "❌ .env file not found!" -ForegroundColor Red
    Write-Host "Please create a .env file with your Stripe keys first." -ForegroundColor Yellow
    exit 1
}

# Read environment variables from .env file
Write-Host "`n📋 Reading environment variables from .env file..." -ForegroundColor Yellow

$envVars = @{}
Get-Content ".env" | ForEach-Object {
    if ($_ -match '^([^#][^=]*?)=(.*)$') {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim()
        $envVars[$key] = $value
    }
}

# Check required Stripe variables
$requiredVars = @(
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET'
)

$missingVars = @()
foreach ($var in $requiredVars) {
    if (-not $envVars.ContainsKey($var) -or [string]::IsNullOrWhiteSpace($envVars[$var]) -or $envVars[$var] -like "*your_*") {
        $missingVars += $var
    }
}

if ($missingVars.Count -gt 0) {
    Write-Host "❌ Missing or placeholder Stripe variables in .env file:" -ForegroundColor Red
    foreach ($var in $missingVars) {
        Write-Host "   - $var" -ForegroundColor Red
    }
    Write-Host "`n🔧 Please update your .env file with actual Stripe keys:" -ForegroundColor Yellow
    Write-Host "   Get them from: https://dashboard.stripe.com/test/apikeys" -ForegroundColor Gray
    exit 1
}

# Build secrets command
Write-Host "`n🔐 Setting Supabase secrets..." -ForegroundColor Yellow

$secretsArgs = @()
$secretsArgs += "STRIPE_SECRET_KEY=$($envVars['STRIPE_SECRET_KEY'])"
$secretsArgs += "STRIPE_WEBHOOK_SECRET=$($envVars['STRIPE_WEBHOOK_SECRET'])"
$secretsArgs += "STRIPE_CURRENCY=usd"
$secretsArgs += "SITE_URL=http://localhost:8080"
$secretsArgs += "STRIPE_SUCCESS_PATH=/checkout/success"
$secretsArgs += "STRIPE_CANCEL_PATH=/checkout/cancel"

# Optional: Add service role key if available
if ($envVars.ContainsKey('SERVICE_ROLE_SECRET') -and -not [string]::IsNullOrWhiteSpace($envVars['SERVICE_ROLE_SECRET'])) {
    $secretsArgs += "SUPABASE_SERVICE_ROLE_KEY=$($envVars['SERVICE_ROLE_SECRET'])"
}

try {
    # Set the secrets
    $secretsCommand = "npx supabase secrets set " + ($secretsArgs -join " ")
    Write-Host "Executing: npx supabase secrets set [SECRETS_REDACTED]" -ForegroundColor Gray
    
    Invoke-Expression $secretsCommand
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Supabase secrets set successfully!" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to set Supabase secrets" -ForegroundColor Red
        exit 1
    }
    
    # Redeploy functions
    Write-Host "`n🚀 Redeploying Stripe-related functions..." -ForegroundColor Yellow
    
    $functions = @(
        'checkout-create-session',
        'stripe-webhook'
    )
    
    foreach ($func in $functions) {
        Write-Host "Deploying $func..." -ForegroundColor Gray
        & npx supabase functions deploy $func --no-verify-jwt
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ $func deployed successfully!" -ForegroundColor Green
        } else {
            Write-Host "❌ Failed to deploy $func" -ForegroundColor Red
        }
    }
    
    Write-Host "`n🎉 Stripe integration setup complete!" -ForegroundColor Green
    Write-Host "`n📋 Next steps:" -ForegroundColor Cyan
    Write-Host "1. Visit your app: http://localhost:8080/tshirts" -ForegroundColor White
    Write-Host "2. Click 'Check Environment' to verify all variables" -ForegroundColor White
    Write-Host "3. Click 'Test Supabase Connection' to verify connectivity" -ForegroundColor White
    Write-Host "4. Test the checkout flow by adding items to cart" -ForegroundColor White
    
} catch {
    Write-Host "❌ Error setting up Stripe secrets: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "`n=========================================================" -ForegroundColor Cyan



