import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
 import { loadStripe } from '@stripe/stripe-js'; // Temporarily disabled until package is installed
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, CreditCard, Package, Truck, Shield } from 'lucide-react';
import Navigation from '@/components/Navigation';

const DirectCheckout: React.FC = () => {
  const navigate = useNavigate();
  const [checkoutData, setCheckoutData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customerInfo, setCustomerInfo] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    company: '',
    notes: ''
  });

  useEffect(() => {
    // Get checkout data from sessionStorage
    const storedData = sessionStorage.getItem('stripe_checkout_data');
    if (storedData) {
      try {
        const data = JSON.parse(storedData);
        setCheckoutData(data);
        console.log('📦 Checkout data loaded:', data);
      } catch (err) {
        console.error('❌ Failed to parse checkout data:', err);
        setError('Invalid checkout data');
      }
    } else {
      setError('No checkout data found');
    }
  }, []);

  const handleStripeCheckout = async () => {
    if (!checkoutData) return;

    // Validate required customer information
    if (!customerInfo.firstName.trim() || !customerInfo.lastName.trim()) {
      setError('Please provide your first and last name to continue with checkout.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('💳 Starting Stripe checkout...');

      // Get Stripe publishable key
      const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
      if (!publishableKey) {
        throw new Error('Stripe publishable key not found');
      }

      // Initialize Stripe
      const stripe = await loadStripe(publishableKey);
      if (!stripe) {
        throw new Error('Failed to load Stripe');
      }

      console.log('🔄 Creating checkout session via Supabase function...');
      
      // Create checkout session using our Supabase function
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      const response = await fetch(`${supabaseUrl}/functions/v1/checkout-local-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({
          cartItems: checkoutData.cartItems,
          customerEmail: checkoutData.customerEmail,
          discountCode: checkoutData.discountCode,
          customerInfo: {
            ...customerInfo,
            fullName: `${customerInfo.firstName} ${customerInfo.lastName}`.trim(),
            timestamp: new Date().toISOString(),
          },
          successUrl: `${window.location.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/checkout/cancel`,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create checkout session');
      }

      const { sessionId } = await response.json();
      console.log('✅ Checkout session created:', sessionId);
      
      // Redirect to Stripe Checkout
      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId: sessionId,
      });

      if (stripeError) {
        console.error('❌ Stripe error:', stripeError);
        throw new Error(stripeError.message || 'Stripe checkout failed');
      }
      
      console.log('✅ Stripe checkout initiated successfully');

    } catch (err) {
      console.error('❌ Checkout error:', err);
      setError(err instanceof Error ? err.message : 'Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToCart = () => {
    navigate(-1);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-center text-red-600">Checkout Error</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={handleBackToCart} variant="outline">
                Back to Cart
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!checkoutData) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            <p className="text-xl font-semibold text-muted-foreground">Loading checkout...</p>
          </div>
        </div>
      </div>
    );
  }

  const { cartItems, totals } = checkoutData;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl font-bold text-center mb-8">Checkout</h1>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Order Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5" />
                    Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {cartItems.map((item: any, index: number) => (
                      <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                        <img
                          src={item.product_image}
                          alt={item.product_name}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold">{item.product_name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {item.variant_color} - {item.variant_size}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Qty: {item.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4 mt-4 space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>${totals.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping:</span>
                      <span>${totals.shipping.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax:</span>
                      <span>${totals.tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>Total:</span>
                      <span>${totals.total.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Customer Information Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Customer Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">First Name *</label>
                        <input
                          type="text"
                          value={customerInfo.firstName}
                          onChange={(e) => setCustomerInfo(prev => ({ ...prev, firstName: e.target.value }))}
                          className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="Enter first name"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Last Name *</label>
                        <input
                          type="text"
                          value={customerInfo.lastName}
                          onChange={(e) => setCustomerInfo(prev => ({ ...prev, lastName: e.target.value }))}
                          className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="Enter last name"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Phone Number</label>
                      <input
                        type="tel"
                        value={customerInfo.phone}
                        onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Enter phone number"
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Company (Optional)</label>
                      <input
                        type="text"
                        value={customerInfo.company}
                        onChange={(e) => setCustomerInfo(prev => ({ ...prev, company: e.target.value }))}
                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Enter company name"
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Order Notes (Optional)</label>
                      <textarea
                        value={customerInfo.notes}
                        onChange={(e) => setCustomerInfo(prev => ({ ...prev, notes: e.target.value }))}
                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Any special instructions or notes for your order"
                        rows={3}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Payment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Security Features */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Shield className="w-4 h-4" />
                        <span>Secure payment powered by Stripe</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Package className="w-4 h-4" />
                        <span>Fast shipping worldwide</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Truck className="w-4 h-4" />
                        <span>Free shipping on orders over $100</span>
                      </div>
                    </div>

                    {/* Payment Button */}
                    <Button
                      onClick={handleStripeCheckout}
                      disabled={loading}
                      className="w-full"
                      size="lg"
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 mr-2 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-4 h-4 mr-2" />
                          Pay with Stripe - ${totals.total.toFixed(2)}
                        </>
                      )}
                    </Button>

                    <Button
                      onClick={handleBackToCart}
                      variant="outline"
                      className="w-full"
                    >
                      Back to Cart
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default DirectCheckout;
