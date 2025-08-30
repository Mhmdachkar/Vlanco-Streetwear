# 🚀 VLANCO Streetwear Backend Setup Script (PowerShell)
# This script will help you set up your Supabase backend quickly on Windows

Write-Host "🚀 Starting VLANCO Streetwear Backend Setup..." -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green

# Check if Supabase CLI is installed
try {
    $null = Get-Command supabase -ErrorAction Stop
    Write-Host "✅ Supabase CLI found" -ForegroundColor Green
} catch {
    Write-Host "❌ Supabase CLI not found." -ForegroundColor Yellow
    Write-Host "📋 Please install Supabase CLI manually:" -ForegroundColor Cyan
    Write-Host "   1. Download from: https://github.com/supabase/cli/releases" -ForegroundColor White
    Write-Host "   2. Or use Supabase Dashboard: https://supabase.com/dashboard/project/okjxnqdppxwcfgtdggna/sql" -ForegroundColor White
    Write-Host "   3. Check INSTALL_SUPABASE_CLI.md for detailed instructions" -ForegroundColor White
    Write-Host ""
    Write-Host "🚀 Continuing with manual setup..." -ForegroundColor Green
}

# Check if user is logged in
try {
    $null = supabase status 2>$null
    Write-Host "✅ Already logged in to Supabase" -ForegroundColor Green
} catch {
    Write-Host "🔐 Please login to Supabase..." -ForegroundColor Yellow
    supabase login
}

# Link to project
Write-Host "🔗 Linking to project..." -ForegroundColor Cyan
supabase link --project-ref okjxnqdppxwcfgtdggna

# Deploy database migrations
Write-Host "🗃️ Deploying database migrations..." -ForegroundColor Cyan
supabase db push

# Deploy edge functions
Write-Host "⚡ Deploying edge functions..." -ForegroundColor Cyan
supabase functions deploy

Write-Host "✅ Backend setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Yellow
Write-Host "1. Set up environment variables in .env file" -ForegroundColor White
Write-Host "2. Configure Supabase secrets for edge functions" -ForegroundColor White
Write-Host "3. Test your setup with 'npm run dev'" -ForegroundColor White
Write-Host "4. Check the SETUP_COMPLETE_GUIDE.md for detailed instructions" -ForegroundColor White
Write-Host ""
Write-Host "🔗 Your Supabase Dashboard: https://supabase.com/dashboard/project/okjxnqdppxwcfgtdggna" -ForegroundColor Cyan
