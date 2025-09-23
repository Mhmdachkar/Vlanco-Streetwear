
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, ShoppingCart, User, Menu, X, Heart, Sparkles, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import EnhancedAuthModal from './EnhancedAuthModal';
import CartSidebar from './CartSidebar';
import { HeaderLogo } from './VlancoLogo';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import MiniCartPopover from '@/components/ui/MiniCartPopover';
import WishlistPopover from '@/components/ui/WishlistPopover';
import { createScrollHandler, scrollToElement } from '@/utils/scrollPerformance';

const Navigation = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { itemCount } = useCart();
  const { itemCount: wishlistCount, items: wishlistItems } = useWishlist();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCartSidebar, setShowCartSidebar] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [wishlistUpdateTrigger, setWishlistUpdateTrigger] = useState(0);
  
  // Debug wishlist count - force refresh when trigger changes
  const localStorageWishlist = React.useMemo(() => {
    return JSON.parse(localStorage.getItem('vlanco_wishlist') || '[]');
  }, [wishlistUpdateTrigger]);
  
  const fallbackCount = localStorageWishlist.length;
  const displayCount = wishlistCount > 0 ? wishlistCount : fallbackCount;
  

  // Listen for wishlist updates
  useEffect(() => {
    const handleWishlistUpdate = () => {
      setWishlistUpdateTrigger(prev => prev + 1);
    };

    window.addEventListener('wishlistUpdated', handleWishlistUpdate);
    return () => window.removeEventListener('wishlistUpdated', handleWishlistUpdate);
  }, []);

  // Ultra-optimized smooth scrolling functionality
  useEffect(() => {
    const scrollHandler = createScrollHandler(
      (scrollY) => setIsScrolled(scrollY > 20),
      { useRAF: true, passive: true }
    );
    
    scrollHandler.addListener();
    return scrollHandler.removeListener;
  }, []);

  // Reset signing out state when user changes
  useEffect(() => {
    if (!user) {
      setIsSigningOut(false);
      setShowUserMenu(false); // Close user menu when signed out
      setShowCartSidebar(false); // Close cart sidebar when signed out
    }
  }, [user]);

  // Ultra-optimized smooth scroll function
  const smoothScrollTo = (elementId: string) => {
    const element = document.getElementById(elementId);
    if (element) {
      scrollToElement(element, {
        offset: 80, // Account for fixed header
        duration: 1.2
      });
    }
  };

  const navLinks = [
    { name: 'Home', href: '/', scrollTo: 'hero' },
    { name: 'T-Shirts', href: '/tshirt-collection', scrollTo: 'collections' },
    { name: 'Masks', href: '/masks', scrollTo: 'collections' },
    { name: 'Accessories', href: '/accessories', scrollTo: 'collections' },
    { name: 'About Us', href: '/about', scrollTo: null },
  ];

  // Animated car + smoke intro for brand
  const CarSmokeLogoComponent: React.FC<{ onClick: () => void }> = ({ onClick }) => {
    const [play, setPlay] = useState(true);
    const [photoReady, setPhotoReady] = useState(false);
    const [hasPlayed, setHasPlayed] = useState(() => sessionStorage.getItem('vlanco_nav_anim_played') === '1');

    useEffect(() => {
      const t = setTimeout(() => setPlay(false), 5200);
      return () => clearTimeout(t);
    }, []);

    // Try to load user-provided silhouette placed in public folder as /supercar-720s.png
    const photoUrl = useMemo(() => new URL('/supercar-720s.png', window.location.origin).toString(), []);
    useEffect(() => {
      const img = new Image();
      img.src = photoUrl;
      img.onload = () => setPhotoReady(true);
      img.onerror = () => setPhotoReady(false);
    }, [photoUrl]);

    return (
      <div className="relative flex items-center gap-3 sm:gap-4 select-none cursor-pointer" onClick={onClick}>
        {/* Road */}
        <motion.div
          className="relative h-12 sm:h-14 w-40 sm:w-56 rounded-2xl bg-[#000000] border border-transparent overflow-hidden"
          initial={false}
          animate={play ? { boxShadow: ["0 0 0 rgba(0,0,0,0)", "0 10px 30px rgba(59,130,246,0.25)", "0 0 0 rgba(0,0,0,0)"] } : {}}
          transition={{ duration: 1.2, delay: 0.6 }}
        >
          {/* Lane marks */}
          <div className="absolute inset-x-2 bottom-3 h-1">
            {[...Array(4)].map((_, i) => (
              <motion.div key={`lane-${i}`} className="inline-block w-4 sm:w-6 h-0.5 bg-white/50 mx-2 rounded"
                initial={{ opacity: 0, x: 0 }}
                animate={play ? { opacity: [0, 1, 0], x: [-10, 0, 10] } : { opacity: 0 }}
                transition={{ duration: 1.2, delay: i * 0.08, repeat: 1 }}
              />
            ))}
          </div>

          {/* If a custom 720S silhouette image is provided in /public, use it. Otherwise, fallback to SVG. */}
          {photoReady ? (
            (hasPlayed ? (
              <div className="absolute inset-0">
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `url(${photoUrl})`,
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: 'contain',
                    backgroundPosition: 'center 45%'
                  }}
                />
              </div>
            ) : (
            <motion.div
              className="absolute inset-0"
              initial={{ x: '110%' }}
              animate={{ x: 0 }}
              transition={{ duration: 1.0, ease: 'easeOut' }}
              onAnimationComplete={() => { sessionStorage.setItem('vlanco_nav_anim_played', '1'); setHasPlayed(true); }}
            >
              {/* Car image as background so it scales perfectly */}
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `url(${photoUrl})`,
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: 'contain',
                  backgroundPosition: 'center 45%'
                }}
              />

              {/* Arrival smoke synced with car wrapper translation */}
              {[...Array(10)].map((_, i) => (
                <motion.div
                  key={`imgsmoke-${i}`}
                  className="absolute rounded-full"
                  style={{
                    width: 6,
                    height: 6,
                    right: '18%', // behind rear wheel while moving left
                    bottom: '18%',
                    background: 'rgba(255,255,255,0.45)',
                    filter: 'blur(1.8px)'
                  }}
                  initial={{ opacity: 0, scale: 0.2, x: 0, y: 0 }}
                  animate={{
                    opacity: [0, 0.9, 0],
                    scale: [0.2, 1.2, 1.6],
                    x: [6 + i * 4, 14 + i * 7],
                    y: [-2 - i * 1.2, -8 - i * 2]
                  }}
                  transition={{ duration: 1.5, delay: 0.2 + i * 0.06, ease: 'easeOut' }}
                />
              ))}
            </motion.div>
            ))
          ) : (
          <motion.svg
            viewBox="0 0 320 120"
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ top: '45%', left: '50%' }}
            width="128" height="46"
            initial={hasPlayed ? false : { x: 200, rotate: 0, y: 0 }}
            animate={hasPlayed 
              ? { x: 10, rotate: 9, y: -1 }
              : { x: 11, rotate: 9, y: -1, transition: { duration: 1.55, ease: 'easeOut' } }
            }
          >
            <defs>
              <linearGradient id="carPaint" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#60a5fa" />
                <stop offset="50%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* 720S side profile silhouette based on provided reference */}
            <path d="M24 80
              C34 73, 50 66, 72 60
              C96 54, 126 50, 156 49
              C186 48, 214 51, 238 55
              C260 59, 284 67, 302 74
              L312 78 L318 80 L312 76
              C296 64, 270 56, 242 52
              C214 48, 182 46, 150 47
              C118 48, 88 52, 62 58
              C44 62, 32 68, 24 74 Z"
              fill="url(#carPaint)" filter="url(#glow)" />

            {/* Front splitter */}
            <path d="M28 78 C42 72, 64 68, 86 66 L88 70 C66 72, 46 75, 30 80 Z" fill="#0f172a" opacity="0.7" />

            {/* Rear diffuser hint */}
            <path d="M300 74 L316 76 L306 82 L292 80 Z" fill="#0f172a" opacity="0.7" />

            {/* Canopy / greenhouse - long teardrop */}
            <path d="M142 40 C160 32, 196 32, 212 36 L204 58 L150 58 Z" fill="#38bdf8" opacity="0.9" />

            {/* Deep side blade / intake curve characteristic of 720S */}
            <path d="M96 70 C132 64, 168 60, 214 60 C192 66, 156 70, 120 74 Z" fill="#0ea5e9" opacity="0.45" />

            {/* Side intake highlight */}
            <path d="M188 58 C200 56, 214 56, 226 58 C218 60, 206 60, 194 60 Z" fill="#0ea5e9" opacity="0.5" />
            {/* Headlights */}
            <g>
              <circle cx="292" cy="74" r="3" fill="#fff" />
              <motion.rect x="296" y="70" width="22" height="8" rx="4" fill="#ffffff" opacity="0.8"
                initial={{ opacity: 0 }}
                animate={play ? { opacity: [0, 0.8, 0.2, 0.8] } : { opacity: 0.6 }}
                transition={{ duration: 1.2, repeat: 2 }}
              />
            </g>
            {/* Exhaust flames (drift) */}
            <motion.path d="M30 76 C16 75, 14 82, 30 85" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round"
              initial={{ opacity: 0, pathLength: 0 }}
              animate={play ? { opacity: [0, 1, 0.2, 1], pathLength: [0, 1, 1, 1] } : { opacity: 0.8 }}
              transition={{ duration: 0.9, repeat: 2 }}
            />
            {/* Wheels + brake calipers */}
            <g>
              <motion.circle cx="118" cy="78" r="9" fill="#0f172a"
                animate={play ? { rotate: 360, filter: ["blur(0px)", "blur(0.6px)", "blur(0px)"] } : { rotate: 0 }}
                transition={{ duration: 1.2, ease: 'linear' }}
                style={{ transformOrigin: '118px 78px' }}
              />
              <motion.rect x="116" y="73" width="3" height="6" rx="1" fill="#ef4444"
                initial={{ rotate: 0 }}
                animate={play ? { rotate: [0, -40, -40] } : { rotate: -40 }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
                style={{ transformOrigin: '118px 78px' }}
              />
            </g>
            <g>
              <motion.circle cx="244" cy="78" r="9" fill="#0f172a"
                animate={play ? { rotate: 360, filter: ["blur(0px)", "blur(0.6px)", "blur(0px)"] } : { rotate: 0 }}
                transition={{ duration: 1.2, ease: 'linear' }}
                style={{ transformOrigin: '244px 78px' }}
              />
              <motion.rect x="242" y="73" width="3" height="6" rx="1" fill="#ef4444"
                initial={{ rotate: 0 }}
                animate={play ? { rotate: [0, -40, -40] } : { rotate: -40 }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
                style={{ transformOrigin: '244px 78px' }}
              />
            </g>

            {/* Wheel arches for realism */}
            <path d="M92 78 C100 66, 130 66, 144 78" stroke="#0f172a" strokeWidth="2" opacity="0.6" />
            <path d="M218 78 C226 66, 256 66, 270 78" stroke="#0f172a" strokeWidth="2" opacity="0.6" />

            {/* Headlight outline */}
            <path d="M294 72 C300 70, 306 70, 310 74 C304 76, 298 76, 294 74 Z" fill="#ffffff" opacity="0.9" />
          </motion.svg>
          )}

          {/* Two-stage smoke with wind shear */}
          {[...Array(10)].map((_, i) => (
            <motion.div
              key={`smoke-stage1-${i}`}
              className="absolute bottom-2 left-6 w-2.5 h-2.5 rounded-full bg-white/45"
              initial={{ opacity: 0, scale: 0.2, x: 0, y: 0 }}
              animate={play ? {
                opacity: [0, 0.9, 0.4],
                scale: [0.2, 1.1, 1.3],
                x: [-6 - i * 5, -10 - i * 8],
                y: [-2 - i * 0.8, -5 - i * 1.6]
              } : { opacity: 0 }}
              transition={{ duration: 1.2, delay: 0.5 + i * 0.05, ease: 'easeOut' }}
              style={{ filter: 'blur(1.8px)' }}
            />
          ))}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={`smoke-stage2-${i}`}
              className="absolute bottom-2 left-10 w-3 h-3 rounded-full bg-white/35"
              initial={{ opacity: 0, scale: 0.4, x: 0, y: 0 }}
              animate={play ? {
                opacity: [0, 0.7, 0],
                scale: [0.4, 1.6 + i * 0.06, 2.0 + i * 0.08],
                x: [-10 - i * 7, -20 - i * 12],
                y: [-4 - i * 1.6, -10 - i * 3]
              } : { opacity: 0 }}
              transition={{ duration: 1.6, delay: 0.8 + i * 0.06, ease: 'easeOut' }}
              style={{ filter: 'blur(2.2px)' }}
            />
          ))}

          {/* Sparks near rear wheel during drift */}
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={`spark-${i}`}
              className="absolute bottom-3 left-14 w-1 h-1 bg-yellow-300 rounded-full"
              initial={{ opacity: 0, scale: 0.5, x: 0, y: 0 }}
              animate={play ? { opacity: [0, 1, 0], x: [0, -4 - i * 2], y: [0, -2 - i], scale: [0.5, 1.2, 0.6] } : { opacity: 0 }}
              transition={{ duration: 0.6, delay: 0.9 + i * 0.05, ease: 'easeOut' }}
              style={{ boxShadow: '0 0 6px rgba(250, 204, 21, 0.8)' }}
            />
          ))}

          {/* Subtle skid arc */}
          <motion.div
            className="absolute bottom-3 left-8 w-16 h-8 rounded-full border-2 border-black/40 opacity-30"
            initial={{ opacity: 0 }}
            animate={play ? { opacity: [0, 0.3, 0.15] } : { opacity: 0.15 }}
            transition={{ duration: 0.9, delay: 1.0 }}
            style={{ transform: 'rotate(-25deg)' }}
          />
        </motion.div>

        {/* VLANCO reveal after smoke */}
        <motion.div
          className="text-2xl sm:text-3xl font-black"
          initial={{ opacity: 0, filter: 'blur(8px)', x: -10 }}
          animate={{ opacity: 1, filter: 'blur(0px)', x: 0 }}
          transition={{ delay: 1.4, duration: 0.6, ease: 'easeOut' }}
        >
          <motion.span
            className="text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text"
            animate={{ backgroundPosition: ['0%', '100%', '0%'] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            style={{ backgroundSize: '200% 200%' }}
          >
            VLANCO
          </motion.span>
        </motion.div>
      </div>
    );
  };

  const CarSmokeLogo = React.memo(CarSmokeLogoComponent);

  return (
    <>
      <motion.nav 
        className={`fixed top-0 left-0 right-0 z-[100] backdrop-blur-md border-b transition-all duration-300 ${
          isScrolled 
            ? 'bg-background/95 border-cyan-400/20 shadow-lg shadow-cyan-400/10' 
            : 'bg-background/80 border-border'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6">
          <div className="flex items-center justify-between h-14 sm:h-16 md:h-18">
            {/* Brand Logo & Text */}
            <div className="flex items-center gap-3">
              <CarSmokeLogo onClick={useCallback(() => smoothScrollTo('hero'), [])} />
            </div>

            {/* Enhanced Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
              {navLinks.map((link, index) => (
                <motion.a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    if (link.scrollTo) {
                      smoothScrollTo(link.scrollTo);
                    } else {
                      navigate(link.href);
                    }
                  }}
                  className="relative text-foreground hover:text-cyan-400 transition-colors duration-300 font-medium group"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -2 }}
                >
                  {link.name}
                  {/* Animated Underline */}
                  <motion.div
                    className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500"
                    initial={{ width: 0 }}
                    whileHover={{ width: '100%' }}
                    transition={{ duration: 0.3 }}
                  />
                  {/* Hover Glow */}
                  <motion.div
                    className="absolute inset-0 bg-cyan-400/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  />
                </motion.a>
              ))}
            </div>

            {/* Enhanced Right Side Icons */}
            <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
              {/* Enhanced Wishlist */}
              <HoverCard openDelay={150} closeDelay={100}>
                <HoverCardTrigger asChild>
                  <motion.button 
                    onClick={() => {
                      console.log('🔧 Wishlist button clicked:', { user: !!user });
                      if (user) {
                        navigate('/wishlist');
                      } else {
                        console.log('🔧 User not authenticated, opening auth modal...');
                        setShowAuthModal(true);
                      }
                    }}
                    className="relative p-1 sm:p-1.5 hover:bg-red-400/10 rounded-full transition-all duration-300 group"
                    title={user ? "Wishlist" : "Sign In to View Wishlist"}
                    whileHover={{ scale: 1.1, rotate: -5 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:text-red-500 transition-colors" />
                    </motion.div>
                    
                    {/* Wishlist Count Badge */}
                    {displayCount > 0 && (
                      <motion.div
                        className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      >
                        {displayCount > 99 ? '99+' : displayCount}
                      </motion.div>
                    )}
                    
                    {/* Heartbeat Effect */}
                    <motion.div
                      className="absolute inset-0 bg-red-400/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0, 0.5, 0]
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity
                      }}
                    />
                  </motion.button>
                </HoverCardTrigger>
                <HoverCardContent className="hidden md:block p-0 w-80">
                  <WishlistPopover />
                </HoverCardContent>
              </HoverCard>

              {/* Enhanced Cart */}
              <HoverCard openDelay={150} closeDelay={100}>
                <HoverCardTrigger asChild>
                  <motion.button 
                    id="cart-icon"
                    data-cart-icon="true"
                  onClick={() => {
                      // Allow guests to access the cart sidebar too. Checkout can still enforce auth later.
                      setShowCartSidebar(true);
                    }}
                    className="relative p-1 sm:p-1.5 hover:bg-cyan-400/10 rounded-full transition-all duration-300 group"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.95 }}
                    title={user ? "Shopping Cart" : "Sign In to View Cart"}
                  >
                    <motion.div
                      animate={{ y: [0, -2, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:text-cyan-400 transition-colors" />
                    </motion.div>
                    {itemCount > 0 && (
                      <motion.span 
                        className="absolute -top-1 -right-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold"
                        animate={{ 
                          scale: [1, 1.2, 1],
                          rotate: [0, 10, -10, 0]
                        }}
                        transition={{ 
                          duration: 0.5,
                          repeat: Infinity,
                          repeatDelay: 2
                        }}
                      >
                        {itemCount}
                      </motion.span>
                    )}
                    {/* Cart Glow */}
                    <motion.div
                      className="absolute inset-0 bg-cyan-400/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    />
                  </motion.button>
                </HoverCardTrigger>
                <HoverCardContent className="hidden md:block p-0 w-80">
                  <MiniCartPopover />
                </HoverCardContent>
              </HoverCard>

              {/* Enhanced User Menu */}
              <div className="relative">
                <motion.button 
                  onClick={() => {
                    console.log('🔧 Profile icon clicked on HOME PAGE:', { 
                      user: !!user, 
                      showUserMenu, 
                      showAuthModal,
                      currentPage: window.location.pathname,
                      timestamp: new Date().toISOString()
                    });
                    if (user) {
                      setShowUserMenu(!showUserMenu);
                    } else {
                      console.log('🔧 Opening auth modal from HOME PAGE...');
                      setShowAuthModal(true);
                    }
                  }}
                  className="relative p-1 sm:p-1.5 hover:bg-cyan-400/10 rounded-full transition-all duration-300 group"
                  whileHover={{ scale: 1.1, rotate: -5 }}
                  whileTap={{ scale: 0.95 }}
                  title={user ? "User Menu" : "Sign In"}
                  style={{ 
                    zIndex: 101,
                    position: 'relative',
                    pointerEvents: 'auto',
                    cursor: 'pointer'
                  }}
                >
                  <motion.div
                    animate={{ 
                      scale: [1, 1.05, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ 
                      duration: 3, 
                      repeat: Infinity 
                    }}
                  >
                    <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:text-cyan-400 transition-colors" />
                  </motion.div>
                  {/* User Glow */}
                  <motion.div
                    className="absolute inset-0 bg-cyan-400/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  />
                </motion.button>

                {/* Enhanced User Dropdown */}
                <AnimatePresence>
                  {showUserMenu && user && (
                    <motion.div 
                      className="absolute right-0 top-full mt-2 w-48 bg-card/95 backdrop-blur-md border border-cyan-400/20 rounded-lg shadow-lg shadow-cyan-400/10 py-2"
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="px-4 py-2 border-b border-cyan-400/20">
                        <p className="font-semibold text-sm text-cyan-400">{user.email}</p>
                      </div>
                      <motion.a 
                        href="/profile" 
                        className="block px-4 py-2 hover:bg-cyan-400/10 transition-colors hover:text-cyan-400"
                        whileHover={{ x: 5 }}
                      >
                        Profile
                      </motion.a>
                      <motion.a 
                        href="/orders" 
                        className="block px-4 py-2 hover:bg-cyan-400/10 transition-colors hover:text-cyan-400"
                        whileHover={{ x: 5 }}
                      >
                        Orders
                      </motion.a>
                      <motion.a 
                        href="/wishlist" 
                        className="block px-4 py-2 hover:bg-cyan-400/10 transition-colors hover:text-cyan-400"
                        whileHover={{ x: 5 }}
                      >
                        Wishlist
                      </motion.a>
                      
                      <motion.button 
                        onClick={async () => {
                          if (isSigningOut) return;
                          
                          try {
                            setIsSigningOut(true);
                            console.log('🔄 Navigation: Starting sign out process...');
                            
                            // Add a timeout fallback to reset loading state
                            const timeoutId = setTimeout(() => {
                              console.warn('⚠️ Navigation: Sign out timeout, resetting loading state');
                              setIsSigningOut(false);
                            }, 10000); // 10 second timeout
                            
                            await signOut();
                            clearTimeout(timeoutId);
                            
                            console.log('✅ Navigation: Sign out completed, closing menu');
                            setShowUserMenu(false);
                          } catch (error) {
                            console.error('❌ Navigation: Sign out failed:', error);
                            setIsSigningOut(false); // Reset on error
                          }
                          // Don't reset isSigningOut on success - let auth state change handle it
                        }}
                        disabled={isSigningOut}
                        className={`block w-full text-left px-4 py-2 transition-colors border-t border-red-400/20 mt-2 pt-2 ${
                          isSigningOut 
                            ? 'text-red-400/50 cursor-not-allowed' 
                            : 'hover:bg-red-400/10 hover:text-red-400'
                        }`}
                        whileHover={!isSigningOut ? { x: 5 } : {}}
                        title={isSigningOut ? "Signing out..." : "Sign out of your account"}
                      >
                        {isSigningOut ? (
                          <span className="flex items-center gap-2">
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            >
                              ⏳
                            </motion.div>
                            Signing Out...
                          </span>
                        ) : (
                          '🚪 Sign Out'
                        )}
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Enhanced Mobile Menu Button */}
              <motion.button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-1 sm:p-1.5 hover:bg-cyan-400/10 rounded-full transition-all duration-300 group"
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  animate={{ rotate: isMobileMenuOpen ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {isMobileMenuOpen ? (
                    <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:text-cyan-400 transition-colors" />
                  ) : (
                    <Menu className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:text-cyan-400 transition-colors" />
                  )}
                </motion.div>
              </motion.button>
            </div>
          </div>

          {/* Enhanced Mobile Menu */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div 
                className="md:hidden border-t border-cyan-400/20 bg-background/95 backdrop-blur-md"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="py-4 space-y-2">
                  {navLinks.map((link, index) => (
                    <motion.a
                      key={link.name}
                      href={link.href}
                      onClick={(e) => {
                        e.preventDefault();
                        if (link.scrollTo) {
                          smoothScrollTo(link.scrollTo);
                        } else {
                          window.location.href = link.href;
                        }
                        setIsMobileMenuOpen(false);
                      }}
                      className="block px-4 py-3 hover:bg-cyan-400/10 rounded-lg transition-all duration-300 hover:text-cyan-400 group"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      whileHover={{ x: 10 }}
                    >
                      <span className="flex items-center gap-2">
                        {link.name}
                        <motion.div
                          className="w-1 h-1 bg-cyan-400 rounded-full opacity-0 group-hover:opacity-100"
                          animate={{ scale: [1, 1.5, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        />
                      </span>
                    </motion.a>
                  ))}
                  
                  {/* Mobile Auth Section */}
                  <div className="border-t border-cyan-400/20 pt-4 mt-4">
                    {user ? (
                      <div className="space-y-2">
                        <div className="px-4 py-2">
                          <p className="text-sm text-cyan-400 font-medium">Signed in as:</p>
                          <p className="text-xs text-cyan-400/70 truncate">{user.email}</p>
                        </div>
                        <motion.button
                          onClick={async () => {
                            if (isSigningOut) return;
                            
                            try {
                              setIsSigningOut(true);
                              console.log('🔄 Navigation Mobile: Starting sign out process...');
                              
                              // Add a timeout fallback to reset loading state
                              const timeoutId = setTimeout(() => {
                                console.warn('⚠️ Navigation Mobile: Sign out timeout, resetting loading state');
                                setIsSigningOut(false);
                              }, 10000); // 10 second timeout
                              
                              await signOut();
                              clearTimeout(timeoutId);
                              
                              console.log('✅ Navigation Mobile: Sign out completed, closing menu');
                              setIsMobileMenuOpen(false);
                            } catch (error) {
                              console.error('❌ Navigation Mobile: Sign out failed:', error);
                              setIsSigningOut(false); // Reset on error
                            }
                            // Don't reset isSigningOut on success - let auth state change handle it
                          }}
                          disabled={isSigningOut}
                          className={`block w-full text-left px-4 py-3 rounded-lg transition-all duration-300 group ${
                            isSigningOut 
                              ? 'text-red-400/50 cursor-not-allowed' 
                              : 'hover:bg-red-400/10 hover:text-red-400'
                          }`}
                          whileHover={!isSigningOut ? { x: 10 } : {}}
                        >
                          <span className="flex items-center gap-2">
                            {isSigningOut ? (
                              <>
                                <motion.div
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                >
                                  ⏳
                                </motion.div>
                                Signing Out...
                              </>
                            ) : (
                              <>
                                🚪 Sign Out
                                <motion.div
                                  className="w-1 h-1 bg-red-400 rounded-full opacity-0 group-hover:opacity-100"
                                  animate={{ scale: [1, 1.5, 1] }}
                                  transition={{ duration: 1, repeat: Infinity }}
                                />
                              </>
                            )}
                          </span>
                        </motion.button>
                      </div>
                    ) : (
                      <motion.button
                        onClick={() => {
                          setShowAuthModal(true);
                          setIsMobileMenuOpen(false);
                        }}
                        className="block w-full text-left px-4 py-3 hover:bg-cyan-400/10 rounded-lg transition-all duration-300 hover:text-cyan-400 group"
                        whileHover={{ x: 10 }}
                      >
                        <span className="flex items-center gap-2">
                          👤 Sign In
                          <motion.div
                            className="w-1 h-1 bg-cyan-400 rounded-full opacity-0 group-hover:opacity-100"
                            animate={{ scale: [1, 1.5, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                          />
                        </span>
                      </motion.button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.nav>

      {/* Enhanced Auth Modal */}
      <EnhancedAuthModal
        isOpen={showAuthModal}
        onClose={() => {
          console.log('🔧 Closing auth modal');
          setShowAuthModal(false);
        }}
        defaultMode="signin"
      />

      {/* Cart Sidebar */}
      <CartSidebar
        isOpen={showCartSidebar}
        onClose={() => setShowCartSidebar(false)}
      />
    </>
  );
};

export default Navigation;
