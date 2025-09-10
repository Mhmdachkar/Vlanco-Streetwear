import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

export type AnalyticsEventRow = Tables<'analytics_events'>;
export type RecentlyViewedRow = Tables<'recently_viewed'>;
export type SearchHistoryRow = Tables<'search_history'>;

// Track analytics event
export async function trackEvent(params: {
  userId?: string;
  eventType: string;
  eventData?: any;
  pageUrl?: string;
  referrer?: string;
  sessionId?: string;
  userAgent?: string;
  ipAddress?: string;
}): Promise<void> {
  // Check if Supabase is configured
  if (!supabase || typeof supabase.from !== 'function') {
    console.debug('[analytics] Supabase not configured, skipping analytics tracking');
    return;
  }

  // Prefer server-side edge function to bypass RLS issues (if available)
  if (typeof supabase.functions?.invoke === 'function') {
    try {
      const { error: fnError } = await supabase.functions.invoke('analytics-track', {
        body: {
          user_id: params.userId ?? null,
          event_type: params.eventType,
          event_data: params.eventData ?? null,
          page_url: params.pageUrl || window.location.href,
          referrer: params.referrer || document.referrer,
          session_id: params.sessionId,
          user_agent: params.userAgent || navigator.userAgent,
          ip_address: params.ipAddress,
          created_at: new Date().toISOString(),
        },
      });
      if (!fnError) return;
      // Edge function failed, fall back to direct insert (this is normal if functions aren't deployed)
    } catch (e) {
      // Edge function threw error, fall back to direct insert (this is normal if functions aren't deployed)
    }
  }

  // Fallback: direct insert (this is the normal path for most setups)
  const { error } = await supabase
    .from('analytics_events')
    .insert({
      user_id: params.userId ?? null,
      event_type: params.eventType,
      event_data: params.eventData ?? null,
      page_url: params.pageUrl || window.location.href,
      referrer: params.referrer || document.referrer,
      session_id: params.sessionId,
      user_agent: params.userAgent || navigator.userAgent,
      ip_address: params.ipAddress,
      created_at: new Date().toISOString(),
    });

  if (error) throw error;
}

// Track product view
export async function trackProductView(params: {
  userId?: string;
  productId: string;
  sessionId?: string;
}): Promise<void> {
  // Track analytics event
  await trackEvent({
    userId: params.userId,
    eventType: 'product_view',
    eventData: { product_id: params.productId },
    sessionId: params.sessionId,
  });

  // Add to recently viewed if user is logged in
  if (params.userId) {
    await addToRecentlyViewed(params.userId, params.productId);
  }
}

// Add product to recently viewed
export async function addToRecentlyViewed(userId: string, productId: string): Promise<void> {
  // Check if Supabase is configured
  if (!supabase || typeof supabase.from !== 'function') {
    console.debug('[analytics] Supabase not configured, skipping recently viewed tracking');
    return;
  }

  // Check if already exists
  const { data: existing } = await supabase
    .from('recently_viewed')
    .select('id')
    .eq('user_id', userId)
    .eq('product_id', productId)
    .single();

  if (existing) {
    // Update viewed_at timestamp
    const { error } = await supabase
      .from('recently_viewed')
      .update({ viewed_at: new Date().toISOString() })
      .eq('id', existing.id);
    
    if (error) throw error;
  } else {
    // Insert new record
    const { error } = await supabase
      .from('recently_viewed')
      .insert({
        user_id: userId,
        product_id: productId,
        viewed_at: new Date().toISOString(),
      });
    
    if (error) throw error;
  }

  // Keep only last 50 viewed items per user
  const { data: allViewed } = await supabase
    .from('recently_viewed')
    .select('id')
    .eq('user_id', userId)
    .order('viewed_at', { ascending: false })
    .range(50, 1000); // Get items beyond the first 50

  if (allViewed && allViewed.length > 0) {
    const idsToDelete = allViewed.map(item => item.id);
    await supabase
      .from('recently_viewed')
      .delete()
      .in('id', idsToDelete);
  }
}

// Get recently viewed products
export async function getRecentlyViewed(userId: string, limit: number = 20): Promise<RecentlyViewedRow[]> {
  // Check if Supabase is configured
  if (!supabase || typeof supabase.from !== 'function') {
    console.debug('[analytics] Supabase not configured, returning empty recently viewed');
    return [];
  }

  const { data, error } = await supabase
    .from('recently_viewed')
    .select(`
      *,
      product:products(*)
    `)
    .eq('user_id', userId)
    .order('viewed_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

// Track search query
export async function trackSearch(params: {
  userId?: string;
  query: string;
  resultsCount: number;
}): Promise<void> {
  // Track analytics event
  await trackEvent({
    userId: params.userId,
    eventType: 'search',
    eventData: { 
      query: params.query, 
      results_count: params.resultsCount 
    },
  });

  // Save to search history if user is logged in
  if (params.userId) {
    const { error } = await supabase
      .from('search_history')
      .insert({
        user_id: params.userId,
        query: params.query,
        results_count: params.resultsCount,
        created_at: new Date().toISOString(),
      });
    
    if (error) throw error;
  }
}

// Get user search history
export async function getSearchHistory(userId: string, limit: number = 10): Promise<SearchHistoryRow[]> {
  const { data, error } = await supabase
    .from('search_history')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

// Get popular search queries
export async function getPopularSearches(limit: number = 10): Promise<{ query: string; count: number }[]> {
  // Check if Supabase is configured
  if (!supabase || typeof supabase.from !== 'function') {
    console.debug('[analytics] Supabase not configured, returning empty popular searches');
    return [];
  }

  const { data, error } = await supabase
    .from('search_history')
    .select('query')
    .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // Last 30 days
    .order('created_at', { ascending: false });

  if (error) throw error;

  // Count occurrences
  const queryCounts = (data || []).reduce((counts, item) => {
    counts[item.query] = (counts[item.query] || 0) + 1;
    return counts;
  }, {} as { [key: string]: number });

  // Sort by count and return top results
  return Object.entries(queryCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([query, count]) => ({ query, count }));
}

// Track cart events
export async function trackCartEvent(params: {
  userId?: string;
  eventType: 'add_to_cart' | 'remove_from_cart' | 'update_quantity' | 'clear_cart';
  productId?: string;
  variantId?: string;
  quantity?: number;
  price?: number;
}): Promise<void> {
  await trackEvent({
    userId: params.userId,
    eventType: params.eventType,
    eventData: {
      product_id: params.productId,
      variant_id: params.variantId,
      quantity: params.quantity,
      price: params.price,
    },
  });
}

// Track wishlist events
export async function trackWishlistEvent(params: {
  userId?: string;
  eventType: 'add_to_wishlist' | 'remove_from_wishlist';
  productId: string;
}): Promise<void> {
  await trackEvent({
    userId: params.userId,
    eventType: params.eventType,
    eventData: { product_id: params.productId },
  });
}

// Track purchase events
export async function trackPurchase(params: {
  userId?: string;
  orderId: string;
  totalAmount: number;
  itemCount: number;
  paymentMethod?: string;
}): Promise<void> {
  await trackEvent({
    userId: params.userId,
    eventType: 'purchase',
    eventData: {
      order_id: params.orderId,
      total_amount: params.totalAmount,
      item_count: params.itemCount,
      payment_method: params.paymentMethod,
    },
  });
}

// Get analytics data for admin dashboard
export async function getAnalyticsData(params: {
  startDate: string;
  endDate: string;
  eventTypes?: string[];
}): Promise<{
  totalEvents: number;
  eventsByType: { [key: string]: number };
  dailyEvents: { date: string; count: number }[];
}> {
  let query = supabase
    .from('analytics_events')
    .select('event_type, created_at')
    .gte('created_at', params.startDate)
    .lte('created_at', params.endDate);

  if (params.eventTypes && params.eventTypes.length > 0) {
    query = query.in('event_type', params.eventTypes);
  }

  const { data, error } = await query;
  if (error) throw error;

  const events = data || [];
  const totalEvents = events.length;

  // Group by event type
  const eventsByType = events.reduce((counts, event) => {
    counts[event.event_type] = (counts[event.event_type] || 0) + 1;
    return counts;
  }, {} as { [key: string]: number });

  // Group by day
  const dailyEventCounts = events.reduce((counts, event) => {
    const date = new Date(event.created_at!).toISOString().split('T')[0];
    counts[date] = (counts[date] || 0) + 1;
    return counts;
  }, {} as { [key: string]: number });

  const dailyEvents = Object.entries(dailyEventCounts)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    totalEvents,
    eventsByType,
    dailyEvents,
  };
}
