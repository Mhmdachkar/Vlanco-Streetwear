import React, { useState, useRef, useEffect } from 'react';
import { motion, useInView, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { 
  ArrowLeft, Heart, Share2, ShoppingCart, Star, ChevronLeft, ChevronRight,
  Shield, Truck, RotateCcw, Award, Zap, Check, Info, Package, Sparkles,
  Eye, Timer, Plus, Minus, ZoomIn, ZoomOut, Facebook, Twitter, Instagram, Copy,
  Gift, CreditCard, Lock, ThumbsUp, MessageCircle, Users, TrendingUp,
  Globe, Ruler, Palette, Volume2, VolumeX, Play, Pause, RotateCw,
  Maximize, ShoppingBag, Flame, Target, Headphones, Camera, Music,
  Layers, Command, Hexagon, Triangle, Square, Circle, X, ArrowUpRight
} from 'lucide-react';
import Navigation from '@/components/Navigation';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { useAuth } from '@/hooks/useAuth';
import { useAnalytics } from '@/hooks/useAnalytics';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { validateQuantity, logSecurityEvent } from '@/utils/security';
import AuthModal from '@/components/AuthModal';
import AnimatedCartButton from '@/components/AnimatedCartButton';

// Local product images from assets folder
// Guard against early references during build-time evaluation
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const product: any = (globalThis as any).__pd_placeholder || undefined;

const productImages = [
  "/src/assets/product-1.jpg",
  "/src/assets/product-2.jpg", 
  "/src/assets/product-3.jpg",
  "/src/assets/product-4.jpg",
  "/src/assets/product-5.jpg"
];

// Glitch Button Component
const GlitchButton = ({ children, onClick, variant = 'primary', className = '', disabled = false, size = 'default', pulse = false }) => {
  const [isGlitching, setIsGlitching] = useState(false);
  const [particles, setParticles] = useState([]);

  const handleClick = (e) => {
    if (disabled) return;
    
    setIsGlitching(true);
    
    // Create particles
    const rect = e.currentTarget.getBoundingClientRect();
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: Date.now() + i,
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
      vx: (Math.random() - 0.5) * 400,
      vy: (Math.random() - 0.5) * 400,
      life: 1
    }));
    
    setParticles(newParticles);
    
    setTimeout(() => {
      setIsGlitching(false);
      setParticles([]);
    }, 800);
    
    if (onClick) onClick(e);
  };

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    default: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
    xl: 'px-10 py-5 text-xl font-black'
  };

  const variants = {
    primary: `
      bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 
      hover:from-cyan-400 hover:via-blue-500 hover:to-purple-500
      text-white shadow-2xl border-2 border-cyan-400/50
      hover:border-cyan-300/80 hover:shadow-cyan-500/50
    `,
    neon: `
      bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500
      hover:from-pink-400 hover:via-red-400 hover:to-yellow-400
      text-white shadow-2xl border-2 border-pink-400/50
      hover:border-pink-300/80 hover:shadow-pink-500/50
    `,
    cyber: `
      bg-gradient-to-r from-green-500 via-teal-500 to-blue-500
      hover:from-green-400 hover:via-teal-400 hover:to-blue-400
      text-black font-black shadow-2xl border-2 border-green-400/50
      hover:border-green-300/80 hover:shadow-green-500/50
    `,
    ghost: `
      bg-transparent border-2 border-white/30 text-white
      hover:bg-white/10 hover:border-white/60
      backdrop-blur-xl
    `
  };

  // URL preselect will be handled inside the main product component where state exists

  return (
    <>
      <motion.button
        className={`
          relative overflow-hidden font-bold rounded-xl transition-all duration-300
          transform-gpu focus:outline-none focus:ring-4 focus:ring-cyan-500/50
          ${sizeClasses[size]} ${variants[variant]} ${className}
        `}
        onMouseDown={() => setIsGlitching(true)}
        onMouseUp={() => setIsGlitching(false)}
        onMouseLeave={() => setIsGlitching(false)}
        onClick={handleClick}
        disabled={disabled}
        animate={{
          boxShadow: isGlitching ? [
            '0 0 20px rgba(6, 182, 212, 0.6)',
            '0 0 30px rgba(6, 182, 212, 0.8)',
            '0 0 20px rgba(6, 182, 212, 0.6)'
          ] : pulse ? [
            '0 0 0px rgba(6, 182, 212, 0)',
            '0 0 20px rgba(6, 182, 212, 0.4)',
            '0 0 0px rgba(6, 182, 212, 0)'
          ] : undefined,
          scale: isGlitching ? [1, 1.01, 0.99, 1] : 1
        }}
        transition={{ duration: pulse ? 2 : 0.2, repeat: pulse ? Infinity : 0 }}
        whileHover={{ 
          scale: 1.02,
          y: -1,
          filter: 'brightness(1.1)'
        }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Subtle glitch overlay */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-transparent to-blue-500/10 mix-blend-overlay"
          animate={{
            x: isGlitching ? [-1, 1, 0] : 0,
            opacity: isGlitching ? [0, 0.5, 0] : 0
          }}
          transition={{ duration: 0.1, repeat: isGlitching ? 2 : 0 }}
        />
        
        {/* Subtle scanlines */}
        <motion.div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `repeating-linear-gradient(
              90deg,
              transparent,
              transparent 3px,
              rgba(255,255,255,0.05) 3px,
              rgba(255,255,255,0.05) 6px
            )`
          }}
          animate={{
            opacity: isGlitching ? [0.05, 0.1, 0.05] : 0.05
          }}
          transition={{ duration: 0.2, repeat: isGlitching ? 2 : 0 }}
        />

        {/* Content with subtle effect */}
        <motion.div
          className="relative z-10 flex items-center justify-center"
          animate={{
            x: isGlitching ? [-0.5, 0.5, 0] : 0
          }}
          transition={{ duration: 0.1, repeat: isGlitching ? 1 : 0 }}
        >
          {children}
        </motion.div>

        {/* Glow effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
          initial={{ x: '-100%' }}
          whileHover={{ x: '200%' }}
          transition={{ duration: 0.8 }}
        />
      </motion.button>

      {/* Particles */}
      {particles.map(particle => (
        <motion.div
          key={particle.id}
          className="fixed w-2 h-2 bg-cyan-400 rounded-full pointer-events-none z-50"
          initial={{ x: particle.x, y: particle.y, scale: 1, opacity: 1 }}
          animate={{
            x: particle.x + particle.vx,
            y: particle.y + particle.vy,
            scale: 0,
            opacity: 0
          }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      ))}
    </>
  );
};

// Holographic Card Component
const HoloCard = ({ children, className = '', glowColor = 'cyan' }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setMousePosition({ x, y });
  };

  const glowColors = {
    cyan: 'shadow-cyan-500/20 border-cyan-500/30',
    pink: 'shadow-pink-500/20 border-pink-500/30',
    purple: 'shadow-purple-500/20 border-purple-500/30',
    green: 'shadow-green-500/20 border-green-500/30'
  };

  return (
    <motion.div
      ref={cardRef}
      className={`
        relative overflow-hidden backdrop-blur-xl bg-black/20 
        border border-white/10 rounded-2xl transition-all duration-300 ease-out
        hover:${glowColors[glowColor]} hover:shadow-2xl hover:scale-[1.01]
        ${className}
      `}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setMousePosition({ x: 0.5, y: 0.5 })}
      whileHover={{ y: -2, scale: 1.01 }}
      style={{
        background: `
          radial-gradient(
            600px circle at ${mousePosition.x * 100}% ${mousePosition.y * 100}%,
            rgba(255,255,255,0.1) 0%,
            transparent 40%
          ),
          linear-gradient(135deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.1) 100%)
        `
      }}
    >
             {/* Subtle shine overlay */}
      <motion.div
         className="absolute inset-0 opacity-10"
        style={{
           background: `linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)`
        }}
        animate={{
           x: ['-100%', '200%']
        }}
         transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
};

// Cyber Progress Bar
const CyberProgress = ({ value, max = 100, label, color = 'cyan' }) => {
  const percentage = (value / max) * 100;
  
  const colors = {
    cyan: 'from-cyan-500 to-blue-500',
    pink: 'from-pink-500 to-purple-500',
    green: 'from-green-500 to-emerald-500'
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm font-medium">
        <span>{label}</span>
        <span className="text-cyan-400">{value}/{max}</span>
      </div>
      <div className="relative h-3 bg-gray-800 rounded-full overflow-hidden border border-gray-600">
        <motion.div
          className={`h-full bg-gradient-to-r ${colors[color]} relative`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
                     {/* Subtle shine */}
          <motion.div
             className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
            animate={{ x: ['-100%', '200%'] }}
             transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
      </div>
    </div>
  );
};

// Smooth Floating Element
const FloatingElement = ({ children, className = "", delay = 0 }) => {
  return (
    <motion.div
      className={className}
      animate={{
        y: [-5, 5, -5],
        scale: [1, 1.02, 1]
      }}
      transition={{
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut",
        delay
      }}
    >
      {children}
    </motion.div>
  );
};

// Enhanced Floating Cart Indicator
const FloatingCartIndicator = ({ itemCount, onClick, isVisible }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed bottom-8 right-8 z-50"
          initial={{ opacity: 0, scale: 0, y: 100 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0, y: 100 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <motion.button
            onClick={onClick}
            className="relative w-16 h-16 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full shadow-2xl border-2 border-cyan-400/50 hover:border-cyan-300/80 transition-all duration-300 group"
            whileHover={{ 
              scale: 1.1, 
              y: -5,
              boxShadow: "0 20px 40px rgba(6, 182, 212, 0.4)"
            }}
            whileTap={{ scale: 0.95 }}
          >
            <ShoppingCart className="w-7 h-7 text-white mx-auto" />
            
            {/* Item count badge */}
            {itemCount > 0 && (
              <motion.div
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center border-2 border-black"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 500 }}
              >
                <span className="text-xs font-black text-white">{itemCount}</span>
              </motion.div>
            )}
            
            {/* Pulse effect */}
            <motion.div
              className="absolute inset-0 rounded-full bg-cyan-400/30"
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            
            {/* Hover glow */}
            <motion.div
              className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400/20 to-purple-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            />
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Enhanced Photo Gallery Navigation with Zoom and Touch Support
const EnhancedPhotoGallery = ({ images, currentIndex, onImageChange, onZoom }) => {
  const [isNavigating, setIsNavigating] = useState(false);
  const [dragDirection, setDragDirection] = useState(null);
  const [dragProgress, setDragProgress] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const galleryRef = useRef(null);
  const imageRef = useRef(null);

  const handlePrevious = () => {
    if (isNavigating) return;
    setIsNavigating(true);
    onImageChange(currentIndex === 0 ? images.length - 1 : currentIndex - 1);
    setTimeout(() => setIsNavigating(false), 300);
  };

  const handleNext = () => {
    if (isNavigating) return;
    setIsNavigating(true);
    onImageChange(currentIndex === images.length - 1 ? 0 : currentIndex + 1);
    setTimeout(() => setIsNavigating(false), 300);
  };

  const handleThumbnailClick = (index) => {
    if (isNavigating) return;
    setIsNavigating(true);
    onImageChange(index);
    setTimeout(() => setIsNavigating(false), 300);
  };

  const handleDragStart = (e) => {
    const touch = e.touches ? e.touches[0] : e;
    setDragProgress(0);
  };

  const handleDragMove = (e) => {
    const touch = e.touches ? e.touches[0] : e;
    const rect = galleryRef.current.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const progress = (x / rect.width) * 100;
    
    if (progress < 30) {
      setDragDirection('left');
      setDragProgress(Math.abs(progress - 30) / 30);
    } else if (progress > 70) {
      setDragDirection('right');
      setDragProgress(Math.abs(progress - 70) / 30);
    } else {
      setDragDirection(null);
      setDragProgress(0);
    }
  };

  const handleDragEnd = () => {
    if (dragDirection === 'left' && dragProgress > 0.5) {
      handleNext();
    } else if (dragDirection === 'right' && dragProgress > 0.5) {
      handlePrevious();
    }
    setDragDirection(null);
    setDragProgress(0);
  };

  // Enhanced zoom functionality
  const handleZoom = (e) => {
    if (!imageRef.current) return;
    
    const rect = imageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const zoomX = (x / rect.width) * 100;
    const zoomY = (y / rect.height) * 100;
    
    setZoomPosition({ x: zoomX, y: zoomY });
    setZoomLevel(2.5);
    setIsZoomed(true);
  };

  const handleZoomOut = () => {
    setZoomLevel(1);
    setIsZoomed(false);
    setZoomPosition({ x: 0, y: 0 });
  };

  const handleZoomMove = (e, imageElement) => {
    if (!isZoomed || !imageElement) return;
    
    const rect = imageElement.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const zoomX = (x / rect.width) * 100;
    const zoomY = (y / rect.height) * 100;
    
    setZoomPosition({ x: zoomX, y: zoomY });
  };

  const handleWheel = (e, imageElement) => {
    if (!imageElement) return;
    
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.2 : 0.2;
    const newZoom = Math.max(1, Math.min(4, zoomLevel + delta));
    setZoomLevel(newZoom);
    
    if (newZoom === 1) {
      setIsZoomed(false);
      setZoomPosition({ x: 0, y: 0 });
    } else {
      setIsZoomed(true);
    }
  };

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrevious();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'Home') {
        e.preventDefault();
        onImageChange(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        onImageChange(images.length - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, images.length]);

  return (
    <div className="space-y-6">
      {/* Main Image with Enhanced Navigation */}
      <HoloCard className="p-0 group cursor-zoom-in relative overflow-hidden">
        <div 
          ref={galleryRef}
          className="relative aspect-square overflow-hidden rounded-2xl"
          onTouchStart={handleDragStart}
          onTouchMove={handleDragMove}
          onTouchEnd={handleDragEnd}
          onMouseDown={handleDragStart}
          onMouseMove={handleDragMove}
          onMouseUp={handleDragEnd}
          onMouseLeave={handleDragEnd}
        >
          {images[currentIndex]?.type === 'video' ? (
            <motion.video
              ref={imageRef}
              src={images[currentIndex].src}
              className="w-full h-full object-cover select-none"
              controls
              loop
              muted
              playsInline
              style={{
                transform: isZoomed ? `scale(${zoomLevel})` : 'scale(1)',
                transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
              }}
              whileHover={!isZoomed ? { scale: 1.05 } : {}}
              transition={{ duration: 0.3, ease: "easeOut" }}
              onClick={isZoomed ? handleZoomOut : handleZoom}
              onMouseMove={isZoomed ? (e) => handleZoomMove(e, imageRef.current) : undefined}
              onWheel={(e) => handleWheel(e, imageRef.current)}
              drag={!isZoomed ? "x" : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.1}
              onDragEnd={(e, info) => {
                if (Math.abs(info.offset.x) > 100) {
                  if (info.offset.x > 0) {
                    handlePrevious();
                  } else {
                    handleNext();
                  }
                }
              }}
            />
          ) : (
            <motion.img
              ref={imageRef}
              src={images[currentIndex]?.src || images[currentIndex]}
              alt={images[currentIndex]?.alt || `Product ${currentIndex + 1}`}
              className="w-full h-full object-cover select-none cursor-zoom-in"
              style={{
                transform: isZoomed ? `scale(${zoomLevel})` : 'scale(1)',
                transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                cursor: isZoomed ? 'zoom-out' : 'zoom-in'
              }}
              whileHover={!isZoomed ? { scale: 1.05 } : {}}
              transition={{ duration: 0.3, ease: "easeOut" }}
              onClick={isZoomed ? handleZoomOut : handleZoom}
              onMouseMove={isZoomed ? (e) => handleZoomMove(e, imageRef.current) : undefined}
              onWheel={(e) => handleWheel(e, imageRef.current)}
              drag={!isZoomed ? "x" : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.1}
              onDragEnd={(e, info) => {
                if (Math.abs(info.offset.x) > 100) {
                  if (info.offset.x > 0) {
                    handlePrevious();
                  } else {
                    handleNext();
                  }
                }
              }}
            />
          )}
          
          {/* Enhanced Navigation Arrows */}
          <div className="absolute inset-0 flex items-center justify-between p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <motion.button
              className="w-12 h-12 bg-black/70 backdrop-blur-sm rounded-full border border-cyan-500/50 hover:border-cyan-400 hover:bg-black/90 transition-all duration-300 flex items-center justify-center"
              onClick={handlePrevious}
              whileHover={{ scale: 1.1, x: -2 }}
              whileTap={{ scale: 0.9 }}
              disabled={isNavigating}
            >
              <ChevronLeft className="w-6 h-6 text-cyan-400" />
            </motion.button>
            
            <motion.button
              className="w-12 h-12 bg-black/70 backdrop-blur-sm rounded-full border border-cyan-500/50 hover:border-cyan-400 hover:bg-black/90 transition-all duration-300 flex items-center justify-center"
              onClick={handleNext}
              whileHover={{ scale: 1.1, x: 2 }}
              whileTap={{ scale: 0.9 }}
              disabled={isNavigating}
            >
              <ChevronRight className="w-6 h-6 text-cyan-400" />
            </motion.button>
          </div>

          {/* Drag Indicators */}
          <AnimatePresence>
            {dragDirection && (
              <motion.div
                className={`absolute inset-0 flex items-center justify-center pointer-events-none ${
                  dragDirection === 'left' ? 'justify-start' : 'justify-end'
                }`}
                initial={{ opacity: 0 }}
                animate={{ opacity: dragProgress }}
                exit={{ opacity: 0 }}
              >
                <div className={`w-20 h-20 bg-gradient-to-r ${
                  dragDirection === 'left' 
                    ? 'from-transparent to-cyan-500/20' 
                    : 'from-cyan-500/20 to-transparent'
                } rounded-full flex items-center justify-center`}>
                  <ChevronLeft className={`w-8 h-8 text-cyan-400 ${
                    dragDirection === 'right' ? 'rotate-180' : ''
                  }`} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Enhanced Image Counter */}
          <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-sm px-4 py-2 rounded-full border border-cyan-500/50">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-cyan-400">
                {String(currentIndex + 1).padStart(2, '0')}/{String(images.length).padStart(2, '0')}
              </span>
              <div className="w-1 h-1 bg-cyan-400 rounded-full animate-pulse" />
            </div>
          </div>

          {/* Enhanced Zoom Indicator */}
          <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm px-3 py-1 rounded-full border border-cyan-500/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="flex items-center gap-2 text-xs text-cyan-400">
              {isZoomed ? (
                <>
                  <ZoomOut className="w-3 h-3" />
                  <span>CLICK TO ZOOM OUT ({Math.round(zoomLevel * 100)}%)</span>
                </>
              ) : (
                <>
                  <ZoomIn className="w-3 h-3" />
                  <span>CLICK TO ZOOM</span>
                </>
              )}
            </div>
          </div>
        </div>
      </HoloCard>

      {/* Enhanced Thumbnail Gallery */}
      <div className="relative">
        <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
          {images.map((image, index) => (
            <motion.button
              key={index}
              onClick={() => handleThumbnailClick(index)}
              className={`
                flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all duration-300 relative group
                ${currentIndex === index 
                  ? 'border-cyan-400 ring-2 ring-cyan-400/40 scale-110 shadow-xl shadow-cyan-400/30' 
                  : 'border-white/20 hover:border-white/60 hover:scale-105 hover:shadow-lg hover:shadow-white/20'
                }
              `}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
              disabled={isNavigating}
            >
              {image?.type === 'video' ? (
                <div className="w-full h-full relative">
                  <video
                    src={image.src}
                    className="w-full h-full object-cover"
                    muted
                    playsInline
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-6 h-6 bg-black/70 rounded-full flex items-center justify-center">
                      <Play className="w-3 h-3 text-white ml-0.5" />
                    </div>
                  </div>
                </div>
              ) : (
                <img
                  src={image?.src || image}
                  alt={image?.alt || `Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              )}
              
              {/* Selection indicator */}
              {currentIndex === index && (
                <motion.div
                  className="absolute inset-0 bg-cyan-400/20 flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500 }}
                >
                  <Check className="w-6 h-6 text-cyan-400 drop-shadow-lg" />
                </motion.div>
              )}
              
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
              
              {/* Index number */}
              <div className="absolute top-1 right-1 w-5 h-5 bg-black/70 rounded-full flex items-center justify-center">
                <span className="text-xs font-mono text-white">{index + 1}</span>
              </div>
            </motion.button>
          ))}
        </div>
        
        {/* Scroll indicators */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-8 bg-gradient-to-r from-black/80 to-transparent rounded-l-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <ChevronLeft className="w-4 h-4 text-cyan-400" />
        </div>
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 bg-gradient-to-l from-black/80 to-transparent rounded-r-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <ChevronRight className="w-4 h-4 text-cyan-400" />
        </div>
        
        {/* Progress Bar */}
        <div className="mt-4">
          <div className="relative h-1 bg-gray-800 rounded-full overflow-hidden border border-gray-600">
            <motion.div
              className="h-full bg-gradient-to-r from-cyan-400 to-purple-500"
              initial={{ width: 0 }}
              animate={{ width: `${((currentIndex + 1) / images.length) * 100}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
            </motion.div>
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-2">
            <span>Image {currentIndex + 1} of {images.length}</span>
            <span className="text-cyan-400 font-mono">
              {Math.round(((currentIndex + 1) / images.length) * 100)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Vault Features Section
const VaultFeatures = ({ product }) => {
  const [selectedFeature, setSelectedFeature] = useState(0);
  
  const features = [
    {
      icon: '🔥',
      title: 'Nano-tech Thermal Regulation',
      description: 'Advanced temperature control system that adapts to your body and environment',
      level: 95,
      color: 'from-red-500 to-orange-500'
    },
    {
      icon: '⚡',
      title: 'Quantum Flex Fiber Technology',
      description: 'Revolutionary fabric that provides ultimate flexibility and durability',
      level: 98,
      color: 'from-yellow-500 to-amber-500'
    },
    {
      icon: '🛡️',
      title: 'Urban Armor Protection',
      description: 'Military-grade protection layer for urban environments',
      level: 87,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: '💎',
      title: 'Limited Genesis Edition',
      description: 'Exclusive limited release with premium materials and craftsmanship',
      level: 100,
      color: 'from-purple-500 to-pink-500'
    }
  ];

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 4.0 }}
    >
      <HoloCard className="p-6" glowColor="purple">
        <motion.h3 
          className="text-xl font-black mb-6 flex items-center gap-3"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 4.2 }}
        >
          <motion.div
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.5, delay: 4.4, ease: "easeOut" }}
          >
            <Layers className="w-6 h-6 text-purple-400" />
          </motion.div>
          VAULT FEATURES MATRIX
        </motion.h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className={`
                p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer group
                ${selectedFeature === index 
                  ? 'border-purple-400 bg-purple-500/10 shadow-lg shadow-purple-500/20' 
                  : 'border-white/20 hover:border-purple-400/50 hover:bg-purple-500/5'
                }
              `}
              onClick={() => setSelectedFeature(index)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 4.6 + index * 0.1 }}
              whileHover={{ y: -2, scale: 1.02 }}
            >
              <div className="flex items-start gap-3">
                <div className="text-2xl">{feature.icon}</div>
                <div className="flex-1">
                  <h4 className="font-black text-sm mb-2 text-purple-300">{feature.title}</h4>
                  <p className="text-xs text-gray-400 mb-3 leading-relaxed">{feature.description}</p>
                  
                  {/* Feature Level Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-purple-300">EFFICIENCY</span>
                      <span className="text-cyan-400">{feature.level}%</span>
                    </div>
                    <div className="relative h-2 bg-gray-800 rounded-full overflow-hidden border border-gray-600">
                      <motion.div
                        className={`h-full bg-gradient-to-r ${feature.color} relative`}
                        initial={{ width: 0 }}
                        animate={{ width: `${feature.level}%` }}
                        transition={{ duration: 1, delay: 4.8 + index * 0.1, ease: "easeOut" }}
                      >
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
                          animate={{ x: ['-100%', '200%'] }}
                          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        />
                      </motion.div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Selection indicator */}
              {selectedFeature === index && (
                <motion.div
                  className="absolute top-2 right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 500 }}
                >
                  <Check className="w-4 h-4 text-white" />
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
        
        {/* Selected Feature Details */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedFeature}
            className="mt-6 p-4 bg-black/30 rounded-xl border border-purple-500/30"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">{features[selectedFeature].icon}</span>
              <h5 className="font-black text-purple-300">{features[selectedFeature].title}</h5>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">{features[selectedFeature].description}</p>
            <div className="mt-3 flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
              <span className="text-xs text-purple-300 font-mono">
                EFFICIENCY: {features[selectedFeature].level}% | STATUS: ACTIVE
              </span>
            </div>
          </motion.div>
        </AnimatePresence>
      </HoloCard>
    </motion.div>
  );
};

const VlancoProductPage = () => {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });
  const location = useLocation();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { trackProduct, trackAddToCart, trackAddToWishlist } = useAnalytics();
  
  // Enhanced State Management
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [zoomedImage, setZoomedImage] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [isZoomed, setIsZoomed] = useState(false);
  const [shareMenuOpen, setShareMenuOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [cartAnimation, setCartAnimation] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showAuthModal, setShowAuthModal] = useState(false);
  const cartAnimationTimeoutRef = useRef(null);
  
  // Image optimization states
  const [imagesLoaded, setImagesLoaded] = useState({});
  const [imageLoadingStates, setImageLoadingStates] = useState({});
  const [preloadedImages, setPreloadedImages] = useState([]);

  // Mouse tracking for interactive elements
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100
      });
    };

    const handleTouchMove = (e) => {
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        setMousePosition({
          x: (touch.clientX / window.innerWidth) * 100,
          y: (touch.clientY / window.innerHeight) * 100
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (cartAnimationTimeoutRef.current) {
        clearTimeout(cartAnimationTimeoutRef.current);
      }
    };
  }, []);



  // Analytics and tracking states
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [pageViewStartTime] = useState(() => Date.now());
  const [stockReservation, setStockReservation] = useState(null);

  // Enhanced Product Data - Database Integration
  const getInitialProduct = () => {
    // Get product data from navigation state if available (from mask collection)
    const locationProduct = location.state?.product;
    
    if (locationProduct) {
      // Transform mask product data to match ProductDetail format
      return {
        id: locationProduct.id,
        name: locationProduct.name,
        subtitle: locationProduct.collection || "STREETWEAR COLLECTION",
        base_price: locationProduct.price,
        compare_price: locationProduct.originalPrice,
        discount: locationProduct.originalPrice ? Math.round(((locationProduct.originalPrice - locationProduct.price) / locationProduct.originalPrice) * 100) : 0,
        category: locationProduct.category || "STREETWEAR",
        description: locationProduct.description,
        gallery: locationProduct.gallery || [locationProduct.image],
        stock_quantity: 10, // Default stock
        size_options: locationProduct.sizes || ['Adult Size'],
        color_options: locationProduct.colors?.map(color => ({ name: color.name, hex: color.value })) || [
          { name: 'BLACK', hex: '#000000' },
          { name: 'BROWN', hex: '#8B4513' }
        ],
        features: locationProduct.features?.map(feature => ({ icon: '✨', text: feature, level: 85 })) || [
          { icon: '🔥', text: 'Premium Quality', level: 95 },
          { icon: '⚡', text: 'Hand Crafted', level: 98 },
          { icon: '🛡️', text: 'Full Protection', level: 87 },
          { icon: '💎', text: 'Eco Friendly', level: 100 }
        ],
        stats: {
          hypeLevel: 85,
          streetCred: 90,
          exclusivity: 75,
          community: locationProduct.reviews || 98
        },
        reviews: {
          average: locationProduct.rating || 4.1,
          total: locationProduct.reviews || 98,
          verified: Math.floor((locationProduct.reviews || 98) * 0.8)
        },
        sku: locationProduct.modelNumber || `MASK-${locationProduct.id}`,
        price: locationProduct.price,
        images: locationProduct.gallery || [locationProduct.image],
        // Additional mask-specific properties
        material: locationProduct.material,
        protection: locationProduct.protection,
        washable: locationProduct.washable,
        availability: locationProduct.availability,
        shipping: locationProduct.shipping,
        brand: locationProduct.brand,
        collection: locationProduct.collection,
        modelNumber: locationProduct.modelNumber,
        placeOfOrigin: locationProduct.placeOfOrigin,
        applicableScenes: locationProduct.applicableScenes,
        gender: locationProduct.gender,
        ageGroup: locationProduct.ageGroup,
        moq: locationProduct.moq,
        sampleTime: locationProduct.sampleTime,
        packaging: locationProduct.packaging,
        singlePackageSize: locationProduct.singlePackageSize,
        singleGrossWeight: locationProduct.singleGrossWeight,
        // Additional properties for second mask
        headCircumference: locationProduct.headCircumference,
        printingMethods: locationProduct.printingMethods,
        technics: locationProduct.technics,
        needleDetection: locationProduct.needleDetection,
        keywords: locationProduct.keywords,
        logo: locationProduct.logo,
        color: locationProduct.color,
        usage: locationProduct.usage,
        item: locationProduct.item,
        label: locationProduct.label,
        oem: locationProduct.oem,
        use: locationProduct.use,
        sellingUnits: locationProduct.sellingUnits,
        detailedReviews: locationProduct.detailedReviews,
        // Additional properties for third mask
        design: locationProduct.design,
        packing: locationProduct.packing,
        service: locationProduct.service,
        quality: locationProduct.quality,
        // Additional properties for fourth mask
        season: locationProduct.season,
        functionality: locationProduct.function,
        feature: locationProduct.feature
      };
    }
    
    // Default product data for regular products
    return {
      id: '1',
      name: "VLANCO CYBER HOODIE",
      subtitle: "STREET EVOLUTION",
      base_price: 189,
      compare_price: 249,
      discount: 24,
      category: "PREMIUM STREETWEAR",
      description: "Experience the future of street fashion. Engineered with nano-tech fabric and cyber-aesthetic design for the ultimate urban warrior.",
      gallery: productImages,
      stock_quantity: 7,
      size_options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
      color_options: [
        { name: 'VOID BLACK', hex: '#000000' },
        { name: 'CYBER BLUE', hex: '#00D4FF' },
        { name: 'NEON PINK', hex: '#FF0080' },
        { name: 'MATRIX GREEN', hex: '#00FF41' }
      ],
      features: [
        { icon: '🔥', text: 'Nano-tech thermal regulation', level: 95 },
        { icon: '⚡', text: 'Quantum flex fiber technology', level: 98 },
        { icon: '🛡️', text: 'Urban armor protection layer', level: 87 },
        { icon: '💎', text: 'Limited genesis edition', level: 100 },
        { icon: '🎯', text: 'Street-certified authenticity', level: 92 },
        { icon: '✨', text: 'Holographic brand elements', level: 89 }
      ],
      stats: {
        hypeLevel: 97,
        streetCred: 94,
        exclusivity: 88,
        community: 156
      },
      reviews: {
        average: 4.9,
        total: 342,
        verified: 287
      },
      sku: 'VLANCO-CYBER-001',
      price: 189,
      images: productImages
    };
  };

  const [product, setProduct] = useState(getInitialProduct());

  // Database integration
  const { user } = useAuth();
  const { addToCart, itemCount } = useCart();
  
  // Track product view when page loads
  useEffect(() => {
    if (product?.id) {
      trackProduct(String(product.id), {
        product_name: product.name,
        product_category: product.category,
        product_price: product.base_price,
        product_brand: product.brand || 'VLANCO',
        page_type: 'product_detail',
        came_from: location.state?.from || 'direct'
      });
    }
  }, [product?.id, trackProduct, location.state]);
  const [loading, setLoading] = useState(false);
  const [productVariants, setProductVariants] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);
  
  // Enhanced loading and error states
  const [pageLoading, setPageLoading] = useState(true);
  const [imageLoading, setImageLoading] = useState(true);
  const [cartLoading, setCartLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const playSound = (type) => {
    if (!soundEnabled) return;
    // Sound effect logic here
  };

  // Error handling and retry mechanisms
  const handleError = (error, context = 'general') => {
    console.error(`Error in ${context}:`, error);
    setError({
      message: error.message || 'An unexpected error occurred',
      context,
      timestamp: Date.now()
    });
    
    // Auto-clear error after 5 seconds
    setTimeout(() => setError(null), 5000);
  };

  const retryOperation = async (operation, maxRetries = 3) => {
    try {
      setRetryCount(prev => prev + 1);
      await operation();
      setError(null);
      setRetryCount(0);
    } catch (error) {
      if (retryCount < maxRetries) {
        handleError(error, 'retry');
        // Exponential backoff
        setTimeout(() => retryOperation(operation, maxRetries), Math.pow(2, retryCount) * 1000);
      } else {
        handleError(error, 'final');
      }
    }
  };

  const clearError = () => {
    setError(null);
    setRetryCount(0);
  };

  // Zoom functionality
  const handleZoom = (e, imageElement) => {
    if (!imageElement) return;
    
    const rect = imageElement.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const zoomX = (x / rect.width) * 100;
    const zoomY = (y / rect.height) * 100;
    
    setZoomPosition({ x: zoomX, y: zoomY });
    setZoomLevel(2.5);
    setIsZoomed(true);
  };

  const handleZoomOut = () => {
    setZoomLevel(1);
    setIsZoomed(false);
    setZoomPosition({ x: 0, y: 0 });
  };

  const handleZoomMove = (e, imageElement) => {
    if (!isZoomed || !imageElement) return;
    
    const rect = imageElement.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const zoomX = (x / rect.width) * 100;
    const zoomY = (y / rect.height) * 100;
    
    setZoomPosition({ x: zoomX, y: zoomY });
  };

  const handleWheel = (e, imageElement) => {
    if (!imageElement) return;
    
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.2 : 0.2;
    const newZoom = Math.max(1, Math.min(4, zoomLevel + delta));
    setZoomLevel(newZoom);
    
    if (newZoom === 1) {
      setIsZoomed(false);
      setZoomPosition({ x: 0, y: 0 });
    } else {
      setIsZoomed(true);
    }
  };

  // Preload images when product changes
  useEffect(() => {
    if (product.gallery && product.gallery.length > 0) {
      setPageLoading(true);
      preloadAllImages().finally(() => {
        setPageLoading(false);
      });
    }
  }, [product.gallery]);

  // Helper function to manage cart animation with proper timeout clearing
  const setCartAnimationWithTimeout = (show, duration) => {
    // Clear any existing timeout
    if (cartAnimationTimeoutRef.current) {
      clearTimeout(cartAnimationTimeoutRef.current);
      cartAnimationTimeoutRef.current = null;
    }
    
    setCartAnimation(show);
    
    if (show && duration) {
      cartAnimationTimeoutRef.current = setTimeout(() => {
        setCartAnimation(false);
        cartAnimationTimeoutRef.current = null;
      }, duration);
    }
  };

  // Wishlist handler
  const handleToggleWishlist = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    try {
      if (isInWishlist(product.id)) {
        await removeFromWishlist(product.id);
        setIsWishlisted(false);
      } else {
        await addToWishlist({
          id: product.id,
          name: product.name,
          price: product.base_price || product.price || 0,
          image: product.gallery?.[0] || product.images?.[0] || '/src/assets/product-1.jpg',
          category: product.category || 'Product',
          description: product.description,
          rating: 4.5,
          reviews: 0,
          isLimited: false,
          isNew: false,
          colors: product.color_options?.map(c => c.name) || ['Black', 'White'],
          sizes: product.size_options || ['S', 'M', 'L', 'XL']
        });
        setIsWishlisted(true);
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
    }
  };

  // Image optimization and preloading functions
  const preloadImage = (imageItem, index) => {
    return new Promise((resolve, reject) => {
      if (imageItem?.type === 'video') {
        // For videos, we'll resolve immediately as we don't need to preload them
        setImagesLoaded(prev => ({ ...prev, [index]: true }));
        setImageLoadingStates(prev => ({ ...prev, [index]: 'loaded' }));
        resolve({ type: 'video', src: imageItem.src });
      } else {
        const img = new Image();
        img.onload = () => {
          setImagesLoaded(prev => ({ ...prev, [index]: true }));
          setImageLoadingStates(prev => ({ ...prev, [index]: 'loaded' }));
          resolve(img);
        };
        img.onerror = () => {
          setImageLoadingStates(prev => ({ ...prev, [index]: 'error' }));
          reject(new Error(`Failed to load image ${index}`));
        };
        img.src = imageItem?.src || imageItem;
      }
    });
  };

  const preloadAllImages = async () => {
    const promises = product.gallery.map((image, index) => 
      preloadImage(image, index)
    );
    
    try {
      const loadedImages = await Promise.allSettled(promises);
      setPreloadedImages(loadedImages.map((result, index) => 
        result.status === 'fulfilled' ? result.value : null
      ));
    } catch (error) {
      console.error('Error preloading images:', error);
    }
  };

  const getImageSrc = (image, index) => {
    // Return low-quality placeholder for unloaded images
    if (!imagesLoaded[index]) {
      return `data:image/svg+xml;base64,${btoa(`
        <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="#f0f0f0"/>
          <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#999" font-family="Arial" font-size="16">
            Loading...
          </text>
        </svg>
      `)}`;
    }
    return image;
  };

  // Touch gesture handling for mobile
  const [touchStart, setTouchStart] = useState({ x: 0, y: 0 });
  const [touchEnd, setTouchEnd] = useState({ x: 0, y: 0 });

  const handleTouchStart = (e) => {
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    });
  };

  const handleTouchMove = (e) => {
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    });
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distanceX = touchStart.x - touchEnd.x;
    const distanceY = touchStart.y - touchEnd.y;
    const isHorizontalSwipe = Math.abs(distanceX) > Math.abs(distanceY);
    
    if (isHorizontalSwipe && Math.abs(distanceX) > 50) {
      if (distanceX > 0) {
        // Swipe left - next image
        setCurrentImageIndex(prev => 
          prev < product.gallery.length - 1 ? prev + 1 : prev
        );
      } else {
        // Swipe right - previous image
        setCurrentImageIndex(prev => 
          prev > 0 ? prev - 1 : prev
        );
      }
    }
    
    setTouchStart({ x: 0, y: 0 });
    setTouchEnd({ x: 0, y: 0 });
  };

  // Track user activity and page views (will work after running the analytics migration)
  const trackActivity = async (pageUrl: string, timeSpent: number = 0) => {
    try {
      if (user) {
        // Note: This requires the analytics migration to be run first
        // For now, we'll track in user_activities table
        await supabase
          .from('user_activities')
          .insert({
            user_id: user.id,
            activity_type: 'page_view',
            resource_type: 'page',
            resource_id: null,
            metadata: {
              page_url: pageUrl,
              time_spent: timeSpent,
              session_id: sessionId
            }
          });
      }
    } catch (error) {
      console.error('Error tracking activity:', error);
    }
  };

  // Track product interaction (will work after running the analytics migration)
  const trackProductInteraction = async (interactionType: string, quantity: number = 1) => {
    try {
      if (user && product.id) {
        // Note: This requires the analytics migration to be run first
        // For now, we'll track in user_activities table
        await supabase
          .from('user_activities')
          .insert({
            user_id: user.id,
            activity_type: interactionType,
            resource_type: 'product',
            resource_id: product.id,
            metadata: {
              quantity,
              price: product.base_price,
              session_id: sessionId
            }
          });
      }
    } catch (error) {
      console.error('Error tracking product interaction:', error);
    }
  };

  // Track page view time when component unmounts
  useEffect(() => {
    return () => {
      const timeSpent = Math.floor((Date.now() - pageViewStartTime) / 1000);
      if (timeSpent > 5) { // Only track if user spent more than 5 seconds
        trackActivity(window.location.pathname, timeSpent);
      }
    };
  }, [pageViewStartTime, trackActivity]);

    const handleAddToCart = async () => {
    // Input validation
    if (!selectedSize || selectedSize.trim() === '') {
      setCartAnimationWithTimeout(true, 600);
      toast({
        title: "Size Required",
        description: "Please select a size before adding to cart",
        variant: "destructive"
      });
      return;
    }
    
    if (selectedColor === undefined || selectedColor < 0 || selectedColor >= product.color_options.length) {
      setCartAnimationWithTimeout(true, 600);
      toast({
        title: "Color Required",
        description: "Please select a valid color before adding to cart",
        variant: "destructive"
      });
      return;
    }
    
    if (quantity < 1 || quantity > 5) {
      setCartAnimationWithTimeout(true, 600);
      toast({
        title: "Invalid Quantity",
        description: "Quantity must be between 1 and 5",
        variant: "destructive"
      });
      return;
    }
    
    // Enhanced stock validation with quantity limits
    const quantityValidation = validateQuantity(quantity, product.stock_quantity);
    if (!quantityValidation.valid) {
      setCartAnimationWithTimeout(true, 600);
      toast({
        title: "Invalid Quantity",
        description: quantityValidation.message,
        variant: "destructive"
      });
      return;
    }
    
    // Check stock availability (including reserved stock)
    if (product.stock_quantity < quantity) {
      setCartAnimationWithTimeout(true, 600);
      toast({
        title: "Insufficient Stock",
        description: `Only ${product.stock_quantity} items available`,
        variant: "destructive"
      });
      return;
    }
    
    try {
      setLoading(true);
      setCartAnimationWithTimeout(true, 3000);
      
      // Validate product data
      if (!product.id || !product.base_price || !product.color_options[selectedColor]) {
        throw new Error('Invalid product data');
      }
      
      // Create or find product variant with enhanced security
      const variantData = {
        product_id: product.id,
        color: product.color_options[selectedColor].name,
        size: selectedSize,
        price: product.base_price,
        sku: `${product.id}-${selectedSize}-${selectedColor}`,
        stock_quantity: Math.max(0, product.stock_quantity - quantity), // Reduce stock
        is_active: true,
        created_at: new Date().toISOString()
      };
      
      // Insert variant; if it exists, fetch by sku
      let variantIdLocal = '';
      try {
        const insertRes = await supabase
          .from('product_variants')
          .insert(variantData)
          .select('id, sku, stock_quantity')
          .single();
        if (insertRes.error) throw insertRes.error;
        variantIdLocal = String(insertRes.data.id);
      } catch (variantInsertErr) {
        const { data: existing } = await supabase
          .from('product_variants')
          .select('id, sku, stock_quantity')
          .eq('sku', variantData.sku)
          .maybeSingle();
        if (!existing?.id) {
          console.error('Variant creation error:', variantInsertErr);
          throw new Error('Failed to create product variant');
        }
        variantIdLocal = String(existing.id);
      }
      
      // Track product interaction
      await trackProductInteraction('add_to_cart', quantity);
      
      // Track analytics for add to cart
      await trackAddToCart(String(product.id), String(variantIdLocal), quantity, product.base_price);
      
      // Add to cart with enhanced error handling and product details
      const productDetails = {
        product: {
          id: String(product.id),
          name: product.name,
          base_price: product.base_price,
          compare_price: product.compare_price,
          description: product.description,
          sku: product.sku,
          image: Array.isArray(product.images) ? (product.images[0]?.src || product.images[0]) : undefined,
          images: Array.isArray(product.images) ? product.images : undefined,
          rating: product.reviews?.average,
          reviews: product.reviews?.total,
          brand: product.brand,
          collection: product.collection,
          material: product.material,
          protection: product.protection,
        },
        variant: {
          id: String(variantIdLocal),
          color: product.color_options[selectedColor].name,
          size: selectedSize,
          price: product.base_price,
          sku: variantData.sku,
          stock_quantity: variantData.stock_quantity
        },
        price: product.base_price,
        quantity
      };
      
      await addToCart(String(product.id), String(variantIdLocal), quantity, productDetails);
      
      // Update product stock in database
      const newStockQuantity = Math.max(0, product.stock_quantity - quantity);
      await supabase
        .from('products')
        .update({ 
          stock_quantity: newStockQuantity,
          updated_at: new Date().toISOString()
        })
        .eq('id', product.id);
      
      // Update local state
      setProduct(prev => ({
        ...prev,
        stock_quantity: newStockQuantity
      }));
      
      // Log security event
      logSecurityEvent('cart_item_added', {
        product_id: product.id,
        variant_id: variantIdLocal,
        quantity,
        user_id: user?.id
      });
      
      // Enhanced success feedback with vault-like effects
      playSound('success');
      toast({
        title: "🚀 DEPLOYED TO VAULT!",
        description: `${product.name} - ${selectedSize} - ${product.color_options[selectedColor].name} (Qty: ${quantity})`,
        duration: 3000
      });
      
      // Enhanced cart animation with particle effects
      // Animation is already set to show for 3 seconds by setCartAnimationWithTimeout above
      
    } catch (error) {
      console.error('Error adding to cart:', error);
      
      let errorMessage = "Failed to add item to cart. Please try again.";
      if (error.message === 'Invalid product data') {
        errorMessage = "Product data is invalid. Please refresh the page.";
      } else if (error.message === 'Failed to create product variant') {
        errorMessage = "Unable to create product variant. Please try again.";
      } else if (error.message === 'Invalid variant data received') {
        errorMessage = "Server returned invalid data. Please try again.";
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
        duration: 5000
      });
      setCartAnimation(false);
    } finally {
      setLoading(false);
    }
  };

  // Enhanced cart state management
  const [showCartIndicator, setShowCartIndicator] = useState(false);
  
  // Show cart indicator when items are added
  useEffect(() => {
    if (itemCount > 0) {
      setShowCartIndicator(true);
      const timer = setTimeout(() => setShowCartIndicator(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [itemCount]);

  // Enhanced cart click handler
  const handleCartClick = () => {
    // This would typically open a cart sidebar or navigate to cart page
    toast({
      title: "Cart Access",
      description: `You have ${itemCount} items in your vault`,
      duration: 3000
    });
  };

  return (
    <>
      <Navigation />
      {/* Loading Skeleton */}
      {pageLoading && (
        <motion.div
          className="fixed inset-0 z-50 bg-black flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 border-4 border-cyan-400/20 border-t-cyan-400 rounded-full animate-spin" />
            <p className="text-xl font-semibold text-cyan-400">Loading Product...</p>
          </div>
        </motion.div>
      )}

      {/* Error Display */}
      {error && (
        <motion.div
          className="fixed top-4 right-4 z-50 max-w-md bg-red-900/90 backdrop-blur-md border border-red-500/50 rounded-lg p-4 shadow-2xl"
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 100 }}
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-5 h-5 bg-red-400 rounded-full flex items-center justify-center">
              <span className="text-xs text-red-900">!</span>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-red-100 mb-1">Error</h3>
              <p className="text-sm text-red-200 mb-3">{error.message}</p>
              <div className="flex gap-2">
                <button
                  onClick={clearError}
                  className="px-3 py-1.5 bg-red-800 hover:bg-red-700 text-red-100 text-xs rounded-md transition-colors"
                >
                  Dismiss
                </button>
                {retryCount < 3 && (
                  <button
                    onClick={() => retryOperation(() => preloadAllImages())}
                    className="px-3 py-1.5 bg-red-700 hover:bg-red-600 text-red-100 text-xs rounded-md transition-colors"
                  >
                    Retry ({3 - retryCount} left)
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <motion.div 
        ref={containerRef} 
        className="min-h-screen bg-black text-white relative overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        style={{
          background: `
            radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, 
               rgba(0, 212, 255, 0.08) 0%, transparent 50%),
            radial-gradient(circle at ${100 - mousePosition.x}% ${100 - mousePosition.y}%, 
               rgba(255, 0, 128, 0.08) 0%, transparent 50%),
            linear-gradient(135deg, #000000 0%, #0a0a0a 50%, #000000 100%)
          `
        }}
      >
      {/* Animated Background Grid */}
       <motion.div 
         className="fixed inset-0 opacity-8"
         initial={{ opacity: 0 }}
         animate={{ opacity: 0.08 }}
         transition={{ duration: 1.5, delay: 0.5 }}
       >
         <motion.div 
          className="absolute inset-0"
          style={{
            backgroundImage: `
               linear-gradient(rgba(6,182,212,0.05) 1px, transparent 1px),
               linear-gradient(90deg, rgba(6,182,212,0.05) 1px, transparent 1px)
             `,
             backgroundSize: '60px 60px'
           }}
           animate={{
             backgroundPosition: ['0px 0px', '60px 60px']
           }}
           transition={{
             duration: 20,
             repeat: Infinity,
             ease: "linear"
           }}
         />
       </motion.div>

             {/* Enhanced Floating Elements */}
      <div className="fixed inset-0 pointer-events-none">
         <motion.div
           className="absolute top-20 left-10 text-cyan-400/15"
           initial={{ opacity: 0, scale: 0, rotate: -180 }}
           animate={{ opacity: 1, scale: 1, rotate: 0 }}
           transition={{ duration: 1.2, delay: 0.8, ease: "easeOut" }}
         >
           <motion.div
             animate={{
               y: [-8, 8, -8],
               rotate: [0, 5, -5, 0],
               scale: [1, 1.05, 0.95, 1]
             }}
             transition={{
               duration: 8,
               repeat: Infinity,
               ease: "easeInOut"
             }}
           >
             <Hexagon size={30} />
           </motion.div>
         </motion.div>
         
         <motion.div
           className="absolute top-40 right-20 text-pink-400/15"
           initial={{ opacity: 0, scale: 0, rotate: 180 }}
           animate={{ opacity: 1, scale: 1, rotate: 0 }}
           transition={{ duration: 1.2, delay: 1.2, ease: "easeOut" }}
         >
           <motion.div
             animate={{
               y: [8, -8, 8],
               rotate: [0, -5, 5, 0],
               scale: [1, 0.95, 1.05, 1]
             }}
             transition={{
               duration: 10,
               repeat: Infinity,
               ease: "easeInOut"
             }}
           >
             <Triangle size={20} />
           </motion.div>
         </motion.div>
         
         <motion.div
           className="absolute bottom-40 left-20 text-green-400/15"
           initial={{ opacity: 0, scale: 0, rotate: 90 }}
           animate={{ opacity: 1, scale: 1, rotate: 0 }}
           transition={{ duration: 1.2, delay: 1.6, ease: "easeOut" }}
         >
           <motion.div
             animate={{
               y: [-6, 6, -6],
               rotate: [0, 3, -3, 0],
               scale: [1, 1.03, 0.97, 1]
             }}
             transition={{
               duration: 12,
               repeat: Infinity,
               ease: "easeInOut"
             }}
           >
             <Circle size={25} />
           </motion.div>
         </motion.div>
         
         <motion.div
           className="absolute bottom-20 right-10 text-purple-400/15"
           initial={{ opacity: 0, scale: 0, rotate: -90 }}
           animate={{ opacity: 1, scale: 1, rotate: 0 }}
           transition={{ duration: 1.2, delay: 2.0, ease: "easeOut" }}
         >
           <motion.div
             animate={{
               y: [6, -6, 6],
               rotate: [0, -3, 3, 0],
               scale: [1, 0.97, 1.03, 1]
             }}
             transition={{
               duration: 14,
               repeat: Infinity,
               ease: "easeInOut"
             }}
           >
             <Square size={15} />
           </motion.div>
         </motion.div>
      </div>

             {/* Enhanced Sound Toggle */}
      <motion.button
         className="fixed top-8 right-8 z-50 w-12 h-12 bg-black/30 backdrop-blur-xl border border-cyan-500/30 rounded-full flex items-center justify-center hover:border-cyan-400 hover:bg-black/50 transition-all duration-300"
        onClick={() => setSoundEnabled(!soundEnabled)}
         initial={{ opacity: 0, scale: 0, rotate: -180 }}
         animate={{ opacity: 1, scale: 1, rotate: 0 }}
         transition={{ duration: 0.8, delay: 1.5, ease: "easeOut" }}
         whileHover={{ 
           scale: 1.1, 
           rotate: 5,
           boxShadow: "0 0 20px rgba(6, 182, 212, 0.4)"
         }}
         whileTap={{ scale: 0.9, rotate: -5 }}
       >
         <AnimatePresence mode="wait">
           {soundEnabled ? (
             <motion.div
               key="volume-on"
               initial={{ opacity: 0, scale: 0.5 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.5 }}
               transition={{ duration: 0.2 }}
             >
               <Volume2 className="w-5 h-5 text-cyan-400" />
             </motion.div>
           ) : (
             <motion.div
               key="volume-off"
               initial={{ opacity: 0, scale: 0.5 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.5 }}
               transition={{ duration: 0.2 }}
             >
               <VolumeX className="w-5 h-5 text-gray-400" />
             </motion.div>
           )}
         </AnimatePresence>
      </motion.button>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Back Button */}
        <motion.div
          className="mb-8"
           initial={{ opacity: 0, x: -100, scale: 0.8 }}
           animate={{ opacity: 1, x: 0, scale: 1 }}
           transition={{ 
             duration: 0.8, 
             ease: "easeOut",
             delay: 0.3
           }}
         >
           <motion.div
             whileHover={{ x: -5 }}
             transition={{ duration: 0.3, ease: "easeOut" }}
           >
             <GlitchButton variant="ghost" size="sm" className="group" onClick={() => window.history.back()}>
               <motion.div
                 className="flex items-center"
                 whileHover={{ x: -3 }}
                 transition={{ duration: 0.2 }}
               >
                 <ArrowLeft className="w-5 h-5 mr-2" />
            BACK TO COLLECTION
               </motion.div>
          </GlitchButton>
           </motion.div>
        </motion.div>

        {/* Enhanced Main Product Section */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 mb-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
        >
          
          {/* Product Images */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: -80, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ 
              duration: 1.2, 
              ease: "easeOut",
              delay: 1.0
            }}
          >
            {/* Hype Indicator */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <motion.div 
                className="bg-gradient-to-r from-red-500 to-orange-500 px-4 py-2 rounded-full flex items-center gap-2"
                animate={{ 
                  boxShadow: [
                     '0 0 15px rgba(239, 68, 68, 0.3)',
                     '0 0 25px rgba(249, 115, 22, 0.5)',
                     '0 0 15px rgba(239, 68, 68, 0.3)'
                   ]
                 }}
                 transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <Flame className="w-4 h-4" />
                <span className="text-sm font-black">HYPE: {product.stats.hypeLevel}%</span>
              </motion.div>
              
              <div className="bg-cyan-500/20 border border-cyan-500/50 px-3 py-1 rounded-full text-xs font-bold">
                {product.stock_quantity} LEFT
              </div>
              
              <div className="bg-pink-500/20 border border-pink-500/50 px-3 py-1 rounded-full text-xs font-bold">
                {product.stats.community} WATCHING
              </div>
            </div>

            {/* Enhanced Photo Gallery */}
            <EnhancedPhotoGallery
              images={product.gallery}
              currentIndex={currentImageIndex}
              onImageChange={setCurrentImageIndex}
              onZoom={() => setZoomedImage(product.gallery[currentImageIndex])}
            />
          </motion.div>

          {/* Enhanced Product Information */}
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, x: 80, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ 
              duration: 1.2, 
              ease: "easeOut",
              delay: 1.2
            }}
          >
            {/* Enhanced Product Header */}
            <motion.div 
              className="space-y-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.4 }}
            >
              {/* Category Badge */}
              <motion.div 
                className="flex flex-wrap items-center gap-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.6 }}
              >
                <motion.div 
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-1 rounded-full text-xs font-black"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.5, delay: 1.8, ease: "easeOut" }}
                >
                  {product.category}
                </motion.div>
                <motion.div 
                  className="flex items-center gap-1 text-yellow-400"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 2.0 }}
                >
                  <Zap className="w-4 h-4" />
                  <span className="text-xs font-bold">GENESIS EDITION</span>
                </motion.div>
              </motion.div>

              {/* Product Name */}
              <div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight">
                  <span className="bg-gradient-to-r from-white via-cyan-200 to-pink-200 bg-clip-text text-transparent">
                    {product.name}
                  </span>
                </h1>
                <p className="text-lg text-cyan-400 font-bold mt-2 tracking-wider">
                  {product.subtitle}
                </p>
              </div>

              {/* Reviews & Stats */}
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(product.reviews.average)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-600'
                      }`}
                    />
                  ))}
                  <span className="text-sm text-gray-300 ml-2">
                    {product.reviews.average} ({product.reviews.total} reviews)
                  </span>
                </div>
                
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-3 py-1 rounded-full text-xs font-black">
                  STREET SCORE: {product.stats.streetCred}/100
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <motion.button
                  onClick={() => {
                    setIsWishlisted((prev) => !prev);
                    try {
                      const key = 'vlanco_wishlist';
                      const raw = localStorage.getItem(key);
                      const list = raw ? JSON.parse(raw) : [];
                      const exists = list.some((i: any) => i.id === String(product.id));
                      if (exists) {
                        const updated = list.filter((i: any) => i.id !== String(product.id));
                        localStorage.setItem(key, JSON.stringify(updated));
                      } else {
                        const entry = {
                          id: String(product.id),
                          name: product.name,
                          price: product.price,
                          image: product.images?.[0] || '',
                          category: product.category || 'Streetwear',
                          addedAt: new Date().toISOString(),
                        };
                        localStorage.setItem(key, JSON.stringify([entry, ...list]));
                      }
                    } catch (_) {}
                  }}
                  className={`
                    p-3 rounded-xl border-2 transition-all backdrop-blur-xl
                    ${isWishlisted 
                      ? 'bg-red-500/20 border-red-500/50 text-red-400' 
                      : 'bg-white/5 border-white/20 text-white hover:border-red-400/50'
                    }
                  `}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Heart className={`w-6 h-6 ${isWishlisted ? 'fill-current' : ''}`} />
                </motion.button>

                <div className="relative">
                  <GlitchButton
                    variant="ghost"
                    className="!p-3"
                    onClick={() => setShareMenuOpen(!shareMenuOpen)}
                  >
                    <Share2 className="w-6 h-6" />
                  </GlitchButton>

                  <AnimatePresence>
                    {shareMenuOpen && (
                      <motion.div
                        className="absolute right-0 top-full mt-3 bg-black/90 backdrop-blur-xl border border-white/20 rounded-xl p-4 z-50 min-w-[200px]"
                        initial={{ opacity: 0, scale: 0.9, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: -10 }}
                      >
                        <div className="text-sm font-bold mb-3 text-center">Share this drop 🔥</div>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { icon: Copy, label: 'Copy Link' },
                            { icon: Facebook, label: 'Facebook' },
                            { icon: Twitter, label: 'Twitter' },
                            { icon: Instagram, label: 'Instagram' }
                          ].map((item, idx) => (
                            <motion.button
                              key={idx}
                              className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/10 transition-all text-xs font-medium"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <item.icon className="w-4 h-4" />
                              <span>{item.label}</span>
                            </motion.button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>

            {/* Priority: Color, Size, Quantity, Add to Cart */}
            <motion.div
              className="space-y-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              {/* Color Selection (Priority) */}
              <motion.div 
                className="space-y-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <motion.h3 
                  className="text-xl font-black flex items-center gap-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.25 }}
                >
                  <motion.div
                    initial={{ scale: 0, rotate: 90 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  >
                    <Palette className="w-6 h-6 text-pink-400" />
                  </motion.div>
                  <span>COLORWAY: {product.color_options[selectedColor].name}</span>
                </motion.h3>
                <div className="flex flex-wrap gap-3">
                  {product.color_options.map((color, index) => (
                    <motion.button
                      key={index}
                      onClick={() => setSelectedColor(index)}
                      className={`
                        relative w-12 h-12 rounded-xl border-2 transition-all duration-300
                        ${selectedColor === index 
                          ? 'border-cyan-400 ring-3 ring-cyan-400/40 scale-110 shadow-xl shadow-cyan-400/30' 
                          : 'border-white/20 hover:border-white/60 hover:scale-105 hover:shadow-lg hover:shadow-white/20'
                        }
                      `}
                      style={{ backgroundColor: color.hex }}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {selectedColor === index && (
                        <motion.div
                          className="absolute inset-0 rounded-xl flex items-center justify-center"
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: "spring", stiffness: 300, damping: 15 }}
                        >
                          <Check className="w-5 h-5 text-white drop-shadow-lg relative z-10" />
                        </motion.div>
                      )}
                    </motion.button>
                  ))}
                </div>
              </motion.div>

              {/* Size Selection (Priority) */}
              <motion.div 
                className="space-y-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.25 }}
              >
                <motion.h3 
                  className="text-xl font-black flex items-center gap-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                >
                  <Ruler className="w-6 h-6 text-green-400" />
                  <span>SIZE</span>
                </motion.h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
                  {product.size_options.map((size) => (
                    <motion.button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`
                        relative h-16 w-full rounded-2xl font-black text-lg border-2 transition-all duration-300
                        ${selectedSize === size 
                          ? 'border-cyan-500 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400' 
                          : 'border-white/20 bg-white/5 hover:border-white/60 hover:bg-white/10'
                        }
                      `}
                      whileTap={{ scale: 0.95 }}
                    >
                      {size}
                    </motion.button>
                  ))}
                </div>
              </motion.div>

              {/* Quantity (Priority) */}
              <motion.div 
                className="space-y-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <motion.h3 className="text-xl font-black flex items-center gap-3">
                  <Package className="w-6 h-6 text-yellow-400" />
                  QUANTITY
                </motion.h3>
                <div className="flex items-center justify-center gap-6">
                  <GlitchButton
                    variant="ghost"
                    className="!w-14 !h-14 !p-0"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-6 h-6" />
                  </GlitchButton>
                  <div className="text-4xl font-black bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent min-w-[5rem] text-center">
                    {quantity}
                  </div>
                  <GlitchButton
                    variant="ghost"
                    className="!w-14 !h-14 !p-0"
                    onClick={() => setQuantity(Math.min(5, quantity + 1))}
                    disabled={quantity >= 5}
                  >
                    <Plus className="w-6 h-6" />
                  </GlitchButton>
                </div>
              </motion.div>

              {/* Add to Cart (Priority) - Animated same as original */}
              <motion.div
                animate={cartAnimation ? {
                  scale: [1, 1.02, 0.98, 1],
                  y: [0, -2, 0]
                } : {}}
                transition={{ duration: 0.4, ease: "easeInOut" }}
              >
                <motion.div
                  className="relative w-full"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.35 }}
                >
                  <GlitchButton
                    variant="primary"
                    size="xl"
                    className="w-full !h-20 relative overflow-hidden group"
                    onClick={handleAddToCart}
                    disabled={loading}
                    pulse={!(selectedSize && selectedColor !== undefined)}
                  >
                    <div className="flex items-center justify-center relative z-10">
                      <motion.div
                        className="flex items-center gap-3"
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                      >
                        <motion.div
                          animate={{
                            rotate: [0, -5, 5, 0],
                            scale: [1, 1.1, 1]
                          }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <ShoppingCart className="w-7 h-7" />
                        </motion.div>
                        <span className="font-black text-lg">
                          {selectedSize && selectedColor !== undefined ? 
                            `🚀 DEPLOY TO VAULT - $${(product.base_price * quantity).toFixed(2)}` : 
                            selectedSize ? 'SELECT COLOR FIRST' : 'SELECT SIZE FIRST'
                          }
                        </span>
                        <motion.div
                          animate={{
                            rotate: [0, 5, -5, 0],
                            scale: [1, 1.1, 1]
                          }}
                          transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                        >
                          <Zap className="w-6 h-6" />
                        </motion.div>
                      </motion.div>
                    </div>

                    {/* Enhanced border animation */}
                    <motion.div
                      className="absolute inset-0 border-2 border-cyan-400/40 rounded-xl pointer-events-none"
                      animate={{
                        borderColor: ['rgba(6, 182, 212, 0.4)', 'rgba(6, 182, 212, 0.7)', 'rgba(6, 182, 212, 0.4)'],
                        boxShadow: [
                          '0 0 20px rgba(6, 182, 212, 0.3)',
                          '0 0 40px rgba(6, 182, 212, 0.6)',
                          '0 0 20px rgba(6, 182, 212, 0.3)'
                        ]
                      }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    />

                    {/* Cinematic gradient halo */}
                    <motion.div
                      className="absolute -inset-1 rounded-2xl pointer-events-none"
                      style={{
                        background: 'linear-gradient(90deg, rgba(34,211,238,0.25), rgba(59,130,246,0.25), rgba(168,85,247,0.25))',
                        filter: 'blur(14px)'
                      }}
                      animate={{ opacity: [0.35, 0.6, 0.35] }}
                      transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                    />

                    {/* Rotating energy ring */}
                    <motion.div
                      className="absolute -inset-0.5 rounded-2xl border pointer-events-none"
                      style={{
                        borderImageSlice: 1,
                        borderWidth: '2px',
                        borderImageSource: 'linear-gradient(90deg, rgba(34,211,238,1), rgba(59,130,246,0.6), rgba(168,85,247,1))'
                      }}
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
                    />

                    {/* Light sweep */}
                    <motion.div
                      className="absolute inset-0 rounded-xl pointer-events-none"
                      style={{
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.16), transparent)'
                      }}
                      animate={{ x: ['-120%', '120%'] }}
                      transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
                    />

                    {/* Click ripples */}
                    {cartAnimation && (
                      <>
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={`ripple-${i}`}
                            className="absolute inset-0 rounded-xl border-2 border-cyan-400/40"
                            initial={{ scale: 0.85, opacity: 0.6 }}
                            animate={{ scale: 1.2 + i * 0.25, opacity: 0 }}
                            transition={{ duration: 0.9 + i * 0.2, ease: 'easeOut' }}
                          />
                        ))}
                      </>
                    )}

                    {/* Subtle spark particles */}
                    <div className="absolute inset-0 pointer-events-none">
                      {[...Array(6)].map((_, i) => (
                        <motion.div
                          key={`spark-${i}`}
                          className="absolute w-1 h-1 rounded-full"
                          style={{
                            left: `${10 + i * 14}%`,
                            top: `${40 + (i % 3) * 10}%`,
                            background:
                              'radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(34,211,238,0.9) 40%, rgba(34,211,238,0) 70%)'
                          }}
                          animate={{
                            y: [0, -6, 0],
                            opacity: [0.3, 1, 0.3],
                            scale: [0.8, 1.2, 0.8]
                          }}
                          transition={{ duration: 2 + i * 0.2, repeat: Infinity }}
                        />
                      ))}
                    </div>
                  </GlitchButton>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Enhanced Price Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 2.2 }}
            >
            <HoloCard className="p-6" glowColor="green">
                <motion.div 
                  className="flex items-center gap-6 mb-4"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 2.4 }}
                >
                  <motion.div 
                    className="text-4xl font-black bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent"
                    initial={{ scale: 0, rotate: -10 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ duration: 0.5, delay: 2.6, ease: "easeOut" }}
                  >
                    ${product.base_price}
                  </motion.div>
                  <motion.div 
                    className="text-2xl text-gray-400 line-through"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 2.8 }}
                  >
                    ${product.compare_price}
                  </motion.div>
                  <motion.div 
                    className="bg-gradient-to-r from-red-500 to-orange-500 px-3 py-1 rounded-full text-sm font-black"
                    initial={{ scale: 0, rotate: 180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ duration: 0.5, delay: 3.0, ease: "easeOut" }}
                  >
                  {product.discount}% OFF
                  </motion.div>
                </motion.div>
              
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-2 text-red-400">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="font-bold">Only {product.stock_quantity} left!</span>
                </div>
                <div className="text-cyan-400 font-mono">
                   ID: VL-{String(product.id).padStart(4, '0')}-GX
                </div>
              </div>
            </HoloCard>
            </motion.div>

            {/* Enhanced Product Description */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 3.2 }}
            >
            <HoloCard className="p-6" glowColor="purple">
                <motion.h3 
                  className="text-xl font-black mb-4 flex items-center gap-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 3.4 }}
                >
                  <motion.div
                    initial={{ scale: 0, rotate: -90 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ duration: 0.5, delay: 3.6, ease: "easeOut" }}
                  >
                <Target className="w-6 h-6 text-purple-400" />
                  </motion.div>
                MISSION BRIEFING
                </motion.h3>
                <motion.p 
                  className="text-gray-300 leading-relaxed mb-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 3.8 }}
                >
                {product.description}
                </motion.p>
                
                {/* Mask-Specific Information */}
                {product.material && (
                  <motion.div 
                    className="mt-6 p-4 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-xl"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 4.0 }}
                  >
                    <h4 className="text-lg font-bold text-cyan-400 mb-3 flex items-center gap-2">
                      <Package className="w-5 h-5" />
                      Product Specifications
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      {product.material && (
                        <div>
                          <span className="text-gray-400">Material:</span>
                          <span className="text-white ml-2">{product.material}</span>
                        </div>
                      )}
                      {product.protection && (
                        <div>
                          <span className="text-gray-400">Protection:</span>
                          <span className="text-white ml-2">{product.protection}</span>
                        </div>
                      )}
                      {product.washable && (
                        <div>
                          <span className="text-gray-400">Care Instructions:</span>
                          <span className="text-white ml-2">{product.washable}</span>
                        </div>
                      )}
                      {product.brand && (
                        <div>
                          <span className="text-gray-400">Brand:</span>
                          <span className="text-white ml-2">{product.brand}</span>
                        </div>
                      )}
                      {product.modelNumber && (
                        <div>
                          <span className="text-gray-400">Model:</span>
                          <span className="text-white ml-2">{product.modelNumber}</span>
                        </div>
                      )}
                      {product.placeOfOrigin && (
                        <div>
                          <span className="text-gray-400">Origin:</span>
                          <span className="text-white ml-2">{product.placeOfOrigin}</span>
                        </div>
                      )}
                      {product.gender && (
                        <div>
                          <span className="text-gray-400">Gender:</span>
                          <span className="text-white ml-2">{product.gender}</span>
                        </div>
                      )}
                      {product.ageGroup && (
                        <div>
                          <span className="text-gray-400">Age Group:</span>
                          <span className="text-white ml-2">{product.ageGroup}</span>
                        </div>
                      )}
                      {product.headCircumference && (
                        <div>
                          <span className="text-gray-400">Head Circumference:</span>
                          <span className="text-white ml-2">{product.headCircumference}</span>
                        </div>
                      )}
                      {product.printingMethods && (
                        <div>
                          <span className="text-gray-400">Printing Methods:</span>
                          <span className="text-white ml-2">{product.printingMethods}</span>
                        </div>
                      )}
                      {product.technics && (
                        <div>
                          <span className="text-gray-400">Technics:</span>
                          <span className="text-white ml-2">{product.technics}</span>
                        </div>
                      )}
                      {product.needleDetection && (
                        <div>
                          <span className="text-gray-400">Needle Detection:</span>
                          <span className="text-white ml-2">{product.needleDetection}</span>
                        </div>
                      )}
                      {product.keywords && (
                        <div>
                          <span className="text-gray-400">Keywords:</span>
                          <span className="text-white ml-2">{product.keywords}</span>
                        </div>
                      )}
                      {product.usage && (
                        <div>
                          <span className="text-gray-400">Usage:</span>
                          <span className="text-white ml-2">{product.usage}</span>
                        </div>
                      )}
                      {product.use && (
                        <div>
                          <span className="text-gray-400">Use:</span>
                          <span className="text-white ml-2">{product.use}</span>
                        </div>
                      )}
                      {product.design && (
                        <div>
                          <span className="text-gray-400">Design:</span>
                          <span className="text-white ml-2">{product.design}</span>
                        </div>
                      )}
                      {product.moq && (
                        <div>
                          <span className="text-gray-400">MOQ:</span>
                          <span className="text-white ml-2">{product.moq}</span>
                        </div>
                      )}
                      {product.packing && (
                        <div>
                          <span className="text-gray-400">Packing:</span>
                          <span className="text-white ml-2">{product.packing}</span>
                        </div>
                      )}
                      {product.service && (
                        <div>
                          <span className="text-gray-400">Service:</span>
                          <span className="text-white ml-2">{product.service}</span>
                        </div>
                      )}
                      {product.quality && (
                        <div>
                          <span className="text-gray-400">Quality:</span>
                          <span className="text-white ml-2">{product.quality}</span>
                        </div>
                      )}
                      {product.usage && (
                        <div>
                          <span className="text-gray-400">Usage:</span>
                          <span className="text-white ml-2">{product.usage}</span>
                        </div>
                      )}
                      {product.season && (
                        <div>
                          <span className="text-gray-400">Season:</span>
                          <span className="text-white ml-2">{product.season}</span>
                        </div>
                      )}
                      {product.functionality && (
                        <div>
                          <span className="text-gray-400">Function:</span>
                          <span className="text-white ml-2">{product.functionality}</span>
                        </div>
                      )}
                      {product.feature && (
                        <div>
                          <span className="text-gray-400">Feature:</span>
                          <span className="text-white ml-2">{product.feature}</span>
                        </div>
                      )}
                    </div>
                    
                    {product.applicableScenes && product.applicableScenes.length > 0 && (
                      <div className="mt-4">
                        <span className="text-gray-400 text-sm">Applicable Scenes:</span>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {product.applicableScenes.map((scene, index) => (
                            <span key={index} className="px-2 py-1 bg-cyan-500/20 text-cyan-300 text-xs rounded-full">
                              {scene}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {(product.packaging || product.singlePackageSize || product.singleGrossWeight) && (
                      <div className="mt-4 p-3 bg-black/20 rounded-lg">
                        <h5 className="text-cyan-400 font-semibold mb-2">Packaging Details</h5>
                        <div className="text-sm space-y-1">
                          {product.packaging && (
                            <div>
                              <span className="text-gray-400">Packaging:</span>
                              <span className="text-white ml-2">{product.packaging}</span>
                            </div>
                          )}
                          {product.singlePackageSize && (
                            <div>
                              <span className="text-gray-400">Package Size:</span>
                              <span className="text-white ml-2">{product.singlePackageSize}</span>
                            </div>
                          )}
                          {product.singleGrossWeight && (
                            <div>
                              <span className="text-gray-400">Weight:</span>
                              <span className="text-white ml-2">{product.singleGrossWeight}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
                
                {/* Detailed Reviews Section */}
                {product.detailedReviews && product.detailedReviews.length > 0 && (
                  <motion.div 
                    className="mt-6 p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 4.2 }}
                  >
                    <h4 className="text-lg font-bold text-purple-400 mb-4 flex items-center gap-2">
                      <Star className="w-5 h-5" />
                      Customer Reviews
                    </h4>
                    <div className="space-y-4">
                      {product.detailedReviews.map((review, index) => (
                        <motion.div
                          key={index}
                          className="p-3 bg-black/20 rounded-lg border border-white/10"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5, delay: 4.4 + index * 0.1 }}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < review.rating
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'text-gray-600'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm font-semibold text-white">{review.title}</span>
                            {review.verified && (
                              <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                                Verified
                              </span>
                            )}
                          </div>
                          <p className="text-gray-300 text-sm mb-2">{review.content}</p>
                          <div className="text-xs text-gray-400">- {review.author}</div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
                
                {/* Enhanced Stats Grid */}
                <motion.div 
                  className="grid grid-cols-2 gap-4 mt-6"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 4.0 }}
                >
                  <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 4.2 }}
                  >
                <CyberProgress label="Hype Level" value={product.stats.hypeLevel} color="cyan" />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 4.4 }}
                  >
                <CyberProgress label="Street Cred" value={product.stats.streetCred} color="pink" />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 4.6 }}
                  >
                <CyberProgress label="Exclusivity" value={product.stats.exclusivity} color="green" />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 4.8 }}
                  >
                <CyberProgress label="Community" value={product.stats.community} max={200} color="cyan" />
                  </motion.div>
                </motion.div>
            </HoloCard>
            </motion.div>

            {/* Enhanced Vault Features Section */}
            <VaultFeatures product={product} />

            {/* Trust Badges */}
            <HoloCard className="p-6" glowColor="cyan">
              <h3 className="text-lg font-black mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-cyan-400" />
                SECURITY PROTOCOLS
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Shield, label: 'Encrypted', desc: '256-bit SSL', color: 'text-blue-400' },
                  { icon: Truck, label: 'Free Ship', desc: 'Orders $150+', color: 'text-green-400' },
                  { icon: RotateCcw, label: 'Returns', desc: '30 days', color: 'text-purple-400' },
                  { icon: Award, label: 'Authentic', desc: 'Verified', color: 'text-yellow-400' }
                ].map((badge, idx) => (
                  <motion.div
                    key={idx}
                    className="flex items-center gap-3 p-3 bg-white/5 rounded-lg backdrop-blur-sm"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <badge.icon className={`w-6 h-6 ${badge.color}`} />
                    <div>
                      <div className="text-sm font-bold">{badge.label}</div>
                      <div className="text-xs text-gray-400">{badge.desc}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </HoloCard>
          </motion.div>
        </motion.div>

        {/* Features Section */}
        <motion.section
          className="mb-16"
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <h2 className="text-4xl font-black mb-12 text-center">
            <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              NEXT-GEN FEATURES
            </span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {product.features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.1 * index }}
              >
                <HoloCard className="p-6 h-full group">
                  <div className="space-y-4">
                    <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                      {feature.icon}
                    </div>
                    <h3 className="font-bold text-lg">{feature.text}</h3>
                    <CyberProgress 
                      value={feature.level} 
                      max={100} 
                      label="Tech Level"
                      color="cyan"
                    />
                  </div>
                </HoloCard>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Reviews Section */}
        <motion.section
          className="mb-16"
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <h2 className="text-4xl font-black mb-12 text-center">
            <span className="bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              COMMUNITY INTEL
            </span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[
              {
                name: "CYBER_ALEX",
                handle: "@cybr_alex",
                rating: 5,
                review: "This hoodie is absolutely insane! 🔥 The quality blew my mind and the cyber aesthetic is perfect. VLANCO never disappoints.",
                verified: true,
                level: 94
              },
              {
                name: "NEON_JORDAN",
                handle: "@neon_j",
                rating: 5,
                review: "Pure fire! 🚀 The nano-tech fabric feels incredible and the holographic elements catch light perfectly. Street certified!",
                verified: true,
                level: 87
              },
              {
                name: "MATRIX_SAM",
                handle: "@mtx_sam",
                rating: 4,
                review: "Love the design and fit! The cyber blue colorway is my favorite. Only wish there were more limited drops like this one.",
                verified: true,
                level: 76
              }
            ].map((review, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.2 * index }}
              >
                <HoloCard className="p-6 h-full">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-black text-cyan-400">{review.name}</span>
                          {review.verified && (
                            <div className="bg-green-500 rounded-full p-1">
                              <Check className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="text-sm text-gray-400 font-mono">{review.handle}</div>
                      </div>
                      
                      <div className="text-right">
                        <div className="flex mb-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'
                              }`}
                            />
                          ))}
                        </div>
                        <div className="text-xs bg-gradient-to-r from-cyan-500 to-purple-500 px-2 py-1 rounded font-bold">
                          LVL {review.level}
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-gray-300 text-sm leading-relaxed">{review.review}</p>
                  </div>
                </HoloCard>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Related Products */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <h2 className="text-4xl font-black mb-12 text-center">
            <span className="bg-gradient-to-r from-pink-400 via-red-400 to-orange-400 bg-clip-text text-transparent">
              MORE FROM THE VAULT
            </span>
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {productImages.map((image, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.1 * index }}
              >
                <HoloCard className="group cursor-pointer p-0 overflow-hidden">
                  <div className="relative">
                    <img
                      src={image}
                      alt={`Product ${index + 1}`}
                       className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-300 ease-out"
                    />
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="font-black text-lg mb-1">CYBER PIECE #{index + 1}</h3>
                        <p className="text-cyan-400 text-sm">Limited Genesis</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-green-400 font-black">$199</span>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm">4.{8 + index}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Hot badge */}
                    <div className="absolute top-3 right-3 bg-gradient-to-r from-red-500 to-orange-500 px-2 py-1 rounded text-xs font-black animate-pulse">
                      🔥 HOT
                    </div>
                  </div>
                </HoloCard>
              </motion.div>
            ))}
          </div>
        </motion.section>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {zoomedImage && (
          <motion.div
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setZoomedImage(null)}
          >
            <motion.div
              className="relative max-w-4xl max-h-[90vh]"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <img
                src={zoomedImage}
                alt="Zoomed product"
                className="w-full h-full object-contain rounded-xl"
              />
              <GlitchButton
                variant="ghost"
                className="!absolute top-4 right-4 !p-3"
                onClick={() => setZoomedImage(null)}
              >
                ×
              </GlitchButton>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSizeGuide && (
          <motion.div
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowSizeGuide(false)}
          >
            <motion.div
              className="bg-black/80 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-3xl font-black bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  SIZE MATRIX
                </h3>
                <GlitchButton
                  variant="ghost"
                  className="!p-2"
                  onClick={() => setShowSizeGuide(false)}
                >
                  <span className="text-2xl">×</span>
                </GlitchButton>
              </div>
              
              <HoloCard className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-cyan-500/30">
                        <th className="text-left p-4 font-black text-cyan-400">SIZE</th>
                        <th className="text-left p-4 font-black text-cyan-400">CHEST</th>
                        <th className="text-left p-4 font-black text-cyan-400">LENGTH</th>
                        <th className="text-left p-4 font-black text-cyan-400">SLEEVE</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { size: 'XS', chest: '34-36"', length: '26"', sleeve: '24"' },
                        { size: 'S', chest: '36-38"', length: '27"', sleeve: '25"' },
                        { size: 'M', chest: '38-40"', length: '28"', sleeve: '26"' },
                        { size: 'L', chest: '40-42"', length: '29"', sleeve: '27"' },
                        { size: 'XL', chest: '42-44"', length: '30"', sleeve: '28"' },
                        { size: 'XXL', chest: '44-46"', length: '31"', sleeve: '29"' }
                      ].map((row, index) => (
                        <motion.tr
                          key={row.size}
                          className="border-b border-white/10 hover:bg-cyan-500/5"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <td className="p-4 font-black text-cyan-400">{row.size}</td>
                          <td className="p-4 font-mono">{row.chest}</td>
                          <td className="p-4 font-mono">{row.length}</td>
                          <td className="p-4 font-mono">{row.sleeve}</td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="mt-8 pt-6 border-t border-white/20">
                  <h4 className="font-black mb-4 text-yellow-400 text-lg">📐 MEASUREMENT PROTOCOL:</h4>
                  <ul className="space-y-3 text-sm text-gray-300">
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full" />
                      <strong className="text-white">Chest:</strong> Measure around the fullest part of your chest
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full" />
                      <strong className="text-white">Length:</strong> Measure from shoulder to bottom hem
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full" />
                      <strong className="text-white">Sleeve:</strong> Measure from shoulder seam to cuff
                    </li>
                  </ul>
                </div>
              </HoloCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Floating Cart Indicator */}
      <FloatingCartIndicator
        itemCount={itemCount}
        onClick={handleCartClick}
        isVisible={showCartIndicator || itemCount > 0}
      />

      {/* Success Animation Overlay */}
      <AnimatePresence>
        {cartAnimation && (
          <motion.div
            className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="text-center"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
            >
              <div className="text-8xl mb-4">🚀</div>
              <motion.div
                className="text-2xl font-black bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                DEPLOYED TO VAULT!
              </motion.div>
              <motion.div
                className="text-lg text-gray-300 mt-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                Your item has been secured in the digital vault
              </motion.div>
              
              {/* Particle effects */}
              <div className="absolute inset-0 pointer-events-none">
                {Array.from({ length: 20 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-cyan-400 rounded-full"
                    initial={{
                      x: 0,
                      y: 0,
                      opacity: 1,
                      scale: 1
                    }}
                    animate={{
                      x: (Math.random() - 0.5) * 400,
                      y: (Math.random() - 0.5) * 400,
                      opacity: 0,
                      scale: 0
                    }}
                    transition={{
                      duration: 2,
                      delay: i * 0.1,
                      ease: "easeOut"
                    }}
                  />
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Scrollbar Styles */}
       <style>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
     </motion.div>
     </>
  );
};

export default VlancoProductPage;