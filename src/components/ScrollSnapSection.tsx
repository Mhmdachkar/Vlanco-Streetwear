import React, { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useSpring, useInView } from 'framer-motion';
import { useSmoothScroll } from '../contexts/SmoothScrollContext';

interface ScrollSnapSectionProps {
  children: React.ReactNode;
  className?: string;
  snapType?: 'mandatory' | 'proximity';
  snapAlign?: 'start' | 'center' | 'end';
  height?: string;
  id?: string;
}

export const ScrollSnapSection: React.FC<ScrollSnapSectionProps> = ({
  children,
  className = '',
  snapType = 'mandatory',
  snapAlign = 'start',
  height = '100vh',
  id
}) => {
  const sectionRef = useRef<HTMLElement>(null);
  const [isInView, setIsInView] = useState(false);
  const { lenis } = useSmoothScroll();

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      {
        threshold: 0.5,
        rootMargin: '-10% 0px -10% 0px'
      }
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, []);

  return (
    <motion.section
      ref={sectionRef}
      id={id}
      className={`scroll-snap-section ${className}`}
      style={{
        height,
        scrollSnapAlign: snapAlign,
        scrollSnapType: 'y mandatory',
        scrollBehavior: 'smooth'
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: isInView ? 1 : 0.3 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      {children}
    </motion.section>
  );
};

// Scroll progress indicator
export const ScrollProgressIndicator: React.FC = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 to-blue-600 z-50 origin-left"
      style={{ scaleX }}
    />
  );
};

// Scroll snap container
export const ScrollSnapContainer: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Enable scroll snapping
    container.style.scrollSnapType = 'y mandatory';
    container.style.overflowY = 'auto';
    container.style.height = '100vh';

    // Add smooth scrolling behavior
    container.addEventListener('scroll', (e) => {
      e.preventDefault();
    }, { passive: false });

    return () => {
      container.removeEventListener('scroll', () => {});
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`scroll-snap-container ${className}`}
      style={{
        scrollSnapType: 'y mandatory',
        overflowY: 'auto',
        height: '100vh'
      }}
    >
      {children}
    </div>
  );
};

// Parallax container
export const ParallaxContainer: React.FC<{
  children: React.ReactNode;
  speed?: number;
  direction?: 'up' | 'down';
  className?: string;
}> = ({ children, speed = 0.5, direction = 'up', className = '' }) => {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 1000], [0, direction === 'up' ? -100 * speed : 100 * speed]);

  return (
    <motion.div
      className={`parallax-container ${className}`}
      style={{ y }}
    >
      {children}
    </motion.div>
  );
};

// Reveal animation wrapper
export const RevealAnimation: React.FC<{
  children: React.ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right';
  distance?: number;
  delay?: number;
  duration?: number;
  className?: string;
}> = ({
  children,
  direction = 'up',
  distance = 50,
  delay = 0,
  duration = 0.8,
  className = ''
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const getInitialPosition = () => {
    switch (direction) {
      case 'up': return { y: distance, opacity: 0 };
      case 'down': return { y: -distance, opacity: 0 };
      case 'left': return { x: distance, opacity: 0 };
      case 'right': return { x: -distance, opacity: 0 };
      default: return { y: distance, opacity: 0 };
    }
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={getInitialPosition()}
      animate={isInView ? { x: 0, y: 0, opacity: 1 } : getInitialPosition()}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
    >
      {children}
    </motion.div>
  );
};
