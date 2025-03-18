import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, Star, Brain, Shield, CreditCard } from 'lucide-react';

const PaymentScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [familyData, setFamilyData] = useState(null);
  const [planType, setPlanType] = useState('monthly');
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  
  // Load family data from location state or localStorage
  useEffect(() => {
    if (location?.state?.familyData) {
      setFamilyData(location.state.familyData);
    } else {
      try {
        const savedData = localStorage.getItem('pendingFamilyData');
        if (savedData) {
          setFamilyData(JSON.parse(savedData));
        }
      } catch (e) {
        console.error("Error loading family data:", e);
      }
    }
  }, [location]);

  const handlePlanChange = (plan) => {
    setPlanType(plan);
  };

  const applyCoupon = () => {
    if (couponCode.toLowerCase() === 'olytheawesome' || couponCode.toLowerCase() === 'stefan') {
      setCouponApplied(true);
      setError(null);
    } else {
      setError('Invalid coupon code');
    }
  };

  const handleCompletePayment = () => {
    setIsProcessing(true);
    
    // Save payment status and family data in localStorage
    try {
      localStorage.setItem('paymentCompleted', 'true');
      if (familyData) {
        localStorage.setItem('pendingFamilyData', JSON.stringify(familyData));
      }
    } catch (e) {
      console.error("Error saving payment status:", e);
    }
    
    // Simulate payment processing
    setTimeout(() => {
      // Redirect to dashboard loader that will handle family data loading
      navigate('/dashboard-loader');
    }, 1000);
  };

  const calculatePrice = () => {
    if (couponApplied) return 0;
    
    return planType === 'monthly' ? 20 : 180;
  };

  const priceDisplay = () => {
    if (couponApplied) return "Free";
    
    return planType === 'monthly' 
      ? "$20/month" 
      : "$180/year ($15/month)";
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-2">Subscribe to Allie</h1>
        <p className="text-center text-gray-600 mb-6">
          Experience the power of AI family balance with personalized insights
        </p>
        
        {/* Main Content */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left Column: Plan Selection */}
          <div className="md:w-2/3">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Choose Your Plan</h2>
              
              {/* Plan Toggle */}
              <div className="flex rounded-lg bg-gray-100 p-1 mb-6">
                <button 
                  className={`flex-1 py-2 rounded-md text-center ${planType === 'monthly' ? 'bg-white shadow-sm' : ''}`}
                  onClick={() => handlePlanChange('monthly')}
                >
                  Monthly
                </button>
                <button 
                  className={`flex-1 py-2 rounded-md text-center ${planType === 'annual' ? 'bg-white shadow-sm' : ''}`}
                  onClick={() => handlePlanChange('annual')}
                >
                  Annual (Save 25%)
                </button>
              </div>
              
              {/* Plan Details */}
              <div className={`border rounded-lg p-6 mb-6 ${planType === 'annual' ? 'border-blue-200 bg-blue-50' : ''}`}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-medium">{planType === 'monthly' ? 'Monthly Plan' : 'Annual Plan'}</h3>
                    <p className="text-gray-600">Full access to all features</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">
                      {priceDisplay()}
                    </div>
                    {planType === 'annual' && <p className="text-green-600 text-sm">Save $60/year</p>}
                  </div>
                </div>
                
                <ul className="space-y-2 mb-4">
                  <li className="flex items-start">
                    <CheckCircle size={18} className="text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span>AI-powered family balance analytics</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle size={18} className="text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span>Weekly personalized task recommendations</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle size={18} className="text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span>Relationship insights and improvement tools</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle size={18} className="text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span>Family meeting agendas and guides</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle size={18} className="text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span>Unlimited family members and devices</span>
                  </li>
                  {planType === 'annual' && (
                    <li className="flex items-start">
                      <CheckCircle size={18} className="text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                      <span className="font-medium">Priority access to new AI features</span>
                    </li>
                  )}
                </ul>
              </div>
              
              {/* Coupon Code */}
              {!couponApplied ? (
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">Have a coupon code?</label>
                  <div className="flex">
                    <input
                      type="text"
                      className="flex-1 p-2 border rounded-l-md"
                      placeholder="Enter coupon code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                    />
                    <button
                      onClick={applyCoupon}
                      className="px-4 py-2 bg-gray-800 text-white rounded-r-md hover:bg-gray-700"
                    >
                      Apply
                    </button>
                  </div>
                  {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
                </div>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
                  <div className="flex items-start">
                    <CheckCircle size={18} className="text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Coupon applied successfully!</p>
                      <p className="text-sm text-green-700">Enjoy Allie at no cost.</p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Payment Form */}
              {!couponApplied && (
                <div>
                  <h3 className="text-lg font-medium mb-3">Payment Details</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Card Number</label>
                      <div className="flex border rounded-md overflow-hidden">
                        <div className="bg-gray-100 p-2 flex items-center">
                          <CreditCard size={20} className="text-gray-500" />
                        </div>
                        <input 
                          type="text" 
                          className="w-full p-2 focus:outline-none" 
                          placeholder="1234 5678 9012 3456" 
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Expiration Date</label>
                        <input 
                          type="text" 
                          className="w-full p-2 border rounded-md" 
                          placeholder="MM/YY" 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">CVC</label>
                        <input 
                          type="text" 
                          className="w-full p-2 border rounded-md" 
                          placeholder="123" 
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Right Column: AI Value Prop & Summary */}
          <div className="md:w-1/3">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">The AI Advantage</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex">
                  <div className="mr-3 text-purple-600">
                    <Brain size={24} className="flex-shrink-0" />
                  </div>
                  <div>
                    <h4 className="font-medium">Claude AI-Powered</h4>
                    <p className="text-sm text-gray-600">Leveraging cutting-edge Claude AI for personalized insights</p>
                  </div>
                </div>
                
                <div className="flex">
                  <div className="mr-3 text-blue-600">
                    <Star size={24} className="flex-shrink-0" />
                  </div>
                  <div>
                    <h4 className="font-medium">Scientific Approach</h4>
                    <p className="text-sm text-gray-600">Research-backed 7-factor weighting system for accurate balance measurement</p>
                  </div>
                </div>
                
                <div className="flex">
                  <div className="mr-3 text-green-600">
                    <Shield size={24} className="flex-shrink-0" />
                  </div>
                  <div>
                    <h4 className="font-medium">Private & Secure</h4>
                    <p className="text-sm text-gray-600">Your family data is encrypted and never shared</p>
                  </div>
                </div>
              </div>
              
              <div className="border-t pt-4 mb-6">
                <h3 className="font-medium mb-2">Order Summary</h3>
                <div className="flex justify-between text-sm mb-1">
                  <span>{planType === 'monthly' ? 'Monthly subscription' : 'Annual subscription'}</span>
                  <span>{planType === 'monthly' ? '$20.00' : '$180.00'}</span>
                </div>
                
                {couponApplied && (
                  <div className="flex justify-between text-sm mb-1 text-green-600">
                    <span>Coupon discount</span>
                    <span>{planType === 'monthly' ? '-$20.00' : '-$180.00'}</span>
                  </div>
                )}
                
                <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t">
                  <span>Total</span>
                  <span>${calculatePrice().toFixed(2)}</span>
                </div>
              </div>
              
              <button
                onClick={handleCompletePayment}
                disabled={isProcessing}
                className="w-full py-3 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
              >
                {isProcessing ? 'Processing...' : couponApplied ? 'Continue' : 'Complete Payment'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentScreen;