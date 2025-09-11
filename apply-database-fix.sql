-- Apply the comprehensive database fix
-- Run this in your Supabase SQL Editor or via CLI

\i 'supabase/migrations/20250910000000-comprehensive-database-fix.sql'

-- Verify the migration was successful
SELECT 'Migration applied successfully!' as status;

-- Check table counts
SELECT 
    'products' as table_name, 
    COUNT(*) as count 
FROM public.products
UNION ALL
SELECT 
    'product_variants' as table_name, 
    COUNT(*) as count 
FROM public.product_variants
UNION ALL
SELECT 
    'cart_items' as table_name, 
    COUNT(*) as count 
FROM public.cart_items
UNION ALL
SELECT 
    'wishlist_items' as table_name, 
    COUNT(*) as count 
FROM public.wishlist_items;

-- Test data integrity
SELECT 
    p.id as product_id,
    p.name,
    p.stock_quantity as total_stock,
    COUNT(pv.id) as variant_count,
    SUM(pv.stock_quantity) as variant_stock_sum
FROM public.products p
LEFT JOIN public.product_variants pv ON p.id = pv.product_id AND pv.is_active = true
GROUP BY p.id, p.name, p.stock_quantity
ORDER BY p.id;
