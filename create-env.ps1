# Create .env file for VLANCO Streetwear Verse
Write-Host "🔧 Creating .env file..." -ForegroundColor Cyan

$envTemplate = @"
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SERVICE_ROLE_SECRET=your_service_role_key_here

# Stripe Configuration
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret_here

# Site Configuration
SITE_URL=http://localhost:8080
STRIPE_SUCCESS_PATH=/checkout/success
STRIPE_CANCEL_PATH=/checkout/cancel
"@

# Create the .env file
$envTemplate | Out-File -FilePath ".env" -Encoding utf8

if (Test-Path ".env") {
    Write-Host "✅ .env file created successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Next steps:" -ForegroundColor Yellow
    Write-Host "1. Open the .env file in your text editor" -ForegroundColor White
    Write-Host "2. Replace the placeholder values with your actual keys:" -ForegroundColor White
    Write-Host "   - Get Supabase keys from: https://supabase.com/dashboard" -ForegroundColor Gray
    Write-Host "   - Get Stripe keys from: https://dashboard.stripe.com/test/apikeys" -ForegroundColor Gray
    Write-Host "3. Save the file" -ForegroundColor White
    Write-Host "4. Restart your dev server: npm run dev" -ForegroundColor White
    Write-Host ""
    Write-Host "🔍 Your .env file is located at:" -ForegroundColor Cyan
    Write-Host "   $(Get-Location)\.env" -ForegroundColor White
} else {
    Write-Host "❌ Failed to create .env file" -ForegroundColor Red
}

