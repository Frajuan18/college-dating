// src/components/ProtectedRoute.jsx
import React, { useEffect, useState } from 'react';

const ProtectedRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if admin is logged in
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    
    if (!isAdmin) {
      window.location.href = '/admin/login';
      return;
    }

    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-6 w-6 border-2 border-gray-900 border-t-transparent animate-spin rounded-full"></div>
          <p className="text-gray-500 text-sm mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;