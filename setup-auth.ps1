# VLANCO Authentication Setup Script
Write-Host "🔐 VLANCO Streetwear - Authentication Setup" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan

$envFile = ".env"
$envExists = Test-Path $envFile

Write-Host "`n📋 Environment Setup:" -ForegroundColor Yellow

if ($envExists) {
    Write-Host "  ✅ .env file found" -ForegroundColor Green
    
    # Read current environment variables
    $envContent = Get-Content $envFile -ErrorAction SilentlyContinue
    
    # Check Supabase configuration
    $supabaseUrl = $envContent | Where-Object { $_ -match "^VITE_SUPABASE_URL=" }
    $supabaseKey = $envContent | Where-Object { $_ -match "^VITE_SUPABASE_ANON_KEY=" }
    
    Write-Host "`n🔍 Current Configuration:" -ForegroundColor Yellow
    
    if ($supabaseUrl) {
        $urlValue = ($supabaseUrl -split '=', 2)[1]
        if ($urlValue -and $urlValue.Trim() -ne '' -and $urlValue -ne 'your_supabase_project_url_here') {
            Write-Host "  ✅ VITE_SUPABASE_URL is configured" -ForegroundColor Green
        } else {
            Write-Host "  ❌ VITE_SUPABASE_URL needs configuration" -ForegroundColor Red
        }
    } else {
        Write-Host "  ❌ VITE_SUPABASE_URL is missing" -ForegroundColor Red
    }
    
    if ($supabaseKey) {
        $keyValue = ($supabaseKey -split '=', 2)[1]
        if ($keyValue -and $keyValue.Trim() -ne '' -and $keyValue -ne 'your_supabase_anon_key_here') {
            Write-Host "  ✅ VITE_SUPABASE_ANON_KEY is configured" -ForegroundColor Green
        } else {
            Write-Host "  ❌ VITE_SUPABASE_ANON_KEY needs configuration" -ForegroundColor Red
        }
    } else {
        Write-Host "  ❌ VITE_SUPABASE_ANON_KEY is missing" -ForegroundColor Red
    }
    
} else {
    Write-Host "  ❌ .env file not found" -ForegroundColor Red
    Write-Host "`n🔧 Creating .env file..." -ForegroundColor Yellow
    
    $envTemplate = @"
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Stripe Configuration (Optional)
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret_here

# Site Configuration
SITE_URL=http://localhost:8080
STRIPE_SUCCESS_PATH=/checkout/success
STRIPE_CANCEL_PATH=/checkout/cancel
"@
    
    $envTemplate | Out-File -FilePath $envFile -Encoding utf8
    Write-Host "  ✅ .env file created" -ForegroundColor Green
}

Write-Host "`n📋 Setup Instructions:" -ForegroundColor Yellow
Write-Host "1. Go to https://supabase.com/dashboard" -ForegroundColor White
Write-Host "2. Create a new project or select existing project" -ForegroundColor White
Write-Host "3. Go to Settings > API" -ForegroundColor White
Write-Host "4. Copy your Project URL and anon/public key" -ForegroundColor White
Write-Host "5. Update the .env file with your credentials:" -ForegroundColor White
Write-Host "   - Replace 'your-project-id.supabase.co' with your actual URL" -ForegroundColor Gray
Write-Host "   - Replace 'your_supabase_anon_key_here' with your actual key" -ForegroundColor Gray
Write-Host "6. Restart your development server: npm run dev" -ForegroundColor White

Write-Host "`n🔍 Testing Configuration:" -ForegroundColor Yellow
Write-Host "After updating your .env file, run:" -ForegroundColor White
Write-Host "  npm run dev" -ForegroundColor Gray
Write-Host "Then test the authentication by:" -ForegroundColor White
Write-Host "  - Clicking the user icon in the navigation" -ForegroundColor Gray
Write-Host "  - Trying to sign up with a test email" -ForegroundColor Gray
Write-Host "  - Checking the browser console for any errors" -ForegroundColor Gray

Write-Host "`n🆘 Need Help?" -ForegroundColor Yellow
Write-Host "If you're having issues:" -ForegroundColor White
Write-Host "1. Check the browser console for error messages" -ForegroundColor Gray
Write-Host "2. Verify your Supabase project is active" -ForegroundColor Gray
Write-Host "3. Make sure your .env file is in the project root" -ForegroundColor Gray
Write-Host "4. Restart your development server after changes" -ForegroundColor Gray

Write-Host "`n✅ Setup complete! Happy coding! 🚀" -ForegroundColor Green
