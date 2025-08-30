# 🔧 Install Supabase CLI on Windows

## ❌ **Problem**
The error you encountered:
```
npm error Installing Supabase CLI as a global module is not supported.
```

This happens because Supabase CLI no longer supports npm global installation.

## ✅ **Solution: Manual Installation**

### **Step 1: Download Supabase CLI**

1. Go to: https://github.com/supabase/cli/releases
2. Download the latest Windows release: `supabase_windows_amd64.exe`
3. Rename it to `supabase.exe`

### **Step 2: Install Supabase CLI**

**Option A: Install to System PATH (Recommended)**
1. Create folder: `C:\Program Files\Supabase`
2. Copy `supabase.exe` to this folder
3. Add `C:\Program Files\Supabase` to your system PATH

**Option B: Install to Project (Quick Fix)**
1. Create folder: `supabase-cli` in your project root
2. Copy `supabase.exe` to this folder
3. Use `.\supabase-cli\supabase.exe` instead of `supabase`

### **Step 3: Verify Installation**

```bash
# If installed to PATH
supabase --version

# If installed locally
.\supabase-cli\supabase.exe --version
```

## 🚀 **Alternative: Use Supabase Dashboard**

Since CLI installation can be tricky, you can also:

### **Option 1: Use Supabase Dashboard (Easiest)**
1. Go to: https://supabase.com/dashboard/project/okjxnqdppxwcfgtdggna/sql
2. Copy and paste each migration file manually
3. Run them in order

### **Option 2: Use Supabase CLI via Docker**
```bash
# Install Docker Desktop first
docker run --rm -it supabase/cli:latest supabase --version
```

## 📋 **Migration Files to Run Manually**

If you choose the dashboard approach, run these in order:

1. `20250716134410-a40a32b4-d376-4c2b-8d03-bb6cf7ee399c.sql`
2. `20250823140000-fix-rls-security.sql`
3. `20250823150000-complete-security-and-analytics.sql`
4. `20250824150000-core-tables-setup.sql`
5. `20250101000000-create-wishlist-table.sql`

## 🔧 **Quick Setup Without CLI**

### **Step 1: Create Environment File**
Create `.env` file:
```env
VITE_SUPABASE_URL=https://okjxnqdppxwcfgtdggna.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### **Step 2: Get Your Keys**
1. Go to: https://supabase.com/dashboard/project/okjxnqdppxwcfgtdggna/settings/api
2. Copy the **anon key**
3. Update your `.env` file

### **Step 3: Run Migrations**
1. Go to: https://supabase.com/dashboard/project/okjxnqdppxwcfgtdggna/sql
2. Copy each migration file content
3. Paste and run in SQL editor

### **Step 4: Test Connection**
```bash
npm run dev
```

## 🎯 **Recommended Approach**

For now, I recommend using the **Supabase Dashboard** approach since it's:
- ✅ No installation required
- ✅ Works immediately
- ✅ Visual feedback
- ✅ Error handling

You can always install the CLI later when needed for advanced features.
