// src/components/common/ErrorMessage.jsx
import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

const ErrorMessage = ({ error, onDismiss, showDetails = false }) => {
  if (!error) return null;
  
  return (
    <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <AlertTriangle className="h-5 w-5 text-red-600" />
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-red-800">
            {typeof error === 'string' ? error : 'An error occurred'}
          </h3>
          
          {showDetails && typeof error === 'object' && error.message && (
            <div className="mt-2 text-sm text-red-700">
              <p>{error.message}</p>
            </div>
          )}
        </div>
        
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="ml-auto pl-3"
          >
            <X className="h-5 w-5 text-red-500" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;