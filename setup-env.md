# 🔑 Environment Variables Setup

## 🚨 **CRITICAL: Missing Environment Variables**

Your database test is failing because the Supabase environment variables are not configured.

## 📋 **Step 1: Get Your Supabase Credentials**

1. **Go to your Supabase Dashboard**: https://supabase.com/dashboard/project/okjxnqdppxwcfgtdggna
2. **Click "Settings"** in the left sidebar
3. **Click "API"** 
4. **Copy your credentials**:
   - **Project URL**: `https://okjxnqdppxwcfgtdggna.supabase.co`
   - **Anon Key**: Copy the `anon` `public` key (long string starting with `eyJ...`)

## 📝 **Step 2: Create .env File**

Create a file named `.env` in your project root (`vlanco-streetwear-verse-main/.env`) with this content:

```env
VITE_SUPABASE_URL=https://okjxnqdppxwcfgtdggna.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ACTUAL_ANON_KEY_HERE
```

**Replace `YOUR_ACTUAL_ANON_KEY_HERE` with the actual anon key from step 1.**

## 🔄 **Step 3: Restart Your Development Server**

After creating the `.env` file:

1. **Stop your development server** (Ctrl+C in terminal)
2. **Restart it**: `npm run dev`
3. **Test the database connection** again

## ✅ **Step 4: Verify Setup**

1. **Go to**: `http://localhost:8080/database-test`
2. **Click "Basic Connection"**
3. **Check console logs** for environment variable status
4. **Should show**: "Environment check: url: Set, key: Set"

## 🚨 **Common Issues**

- **File location**: Make sure `.env` is in the root directory (same level as `package.json`)
- **No quotes**: Don't put quotes around the values in `.env`
- **Restart required**: Always restart dev server after changing `.env`
- **Correct key**: Use the `anon` key, not the `service_role` key

## 📁 **File Structure Should Look Like:**

```
vlanco-streetwear-verse-main/
├── .env                    ← CREATE THIS FILE
├── package.json
├── src/
└── supabase/
```
