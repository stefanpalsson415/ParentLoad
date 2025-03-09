// Create a new file: src/components/marketing/LandingPage.jsx

import React from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-white">
      {/* Header/Nav */}
      <header className="px-6 py-4 border-b">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-bold">Allie</h1>
          <nav className="hidden md:flex space-x-8">
            <a href="#how" className="text-gray-800 hover:text-gray-600">How It Works</a>
            <a href="#about" className="text-gray-800 hover:text-gray-600">About Us</a>
            <button 
              onClick={() => navigate('/login')}
              className="px-4 py-2 border border-gray-800 rounded hover:bg-gray-100"
            >
              Log In
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
              Continue
            </button>
          </div>
          <div className="hidden md:block">
            {/* Image placeholder - you can add your own image here */}
            <div className="w-full aspect-square bg-gray-100 rounded-lg"></div>
          </div>
        </div>
      </section>
      
      {/* More sections would follow... */}
    </div>
  );
};

export default LandingPage;