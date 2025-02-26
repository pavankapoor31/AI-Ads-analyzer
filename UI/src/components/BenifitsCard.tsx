import React from 'react';

const BenefitCards = () => {
  return (
    <div className="atleast-400px-content-but-shrinkable space-y-4">
      <div className="bg-white shadow-md rounded-lg p-6 border border-gray-100 hover:shadow-lg transition-shadow">
        <div className="flex items-start">
          <div className="bg-indigo-100 p-3 rounded-full mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Instant Performance Analysis</h3>
            <p className="text-gray-600">Get real-time insights on your ad performance with our AI analysis. Identify what's working and what's not in seconds, not hours.</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white shadow-md rounded-lg p-6 border border-gray-100 hover:shadow-lg transition-shadow">
        <div className="flex items-start">
          <div className="bg-green-100 p-3 rounded-full mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">ROI Optimization</h3>
            <p className="text-gray-600">Our AI identifies patterns that humans miss, recommending specific improvements that increase conversions while reducing ad spend.</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white shadow-md rounded-lg p-6 border border-gray-100 hover:shadow-lg transition-shadow">
        <div className="flex items-start">
          <div className="bg-blue-100 p-3 rounded-full mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Competitive Edge</h3>
            <p className="text-gray-600">Compare your ads against competitors and industry standards. Our AI highlights unique performance points and suggests improvements to help you stand out.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BenefitCards;