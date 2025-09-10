import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAnalytics } from '@/hooks/useAnalytics';
import { supabase } from '@/integrations/supabase/client';

interface AnalyticsTrackerProps {
  children: React.ReactNode;
}

// Session management
let sessionId: string | null = null;
let sessionStartTime: number | null = null;
let lastActivityTime: number = Date.now();
let isOnline = true;

const getOrCreateSessionId = (): string => {
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStartTime = Date.now();
  }
  return sessionId;
};

const AnalyticsTracker: React.FC<AnalyticsTrackerProps> = ({ children }) => {
  const location = useLocation();
  const { user } = useAuth();
  const { track, trackPageView } = useAnalytics();
  
  const pageViewStartTime = useRef<number>(Date.now());
  const currentPath = useRef<string>(location.pathname);
  const activityInterval = useRef<NodeJS.Timeout | null>(null);
  const heartbeatInterval = useRef<NodeJS.Timeout | null>(null);

  // Track page views
  useEffect(() => {
    const pageName = getPageName(location.pathname);
    const sessionIdValue = getOrCreateSessionId();
    
    // Track page view
    trackPageView(pageName, {
      path: location.pathname,
      search: location.search,
      referrer: document.referrer,
      session_id: sessionIdValue,
      timestamp: new Date().toISOString()
    });

    // Update current path
    currentPath.current = location.pathname;
    pageViewStartTime.current = Date.now();

    return () => {
      // Track time spent on page when leaving
      const timeSpent = Date.now() - pageViewStartTime.current;
      if (timeSpent > 1000) { // Only track if spent more than 1 second
        track('page_time_spent', {
          page: pageName,
          path: location.pathname,
          time_spent_ms: timeSpent,
          time_spent_seconds: Math.round(timeSpent / 1000),
          session_id: sessionIdValue
        });
      }
    };
  }, [location.pathname, location.search, trackPageView, track]);

  // Track user session and activity
  useEffect(() => {
    if (!user) return;

    const sessionIdValue = getOrCreateSessionId();
    
    // Create or update user session in database
    const updateUserSession = async () => {
      try {
        await supabase
          .from('user_sessions')
          .upsert({
            user_id: user.id,
            session_id: sessionIdValue,
            is_online: true,
            last_activity: new Date().toISOString(),
            current_page: location.pathname,
            user_agent: navigator.userAgent,
            login_time: sessionStartTime ? new Date(sessionStartTime).toISOString() : new Date().toISOString()
          }, {
            onConflict: 'session_id'
          });
      } catch (error) {
        console.error('Error updating user session:', error);
      }
    };

    updateUserSession();

    // Set up heartbeat to keep session alive
    heartbeatInterval.current = setInterval(async () => {
      if (isOnline && document.visibilityState === 'visible') {
        lastActivityTime = Date.now();
        try {
          await supabase
            .from('user_sessions')
            .update({
              last_activity: new Date().toISOString(),
              current_page: location.pathname,
              is_online: true,
              session_duration: Math.round((Date.now() - (sessionStartTime || Date.now())) / 1000)
            })
            .eq('session_id', sessionIdValue);
        } catch (error) {
          console.error('Error updating session heartbeat:', error);
        }
      }
    }, 30000); // Update every 30 seconds

    return () => {
      if (heartbeatInterval.current) {
        clearInterval(heartbeatInterval.current);
      }
    };
  }, [user, location.pathname]);

  // Track user activity and interactions
  useEffect(() => {
    const trackActivity = (eventType: string, target?: EventTarget | null) => {
      lastActivityTime = Date.now();
      
      const sessionIdValue = getOrCreateSessionId();
      const element = target as Element;
      
      track('user_interaction', {
        event_type: eventType,
        page: getPageName(location.pathname),
        path: location.pathname,
        element_tag: element?.tagName?.toLowerCase(),
        element_class: element?.className,
        element_id: element?.id,
        session_id: sessionIdValue,
        timestamp: new Date().toISOString()
      });
    };

    // Track various user interactions with enhanced logging
    const handleClick = (e: MouseEvent) => {
      // Only log meaningful clicks (buttons, links, etc.) to reduce spam
      const target = e.target as HTMLElement;
      const isInteractive = target.tagName === 'BUTTON' || 
                           target.tagName === 'A' || 
                           target.closest('button') || 
                           target.closest('a') ||
                           target.getAttribute('role') === 'button';
      
      if (isInteractive) {
        // Only log button clicks to reduce noise
        if (target.tagName === 'BUTTON' || target.closest('button')) {
          console.log('🖱️ Click tracked:', target.tagName, target.textContent?.slice(0, 30) || 'No text');
        }
        trackActivity('click', target);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      console.log('⌨️ Keydown tracked:', e.key);
      trackActivity('keydown', e.target);
    };
    const handleScroll = () => {
      // Throttle scroll tracking to avoid spam
      if (Date.now() - lastActivityTime > 2000) { // Only track every 2 seconds
        // Removed console.log to reduce noise
        trackActivity('scroll', null);
      }
    };
    const handleMouseMove = () => {
      // Throttle mouse move tracking
      if (Date.now() - lastActivityTime > 5000) {
        // Removed console.log to reduce noise
        trackActivity('mouse_move', null);
      }
    };

    // Visibility change tracking
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        isOnline = true;
        track('page_focus', {
          page: getPageName(location.pathname),
          session_id: getOrCreateSessionId()
        });
      } else {
        isOnline = false;
        track('page_blur', {
          page: getPageName(location.pathname),
          session_id: getOrCreateSessionId()
        });
      }
    };

    // Add event listeners
    document.addEventListener('click', handleClick);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Clean up
    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [track, location.pathname]);

  // Track page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      const timeSpent = Date.now() - pageViewStartTime.current;
      const sessionIdValue = getOrCreateSessionId();
      
      // Track session end
      track('session_end', {
        session_duration_ms: Date.now() - (sessionStartTime || Date.now()),
        session_duration_seconds: Math.round((Date.now() - (sessionStartTime || Date.now())) / 1000),
        last_page: getPageName(location.pathname),
        session_id: sessionIdValue
      });

      // Update session as offline
      if (user) {
        navigator.sendBeacon('/api/analytics/session-end', JSON.stringify({
          session_id: sessionIdValue,
          user_id: user.id,
          logout_time: new Date().toISOString(),
          is_online: false
        }));
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [track, location.pathname, user]);

  return <>{children}</>;
};

// Helper function to get readable page names
const getPageName = (pathname: string): string => {
  const pathMap: { [key: string]: string } = {
    '/': 'Homepage',
    '/t-shirts': 'T-Shirts Collection',
    '/masks': 'Masks Collection',
    '/accessories': 'Accessories Collection',
    '/product': 'Product Detail',
    '/cart': 'Shopping Cart',
    '/wishlist': 'Wishlist',
    '/profile': 'User Profile',
    '/orders': 'Order History',
    '/demo': 'Database Demo',
    '/analytics': 'Analytics Dashboard'
  };

  // Check for exact matches first
  if (pathMap[pathname]) {
    return pathMap[pathname];
  }

  // Check for partial matches
  for (const [path, name] of Object.entries(pathMap)) {
    if (pathname.startsWith(path) && path !== '/') {
      return name;
    }
  }

  // Default case
  return pathname
    .split('/')
    .filter(Boolean)
    .map(segment => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ') || 'Homepage';
};

export default AnalyticsTracker;
