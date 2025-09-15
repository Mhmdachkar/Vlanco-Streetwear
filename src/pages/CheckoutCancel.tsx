import React from 'react';
import { useNavigate } from 'react-router-dom';
import { XCircle, ShoppingCart, ArrowLeft, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCart } from '@/hooks/useCart';

const CheckoutCancel: React.FC = () => {
  const navigate = useNavigate();
  const { items, itemCount } = useCart();

  return (
    <div className="min-h-screen bg-background py-12 px-6">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Cancel Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="w-20 h-20 mx-auto mb-6 bg-orange-100 rounded-full flex items-center justify-center"
            >
              <XCircle className="w-12 h-12 text-orange-600" />
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-4xl font-bold text-foreground mb-4"
            >
              Checkout Cancelled
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-xl text-muted-foreground"
            >
              Your checkout was cancelled. No charges have been made to your account.
            </motion.p>
          </div>

          {/* Cart Status Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Your Cart
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Items in cart:</span>
                    <span className="font-semibold">{itemCount}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <span className="text-orange-600 font-semibold">Checkout Cancelled</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment:</span>
                    <span className="text-green-600 font-semibold">No charges made</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Help Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-semibold text-primary">?</span>
                    </div>
                    <div>
                      <p className="font-medium">Payment Issues</p>
                      <p className="text-sm text-muted-foreground">
                        If you experienced payment problems, please try again or contact support.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-semibold text-primary">!</span>
                    </div>
                    <div>
                      <p className="font-medium">Changed Your Mind?</p>
                      <p className="text-sm text-muted-foreground">
                        No worries! Your items are still in your cart and ready for checkout.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-semibold text-primary">💬</span>
                    </div>
                    <div>
                      <p className="font-medium">Contact Support</p>
                      <p className="text-sm text-muted-foreground">
                        Need assistance? Our support team is here to help.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            {items.length > 0 && (
              <Button
                onClick={() => navigate('/')}
                className="flex items-center gap-2"
                size="lg"
              >
                <RefreshCw className="w-4 h-4" />
                Try Checkout Again
              </Button>
            )}
            
            <Button
              onClick={() => navigate('/')}
              variant="outline"
              className="flex items-center gap-2"
              size="lg"
            >
              <ArrowLeft className="w-4 h-4" />
              Continue Shopping
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default CheckoutCancel;
