
import { Suspense, lazy, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import LandingPage from "./components/LandingPage";
import SplashScreen from "./components/SplashScreen";
import MaskCollection from './pages/MaskCollection';
import AccessoriesCollection from './pages/AccessoriesCollection';

// Lazy load components for better performance
const Index = lazy(() => import("./pages/Index"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Wishlist = lazy(() => import("./pages/Wishlist"));
const TShirtCollection = lazy(() => import("./pages/TShirtCollection"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const AppContent = () => {
  const hasEnteredStore = sessionStorage.getItem('vlanco_entered_store') === 'true';
  const [showLanding, setShowLanding] = useState(!hasEnteredStore);
  const [showSplash, setShowSplash] = useState(false);

  const handleEnter = () => {
    setShowLanding(false);
    setShowSplash(true);
  };

  const handleSplashComplete = () => {
    setShowSplash(false);
    // Store the user's choice in sessionStorage
    sessionStorage.setItem('vlanco_entered_store', 'true');
  };

  if (showLanding) {
    return <LandingPage onEnter={handleEnter} />;
  }

  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  return (
    
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-xl font-semibold text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/collection/t-shirts" element={<TShirtCollection />} />
        <Route path="/tshirts" element={<TShirtCollection />} />
        <Route path="/masks" element={<MaskCollection />} />
        <Route path="/accessories" element={<AccessoriesCollection />} />
        
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
