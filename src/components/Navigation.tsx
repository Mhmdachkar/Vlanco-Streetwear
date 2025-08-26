
import { useState } from 'react';
import { Search, ShoppingCart, User, Menu, X, Heart } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import AuthModal from './AuthModal';
import CartSidebar from './CartSidebar';

const Navigation = () => {
  const { user, signOut } = useAuth();
  const { itemCount } = useCart();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCartSidebar, setShowCartSidebar] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'T-Shirts', href: '/tshirts' },
    { name: 'Masks', href: '/masks' },
    { name: 'Accessories', href: '/accessories' },
    { name: 'About Us', href: '/about' },
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo */}
            <div className="text-xl sm:text-2xl font-black gradient-text">
              VLANCO
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-foreground hover:text-primary transition-colors duration-300 font-medium"
                >
                  {link.name}
                </a>
              ))}
            </div>

            {/* Right Side Icons */}
            <div className="flex items-center gap-2.5 sm:gap-3">
              {/* Search */}
              <button className="p-2 hover:bg-muted rounded-full transition-colors duration-300">
                <Search className="w-5 h-5" />
              </button>

              {/* Database Test Quick Access (Development) */}
              {user && (
                <a 
                  href="/database-test"
                  className="p-2 hover:bg-muted rounded-full transition-colors duration-300 group"
                  title="Database Test"
                >
                  <div className="w-5 h-5 text-xs font-bold text-cyan-400 group-hover:text-cyan-300">
                    DB
                  </div>
                </a>
              )}

              {/* Wishlist */}
              <button 
                onClick={() => window.location.href = '/wishlist'}
                className="p-2 hover:bg-muted rounded-full transition-colors duration-300 group"
                title="Wishlist"
              >
                <Heart className="w-5 h-5 group-hover:text-red-500 transition-colors" />
              </button>

              {/* Cart */}
              <button 
                id="cart-icon"
                onClick={() => setShowCartSidebar(true)}
                className="relative p-2 hover:bg-muted rounded-full transition-colors duration-300"
              >
                <ShoppingCart className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                    {itemCount}
                  </span>
                )}
              </button>

              {/* User Menu */}
              <div className="relative">
                <button 
                  onClick={() => user ? setShowUserMenu(!showUserMenu) : setShowAuthModal(true)}
                  className="p-2 hover:bg-muted rounded-full transition-colors duration-300"
                >
                  <User className="w-5 h-5" />
                </button>

                {/* User Dropdown */}
                {showUserMenu && user && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-lg shadow-lg py-2">
                    <div className="px-4 py-2 border-b border-border">
                      <p className="font-semibold text-sm">{user.email}</p>
                    </div>
                    <a href="#" className="block px-4 py-2 hover:bg-muted transition-colors">Profile</a>
                    <a href="#" className="block px-4 py-2 hover:bg-muted transition-colors">Orders</a>
                    <a href="/wishlist" className="block px-4 py-2 hover:bg-muted transition-colors">Wishlist</a>
                    
                    {/* Database Testing Links */}
                    <div className="px-4 py-2 border-t border-border">
                      <p className="text-xs text-muted-foreground font-medium mb-2">Testing & Analytics</p>
                      <a href="/database-test" className="block px-4 py-2 hover:bg-muted transition-colors text-sm">
                        🗄️ Database Test
                      </a>
                      <a href="/analytics" className="block px-4 py-2 hover:bg-muted transition-colors text-sm">
                        📊 Analytics
                      </a>
                    </div>
                    
                    <button 
                      onClick={signOut}
                      className="block w-full text-left px-4 py-2 hover:bg-muted transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 hover:bg-muted rounded-full transition-colors duration-300"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-border">
              <div className="py-4 space-y-2">
                {navLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    className="block px-4 py-2 hover:bg-muted rounded-lg transition-colors"
                  >
                    {link.name}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </nav>

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
