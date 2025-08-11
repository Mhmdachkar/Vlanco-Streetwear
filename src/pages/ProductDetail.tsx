import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Heart, 
  Share2, 
  ShoppingCart, 
  Star, 
  ChevronLeft, 
  ChevronRight,
  Shield, 
  Truck,
  RotateCcw,
  Award,
  Zap,
  Check,
  Info,
  Package,
  Sparkles,
  Eye,
  Timer,
  Plus,
  Minus,
  ZoomIn,
  Facebook,
  Twitter,
  Instagram,
  Copy,
  Gift,
  CreditCard,
  Lock,
  ThumbsUp,
  MessageCircle,
  Users,
  TrendingUp,
  Globe,
  Ruler,
  Palette,
  ShirtIcon as Shirt
} from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { useCart } from '@/hooks/useCart';
import Navigation from '@/components/Navigation';
import ProductViewer3D from '@/components/ProductViewer3D';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getProductById, products } = useProducts();
  const { addToCart } = useCart();
  
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });
  
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<number>(0);
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('description');
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [shareMenuOpen, setShareMenuOpen] = useState(false);
  const [selectedImageView, setSelectedImageView] = useState<'2d' | '3d'>('2d');

  const product = getProductById(Number(id));

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Product not found</h2>
          <Button onClick={() => navigate('/')}>Return Home</Button>
        </div>
      </div>
    );
  }

  // Mock enhanced product data for demo
  const enhancedProduct = {
    ...product,
    gallery: [
      product.image,
      '/src/assets/product-1.jpg',
      '/src/assets/product-2.jpg',
      '/src/assets/product-3.jpg'
    ],
    originalPrice: product.price + 20,
    discount: 20,
    inStock: 47,
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Black', 'White', 'Navy', 'Gray'],
    features: [
      'Premium cotton blend fabric',
      '360° stretch technology',
      'Moisture-wicking properties',
      'Anti-bacterial treatment',
      'Reinforced seams',
      'Custom VLANCO branding'
    ],
    specifications: {
      'Material': '80% Cotton, 20% Elastane',
      'Weight': '280gsm',
      'Care': 'Machine wash cold, hang dry',
      'Origin': 'Made in Portugal',
      'Fit': 'Regular fit',
      'Model': 'VL-2024-001'
    },
    reviews: {
      average: 4.8,
      total: 287,
      distribution: {
        5: 234,
        4: 38,
        3: 12,
        2: 2,
        1: 1
      }
    }
  };

  const relatedProducts = products.filter(p => 
    p.id !== product.id && 
    p.category === product.category
  ).slice(0, 4);

  const handleAddToCart = () => {
    if (!selectedSize && enhancedProduct.sizes?.length) {
      alert('Please select a size');
      return;
    }

    const cartItem = {
      id: `${product.id}-${selectedSize}-${selectedColor}`,
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      size: selectedSize,
      color: enhancedProduct.colors?.[selectedColor] || '',
      quantity
    };
    
    const existingCart = JSON.parse(localStorage.getItem('vlanco_cart') || '[]');
    const existingItemIndex = existingCart.findIndex((item: any) => item.id === cartItem.id);
    
    if (existingItemIndex > -1) {
      existingCart[existingItemIndex].quantity += quantity;
    } else {
      existingCart.push(cartItem);
    }
    
    localStorage.setItem('vlanco_cart', JSON.stringify(existingCart));
    alert(`Added ${product.name} to cart!`);
  };

  const handleShare = async (platform: string) => {
    const url = window.location.href;
    const text = `Check out this ${product.name} from VLANCO`;

    switch (platform) {
      case 'copy':
        await navigator.clipboard.writeText(url);
        alert('Link copied to clipboard!');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`);
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`);
        break;
      case 'instagram':
        // Instagram doesn't support direct sharing, copy link instead
        await navigator.clipboard.writeText(url);
        alert('Link copied! You can now share on Instagram');
        break;
    }
    setShareMenuOpen(false);
  };

  const tabs = [
    { id: 'description', label: 'Description', icon: Info },
    { id: 'features', label: 'Features', icon: Sparkles },
    { id: 'specifications', label: 'Specifications', icon: Package },
    { id: 'reviews', label: 'Reviews', icon: Star },
    { id: 'shipping', label: 'Shipping & Returns', icon: Truck }
  ];

  const trustBadges = [
    { icon: Shield, text: 'Secure Payment', desc: '256-bit SSL encryption' },
    { icon: Truck, text: 'Free Shipping', desc: 'Orders over $150' },
    { icon: RotateCcw, text: '30-Day Returns', desc: 'Hassle-free returns' },
    { icon: Award, text: 'Authenticity', desc: '100% genuine products' }
  ];

  // Animated background particles
  const FloatingParticles = ({ count = 18, color = "from-primary/20 to-purple-500/10" }) => (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {[...Array(count)].map((_, i) => (
        <motion.div
          key={`particle-${i}`}
          className={`absolute w-1 h-1 bg-gradient-to-br ${color} rounded-full`}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.random() * 15 - 7.5, 0],
            scale: [0, 1, 0.5, 1, 0],
            opacity: [0, 0.8, 0.6, 0.4, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: Math.random() * 12 + 8,
            repeat: Infinity,
            delay: Math.random() * 6,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );

  const colorMap: Record<string, string> = {
    Black: '#000000',
    White: '#FFFFFF',
    Navy: '#1e40af',
    Gray: '#6b7280',
  };

  return (
    <>
      <Navigation />
      <div ref={containerRef} className="min-h-screen bg-gradient-to-br from-background via-muted/5 to-background pt-20 pb-16 relative overflow-hidden">
        {/* Animated Background */}
        <FloatingParticles count={22} />
        <motion.div
          className="absolute top-1/4 left-1/6 w-48 h-48 bg-gradient-to-br from-blue-500/8 to-cyan-500/4 rounded-full blur-3xl z-0"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.6, 0.3],
            x: [0, 25, 0],
            y: [0, -15, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-1/3 right-1/4 w-36 h-36 bg-gradient-to-br from-purple-500/8 to-pink-500/4 rounded-full blur-2xl z-0"
          animate={{
            scale: [1.1, 1, 1.1],
            opacity: [0.4, 0.7, 0.4],
            x: [0, -20, 0],
            y: [0, 20, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 3
          }}
        />
        {/* Breadcrumb */}
        <div className="max-w-7xl mx-auto px-6 mb-6">
          <motion.div
            className="flex items-center gap-2 text-sm text-muted-foreground"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <button onClick={() => navigate('/')} className="hover:text-primary transition-colors">
              Home
            </button>
            <ChevronRight className="w-4 h-4" />
            <button onClick={() => navigate('/collection/t-shirts')} className="hover:text-primary transition-colors">
              {product.category || 'Products'}
            </button>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground">{product.name}</span>
          </motion.div>
        </div>

        <div className="max-w-7xl mx-auto px-6">
          {/* Back Button */}
        <motion.button
          onClick={() => navigate(-1)}
            className="group flex items-center gap-2 mb-8 p-3 bg-background/80 backdrop-blur-sm rounded-lg border border-border/50 hover:border-primary/50 transition-all"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            whileHover={{ scale: 1.02 }}
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back</span>
        </motion.button>

      {/* Main Product Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          
            {/* Product Images */}
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
              {/* View Toggle */}
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-muted rounded-lg p-1 flex">
                  <button
                    onClick={() => setSelectedImageView('2d')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      selectedImageView === '2d' 
                        ? 'bg-background text-foreground shadow-sm' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    2D View
                  </button>
                  <button
                    onClick={() => setSelectedImageView('3d')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      selectedImageView === '3d' 
                        ? 'bg-background text-foreground shadow-sm' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    360° View
                  </button>
                </div>
              </div>

              {/* Main Image Display */}
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  {selectedImageView === '2d' ? (
                    <div className="relative group">
                      <motion.img
                        src={enhancedProduct.gallery[currentImageIndex]}
                        alt={product.name}
                        className="w-full aspect-square object-cover cursor-zoom-in"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.3 }}
                        onClick={() => setZoomedImage(enhancedProduct.gallery[currentImageIndex])}
                      />
                      
                      {/* Image Navigation */}
                      {enhancedProduct.gallery.length > 1 && (
                        <>
                          <button
                            onClick={() => setCurrentImageIndex(prev => 
                              prev === 0 ? enhancedProduct.gallery.length - 1 : prev - 1
                            )}
                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <ChevronLeft className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => setCurrentImageIndex(prev => 
                              prev === enhancedProduct.gallery.length - 1 ? 0 : prev + 1
                            )}
                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </button>
                        </>
                      )}
                      
                      {/* Zoom Icon */}
                      <div className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ZoomIn className="w-4 h-4" />
                  </div>
                  </div>
                  ) : (
                    <div className="h-[500px]">
                      <ProductViewer3D
                        productImages={enhancedProduct.gallery}
                        productName={enhancedProduct.name}
                        selectedColor={enhancedProduct.colors?.[selectedColor]}
                      />
            </div>
                  )}
                </CardContent>
              </Card>

              {/* Thumbnail Gallery */}
              {selectedImageView === '2d' && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {enhancedProduct.gallery.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        currentImageIndex === index 
                          ? 'border-primary' 
                          : 'border-border hover:border-muted-foreground'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                ))}
              </div>
              )}
          </motion.div>

            {/* Product Information */}
          <motion.div 
            className="space-y-8"
            initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {/* Product Header */}
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <Badge variant="secondary" className="mb-2">
                      {product.category}
                    </Badge>
                    <h1 className="text-3xl md:text-4xl font-bold">{product.name}</h1>
                    
                    {/* Reviews */}
                    <div className="flex items-center gap-3 mt-3">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(enhancedProduct.reviews.average)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {enhancedProduct.reviews.average} ({enhancedProduct.reviews.total} reviews)
                  </span>
                    </div>
              </div>
              
                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsWishlisted(!isWishlisted)}
                      className="relative"
                    >
                      <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
                    </Button>
                    
                    <div className="relative">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShareMenuOpen(!shareMenuOpen)}
                      >
                        <Share2 className="w-5 h-5" />
                      </Button>
                      
                      {/* Share Menu */}
                      <AnimatePresence>
                        {shareMenuOpen && (
                <motion.div
                            className="absolute right-0 top-full mt-2 bg-background border rounded-lg shadow-lg p-3 z-50"
                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                          >
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleShare('copy')}
                                className="h-8 w-8"
                              >
                                <Copy className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleShare('facebook')}
                                className="h-8 w-8"
                              >
                                <Facebook className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleShare('twitter')}
                                className="h-8 w-8"
                              >
                                <Twitter className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleShare('instagram')}
                                className="h-8 w-8"
                              >
                                <Instagram className="w-4 h-4" />
                              </Button>
                    </div>
                </motion.div>
                        )}
                      </AnimatePresence>
              </div>
                  </div>
                </div>

                {/* Price */}
                <div className="flex items-center gap-4">
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-bold">${product.price}</span>
                    <span className="text-xl text-muted-foreground line-through">
                      ${enhancedProduct.originalPrice}
                  </span>
                    <Badge variant="destructive" className="text-xs">
                      {enhancedProduct.discount}% OFF
                    </Badge>
                  </div>
                </div>
                
                {/* Stock Status */}
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-green-600">
                    {enhancedProduct.inStock} items in stock
                  </span>
                </div>
              </div>

              <Separator />

              {/* Product Description */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">About this product</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
            </div>

            {/* Color Selection */}
              {enhancedProduct.colors && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    <h3 className="text-lg font-semibold">
                      Color: {enhancedProduct.colors[selectedColor]}
                    </h3>
                  </div>
                  <div className="flex gap-2">
                    {enhancedProduct.colors.map((color, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedColor(index)}
                        className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                          selectedColor === index 
                            ? 'border-primary ring-2 ring-primary/40 scale-110' 
                            : 'border-border hover:border-primary/60'
                        }`}
                        style={{ backgroundColor: colorMap[color] || '#000' }}
                        title={color}
                      >
                        {selectedColor === index && (
                          <Check className="w-4 h-4 text-white" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
            )}

            {/* Size Selection */}
              {enhancedProduct.sizes && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Ruler className="w-4 h-4" />
                      <h3 className="text-lg font-semibold">Size</h3>
                    </div>
                    <Button
                      variant="link"
                      className="text-sm p-0 h-auto"
                      onClick={() => setShowSizeGuide(true)}
                    >
                      Size Guide
                    </Button>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {enhancedProduct.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-2 py-1 rounded border text-xs font-medium transition-all focus:outline-none focus:ring-2 focus:ring-primary/40 ${
                          selectedSize === size 
                            ? 'border-primary bg-primary text-primary-foreground scale-105 shadow' 
                            : 'border-border bg-background hover:border-primary/60 hover:bg-muted'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Quantity</h3>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="text-lg font-medium min-w-[3rem] text-center">
                    {quantity}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(quantity + 1)}
                    disabled={quantity >= 10}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Add to Cart */}
              <div className="space-y-4">
                <Button 
                  onClick={handleAddToCart}
                  className="w-full h-12 text-lg font-semibold"
                  size="lg"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Add to Cart - ${(product.price * quantity).toFixed(2)}
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full h-12"
                  size="lg"
                >
                  <Gift className="w-5 h-5 mr-2" />
                  Buy as Gift
                </Button>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-2 gap-4 pt-6">
                {trustBadges.map((badge, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                    <badge.icon className="w-5 h-5 text-primary flex-shrink-0" />
                        <div>
                      <div className="text-sm font-medium">{badge.text}</div>
                      <div className="text-xs text-muted-foreground">{badge.desc}</div>
                        </div>
                      </div>
                ))}
                        </div>
            </motion.div>
                      </div>

          {/* Product Details Tabs */}
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, y: 50 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {/* Tab Navigation */}
            <div className="border-b">
              <div className="flex gap-8 overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 pb-4 border-b-2 transition-colors whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
                      </div>
                    </div>

            {/* Tab Content */}
            <div className="min-h-[400px]">
              {activeTab === 'description' && (
                <motion.div
                  className="space-y-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="prose max-w-none">
                    <h3 className="text-xl font-semibold mb-4">Product Description</h3>
                    <p className="text-muted-foreground leading-relaxed mb-6">
                      Experience the perfect blend of style and comfort with our premium {product.name}. 
                      Crafted from the finest materials and designed with attention to every detail, 
                      this piece represents the pinnacle of streetwear fashion.
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                      Whether you're hitting the streets or making a statement at an event, 
                      this versatile piece adapts to your lifestyle while maintaining the 
                      authentic VLANCO aesthetic that sets you apart from the crowd.
                    </p>
                  </div>
                </motion.div>
              )}

              {activeTab === 'features' && (
            <motion.div 
                  className="space-y-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <h3 className="text-xl font-semibold">Key Features</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {enhancedProduct.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'specifications' && (
                <motion.div
                  className="space-y-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <h3 className="text-xl font-semibold">Technical Specifications</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Object.entries(enhancedProduct.specifications).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-center p-4 border rounded-lg">
                        <span className="font-medium text-muted-foreground">{key}</span>
                        <span className="font-semibold">{value}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'reviews' && (
                <motion.div
                  className="space-y-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  {/* Reviews Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold">Customer Reviews</h3>
                      <div className="flex items-center gap-4">
                        <div className="text-4xl font-bold">{enhancedProduct.reviews.average}</div>
                        <div>
                          <div className="flex items-center mb-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-5 h-5 ${
                                  i < Math.floor(enhancedProduct.reviews.average)
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Based on {enhancedProduct.reviews.total} reviews
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      {Object.entries(enhancedProduct.reviews.distribution).reverse().map(([stars, count]) => (
                        <div key={stars} className="flex items-center gap-3">
                          <span className="text-sm w-8">{stars}★</span>
                          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-yellow-400"
                              style={{ width: `${(count / enhancedProduct.reviews.total) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground w-8">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Sample Reviews */}
                  <div className="space-y-6">
                    {[
                      {
                        name: "Alex M.",
                        rating: 5,
                        date: "2 days ago",
                        review: "Amazing quality! The fit is perfect and the material feels premium. Definitely worth the price.",
                        verified: true
                      },
                      {
                        name: "Jordan K.",
                        rating: 4,
                        date: "1 week ago", 
                        review: "Great design and comfortable to wear. Only minor issue is it runs slightly small, so size up.",
                        verified: true
                      },
                      {
                        name: "Sam R.",
                        rating: 5,
                        date: "2 weeks ago",
                        review: "Love the style! Gets compliments every time I wear it. VLANCO never disappoints.",
                        verified: true
                      }
                    ].map((review, index) => (
                      <Card key={index}>
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium">{review.name}</span>
                                {review.verified && (
                                  <Badge variant="secondary" className="text-xs">
                                    <Check className="w-3 h-3 mr-1" />
                                    Verified
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`w-4 h-4 ${
                                        i < review.rating
                                          ? 'fill-yellow-400 text-yellow-400'
                                          : 'text-gray-300'
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span className="text-sm text-muted-foreground">{review.date}</span>
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <ThumbsUp className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MessageCircle className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          <p className="text-muted-foreground">{review.review}</p>
                        </CardContent>
                      </Card>
                    ))}
              </div>
            </motion.div>
              )}

              {activeTab === 'shipping' && (
            <motion.div
                  className="space-y-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Shipping Info */}
                    <div className="space-y-6">
                      <h3 className="text-xl font-semibold flex items-center gap-2">
                        <Truck className="w-5 h-5" />
                        Shipping Information
                      </h3>
                      <div className="space-y-4">
                        <div className="p-4 border rounded-lg">
                          <div className="font-medium mb-2">Free Standard Shipping</div>
                          <div className="text-sm text-muted-foreground mb-2">5-7 business days</div>
                          <div className="text-sm">Orders over $150</div>
                        </div>
                        <div className="p-4 border rounded-lg">
                          <div className="font-medium mb-2">Express Shipping - $15</div>
                          <div className="text-sm text-muted-foreground mb-2">2-3 business days</div>
                          <div className="text-sm">All orders</div>
                        </div>
                        <div className="p-4 border rounded-lg">
                          <div className="font-medium mb-2">Next Day Delivery - $25</div>
                          <div className="text-sm text-muted-foreground mb-2">1 business day</div>
                          <div className="text-sm">Orders placed before 2 PM</div>
                        </div>
                      </div>
                    </div>

                    {/* Returns Info */}
                    <div className="space-y-6">
                      <h3 className="text-xl font-semibold flex items-center gap-2">
                        <RotateCcw className="w-5 h-5" />
                        Returns & Exchanges
                      </h3>
                      <div className="space-y-4">
                        <div className="p-4 border rounded-lg">
                          <div className="font-medium mb-2">30-Day Returns</div>
                          <div className="text-sm text-muted-foreground">
                            Free returns on all orders. Items must be unworn with tags attached.
                </div>
                        </div>
                        <div className="p-4 border rounded-lg">
                          <div className="font-medium mb-2">Easy Exchanges</div>
                          <div className="text-sm text-muted-foreground">
                            Wrong size? Exchange for free within 30 days.
                          </div>
                        </div>
                        <div className="p-4 border rounded-lg">
                          <div className="font-medium mb-2">Quality Guarantee</div>
                          <div className="text-sm text-muted-foreground">
                            Not satisfied? Get a full refund, no questions asked.
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
            </motion.div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <motion.div 
              className="space-y-8"
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                <h2 className="text-2xl font-bold">You might also like</h2>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {relatedProducts.map((relatedProduct, index) => (
                  <Card 
                    key={relatedProduct.id} 
                    className="group cursor-pointer overflow-hidden"
                    onClick={() => navigate(`/product/${relatedProduct.id}`)}
                  >
                    <CardContent className="p-0">
                      <div className="relative overflow-hidden">
                        <img
                          src={relatedProduct.image}
                          alt={relatedProduct.name}
                          className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
                          {relatedProduct.name}
                        </h3>
                        <p className="text-muted-foreground text-sm truncate">
                          {relatedProduct.category}
                        </p>
                        <p className="font-bold mt-2">${relatedProduct.price}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}
      </div>

        {/* Image Zoom Modal */}
        <AnimatePresence>
          {zoomedImage && (
            <motion.div
              className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setZoomedImage(null)}
            >
              <motion.img
                src={zoomedImage}
                alt={product.name}
                className="max-w-full max-h-full object-contain"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.8 }}
                onClick={(e) => e.stopPropagation()}
              />
              <button
                onClick={() => setZoomedImage(null)}
                className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/70 transition-colors"
              >
                ×
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Size Guide Modal */}
      <AnimatePresence>
          {showSizeGuide && (
          <motion.div
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
              onClick={() => setShowSizeGuide(false)}
          >
            <motion.div
                className="bg-background rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold">Size Guide</h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowSizeGuide(false)}
                  >
                    ×
                  </Button>
                </div>
                
                <div className="space-y-6">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-3">Size</th>
                          <th className="text-left p-3">Chest (in)</th>
                          <th className="text-left p-3">Length (in)</th>
                          <th className="text-left p-3">Sleeve (in)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { size: 'XS', chest: '34-36', length: '26', sleeve: '24' },
                          { size: 'S', chest: '36-38', length: '27', sleeve: '25' },
                          { size: 'M', chest: '38-40', length: '28', sleeve: '26' },
                          { size: 'L', chest: '40-42', length: '29', sleeve: '27' },
                          { size: 'XL', chest: '42-44', length: '30', sleeve: '28' },
                          { size: 'XXL', chest: '44-46', length: '31', sleeve: '29' }
                        ].map((row) => (
                          <tr key={row.size} className="border-b">
                            <td className="p-3 font-medium">{row.size}</td>
                            <td className="p-3">{row.chest}</td>
                            <td className="p-3">{row.length}</td>
                            <td className="p-3">{row.sleeve}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    <p className="mb-2"><strong>How to measure:</strong></p>
                    <ul className="space-y-1">
                      <li>• <strong>Chest:</strong> Measure around the fullest part of your chest</li>
                      <li>• <strong>Length:</strong> Measure from shoulder to bottom hem</li>
                      <li>• <strong>Sleeve:</strong> Measure from shoulder seam to cuff</li>
                    </ul>
                  </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </>
  );
};

export default ProductDetail;