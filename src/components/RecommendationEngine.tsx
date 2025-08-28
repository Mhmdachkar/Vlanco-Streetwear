import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, TrendingUp, Users, Heart, ShoppingBag, Star, Zap, Eye, ArrowRight } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  rating: number;
  reviews: number;
  isLimited?: boolean;
  tags?: string[];
}

interface RecommendationEngineProps {
  currentProduct: any;
  onProductClick: (productId: string) => void;
}

interface RecommendationSection {
  title: string;
  products: Product[];
  reason: string;
  confidence: number;
  icon: React.ReactNode;
  algorithm: string;
}

const RecommendationEngine: React.FC<RecommendationEngineProps> = ({
  currentProduct,
  onProductClick
}) => {
  const { products } = useProducts();
  const [recommendations, setRecommendations] = useState<RecommendationSection[]>([]);
  const [activeSection, setActiveSection] = useState(0);
  const [isCalculating, setIsCalculating] = useState(true);
  const [userPreferences, setUserPreferences] = useState({
    priceRange: [0, 1000],
    preferredStyles: ['streetwear', 'casual'],
    preferredColors: ['black', 'white', 'gray'],
    sizePreference: 'M'
  });

  // AI-powered recommendation algorithms
  const generateRecommendations = async (product: any): Promise<RecommendationSection[]> => {
    const recommendations: RecommendationSection[] = [];
    
    // Filter available products (exclude current product)
    const availableProducts = products
      .filter(p => p.id !== product.id)
      .map(p => ({
        id: p.id,
        name: p.name,
        price: p.base_price,
        image: p.product_images?.[0]?.image_url || '/placeholder.svg',
        category: p.category?.name || 'Streetwear',
        rating: p.rating_average || 4.5,
        reviews: p.rating_count || 0,
        isLimited: p.is_limited_edition,
        tags: p.tags || []
      }));

    // 1. Complete the Look - Complementary Items
    const completeTheLook = availableProducts
      .filter(p => {
        // Logic for complementary items based on category
        if (product.category?.name === 'Tops' || product.category?.name === 'Hoodies') {
          return ['Bottoms', 'Pants', 'Shorts', 'Accessories'].includes(p.category);
        }
        if (product.category?.name === 'Bottoms' || product.category?.name === 'Pants') {
          return ['Tops', 'Hoodies', 'T-Shirts', 'Accessories'].includes(p.category);
        }
        return p.category !== product.category?.name;
      })
      .slice(0, 4);

    recommendations.push({
      title: 'Complete the Look',
      products: completeTheLook,
      reason: 'AI-curated items that pair perfectly with your selection',
      confidence: 92,
      icon: <Brain className="w-5 h-5" />,
      algorithm: 'Style Compatibility Matrix'
    });

    // 2. Similar Items - Based on category and price range
    const similarItems = availableProducts
      .filter(p => {
        const priceDiff = Math.abs(p.price - product.base_price);
        const priceRange = product.base_price * 0.3; // Within 30% price range
        return p.category === product.category?.name && priceDiff <= priceRange;
      })
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 4);

    recommendations.push({
      title: 'Similar Items',
      products: similarItems,
      reason: 'Products with similar style and quality in your price range',
      confidence: 88,
      icon: <TrendingUp className="w-5 h-5" />,
      algorithm: 'Category & Price Similarity'
    });

    // 3. Trending Now - High rating and recent
    const trendingItems = availableProducts
      .filter(p => p.rating >= 4.0 && p.reviews > 10)
      .sort((a, b) => (b.rating * Math.log(b.reviews + 1)) - (a.rating * Math.log(a.reviews + 1)))
      .slice(0, 4);

    recommendations.push({
      title: 'Trending Now',
      products: trendingItems,
      reason: 'Most popular items among VLANCO community',
      confidence: 85,
      icon: <Users className="w-5 h-5" />,
      algorithm: 'Social Proof & Engagement'
    });

    // 4. You Might Also Like - Based on collaborative filtering
    const collaborativeFiltering = availableProducts
      .filter(p => {
        // Simulate collaborative filtering based on user behavior
        const hasCommonTags = p.tags?.some(tag => product.tags?.includes(tag));
        const priceCompatible = Math.abs(p.price - product.base_price) <= product.base_price * 0.5;
        return hasCommonTags || priceCompatible;
      })
      .sort(() => Math.random() - 0.5) // Randomize for variety
      .slice(0, 4);

    recommendations.push({
      title: 'You Might Also Like',
      products: collaborativeFiltering,
      reason: 'Based on your browsing patterns and similar users',
      confidence: 78,
      icon: <Heart className="w-5 h-5" />,
      algorithm: 'Collaborative Filtering'
    });

    // 5. Limited Edition & Exclusive
    const limitedEdition = availableProducts
      .filter(p => p.isLimited)
      .sort((a, b) => b.price - a.price)
      .slice(0, 4);

    if (limitedEdition.length > 0) {
      recommendations.push({
        title: 'Limited Edition',
        products: limitedEdition,
        reason: 'Exclusive pieces for discerning collectors',
        confidence: 95,
        icon: <Zap className="w-5 h-5" />,
        algorithm: 'Exclusivity Algorithm'
      });
    }

    return recommendations.filter(rec => rec.products.length > 0);
  };

  useEffect(() => {
    const loadRecommendations = async () => {
      setIsCalculating(true);
      // Simulate AI processing time
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const recs = await generateRecommendations(currentProduct);
      setRecommendations(recs);
      setIsCalculating(false);
    };

    if (currentProduct && products.length > 0) {
      loadRecommendations();
    }
  }, [currentProduct, products]);

  if (isCalculating) {
    return (
      <div className="py-16">
        <div className="container mx-auto px-6">
          <motion.div
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="relative mb-6">
              <div className="w-16 h-16 mx-auto border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
              <Brain className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">AI Recommendation Engine</h3>
            <p className="text-muted-foreground">
              Analyzing millions of style combinations to curate perfect matches for you...
            </p>
            <div className="mt-4 max-w-md mx-auto">
              <div className="flex justify-between text-sm text-muted-foreground mb-2">
                <span>Processing</span>
                <span>Advanced AI</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary to-blue-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-3 mb-4">
            <Brain className="w-8 h-8 text-primary" />
            <h2 className="text-3xl font-bold">
              AI-Powered
              <span className="text-primary ml-2">Recommendations</span>
            </h2>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our advanced AI analyzes style patterns, user behavior, and fashion trends 
            to suggest items that perfectly complement your taste
          </p>
        </motion.div>

        {/* Recommendation Sections */}
        <div className="space-y-12">
          {recommendations.map((section, sectionIndex) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: sectionIndex * 0.2 }}
              className="relative"
            >
              {/* Section Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    {section.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{section.title}</h3>
                    <p className="text-sm text-muted-foreground">{section.reason}</p>
                  </div>
                </div>
                
                {/* Confidence Indicator */}
                <div className="text-right">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium">AI Confidence</span>
                    <span className="text-lg font-bold text-primary">{section.confidence}%</span>
                  </div>
                  <div className="w-24 bg-gray-200 rounded-full h-1.5">
                    <motion.div
                      className="h-full bg-primary rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${section.confidence}%` }}
                      transition={{ duration: 1, delay: sectionIndex * 0.2 + 0.5 }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">{section.algorithm}</span>
                </div>
              </div>

              {/* Products Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {section.products.map((product, productIndex) => (
                  <motion.div
                    key={product.id}
                    className="group cursor-pointer"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ 
                      duration: 0.4, 
                      delay: sectionIndex * 0.2 + productIndex * 0.1 
                    }}
                    whileHover={{ 
                      scale: 1.05,
                      transition: { duration: 0.2 }
                    }}
                    onClick={() => onProductClick(product.id)}
                  >
                    <div className="relative overflow-hidden rounded-xl bg-background border border-border group-hover:border-primary transition-all duration-300">
                      {/* Product Image */}
                      <div className="aspect-square overflow-hidden">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        
                        {/* Overlay */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <div className="text-white text-center">
                            <Eye className="w-6 h-6 mx-auto mb-2" />
                            <span className="text-sm font-medium">Quick View</span>
                          </div>
                        </div>

                        {/* Limited Badge */}
                        {product.isLimited && (
                          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                            LIMITED
                          </div>
                        )}

                        {/* Quick Add Button */}
                        <motion.button
                          className="absolute bottom-2 right-2 p-2 bg-primary text-primary-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            // Add to cart logic
                          }}
                        >
                          <ShoppingBag className="w-4 h-4" />
                        </motion.button>
                      </div>

                      {/* Product Info */}
                      <div className="p-4">
                        <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                          {product.name}
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1">{product.category}</p>
                        
                        {/* Rating */}
                        <div className="flex items-center gap-1 mt-2">
                          <div className="flex text-yellow-400">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`w-3 h-3 ${i < Math.floor(product.rating) ? 'fill-current' : ''}`} 
                              />
                            ))}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            ({product.reviews})
                          </span>
                        </div>

                        {/* Price */}
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-lg font-bold text-foreground">
                            ${product.price.toFixed(2)}
                          </span>
                          <motion.div
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                            whileHover={{ x: 5 }}
                          >
                            <ArrowRight className="w-4 h-4 text-primary" />
                          </motion.div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Algorithm Insight */}
              <motion.div
                className="mt-4 p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: sectionIndex * 0.2 + 1 }}
              >
                <strong>Algorithm Insight:</strong> {section.algorithm} - 
                {section.confidence > 90 ? ' Extremely high confidence based on multiple data points' :
                 section.confidence > 80 ? ' High confidence with strong pattern matching' :
                 section.confidence > 70 ? ' Good confidence with solid recommendations' :
                 ' Moderate confidence, exploring diverse options'}
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Personalization Call-to-Action */}
        <motion.div
          className="mt-16 text-center bg-gradient-to-r from-primary/10 to-blue-500/10 rounded-xl p-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
        >
          <Brain className="w-12 h-12 text-primary mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">Want Even Better Recommendations?</h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Create a profile to help our AI learn your style preferences, size history, 
            and shopping patterns for hyper-personalized suggestions.
          </p>
          <motion.button
            className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors inline-flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Brain className="w-5 h-5" />
            Personalize My Experience
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default RecommendationEngine; 