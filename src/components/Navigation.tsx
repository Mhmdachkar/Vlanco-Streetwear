
import { useState, useEffect } from 'react';
import { Search, ShoppingCart, User, Menu, X, Heart, Sparkles, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import AuthModal from './AuthModal';
import CartSidebar from './CartSidebar';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import MiniCartPopover from '@/components/ui/MiniCartPopover';
import WishlistPopover from '@/components/ui/WishlistPopover';

const Navigation = () => {
  const { user, signOut } = useAuth();
  const { itemCount } = useCart();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCartSidebar, setShowCartSidebar] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Smooth scrolling functionality
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Enhanced smooth scroll function with Lenis integration
  const smoothScrollTo = (elementId: string) => {
    const element = document.getElementById(elementId);
    if (element) {
      // Try to use Lenis if available
      const lenis = (window as any).lenis;
      if (lenis) {
        lenis.scrollTo(element, {
          offset: -80, // Account for fixed header
          duration: 1.5,
          easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
        });
      } else {
        // Fallback to native smooth scroll
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
          inline: 'nearest'
        });
      }
    }
  };

  const navLinks = [
    { name: 'Home', href: '/', scrollTo: 'hero' },
    { name: 'T-Shirts', href: '/tshirt-collection', scrollTo: 'collections' },
    { name: 'Masks', href: '/masks', scrollTo: 'collections' },
    { name: 'Accessories', href: '/accessories', scrollTo: 'collections' },
    { name: 'About Us', href: '/about', scrollTo: 'about' },
  ];

  return (
    <>
      <motion.nav 
        className={`fixed top-0 left-0 right-0 z-40 backdrop-blur-md border-b transition-all duration-300 ${
          isScrolled 
            ? 'bg-background/95 border-cyan-400/20 shadow-lg shadow-cyan-400/10' 
            : 'bg-background/80 border-border'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 sm:h-18">
            {/* Enhanced Logo */}
            <motion.div 
              className="text-xl sm:text-2xl font-black cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => smoothScrollTo('hero')}
            >
              <motion.span
                className="text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text"
                animate={{
                  backgroundPosition: ['0%', '100%', '0%']
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                style={{ backgroundSize: '200% 200%' }}
              >
                VLANCO
              </motion.span>
            </motion.div>

            {/* Enhanced Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
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
            <div className="flex items-center gap-2.5 sm:gap-3">
              {/* Enhanced Search */}
              <motion.button 
                className="relative p-2 hover:bg-cyan-400/10 rounded-full transition-all duration-300 group"
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                title="Search"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                >
                  <Search className="w-5 h-5 group-hover:text-cyan-400 transition-colors" />
                </motion.div>
                {/* Hover Glow */}
                <motion.div
                  className="absolute inset-0 bg-cyan-400/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                />
              </motion.button>

              {/* Enhanced Database Test Quick Access */}
              {user && (
                <motion.a 
                  href="/database-test"
                  className="relative p-2 hover:bg-cyan-400/10 rounded-full transition-all duration-300 group"
                  title="Database Test"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.div 
                    className="w-5 h-5 text-xs font-bold text-cyan-400 group-hover:text-cyan-300 transition-colors"
                    animate={{ 
                      scale: [1, 1.1, 1],
                      opacity: [0.8, 1, 0.8]
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity 
                    }}
                  >
                    DB
                  </motion.div>
                  {/* Pulsing Glow */}
                  <motion.div
                    className="absolute inset-0 bg-cyan-400/20 rounded-full"
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [0.3, 0.6, 0.3]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity
                    }}
                  />
                </motion.a>
              )}

              {/* Enhanced Wishlist */}
              <HoverCard openDelay={150} closeDelay={100}>
                <HoverCardTrigger asChild>
                  <motion.button 
                    onClick={() => window.location.href = '/wishlist'}
                    className="relative p-2 hover:bg-red-400/10 rounded-full transition-all duration-300 group"
                    title="Wishlist"
                    whileHover={{ scale: 1.1, rotate: -5 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Heart className="w-5 h-5 group-hover:text-red-500 transition-colors" />
                    </motion.div>
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
                    onClick={() => setShowCartSidebar(true)}
                    className="relative p-2 hover:bg-cyan-400/10 rounded-full transition-all duration-300 group"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.95 }}
                    title="Shopping Cart"
                  >
                    <motion.div
                      animate={{ y: [0, -2, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <ShoppingCart className="w-5 h-5 group-hover:text-cyan-400 transition-colors" />
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
                  onClick={() => user ? setShowUserMenu(!showUserMenu) : setShowAuthModal(true)}
                  className="relative p-2 hover:bg-cyan-400/10 rounded-full transition-all duration-300 group"
                  whileHover={{ scale: 1.1, rotate: -5 }}
                  whileTap={{ scale: 0.95 }}
                  title={user ? "User Menu" : "Sign In"}
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
                    <User className="w-5 h-5 group-hover:text-cyan-400 transition-colors" />
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
                      
                      {/* Database Testing Links */}
                      <div className="px-4 py-2 border-t border-cyan-400/20">
                        <p className="text-xs text-cyan-400/70 font-medium mb-2">Testing & Analytics</p>
                        <motion.a 
                          href="/database-test" 
                          className="block px-4 py-2 hover:bg-cyan-400/10 transition-colors text-sm hover:text-cyan-400"
                          whileHover={{ x: 5 }}
                        >
                          🗄️ Database Test
                        </motion.a>
                        <motion.a 
                          href="/analytics" 
                          className="block px-4 py-2 hover:bg-cyan-400/10 transition-colors text-sm hover:text-cyan-400"
                          whileHover={{ x: 5 }}
                        >
                          📊 Analytics
                        </motion.a>
                        <motion.a 
                          href="/test-auth" 
                          className="block px-4 py-2 hover:bg-cyan-400/10 transition-colors text-sm hover:text-cyan-400"
                          whileHover={{ x: 5 }}
                        >
                          🧪 Auth Test
                        </motion.a>
                      </div>
                      
                      <motion.button 
                        onClick={signOut}
                        className="block w-full text-left px-4 py-2 hover:bg-red-400/10 transition-colors hover:text-red-400"
                        whileHover={{ x: 5 }}
                      >
                        Sign Out
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Enhanced Mobile Menu Button */}
              <motion.button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 hover:bg-cyan-400/10 rounded-full transition-all duration-300 group"
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  animate={{ rotate: isMobileMenuOpen ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {isMobileMenuOpen ? (
                    <X className="w-5 h-5 group-hover:text-cyan-400 transition-colors" />
                  ) : (
                    <Menu className="w-5 h-5 group-hover:text-cyan-400 transition-colors" />
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
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.nav>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
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
