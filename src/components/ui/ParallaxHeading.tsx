import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface ParallaxHeadingProps {
  children: React.ReactNode;
  className?: string;
  offset?: number; // how much translateY at max (px)
}

// Desktop-only subtle parallax for headings/icons
const ParallaxHeading: React.FC<ParallaxHeadingProps> = ({ children, className = '', offset = 16 }) => {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 800], [0, -offset]);
  return (
    <motion.div
      className={`hidden md:block ${className}`}
      style={{ y }}
      transition={{ type: 'spring', stiffness: 80, damping: 20 }}
    >
      {children}
    </motion.div>
  );
};

export default ParallaxHeading;


