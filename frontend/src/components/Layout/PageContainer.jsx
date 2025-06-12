import React from 'react';

const PageContainer = ({ children, className = '' }) => {
  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 ${className}`}>
        <div className="w-full">
          {children}
        </div>
      </div>
    </div>
  );
};

export default PageContainer; 