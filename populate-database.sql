-- Vlanco Streetwear Database Population Script
-- Run this in your Supabase SQL Editor

-- First, let's add some categories
INSERT INTO categories (name, slug, description, is_active) VALUES
('T-Shirts', 't-shirts', 'Premium streetwear t-shirts with cutting-edge designs', true),
('Masks', 'masks', 'Futuristic masks with LED and tech features', true),
('Accessories', 'accessories', 'Tech-enabled accessories for the modern urbanite', true);

-- Add a brand
INSERT INTO brands (name, slug, description, is_verified) VALUES
('Vlanco', 'vlanco', 'Premium streetwear brand pushing the boundaries of fashion and technology', true);

-- Get the category and brand IDs for reference
-- (You'll need to replace these with actual IDs after running the above inserts)

-- Add some sample products
INSERT INTO products (
  name, slug, description, base_price, compare_price, 
  category_id, brand_id, status, is_featured, is_new_arrival, 
  is_bestseller, stock_quantity, size_options, color_options, tags
) VALUES
(
  'Urban Flux Gradient Tee',
  'urban-flux-gradient-tee',
  'Experience the future of streetwear with our Urban Flux Gradient Tee. This cutting-edge design features a revolutionary color-shifting gradient that responds to light and movement.',
  89.00,
  119.00,
  (SELECT id FROM categories WHERE slug = 't-shirts' LIMIT 1),
  (SELECT id FROM brands WHERE slug = 'vlanco' LIMIT 1),
  'active',
  true,
  true,
  true,
  50,
  ARRAY['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  ARRAY['Cyber Blue', 'Neon Purple', 'Electric Green'],
  ARRAY['streetwear', 'gradient', 'tech-wear', 'limited-edition']
),
(
  'Cyber Guardian LED Mask',
  'cyber-guardian-led-mask',
  'Protect yourself in style with our Cyber Guardian LED Mask. Featuring built-in LED strips, air filtration system, and voice modulation technology.',
  149.00,
  199.00,
  (SELECT id FROM categories WHERE slug = 'masks' LIMIT 1),
  (SELECT id FROM brands WHERE slug = 'vlanco' LIMIT 1),
  'active',
  true,
  true,
  false,
  25,
  ARRAY['S/M', 'L/XL'],
  ARRAY['Cyber Black', 'Chrome Silver', 'Neon Blue'],
  ARRAY['tech', 'led', 'protection', 'futuristic', 'smart']
),
(
  'Quantum Glow Smart Backpack',
  'quantum-glow-smart-backpack',
  'Carry your digital life in style with our Quantum Glow Smart Backpack. Featuring integrated LED panels, wireless charging, GPS tracking.',
  299.00,
  399.00,
  (SELECT id FROM categories WHERE slug = 'accessories' LIMIT 1),
  (SELECT id FROM brands WHERE slug = 'vlanco' LIMIT 1),
  'active',
  true,
  true,
  true,
  15,
  ARRAY['One Size'],
  ARRAY['Quantum Black', 'Cyber Blue', 'Neon Green'],
  ARRAY['smart', 'led', 'tech', 'backpack', 'wireless-charging']
);

-- Add product images (you'll need to upload actual images to Supabase Storage)
INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order) VALUES
(
  (SELECT id FROM products WHERE slug = 'urban-flux-gradient-tee' LIMIT 1),
  '/src/assets/product-1.jpg',
  'Urban Flux Gradient Tee - Front View',
  true,
  1
),
(
  (SELECT id FROM products WHERE slug = 'cyber-guardian-led-mask' LIMIT 1),
  '/src/assets/product-2.jpg',
  'Cyber Guardian LED Mask - Profile View',
  true,
  1
),
(
  (SELECT id FROM products WHERE slug = 'quantum-glow-smart-backpack' LIMIT 1),
  '/src/assets/product-3.jpg',
  'Quantum Glow Smart Backpack - Full View',
  true,
  1
);

-- Create product variants for different sizes and colors
INSERT INTO product_variants (product_id, sku, size, color, price, stock_quantity, is_active) VALUES
-- Urban Flux Gradient Tee variants
(
  (SELECT id FROM products WHERE slug = 'urban-flux-gradient-tee' LIMIT 1),
  'UFGT-CB-M',
  'M',
  'Cyber Blue',
  89.00,
  10,
  true
),
(
  (SELECT id FROM products WHERE slug = 'urban-flux-gradient-tee' LIMIT 1),
  'UFGT-NP-L',
  'L',
  'Neon Purple',
  89.00,
  8,
  true
),
-- Cyber Guardian LED Mask variants
(
  (SELECT id FROM products WHERE slug = 'cyber-guardian-led-mask' LIMIT 1),
  'CGLM-CB-SM',
  'S/M',
  'Cyber Black',
  149.00,
  5,
  true
),
-- Quantum Glow Smart Backpack variants
(
  (SELECT id FROM products WHERE slug = 'quantum-glow-smart-backpack' LIMIT 1),
  'QGSB-QB-OS',
  'One Size',
  'Quantum Black',
  299.00,
  3,
  true
);

-- Add some sample reviews
INSERT INTO reviews (product_id, user_id, rating, title, comment, is_verified_purchase) VALUES
(
  (SELECT id FROM products WHERE slug = 'urban-flux-gradient-tee' LIMIT 1),
  gen_random_uuid(),
  5,
  'Amazing quality and design!',
  'The gradient effect is incredible in person. Super comfortable and gets compliments everywhere I go.',
  true
),
(
  (SELECT id FROM products WHERE slug = 'cyber-guardian-led-mask' LIMIT 1),
  gen_random_uuid(),
  4,
  'Futuristic and functional',
  'The LED effects are mind-blowing. Voice modulation works great. Battery life could be better but overall amazing product.',
  true
);

-- Update product ratings based on reviews
UPDATE products SET 
  rating_average = (
    SELECT AVG(rating) FROM reviews WHERE product_id = products.id
  ),
  rating_count = (
    SELECT COUNT(*) FROM reviews WHERE product_id = products.id
  );

COMMIT;
