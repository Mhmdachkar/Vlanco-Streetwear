-- Add Your Vlanco Products to Database
-- Copy and paste this in Supabase SQL Editor

-- First, ensure we have categories
INSERT INTO categories (name, slug, description, is_active) VALUES
('T-Shirts', 't-shirts', 'Premium streetwear t-shirts', true),
('Masks', 'masks', 'Futuristic tech masks', true),
('Accessories', 'accessories', 'Urban tech accessories', true)
ON CONFLICT (slug) DO NOTHING;

-- Add your brand
INSERT INTO brands (name, slug, description, is_verified) VALUES
('Vlanco', 'vlanco', 'Premium streetwear brand', true)
ON CONFLICT (slug) DO NOTHING;

-- Add your actual products
INSERT INTO products (
  name, slug, description, base_price, compare_price,
  category_id, brand_id, status, is_featured, is_new_arrival, is_bestseller,
  stock_quantity, size_options, color_options, tags, material, care_instructions
) VALUES

-- T-SHIRTS
(
  'Urban Flux Gradient Tee',
  'urban-flux-gradient-tee',
  'Experience the future of streetwear with our Urban Flux Gradient Tee. Revolutionary color-shifting gradient technology.',
  89.00, 119.00,
  (SELECT id FROM categories WHERE slug = 't-shirts'),
  (SELECT id FROM brands WHERE slug = 'vlanco'),
  'active', true, true, true, 50,
  ARRAY['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  ARRAY['Cyber Blue', 'Neon Purple', 'Electric Green'],
  ARRAY['streetwear', 'gradient', 'tech-wear', 'limited-edition'],
  '100% Organic Cotton (320GSM)',
  'Machine wash cold, hang dry'
),

(
  'Neon Dreams Oversized Tee',
  'neon-dreams-oversized-tee',
  'Cyberpunk aesthetic with glow-in-the-dark accents. Perfect for urban environments.',
  75.00, 95.00,
  (SELECT id FROM categories WHERE slug = 't-shirts'),
  (SELECT id FROM brands WHERE slug = 'vlanco'),
  'active', true, false, true, 30,
  ARRAY['S', 'M', 'L', 'XL', 'XXL'],
  ARRAY['Electric Pink', 'Acid Yellow', 'Plasma Blue'],
  ARRAY['oversized', 'glow-in-dark', 'cyberpunk'],
  'Cotton Blend with Mesh (280GSM)',
  'Machine wash inside out'
),

-- MASKS
(
  'Cyber Guardian LED Mask',
  'cyber-guardian-led-mask',
  'Futuristic mask with RGB LED strips, air filtration, and voice modulation.',
  149.00, 199.00,
  (SELECT id FROM categories WHERE slug = 'masks'),
  (SELECT id FROM brands WHERE slug = 'vlanco'),
  'active', true, true, false, 25,
  ARRAY['S/M', 'L/XL'],
  ARRAY['Cyber Black', 'Chrome Silver', 'Neon Blue'],
  ARRAY['tech', 'led', 'protection', 'futuristic'],
  'Medical-grade silicone with carbon fiber',
  'Wipe with alcohol, UV compatible'
),

-- ACCESSORIES
(
  'Quantum Glow Smart Backpack',
  'quantum-glow-smart-backpack',
  'LED panel display, wireless charging, GPS tracking. The future of urban carry.',
  299.00, 399.00,
  (SELECT id FROM categories WHERE slug = 'accessories'),
  (SELECT id FROM brands WHERE slug = 'vlanco'),
  'active', true, true, true, 15,
  ARRAY['One Size'],
  ARRAY['Quantum Black', 'Cyber Blue', 'Neon Green'],
  ARRAY['smart', 'led', 'tech', 'backpack'],
  'Ballistic nylon with TPU coating',
  'Spot clean only'
),

(
  'Neural Interface Snapback',
  'neural-interface-snapback',
  'EEG sensors, gesture controls, smartphone integration. Wearable technology.',
  89.00, 119.00,
  (SELECT id FROM categories WHERE slug = 'accessories'),
  (SELECT id FROM brands WHERE slug = 'vlanco'),
  'active', true, true, false, 40,
  ARRAY['One Size Adjustable'],
  ARRAY['Matrix Black', 'Tech Gray', 'Neural Blue'],
  ARRAY['neural', 'eeg', 'tech', 'smart'],
  'Smart fabric with sensors',
  'Spot clean, remove sensors'
);

-- Add product images (you'll need to upload actual images to Supabase Storage first)
INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order) 
SELECT 
  p.id,
  '/src/assets/product-1.jpg',
  p.name || ' - Main Image',
  true,
  1
FROM products p 
WHERE p.slug IN ('urban-flux-gradient-tee', 'cyber-guardian-led-mask', 'quantum-glow-smart-backpack', 'neural-interface-snapback', 'neon-dreams-oversized-tee');

-- Create product variants for different sizes/colors
INSERT INTO product_variants (product_id, sku, size, color, price, stock_quantity, is_active)
SELECT 
  p.id,
  UPPER(LEFT(p.slug, 4)) || '-' || LEFT(color, 2) || '-' || COALESCE(size, 'OS'),
  size,
  color,
  p.base_price,
  10, -- Stock per variant
  true
FROM products p
CROSS JOIN UNNEST(p.size_options) AS size
CROSS JOIN UNNEST(p.color_options) AS color
WHERE p.slug IN ('urban-flux-gradient-tee', 'neon-dreams-oversized-tee', 'cyber-guardian-led-mask', 'quantum-glow-smart-backpack', 'neural-interface-snapback');

COMMIT;
