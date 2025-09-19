# 🔧 Netlify Environment Variables Setup

## ❌ **The Problem**
You're getting this error on your live website:
```
❌ Error creating local checkout session: Error: VITE_STRIPE_PUBLISHABLE_KEY is not configured
```

## 🔍 **Root Cause**
You've added `VITE_STRIPE_PUBLISHABLE_KEY` to **Supabase edge functions secrets**, but this environment variable is needed by the **client-side code** (your React app) during the build process on Netlify.

## ✅ **Solution**
Add `VITE_STRIPE_PUBLISHABLE_KEY` to your **Netlify site's environment variables**.

## 🚀 **Method 1: Using Netlify Dashboard (Recommended)**

1. **Go to [Netlify Dashboard](https://app.netlify.com/)**
2. **Select your site**
3. **Go to Site Settings → Environment Variables**
4. **Add these environment variables:**

   | Key | Value |
   |-----|-------|
   | `VITE_STRIPE_PUBLISHABLE_KEY` | Your Stripe publishable key (starts with `pk_test_` or `pk_live_`) |
   | `VITE_SUPABASE_URL` | Your Supabase project URL |
   | `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key |

5. **Click "Save"**
6. **Trigger a new deployment** (go to Deploys → Trigger deploy)

## 🚀 **Method 2: Using PowerShell Script**

Run the provided PowerShell script:
```powershell
.\setup-netlify-env.ps1
```

## 🚀 **Method 3: Using Netlify CLI**

```bash
# Install Netlify CLI (if not already installed)
npm install -g netlify-cli

# Set environment variables
netlify env:set VITE_STRIPE_PUBLISHABLE_KEY pk_test_your_key_here
netlify env:set VITE_SUPABASE_URL your_supabase_url
netlify env:set VITE_SUPABASE_ANON_KEY your_supabase_anon_key
```

## 🔍 **How to Get Your Keys**

### **Stripe Keys:**
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Get your **Publishable Key** (starts with `pk_test_` for testing)

### **Supabase Keys:**
1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Go to Settings → API
4. Copy **Project URL** and **anon public** key

## ✅ **Verification**

After setting up the environment variables:

1. **Trigger a new deployment** on Netlify
2. **Wait for the build to complete**
3. **Test the checkout functionality**
4. **Check the browser console** - you should no longer see the error

## 🎯 **Why This Happens**

- **Supabase Edge Functions** = Server-side code (runs on Supabase servers)
- **Client-side code** = Your React app (runs in user's browser)
- **VITE_ environment variables** = Needed during build process for client-side code

The `VITE_STRIPE_PUBLISHABLE_KEY` needs to be available during the **Netlify build process** so it can be bundled into your client-side JavaScript.

## 🔧 **Troubleshooting**

### **Still getting the error?**
1. **Check the build logs** on Netlify for any environment variable issues
2. **Verify the variable names** are exactly correct (case-sensitive)
3. **Make sure you triggered a new deployment** after adding the variables
4. **Check that your Stripe key is valid** and starts with `pk_`

### **Build fails?**
- Ensure all required environment variables are set
- Check for typos in variable names
- Verify your Stripe key is valid

## 📝 **Environment Variables Summary**

| Variable | Purpose | Where to get it |
|----------|---------|-----------------|
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe client-side integration | Stripe Dashboard |
| `VITE_SUPABASE_URL` | Supabase project connection | Supabase Dashboard |
| `VITE_SUPABASE_ANON_KEY` | Supabase client authentication | Supabase Dashboard |

---

**After following these steps, your checkout should work perfectly on the live website! 🎉**
