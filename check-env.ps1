# Check Environment Configuration Script
Write-Host "🔧 VLANCO Streetwear - Environment Check" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

$envFile = ".env"
$envExists = Test-Path $envFile

Write-Host "`n📋 Environment File Check:" -ForegroundColor Yellow

if ($envExists) {
    Write-Host "  ✅ .env file found" -ForegroundColor Green
    
    # Read and check environment variables
    $envContent = Get-Content $envFile -ErrorAction SilentlyContinue
    
    $requiredVars = @(
        'VITE_SUPABASE_URL',
        'VITE_SUPABASE_ANON_KEY'
    )
    
    Write-Host "`n📊 Environment Variables:" -ForegroundColor Yellow
    
    foreach ($var in $requiredVars) {
        $found = $envContent | Where-Object { $_ -match "^$var=" }
        if ($found) {
            $value = ($found -split '=', 2)[1]
            if ($value -and $value.Trim() -ne '' -and $value -ne 'your_value_here') {
                Write-Host "  ✅ $var is set" -ForegroundColor Green
            } else {
                Write-Host "  ❌ $var is empty or placeholder" -ForegroundColor Red
            }
        } else {
            Write-Host "  ❌ $var is missing" -ForegroundColor Red
        }
    }
    
} else {
    Write-Host "  ❌ .env file not found" -ForegroundColor Red
    Write-Host "`n🔧 To fix this:" -ForegroundColor Yellow
    Write-Host "  1. Create a file called '.env' in this directory" -ForegroundColor White
    Write-Host "  2. Add your Supabase credentials:" -ForegroundColor White
    Write-Host "     VITE_SUPABASE_URL=https://your-project.supabase.co" -ForegroundColor Gray
    Write-Host "     VITE_SUPABASE_ANON_KEY=your_anon_key_here" -ForegroundColor Gray
    Write-Host "  3. Get these from: https://supabase.com/dashboard" -ForegroundColor White
    Write-Host "  4. Restart your dev server: npm run dev" -ForegroundColor White
}

Write-Host "`n🌐 Testing Internet Connectivity:" -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "https://supabase.com" -TimeoutSec 5 -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "  ✅ Internet connection working" -ForegroundColor Green
        Write-Host "  ✅ Can reach Supabase servers" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️ Unusual response from Supabase servers" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  ❌ Cannot reach Supabase servers" -ForegroundColor Red
    Write-Host "  💡 Check your internet connection" -ForegroundColor Yellow
}

Write-Host "`n📋 Next Steps:" -ForegroundColor Cyan
if ($envExists) {
    Write-Host "  1. Start your dev server: npm run dev" -ForegroundColor White
    Write-Host "  2. Visit the T-Shirt collection page" -ForegroundColor White
    Write-Host "  3. Click 'Check Environment' to verify configuration" -ForegroundColor White
    Write-Host "  4. Click 'Test Supabase Connection' to verify connectivity" -ForegroundColor White
} else {
    Write-Host "  1. Create .env file with your Supabase credentials" -ForegroundColor White
    Write-Host "  2. See SUPABASE_SETUP_GUIDE.md for detailed instructions" -ForegroundColor White
    Write-Host "  3. Restart dev server after creating .env file" -ForegroundColor White
}

Write-Host "`n=====================================" -ForegroundColor Cyan

