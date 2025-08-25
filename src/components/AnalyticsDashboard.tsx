import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { 
  Users, 
  Eye, 
  ShoppingCart, 
  TrendingUp, 
  Globe, 
  Activity,
  Clock,
  MapPin,
  Monitor,
  Smartphone,
  Tablet
} from 'lucide-react';

interface AnalyticsData {
  online_users: number;
  total_sessions_today: number;
  page_views_today: number;
  cart_additions_today: number;
  timestamp: string;
}

interface UserSession {
  id: string;
  user_id: string;
  session_id: string;
  is_online: boolean;
  last_activity: string;
  current_page: string;
  user_agent: string;
  ip_address: string;
  login_time: string;
  session_duration: number;
}

interface PageView {
  id: string;
  page_url: string;
  page_title: string;
  time_spent: number;
  scroll_depth: number;
  created_at: string;
}

const AnalyticsDashboard: React.FC = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [userSessions, setUserSessions] = useState<UserSession[]>([]);
  const [pageViews, setPageViews] = useState<PageView[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  // Fetch real-time analytics
  const fetchAnalytics = async () => {
    try {
      const { data, error } = await supabase.rpc('get_real_time_analytics');
      
      if (error) throw error;
      
      if (data && data.success) {
        setAnalytics(data.analytics);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  // Fetch user sessions
  const fetchUserSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('is_online', true)
        .order('last_activity', { ascending: false })
        .limit(50);

      if (error) throw error;
      setUserSessions(data || []);
    } catch (error) {
      console.error('Error fetching user sessions:', error);
    }
  };

  // Fetch recent page views
  const fetchPageViews = async () => {
    try {
      const { data, error } = await supabase
        .from('page_views')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setPageViews(data || []);
    } catch (error) {
      console.error('Error fetching page views:', error);
    }
  };

  // Get device type from user agent
  const getDeviceType = (userAgent: string): string => {
    if (/Mobile|Android|iPhone|iPad/.test(userAgent)) {
      if (/iPad/.test(userAgent)) return 'tablet';
      return 'mobile';
    }
    return 'desktop';
  };

  // Get browser info from user agent
  const getBrowserInfo = (userAgent: string): string => {
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Other';
  };

  // Format time duration
  const formatDuration = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  // Format timestamp
  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  useEffect(() => {
    if (!user) return;

    // Initial fetch
    fetchAnalytics();
    fetchUserSessions();
    fetchPageViews();

    // Set up real-time refresh every 30 seconds
    const interval = setInterval(() => {
      fetchAnalytics();
      fetchUserSessions();
      fetchPageViews();
    }, 30000);

    setRefreshInterval(interval);
    setLoading(false);

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Access Denied</h2>
          <p className="text-gray-400">You must be logged in to view analytics.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">Analytics Dashboard</h1>
          <p className="text-gray-400">Real-time monitoring of your website performance</p>
        </motion.div>

        {/* Key Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {/* Online Users */}
          <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-cyan-400 text-sm font-medium">Online Users</p>
                <p className="text-3xl font-bold text-white">
                  {analytics?.online_users || 0}
                </p>
              </div>
              <div className="bg-cyan-500/20 p-3 rounded-xl">
                <Users className="w-6 h-6 text-cyan-400" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm text-gray-400">
                <Activity className="w-4 h-4 mr-2" />
                Real-time
              </div>
            </div>
          </div>

          {/* Total Sessions Today */}
          <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-400 text-sm font-medium">Sessions Today</p>
                <p className="text-3xl font-bold text-white">
                  {analytics?.total_sessions_today || 0}
                </p>
              </div>
              <div className="bg-purple-500/20 p-3 rounded-xl">
                <Globe className="w-6 h-6 text-purple-400" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm text-gray-400">
                <Clock className="w-4 h-4 mr-2" />
                Last 24 hours
              </div>
            </div>
          </div>

          {/* Page Views Today */}
          <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-400 text-sm font-medium">Page Views</p>
                <p className="text-3xl font-bold text-white">
                  {analytics?.page_views_today || 0}
                </p>
              </div>
              <div className="bg-green-500/20 p-3 rounded-xl">
                <Eye className="w-6 h-6 text-green-400" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm text-gray-400">
                <TrendingUp className="w-4 h-4 mr-2" />
                Today's total
              </div>
            </div>
          </div>

          {/* Cart Additions Today */}
          <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-400 text-sm font-medium">Cart Additions</p>
                <p className="text-3xl font-bold text-white">
                  {analytics?.cart_additions_today || 0}
                </p>
              </div>
              <div className="bg-orange-500/20 p-3 rounded-xl">
                <ShoppingCart className="w-6 h-6 text-orange-400" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm text-gray-400">
                <TrendingUp className="w-4 h-4 mr-2" />
                Today's total
              </div>
            </div>
          </div>
        </motion.div>

        {/* Real-time Data */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Active User Sessions */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6"
          >
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-cyan-400" />
              Active User Sessions
            </h3>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {userSessions.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No active sessions</p>
              ) : (
                userSessions.map((session) => (
                  <div
                    key={session.id}
                    className="bg-gray-700/50 rounded-xl p-4 border border-gray-600"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-sm text-gray-300">
                          {session.user_id ? 'Authenticated' : 'Guest'}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400">
                        {formatTimestamp(session.last_activity)}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-300 mb-2">
                      <span className="text-gray-400">Page:</span> {session.current_page}
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center">
                          {getDeviceType(session.user_agent) === 'mobile' && <Smartphone className="w-3 h-3 mr-1" />}
                          {getDeviceType(session.user_agent) === 'tablet' && <Tablet className="w-3 h-3 mr-1" />}
                          {getDeviceType(session.user_agent) === 'desktop' && <Monitor className="w-3 h-3 mr-1" />}
                          {getDeviceType(session.user_agent)}
                        </span>
                        <span>{getBrowserInfo(session.user_agent)}</span>
                      </div>
                      <span>{formatDuration(session.session_duration || 0)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>

          {/* Recent Page Views */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6"
          >
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <Eye className="w-5 h-5 mr-2 text-green-400" />
              Recent Page Views
            </h3>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {pageViews.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No page views recorded</p>
              ) : (
                pageViews.map((view) => (
                  <div
                    key={view.id}
                    className="bg-gray-700/50 rounded-xl p-4 border border-gray-600"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-white truncate">
                        {view.page_title || view.page_url}
                      </span>
                      <span className="text-xs text-gray-400">
                        {formatTimestamp(view.created_at)}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-300 mb-2">
                      <span className="text-gray-400">URL:</span> {view.page_url}
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>Time: {formatDuration(view.time_spent || 0)}</span>
                      <span>Scroll: {view.scroll_depth || 0}%</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>

        {/* Last Updated */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center mt-8 text-gray-400 text-sm"
        >
          Last updated: {analytics?.timestamp ? formatTimestamp(analytics.timestamp) : 'Never'}
        </motion.div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
