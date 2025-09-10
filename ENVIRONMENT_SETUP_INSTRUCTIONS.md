# 🔧 **CRITICAL: Environment Setup Instructions**

## 🚨 **Current Status**
Your Supabase **IS CONNECTED** (database shows 11/11 tables), but the app thinks it's not configured because of placeholder values in your `.env` file.

## 📍 **Step 1: Locate Your .env File**
Your `.env` file should be at:
```
vlanco-streetwear-verse-main/.env
```

## 📝 **Step 2: Update Your .env File**
Replace ALL placeholder values with your actual Supabase credentials:

### **BEFORE (Current - with placeholders):**
```env
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_actual_anon_key_here
```

### **AFTER (What you need):**
```env
# Supabase Configuration (REQUIRED)
VITE_SUPABASE_URL=https://your-actual-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your_actual_long_key_here

# Service Role (for edge functions)
SERVICE_ROLE_SECRET=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your_service_role_key_here

# Stripe Configuration (OPTIONAL)
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret_here

# App Configuration (OPTIONAL)
VITE_APP_NAME=Vlanco Streetwear
VITE_APP_VERSION=1.0.0
VITE_ENABLE_3D_VIEWER=true
VITE_ENABLE_RECOMMENDATIONS=true
```

## 🔑 **Step 3: Get Your Actual Supabase Keys**

1. **Go to your Supabase Dashboard:** https://supabase.com/dashboard
2. **Select your project**
3. **Go to Settings → API**
4. **Copy these values:**
   - **Project URL**: Should look like `https://abcdefghijk.supabase.co`
   - **Anon/Public Key**: Long string starting with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.`
   - **Service Role Key**: Another long string starting with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.`

## ⚠️ **Critical Requirements:**
- **VITE_SUPABASE_URL** must start with `https://` and end with `.supabase.co`
- **VITE_SUPABASE_ANON_KEY** must start with `eyJ`
- **NO placeholder values** like "your_supabase_url_here"
- **NO quotes** around the values in the .env file

## 🔄 **Step 4: Restart Development Server**
After updating your `.env` file:
```bash
# Stop current server (Ctrl+C)
# Then restart:
npm run dev
```

## ✅ **Step 5: Verify Setup**
After restarting, check the **Environment Debug panel** (top-right corner) should show:
- URL Valid: ✅
- Key Valid: ✅  
- URL Not Placeholder: ✅
- Key Not Placeholder: ✅

## 🎯 **Expected Results:**
- ✅ No more "Supabase not configured" warnings
- ✅ Clean console with minimal debug messages
- ✅ Analytics tracking working properly
- ✅ Database operations functioning

## 🚨 **Common Mistakes:**
1. **Wrong file location** - Make sure `.env` is in `vlanco-streetwear-verse-main/.env`
2. **Quotes in .env** - Don't use quotes: ❌ `VITE_SUPABASE_URL="https://..."` ✅ `VITE_SUPABASE_URL=https://...`
3. **Placeholder values** - Replace ALL "your_*_here" values with real ones
4. **Forgot to restart** - Always restart dev server after changing .env
5. **Wrong keys** - Make sure you're using the anon key, not service role for VITE_SUPABASE_ANON_KEY

## 🔍 **Debug Information:**
The **Environment Debug panel** (temporarily added) will show you exactly what the app sees. All values should show ✅ green checkmarks.

Once everything is working, I'll remove the debug panel for you.

## 📞 **Still Having Issues?**
If you're still seeing "Supabase not configured" after following these steps:
1. Check the Environment Debug panel values
2. Verify your .env file location
3. Make sure you restarted the dev server
4. Double-check there are no typos in your environment variable names
