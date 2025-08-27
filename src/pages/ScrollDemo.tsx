import React from 'react';
import { AdvancedScrollExperience, ScrollHeroSection, StorytellingSection, ProductShowcase, ScrollCTA } from '../components/AdvancedScrollExperience';
import { motion } from 'framer-motion';

const ScrollDemo: React.FC = () => {
  const sampleProducts = [
    {
      id: '1',
      name: 'Cyberpunk Hoodie',
      image: '/api/placeholder/400/500',
      price: '$89.99'
    },
    {
      id: '2',
      name: 'Neon Street Tee',
      image: '/api/placeholder/400/500',
      price: '$49.99'
    },
    {
      id: '3',
      name: 'Futuristic Cap',
      image: '/api/placeholder/400/500',
      price: '$34.99'
    }
  ];

  const handleCTAClick = () => {
    console.log('CTA clicked - navigate to shop');
  };

  return (
    <AdvancedScrollExperience>
      {/* Hero Section */}
      <ScrollHeroSection
        backgroundImage="/api/placeholder/1920/1080"
        className="bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900"
      >
        <motion.div
          className="text-center space-y-8"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <h1 className="text-6xl lg:text-8xl font-bold text-white mb-6">
            VLANCO
          </h1>
          <p className="text-xl lg:text-2xl text-gray-300 max-w-3xl mx-auto">
            Experience the future of streetwear with our advanced scroll technology
          </p>
          <motion.button
            className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-semibold text-lg"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            Explore Collection
          </motion.button>
        </motion.div>
      </ScrollHeroSection>

      {/* Storytelling Section 1 */}
      <StorytellingSection
        title="Next-Gen Design"
        content="Our streetwear collection combines cutting-edge technology with urban aesthetics. Each piece is crafted with precision and designed for the digital age."
        image="/api/placeholder/600/400"
        className="bg-gradient-to-r from-gray-900 to-blue-900"
      />

      {/* Product Showcase */}
      <ProductShowcase
        products={sampleProducts}
        className="bg-gradient-to-br from-blue-900 to-purple-900"
      />

      {/* Storytelling Section 2 */}
      <StorytellingSection
        title="Premium Quality"
        content="We use only the finest materials and innovative manufacturing techniques to create streetwear that stands the test of time."
        image="/api/placeholder/600/400"
        reverse={true}
        className="bg-gradient-to-r from-purple-900 to-gray-900"
      />

      {/* Call to Action */}
      <ScrollCTA
        title="Join the Revolution"
        subtitle="Be part of the next generation of streetwear enthusiasts"
        buttonText="Shop Now"
        onButtonClick={handleCTAClick}
        className="bg-gradient-to-br from-gray-900 via-cyan-900 to-blue-900"
      />
    </AdvancedScrollExperience>
  );
};

export default ScrollDemo;
