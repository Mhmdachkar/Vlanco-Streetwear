import React, { useState } from 'react';
import { useCart } from '@/hooks/useCart';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, CreditCard, Loader2, Tag } from 'lucide-react';
import { calculateCartTotals } from '@/services/localCheckoutService';

export default function CheckoutButton() {
  const { items, loading, createCheckout } = useCart();
  const [discountCode, setDiscountCode] = useState('');
  const [showDiscountInput, setShowDiscountInput] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Calculate totals
  const cartItems = items.map(item => ({
    product_id: item.product_id,
    variant_id: item.variant_id,
    quantity: item.quantity,
    price: item.price_at_time || item.variant?.price || item.product?.base_price || 0,
    product_name: item.product?.name || 'Product',
    product_image: item.product?.image_url || item.product?.image || '/assets/default-product.jpg',
    variant_color: item.variant?.color || 'Default',
    variant_size: item.variant?.size || 'M',
    variant_sku: item.variant?.sku || `${item.product_id}-${item.variant_id}`,
  }));

  const totals = calculateCartTotals(cartItems);

  const handleCheckout = async () => {
    if (items.length === 0) return;

    setIsProcessing(true);
    try {
      await createCheckout(discountCode || undefined);
      // The createCheckout function will redirect to Stripe, so we won't reach here
    } catch (error) {
      console.error('Checkout failed:', error);
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-8">
        <ShoppingCart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
        <p className="text-gray-500">Add some items to your cart to proceed with checkout.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border p-6 space-y-6">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <CreditCard className="h-5 w-5" />
        Checkout Summary
      </h3>

      {/* Cart Items Preview */}
      <div className="space-y-3">
        <h4 className="font-medium text-sm text-gray-700">Items in your cart:</h4>
        {items.slice(0, 3).map((item) => (
          <div key={item.id} className="flex items-center gap-3 text-sm">
            <img
              src={item.product?.image_url || '/assets/default-product.jpg'}
              alt={item.product?.name || 'Product'}
              className="w-10 h-10 rounded object-cover"
            />
            <div className="flex-1">
              <p className="font-medium">{item.product?.name}</p>
              <p className="text-gray-500">
                {item.variant?.color} • {item.variant?.size} • Qty: {item.quantity}
              </p>
            </div>
            <p className="font-medium">
              ${((item.price_at_time || item.variant?.price || 0) * item.quantity).toFixed(2)}
            </p>
          </div>
        ))}
        {items.length > 3 && (
          <p className="text-sm text-gray-500">
            +{items.length - 3} more item{items.length - 3 !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      <Separator />

      {/* Order Summary */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Subtotal ({totals.itemCount} items)</span>
          <span>${totals.subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Shipping</span>
          <span>
            {totals.shipping === 0 ? (
              <span className="text-green-600">Free</span>
            ) : (
              `$${totals.shipping.toFixed(2)}`
            )}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Tax (estimated)</span>
          <span>${totals.tax.toFixed(2)}</span>
        </div>
        {totals.subtotal < 100 && (
          <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
            💡 Add ${(100 - totals.subtotal).toFixed(2)} more for free shipping!
          </div>
        )}
        <Separator />
        <div className="flex justify-between font-semibold text-lg">
          <span>Total</span>
          <span>${totals.total.toFixed(2)}</span>
        </div>
      </div>

      {/* Discount Code */}
      <div className="space-y-3">
        {!showDiscountInput ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDiscountInput(true)}
            className="text-blue-600 hover:text-blue-700"
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
              <p className="text-xs text-gray-500">
                Discount will be applied at checkout
              </p>
            )}
          </div>
        )}
      </div>

      {/* Checkout Button */}
      <Button
        onClick={handleCheckout}
        disabled={loading || isProcessing || items.length === 0}
        className="w-full py-3 text-base font-medium"
        size="lg"
      >
        {isProcessing ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <CreditCard className="h-4 w-4 mr-2" />
            Proceed to Checkout - ${totals.total.toFixed(2)}
          </>
        )}
      </Button>

      {/* Security Notice */}
      <div className="text-xs text-gray-500 text-center space-y-1">
        <p>🔒 Secure checkout powered by Stripe</p>
        <p>Your payment information is encrypted and secure</p>
      </div>
    </div>
  );
}










