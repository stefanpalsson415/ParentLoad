// src/components/common/LoadingScreen.js
import React from 'react';

const LoadingScreen = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="relative w-24 h-24">
        <div className="absolute top-0 left-0 w-full h-full border-4 border-gray-200 rounded-full"></div>
        <div className="absolute top-0 left-0 w-full h-full border-4 border-black rounded-full animate-spin border-t-transparent"></div>
      </div>
      <h2 className="mt-6 text-xl font-medium text-gray-800">Loading...</h2>
      <p className="mt-2 text-gray-600">Please wait while we set up your experience</p>
    </div>
  );
};

export default LoadingScreen;