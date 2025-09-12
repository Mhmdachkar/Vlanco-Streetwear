import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import '@/styles/logo-responsive.css';

// Import both logo variants
import VlancoLogo1 from '@/assets/logo/vlanco_logo.jpg';
import VlancoLogo2 from '@/assets/logo/vlanco_logo1.jpg';

interface VlancoLogoProps {
  variant?: 'primary' | 'secondary';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  position?: 'header' | 'footer' | 'watermark' | 'hero' | 'inline';
  className?: string;
  animated?: boolean;
  clickable?: boolean;
  onClick?: () => void;
}

const VlancoLogo: React.FC<VlancoLogoProps> = ({
  variant = 'primary',
  size = 'md',
  position = 'inline',
  className = '',
  animated = true,
  clickable = false,
  onClick
}) => {
  // Select logo based on variant
  const logoSrc = variant === 'primary' ? VlancoLogo1 : VlancoLogo2;

  // Size configurations
  const sizeClasses = {
    xs: 'w-6 h-6 md:w-8 md:h-8',
    sm: 'w-8 h-8 md:w-10 md:h-10',
    md: 'w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14',
    lg: 'w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20',
    xl: 'w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24',
    xxl: 'w-20 h-20 md:w-28 md:h-28 lg:w-32 lg:h-32'
  };

  // Position-specific styling
  const positionStyles = {
    header: {
      container: 'cursor-pointer hover:scale-105 transition-transform duration-200',
      image: 'object-contain filter drop-shadow-sm'
    },
    footer: {
      container: 'opacity-80 hover:opacity-100 transition-opacity duration-300',
      image: 'object-contain filter grayscale hover:grayscale-0 transition-all duration-300'
    },
    watermark: {
      container: 'opacity-10 hover:opacity-20 transition-opacity duration-500 pointer-events-none',
      image: 'object-contain filter blur-[0.5px]'
    },
    hero: {
      container: 'drop-shadow-2xl hover:scale-105 transition-all duration-300',
      image: 'object-contain filter drop-shadow-lg'
    },
    inline: {
      container: 'inline-flex items-center justify-center',
      image: 'object-contain'
    }
  };

  const currentStyle = positionStyles[position];

  // Animation variants
  const animationVariants = {
    initial: { opacity: 0, scale: 0.8, rotate: -5 },
    animate: { 
      opacity: 1, 
      scale: 1, 
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 20,
        duration: 0.6
      }
    },
    hover: {
      scale: 1.05,
      rotate: 1,
      transition: { duration: 0.2 }
    },
    tap: {
      scale: 0.95,
      transition: { duration: 0.1 }
    }
  };

  const LogoComponent = animated ? motion.div : 'div';

  const animationProps = animated ? {
    initial: "initial",
    animate: "animate",
    whileHover: clickable ? "hover" : undefined,
    whileTap: clickable ? "tap" : undefined,
    variants: animationVariants
  } : {};

  return (
    <LogoComponent
      className={cn(
        'flex items-center justify-center',
        sizeClasses[size],
        currentStyle.container,
        clickable && 'cursor-pointer',
        className
      )}
      onClick={clickable ? onClick : undefined}
      {...animationProps}
    >
      <img
        src={logoSrc}
        alt="VLANCO Streetwear"
        className={cn(
          'w-full h-full rounded-lg vlanco-logo-base',
          currentStyle.image,
          position === 'header' && 'vlanco-header-logo',
          position === 'footer' && 'vlanco-footer-logo',
          position === 'watermark' && 'vlanco-watermark-logo',
          position === 'hero' && 'vlanco-hero-logo',
          position === 'inline' && `vlanco-inline-logo-${size}`,
          clickable && 'vlanco-logo-interactive'
        )}
        loading="lazy"
        decoding="async"
      />
    </LogoComponent>
  );
};

// Specialized logo components for specific use cases
export const HeaderLogo: React.FC<{ onClick?: () => void }> = ({ onClick }) => (
  <VlancoLogo
    variant="primary"
    size="md"
    position="header"
    animated={true}
    clickable={true}
    onClick={onClick}
    className="flex-shrink-0"
  />
);

export const FooterLogo: React.FC = () => (
  <VlancoLogo
    variant="secondary"
    size="lg"
    position="footer"
    animated={true}
    className="mx-auto"
  />
);

export const WatermarkLogo: React.FC<{ className?: string }> = ({ className }) => (
  <VlancoLogo
    variant="primary"
    size="xxl"
    position="watermark"
    animated={false}
    className={cn('absolute', className)}
  />
);

export const HeroLogo: React.FC<{ size?: 'lg' | 'xl' | 'xxl' }> = ({ size = 'xl' }) => (
  <VlancoLogo
    variant="primary"
    size={size}
    position="hero"
    animated={true}
    className="mx-auto"
  />
);

export const InlineLogo: React.FC<{ 
  variant?: 'primary' | 'secondary';
  size?: 'xs' | 'sm' | 'md';
  className?: string;
}> = ({ variant = 'primary', size = 'sm', className }) => (
  <VlancoLogo
    variant={variant}
    size={size}
    position="inline"
    animated={false}
    className={className}
  />
);

export default VlancoLogo;
