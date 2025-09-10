# 🗄️ **Database Analysis & Cleanup Plan**

## 📊 **Current Database Status Analysis**

### **✅ Tables Currently Implemented & Used:**

#### **Core E-commerce Tables:**
1. **`users`** - ✅ **TRACKED** - User profiles with auth integration
2. **`products`** - ✅ **TRACKED** - Product catalog (heavily used in TShirtCollection, MaskCollection)
3. **`product_variants`** - ✅ **TRACKED** - Product variations (color, size, price)
4. **`product_images`** - ✅ **TRACKED** - Product image galleries
5. **`cart_items`** - ✅ **TRACKED** - Shopping cart (actively used in useCart hook)
6. **`wishlist_items`** - ✅ **TRACKED** - User wishlists (used in useWishlist hook)
7. **`orders`** - ✅ **TRACKED** - Order management (used in useOrders hook)
8. **`order_items`** - ✅ **TRACKED** - Order details
9. **`reviews`** - ✅ **TRACKED** - Product reviews (used in useReviews hook)
10. **`review_votes`** - ✅ **TRACKED** - Review helpfulness votes
11. **`addresses`** - ✅ **TRACKED** - User shipping/billing addresses

#### **Analytics & Tracking Tables:**
12. **`analytics_events`** - ✅ **TRACKED** - Event tracking (heavily used in analyticsService)
13. **`user_sessions`** - ✅ **TRACKED** - Real-time user sessions (used in AnalyticsTracker)
14. **`recently_viewed`** - ✅ **TRACKED** - Recently viewed products (used in analyticsService)
15. **`search_history`** - ✅ **TRACKED** - User search history (used in analyticsService)
16. **`notifications`** - ✅ **TRACKED** - User notifications (used in useNotifications hook)

#### **Supporting Tables:**
17. **`categories`** - ✅ **TRACKED** - Product categories (referenced in products)
18. **`brands`** - ✅ **TRACKED** - Product brands (referenced in products)

### **❌ Missing But Potentially Impactful Tables:**

#### **High Priority (Should Add):**
1. **`inventory_transactions`** - Track stock movements, purchases, returns
2. **`stock_reservations`** - Hold inventory during checkout process
3. **`discount_codes`** - Coupon/promo code system
4. **`user_preferences`** - Personalization settings, size profiles
5. **`product_collections`** - Featured collections, seasonal items
6. **`shipping_rates`** - Dynamic shipping calculation
7. **`tax_rates`** - Tax calculation by location

#### **Medium Priority (Nice to Have):**
8. **`returns`** & **`return_items`** - Return/refund management
9. **`support_tickets`** & **`support_messages`** - Customer support system
10. **`user_activities`** - Detailed activity logging
11. **`push_tokens`** - Mobile push notifications
12. **`email_templates`** - Dynamic email system
13. **`product_recommendations`** - AI-driven recommendations

#### **Low Priority (Future Enhancement):**
14. **`loyalty_programs`** - Points, tiers, rewards
15. **`affiliate_links`** - Influencer tracking
16. **`ab_tests`** - A/B testing framework
17. **`page_views`** - Detailed page analytics
18. **`product_interactions`** - Micro-interactions tracking

---

## 🧹 **Files to Delete (Cleanup)**

### **Duplicate Migration Files:**
```bash
# Keep ONLY this one:
✅ supabase/migrations/20250125000000-complete-database-setup.sql

# DELETE these duplicates:
❌ supabase/migrations/20250716134410-a40a32b4-d376-4c2b-8d03-bb6cf7ee399c.sql
❌ supabase/migrations/20250824150000-core-tables-setup.sql
❌ supabase/migrations/20250823140000-fix-rls-security.sql
❌ supabase/migrations/20250823150000-complete-security-and-analytics.sql
❌ supabase/migrations/20250101000000-create-wishlist-table.sql
❌ supabase/migrations/20241201000000-initial-schema.sql
❌ supabase/migrations/20241201120000-add-missing-tables.sql
```

### **Outdated Documentation Files:**
```bash
❌ apply-migration.md
❌ DATABASE_SETUP_GUIDE.md
❌ INSTALL_SUPABASE_CLI.md
❌ SETUP_COMPLETE_GUIDE.md
❌ SECURITY_SETUP.md
❌ FINAL_SETUP_GUIDE.md
❌ SUPABASE_SETUP_GUIDE.md
❌ SUPABASE_INTEGRATION_REVIEW.md
❌ DEPLOYMENT.md
❌ EDGE_FUNCTIONS_DEPLOYMENT.md
```

### **Redundant Setup Scripts:**
```bash
❌ setup-backend.sh
❌ setup-backend.ps1
❌ verify-setup.ps1
❌ check-env.ps1
❌ create-env.ps1
❌ setup-stripe-secrets.ps1
❌ deploy-functions.sh
❌ deploy-functions.ps1
```

### **Test/Debug Files (Outside Root):**
```bash
❌ check-database-structure.js
❌ test-database-integration.js
❌ test-database-connection.js
❌ test-supabase-connection.js
❌ validate-env.js
```

### **Temporary SQL Files:**
```bash
❌ add-products-example.sql
❌ populate-database.sql
```

### **Outdated Markdown Files:**
```bash
❌ ANALYTICS_IMPLEMENTATION_SUMMARY.md
❌ CART_ANIMATION_IMPLEMENTATION.md
❌ CART_COMPLETE_INTEGRATION_FIXED.md
❌ CART_FIXES_IMPLEMENTED.md
❌ CART_FUNCTIONALITY_COMPLETE.md
❌ CART_SUPABASE_CONNECTION_FIXED.md
❌ CONSOLE_ERRORS_FIXED.md
❌ DATABASE_INTEGRATION_COMPLETE.md
❌ DEBUG_TOOLS_FIXED.md
❌ ENHANCED_SPLASH_SCREEN.md
❌ ENVIRONMENT_SETUP_COMPLETE.md
❌ ENVIRONMENT_SETUP_INSTRUCTIONS.md
❌ FIXES_IMPLEMENTED.md
❌ HANGING_QUERIES_FIXED.md
❌ HERO_SECTION_IMPROVEMENTS.md
❌ PROFESSIONAL_TEXT_ANIMATIONS.md
❌ SECURITY_IMPROVEMENTS_SUMMARY.md
❌ SPLASH_SCREEN_IMPLEMENTATION.md
❌ SUPABASE_CONNECTION_SUCCESS.md
❌ TSHIRT_COLLECTION_ENHANCEMENTS.md
```

---

## 🎯 **Recommended High-Impact Tables to Add**

### **1. Inventory Management System**
```sql
-- Track stock movements
CREATE TABLE IF NOT EXISTS public.inventory_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id),
    variant_id UUID REFERENCES public.product_variants(id),
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('purchase', 'sale', 'adjustment', 'return')),
    quantity_change INTEGER NOT NULL,
    previous_stock INTEGER NOT NULL,
    new_stock INTEGER NOT NULL,
    reason TEXT,
    reference_id UUID, -- order_id, return_id, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Hold inventory during checkout
CREATE TABLE IF NOT EXISTS public.stock_reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id),
    product_id UUID NOT NULL REFERENCES public.products(id),
    variant_id UUID REFERENCES public.product_variants(id),
    quantity INTEGER NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### **2. Discount System**
```sql
CREATE TABLE IF NOT EXISTS public.discount_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    description TEXT,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount', 'free_shipping')),
    discount_value DECIMAL(10,2) NOT NULL,
    minimum_order_amount DECIMAL(10,2),
    maximum_discount_amount DECIMAL(10,2),
    usage_limit INTEGER,
    usage_count INTEGER DEFAULT 0,
    valid_from TIMESTAMP WITH TIME ZONE,
    valid_until TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### **3. User Preferences & Personalization**
```sql
CREATE TABLE IF NOT EXISTS public.user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id),
    preferred_sizes JSONB, -- {"tshirt": "L", "mask": "M"}
    preferred_colors TEXT[],
    preferred_brands UUID[],
    style_preferences TEXT[], -- ["streetwear", "minimalist"]
    notification_preferences JSONB,
    privacy_settings JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### **4. Product Collections**
```sql
CREATE TABLE IF NOT EXISTS public.product_collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    image_url TEXT,
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.collection_products (
    collection_id UUID REFERENCES public.product_collections(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    sort_order INTEGER DEFAULT 0,
    PRIMARY KEY (collection_id, product_id)
);
```

---

## 🔧 **Action Plan**

### **Phase 1: Cleanup (Priority 1)**
1. ✅ Delete duplicate migration files
2. ✅ Delete outdated documentation
3. ✅ Delete redundant setup scripts
4. ✅ Clean up test files outside src/

### **Phase 2: Add High-Impact Tables (Priority 2)**
1. ✅ Add inventory management tables
2. ✅ Add discount system
3. ✅ Add user preferences
4. ✅ Add product collections

### **Phase 3: Verify Implementation (Priority 3)**
1. ✅ Ensure all existing tables have proper RLS policies
2. ✅ Verify all tables are accessible by action user
3. ✅ Test all table operations in the frontend
4. ✅ Update TypeScript types if needed

---

## 🎯 **Expected Benefits**

### **After Cleanup:**
- ✅ Cleaner project structure
- ✅ No confusion from duplicate files
- ✅ Easier maintenance
- ✅ Faster development

### **After Adding High-Impact Tables:**
- 🚀 **Inventory Management**: Real-time stock tracking, prevent overselling
- 🚀 **Discount System**: Marketing campaigns, customer retention
- 🚀 **User Preferences**: Personalized shopping experience
- 🚀 **Product Collections**: Better product organization, seasonal campaigns

---

**Status**: ✅ **ANALYSIS COMPLETE - READY FOR IMPLEMENTATION**
