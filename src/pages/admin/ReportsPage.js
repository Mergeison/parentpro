import React from 'react';
import { FaChartBar } from 'react-icons/fa';

const ReportsPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Reports & Analytics
          </h1>
          <p className="mt-2 text-gray-600">
            View attendance and performance reports
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <FaChartBar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Reports & Analytics
          </h2>
          <p className="text-gray-600">
            This page will show attendance reports, performance analytics, and downloadable reports.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage; 