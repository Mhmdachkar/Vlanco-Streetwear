import React, { useRef, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { useGSAPScrollTrigger, useStorytellingAnimation } from '../hooks/useGSAPScrollTrigger';
import { useScrollAnimation, useParallax, useScrollProgress } from '../hooks/useScrollAnimation';
import { ScrollSnapSection, ScrollProgressIndicator, ParallaxContainer, RevealAnimation } from './ScrollSnapSection';
import OptimizedImage from './OptimizedImage';

interface AdvancedScrollExperienceProps {
  children: React.ReactNode;
  className?: string;
}

export const AdvancedScrollExperience: React.FC<AdvancedScrollExperienceProps> = ({
  children,
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const { createParallaxLayer, createRevealAnimation } = useStorytellingAnimation();
  const scrollProgress = useScrollProgress();

  // Create smooth scroll progress indicator
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    // Initialize GSAP ScrollTrigger
    const { refresh } = useGSAPScrollTrigger();
    refresh();

    // Create parallax layers
    createParallaxLayer('.parallax-bg', 0.3, 'up');
    createParallaxLayer('.parallax-mid', 0.6, 'up');
    createParallaxLayer('.parallax-front', 0.9, 'up');

    // Create reveal animations
    createRevealAnimation('.reveal-up', { direction: 'up', distance: 100 });
    createRevealAnimation('.reveal-left', { direction: 'left', distance: 100 });
    createRevealAnimation('.reveal-right', { direction: 'right', distance: 100 });

    return () => {
      // Cleanup
    };
  }, []);

  return (
    <div ref={containerRef} className={`advanced-scroll-experience ${className}`}>
      {/* Scroll Progress Indicator */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 z-50 origin-left"
        style={{ scaleX }}
      />
      
      {/* Scroll Progress Percentage */}
      <motion.div
        className="fixed top-4 right-4 text-sm font-mono text-white bg-black/50 px-3 py-1 rounded-full z-50"
        style={{
          opacity: useTransform(scrollYProgress, [0, 0.1, 0.9, 1], [0, 1, 1, 0])
        }}
      >
        {Math.round(scrollProgress)}%
      </motion.div>

      {children}
    </div>
  );
};

// Hero section with advanced scroll effects
export const ScrollHeroSection: React.FC<{
  children: React.ReactNode;
  backgroundImage?: string;
  className?: string;
}> = ({ children, backgroundImage, className = '' }) => {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 1000], [0, -300]);
  const opacity = useTransform(scrollY, [0, 500], [1, 0]);
  const scale = useTransform(scrollY, [0, 500], [1, 1.1]);

  return (
    <ScrollSnapSection
      className={`relative overflow-hidden ${className}`}
      height="100vh"
      snapAlign="start"
    >
      {/* Parallax Background */}
      <motion.div
        className="absolute inset-0 parallax-bg"
        style={{
          backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          y,
          scale
        }}
      />
      
      {/* Overlay */}
      <motion.div
        className="absolute inset-0 bg-black/40"
        style={{ opacity }}
      />
      
      {/* Content */}
      <div className="relative z-10 flex items-center justify-center h-full">
        {children}
      </div>
    </ScrollSnapSection>
  );
};

// Storytelling section with scroll-triggered animations
export const StorytellingSection: React.FC<{
  title: string;
  content: string;
  image?: string;
  reverse?: boolean;
  className?: string;
}> = ({ title, content, image, reverse = false, className = '' }) => {
  const { ref, isInView } = useScrollAnimation({ threshold: 0.3 });

  return (
    <ScrollSnapSection
      className={`py-20 ${className}`}
      height="100vh"
      snapAlign="center"
    >
      <div className="container mx-auto px-4">
        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${reverse ? 'lg:grid-flow-col-dense' : ''}`}>
          {/* Content */}
          <motion.div
            ref={ref}
            className={`space-y-6 ${reverse ? 'lg:col-start-2' : ''}`}
            initial={{ opacity: 0, x: reverse ? 100 : -100 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <h2 className="text-4xl lg:text-6xl font-bold text-white">
              {title}
            </h2>
            <p className="text-lg text-gray-300 leading-relaxed">
              {content}
            </p>
          </motion.div>

          {/* Image */}
          {image && (
            <motion.div
              className={`relative ${reverse ? 'lg:col-start-1' : ''}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
            >
              <div className="relative overflow-hidden rounded-2xl">
                <OptimizedImage
                  src={image}
                  alt={title}
                  className="w-full h-96 object-cover parallax-mid"
                  priority={false}
                  lazy={true}
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </ScrollSnapSection>
  );
};

// Product showcase with 3D effects
export const ProductShowcase: React.FC<{
  products: Array<{
    id: string;
    name: string;
    image: string;
    price: string;
  }>;
  className?: string;
}> = ({ products, className = '' }) => {
  const { ref, isInView } = useScrollAnimation({ threshold: 0.2 });

  return (
    <ScrollSnapSection
      className={`py-20 ${className}`}
      height="100vh"
      snapAlign="center"
    >
      <div className="container mx-auto px-4">
        <motion.div
          ref={ref}
          className="text-center mb-16"
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-5xl font-bold text-white mb-4">
            Featured Collection
          </h2>
          <p className="text-xl text-gray-300">
            Discover our latest streetwear pieces
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              className="group cursor-pointer"
              initial={{ opacity: 0, y: 100 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -10, scale: 1.02 }}
            >
              <div className="relative overflow-hidden rounded-2xl bg-gray-900">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {product.name}
                  </h3>
                  <p className="text-cyan-400 font-bold text-lg">
                    {product.price}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </ScrollSnapSection>
  );
};

// Call to action with scroll-triggered effects
export const ScrollCTA: React.FC<{
  title: string;
  subtitle: string;
  buttonText: string;
  onButtonClick: () => void;
  className?: string;
}> = ({ title, subtitle, buttonText, onButtonClick, className = '' }) => {
  const { ref, isInView } = useScrollAnimation({ threshold: 0.3 });

  return (
    <ScrollSnapSection
      className={`py-20 ${className}`}
      height="100vh"
      snapAlign="center"
    >
      <div className="container mx-auto px-4 text-center">
        <motion.div
          ref={ref}
          className="max-w-4xl mx-auto space-y-8"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <h2 className="text-5xl lg:text-7xl font-bold text-white">
            {title}
          </h2>
          <p className="text-xl text-gray-300">
            {subtitle}
          </p>
          <motion.button
            className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-semibold text-lg hover:from-cyan-600 hover:to-blue-700 transition-all duration-300"
            onClick={onButtonClick}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            {buttonText}
          </motion.button>
        </motion.div>
      </div>
    </ScrollSnapSection>
  );
};
