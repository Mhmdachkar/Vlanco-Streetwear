import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { RefreshCw, Database, User, ShoppingCart, AlertTriangle, CheckCircle } from 'lucide-react';

interface CartDebugPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDebugPanel({ isOpen, onClose }: CartDebugPanelProps) {
  const { user } = useAuth();
  const [debugData, setDebugData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const fetchDebugData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Get debug data using the database function
      const { data: debugInfo, error: debugError } = await supabase.rpc('debug_cart_state', {
        p_user_id: user.id
      });

      if (debugError) {
        console.error('Debug fetch error:', debugError);
        setDebugData({ error: debugError.message });
        return;
      }

      // Also get direct table data for comparison
      const { data: directCartItems, error: directError } = await supabase
        .from('cart_items')
        .select(`
          *,
          product:products(*),
          variant:product_variants(*)
        `)
        .eq('user_id', user.id);

      if (directError) {
        console.error('Direct cart fetch error:', directError);
      }

      setDebugData({
        ...debugInfo,
        direct_cart_items: directCartItems || [],
        direct_cart_count: directCartItems?.length || 0,
        timestamp: new Date().toISOString()
      });
      
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Debug data fetch exception:', error);
      setDebugData({ error: 'Failed to fetch debug data' });
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh debug data
  useEffect(() => {
    if (isOpen && user) {
      fetchDebugData();
      const interval = setInterval(fetchDebugData, 5000); // Refresh every 5 seconds
      return () => clearInterval(interval);
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-slate-900 text-white rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Database className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-bold">Cart Debug Panel</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchDebugData}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin text-blue-400" />
              <span className="ml-3">Loading debug data...</span>
            </div>
          ) : debugData ? (
            <>
              {/* User Info */}
              <div className="bg-slate-800 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <User className="w-5 h-5 text-green-400" />
                  <h3 className="font-semibold">User Profile</h3>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-slate-400">ID:</span>
                    <span className="ml-2 font-mono text-xs">{debugData.user_info?.id || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Email:</span>
                    <span className="ml-2">{debugData.user_info?.email || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Name:</span>
                    <span className="ml-2">{debugData.user_info?.full_name || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Verified:</span>
                    <span className={`ml-2 ${debugData.user_info?.is_verified ? 'text-green-400' : 'text-red-400'}`}>
                      {debugData.user_info?.is_verified ? '✅ Yes' : '❌ No'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Cart Summary */}
              <div className="bg-slate-800 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <ShoppingCart className="w-5 h-5 text-blue-400" />
                  <h3 className="font-semibold">Cart Summary</h3>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">
                      {debugData.cart_summary?.total_items || 0}
                    </div>
                    <div className="text-slate-400">Items</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">
                      {debugData.cart_summary?.total_quantity || 0}
                    </div>
                    <div className="text-slate-400">Quantity</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400">
                      ${(debugData.cart_summary?.total_value || 0).toFixed(2)}
                    </div>
                    <div className="text-slate-400">Value</div>
                  </div>
                </div>
              </div>

              {/* Direct Cart Items */}
              <div className="bg-slate-800 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Database className="w-5 h-5 text-yellow-400" />
                  <h3 className="font-semibold">Database Cart Items</h3>
                  <span className="bg-yellow-600 text-xs px-2 py-1 rounded-full">
                    {debugData.direct_cart_count || 0}
                  </span>
                </div>
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {debugData.direct_cart_items?.length > 0 ? (
                    debugData.direct_cart_items.map((item: any) => (
                      <div key={item.id} className="bg-slate-700 rounded p-3 text-sm">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">{item.product?.name || item.product_id}</div>
                            <div className="text-slate-400">
                              {item.variant?.color} {item.variant?.size} • Qty: {item.quantity}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">${(item.price_at_time || 0).toFixed(2)}</div>
                            <div className="text-xs text-slate-400">
                              Total: ${((item.price_at_time || 0) * item.quantity).toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-slate-400 text-center py-4">No items in database</div>
                  )}
                </div>
              </div>

              {/* Recent Events */}
              <div className="bg-slate-800 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-5 h-5 text-orange-400" />
                  <h3 className="font-semibold">Recent Cart Events</h3>
                </div>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {debugData.recent_events?.length > 0 ? (
                    debugData.recent_events.map((event: any, index: number) => (
                      <div key={index} className="text-xs bg-slate-700 rounded p-2">
                        <div className="flex justify-between">
                          <span className="font-medium">{event.event_type}</span>
                          <span className="text-slate-400">
                            {new Date(event.created_at).toLocaleTimeString()}
                          </span>
                        </div>
                        {event.event_data && (
                          <div className="text-slate-400 mt-1">
                            {JSON.stringify(event.event_data)}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-slate-400 text-center py-2">No recent events</div>
                  )}
                </div>
              </div>

              {/* Status Indicators */}
              <div className="bg-slate-800 rounded-lg p-4">
                <h3 className="font-semibold mb-3">System Status</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    {debugData.user_info ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span>User profile exists</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-4 h-4 text-red-400" />
                        <span>User profile missing</span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {debugData.direct_cart_count > 0 ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span>Cart items in database</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-4 h-4 text-yellow-400" />
                        <span>No cart items in database</span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {!debugData.error ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span>Database connection working</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-4 h-4 text-red-400" />
                        <span>Database error detected</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Last Refresh */}
              {lastRefresh && (
                <div className="text-xs text-slate-500 text-center">
                  Last refreshed: {lastRefresh.toLocaleTimeString()}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 text-slate-400">
              {user ? 'Click refresh to load debug data' : 'Sign in to view debug data'}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
