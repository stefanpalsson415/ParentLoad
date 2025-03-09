// Create a new file: src/components/payment/PaymentScreen.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const PaymentScreen = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  
  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    
    // Check if coupon code is valid
    if (couponCode === 'olytheawesome') {
      // Skip payment process and proceed directly
      console.log('Free coupon applied');
      setCouponApplied(true);
      navigate('/dashboard');
      return;
    }
    
    // Handle Stripe payment logic here
    // This is simplified - you'll need to implement the actual Stripe payment flow
    
    setLoading(false);
  };
  
  const applyCoupon = () => {
    if (couponCode === 'olytheawesome') {
      setCouponApplied(true);
    } else {
      setError('Invalid coupon code');
    }
  };
  
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow">
        <h2 className="text-3xl font-light mb-6">Subscribe to Allie</h2>
        
        <div className="mb-6">
          <p className="text-lg mb-2">$1/month</p>
          <p className="text-gray-600 mb-4">Get full access to all Allie features</p>
          <ul className="space-y-2">
            <li className="flex items-center">
              <span className="mr-2 text-green-500">✓</span>
              Weekly check-ins for all family members
            </li>
            <li className="flex items-center">
              <span className="mr-2 text-green-500">✓</span>
              AI-powered balance insights
            </li>
            <li className="flex items-center">
              <span className="mr-2 text-green-500">✓</span>
              Family meeting tools and resources
            </li>
          </ul>
        </div>
        
        {couponApplied ? (
          <div className="bg-green-100 p-4 rounded mb-4">
            <p className="text-green-800">Coupon applied successfully! Enjoy Allie at no cost.</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="mt-4 w-full py-3 bg-blue-600 text-white rounded-md"
            >
              Continue to Dashboard
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Card Information</label>
              <div className="border rounded p-3">
                <CardElement options={{style: {base: {fontSize: '16px'}}}} />
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Have a coupon?</label>
              <div className="flex">
                <input
                  type="text"
                  className="flex-1 p-2 border rounded-l"
                  value={couponCode}
                  onChange={e => setCouponCode(e.target.value)}
                  placeholder="Enter coupon code"
                />
                <button
                  type="button"
                  onClick={applyCoupon}
                  className="px-4 py-2 bg-gray-200 rounded-r"
                >
                  Apply
                </button>
              </div>
              {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
            </div>
            
            <button
              type="submit"
              disabled={!stripe || loading}
              className="w-full py-3 bg-blue-600 text-white rounded-md"
            >
              {loading ? 'Processing...' : 'Subscribe - $1/month'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default PaymentScreen;