// src/components/blog/BlogHomePage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowRight, Clock, Tag, ChevronRight } from 'lucide-react';

const BlogHomePage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Sample blog posts
  const blogPosts = [
    {
      id: 1,
      title: "The Science of Family Balance: What Research Tells Us",
      excerpt: "Explore the latest research on how balanced parental responsibilities impact child development and family well-being.",
      category: "Research",
      author: "Allie Parent Coaches",
      date: "March 5, 2025",
      readTime: "8 min read",
      image: "/api/placeholder/600/400",
      featured: true,
      slug: "science-of-family-balance"
    },
    {
      id: 2,
      title: "5 Signs Your Family Has an Invisible Workload Imbalance",
      excerpt: "Learn to recognize the subtle signs that mental load and invisible tasks aren't being shared equally in your home.",
      category: "Mental Load",
      author: "Allie Parent Coaches",
      date: "February 28, 2025",
      readTime: "6 min read",
      image: "/api/placeholder/600/400",
      featured: true,
      slug: "signs-of-workload-imbalance"
    },
    {
      id: 3,
      title: "How to Talk to Kids About Family Responsibilities",
      excerpt: "Age-appropriate ways to discuss shared household responsibilities with children from toddlers to teens.",
      category: "Kids",
      author: "Allie Parent Coaches",
      date: "February 20, 2025",
      readTime: "7 min read",
      image: "/api/placeholder/600/400",
      slug: "kids-and-family-responsibilities"
    },
    {
      id: 4,
      title: "The Working Parent's Guide to Balance",
      excerpt: "Practical strategies for dual-career households to maintain equitable workload sharing despite busy schedules.",
      category: "Working Parents",
      author: "Allie Parent Coaches",
      date: "February 15, 2025",
      readTime: "9 min read",
      image: "/api/placeholder/600/400",
      slug: "working-parents-guide"
    },
    {
      id: 5,
      title: "Beyond 50/50: What True Balance Really Means",
      excerpt: "Why equal division isn't always the goal, and how to find the right balance for your unique family situation.",
      category: "Balance Philosophy",
      author: "Allie Parent Coaches",
      date: "February 10, 2025",
      readTime: "5 min read",
      image: "/api/placeholder/600/400",
      slug: "beyond-5050-balance"
    },
    {
      id: 6,
      title: "The Dad's Guide to Emotional Labor",
      excerpt: "Understanding, recognizing, and sharing the emotional work of parenting for fathers who want to do more.",
      category: "Emotional Labor",
      author: "Allie Parent Coaches",
      date: "February 1, 2025",
      readTime: "8 min read",
      image: "/api/placeholder/600/400",
      slug: "dads-guide-emotional-labor"
    },
    {
      id: 7,
      title: "Creating a Family Meeting Routine That Works",
      excerpt: "A step-by-step guide to implementing effective family meetings that improve communication and task sharing.",
      category: "Communication",
      author: "Allie Parent Coaches",
      date: "January 28, 2025",
      readTime: "7 min read",
      image: "/api/placeholder/600/400",
      slug: "family-meeting-routine"
    },
    {
      id: 8,
      title: "The Hidden Costs of Imbalance: Mental Health and Relationships",
      excerpt: "How uneven family workloads affect stress levels, relationship satisfaction, and long-term well-being.",
      category: "Mental Health",
      author: "Allie Parent Coaches",
      date: "January 23, 2025",
      readTime: "8 min read",
      image: "/api/placeholder/600/400",
      slug: "hidden-costs-imbalance"
    },
    {
      id: 9,
      title: "Kid-Friendly: Understanding Why Mom and Dad Share Tasks",
      excerpt: "How to explain workload sharing to children and help them develop healthy attitudes about family responsibilities.",
      category: "Kids",
      author: "Allie Parent Coaches",
      date: "January 18, 2025",
      readTime: "5 min read",
      image: "/api/placeholder/600/400",
      slug: "kid-friendly-sharing-tasks"
    },
    {
      id: 10,
      title: "Breaking Gender Patterns: Raising Kids Without Task Stereotypes",
      excerpt: "Strategies for parents who want to raise children without rigid gender roles around household responsibilities.",
      category: "Gender & Parenting",
      author: "Allie Parent Coaches",
      date: "January 15, 2025",
      readTime: "7 min read",
      image: "/api/placeholder/600/400",
      slug: "breaking-gender-patterns"
    },
    {
      id: 11,
      title: "Data-Driven Parenting: How Tracking Responsibilities Transforms Families",
      excerpt: "Why measuring and tracking family responsibilities leads to more awareness and lasting behavior change.",
      category: "Research",
      author: "Allie Parent Coaches",
      date: "January 10, 2025",
      readTime: "6 min read",
      image: "/api/placeholder/600/400",
      slug: "data-driven-parenting"
    },
    {
      id: 12,
      title: "From Conflict to Collaboration: Reframing Family Workload Discussions",
      excerpt: "How to shift away from blame and toward productive conversations about sharing responsibilities.",
      category: "Communication",
      author: "Allie Parent Coaches",
      date: "January 5, 2025",
      readTime: "7 min read",
      image: "/api/placeholder/600/400",
      slug: "conflict-to-collaboration"
    },
    {
      id: 13,
      title: "The Role of Extended Family in Household Balance",
      excerpt: "How grandparents and other family members can help create a more balanced family ecosystem.",
      category: "Extended Family",
      author: "Allie Parent Coaches",
      date: "December 28, 2024",
      readTime: "6 min read",
      image: "/api/placeholder/600/400",
      slug: "extended-family-balance"
    },
    {
      id: 14,
      title: "Seasonal Shifts: Maintaining Balance During Holidays and High-Stress Times",
      excerpt: "Strategies for keeping workload sharing on track during busy seasons like holidays and back-to-school.",
      category: "Practical Tips",
      author: "Allie Parent Coaches",
      date: "December 20, 2024",
      readTime: "8 min read",
      image: "/api/placeholder/600/400",
      slug: "seasonal-balance-shifts"
    },
    {
      id: 15,
      title: "The Impact of Balanced Parenting on Children's Future Relationships",
      excerpt: "How witnessing balanced workload sharing shapes children's expectations for their own future partnerships.",
      category: "Research",
      author: "Allie Parent Coaches",
      date: "December 15, 2024",
      readTime: "7 min read",
      image: "/api/placeholder/600/400",
      slug: "impact-on-childrens-future"
    }
  ];
  
  const categories = [
    'All',
    'Research',
    'Mental Load',
    'Kids',
    'Working Parents',
    'Communication',
    'Emotional Labor',
    'Gender & Parenting',
    'Practical Tips',
    'Mental Health',
    'Balance Philosophy',
    'Extended Family'
  ];
  
  // Filter posts based on search term and category
  useEffect(() => {
    let results = blogPosts;
    
    if (searchTerm) {
      results = results.filter(post => 
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedCategory !== 'All') {
      results = results.filter(post => post.category === selectedCategory);
    }
    
    setFilteredPosts(results);
  }, [searchTerm, selectedCategory]);
  
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
              onClick={() => navigate('/product-overview')}
              className="text-gray-800 hover:text-gray-600"
            >
              Product Overview
            </button>
            <button 
              onClick={() => navigate('/how-it-works')}
              className="text-gray-800 hover:text-gray-600"
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
              className="text-black hover:text-gray-600 font-medium"
            >
              Blog
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
      
      {/* Blog Hero Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">The Allie Blog</h1>
          <p className="text-xl md:text-2xl">
            Science-backed insights on family balance and shared responsibility
          </p>
          
          {/* Search Bar */}
          <div className="max-w-lg mx-auto mt-8">
            <div className="flex items-center bg-white rounded-full overflow-hidden shadow-md">
              <div className="pl-4 text-gray-400">
                <Search size={20} />
              </div>
              <input
                type="text"
                placeholder="Search articles..."
                className="w-full py-3 px-4 focus:outline-none text-gray-700"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>
      
      {/* Category Navigation */}
      <section className="py-6 border-b sticky top-0 bg-white z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex overflow-x-auto pb-2 hide-scrollbar">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 mr-2 rounded-full whitespace-nowrap ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>
      
      {/* Featured Articles */}
      {selectedCategory === 'All' && !searchTerm && (
        <section className="py-12">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-2xl font-bold mb-8">Featured Articles</h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              {blogPosts.filter(post => post.featured).map((post) => (
                <div key={post.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="relative h-60 overflow-hidden">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-full">
                        Featured
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center mb-2 text-sm text-gray-500">
                      <span>{post.date}</span>
                      <span className="mx-2">•</span>
                      <span className="flex items-center"><Clock size={14} className="mr-1" />{post.readTime}</span>
                    </div>
                    <h3 className="text-xl font-bold mb-2">{post.title}</h3>
                    <p className="text-gray-600 mb-4">{post.excerpt}</p>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center text-sm px-3 py-1 bg-gray-100 rounded-full">
                        <Tag size={14} className="mr-1" />
                        {post.category}
                      </span>
                      <button
                        onClick={() => navigate(`/blog/${post.slug}`)}
                        className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
                      >
                        Read more <ArrowRight size={16} className="ml-1" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
      
      {/* All Articles */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl font-bold mb-8">
            {searchTerm 
              ? `Search Results for "${searchTerm}"`
              : selectedCategory === 'All'
                ? 'All Articles'
                : `${selectedCategory} Articles`
            }
          </h2>
          
          {filteredPosts.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-600">No articles found. Please try a different search or category.</p>
            </div>
          )}
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post) => (
              <div 
                key={post.id} 
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(`/blog/${post.slug}`)}
              >
                <div className="h-48 overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center mb-2 text-sm text-gray-500">
                    <span>{post.date}</span>
                    <span className="mx-2">•</span>
                    <span className="flex items-center"><Clock size={14} className="mr-1" />{post.readTime}</span>
                  </div>
                  <h3 className="text-lg font-bold mb-2">{post.title}</h3>
                  <p className="text-gray-600 mb-4 text-sm line-clamp-3">{post.excerpt}</p>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center text-xs px-2 py-1 bg-gray-100 rounded-full">
                      <Tag size={12} className="mr-1" />
                      {post.category}
                    </span>
                    <span className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center">
                      Read more <ChevronRight size={14} className="ml-1" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Subscribe to Blog Updates */}
      <section className="py-16 bg-blue-50">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Stay Up-to-Date</h2>
          <p className="text-lg text-gray-600 mb-8">
            Subscribe to our newsletter for the latest articles on family balance and parenting insights
          </p>
          
          <div className="max-w-md mx-auto">
            <div className="flex">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 p-3 border border-r-0 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-r-md">
                Subscribe
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              We'll never share your email. Unsubscribe anytime.
            </p>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Family's Balance?</h2>
          <p className="text-xl mb-8">Move from reading about balance to experiencing it firsthand with Allie.</p>
          <button 
            onClick={() => navigate('/signup')}
            className="px-8 py-4 bg-white text-blue-600 rounded-md text-lg font-medium hover:bg-gray-100"
          >
            Get Started Free
          </button>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="px-6 py-12 bg-gray-50 border-t">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h2 className="text-2xl font-bold">Allie</h2>
              <p className="text-gray-600">Balancing family responsibilities together</p>
            </div>
            <div className="flex space-x-6">
              <button onClick={() => navigate('/product-overview')} className="text-gray-600 hover:text-gray-900">Product Overview</button>
              <button onClick={() => navigate('/how-it-works')} className="text-gray-600 hover:text-gray-900">How It Works</button>
              <button onClick={() => navigate('/about-us')} className="text-gray-600 hover:text-gray-900">About Us</button>
              <button onClick={() => navigate('/blog')} className="text-gray-600 hover:text-gray-900">Blog</button>
              <button onClick={() => navigate('/login')} className="text-gray-600 hover:text-gray-900">Log In</button>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-gray-500 text-sm">
            <p>© 2025 Allie. All rights reserved.</p>
          </div>
        </div>
      </footer>
      
      {/* Custom Styles */}
      <style jsx="true">{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default BlogHomePage;