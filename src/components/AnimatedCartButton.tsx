import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Plus, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AnimatedCartButtonProps {
  onAddToCart: () => Promise<void>;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
  className?: string;
}

const AnimatedCartButton: React.FC<AnimatedCartButtonProps> = ({
  onAddToCart,
  disabled = false,
  size = 'md',
  variant = 'default',
  className = ''
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const createCartAnimation = () => {
    if (!buttonRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();
    const newParticles = Array.from({ length: 8 }, (_, i) => ({
      id: Date.now() + i,
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    }));

    setParticles(newParticles);

    // Create floating cart icon animation
    const cartIcon = document.createElement('div');
    cartIcon.innerHTML = '🛒';
    cartIcon.style.cssText = `
      position: fixed;
      left: ${rect.left + rect.width / 2}px;
      top: ${rect.top + rect.height / 2}px;
      font-size: 24px;
      z-index: 9999;
      pointer-events: none;
      transform: translate(-50%, -50%);
    `;
    document.body.appendChild(cartIcon);

    // Find cart icon in navigation (approximate position)
    const navCartIcon = document.querySelector('[data-cart-icon]') || 
                       document.querySelector('nav [class*="cart"]') ||
                       { getBoundingClientRect: () => ({ left: window.innerWidth - 100, top: 20 }) };
    
    const targetRect = navCartIcon.getBoundingClientRect();

    // Animate to cart position
    cartIcon.animate([
      {
        left: `${rect.left + rect.width / 2}px`,
        top: `${rect.top + rect.height / 2}px`,
        transform: 'translate(-50%, -50%) scale(1)',
        opacity: '1'
      },
      {
        left: `${targetRect.left + targetRect.width / 2}px`,
        top: `${targetRect.top + targetRect.height / 2}px`,
        transform: 'translate(-50%, -50%) scale(0.5)',
        opacity: '0.8'
      },
      {
        left: `${targetRect.left + targetRect.width / 2}px`,
        top: `${targetRect.top + targetRect.height / 2}px`,
        transform: 'translate(-50%, -50%) scale(0)',
        opacity: '0'
      }
    ], {
      duration: 1000,
      easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
    }).onfinish = () => {
      document.body.removeChild(cartIcon);
      
      // Animate cart icon bounce
      const navIcon = document.querySelector('[data-cart-icon]') || 
                     document.querySelector('nav [class*="cart"]');
      if (navIcon) {
        navIcon.animate([
          { transform: 'scale(1)' },
          { transform: 'scale(1.2)' },
          { transform: 'scale(1)' }
        ], {
          duration: 300,
          easing: 'ease-out'
        });
      }
    };

    // Clear particles after animation
    setTimeout(() => {
      setParticles([]);
    }, 1500);
  };

  const handleClick = async () => {
    if (disabled || isLoading) return;

    setIsLoading(true);
    
    try {
      createCartAnimation();
      await onAddToCart();
      
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
      }, 2000);
    } catch (error) {
      console.error('Add to cart failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sizeClasses = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4 text-base',
    lg: 'h-12 px-6 text-lg'
  };

  return (
    <>
      <Button
        ref={buttonRef}
        onClick={handleClick}
        disabled={disabled || isLoading}
        variant={variant}
        size={size}
        className={`relative overflow-hidden transition-all duration-300 ${sizeClasses[size]} ${className}`}
      >
        <motion.div
          className="flex items-center gap-2"
          animate={isLoading ? { scale: 0.9 } : { scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          <AnimatePresence mode="wait">
            {isSuccess ? (
              <motion.div
                key="success"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 180 }}
                transition={{ duration: 0.3 }}
              >
                <Check className="w-4 h-4" />
              </motion.div>
            ) : isLoading ? (
              <motion.div
                key="loading"
                initial={{ scale: 0 }}
                animate={{ scale: 1, rotate: 360 }}
                exit={{ scale: 0 }}
                transition={{ 
                  duration: 0.3,
                  rotate: { duration: 1, repeat: Infinity, ease: "linear" }
                }}
              >
                <ShoppingCart className="w-4 h-4" />
              </motion.div>
            ) : (
              <motion.div
                key="default"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Plus className="w-4 h-4" />
              </motion.div>
            )}
          </AnimatePresence>
          
          <span className="font-medium">
            {isSuccess ? 'Added!' : isLoading ? 'Adding...' : 'Add to Cart'}
          </span>
        </motion.div>

        {/* Button glow effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0"
          animate={isLoading ? { opacity: [0, 0.5, 0] } : { opacity: 0 }}
          transition={{ duration: 1, repeat: isLoading ? Infinity : 0 }}
        />
      </Button>

      {/* Floating particles */}
      <AnimatePresence>
        {particles.map(particle => (
          <motion.div
            key={particle.id}
            className="fixed w-2 h-2 bg-blue-500 rounded-full pointer-events-none z-[9999]"
            style={{
              left: particle.x,
              top: particle.y,
            }}
            initial={{ 
              scale: 0,
              x: 0,
              y: 0,
              opacity: 1
            }}
            animate={{ 
              scale: [0, 1, 0],
              x: (Math.random() - 0.5) * 100,
              y: (Math.random() - 0.5) * 100 - 50,
              opacity: [1, 0.8, 0]
            }}
            exit={{ opacity: 0 }}
            transition={{ 
              duration: 1.5,
              ease: "easeOut"
            }}
          />
        ))}
      </AnimatePresence>
    </>
  );
};

export default AnimatedCartButton;
