import React from 'react';
import { ArrowRight, ArrowLeft, Brain, MessageCircle } from 'lucide-react';

const AIChatStep = ({ onboardingData, updateStepData, nextStep, prevStep }) => {
  const handleContinue = () => {
    nextStep();
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-3xl font-light mb-4 text-center">Meet Your AI Assistant</h2>
      <p className="text-gray-600 mb-8 text-center font-light">
        Allie comes with a powerful AI chat function to help you on your family balance journey
      </p>
      
      {/* Educational Panel */}
      <div className="bg-indigo-50 p-6 rounded-lg border border-indigo-100 mb-8">
        <div className="flex items-center mb-4">
          <MessageCircle size={24} className="text-indigo-600 mr-2" />
          <h3 className="text-xl font-medium text-indigo-800">Your Personal AI Support</h3>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-indigo-800 mb-2">Ask Anything</h4>
            <p className="text-indigo-800 font-light text-sm mb-3">
              Chat with our AI assistant about family balance topics:
            </p>
            <ul className="text-sm text-indigo-800 font-light space-y-1">
              <li>• How to balance invisible work</li>
              <li>• Strategies for better communication</li>
              <li>• Personalized recommendations</li>
              <li>• Research-backed parenting advice</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-indigo-800 mb-2">Powered by Claude</h4>
            <p className="text-indigo-800 font-light text-sm">
              Our AI assistant uses advanced technology to provide thoughtful, nuanced advice tailored to your family's unique situation.
            </p>
            <div className="mt-3 bg-white rounded p-3">
              <Brain size={60} className="text-indigo-300 mx-auto" />
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-6">
        <div className="p-4 bg-gray-50 rounded-md mb-6">
          <h3 className="font-medium mb-2">Example Chat</h3>
          <div className="space-y-3">
            <div className="flex">
              <div className="bg-gray-100 p-3 rounded-lg max-w-[80%]">
                <p className="text-sm font-light"><strong>You:</strong> How can I reduce the imbalance in our invisible household work?</p>
              </div>
            </div>
            <div className="flex justify-end">
              <div className="bg-indigo-100 p-3 rounded-lg max-w-[80%]">
                <p className="text-sm font-light"><strong>Allie:</strong> Based on your family data, I see a 70/30 split in invisible tasks. Try starting with the meal planning task this week - our research shows this single change can reduce invisible imbalance by 15%.</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center mb-2">
            <Brain size={20} className="text-indigo-500 mr-2" />
            <h3 className="text-xl font-light">Key Benefits</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-gray-50 rounded-md">
              <h4 className="font-medium mb-1">24/7 Support</h4>
              <p className="text-sm text-gray-600 font-light">Get help whenever you need it, no waiting</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-md">
              <h4 className="font-medium mb-1">Personalized Advice</h4>
              <p className="text-sm text-gray-600 font-light">Recommendations based on your family's data</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-md">
              <h4 className="font-medium mb-1">Research-Backed</h4>
              <p className="text-sm text-gray-600 font-light">Insights from family dynamics studies</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-md">
              <h4 className="font-medium mb-1">Private & Secure</h4>
              <p className="text-sm text-gray-600 font-light">Your conversations stay confidential</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex gap-4">
        <button
          type="button"
          onClick={prevStep}
          className="flex-1 flex items-center justify-center bg-gray-100 text-gray-800 py-3 px-6 rounded-md hover:bg-gray-200 transition-colors font-medium"
        >
          <ArrowLeft size={18} className="mr-2" />
          Back
        </button>
        <button
          type="button"
          onClick={handleContinue}
          className="flex-1 flex items-center justify-center bg-black text-white py-3 px-6 rounded-md hover:bg-gray-800 transition-colors font-medium"
        >
          Continue
          <ArrowRight size={18} className="ml-2" />
        </button>
      </div>
    </div>
  );
};

export default AIChatStep;