import React from 'react';

const Loader = () => {
  return (
    <div className="flex justify-start mb-2">
      <div className="bot-loader p-3 rounded-lg flex items-center">
        <span className="inline-block w-6 h-6 border-8 border-solid rounded-full 
          border-opacity-15 border-opacity-25 border-opacity-35 border-opacity-50 
          animate-loader"></span>
      </div>
    </div>
  );
};

export default Loader;