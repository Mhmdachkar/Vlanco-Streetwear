-- Add Mask Products to Database
-- This migration adds all mask collection products to the products table

-- ============================================================================
-- STEP 1: INSERT MASK PRODUCTS
-- ============================================================================

-- Insert mask products into the products table
INSERT INTO public.products (id, name, description, base_price, compare_price, status, is_featured, is_new, is_bestseller, metadata) VALUES
-- Mask 1: Winter Thermal Funny Character Balaclava
('mask-001', 'Winter Thermal Funny Character Balaclava 3D Cartoon Full Face Mask', 
 'Winter Thermal 3D Cartoon Balaclava – Funny Character Full Face Mask for Motorcycle, Ski & Cosplay. Turn heads while staying warm with this unique winter thermal balaclava, featuring funny character and anime-inspired 3D cartoon prints.',
 2.36, NULL, 'active', true, true, true, 
 '{"material": "93% Polyester + 7% Spandex", "protection": "Thermal & Wind Protection", "washable": "Machine Washable", "availability": "In Stock", "shipping": "Standard Shipping", "brand": "ZRCE", "collection": "Winter Essentials", "modelNumber": "NKR", "placeOfOrigin": "Guangdong, China", "gender": "Unisex", "ageGroup": "Adults", "headCircumference": "56-58cm, 58-60cm, 60-62cm", "printingMethods": "Sublimation Transfer Print", "technics": "Heat-Transfer Printing", "needleDetection": "Yes", "keywords": "Thermal Ski Mask", "logo": "Accept Customized Logo", "color": "Black/Gray/Navy Blue/Red/Green", "usage": "Motorcycle, Ski, Cosplay", "item": "Balaclava", "label": "Customized", "oem": "Yes", "use": "Winter Sports", "sellingUnits": "piece"}'::jsonb),

-- Mask 2: Winter Thermal Funny Character Balaclava (Different variant)
('mask-002', 'Winter Thermal Funny Character Balaclava 3D Cartoon Full Face Mask', 
 'Winter Thermal 3D Cartoon Balaclava – Funny Character Full Face Mask for Motorcycle, Ski & Cosplay. Turn heads while staying warm with this unique winter thermal balaclava, featuring funny character and anime-inspired 3D cartoon prints.',
 2.36, NULL, 'active', true, true, true, 
 '{"material": "93% Polyester + 7% Spandex", "protection": "Thermal & Wind Protection", "washable": "Machine Washable", "availability": "In Stock", "shipping": "Standard Shipping", "brand": "ZRCE", "collection": "Winter Essentials", "modelNumber": "NKR", "placeOfOrigin": "Guangdong, China", "gender": "Unisex", "ageGroup": "Adults", "headCircumference": "56-58cm, 58-60cm, 60-62cm", "printingMethods": "Sublimation Transfer Print", "technics": "Heat-Transfer Printing", "needleDetection": "Yes", "keywords": "Thermal Ski Mask", "logo": "Accept Customized Logo", "color": "Black/Gray/Navy Blue/Red/Green", "usage": "Motorcycle, Ski, Cosplay", "item": "Balaclava", "label": "Customized", "oem": "Yes", "use": "Winter Sports", "sellingUnits": "piece"}'::jsonb),

-- Mask 3: Winter Thermal Funny Character Balaclava (Another variant)
('mask-003', 'Winter Thermal Funny Character Balaclava 3D Cartoon Full Face Mask', 
 'Winter Thermal 3D Cartoon Balaclava – Funny Character Full Face Mask for Motorcycle, Ski & Cosplay. Turn heads while staying warm with this unique winter thermal balaclava, featuring funny character and anime-inspired 3D cartoon prints.',
 2.36, NULL, 'active', true, true, true, 
 '{"material": "93% Polyester + 7% Spandex", "protection": "Thermal & Wind Protection", "washable": "Machine Washable", "availability": "In Stock", "shipping": "Standard Shipping", "brand": "ZRCE", "collection": "Winter Essentials", "modelNumber": "NKR", "placeOfOrigin": "Guangdong, China", "gender": "Unisex", "ageGroup": "Adults", "headCircumference": "56-58cm, 58-60cm, 60-62cm", "printingMethods": "Sublimation Transfer Print", "technics": "Heat-Transfer Printing", "needleDetection": "Yes", "keywords": "Thermal Ski Mask", "logo": "Accept Customized Logo", "color": "Black/Gray/Navy Blue/Red/Green", "usage": "Motorcycle, Ski, Cosplay", "item": "Balaclava", "label": "Customized", "oem": "Yes", "use": "Winter Sports", "sellingUnits": "piece"}'::jsonb),

-- Mask 4: Winter Thermal Funny Character Balaclava (Fourth variant)
('mask-004', 'Winter Thermal Funny Character Balaclava 3D Cartoon Full Face Mask', 
 'Winter Thermal 3D Cartoon Balaclava – Funny Character Full Face Mask for Motorcycle, Ski & Cosplay. Turn heads while staying warm with this unique winter thermal balaclava, featuring funny character and anime-inspired 3D cartoon prints.',
 2.36, NULL, 'active', true, true, true, 
 '{"material": "93% Polyester + 7% Spandex", "protection": "Thermal & Wind Protection", "washable": "Machine Washable", "availability": "In Stock", "shipping": "Standard Shipping", "brand": "ZRCE", "collection": "Winter Essentials", "modelNumber": "NKR", "placeOfOrigin": "Guangdong, China", "gender": "Unisex", "ageGroup": "Adults", "headCircumference": "56-58cm, 58-60cm, 60-62cm", "printingMethods": "Sublimation Transfer Print", "technics": "Heat-Transfer Printing", "needleDetection": "Yes", "keywords": "Thermal Ski Mask", "logo": "Accept Customized Logo", "color": "Black/Gray/Navy Blue/Red/Green", "usage": "Motorcycle, Ski, Cosplay", "item": "Balaclava", "label": "Customized", "oem": "Yes", "use": "Winter Sports", "sellingUnits": "piece"}'::jsonb),

-- Mask 5: Handmade Distress Crochet Ski Balaclava
('mask-005', 'Handmade Distress Crochet Ski Balaclava Helmet Cover', 
 'S9151 Handmade Crochet Ski Mask – Distress Balaclava Winter Warm Helmet Cover. Unisex crochet hat that blends warmth, creativity, and edgy fashion. Perfect under helmets or as a statement winter accessory.',
 6.85, NULL, 'active', true, true, false, 
 '{"material": "100% Acrylic", "protection": "Full Face & Neck Coverage", "washable": "Hand Wash Recommended", "availability": "In Stock", "shipping": "Standard Shipping", "brand": "Sunland", "collection": "Winter Essentials", "modelNumber": "S9151", "placeOfOrigin": "Jiangsu, China", "gender": "Unisex", "ageGroup": "Adults", "moq": "100 pieces", "sampleTime": "5-7 days", "packaging": "Customized", "singlePackageSize": "20cm x 15cm x 5cm", "singleGrossWeight": "0.1kg", "applicableScenes": ["Beach", "Casual", "Outdoor", "Travel", "Sports", "Cycling", "Shopping", "Party", "Business", "Fishing", "SKI", "Home Use", "Daily", "Traveling"], "sellingUnits": "piece"}'::jsonb)

ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- STEP 2: INSERT PRODUCT VARIANTS FOR MASKS
-- ============================================================================

-- Insert product variants for mask products
INSERT INTO public.product_variants (id, product_id, color, size, price, stock_quantity, is_active, sku) VALUES
-- Mask 1 variants
('mask-001-variant-001', 'mask-001', 'Black', '56-58cm', 2.36, 50, true, 'MASK-001-BLK-56-58'),
('mask-001-variant-002', 'mask-001', 'Gray', '58-60cm', 2.36, 40, true, 'MASK-001-GRY-58-60'),
('mask-001-variant-003', 'mask-001', 'Navy Blue', '60-62cm', 2.36, 35, true, 'MASK-001-NAV-60-62'),
('mask-001-variant-004', 'mask-001', 'Red', '56-58cm', 2.36, 30, true, 'MASK-001-RED-56-58'),
('mask-001-variant-005', 'mask-001', 'Green', '58-60cm', 2.36, 25, true, 'MASK-001-GRN-58-60'),

-- Mask 2 variants
('mask-002-variant-001', 'mask-002', 'Black', '56-58cm', 2.36, 45, true, 'MASK-002-BLK-56-58'),
('mask-002-variant-002', 'mask-002', 'Gray', '58-60cm', 2.36, 38, true, 'MASK-002-GRY-58-60'),
('mask-002-variant-003', 'mask-002', 'Navy Blue', '60-62cm', 2.36, 32, true, 'MASK-002-NAV-60-62'),
('mask-002-variant-004', 'mask-002', 'Red', '56-58cm', 2.36, 28, true, 'MASK-002-RED-56-58'),
('mask-002-variant-005', 'mask-002', 'Green', '58-60cm', 2.36, 22, true, 'MASK-002-GRN-58-60'),

-- Mask 3 variants
('mask-003-variant-001', 'mask-003', 'Black', '56-58cm', 2.36, 48, true, 'MASK-003-BLK-56-58'),
('mask-003-variant-002', 'mask-003', 'Gray', '58-60cm', 2.36, 42, true, 'MASK-003-GRY-58-60'),
('mask-003-variant-003', 'mask-003', 'Navy Blue', '60-62cm', 2.36, 36, true, 'MASK-003-NAV-60-62'),
('mask-003-variant-004', 'mask-003', 'Red', '56-58cm', 2.36, 31, true, 'MASK-003-RED-56-58'),
('mask-003-variant-005', 'mask-003', 'Green', '58-60cm', 2.36, 26, true, 'MASK-003-GRN-58-60'),

-- Mask 4 variants
('mask-004-variant-001', 'mask-004', 'Black', '56-58cm', 2.36, 46, true, 'MASK-004-BLK-56-58'),
('mask-004-variant-002', 'mask-004', 'Gray', '58-60cm', 2.36, 40, true, 'MASK-004-GRY-58-60'),
('mask-004-variant-003', 'mask-004', 'Navy Blue', '60-62cm', 2.36, 34, true, 'MASK-004-NAV-60-62'),
('mask-004-variant-004', 'mask-004', 'Red', '56-58cm', 2.36, 29, true, 'MASK-004-RED-56-58'),
('mask-004-variant-005', 'mask-004', 'Green', '58-60cm', 2.36, 24, true, 'MASK-004-GRN-58-60'),

-- Mask 5 variants (Crochet - different sizing)
('mask-005-variant-001', 'mask-005', 'Custom Colors', 'Adult Size', 6.85, 100, true, 'MASK-005-CUSTOM-ADULT')

ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- STEP 3: INSERT PRODUCT IMAGES FOR MASKS
-- ============================================================================

-- Insert product images for mask products
INSERT INTO public.product_images (id, product_id, variant_id, image_url, alt_text, is_primary, sort_order) VALUES
-- Mask 1 images
('mask-001-img-001', 'mask-001', NULL, '/src/assets/mask_photos/mask1_1.png', 'Winter Thermal Balaclava Front View', true, 1),
('mask-001-img-002', 'mask-001', NULL, '/src/assets/mask_photos/mask1_2.png', 'Winter Thermal Balaclava Side View', false, 2),
('mask-001-img-003', 'mask-001', NULL, '/src/assets/mask_photos/mask1_3.png', 'Winter Thermal Balaclava Detail View', false, 3),
('mask-001-img-004', 'mask-001', NULL, '/src/assets/mask_photos/mask1_4.png', 'Winter Thermal Balaclava Usage View', false, 4),
('mask-001-img-005', 'mask-001', NULL, '/src/assets/mask_photos/mask1_5.png', 'Winter Thermal Balaclava Stretch View', false, 5),
('mask-001-img-006', 'mask-001', NULL, '/src/assets/mask_photos/mask1_6.png', 'Winter Thermal Balaclava Outdoor View', false, 6),

-- Mask 2 images
('mask-002-img-001', 'mask-002', NULL, '/src/assets/mask_photos/mask2_1.png', 'Winter Thermal Balaclava Front View', true, 1),
('mask-002-img-002', 'mask-002', NULL, '/src/assets/mask_photos/mask2_2.png', 'Winter Thermal Balaclava Side View', false, 2),
('mask-002-img-003', 'mask-002', NULL, '/src/assets/mask_photos/mask2_3.png', 'Winter Thermal Balaclava Detail View', false, 3),
('mask-002-img-004', 'mask-002', NULL, '/src/assets/mask_photos/mask2_4.png', 'Winter Thermal Balaclava Usage View', false, 4),
('mask-002-img-005', 'mask-002', NULL, '/src/assets/mask_photos/mask2_5.png', 'Winter Thermal Balaclava Stretch View', false, 5),
('mask-002-img-006', 'mask-002', NULL, '/src/assets/mask_photos/mask2_6.png', 'Winter Thermal Balaclava Outdoor View', false, 6),

-- Mask 3 images
('mask-003-img-001', 'mask-003', NULL, '/src/assets/mask_photos/mask3_1.png', 'Winter Thermal Balaclava Front View', true, 1),
('mask-003-img-002', 'mask-003', NULL, '/src/assets/mask_photos/mask3_2.png', 'Winter Thermal Balaclava Side View', false, 2),
('mask-003-img-003', 'mask-003', NULL, '/src/assets/mask_photos/mask3_3.png', 'Winter Thermal Balaclava Detail View', false, 3),
('mask-003-img-004', 'mask-003', NULL, '/src/assets/mask_photos/mask3_4.png', 'Winter Thermal Balaclava Usage View', false, 4),
('mask-003-img-005', 'mask-003', NULL, '/src/assets/mask_photos/mask3_5.png', 'Winter Thermal Balaclava Stretch View', false, 5),
('mask-003-img-006', 'mask-003', NULL, '/src/assets/mask_photos/mask3_6.png', 'Winter Thermal Balaclava Outdoor View', false, 6),

-- Mask 4 images
('mask-004-img-001', 'mask-004', NULL, '/src/assets/mask_photos/mask4_1.png', 'Winter Thermal Balaclava Front View', true, 1),
('mask-004-img-002', 'mask-004', NULL, '/src/assets/mask_photos/mask4_2.png', 'Winter Thermal Balaclava Side View', false, 2),
('mask-004-img-003', 'mask-004', NULL, '/src/assets/mask_photos/mask4_3.png', 'Winter Thermal Balaclava Detail View', false, 3),
('mask-004-img-004', 'mask-004', NULL, '/src/assets/mask_photos/mask4_4.png', 'Winter Thermal Balaclava Usage View', false, 4),
('mask-004-img-005', 'mask-004', NULL, '/src/assets/mask_photos/mask4_5.png', 'Winter Thermal Balaclava Stretch View', false, 5),
('mask-004-img-006', 'mask-004', NULL, '/src/assets/mask_photos/mask4_6.png', 'Winter Thermal Balaclava Outdoor View', false, 6),

-- Mask 5 images (Crochet)
('mask-005-img-001', 'mask-005', NULL, '/src/assets/mask_photos/mask5_1.png', 'Handmade Crochet Ski Mask Front', true, 1),
('mask-005-img-002', 'mask-005', NULL, '/src/assets/mask_photos/mask5_2.png', 'Handmade Crochet Ski Mask Side', false, 2)

ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- STEP 4: UPDATE PRODUCTS TABLE TO INCLUDE ADDITIONAL FIELDS
-- ============================================================================

-- Add additional fields to products table if they don't exist
DO $$ 
BEGIN
    -- Add image_url field if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'image_url') THEN
        ALTER TABLE public.products ADD COLUMN image_url TEXT;
    END IF;
    
    -- Add rating_average field if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'rating_average') THEN
        ALTER TABLE public.products ADD COLUMN rating_average DECIMAL(3,2) DEFAULT 4.5;
    END IF;
    
    -- Add rating_count field if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'rating_count') THEN
        ALTER TABLE public.products ADD COLUMN rating_count INTEGER DEFAULT 0;
    END IF;
    
    -- Add is_new_arrival field if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'is_new_arrival') THEN
        ALTER TABLE public.products ADD COLUMN is_new_arrival BOOLEAN DEFAULT false;
    END IF;
    
    -- Add is_limited_edition field if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'is_limited_edition') THEN
        ALTER TABLE public.products ADD COLUMN is_limited_edition BOOLEAN DEFAULT false;
    END IF;
    
    -- Add color_options field if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'color_options') THEN
        ALTER TABLE public.products ADD COLUMN color_options TEXT[];
    END IF;
    
    -- Add size_options field if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'size_options') THEN
        ALTER TABLE public.products ADD COLUMN size_options TEXT[];
    END IF;
    
    -- Add images field if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'images') THEN
        ALTER TABLE public.products ADD COLUMN images TEXT[];
    END IF;
END $$;

-- Update mask products with additional fields
UPDATE public.products SET 
    image_url = '/src/assets/mask_photos/mask1_1.png',
    rating_average = 4.3,
    rating_count = 156,
    is_new_arrival = true,
    is_limited_edition = false,
    color_options = ARRAY['Black', 'Gray', 'Navy Blue', 'Red', 'Green'],
    size_options = ARRAY['56-58cm', '58-60cm', '60-62cm'],
    images = ARRAY['/src/assets/mask_photos/mask1_1.png', '/src/assets/mask_photos/mask1_2.png', '/src/assets/mask_photos/mask1_3.png', '/src/assets/mask_photos/mask1_4.png', '/src/assets/mask_photos/mask1_5.png', '/src/assets/mask_photos/mask1_6.png']
WHERE id = 'mask-001';

UPDATE public.products SET 
    image_url = '/src/assets/mask_photos/mask2_1.png',
    rating_average = 4.3,
    rating_count = 156,
    is_new_arrival = true,
    is_limited_edition = false,
    color_options = ARRAY['Black', 'Gray', 'Navy Blue', 'Red', 'Green'],
    size_options = ARRAY['56-58cm', '58-60cm', '60-62cm'],
    images = ARRAY['/src/assets/mask_photos/mask2_1.png', '/src/assets/mask_photos/mask2_2.png', '/src/assets/mask_photos/mask2_3.png', '/src/assets/mask_photos/mask2_4.png', '/src/assets/mask_photos/mask2_5.png', '/src/assets/mask_photos/mask2_6.png']
WHERE id = 'mask-002';

UPDATE public.products SET 
    image_url = '/src/assets/mask_photos/mask3_1.png',
    rating_average = 4.3,
    rating_count = 156,
    is_new_arrival = true,
    is_limited_edition = false,
    color_options = ARRAY['Black', 'Gray', 'Navy Blue', 'Red', 'Green'],
    size_options = ARRAY['56-58cm', '58-60cm', '60-62cm'],
    images = ARRAY['/src/assets/mask_photos/mask3_1.png', '/src/assets/mask_photos/mask3_2.png', '/src/assets/mask_photos/mask3_3.png', '/src/assets/mask_photos/mask3_4.png', '/src/assets/mask_photos/mask3_5.png', '/src/assets/mask_photos/mask3_6.png']
WHERE id = 'mask-003';

UPDATE public.products SET 
    image_url = '/src/assets/mask_photos/mask4_1.png',
    rating_average = 4.3,
    rating_count = 156,
    is_new_arrival = true,
    is_limited_edition = false,
    color_options = ARRAY['Black', 'Gray', 'Navy Blue', 'Red', 'Green'],
    size_options = ARRAY['56-58cm', '58-60cm', '60-62cm'],
    images = ARRAY['/src/assets/mask_photos/mask4_1.png', '/src/assets/mask_photos/mask4_2.png', '/src/assets/mask_photos/mask4_3.png', '/src/assets/mask_photos/mask4_4.png', '/src/assets/mask_photos/mask4_5.png', '/src/assets/mask_photos/mask4_6.png']
WHERE id = 'mask-004';

UPDATE public.products SET 
    image_url = '/src/assets/mask_photos/mask5_1.png',
    rating_average = 4.4,
    rating_count = 210,
    is_new_arrival = true,
    is_limited_edition = false,
    color_options = ARRAY['Custom Colors'],
    size_options = ARRAY['Adult Size'],
    images = ARRAY['/src/assets/mask_photos/mask5_1.png', '/src/assets/mask_photos/mask5_2.png']
WHERE id = 'mask-005';

-- ============================================================================
-- STEP 5: VERIFICATION
-- ============================================================================

-- Verify mask products were inserted
SELECT 
    id,
    name,
    base_price,
    status,
    is_new_arrival,
    is_bestseller,
    rating_average,
    rating_count
FROM public.products 
WHERE id LIKE 'mask-%'
ORDER BY id;

-- Verify product variants were inserted
SELECT 
    pv.id,
    pv.product_id,
    pv.color,
    pv.size,
    pv.price,
    pv.stock_quantity,
    pv.is_active
FROM public.product_variants pv
JOIN public.products p ON pv.product_id = p.id
WHERE p.id LIKE 'mask-%'
ORDER BY pv.product_id, pv.color, pv.size;

-- Verify product images were inserted
SELECT 
    pi.id,
    pi.product_id,
    pi.image_url,
    pi.alt_text,
    pi.is_primary
FROM public.product_images pi
JOIN public.products p ON pi.product_id = p.id
WHERE p.id LIKE 'mask-%'
ORDER BY pi.product_id, pi.sort_order;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Your mask products are now in the database with:
-- ✅ All 5 mask products inserted
-- ✅ Product variants for each mask
-- ✅ Product images for each mask
-- ✅ Additional fields added to products table
-- ✅ Proper metadata and product information

-- Next steps:
-- 1. Update the frontend to use database products instead of hardcoded
-- 2. Test wishlist functionality with database products
-- 3. Verify cart functionality works with database products
