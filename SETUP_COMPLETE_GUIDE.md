# 🚀 Complete Backend Setup Guide for VLANCO Streetwear

## 📋 **Overview of Your Current Setup**

Your project already has:
- ✅ **Database Schema**: Complete with 15+ tables
- ✅ **Security Policies**: Row Level Security (RLS) enabled
- ✅ **Edge Functions**: 8 functions ready for deployment
- ✅ **Migrations**: 5 migration files for database setup

## 🗄️ **STEP 1: Supabase Project Setup**

### **1.1 Access Your Supabase Project**
```
https://supabase.com/dashboard/project/okjxnqdppxwcfgtdggna
```

### **1.2 Get Your Project Credentials**
Go to **Settings > API** and copy:
- **Project URL**: `https://okjxnqdppxwcfgtdggna.supabase.co`
- **Anon Key**: Your public anon key
- **Service Role Key**: Your service role key (keep secret!)

### **1.3 Create Environment File**
Create `.env` file in your project root:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://okjxnqdppxwcfgtdggna.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# App Configuration
VITE_APP_NAME=Vlanco Streetwear
VITE_APP_VERSION=1.0.0

# Stripe Configuration (for payments)
STRIPE_SECRET_KEY=your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here
STRIPE_CURRENCY=usd
STRIPE_SUCCESS_PATH=/checkout/success
STRIPE_CANCEL_PATH=/checkout/cancel

# Site Configuration
SITE_URL=http://localhost:5173

# Optional: Analytics
VITE_GA_TRACKING_ID=your_google_analytics_id_here

# Optional: Feature Flags
VITE_ENABLE_3D_VIEWER=true
VITE_ENABLE_RECOMMENDATIONS=true
```

## 🗃️ **STEP 2: Database Migration Setup**

### **2.1 Install Supabase CLI**
```bash
npm install -g supabase
```

### **2.2 Login to Supabase**
```bash
supabase login
```

### **2.3 Link Your Project**
```bash
supabase link --project-ref okjxnqdppxwcfgtdggna
```

### **2.4 Apply All Migrations**
```bash
supabase db push
```

**OR** manually run migrations in Supabase SQL Editor:

1. Go to: `https://supabase.com/dashboard/project/okjxnqdppxwcfgtdggna/sql`
2. Run each migration file in order:
   - `20250716134410-a40a32b4-d376-4c2b-8d03-bb6cf7ee399c.sql`
   - `20250823140000-fix-rls-security.sql`
   - `20250823150000-complete-security-and-analytics.sql`
   - `20250824150000-core-tables-setup.sql`
   - `20250101000000-create-wishlist-table.sql`

## 🔐 **STEP 3: Verify Database Setup**

### **3.1 Check Tables in Supabase Dashboard**
Go to: `https://supabase.com/dashboard/project/okjxnqdppxwcfgtdggna/editor`

You should see these tables:

#### **Core Tables:**
- ✅ `users` - User profiles
- ✅ `products` - Product catalog
- ✅ `product_variants` - Product variations
- ✅ `product_images` - Product images
- ✅ `cart_items` - Shopping cart
- ✅ `wishlists` - User wishlists
- ✅ `orders` - Order history
- ✅ `order_items` - Order details
- ✅ `reviews` - Product reviews
- ✅ `addresses` - User addresses

#### **Analytics Tables:**
- ✅ `website_analytics` - Website tracking
- ✅ `user_sessions` - Real-time sessions
- ✅ `page_views` - Page view tracking
- ✅ `product_interactions` - User interactions
- ✅ `stock_reservations` - Stock management

#### **Support Tables:**
- ✅ `notifications` - User notifications
- ✅ `support_tickets` - Support requests
- ✅ `support_messages` - Support conversations
- ✅ `user_activities` - User activity log
- ✅ `search_history` - Search tracking
- ✅ `recently_viewed` - Recently viewed items

### **3.2 Verify RLS Policies**
Go to: `https://supabase.com/dashboard/project/okjxnqdppxwcfgtdggna/auth/policies`

All tables should show:
- 🔒 **RLS enabled**
- 🔒 **Policies active**

## ⚡ **STEP 4: Edge Functions Deployment**

### **4.1 Your Current Edge Functions**
Your project has 8 edge functions ready:

1. **`analytics-track`** - Track user analytics
2. **`cart-merge`** - Merge guest cart with user cart
3. **`checkout-create-session`** - Create Stripe checkout sessions
4. **`discounts-apply`** - Apply discount codes
5. **`inventory-hold`** - Hold inventory during checkout
6. **`inventory-sync`** - Sync inventory with external systems
7. **`notifications-enqueue`** - Queue notifications
8. **`reviews-submit`** - Submit product reviews
9. **`stripe-webhook`** - Handle Stripe webhooks

### **4.2 Deploy All Edge Functions**
```bash
# Deploy all functions
supabase functions deploy

# Or deploy individual functions
supabase functions deploy analytics-track
supabase functions deploy cart-merge
supabase functions deploy checkout-create-session
supabase functions deploy discounts-apply
supabase functions deploy inventory-hold
supabase functions deploy inventory-sync
supabase functions deploy notifications-enqueue
supabase functions deploy reviews-submit
supabase functions deploy stripe-webhook
```

### **4.3 Set Environment Variables for Edge Functions**
```bash
# Set Supabase URL and keys
supabase secrets set SUPABASE_URL=https://okjxnqdppxwcfgtdggna.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Set Stripe keys
supabase secrets set STRIPE_SECRET_KEY=your_stripe_secret_key_here
supabase secrets set STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here
supabase secrets set STRIPE_CURRENCY=usd

# Set site configuration
supabase secrets set SITE_URL=http://localhost:5173
```

## 🔧 **STEP 5: Configure Authentication**

### **5.1 Set Up Auth Providers**
Go to: `https://supabase.com/dashboard/project/okjxnqdppxwcfgtdggna/auth/providers`

Enable:
- ✅ **Email** (default)
- ✅ **Google** (optional)
- ✅ **GitHub** (optional)

### **5.2 Configure Email Templates**
Go to: `https://supabase.com/dashboard/project/okjxnqdppxwcfgtdggna/auth/templates`

Customize:
- **Confirm signup** email
- **Reset password** email
- **Magic link** email

### **5.3 Set Up Redirect URLs**
Go to: `https://supabase.com/dashboard/project/okjxnqdppxwcfgtdggna/auth/url-configuration`

Add:
- `http://localhost:5173/auth/callback`
- `http://localhost:5173/auth/reset-password`
- Your production URLs when ready

## 🛡️ **STEP 6: Security Configuration**

### **6.1 Enable Row Level Security**
All tables should already have RLS enabled. Verify in:
`https://supabase.com/dashboard/project/okjxnqdppxwcfgtdggna/editor`

### **6.2 Set Up Storage Policies**
Go to: `https://supabase.com/dashboard/project/okjxnqdppxwcfgtdggna/storage/policies`

Create policies for:
- **Product images** (public read)
- **User avatars** (user-specific)
- **Order documents** (user-specific)

### **6.3 Configure CORS**
Go to: `https://supabase.com/dashboard/project/okjxnqdppxwcfgtdggna/settings/api`

Add your domains to CORS origins:
- `http://localhost:5173`
- Your production domain

## 📊 **STEP 7: Analytics Setup**

### **7.1 Enable Real-time Analytics**
Your analytics tables are already set up. Monitor in:
`https://supabase.com/dashboard/project/okjxnqdppxwcfgtdggna/editor`

### **7.2 Set Up Dashboard**
Create custom dashboards for:
- User activity
- Sales metrics
- Product performance
- Inventory levels

## 🧪 **STEP 8: Testing Your Setup**

### **8.1 Test Database Connection**
```bash
npm run dev
```

Check if your app connects to Supabase successfully.

### **8.2 Test Edge Functions**
Test each function endpoint:

```bash
# Test analytics tracking
curl -X POST https://okjxnqdppxwcfgtdggna.supabase.co/functions/v1/analytics-track \
  -H "Content-Type: application/json" \
  -d '{"event": "page_view", "page": "/"}'

# Test cart merge
curl -X POST https://okjxnqdppxwcfgtdggna.supabase.co/functions/v1/cart-merge \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"guestCart": []}'
```

### **8.3 Test Authentication**
1. Try user registration
2. Test login/logout
3. Verify email confirmation
4. Test password reset

## 🚀 **STEP 9: Production Deployment**

### **9.1 Update Environment Variables**
For production, update your `.env`:
```env
VITE_SUPABASE_URL=https://okjxnqdppxwcfgtdggna.supabase.co
SITE_URL=https://your-production-domain.com
```

### **9.2 Update Supabase Secrets**
```bash
supabase secrets set SITE_URL=https://your-production-domain.com
```

### **9.3 Deploy Your Frontend**
Deploy to your preferred platform (Netlify, Vercel, etc.)

## 📋 **STEP 10: Monitoring & Maintenance**

### **10.1 Monitor Edge Functions**
Go to: `https://supabase.com/dashboard/project/okjxnqdppxwcfgtdggna/functions`

Check:
- Function invocations
- Error rates
- Response times

### **10.2 Monitor Database**
Go to: `https://supabase.com/dashboard/project/okjxnqdppxwcfgtdggna/editor`

Monitor:
- Table sizes
- Query performance
- Connection usage

### **10.3 Set Up Alerts**
Configure alerts for:
- High error rates
- Database performance issues
- Storage limits

## ✅ **Verification Checklist**

- [ ] Database migrations applied successfully
- [ ] All tables created with RLS enabled
- [ ] Edge functions deployed and accessible
- [ ] Environment variables configured
- [ ] Authentication working
- [ ] Storage policies configured
- [ ] CORS settings updated
- [ ] Frontend connecting to Supabase
- [ ] Edge functions responding correctly
- [ ] Analytics data being collected

## 🆘 **Troubleshooting**

### **Common Issues:**

1. **Migration Errors**: Run migrations in order, check for syntax errors
2. **RLS Issues**: Verify policies are created correctly
3. **Edge Function Errors**: Check environment variables and permissions
4. **Authentication Issues**: Verify redirect URLs and email templates
5. **CORS Errors**: Update CORS origins in Supabase settings

### **Support Resources:**
- Supabase Documentation: https://supabase.com/docs
- Supabase Discord: https://discord.supabase.com
- Project Issues: Check your project's issue tracker

---

## 🎉 **Congratulations!**

Your VLANCO Streetwear backend is now fully configured with:
- ✅ Complete database schema
- ✅ Secure authentication
- ✅ Edge functions for business logic
- ✅ Analytics tracking
- ✅ Payment processing ready
- ✅ Real-time capabilities

You're ready to build and scale your streetwear platform!
