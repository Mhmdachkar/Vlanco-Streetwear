import React, { useEffect, useState } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';

interface OrderItem {
  id: string;
  product_id: string;
  variant_id: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  products?: { name: string } | null;
}

interface Order {
  id: string;
  order_number: string;
  status: string;
  created_at: string;
  total_amount: number;
  subtotal: number;
  shipping_amount: number | null;
  discount_amount: number | null;
  currency: string;
  order_items: OrderItem[];
}

const Orders: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!user) { setLoading(false); return; }
      const { data, error } = await supabase
        .from('orders')
        .select('id, order_number, status, created_at, total_amount, subtotal, shipping_amount, discount_amount, currency, order_items(id, product_id, variant_id, quantity, unit_price, total_price, products(name))')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (!error && data) setOrders(data as unknown as Order[]);
      setLoading(false);
    };
    load();
  }, [user]);

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/5 to-background pt-20 pb-16 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent text-center">
              Orders
            </h1>
            <p className="text-muted-foreground text-center mt-4">
              View your past purchases and their details.
            </p>
          </motion.div>

          {loading ? (
            <div className="grid gap-6">{[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 rounded-2xl bg-muted/30 animate-pulse" />
            ))}</div>
          ) : !user ? (
            <div className="text-center text-muted-foreground">Sign in to view your orders.</div>
          ) : orders.length === 0 ? (
            <div className="text-center text-muted-foreground">No orders yet.</div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <div key={order.id} className="bg-background/80 backdrop-blur-sm rounded-3xl border border-border/50 p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Order</div>
                      <div className="font-semibold">{order.order_number}</div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div>
                        <div className="text-sm text-muted-foreground">Status</div>
                        <div className="font-medium capitalize">{order.status}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Placed</div>
                        <div className="font-medium">{new Date(order.created_at).toLocaleDateString()}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Total</div>
                        <div className="font-semibold">{order.currency} ${Number(order.total_amount || 0).toFixed(2)}</div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3">
                    {order.order_items?.map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-sm border border-border/40 rounded-xl p-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-muted/40" />
                          <div>
                            <div className="font-medium">{item.products?.name || 'Product'}</div>
                            <div className="text-muted-foreground">Qty {item.quantity}</div>
                          </div>
                        </div>
                        <div className="font-semibold">${Number(item.total_price || item.unit_price * item.quantity || 0).toFixed(2)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Orders;

