
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

export interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[];
  category: string;
  description?: string;
  features?: string[];
  specifications?: {
    material?: string;
    fit?: string;
    care?: string;
    origin?: string;
    weight?: string;
    dimensions?: string;
  };
  sizes?: string[];
  colors?: {
    name: string;
    value: string;
    image?: string;
  }[];
  rating?: number;
  reviews?: number;
  inStock?: boolean;
  isNew?: boolean;
  isBestseller?: boolean;
  tags?: string[];
}

const mockProducts: Product[] = [
  // T-SHIRTS
  {
    id: 1,
    name: "Urban Flux Gradient Tee",
    price: 89,
    originalPrice: 119,
    image: "/src/assets/1.png",
    images: [
      "/src/assets/1.png",
      "/src/assets/3.png",
      "/src/assets/4.png"
    ],
    category: "T-Shirts",
    description: "Experience the future of streetwear with our Urban Flux Gradient Tee. This cutting-edge design features a revolutionary color-shifting gradient that responds to light and movement, creating a unique visual experience every time you wear it.",
    features: [
      "Revolutionary color-shifting gradient technology",
      "Premium 100% organic cotton construction", 
      "Ultra-soft hand feel with moisture-wicking properties",
      "Reinforced seams for enhanced durability",
      "Eco-friendly reactive dyes that won't fade",
      "Limited edition design - only 500 pieces made"
    ],
    specifications: {
      material: "100% Organic Cotton (320GSM)",
      fit: "Relaxed streetwear fit with dropped shoulders",
      care: "Machine wash cold, hang dry, do not bleach",
      origin: "Ethically made in Portugal",
      weight: "320g"
    },
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    colors: [
      { name: "Cyber Blue", value: "#00D4FF", image: "/src/assets/1.png" },
      { name: "Neon Purple", value: "#8B5CF6", image: "/src/assets/3.png" },
      { name: "Electric Green", value: "#10B981", image: "/src/assets/4.png" }
    ],
    rating: 4.8,
    reviews: 127,
    inStock: true,
    isNew: true,
    isBestseller: true,
    tags: ["streetwear", "gradient", "tech-wear", "limited-edition"]
  },
  {
    id: 2,
    name: "Neon Dreams Oversized Tee",
    price: 75,
    originalPrice: 95,
    image: "/src/assets/3.png",
    images: [
      "/src/assets/3.png",
      "/src/assets/1.png",
      "/src/assets/4.png"
    ],
    category: "T-Shirts",
    description: "Dive into the cyberpunk aesthetic with our Neon Dreams Oversized Tee. Featuring bold geometric patterns and glow-in-the-dark accents, this shirt is perfect for making a statement in any urban environment.",
    features: [
      "Glow-in-the-dark accents for night visibility",
      "Oversized fit perfect for layering",
      "High-quality screen printing with raised texture",
      "Breathable mesh panels for ventilation",
      "Reflective details for safety and style",
      "Anti-bacterial treatment prevents odors"
    ],
    specifications: {
      material: "Cotton Blend with Mesh Inserts (280GSM)",
      fit: "Oversized with extended sleeves",
      care: "Machine wash inside out, tumble dry low",
      origin: "Made in Japan",
      weight: "280g"
    },
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: [
      { name: "Electric Pink", value: "#FF0080", image: "/src/assets/3.png" },
      { name: "Acid Yellow", value: "#FFFF00", image: "/src/assets/1.png" },
      { name: "Plasma Blue", value: "#0080FF", image: "/src/assets/4.png" }
    ],
    rating: 4.6,
    reviews: 89,
    inStock: true,
    isNew: false,
    isBestseller: true,
    tags: ["oversized", "glow-in-dark", "cyberpunk", "streetwear"]
  },
  {
    id: 3,
    name: "Matrix Code Black Tee",
    price: 69,
    image: "/src/assets/4.png",
    images: [
      "/src/assets/4.png",
      "/src/assets/1.png",
      "/src/assets/3.png"
    ],
    category: "T-Shirts",
    description: "Enter the digital realm with our Matrix Code Black Tee. This minimalist masterpiece features subtle embossed code patterns that catch light beautifully, perfect for tech enthusiasts and urban explorers.",
    features: [
      "Embossed matrix code pattern",
      "Premium heavyweight cotton",
      "Seamless shoulder construction",
      "Pre-shrunk for perfect fit",
      "Subtle reflective accents",
      "Limited black colorway"
    ],
    specifications: {
      material: "100% Premium Cotton (350GSM)",
      fit: "Regular fit with modern cut",
      care: "Machine wash cold, iron inside out",
      origin: "Made in USA",
      weight: "350g"
    },
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [
      { name: "Matrix Black", value: "#000000", image: "/src/assets/4.png" },
      { name: "Code Gray", value: "#404040", image: "/src/assets/1.png" }
    ],
    rating: 4.9,
    reviews: 156,
    inStock: true,
    isNew: false,
    isBestseller: true,
    tags: ["minimalist", "tech", "black", "premium"]
  },

  // MASKS
  {
    id: 4,
    name: "Cyber Guardian LED Mask",
    price: 149,
    originalPrice: 199,
    image: "/src/assets/1.png",
    images: [
      "/src/assets/1.png",
      "/src/assets/3.png",
      "/src/assets/4.png"
    ],
    category: "Masks",
    description: "Protect yourself in style with our Cyber Guardian LED Mask. Featuring built-in LED strips, air filtration system, and voice modulation technology, this isn't just a mask - it's a statement piece for the future.",
    features: [
      "RGB LED strips with 16.7M colors",
      "Advanced HEPA filtration system",
      "Voice modulation with 8 different modes",
      "Rechargeable battery (8+ hours)",
      "Bluetooth connectivity for app control",
      "Comfortable ergonomic design",
      "Antimicrobial surface coating"
    ],
    specifications: {
      material: "Medical-grade silicone with carbon fiber accents",
      fit: "Adjustable with three size settings",
      care: "Wipe with alcohol, UV sterilizer compatible",
      origin: "Assembled in South Korea",
      weight: "280g",
      dimensions: "20cm x 15cm x 8cm"
    },
    sizes: ["S/M", "L/XL"],
    colors: [
      { name: "Cyber Black", value: "#000000", image: "/src/assets/1.png" },
      { name: "Chrome Silver", value: "#C0C0C0", image: "/src/assets/3.png" },
      { name: "Neon Blue", value: "#00BFFF", image: "/src/assets/4.png" }
    ],
    rating: 4.7,
    reviews: 73,
    inStock: true,
    isNew: true,
    isBestseller: false,
    tags: ["tech", "led", "protection", "futuristic", "smart"]
  },
  {
    id: 5,
    name: "Urban Stealth Tactical Mask",
    price: 89,
    originalPrice: 129,
    image: "/src/assets/3.png",
    images: [
      "/src/assets/3.png",
      "/src/assets/4.png",
      "/src/assets/1.png"
    ],
    category: "Masks",
    description: "Blend into the urban landscape with our Urban Stealth Tactical Mask. Designed for maximum protection and minimal detection, featuring advanced materials and a sleek, low-profile design.",
    features: [
      "Military-grade ballistic nylon exterior",
      "N95 equivalent filtration",
      "Moisture-wicking interior lining",
      "Adjustable nose bridge for perfect seal",
      "Fog-resistant coating",
      "Modular design for easy customization"
    ],
    specifications: {
      material: "Ballistic nylon with ceramic filter",
      fit: "Contoured for maximum seal",
      care: "Replaceable filters, washable exterior",
      origin: "Made in Germany",
      weight: "95g"
    },
    sizes: ["One Size Adjustable"],
    colors: [
      { name: "Tactical Black", value: "#1a1a1a", image: "/src/assets/3.png" },
      { name: "Urban Gray", value: "#808080", image: "/src/assets/4.png" },
      { name: "Olive Drab", value: "#556B2F", image: "/src/assets/1.png" }
    ],
    rating: 4.5,
    reviews: 94,
    inStock: true,
    isNew: false,
    isBestseller: true,
    tags: ["tactical", "stealth", "protection", "military"]
  },
  {
    id: 6,
    name: "Holographic Prism Face Shield",
    price: 199,
    image: "/src/assets/4.png",
    images: [
      "/src/assets/4.png",
      "/src/assets/1.png",
      "/src/assets/3.png"
    ],
    category: "Masks",
    description: "Step into the metaverse with our Holographic Prism Face Shield. This revolutionary design features holographic projection technology and AR integration for the ultimate digital fashion experience.",
    features: [
      "Holographic display technology",
      "AR integration with smartphone",
      "Gesture control interface",
      "Ultra-clear polycarbonate shield",
      "Anti-fog and UV protection",
      "Wireless charging capability",
      "Custom animation library"
    ],
    specifications: {
      material: "Polycarbonate with holographic film",
      fit: "Lightweight with padded headband",
      care: "Microfiber cloth cleaning only",
      origin: "Made in Silicon Valley",
      weight: "150g"
    },
    sizes: ["Universal"],
    colors: [
      { name: "Prism Clear", value: "transparent", image: "/src/assets/4.png" },
      { name: "Rainbow Chrome", value: "#FF00FF", image: "/src/assets/1.png" }
    ],
    rating: 4.3,
    reviews: 31,
    inStock: false,
    isNew: true,
    isBestseller: false,
    tags: ["holographic", "ar", "tech", "futuristic", "digital"]
  },

  // ACCESSORIES
  {
    id: 7,
    name: "Quantum Glow Smart Backpack",
    price: 299,
    originalPrice: 399,
    image: "/src/assets/1.png",
    images: [
      "/src/assets/1.png",
      "/src/assets/3.png",
      "/src/assets/4.png"
    ],
    category: "Accessories",
    description: "Carry your digital life in style with our Quantum Glow Smart Backpack. Featuring integrated LED panels, wireless charging, GPS tracking, and enough space for all your tech gear.",
    features: [
      "Programmable LED panel display",
      "Built-in wireless charging pad",
      "GPS tracking with anti-theft alerts",
      "Waterproof zippers and materials",
      "Laptop compartment fits up to 17\"",
      "USB-C power bank integration",
      "Ergonomic design with memory foam straps",
      "Expandable storage system"
    ],
    specifications: {
      material: "Ballistic nylon with TPU coating",
      fit: "Adjustable straps for all body types",
      care: "Spot clean, do not machine wash",
      origin: "Designed in Tokyo",
      weight: "1.2kg",
      dimensions: "45cm x 32cm x 20cm"
    },
    sizes: ["One Size"],
    colors: [
      { name: "Quantum Black", value: "#000000", image: "/src/assets/1.png" },
      { name: "Cyber Blue", value: "#0066CC", image: "/src/assets/3.png" },
      { name: "Neon Green", value: "#00FF41", image: "/src/assets/4.png" }
    ],
    rating: 4.8,
    reviews: 167,
    inStock: true,
    isNew: true,
    isBestseller: true,
    tags: ["smart", "led", "tech", "backpack", "wireless-charging"]
  },
  {
    id: 8,
    name: "Neural Interface Snapback",
    price: 89,
    originalPrice: 119,
    image: "/src/assets/3.png",
    images: [
      "/src/assets/3.png",
      "/src/assets/4.png",
      "/src/assets/1.png"
    ],
    category: "Accessories",
    description: "Connect to the digital realm with our Neural Interface Snapback. Featuring EEG monitoring sensors, gesture controls, and a futuristic design that pushes the boundaries of wearable technology.",
    features: [
      "EEG sensors for brainwave monitoring",
      "Gesture recognition technology",
      "Smartphone app integration",
      "Moisture-wicking smart fabric",
      "Adjustable snapback closure",
      "LED status indicators",
      "Rechargeable micro-battery system"
    ],
    specifications: {
      material: "Smart fabric with embedded sensors",
      fit: "Adjustable snapback design",
      care: "Spot clean only, remove sensors before cleaning",
      origin: "Made in Taiwan",
      weight: "180g"
    },
    sizes: ["One Size Adjustable"],
    colors: [
      { name: "Matrix Black", value: "#000000", image: "/src/assets/3.png" },
      { name: "Tech Gray", value: "#4A5568", image: "/src/assets/4.png" },
      { name: "Neural Blue", value: "#2563EB", image: "/src/assets/1.png" }
    ],
    rating: 4.4,
    reviews: 56,
    inStock: true,
    isNew: true,
    isBestseller: false,
    tags: ["neural", "eeg", "tech", "smart", "gesture-control"]
  },
  {
    id: 9,
    name: "Holographic Chain Necklace",
    price: 159,
    image: "/src/assets/4.png",
    images: [
      "/src/assets/4.png",
      "/src/assets/1.png",
      "/src/assets/3.png"
    ],
    category: "Accessories",
    description: "Make a statement with our Holographic Chain Necklace. This stunning piece features color-shifting links that create mesmerizing light patterns, perfect for festivals and special occasions.",
    features: [
      "Color-shifting holographic coating",
      "Lightweight aluminum construction",
      "Hypoallergenic materials",
      "Adjustable length mechanism",
      "Scratch-resistant surface",
      "Limited edition design"
    ],
    specifications: {
      material: "Anodized aluminum with holographic coating",
      fit: "Adjustable 16-22 inch length",
      care: "Clean with soft cloth, avoid harsh chemicals",
      origin: "Crafted in Italy",
      weight: "45g"
    },
    sizes: ["Adjustable"],
    colors: [
      { name: "Prismatic", value: "rainbow", image: "/src/assets/4.png" },
      { name: "Aurora Blue", value: "#4169E1", image: "/src/assets/1.png" },
      { name: "Sunset Gold", value: "#FFD700", image: "/src/assets/3.png" }
    ],
    rating: 4.6,
    reviews: 78,
    inStock: true,
    isNew: false,
    isBestseller: true,
    tags: ["holographic", "jewelry", "festival", "limited-edition"]
  },
  {
    id: 10,
    name: "AR Smart Glasses V2",
    price: 599,
    originalPrice: 799,
    image: "/src/assets/1.png",
    images: [
      "/src/assets/1.png",
      "/src/assets/3.png",
      "/src/assets/4.png"
    ],
    category: "Accessories",
    description: "Experience augmented reality like never before with our AR Smart Glasses V2. Featuring crystal-clear displays, all-day battery life, and seamless integration with your digital lifestyle.",
    features: [
      "4K micro-OLED displays",
      "12-hour battery life",
      "Voice and gesture control",
      "5G connectivity built-in",
      "AI-powered translation",
      "Prescription lens compatible",
      "Lightweight titanium frame",
      "Privacy mode with instant darkening"
    ],
    specifications: {
      material: "Titanium frame with sapphire lenses",
      fit: "Adjustable nose pads and temples",
      care: "Clean with provided microfiber cloth",
      origin: "Assembled in California",
      weight: "89g"
    },
    sizes: ["Universal"],
    colors: [
      { name: "Titanium Silver", value: "#C0C0C0", image: "/src/assets/1.png" },
      { name: "Matte Black", value: "#000000", image: "/src/assets/3.png" },
      { name: "Rose Gold", value: "#E8B4B8", image: "/src/assets/4.png" }
    ],
    rating: 4.9,
    reviews: 234,
    inStock: true,
    isNew: true,
    isBestseller: true,
    tags: ["ar", "smart-glasses", "tech", "premium", "ai"]
  },
  {
    id: 11,
    name: "Neon Pulse LED Belt",
    price: 79,
    originalPrice: 99,
    image: "/src/assets/3.png",
    images: [
      "/src/assets/3.png",
      "/src/assets/4.png",
      "/src/assets/1.png"
    ],
    category: "Accessories",
    description: "Light up the night with our Neon Pulse LED Belt. This innovative accessory features customizable LED patterns, music synchronization, and a sleek design that's perfect for parties and festivals.",
    features: [
      "Customizable LED light patterns",
      "Music synchronization mode",
      "Smartphone app control",
      "Waterproof construction",
      "Quick-release buckle system",
      "20+ pre-programmed animations",
      "Long-lasting rechargeable battery"
    ],
    specifications: {
      material: "Silicone with embedded LEDs",
      fit: "Adjustable 28-44 inch waist",
      care: "Wipe clean, fully waterproof",
      origin: "Made in China",
      weight: "180g"
    },
    sizes: ["S/M (28-36\")", "L/XL (34-44\")"],
    colors: [
      { name: "RGB Multi", value: "multicolor", image: "/src/assets/3.png" },
      { name: "Electric Blue", value: "#0080FF", image: "/src/assets/4.png" },
      { name: "Neon Pink", value: "#FF1493", image: "/src/assets/1.png" }
    ],
    rating: 4.2,
    reviews: 112,
    inStock: true,
    isNew: false,
    isBestseller: false,
    tags: ["led", "music-sync", "festival", "party", "waterproof"]
  },
  {
    id: 12,
    name: "Cyber Punk Fingerless Gloves",
    price: 45,
    originalPrice: 65,
    image: "/src/assets/4.png",
    images: [
      "/src/assets/4.png",
      "/src/assets/1.png",
      "/src/assets/3.png"
    ],
    category: "Accessories",
    description: "Complete your cyberpunk look with our signature Fingerless Gloves. Featuring conductive fingertips for touchscreen use, reinforced knuckles, and a distinctive aesthetic that screams street tech.",
    features: [
      "Conductive fingertips for touchscreen use",
      "Reinforced knuckle protection",
      "Breathable mesh back panels",
      "Adjustable wrist straps",
      "Reflective accent details",
      "Machine washable construction"
    ],
    specifications: {
      material: "Synthetic leather with mesh inserts",
      fit: "Ergonomic with adjustable closure",
      care: "Machine wash cold, air dry",
      origin: "Made in Vietnam",
      weight: "85g per pair"
    },
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Cyber Black", value: "#000000", image: "/src/assets/4.png" },
      { name: "Electric Green", value: "#00FF00", image: "/src/assets/1.png" },
      { name: "Neon Orange", value: "#FF4500", image: "/src/assets/3.png" }
    ],
    rating: 4.7,
    reviews: 189,
    inStock: true,
    isNew: false,
    isBestseller: true,
    tags: ["fingerless", "touchscreen", "cyberpunk", "street", "protective"]
  }
];

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Check if Supabase is configured
      if (!supabase || typeof supabase.from !== 'function') {
        console.warn('Supabase not configured, using mock products');
        setProducts(mockProducts);
        setLoading(false);
        return;
      }

      // Fetch products with their images
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          images:product_images(image_url, alt_text, is_primary, sort_order),
          variants:product_variants(*)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Supabase products fetch error:', error);
        setProducts(mockProducts);
      } else if (!data || data.length === 0) {
        console.warn('No products found in database, using mock data');
        setProducts(mockProducts);
      } else {
        // Map Supabase data to Product interface
        const mappedProducts = data.map((p: any) => ({
          id: parseInt(p.id) || p.id,
          name: p.name,
          price: p.base_price || 0,
          originalPrice: p.compare_price || undefined,
          image: p.images?.find((img: any) => img.is_primary)?.image_url || 
                 p.images?.[0]?.image_url || 
                 '/src/assets/1.png',
          images: p.images?.sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0))
                    .map((img: any) => img.image_url) || 
                  ['/src/assets/1.png'],
          category: p.category?.name || 'Streetwear',
          description: p.description,
          features: Array.isArray(p.meta_fields?.features) ? p.meta_fields.features : undefined,
          specifications: {
            material: p.material,
            fit: p.meta_fields?.fit,
            care: p.care_instructions,
            origin: p.meta_fields?.origin,
            weight: p.weight ? `${p.weight}g` : undefined,
            dimensions: p.dimensions ? JSON.stringify(p.dimensions) : undefined,
          },
          sizes: p.size_options || [],
          colors: p.color_options?.map((c: string) => ({ 
            name: c, 
            value: c.toLowerCase().replace(/\s+/g, '-'),
            image: p.images?.[0]?.image_url 
          })) || [],
          rating: p.rating_average,
          reviews: p.rating_count,
          inStock: (p.stock_quantity || 0) > 0,
          isNew: p.is_new_arrival,
          isBestseller: p.is_bestseller,
          tags: p.tags || [],
        }));
        
        setProducts(mappedProducts);
        console.log(`✅ Loaded ${mappedProducts.length} products from Supabase`);
      }
    } catch (err) {
      console.error('Exception fetching products:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
      setProducts(mockProducts);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const getProductsByCategory = (category: string) => {
    return products.filter(product => product.category === category);
  };

  const getProductById = (id: number) => {
    return products.find(product => product.id === id);
  };

  const getFeaturedProducts = () => {
    return products.filter(product => product.isBestseller || product.isNew);
  };

  const searchProducts = (query: string) => {
    const lowercaseQuery = query.toLowerCase();
    return products.filter(product => 
      product.name.toLowerCase().includes(lowercaseQuery) ||
      product.category.toLowerCase().includes(lowercaseQuery) ||
      product.tags?.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  };

  return {
    products,
    loading,
    error,
    getProductsByCategory,
    getProductById,
    getFeaturedProducts,
    searchProducts,
    refetch: fetchProducts
  };
};
