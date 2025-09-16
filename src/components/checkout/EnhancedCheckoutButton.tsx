import React, { useState, useEffect } from 'react';
import { useCart } from '@/hooks/useCart';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  ShoppingCart, 
  CreditCard, 
  Loader2, 
  Tag, 
  Shield, 
  Truck, 
  Gift,
  AlertCircle,
  CheckCircle,
  Zap,
  Star
} from 'lucide-react';
import { 
  createEnhancedStripeCheckout, 
  calculateEnhancedTotals, 
  validateStripeConfig,
  type EnhancedCartItem 
} from '@/services/enhancedStripeService';
import { motion, AnimatePresence } from 'framer-motion';

interface EnhancedCheckoutButtonProps {
  className?: string;
  variant?: 'default' | 'premium' | 'minimal';
  showDetails?: boolean;
  onCheckoutStart?: () => void;
  onCheckoutComplete?: (success: boolean) => void;
}

export default function EnhancedCheckoutButton({
  className = '',
  variant = 'default',
  showDetails = true,
  onCheckoutStart,
  onCheckoutComplete
}: EnhancedCheckoutButtonProps) {
  const { items, loading } = useCart();
  const [discountCode, setDiscountCode] = useState('');
  const [showDiscountInput, setShowDiscountInput] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stripeConfigValid, setStripeConfigValid] = useState(true);
  const [configErrors, setConfigErrors] = useState<string[]>([]);

  // Validate Stripe configuration on mount
  useEffect(() => {
    const validation = validateStripeConfig();
    setStripeConfigValid(validation.valid);
    setConfigErrors(validation.errors);
  }, []);

  // Convert cart items to enhanced format
  const enhancedCartItems: EnhancedCartItem[] = items.map(item => ({
    product_id: item.product_id,
    variant_id: item.variant_id,
    quantity: item.quantity,
    price: item.price_at_time || item.variant?.price || item.product?.base_price || 0,
    product_name: item.product?.name || 'Product',
    product_image: item.product?.image_url || item.product?.image || '/assets/default-product.jpg',
    variant_color: item.variant?.color || 'Default',
    variant_size: item.variant?.size || 'M',
    variant_sku: item.variant?.sku || `${item.product_id}-${item.variant_id}`,
    user_email: undefined, // Will be collected during checkout
    metadata: {
      source: 'cart',
      added_at: new Date().toISOString(),
    },
  }));

  // Calculate enhanced totals
  const totals = calculateEnhancedTotals(enhancedCartItems, discountCode);

  // Handle checkout process
  const handleCheckout = async () => {
    if (items.length === 0) {
      setError('Your cart is empty');
      return;
    }

    if (!stripeConfigValid) {
      setError('Payment system is not configured. Please contact support.');
      return;
    }

    setIsProcessing(true);
    setError(null);
    
    try {
      onCheckoutStart?.();
      
      const result = await createEnhancedStripeCheckout(
        enhancedCartItems,
        discountCode || undefined
      );

      if (result.success) {
        onCheckoutComplete?.(true);
        // Stripe will redirect, so we won't reach here
      } else {
        setError(result.error || 'Checkout failed');
        onCheckoutComplete?.(false);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      onCheckoutComplete?.(false);
    } finally {
      setIsProcessing(false);
    }
  };

  // Get variant-specific styling
  const getVariantStyles = () => {
    switch (variant) {
      case 'premium':
        return {
          button: 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-xl hover:shadow-2xl',
          container: 'bg-gradient-to-br from-slate-900 to-slate-800 border border-purple-500/20',
        };
      case 'minimal':
        return {
          button: 'bg-white text-black hover:bg-gray-50 border border-gray-200',
          container: 'bg-white border border-gray-200',
        };
      default:
        return {
          button: 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white',
          container: 'bg-card border border-border',
        };
    }
  };

  const styles = getVariantStyles();

  if (items.length === 0) {
    return (
      <div className={`p-6 text-center ${styles.container} rounded-lg ${className}`}>
        <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">Your cart is empty</h3>
        <p className="text-muted-foreground mb-4">Add some items to get started</p>
        <Button 
          onClick={() => window.location.href = '/collections'}
          className="w-full"
        >
          Browse Products
        </Button>
      </div>
    );
  }

  return (
    <motion.div 
      className={`p-6 ${styles.container} rounded-lg shadow-lg ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-500/10 rounded-lg">
            <CreditCard className="w-6 h-6 text-cyan-500" />
          </div>
          <div>
            <h3 className="text-xl font-bold">Secure Checkout</h3>
            <p className="text-sm text-muted-foreground">Powered by Stripe</p>
          </div>
        </div>
        <Badge variant="secondary" className="flex items-center gap-1">
          <Shield className="w-3 h-3" />
          Secure
        </Badge>
      </div>

      {/* Error Display */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg"
          >
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm font-medium">{error}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Configuration Error */}
      {!stripeConfigValid && (
        <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <div className="flex items-center gap-2 text-yellow-600">
            <AlertCircle className="w-4 h-4" />
            <div>
              <span className="text-sm font-medium">Configuration Issue</span>
              <ul className="text-xs mt-1">
                {configErrors.map((err, index) => (
                  <li key={index}>• {err}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {showDetails && (
        <>
          {/* Order Summary */}
          <div className="space-y-4 mb-6">
            <h4 className="font-semibold flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              Order Summary
            </h4>
            
            {/* Items */}
            <div className="space-y-2">
              {enhancedCartItems.map((item, index) => (
                <motion.div
                  key={`${item.product_id}-${item.variant_id}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-md overflow-hidden">
                      <img 
                        src={item.product_image} 
                        alt={item.product_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-medium">{item.product_name}</p>
                      <p className="text-muted-foreground text-xs">
                        {item.variant_color} • {item.variant_size} • Qty: {item.quantity}
                      </p>
                    </div>
                  </div>
                  <span className="font-medium">
                    ${((item.price * item.quantity) / 100).toFixed(2)}
                  </span>
                </motion.div>
              ))}
            </div>

            <Separator />

            {/* Totals */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${(totals.subtotal / 100).toFixed(2)}</span>
              </div>
              
              {totals.shipping > 0 && (
                <div className="flex justify-between">
                  <span className="flex items-center gap-1">
                    <Truck className="w-3 h-3" />
                    Shipping
                  </span>
                  <span>${(totals.shipping / 100).toFixed(2)}</span>
                </div>
              )}
              
              {totals.shipping === 0 && (
                <div className="flex justify-between text-green-600">
                  <span className="flex items-center gap-1">
                    <Gift className="w-3 h-3" />
                    Free Shipping
                  </span>
                  <span>FREE</span>
                </div>
              )}
              
              {totals.tax > 0 && (
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>${(totals.tax / 100).toFixed(2)}</span>
                </div>
              )}
              
              {totals.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span className="flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    Discount ({discountCode})
                  </span>
                  <span>-${(totals.discount / 100).toFixed(2)}</span>
                </div>
              )}
              
              <Separator />
              
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>${(totals.total / 100).toFixed(2)}</span>
              </div>
            </div>

            {/* Free Shipping Progress */}
            {!totals.isFreeShipping && (
              <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <div className="flex items-center gap-2 text-blue-600 mb-2">
                  <Truck className="w-4 h-4" />
                  <span className="text-sm font-medium">Free shipping available!</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${Math.min((totals.subtotal / totals.freeShippingThreshold) * 100, 100)}%` 
                    }}
                  />
                </div>
                <p className="text-xs text-blue-600 mt-1">
                  Add ${((totals.freeShippingThreshold - totals.subtotal) / 100).toFixed(2)} more for free shipping
                </p>
              </div>
            )}
          </div>

          {/* Discount Code */}
          <div className="space-y-3 mb-6">
            {!showDiscountInput ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDiscountInput(true)}
                className="text-cyan-600 hover:text-cyan-700 w-full justify-start"
              >
                <Tag className="h-4 w-4 mr-2" />
                Have a discount code?
              </Button>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="discount-code" className="text-sm font-medium">
                  Discount Code
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="discount-code"
                    placeholder="Enter discount code"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowDiscountInput(false);
                      setDiscountCode('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
                {discountCode && (
                  <p className="text-xs text-muted-foreground">
                    Discount will be applied at checkout
                  </p>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {/* Checkout Button */}
      <Button
        onClick={handleCheckout}
        disabled={loading || isProcessing || items.length === 0 || !stripeConfigValid}
        className={`w-full py-4 text-base font-semibold ${styles.button} transition-all duration-200`}
        size="lg"
      >
        {isProcessing ? (
          <>
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Zap className="h-5 w-5 mr-2" />
            Proceed to Checkout - ${(totals.total / 100).toFixed(2)}
          </>
        )}
      </Button>

      {/* Security Notice */}
      <div className="mt-4 text-xs text-muted-foreground text-center space-y-1">
        <div className="flex items-center justify-center gap-2">
          <Shield className="w-3 h-3" />
          <span>Secured by Stripe</span>
        </div>
        <p>Your payment information is encrypted and secure</p>
      </div>

      {/* Trust Indicators */}
      <div className="mt-4 flex items-center justify-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <CheckCircle className="w-3 h-3 text-green-500" />
          <span>SSL Encrypted</span>
        </div>
        <div className="flex items-center gap-1">
          <Star className="w-3 h-3 text-yellow-500" />
          <span>PCI Compliant</span>
        </div>
      </div>
    </motion.div>
  );
}
