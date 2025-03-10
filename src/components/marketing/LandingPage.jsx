import { useNavigate } from 'react-router-dom';
import React, { useEffect } from 'react';
import familyPhoto from '../../assets/family-photo.jpg'; // You'll need to add this image to your assets folder

const LandingPage = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);


  return (
    <div className="min-h-screen bg-white">
      {/* Header/Nav */}
      <header className="px-6 py-4 border-b bg-white sticky top-0 z-50">
  <div className="max-w-6xl mx-auto flex justify-between items-center">
    <h1 className="text-3xl font-light">Allie</h1>
    <nav className="hidden md:flex space-x-8">
      <button 
        onClick={() => navigate('/product-overview')}
        className="text-gray-800 hover:text-blue-600 hover:underline transition-colors"
      >
        Product Overview
      </button>
      <button 
        onClick={() => navigate('/how-it-works')}
        className="text-gray-800 hover:text-blue-600 hover:underline transition-colors"
      >
        How It Works
      </button>
      <button
        onClick={() => navigate('/about-us')}
        className="text-gray-800 hover:text-blue-600 hover:underline transition-colors"
      >
        About Us
      </button>
      <button 
        onClick={() => navigate('/blog')}
        className="text-gray-800 hover:text-blue-600 hover:underline transition-colors"
      >
        Blog
      </button>
      <button 
        onClick={() => navigate('/login')}
        className="px-4 py-2 border border-gray-800 rounded hover:bg-gray-100"
      >
        Log In
      </button>
      <button 
        onClick={() => navigate('/onboarding')}
        className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
      >
        Sign Up
      </button>
    </nav>
  </div>
</header>
      
      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-5xl font-light mb-6">Balance family responsibilities together.</h2>
            <p className="text-xl text-gray-600 mb-8">
              Allie helps families measure, analyze, and balance parenting duties for happier households.
            </p>
            <button 
              onClick={() => navigate('/onboarding')}
              className="px-8 py-4 bg-blue-600 text-white rounded-md text-lg font-medium hover:bg-blue-700"
            >
              Get Started
            </button>
          </div>
          <div className="hidden md:block">
            <img 
              src={familyPhoto} 
              alt="The Palsson Family" 
              className="w-full rounded-lg shadow-lg"
            />
          </div>
        </div>
      </section>
      
      {/* Our Story Section */}
      <section className="py-16 bg-white border-t border-gray-100">
      <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-8">Our Family's Story</h2>
          <div className="bg-white p-8 rounded-lg shadow-md">
            <p className="text-lg mb-4">
              We built Allie because we experienced firsthand the challenges of balancing family responsibilities. Like many families, we struggled with the uneven distribution of household and parenting tasks, often not even realizing the imbalance until it led to frustration and conflict.
            </p>
            <p className="text-lg mb-4">
              As a family of five with three active children, we found ourselves constantly negotiating who would handle which tasks, from school pickups to meal planning to emotional support. We wanted a data-driven, scientific approach to understand our family dynamics better.
            </p>
            <p className="text-lg mb-4">
              Allie was born from our desire to create a tool that doesn't just identify imbalances but helps families work together to create meaningful, lasting change. We're excited to share it with your family and hope it brings more harmony to your home, just as it has to ours.
            </p>
            <p className="text-lg font-medium text-right">- The Palsson Family</p>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">How Allie Helps Families</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Measure & Track</h3>
              <p className="text-gray-600">
                Gather perspectives from every family member to objectively measure how responsibilities are distributed.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">AI-Powered Insights</h3>
              <p className="text-gray-600">
                Get personalized recommendations based on your family's unique dynamics and needs.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Family Meetings</h3>
              <p className="text-gray-600">
                Guided discussion frameworks to help your family communicate and implement changes effectively.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-black text-white">
  <div className="max-w-4xl mx-auto px-6 text-center">
    <h2 className="text-3xl font-bold mb-4">Ready to create a more balanced family life?</h2>
    <p className="text-xl mb-8">Join thousands of families who are transforming their relationships through better balance.</p>
    <button 
      onClick={() => navigate('/onboarding')}
      className="px-8 py-4 bg-white text-black rounded-md text-lg font-medium hover:bg-gray-100"
    >
      Get Started
    </button>
  </div>
</section>
      
      {/* Footer */}
      
{/* New code */}
<footer className="px-6 py-12 bg-gray-50 border-t">
  <div className="max-w-6xl mx-auto">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
      <div>
        <h2 className="text-2xl font-light mb-4">Allie</h2>
        <p className="text-gray-600">Balancing family responsibilities together</p>
      </div>
      
      <div>
        <h3 className="text-gray-800 font-medium mb-4">Product</h3>
        <ul className="space-y-2">
          <li>
            <button onClick={() => navigate('/product-overview')} className="text-gray-600 hover:text-gray-900">Product Overview</button>
          </li>
          <li>
            <button onClick={() => navigate('/how-it-works')} className="text-gray-600 hover:text-gray-900">How It Works</button>
          </li>
        </ul>
      </div>
      
      <div>
        <h3 className="text-gray-800 font-medium mb-4">Company</h3>
        <ul className="space-y-2">
          <li>
            <button onClick={() => navigate('/about-us')} className="text-gray-600 hover:text-gray-900">About Us</button>
          </li>
          <li>
            <button onClick={() => navigate('/blog')} className="text-gray-600 hover:text-gray-900">Blog</button>
          </li>
        </ul>
      </div>
      
      <div>
        <h3 className="text-gray-800 font-medium mb-4">Account</h3>
        <ul className="space-y-2">
          <li>
            <button onClick={() => navigate('/login')} className="text-gray-600 hover:text-gray-900">Log In</button>
          </li>
          <li>
            <button onClick={() => navigate('/onboarding')} className="text-gray-600 hover:text-gray-900">Sign Up</button>
          </li>
        </ul>
      </div>
    </div>
    <div className="mt-8 pt-8 border-t text-center text-gray-500 text-sm">
      <p>© 2025 Allie. All rights reserved.</p>
    </div>
  </div>
</footer>
    </div>
  );
};

export default LandingPage;