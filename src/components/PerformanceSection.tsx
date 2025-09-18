import React, { ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useLazyLoad } from '@/hooks/useLazyLoad';

interface PerformanceSectionProps {
  children: ReactNode;
  className?: string;
  id?: string;
  delay?: number;
  duration?: number;
  threshold?: number;
  rootMargin?: string;
  animationType?: 'fade' | 'slideUp' | 'slideLeft' | 'slideRight' | 'scale' | 'none';
  performanceMode?: boolean;
}

const PerformanceSection: React.FC<PerformanceSectionProps> = ({
  children,
  className = '',
  id,
  delay = 0,
  duration = 0.6,
  threshold = 0.1,
  rootMargin = '100px',
  animationType = 'fade',
  performanceMode = false
}) => {
  const shouldReduceMotion = useReducedMotion();
  const { elementRef, isInView } = useLazyLoad({
    threshold,
    rootMargin,
    triggerOnce: true
  });

  // Disable animations on performance mode or reduced motion
  const disableAnimations = performanceMode || shouldReduceMotion;

  const getAnimationVariants = () => {
    if (disableAnimations || animationType === 'none') {
      return {
        hidden: { opacity: 1 },
        visible: { opacity: 1 }
      };
    }

    switch (animationType) {
      case 'slideUp':
        return {
          hidden: { opacity: 0, y: 30 },
          visible: { opacity: 1, y: 0 }
        };
      case 'slideLeft':
        return {
          hidden: { opacity: 0, x: -30 },
          visible: { opacity: 1, x: 0 }
        };
      case 'slideRight':
        return {
          hidden: { opacity: 0, x: 30 },
          visible: { opacity: 1, x: 0 }
        };
      case 'scale':
        return {
          hidden: { opacity: 0, scale: 0.95 },
          visible: { opacity: 1, scale: 1 }
        };
      case 'fade':
      default:
        return {
          hidden: { opacity: 0 },
          visible: { opacity: 1 }
        };
    }
  };

  const variants = getAnimationVariants();

  return (
    <motion.section
      ref={elementRef}
      id={id}
      className={className}
      initial="hidden"
      animate="visible"
      variants={variants}
      transition={{
        duration: disableAnimations ? 0.1 : duration,
        delay: disableAnimations ? 0 : delay,
        ease: "easeOut"
      }}
    >
      {children}
    </motion.section>
  );
};

export default PerformanceSection;
