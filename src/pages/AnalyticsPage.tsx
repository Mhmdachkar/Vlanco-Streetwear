import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { 
  Users, 
  Eye, 
  ShoppingCart, 
  TrendingUp,
  Activity,
  Clock,
  Globe,
  Smartphone,
  Monitor
} from 'lucide-react';

interface AnalyticsData {
  onlineUsers: number;
  totalSessions: number;
  pageViews: number;
  cartAdditions: number;
  activeSessions: any[];
  recentViews: any[];
}

const AnalyticsPage: React.FC = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Try to use the RPC function first (if migration is applied)
      try {
        const { data: rpcData, error: rpcError } = await supabase.rpc('get_real_time_analytics');
        if (!rpcError && rpcData) {
          setAnalytics({
            onlineUsers: rpcData.online_users || 0,
            totalSessions: rpcData.total_sessions_today || 0,
            pageViews: rpcData.page_views_today || 0,
            cartAdditions: rpcData.cart_additions_today || 0,
            activeSessions: [],
            recentViews: []
          });
          setLastUpdate(new Date());
          setLoading(false);
          return;
        }
      } catch (rpcError) {
        console.log('RPC function not available, using direct queries');
      }

      // Fallback to direct queries
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();

      // Get online users (users active in last 5 minutes)
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      const { count: onlineUsers } = await supabase
        .from('user_sessions')
        .select('*', { count: 'exact', head: true })
        .gte('last_activity', fiveMinutesAgo);

      // Get total sessions today
      const { count: totalSessions } = await supabase
        .from('user_sessions')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startOfDay);

      // Get page views today
      const { count: pageViews } = await supabase
        .from('page_views')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startOfDay);

      // Get cart additions today
      const { count: cartAdditions } = await supabase
        .from('cart_items')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startOfDay);

      // Get active sessions
      const { data: activeSessions } = await supabase
        .from('user_sessions')
        .select('*')
        .gte('last_activity', fiveMinutesAgo)
        .order('last_activity', { ascending: false })
        .limit(10);

      // Get recent page views
      const { data: recentViews } = await supabase
        .from('page_views')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      setAnalytics({
        onlineUsers: onlineUsers || 0,
        totalSessions: totalSessions || 0,
        pageViews: pageViews || 0,
        cartAdditions: cartAdditions || 0,
        activeSessions: activeSessions || [],
        recentViews: recentViews || []
      });

      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      // Set fallback data
      setAnalytics({
        onlineUsers: 0,
        totalSessions: 0,
        pageViews: 0,
        cartAdditions: 0,
        activeSessions: [],
        recentViews: []
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchAnalytics();
      // Refresh every 30 seconds
      const interval = setInterval(fetchAnalytics, 30000);
      return () => clearInterval(interval);
    }
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

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const getDeviceIcon = (userAgent: string) => {
    if (userAgent.includes('Mobile')) return <Smartphone className="w-4 h-4" />;
    if (userAgent.includes('Tablet')) return <Smartphone className="w-4 h-4" />;
    return <Monitor className="w-4 h-4" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">Website Analytics</h1>
          <p className="text-gray-400">Real-time insights into website activity</p>
        </motion.div>

        {/* Refresh Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex justify-center mb-8"
        >
          <button
            onClick={fetchAnalytics}
            disabled={loading}
            className="flex items-center space-x-2 px-6 py-3 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 rounded-lg text-white font-medium transition-colors"
          >
            <Activity className="w-5 h-5" />
            <span>{loading ? 'Refreshing...' : 'Refresh Data'}</span>
          </button>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-400 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading analytics data...</p>
          </motion.div>
        )}

        {/* Analytics Data */}
        {analytics && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-8"
          >
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-2xl p-6"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-blue-500/20 rounded-xl">
                    <Users className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-blue-300">Online Users</p>
                    <p className="text-2xl font-bold text-white">{analytics.onlineUsers}</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-2xl p-6"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-green-500/20 rounded-xl">
                    <TrendingUp className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-green-300">Sessions Today</p>
                    <p className="text-2xl font-bold text-white">{analytics.totalSessions}</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-2xl p-6"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-purple-500/20 rounded-xl">
                    <Eye className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-purple-300">Page Views</p>
                    <p className="text-2xl font-bold text-white">{analytics.pageViews}</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 border border-orange-500/30 rounded-2xl p-6"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-orange-500/20 rounded-xl">
                    <ShoppingCart className="w-6 h-6 text-orange-400" />
                  </div>
                  <div>
                    <p className="text-sm text-orange-300">Cart Additions</p>
                    <p className="text-2xl font-bold text-white">{analytics.cartAdditions}</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Active Sessions and Recent Views */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Active Sessions */}
              <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                  <Activity className="w-5 h-5 text-cyan-400" />
                  <span>Active Sessions</span>
                </h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {analytics.activeSessions.length > 0 ? (
                    analytics.activeSessions.map((session: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          <div>
                            <p className="text-sm text-white font-medium">
                              {session.user_id ? `User ${session.user_id.slice(0, 8)}...` : 'Anonymous'}
                            </p>
                            <p className="text-xs text-gray-400">
                              {getDeviceIcon(session.user_agent || '')} {session.user_agent?.split(' ')[0] || 'Unknown'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-400">
                            <Clock className="w-3 h-3 inline mr-1" />
                            {formatTime(session.last_activity)}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 text-center py-8">No active sessions</p>
                  )}
                </div>
              </div>

              {/* Recent Page Views */}
              <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                  <Globe className="w-5 h-5 text-purple-400" />
                  <span>Recent Page Views</span>
                </h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {analytics.recentViews.length > 0 ? (
                    analytics.recentViews.map((view: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                          <div>
                            <p className="text-sm text-white font-medium">
                              {view.page_path || 'Unknown Page'}
                            </p>
                            <p className="text-xs text-gray-400">
                              {view.user_id ? `User ${view.user_id.slice(0, 8)}...` : 'Anonymous'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-400">
                            <Clock className="w-3 h-3 inline mr-1" />
                            {formatTime(view.created_at)}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 text-center py-8">No recent page views</p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Last Update Time */}
        {lastUpdate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center mt-8 text-gray-400 text-sm"
          >
            Last updated: {lastUpdate.toLocaleString()}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsPage;
