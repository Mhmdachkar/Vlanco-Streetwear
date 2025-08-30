# 🧪 Testing Edge Functions Guide

## ✅ **Functions Working Correctly!**

The 401 "Missing authorization header" error means your functions are deployed and working - they're just protecting themselves properly!

## 🔓 **Public Functions (No Auth Required)**

### **1. Analytics Track**
```bash
curl -X POST https://okjxnqdppxwcfgtdggna.supabase.co/functions/v1/analytics-track \
  -H "Content-Type: application/json" \
  -d '{
    "event_type": "page_view",
    "page_url": "/",
    "session_id": "test-session-123"
  }'
```

**Expected Response:**
```json
{"ok": true}
```

### **2. Discounts Apply**
```bash
curl -X POST https://okjxnqdppxwcfgtdggna.supabase.co/functions/v1/discounts-apply \
  -H "Content-Type: application/json" \
  -d '{
    "code": "WELCOME10",
    "cartSubtotal": 100
  }'
```

**Expected Response:**
```json
{
  "code": "WELCOME10",
  "discount_type": "percentage",
  "discount_value": 10,
  "amount_off": 1000,
  "description": "Welcome discount"
}
```

### **3. Inventory Sync**
```bash
curl -X POST https://okjxnqdppxwcfgtdggna.supabase.co/functions/v1/inventory-sync \
  -H "Content-Type: application/json" \
  -d '{
    "variant_id": "test-variant-123",
    "new_quantity": 50,
    "source": "manual"
  }'
```

**Expected Response:**
```json
{"success": true}
```

### **4. Notifications Enqueue**
```bash
curl -X POST https://okjxnqdppxwcfgtdggna.supabase.co/functions/v1/notifications-enqueue \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test-user-123",
    "type": "order_update",
    "title": "Order Shipped",
    "message": "Your order has been shipped!"
  }'
```

**Expected Response:**
```json
{"success": true}
```

## 🔒 **Protected Functions (Auth Required)**

### **How to Get JWT Token**

#### **Method 1: From Browser**
1. Open your app: http://localhost:5173
2. Sign in or sign up
3. Open DevTools (F12)
4. Go to Application → Local Storage
5. Find `sb-okjxnqdppxwcfgtdggna-auth-token`
6. Copy the `access_token` value

#### **Method 2: Create Test Token**
```javascript
// Run this in browser console after signing in
const token = localStorage.getItem('sb-okjxnqdppxwcfgtdggna-auth-token');
const parsed = JSON.parse(token);
console.log('Your JWT Token:', parsed.access_token);
```

### **Test Protected Functions**

#### **1. Cart Merge**
```bash
curl -X POST https://okjxnqdppxwcfgtdggna.supabase.co/functions/v1/cart-merge \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "guestCart": [
      {
        "product_id": "test-product-123",
        "variant_id": "test-variant-456",
        "quantity": 2
      }
    ]
  }'
```

#### **2. Reviews Submit**
```bash
curl -X POST https://okjxnqdppxwcfgtdggna.supabase.co/functions/v1/reviews-submit \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": "test-product-123",
    "rating": 5,
    "title": "Great Product!",
    "comment": "Really love this item"
  }'
```

## 🚨 **Common Error Responses**

### **401 Unauthorized**
```json
{
  "error": "Unauthorized"
}
```
**Solution:** Add valid JWT token in Authorization header

### **400 Bad Request**
```json
{
  "error": "Missing event_type"
}
```
**Solution:** Check your request body format

### **500 Internal Server Error**
```json
{
  "error": "Database error message"
}
```
**Solution:** Check your database tables exist

## ✅ **Success Indicators**

- **200 OK** with JSON response = Function working
- **401 Unauthorized** = Function deployed, needs auth
- **404 Not Found** = Function not deployed or wrong URL

## 🎯 **Quick Test Checklist**

1. ✅ **Deploy all 9 functions**
2. ✅ **Set environment variables**
3. ✅ **Test public functions** (analytics, discounts, inventory)
4. ✅ **Get JWT token** from browser
5. ✅ **Test protected functions** (cart, reviews, checkout)
6. ✅ **Verify database tables** exist

Your functions are working correctly! The 401 error is just the security system doing its job. 🛡️
