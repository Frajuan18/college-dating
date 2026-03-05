// src/pages/admin/login.jsx
import React, { useState } from 'react';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Simple hardcoded check
    if (email === 'fraolabmas@gmail.com' && password === 'Fra@#$%600') {
      // Store in localStorage to maintain session
      localStorage.setItem('isAdmin', 'true');
      window.location.href = '/admin/dashboard';
    } else {
      setError('Invalid credentials');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-light text-gray-900 tracking-wide">ADMIN</h1>
          <p className="text-gray-500 text-sm mt-2">sign in to dashboard</p>
        </div>

        <form onSubmit={handleLogin} className="bg-white border border-gray-200 rounded-sm p-8 shadow-sm">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-sm">
              <p className="text-red-600 text-sm text-center">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 text-xs font-medium uppercase tracking-wider mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 text-gray-900 text-sm focus:outline-none focus:border-gray-500 rounded-none"
                placeholder="fraolabmas@gmail.com"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 text-xs font-medium uppercase tracking-wider mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 text-gray-900 text-sm focus:outline-none focus:border-gray-500 rounded-none"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gray-900 text-white text-sm font-medium py-3 hover:bg-gray-800 transition-colors rounded-none disabled:opacity-50"
            >
              {loading ? 'SIGNING IN...' : 'SIGN IN'}
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-gray-400 text-xs text-center">
              Authorized personnel only
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;