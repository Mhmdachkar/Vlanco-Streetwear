import React from 'react';
import CheckoutButton from './CheckoutButton';

/**
 * Example component showing how to use the new CheckoutButton
 * This can be used as an alternative to the CartSidebar checkout
 */
export default function CheckoutExample() {
  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6 text-center">Checkout Example</h2>
      
      {/* Use the new CheckoutButton component */}
      <CheckoutButton />
      
      <div className="mt-6 text-sm text-gray-500 text-center">
        <p>This is an example of the new CheckoutButton component.</p>
        <p>It provides a complete checkout summary with:</p>
        <ul className="mt-2 space-y-1">
          <li>• Cart items preview</li>
          <li>• Order summary with totals</li>
          <li>• Discount code input</li>
          <li>• Secure checkout button</li>
        </ul>
      </div>
    </div>
  );
}









