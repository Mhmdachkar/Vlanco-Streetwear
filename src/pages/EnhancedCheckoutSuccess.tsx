import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  Package, 
  Truck, 
  Mail, 
  Download, 
  Share2, 
  Star,
  Clock,
  MapPin,
  CreditCard,
  Gift,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { getCheckoutData, clearCheckoutData, type CheckoutSessionData } from '@/services/enhancedStripeService';

interface OrderDetails {
  orderId: string;
  sessionId: string;
  total: number;
  currency: string;
  status: 'paid' | 'processing' | 'shipped' | 'delivered';
  estimatedDelivery: string;
  trackingNumber?: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    image: string;
    variant: string;
  }>;
  shippingAddress: {
    name: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  billingAddress: {
    name: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  paymentMethod: {
    type: string;
    last4: string;
    brand: string;
  };
}

const EnhancedCheckoutSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkoutData, setCheckoutData] = useState<CheckoutSessionData | null>(null);

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    const initializeSuccessPage = async () => {
      try {
        // Get checkout data from session storage
        const data = getCheckoutData();
        setCheckoutData(data);

        if (!sessionId) {
          throw new Error('No session ID found');
        }

        // In a real implementation, you would fetch order details from your backend
        // For now, we'll simulate the order details
        const mockOrderDetails: OrderDetails = {
          orderId: `VLANCO-${Date.now()}`,
          sessionId,
          total: data?.cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0,
          currency: 'USD',
          status: 'paid',
          estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
          trackingNumber: `1Z${Math.random().toString(36).substr(2, 16).toUpperCase()}`,
          items: data?.cartItems.map(item => ({
            name: item.product_name,
            quantity: item.quantity,
            price: item.price,
            image: item.product_image,
            variant: `${item.variant_color} • ${item.variant_size}`,
          })) || [],
          shippingAddress: {
            name: 'John Doe',
            line1: '123 Main St',
            city: 'New York',
            state: 'NY',
            postal_code: '10001',
            country: 'US',
          },
          billingAddress: {
            name: 'John Doe',
            line1: '123 Main St',
            city: 'New York',
            state: 'NY',
            postal_code: '10001',
            country: 'US',
          },
          paymentMethod: {
            type: 'card',
            last4: '4242',
            brand: 'visa',
          },
        };

        setOrderDetails(mockOrderDetails);

        // Track successful purchase
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'purchase', {
            transaction_id: mockOrderDetails.orderId,
            value: mockOrderDetails.total / 100,
            currency: 'USD',
            items: mockOrderDetails.items.map(item => ({
              item_id: item.name,
              item_name: item.name,
              quantity: item.quantity,
              price: item.price / 100,
            })),
          });
        }

        // Clear checkout data after successful processing
        setTimeout(() => {
          clearCheckoutData();
        }, 5000);

      } catch (err) {
        console.error('Error initializing success page:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    initializeSuccessPage();
  }, [sessionId]);

  const handleDownloadReceipt = () => {
    if (!orderDetails) return;
    
    // In a real implementation, you would generate and download a PDF receipt
    const receiptData = {
      orderId: orderDetails.orderId,
      date: new Date().toLocaleDateString(),
      items: orderDetails.items,
      total: orderDetails.total,
      currency: orderDetails.currency,
    };
    
    const dataStr = JSON.stringify(receiptData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `receipt-${orderDetails.orderId}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleShareOrder = () => {
    if (!orderDetails) return;
    
    const shareText = `Just ordered from VLANCO! Order #${orderDetails.orderId} - ${orderDetails.items.length} items for $${(orderDetails.total / 100).toFixed(2)}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'VLANCO Order',
        text: shareText,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(shareText);
      // You could show a toast notification here
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Processing your order...</p>
        </div>
      </div>
    );
  }

  if (error || !orderDetails) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <div className="text-red-500 mb-4">
              <Package className="w-12 h-12 mx-auto" />
            </div>
            <h2 className="text-xl font-bold mb-2">Order Processing Error</h2>
            <p className="text-muted-foreground mb-4">
              {error || 'Unable to retrieve order details'}
            </p>
            <Button onClick={() => navigate('/')} className="w-full">
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Success Header */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 10 }}
            className="mb-6"
          >
            <CheckCircle className="w-20 h-20 mx-auto mb-4" />
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl font-bold mb-4"
          >
            Payment Successful!
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-xl opacity-90 mb-6"
          >
            Thank you for your order! We've received your payment and are preparing your items.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex items-center justify-center gap-4"
          >
            <Badge variant="secondary" className="bg-white/20 text-white">
              Order #{orderDetails.orderId}
            </Badge>
            <Badge variant="secondary" className="bg-white/20 text-white">
              ${(orderDetails.total / 100).toFixed(2)} {orderDetails.currency.toUpperCase()}
            </Badge>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Order Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Status</span>
                    <Badge variant="default" className="bg-green-500">
                      {orderDetails.status.charAt(0).toUpperCase() + orderDetails.status.slice(1)}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Estimated Delivery</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {orderDetails.estimatedDelivery}
                    </span>
                  </div>
                  {orderDetails.trackingNumber && (
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Tracking Number</span>
                      <span className="font-mono text-sm">{orderDetails.trackingNumber}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orderDetails.items.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-4 p-4 border rounded-lg"
                    >
                      <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-sm text-muted-foreground">{item.variant}</p>
                        <p className="text-sm">Quantity: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${(item.price / 100).toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">
                          ${((item.price * item.quantity) / 100).toFixed(2)} total
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <p className="font-medium">{orderDetails.shippingAddress.name}</p>
                  <p>{orderDetails.shippingAddress.line1}</p>
                  {orderDetails.shippingAddress.line2 && <p>{orderDetails.shippingAddress.line2}</p>}
                  <p>
                    {orderDetails.shippingAddress.city}, {orderDetails.shippingAddress.state} {orderDetails.shippingAddress.postal_code}
                  </p>
                  <p>{orderDetails.shippingAddress.country}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Order Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={handleDownloadReceipt}
                  variant="outline" 
                  className="w-full justify-start"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Receipt
                </Button>
                <Button 
                  onClick={handleShareOrder}
                  variant="outline" 
                  className="w-full justify-start"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Order
                </Button>
                <Button 
                  onClick={() => navigate('/orders')}
                  variant="outline" 
                  className="w-full justify-start"
                >
                  <Package className="w-4 h-4 mr-2" />
                  View All Orders
                </Button>
              </CardContent>
            </Card>

            {/* Payment Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Payment Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Payment Method</span>
                    <span className="text-sm font-medium">
                      {orderDetails.paymentMethod.brand.toUpperCase()} •••• {orderDetails.paymentMethod.last4}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Paid</span>
                    <span className="text-sm font-medium">
                      ${(orderDetails.total / 100).toFixed(2)} {orderDetails.currency.toUpperCase()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Next Steps */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  What's Next?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <Mail className="w-4 h-4 mt-0.5 text-cyan-500" />
                    <div>
                      <p className="font-medium">Email Confirmation</p>
                      <p className="text-muted-foreground">Check your email for order details</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Truck className="w-4 h-4 mt-0.5 text-cyan-500" />
                    <div>
                      <p className="font-medium">Shipping Updates</p>
                      <p className="text-muted-foreground">We'll notify you when your order ships</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Gift className="w-4 h-4 mt-0.5 text-cyan-500" />
                    <div>
                      <p className="font-medium">Enjoy Your Purchase</p>
                      <p className="text-muted-foreground">Your items will arrive soon!</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Continue Shopping */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-12 text-center"
        >
          <h3 className="text-2xl font-bold mb-4">Continue Shopping</h3>
          <p className="text-muted-foreground mb-6">
            Discover more amazing streetwear from VLANCO
          </p>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => navigate('/collections')} size="lg">
              Browse Collections
            </Button>
            <Button onClick={() => navigate('/')} variant="outline" size="lg">
              Back to Home
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default EnhancedCheckoutSuccess;
