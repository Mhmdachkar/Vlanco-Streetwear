# ⚡ Quick Edge Functions Deployment

## 🚀 **Step-by-Step Deployment**

### **Step 1: Access Supabase Dashboard**
1. Go to: https://supabase.com/dashboard/project/okjxnqdppxwcfgtdggna/functions
2. Click "Create a new function"

### **Step 2: Deploy Functions One by One**

#### **Function 1: analytics-track**
1. **Function Name:** `analytics-track`
2. **Copy the code** from `EDGE_FUNCTIONS_DEPLOYMENT.md` (Analytics Track Function section)
3. **Click "Deploy"**

#### **Function 2: cart-merge**
1. **Function Name:** `cart-merge`
2. **Copy the code** from `EDGE_FUNCTIONS_DEPLOYMENT.md` (Cart Merge Function section)
3. **Click "Deploy"**

#### **Function 3: checkout-create-session**
1. **Function Name:** `checkout-create-session`
2. **Copy the code** from `EDGE_FUNCTIONS_DEPLOYMENT.md` (Checkout Create Session Function section)
3. **Click "Deploy"**

#### **Function 4: discounts-apply**
1. **Function Name:** `discounts-apply`
2. **Copy the code** from `EDGE_FUNCTIONS_DEPLOYMENT.md` (Discounts Apply Function section)
3. **Click "Deploy"**

#### **Function 5: inventory-hold**
1. **Function Name:** `inventory-hold`
2. **Copy the code** from `EDGE_FUNCTIONS_DEPLOYMENT.md` (Inventory Hold Function section)
3. **Click "Deploy"**

#### **Function 6: inventory-sync**
1. **Function Name:** `inventory-sync`
2. **Copy the code** from `EDGE_FUNCTIONS_DEPLOYMENT.md` (Inventory Sync Function section)
3. **Click "Deploy"**

#### **Function 7: notifications-enqueue**
1. **Function Name:** `notifications-enqueue`
2. **Copy the code** from `EDGE_FUNCTIONS_DEPLOYMENT.md` (Notifications Enqueue Function section)
3. **Click "Deploy"**

#### **Function 8: reviews-submit**
1. **Function Name:** `reviews-submit`
2. **Copy the code** from `EDGE_FUNCTIONS_DEPLOYMENT.md` (Reviews Submit Function section)
3. **Click "Deploy"**

#### **Function 9: stripe-webhook**
1. **Function Name:** `stripe-webhook`
2. **Copy the code** from `EDGE_FUNCTIONS_DEPLOYMENT.md` (Stripe Webhook Function section)
3. **Click "Deploy"**

### **Step 3: Set Environment Variables**

1. Go to: https://supabase.com/dashboard/project/okjxnqdppxwcfgtdggna/settings/functions
2. Add these secrets:

```bash
SUPABASE_URL=https://okjxnqdppxwcfgtdggna.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
SITE_URL=http://localhost:5173
```

**Note:** For Stripe functions, you'll also need:
```bash
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
STRIPE_CURRENCY=usd
```

### **Step 4: Test Functions**

After deployment, test each function:

```bash
# Test analytics
curl -X POST https://okjxnqdppxwcfgtdggna.supabase.co/functions/v1/analytics-track \
  -H "Content-Type: application/json" \
  -d '{"event_type": "page_view", "page_url": "/"}'

# Test cart merge (requires auth token)
curl -X POST https://okjxnqdppxwcfgtdggna.supabase.co/functions/v1/cart-merge \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"guestCart": []}'
```

### **Step 5: Verify Deployment**

Check your functions dashboard:
- https://supabase.com/dashboard/project/okjxnqdppxwcfgtdggna/functions

You should see all 9 functions listed and active.

## ✅ **What You'll Have**

After deployment, your edge functions will handle:

- 📊 **Analytics tracking** - User behavior and page views
- 🛒 **Cart management** - Merge guest carts with user accounts
- 💳 **Payment processing** - Stripe checkout sessions
- 🏷️ **Discount codes** - Apply and validate coupons
- 📦 **Inventory management** - Hold and sync stock levels
- 🔔 **Notifications** - Queue user notifications
- ⭐ **Reviews** - Submit and validate product reviews
- 🔄 **Stripe webhooks** - Handle payment events

## 🎯 **Next Steps**

1. **Test your functions** with the curl commands above
2. **Integrate with frontend** - Call functions from your React app
3. **Set up Stripe** - Configure payment processing
4. **Monitor usage** - Check function logs in Supabase dashboard

Your backend is now complete with enterprise-level edge functions!
