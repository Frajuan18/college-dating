// components/StepProgress.jsx
import React from 'react';

const StepProgress = ({ step }) => {
  return (
    <div className="flex items-center justify-center mb-8">
      <div className="flex items-center">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
          step >= 1 ? 'bg-pink-200 text-rose-900' : 'bg-white/20 text-white'
        }`}>
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
          </svg>
        </div>
        <div className={`w-16 h-1 ${
          step >= 2 ? 'bg-pink-200' : 'bg-white/20'
        }`} />
      </div>
      <div className="flex items-center">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
          step >= 2 ? 'bg-pink-200 text-rose-900' : 'bg-white/20 text-white'
        }`}>
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
        </div>
        <div className={`w-16 h-1 ${
          step >= 3 ? 'bg-pink-200' : 'bg-white/20'
        }`} />
      </div>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
        step >= 3 ? 'bg-pink-200 text-rose-900' : 'bg-white/20 text-white'
      }`}>
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
          <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
        </svg>
      </div>
    </div>
  );
};

export default StepProgress;