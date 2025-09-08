import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import {
  trackEvent,
  trackProductView,
  trackSearch,
  trackCartEvent,
  trackWishlistEvent,
  trackPurchase,
  getRecentlyViewed,
  getSearchHistory,
  getPopularSearches,
  type RecentlyViewedRow,
  type SearchHistoryRow,
} from '@/services/analyticsService';

// Generate or get session ID
const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem('vlanco_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('vlanco_session_id', sessionId);
  }
  return sessionId;
};

export function useAnalytics() {
  const { user } = useAuth();
  const [recentlyViewed, setRecentlyViewed] = useState<RecentlyViewedRow[]>([]);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryRow[]>([]);
  const [popularSearches, setPopularSearches] = useState<{ query: string; count: number }[]>([]);
  const [loading, setLoading] = useState(false);

  // Track generic event
  const track = useCallback(async (eventType: string, eventData?: any) => {
    try {
      await trackEvent({
        userId: user?.id,
        eventType,
        eventData,
        sessionId: getSessionId(),
      });
    } catch (error) {
      console.error('Error tracking event:', error);
    }
  }, [user]);

  // Track page view
  const trackPageView = useCallback(async (pageName: string, additionalData?: any) => {
    await track('page_view', {
      page_name: pageName,
      ...additionalData,
    });
  }, [track]);

  // Track product view
  const trackProduct = useCallback(async (productId: string, productData?: any) => {
    try {
      await trackProductView({
        userId: user?.id,
        productId,
        sessionId: getSessionId(),
      });

      // Also track generic product view event with additional data
      await track('product_view', {
        product_id: productId,
        ...productData,
      });
    } catch (error) {
      console.error('Error tracking product view:', error);
    }
  }, [user, track]);

  // Track search
  const trackSearchQuery = useCallback(async (query: string, resultsCount: number) => {
    try {
      await trackSearch({
        userId: user?.id,
        query,
        resultsCount,
      });
    } catch (error) {
      console.error('Error tracking search:', error);
    }
  }, [user]);

  // Track cart events
  const trackAddToCart = useCallback(async (productId: string, variantId?: string, quantity?: number, price?: number) => {
    try {
      await trackCartEvent({
        userId: user?.id,
        eventType: 'add_to_cart',
        productId,
        variantId,
        quantity,
        price,
      });
    } catch (error) {
      console.error('Error tracking add to cart:', error);
    }
  }, [user]);

  const trackRemoveFromCart = useCallback(async (productId: string, variantId?: string, quantity?: number) => {
    try {
      await trackCartEvent({
        userId: user?.id,
        eventType: 'remove_from_cart',
        productId,
        variantId,
        quantity,
      });
    } catch (error) {
      console.error('Error tracking remove from cart:', error);
    }
  }, [user]);

  const trackUpdateCartQuantity = useCallback(async (productId: string, variantId?: string, quantity?: number) => {
    try {
      await trackCartEvent({
        userId: user?.id,
        eventType: 'update_quantity',
        productId,
        variantId,
        quantity,
      });
    } catch (error) {
      console.error('Error tracking cart update:', error);
    }
  }, [user]);

  const trackClearCart = useCallback(async () => {
    try {
      await trackCartEvent({
        userId: user?.id,
        eventType: 'clear_cart',
      });
    } catch (error) {
      console.error('Error tracking clear cart:', error);
    }
  }, [user]);

  // Track wishlist events
  const trackAddToWishlist = useCallback(async (productId: string) => {
    try {
      await trackWishlistEvent({
        userId: user?.id,
        eventType: 'add_to_wishlist',
        productId,
      });
    } catch (error) {
      console.error('Error tracking add to wishlist:', error);
    }
  }, [user]);

  const trackRemoveFromWishlist = useCallback(async (productId: string) => {
    try {
      await trackWishlistEvent({
        userId: user?.id,
        eventType: 'remove_from_wishlist',
        productId,
      });
    } catch (error) {
      console.error('Error tracking remove from wishlist:', error);
    }
  }, [user]);

  // Track purchase
  const trackOrderPurchase = useCallback(async (orderId: string, totalAmount: number, itemCount: number, paymentMethod?: string) => {
    try {
      await trackPurchase({
        userId: user?.id,
        orderId,
        totalAmount,
        itemCount,
        paymentMethod,
      });
    } catch (error) {
      console.error('Error tracking purchase:', error);
    }
  }, [user]);

  // Track user interactions
  const trackClick = useCallback(async (element: string, location?: string, additionalData?: any) => {
    await track('click', {
      element,
      location,
      ...additionalData,
    });
  }, [track]);

  const trackFormSubmit = useCallback(async (formName: string, success: boolean, additionalData?: any) => {
    await track('form_submit', {
      form_name: formName,
      success,
      ...additionalData,
    });
  }, [track]);

  const trackError = useCallback(async (errorType: string, errorMessage: string, context?: any) => {
    await track('error', {
      error_type: errorType,
      error_message: errorMessage,
      context,
    });
  }, [track]);

  // Fetch analytics data
  const fetchRecentlyViewed = useCallback(async () => {
    if (!user) {
      setRecentlyViewed([]);
      return;
    }

    try {
      setLoading(true);
      const data = await getRecentlyViewed(user.id, 20);
      setRecentlyViewed(data);
    } catch (error) {
      console.error('Error fetching recently viewed:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchSearchHistory = useCallback(async () => {
    if (!user) {
      setSearchHistory([]);
      return;
    }

    try {
      const data = await getSearchHistory(user.id, 10);
      setSearchHistory(data);
    } catch (error) {
      console.error('Error fetching search history:', error);
    }
  }, [user]);

  const fetchPopularSearches = useCallback(async () => {
    try {
      const data = await getPopularSearches(10);
      setPopularSearches(data);
    } catch (error) {
      console.error('Error fetching popular searches:', error);
    }
  }, []);

  // Auto-track page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        track('page_focus');
      } else {
        track('page_blur');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [track]);

  // Auto-track session start
  useEffect(() => {
    track('session_start');
  }, [track]);

  // Fetch data when user changes
  useEffect(() => {
    fetchRecentlyViewed();
    fetchSearchHistory();
    fetchPopularSearches();
  }, [fetchRecentlyViewed, fetchSearchHistory, fetchPopularSearches]);

  return {
    // Data
    recentlyViewed,
    searchHistory,
    popularSearches,
    loading,

    // Generic tracking
    track,
    trackPageView,
    trackClick,
    trackFormSubmit,
    trackError,

    // Specific tracking
    trackProduct,
    trackSearchQuery,
    trackAddToCart,
    trackRemoveFromCart,
    trackUpdateCartQuantity,
    trackClearCart,
    trackAddToWishlist,
    trackRemoveFromWishlist,
    trackOrderPurchase,

    // Data fetching
    fetchRecentlyViewed,
    fetchSearchHistory,
    fetchPopularSearches,
  };
}

// Hook for tracking component mount/unmount
export function usePageAnalytics(pageName: string, additionalData?: any) {
  const { trackPageView } = useAnalytics();

  useEffect(() => {
    trackPageView(pageName, additionalData);
  }, [trackPageView, pageName, additionalData]);
}
