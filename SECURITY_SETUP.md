# 🔒 Security Setup Guide for VLANCO Streetwear Database

## 🚨 CRITICAL: Database Security Issues Identified

Your Supabase database currently has **Row Level Security (RLS) disabled**, making all data publicly accessible. This is a severe security vulnerability that must be fixed immediately.

## 📋 What This Migration Fixes

### **Before (Unsafe):**
- ❌ All tables show as "Unrestricted"
- ❌ Data is publicly accessible via API
- ❌ No user isolation
- ❌ Anyone can read/write to your database

### **After (Secure):**
- ✅ RLS enabled on all sensitive tables
- ✅ User data properly isolated
- ✅ Public access only to product catalog
- ✅ Secure cart and user operations

## 🚀 How to Apply the Security Fix

### **Step 1: Run the Migration**

1. **Navigate to your Supabase dashboard:**
   ```
   https://supabase.com/dashboard/project/okjxnqdppxwcfgtdggna
   ```

2. **Go to SQL Editor:**
   - Click "SQL Editor" in the left sidebar
   - Click "New query"

3. **Copy and paste the migration:**
   ```sql
   -- Copy the entire content from:
   -- supabase/migrations/20250823140000-fix-rls-security.sql
   ```

4. **Execute the migration:**
   - Click "Run" button
   - Wait for completion (should take 1-2 minutes)

### **Step 2: Verify Security is Enabled**

1. **Check Table Editor:**
   - Go to "Table Editor" in left sidebar
   - All tables should now show "RLS enabled" instead of "Unrestricted"

2. **Test Security:**
   - Try to access cart data without authentication
   - Should receive "permission denied" errors

## 🛡️ Security Features Implemented

### **Row Level Security (RLS) Policies:**

#### **Public Tables (Read-only for everyone):**
- `products` - Product catalog
- `product_variants` - Product variations
- `categories` - Product categories
- `brands` - Brand information
- `collections` - Product collections
- `reviews` - Product reviews

#### **User-Isolated Tables (Users can only access their own data):**
- `users` - User profiles
- `cart_items` - Shopping cart
- `wishlists` - User wishlists
- `orders` - Order history
- `addresses` - User addresses
- `notifications` - User notifications
- `support_tickets` - Support requests

### **Automatic Security Features:**
- ✅ **User ID Auto-assignment** - Prevents users from accessing others' data
- ✅ **Input Validation** - Sanitizes all user inputs
- ✅ **Rate Limiting** - Prevents abuse of cart operations
- ✅ **Permission Checks** - Validates user permissions before operations
- ✅ **Data Sanitization** - Removes potentially dangerous content

## 🔐 Authentication Requirements

### **For Cart Operations:**
- Users must be authenticated to add/remove items
- Guest users can browse products but cannot cart
- Each user's cart is completely isolated

### **For User Data:**
- Users can only access their own profile
- Users can only see their own orders
- Users can only manage their own addresses

## 🧪 Testing the Security

### **Test 1: Unauthenticated Access**
```bash
# Try to access cart without login
curl "https://okjxnqdppxwcfgtdggna.supabase.co/rest/v1/cart_items"
# Should return: {"error":"JWT required"}
```

### **Test 2: Cross-User Access**
```bash
# Try to access another user's cart
# Should return: {"error":"permission denied"}
```

### **Test 3: Public Product Access**
```bash
# Access products (should work)
curl "https://okjxnqdppxwcfgtdggna.supabase.co/rest/v1/products"
# Should return product data
```

## 🚨 Security Best Practices

### **Environment Variables:**
- ✅ Keep your `.env` file secure
- ✅ Never commit API keys to version control
- ✅ Use different keys for development/production

### **API Usage:**
- ✅ Always use authenticated requests for user data
- ✅ Validate all inputs on both client and server
- ✅ Implement proper error handling
- ✅ Log security events

### **Monitoring:**
- ✅ Check Supabase logs regularly
- ✅ Monitor for unusual access patterns
- ✅ Set up alerts for security events

## 🔧 Troubleshooting

### **If Migration Fails:**
1. Check Supabase logs for errors
2. Ensure you have admin privileges
3. Try running sections of the migration separately

### **If Tables Still Show "Unrestricted":**
1. Refresh the dashboard
2. Check if RLS is actually enabled
3. Verify policies were created

### **If Cart Operations Fail:**
1. Check user authentication
2. Verify RLS policies are working
3. Check browser console for errors

## 📞 Support

If you encounter issues:
1. Check Supabase documentation
2. Review the migration logs
3. Contact Supabase support if needed

## ✅ Verification Checklist

After running the migration, verify:

- [ ] All tables show "RLS enabled" in Table Editor
- [ ] Cart operations require authentication
- [ ] Users can only access their own data
- [ ] Public product browsing works
- [ ] No "Unrestricted" warnings in dashboard
- [ ] Security policies are listed in Authentication > Policies

## 🎯 Next Steps

1. **Run the migration immediately**
2. **Test all cart functionality**
3. **Verify security is working**
4. **Monitor for any issues**
5. **Update your application code if needed**

---

**⚠️ IMPORTANT: Do not delay applying this security fix. Your data is currently exposed to the public internet.**
