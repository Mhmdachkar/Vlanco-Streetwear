# 🔧 Supabase Connection Setup Guide

## ❌ **Current Issue: Connection Timeout**

Your debug tools show:
- ❌ Connection failed: Connection timeout
- ❌ Network timeout - check internet connection
- ❌ All tables timing out

This indicates your **environment variables are missing or incorrect**.

## 🛠️ **Step-by-Step Fix**

### **Step 1: Create .env File**

1. **Create a file called `.env`** in your project root:
   ```
   vlanco-streetwear-verse-main/
   ├── .env          ← Create this file
   ├── package.json
   └── src/
   ```

2. **Add your Supabase credentials** to the `.env` file:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://okjxnqdppxwcfgtdggna.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here

# Optional: Service Role Key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Optional: Stripe Keys
STRIPE_SECRET_KEY=sk_test_your_stripe_key_here
```

### **Step 2: Get Your Supabase Credentials**

1. **Go to your Supabase Dashboard**: https://supabase.com/dashboard
2. **Select your project**: `okjxnqdppxwcfgtdggna`
3. **Go to Settings → API**
4. **Copy these values**:
   - **Project URL**: `https://okjxnqdppxwcfgtdggna.supabase.co`
   - **Anon/Public Key**: Long string starting with `eyJ...`
   - **Service Role Key**: Another long string starting with `eyJ...`

### **Step 3: Update Your .env File**

Replace the placeholder values in your `.env` file:

```env
# Replace with your actual values
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_actual_anon_key_here
```

### **Step 4: Restart Development Server**

1. **Stop your current dev server** (Ctrl+C)
2. **Restart it**:
   ```bash
   npm run dev
   ```

### **Step 5: Test Connection**

1. **Visit your T-Shirt collection page**
2. **Click "Check Environment"** (yellow button) first
3. **Then click "Test Supabase Connection"** (green button)

## 🔍 **Troubleshooting**

### **If Environment Check Fails:**

| Issue | Solution |
|-------|----------|
| `VITE_SUPABASE_URL missing` | Add the URL to your `.env` file |
| `Invalid format - should contain supabase.co` | Check your URL is correct |
| `VITE_SUPABASE_ANON_KEY missing` | Add the anon key to your `.env` file |
| `Too short - anon keys are usually 100+ characters` | Copy the full key from Supabase dashboard |

### **If Connection Still Fails:**

1. **Check your internet connection**
2. **Verify Supabase project is active** (not paused)
3. **Check if your IP is blocked** by any firewall
4. **Try accessing your Supabase dashboard** in browser
5. **Restart your development server** after changing `.env`

## 🎯 **Expected Results After Fix**

Once your `.env` file is correct, you should see:

**Environment Check:**
- ✅ VITE_SUPABASE_URL: Valid
- ✅ VITE_SUPABASE_ANON_KEY: Valid format
- ✅ HTTP_CONNECTIVITY: Connected

**Connection Test:**
- ✅ Query completed in ~150ms
- ✅ Connection established
- ✅/⚠️ Tables accessible (may show RLS policy blocking, which is normal)

## 📋 **Example .env File**

```env
# Your actual Supabase credentials
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_actual_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_actual_service_role_key_here
```

## 🚀 **Next Steps After Connection Works**

1. **Run database migrations** to create tables
2. **Test all debug tools** to verify functionality
3. **Deploy edge functions** if needed
4. **Test the complete user journey**

The connection timeout issue will be resolved once your `.env` file contains the correct Supabase credentials!

