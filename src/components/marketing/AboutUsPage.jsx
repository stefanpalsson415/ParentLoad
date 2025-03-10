import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AboutUsPage = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Header/Nav */}
      <header className="px-6 py-4 border-b">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
        <h1 className="text-3xl font-light cursor-pointer" onClick={() => navigate('/')}>Allie</h1>
        <nav className="hidden md:flex space-x-8">
            <button 
              onClick={() => navigate('/how-it-works')}
              className="text-gray-800 hover:text-gray-600"
            >
              How It Works
            </button>
            <button 
              onClick={() => navigate('/about-us')}
              className="text-gray-800 hover:text-gray-600 font-medium"
            >
              About Us
            </button>
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
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Mission</h1>
          <p className="text-xl md:text-2xl">
            Creating harmony in homes through balanced responsibility sharing
          </p>
        </div>
      </section>
      
      {/* Our Story Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Our Journey</h2>
              <p className="text-lg mb-4">
                ParentLoad began as a personal project to solve our own family's challenges with distributing household and parenting responsibilities fairly.
              </p>
              <p className="text-lg mb-4">
                We realized that many of our arguments centered around mismatched expectations and "invisible work" that went unacknowledged. When we started tracking and measuring these responsibilities, our family dynamics improved dramatically.
              </p>
              <p className="text-lg">
                Seeing the positive impact on our own home, we decided to build a tool that could help other families experience the same transformation.
              </p>
            </div>
            <div className="bg-blue-50 p-8 rounded-lg">
              <h3 className="text-xl font-semibold mb-4 text-blue-800">Why We Built ParentLoad</h3>
              <ul className="space-y-4">
                <li className="flex">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>To create a data-driven approach to family responsibility sharing</span>
                </li>
                <li className="flex">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>To acknowledge and measure both visible and invisible tasks</span>
                </li>
                <li className="flex">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>To include perspectives from all family members, especially children</span>
                </li>
                <li className="flex">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>To reduce conflicts and increase harmony in family relationships</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
      
      {/* Our Science-Based Approach */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-8 text-center">Our Science-Based Approach</h2>
          <div className="bg-white p-8 rounded-lg shadow-md">
            <p className="text-lg mb-6">
              ParentLoad is built on a foundation of research in family dynamics, behavioral psychology, and organizational management. Our AI-powered system draws from these disciplines to create a holistic approach to family balance.
            </p>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="text-xl font-semibold mb-2">Research Foundations</h3>
                <p>
                  Our methods are based on peer-reviewed research on family dynamics, gender roles in household labor, and effective communication strategies.
                </p>
              </div>
              <div className="border-l-4 border-purple-500 pl-4">
                <h3 className="text-xl font-semibold mb-2">AI Enhancement</h3>
                <p>
                  We use artificial intelligence to analyze patterns in your family's responses and generate customized recommendations based on your unique situation.
                </p>
              </div>
              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="text-xl font-semibold mb-2">Evidence-Based Interventions</h3>
                <p>
                  Our task recommendations and family meeting frameworks are designed based on proven approaches to behavior change and conflict resolution.
                </p>
              </div>
              <div className="border-l-4 border-amber-500 pl-4">
                <h3 className="text-xl font-semibold mb-2">Continuous Improvement</h3>
                <p>
                  Our system learns from the collective data of thousands of families to continually refine and improve our recommendations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Meet the Team */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-8 text-center">The Team Behind ParentLoad</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4 border-2 border-gray-300">
  <img src="https://your-domain.com/path-to-family-image.jpg" alt="The Palsson Family" className="w-full h-full object-cover" />
</div>
              <h3 className="text-xl font-semibold">The Palsson Family</h3>
              <p className="text-gray-600 mb-4">Founders</p>
              <p className="text-sm">
                A family of five that experienced firsthand the challenges of balancing responsibilities and created ParentLoad to solve them.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
  <div className="w-24 h-24 rounded-full bg-gradient-to-r from-purple-400 to-pink-500 flex items-center justify-center mx-auto mb-4 border-2 border-gray-300">
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Z"></path>
      <path d="M12 8v8"></path>
      <path d="M8 12h8"></path>
    </svg>
  </div>
  <h3 className="text-xl font-semibold">Our AI Team</h3>
  <p className="text-gray-600 mb-4">Data Scientists & Family Psychologists</p>
  <p className="text-sm">
    A collaborative team of AI specialists and family dynamics experts who built the intelligent engine that powers our recommendations.
  </p>
</div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Join the ParentLoad Community</h2>
          <p className="text-xl mb-8">Experience the benefits of a more balanced family life today.</p>
          <button 
            onClick={() => navigate('/onboarding')}
            className="px-8 py-4 bg-white text-blue-600 rounded-md text-lg font-medium hover:bg-gray-100"
          >
            Start Your Family's Journey
          </button>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="px-6 py-12 bg-gray-50 border-t">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h2 className="text-2xl font-bold">ParentLoad</h2>
              <p className="text-gray-600">Balancing family responsibilities together</p>
            </div>
            <div className="flex space-x-6">
              <button onClick={() => navigate('/how-it-works')} className="text-gray-600 hover:text-gray-900">How It Works</button>
              <button onClick={() => navigate('/about-us')} className="text-gray-600 hover:text-gray-900">About Us</button>
              <button onClick={() => navigate('/login')} className="text-gray-600 hover:text-gray-900">Log In</button>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-gray-500 text-sm">
            <p>© 2025 ParentLoad. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AboutUsPage;