import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Book, Brain, Scale, ChevronDown, ChevronUp, Heart, Clock, CheckCircle2, BarChart3, Users } from 'lucide-react';

const HowThisWorksScreen = () => {
  const [expandedSection, setExpandedSection] = useState(['science', 'survey', 'ai', 'weekly', 'kids']);
  const toggleSection = (section) => {
    if (expandedSection.includes(section)) {
      setExpandedSection(expandedSection.filter(item => item !== section));
    } else {
      setExpandedSection([...expandedSection, section]);
    }
  };

  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Header */}
{/* Header */}
<div className="px-6 py-4 border-b bg-white sticky top-0 z-50">
  <div className="max-w-6xl mx-auto flex justify-between items-center">
    <h1 className="text-3xl font-light cursor-pointer" onClick={() => navigate('/')}>Allie</h1>
    <nav className="hidden md:flex space-x-8">
      <button 
        onClick={() => navigate('/product-overview')}
        className="text-gray-800 hover:text-gray-600"
      >
        Product Overview
      </button>
      <button 
        onClick={() => navigate('/how-it-works')}
        className="text-gray-800 hover:text-gray-600 font-medium"
      >
        How It Works
      </button>
      <button
        onClick={() => navigate('/about-us')}
        className="text-gray-800 hover:text-gray-600"
      >
        About Us
      </button>
      <button 
        onClick={() => navigate('/blog')}
        className="text-gray-800 hover:text-gray-600"
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
        onClick={() => navigate('/signup')}
        className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
      >
        Sign Up
      </button>
    </nav>
  </div>
</div>
      {/* Main Content */}
      <div className="max-w-3xl mx-auto p-4">
        {/* Introduction Card */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
          <div className="p-6">
            <div className="flex items-start">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mr-4">
                <Scale className="text-blue-600" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">Balancing Your Family's Load</h2>
                <p className="text-gray-600 mb-4">
                  Allie uses data-driven insights to help families distribute responsibilities more equitably,
                  leading to reduced stress, stronger relationships, and healthier, happier families.
                </p>
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="bg-amber-50 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <Heart className="text-amber-500 mr-2" size={18} />
                      <h3 className="font-medium text-amber-800">Less Stress</h3>
                    </div>
                    <p className="text-sm text-amber-700">
                      Balanced responsibilities reduce burnout and improve mental health for the entire family.
                    </p>
                  </div>
                  <div className="bg-emerald-50 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <Clock className="text-emerald-500 mr-2" size={18} />
                      <h3 className="font-medium text-emerald-800">More Quality Time</h3>
                    </div>
                    <p className="text-sm text-emerald-700">
                      Better balance means more time for what matters: meaningful family connections.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Science & Research Section */}
        <div 
          className="bg-white rounded-lg shadow-sm overflow-hidden mb-6 cursor-pointer"
          onClick={() => toggleSection('science')}
        >
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mr-4">
                  <Brain className="text-purple-600" size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-2">The Science Behind Allie</h2>
                  <p className="text-gray-600">
                    Our approach is backed by research showing that balanced parental responsibilities lead to improved family outcomes.
                  </p>
                </div>
              </div>
              <div>
              {expandedSection.includes('science') ? (
  <ChevronUp className="text-gray-500" size={24} />
) : (
  <ChevronDown className="text-gray-500" size={24} />
)}
              </div>
            </div>
          </div>

          {expandedSection === 'science' && (
            <div className="px-6 pb-6 pt-0">
              <div className="pl-16 space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-800 mb-2">Surgeon General's Advisory (2024)</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    Dr. Vivek Murthy highlighted parental stress as a significant public health issue, with 33% of parents reporting high stress levels compared to 20% of non-parents.
                  </p>
                  <p className="text-xs text-blue-600">
                    Source: "Parents Under Pressure" Advisory, U.S. Surgeon General
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-800 mb-2">Unequal Division of Labor</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    Multiple studies show that women still perform 60-80% of household tasks and childcare, even in dual-income households, leading to increased stress and reduced relationship satisfaction.
                  </p>
                  <p className="text-xs text-blue-600">
                    Source: American Psychological Association, 2023
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-800 mb-2">Mental Load Impact</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    Research shows that the cognitive burden of managing household tasks ("mental load") contributes significantly to stress and burnout, particularly when distributed unevenly.
                  </p>
                  <p className="text-xs text-blue-600">
                    Source: Journal of Family Psychology, 2022
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* How It Works Section */}
        <div 
          className="bg-white rounded-lg shadow-sm overflow-hidden mb-6 cursor-pointer"
          onClick={() => toggleSection('survey')}
        >
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mr-4">
                  <CheckCircle2 className="text-green-600" size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-2">The 80-Question Assessment</h2>
                  <p className="text-gray-600">
                    Our comprehensive survey captures the complete picture of how responsibilities are distributed in your family.
                  </p>
                </div>
              </div>
              <div>
                {expandedSection === 'survey' ? (
                  <ChevronUp className="text-gray-500" size={24} />
                ) : (
                  <ChevronDown className="text-gray-500" size={24} />
                )}
              </div>
            </div>
          </div>

          {expandedSection === 'survey' && (
            <div className="px-6 pb-6 pt-0">
              <div className="pl-16">
                <p className="text-gray-700 mb-4">
                  Our survey divides family responsibilities into four key categories, gathering input from all family members to create a complete picture:
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-medium text-blue-800 mb-2">Visible Household Tasks</h3>
                    <p className="text-sm text-blue-700">
                      These are the tasks everyone can see: cooking, cleaning, laundry, yard work, and other physical chores around the home.
                    </p>
                  </div>
                  
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h3 className="font-medium text-purple-800 mb-2">Invisible Household Tasks</h3>
                    <p className="text-sm text-purple-700">
                      These include planning, scheduling, researching products, managing finances, and remembering important dates and events.
                    </p>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="font-medium text-green-800 mb-2">Visible Parental Tasks</h3>
                    <p className="text-sm text-green-700">
                      Direct childcare activities like driving kids to school, helping with homework, bedtime routines, and attending events.
                    </p>
                  </div>
                  
                  <div className="bg-amber-50 p-4 rounded-lg">
                    <h3 className="font-medium text-amber-800 mb-2">Invisible Parental Tasks</h3>
                    <p className="text-sm text-amber-700">
                      This includes emotional labor, anticipating children's needs, coordinating with schools, and monitoring development and health.
                    </p>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-800 mb-2">Why All Family Members Take It</h3>
                  <p className="text-sm text-gray-600">
                    Different family members often have different perceptions of who does what. By collecting data from everyone, we can identify perception gaps and get a more accurate picture of your family dynamics.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* How AI Helps */}
        <div 
          className="bg-white rounded-lg shadow-sm overflow-hidden mb-6 cursor-pointer"
          onClick={() => toggleSection('ai')}
        >
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mr-4">
                  <BarChart3 className="text-blue-600" size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-2">How AI Powers Allie</h2>
                  <p className="text-gray-600">
                    Our AI analyzes your family's data to provide personalized insights and recommendations.
                  </p>
                </div>
              </div>
              <div>
                {expandedSection === 'ai' ? (
                  <ChevronUp className="text-gray-500" size={24} />
                ) : (
                  <ChevronDown className="text-gray-500" size={24} />
                )}
              </div>
            </div>
          </div>

          {expandedSection === 'ai' && (
            <div className="px-6 pb-6 pt-0">
              <div className="pl-16 space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-800 mb-2">Pattern Recognition</h3>
                  <p className="text-sm text-gray-600">
                    Our AI algorithm identifies patterns in how tasks are distributed, spotting imbalances that might not be obvious and finding opportunities for better balance.
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-800 mb-2">Personalized Recommendations</h3>
                  <p className="text-sm text-gray-600">
                    Based on your family's unique situation, our AI suggests specific tasks to redistribute each week, gradually creating a more balanced environment.
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-800 mb-2">Progress Tracking</h3>
                  <p className="text-sm text-gray-600">
                    The system tracks changes over time, celebrating improvements and helping your family continue to make progress toward better balance.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Weekly Improvement Process */}
        <div 
          className="bg-white rounded-lg shadow-sm overflow-hidden mb-6 cursor-pointer"
          onClick={() => toggleSection('weekly')}
        >
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mr-4">
                  <Users className="text-green-600" size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-2">Your Weekly Improvement Journey</h2>
                  <p className="text-gray-600">
                    Allie uses a structured weekly process to help your family gradually achieve better balance.
                  </p>
                </div>
              </div>
              <div>
                {expandedSection === 'weekly' ? (
                  <ChevronUp className="text-gray-500" size={24} />
                ) : (
                  <ChevronDown className="text-gray-500" size={24} />
                )}
              </div>
            </div>
          </div>

          {expandedSection === 'weekly' && (
            <div className="px-6 pb-6 pt-0">
              <div className="pl-16">
                <div className="space-y-4 mb-6">
                  <div className="flex">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                      <span className="text-blue-600 font-medium">1</span>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800 mb-1">Weekly Task Assignments</h3>
                      <p className="text-sm text-gray-600">
                        Each week, parents receive 3 specific tasks designed to create better balance in their family's workload.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                      <span className="text-blue-600 font-medium">2</span>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800 mb-1">Weekly Check-in</h3>
                      <p className="text-sm text-gray-600">
                        A shorter 20-question survey helps track progress and adjusts recommendations based on what's working.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                      <span className="text-blue-600 font-medium">3</span>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800 mb-1">Family Meeting</h3>
                      <p className="text-sm text-gray-600">
                        A guided 30-minute family discussion helps everyone communicate about progress and challenges.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                      <span className="text-blue-600 font-medium">4</span>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800 mb-1">Visual Progress Tracking</h3>
                      <p className="text-sm text-gray-600">
                        Charts and visualizations help your family see improvements and celebrate progress over time.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-800 mb-2">Why Weekly Works</h3>
                  <p className="text-sm text-blue-700">
                    Research shows that sustainable change happens gradually. Our weekly approach allows families to make small, manageable changes that add up to significant improvements over time, without overwhelming anyone in the process.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
{/* Kids Focus Section */}
<div 
  className="bg-white rounded-lg shadow-sm overflow-hidden mb-6 cursor-pointer"
  onClick={() => toggleSection('kids')}
>
  <div className="p-6">
    <div className="flex items-start justify-between">
      <div className="flex items-start">
        <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mr-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Designed with Kids in Mind</h2>
          <p className="text-gray-600">
            Allie includes the whole family, with special features designed to engage children in the balance process.
          </p>
        </div>
      </div>
      <div>
        {expandedSection.includes('kids') ? (
          <ChevronUp className="text-gray-500" size={24} />
        ) : (
          <ChevronDown className="text-gray-500" size={24} />
        )}
      </div>
    </div>
  </div>

  {expandedSection.includes('kids') && (
    <div className="px-6 pb-6 pt-0">
      <div className="pl-16 space-y-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium text-gray-800 mb-2">Kid-Friendly Surveys</h3>
          <p className="text-sm text-gray-600">
            Age-appropriate questionnaires with simple language and visual cues help children share their perspectives on family responsibilities.
          </p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium text-gray-800 mb-2">Game-Like Elements</h3>
          <p className="text-sm text-gray-600">
            Interactive features make participation fun for children, with stars, achievements, and visual progress tracking.
          </p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium text-gray-800 mb-2">Developmentally Appropriate</h3>
          <p className="text-sm text-gray-600">
            Content automatically adjusts based on the child's age, ensuring it's always at the right level for their understanding.
          </p>
        </div>
        
        <div className="bg-amber-50 p-4 rounded-lg">
          <h3 className="font-medium text-amber-800 mb-2">Why Kids Matter</h3>
          <p className="text-sm text-amber-700">
            Children are important stakeholders in family balance. They often have unique insights into family dynamics, and their involvement helps them develop a healthy understanding of shared responsibility.
          </p>
        </div>
      </div>
    </div>
  )}
</div>

        {/* Ready to Start */}
        {/* Ready to Start */}
<div className="bg-black rounded-lg shadow-sm overflow-hidden text-white">
  <div className="p-6">
    <h2 className="text-xl font-light mb-3">Ready to Create Better Balance?</h2>
    <p className="opacity-90 mb-6">
      Get started with Allie today and take the first step toward a happier, more balanced family life.
    </p>
    <button 
      onClick={() => navigate('/onboarding')}
      className="px-6 py-3 bg-white text-black rounded-md font-medium hover:bg-gray-100">
      Take the Survey
    </button>
  </div>
</div>
      </div>
      {/* Footer */}
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
            <button onClick={() => navigate('/signup')} className="text-gray-600 hover:text-gray-900">Sign Up</button>
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

export default HowThisWorksScreen;