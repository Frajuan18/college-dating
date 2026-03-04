// Login.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value
    });
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    console.log('Login attempt:', formData);
    navigate('/dashboard');
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-rose-50">
      {/* Background Image with Overlay - Same as CoverPage */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ 
          backgroundImage: `url('https://images.unsplash.com/photo-1516589174184-c685266d4af4?q=80&w=2000&auto=format&fit=crop')` 
        }}
      >
        {/* Consistent gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-rose-900/95 via-rose-800/90 to-rose-900/95" />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Navigation Bar - Same as CoverPage */}
      <nav className="relative z-10 flex justify-between items-center px-6 py-6 md:px-8 lg:px-16">
        <Link to="/" className="text-white text-2xl font-bold tracking-tighter drop-shadow-lg">
          MATCH<span className="text-pink-200">MAKER</span>
        </Link>
      </nav>

      {/* Main Content - Directly on background */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-6 md:px-8 lg:px-16 py-12">
        <div className="w-full max-w-md">
          {/* Eye-catching Title Section */}
          <div className="text-center mb-10">
            <h1 className="text-white text-5xl md:text-6xl font-extrabold leading-[1.1] mb-4 drop-shadow-lg">
              Welcome <span className="text-pink-200">back</span>
            </h1>
            <p className="text-white/90 text-lg md:text-xl max-w-md mx-auto leading-relaxed drop-shadow">
              Sign in to continue your journey of finding meaningful connections
            </p>
            <div className="w-24 h-1 bg-pink-200 mx-auto mt-6 rounded-full" />
          </div>

          {/* Form - Directly on background, no box, no glass */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/20 border-2 border-pink-200 text-pink-200 px-4 py-3 rounded-lg text-base">
                {error}
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-white font-medium mb-2 drop-shadow text-lg">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-white/10 border-2 border-white/30 text-white placeholder-white/50 focus:outline-none focus:border-pink-200 transition text-lg"
                placeholder="you@example.com"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-white font-medium mb-2 drop-shadow text-lg">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-white/10 border-2 border-white/30 text-white placeholder-white/50 focus:outline-none focus:border-pink-200 transition text-lg"
                placeholder="••••••••"
              />
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-white/30 bg-white/10 text-pink-200 focus:ring-pink-200 focus:ring-offset-0"
                />
                <span className="ml-2 text-base text-white/90">Remember me</span>
              </label>

              <Link to="/forgot-password" className="text-base text-pink-200 hover:text-white transition">
                Forgot password?
              </Link>
            </div>

            {/* Submit Button - Same as CoverPage */}
            <button
              type="submit"
              className="w-full bg-white text-rose-600 text-lg font-bold py-4 px-4 rounded-lg hover:scale-105 transition-transform duration-200 active:scale-95 shadow-xl mt-8"
            >
              Sign In
            </button>

            {/* Register Link */}
            <p className="text-center text-white/90 text-base">
              Don't have an account?{' '}
              <Link to="/register" className="text-pink-200 hover:text-white font-semibold transition">
                Sign up free
              </Link>
            </p>
          </form>

          {/* Trust Indicators - Same as CoverPage */}
          <div className="mt-12 flex flex-wrap justify-center items-center gap-4 text-white/80 text-xs sm:text-sm">
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>100K+ matches</span>
            </div>
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 5a3 3 0 015-2.236A3 3 0 0114.83 6H16a2 2 0 110 4h-5V9a1 1 0 10-2 0v1H4a2 2 0 110-4h1.17C5.06 5.687 5 5.35 5 5zm4 1V5a1 1 0 10-1 1h1zm3 0a1 1 0 10-1-1v1h1z" clipRule="evenodd" />
                <path d="M9 11H3v5a2 2 0 002 2h4v-7zM11 18h4a2 2 0 002-2v-5h-6v7z" />
              </svg>
              <span>Free to join</span>
            </div>
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
              </svg>
              <span>Active community</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;