import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, User, Mail, Key } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const UserSignupScreen = () => {
  const { createFamily } = useAuth();
  const navigate = useNavigate();
  const location = useLocation(); // Add this line

  const [step, setStep] = useState(1);
  const [familyName, setFamilyName] = useState('');
  const [parents, setParents] = useState([
    { name: '', role: 'Mama', email: '', password: '' },
    { name: '', role: 'Papa', email: '', password: '' }
  ]);
  const [children, setChildren] = useState([
    { name: '', age: '' }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
 
  
// Check if coming from payment with family data
useEffect(() => {
  if (location?.state?.fromPayment && location?.state?.familyData) {
    const receivedData = location.state.familyData;

    console.log("Received family data from payment:", location.state.familyData);
    if (receivedData.familyName) setFamilyName(receivedData.familyName);
    if (receivedData.parents) setParents(receivedData.parents);
    if (receivedData.children) setChildren(receivedData.children);
    setStep(4); // Jump to the review step
  }
}, [location]);

  // Handle parent input change
  const handleParentChange = (index, field, value) => {
    const updatedParents = [...parents];
    updatedParents[index] = { ...updatedParents[index], [field]: value };
    setParents(updatedParents);
  };
  
  // Handle child input change
  const handleChildChange = (index, field, value) => {
    const updatedChildren = [...children];
    updatedChildren[index] = { ...updatedChildren[index], [field]: value };
    setChildren(updatedChildren);
  };
  
  // Add new child
  const addChild = () => {
    setChildren([...children, { name: '', age: '' }]);
  };
  
  // Remove child
  const removeChild = (index) => {
    const updatedChildren = [...children];
    updatedChildren.splice(index, 1);
    setChildren(updatedChildren);
  };
  
  // Move to next step
  const nextStep = () => {
    // Simple validation
    if (step === 1 && !familyName.trim()) {
      alert('Please enter your family name');
      return;
    }
    
    if (step === 2) {
      // Validate parent information
      for (const parent of parents) {
        if (!parent.name.trim() || !parent.email.trim() || !parent.password.trim()) {
          alert('Please complete all parent information');
          return;
        }
        
        // Simple email validation
        if (!parent.email.includes('@')) {
          alert('Please enter a valid email address');
          return;
        }
      }
    }
    
    if (step === 3) {
      // Validate child information
      for (const child of children) {
        if (!child.name.trim()) {
          alert('Please enter names for all children');
          return;
        }
      }
    }
    
    setStep(step + 1);
  };
  
  // Go back to previous step
  const prevStep = () => {
    setStep(step - 1);
  };
  
  // Handle form submission
  // Handle form submission
const handleSubmit = async () => {
  setIsSubmitting(true);
  
  try {
    console.log("Starting family creation with data:", {
      familyName,
      parentData: parents.map(p => ({...p, password: '****'})), // Log without passwords
      children 
    });
    
    // Create the family in Firebase
    const familyData = {
      familyName,
      parentData: parents,
      childrenData: children
    };
    
    const result = await createFamily(familyData);
    console.log("Family creation result:", result);
    
    // Store the family ID in localStorage to help with debugging
    if (result && result.familyId) {
      localStorage.setItem('lastCreatedFamilyId', result.familyId);
      console.log("Stored family ID in localStorage:", result.familyId);
    }
    
    // Navigate directly to dashboard with the newly created family
    console.log("Navigating to dashboard with new family");
    localStorage.setItem('selectedFamilyId', result.familyId);
    // Set a flag to ensure we use this new family
    localStorage.setItem('directFamilyAccess', JSON.stringify({
      familyId: result.familyId,
      familyName: familyName,
      timestamp: new Date().getTime()
    }));
    navigate('/dashboard');
  } catch (error) {
    console.error("Detailed error creating family:", error);
    alert("There was an error creating your family: " + (error.message || "Unknown error"));
  } finally {
    setIsSubmitting(false);
  }
};
  
  // Render step content
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800">Create Your Family</h2>
              <p className="text-gray-600 mt-2">Let's get started with your family name</p>
            </div>
            
            <div className="space-y-4">
              <label className="block">
                <span className="text-gray-700 font-medium">Family Name</span>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 p-3 border"
                  placeholder="e.g., The Andersons"
                  value={familyName}
                  onChange={(e) => setFamilyName(e.target.value)}
                />
              </label>
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800">Parent Information</h2>
              <p className="text-gray-600 mt-2">Add details for the parents in your family</p>
            </div>
            
            {parents.map((parent, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-4 bg-white">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-lg">{parent.role}</h3>
                </div>
                
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <label className="block">
                    <span className="text-gray-700 text-sm">Name</span>
                    <div className="mt-1 flex items-center border rounded-md overflow-hidden">
                      <div className="bg-gray-100 p-2 text-gray-500">
                        <User size={18} />
                      </div>
                      <input
                        type="text"
                        className="block w-full p-2 focus:outline-none"
                        placeholder={`${parent.role}'s name`}
                        value={parent.name}
                        onChange={(e) => handleParentChange(index, 'name', e.target.value)}
                      />
                    </div>
                  </label>
                  
                  <label className="block">
                    <span className="text-gray-700 text-sm">Email Address</span>
                    <div className="mt-1 flex items-center border rounded-md overflow-hidden">
                      <div className="bg-gray-100 p-2 text-gray-500">
                        <Mail size={18} />
                      </div>
                      <input
                        type="email"
                        className="block w-full p-2 focus:outline-none"
                        placeholder={`${parent.role}'s email`}
                        value={parent.email}
                        onChange={(e) => handleParentChange(index, 'email', e.target.value)}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">We'll send weekly progress updates to this address</p>
                  </label>
                </div>
                
                <label className="block">
                  <span className="text-gray-700 text-sm">Password</span>
                  <div className="mt-1 flex items-center border rounded-md overflow-hidden">
                    <div className="bg-gray-100 p-2 text-gray-500">
                      <Key size={18} />
                    </div>
                    <input
                      type="password"
                      className="block w-full p-2 focus:outline-none"
                      placeholder="Create a password"
                      value={parent.password}
                      onChange={(e) => handleParentChange(index, 'password', e.target.value)}
                    />
                  </div>
                </label>
              </div>
            ))}
          </div>
        );
      
      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800">Children Information</h2>
              <p className="text-gray-600 mt-2">Add your children to complete your family profile</p>
            </div>
            
            <div className="space-y-4">
              {children.map((child, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-4 bg-white">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Child {index + 1}</h3>
                    {children.length > 1 && (
                      <button
                        onClick={() => removeChild(index)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <label className="block">
                      <span className="text-gray-700 text-sm">Name</span>
                      <input
                        type="text"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 p-2 border"
                        placeholder="Child's name"
                        value={child.name}
                        onChange={(e) => handleChildChange(index, 'name', e.target.value)}
                      />
                    </label>
                    
                    <label className="block">
                      <span className="text-gray-700 text-sm">Age</span>
                      <input
                        type="number"
                        min="1"
                        max="18"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 p-2 border"
                        placeholder="Age"
                        value={child.age}
                        onChange={(e) => handleChildChange(index, 'age', e.target.value)}
                      />
                    </label>
                  </div>
                </div>
              ))}
              
              <button
                onClick={addChild}
                className="w-full py-2 flex items-center justify-center text-blue-600 border border-blue-300 rounded-md hover:bg-blue-50"
              >
                <Plus size={16} className="mr-2" />
                Add Another Child
              </button>
            </div>
          </div>
        );
      
      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800">Review & Confirm</h2>
              <p className="text-gray-600 mt-2">Confirm your family information</p>
            </div>
            
            <div className="space-y-6">
              <div className="p-4 border rounded-lg bg-white">
                <h3 className="font-medium text-lg mb-2">Family Name</h3>
                <p>{familyName}</p>
              </div>
              
              <div className="p-4 border rounded-lg bg-white">
                <h3 className="font-medium text-lg mb-3">Parents</h3>
                <div className="space-y-3">
                  {parents.map((parent, index) => (
                    <div key={index} className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                        <User size={18} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{parent.name || `[${parent.role}]`}</p>
                        <p className="text-sm text-gray-500">{parent.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="p-4 border rounded-lg bg-white">
                <h3 className="font-medium text-lg mb-3">Children</h3>
                <div className="space-y-3">
                  {children.map((child, index) => (
                    <div key={index} className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                        <User size={18} className="text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">{child.name || 'Unnamed Child'}</p>
                        {child.age && <p className="text-sm text-gray-500">{child.age} years old</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return <div>Unknown step</div>;
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8">
      <div className="container mx-auto px-4 max-w-lg">
        {/* Header with logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-800 mb-2">Allie</h1>
          <p className="text-gray-600">
            Balancing family responsibilities together
          </p>
        </div>
        
        {/* Progress steps */}
        <div className="flex items-center justify-between mb-8">
          {[1, 2, 3, 4].map((stepNumber) => (
            <div key={stepNumber} className="flex flex-col items-center">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  stepNumber === step
                    ? 'bg-blue-600 text-white'
                    : stepNumber < step
                      ? 'bg-green-100 text-green-600'
                      : 'bg-gray-100 text-gray-400'
                }`}
              >
                {stepNumber < step ? '✓' : stepNumber}
              </div>
              <span className="text-xs mt-1 text-gray-500">
                {stepNumber === 1 && 'Family'}
                {stepNumber === 2 && 'Parents'}
                {stepNumber === 3 && 'Children'}
                {stepNumber === 4 && 'Review'}
              </span>
            </div>
          ))}
        </div>
        
        {/* Main content card */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          {renderStepContent()}
          
          {/* Navigation buttons */}
          <div className="flex justify-between mt-8">
            {step > 1 ? (
              <button
                onClick={prevStep}
                className="px-4 py-2 flex items-center text-gray-700 hover:text-blue-600"
                disabled={isSubmitting}
              >
                <ArrowLeft size={16} className="mr-1" />
                Back
              </button>
            ) : (
              <button
                onClick={() => navigate('/')}
                className="px-4 py-2 flex items-center text-gray-700 hover:text-blue-600"
              >
                <ArrowLeft size={16} className="mr-1" />
                Cancel
              </button>
            )}
            
            {step < 4 ? (
              <button
                onClick={nextStep}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Continue
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating Family...' : 'Create Family'}
              </button>
            )}
          </div>
        </div>
        
        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>Allie v1.0 - All your data stays private to your family</p>
        </div>
      </div>
    </div>
  );
};

export default UserSignupScreen;