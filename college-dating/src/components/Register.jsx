// Register.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: '',
    gender: '',
    interestedIn: ''
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    }

    if (!formData.gender) {
      newErrors.gender = 'Please select your gender';
    }

    if (!formData.interestedIn) {
      newErrors.interestedIn = 'Please select who you are interested in';
    }

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    
    if (Object.keys(newErrors).length === 0) {
      console.log('Form submitted:', formData);
      navigate('/login');
    } else {
      setErrors(newErrors);
    }
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
        <div className="w-full max-w-2xl">
          {/* Eye-catching Title Section */}
          <div className="text-center mb-10">
            <h1 className="text-white text-5xl md:text-6xl font-extrabold leading-[1.1] mb-4 drop-shadow-lg">
              Join the <span className="text-pink-200">community</span>
            </h1>
            <p className="text-white/90 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed drop-shadow">
              Create your free account and start your journey to find meaningful connections
            </p>
            <div className="w-24 h-1 bg-pink-200 mx-auto mt-6 rounded-full" />
          </div>

          {/* Form - Directly on background, no box, no glass */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div>
              <label className="block text-white font-medium mb-2 drop-shadow text-lg">
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-lg bg-white/10 border-2 ${
                  errors.fullName ? 'border-pink-200' : 'border-white/30'
                } text-white placeholder-white/50 focus:outline-none focus:border-pink-200 transition text-lg`}
                placeholder="Enter your full name"
              />
              {errors.fullName && (
                <p className="mt-1 text-sm text-pink-200 drop-shadow">{errors.fullName}</p>
              )}
            </div>

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
                className={`w-full px-4 py-3 rounded-lg bg-white/10 border-2 ${
                  errors.email ? 'border-pink-200' : 'border-white/30'
                } text-white placeholder-white/50 focus:outline-none focus:border-pink-200 transition text-lg`}
                placeholder="you@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-pink-200 drop-shadow">{errors.email}</p>
              )}
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
                className={`w-full px-4 py-3 rounded-lg bg-white/10 border-2 ${
                  errors.password ? 'border-pink-200' : 'border-white/30'
                } text-white placeholder-white/50 focus:outline-none focus:border-pink-200 transition text-lg`}
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-pink-200 drop-shadow">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-white font-medium mb-2 drop-shadow text-lg">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-lg bg-white/10 border-2 ${
                  errors.confirmPassword ? 'border-pink-200' : 'border-white/30'
                } text-white placeholder-white/50 focus:outline-none focus:border-pink-200 transition text-lg`}
                placeholder="••••••••"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-pink-200 drop-shadow">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-white font-medium mb-2 drop-shadow text-lg">
                Date of Birth
              </label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-lg bg-white/10 border-2 ${
                  errors.dateOfBirth ? 'border-pink-200' : 'border-white/30'
                } text-white [color-scheme:dark] focus:outline-none focus:border-pink-200 transition text-lg`}
              />
              {errors.dateOfBirth && (
                <p className="mt-1 text-sm text-pink-200 drop-shadow">{errors.dateOfBirth}</p>
              )}
            </div>

            {/* Gender */}
            <div>
              <label className="block text-white font-medium mb-2 drop-shadow text-lg">
                I am
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-lg bg-white/10 border-2 ${
                  errors.gender ? 'border-pink-200' : 'border-white/30'
                } text-white [color-scheme:dark] focus:outline-none focus:border-pink-200 transition text-lg`}
              >
                <option value="" className="bg-rose-900">Select gender</option>
                <option value="male" className="bg-rose-900">Male</option>
                <option value="female" className="bg-rose-900">Female</option>
              </select>
              {errors.gender && (
                <p className="mt-1 text-sm text-pink-200 drop-shadow">{errors.gender}</p>
              )}
            </div>

           

            {/* Submit Button - Same as CoverPage */}
            <button
              type="submit"
              className="w-full bg-white text-rose-600 text-lg font-bold py-4 px-4 rounded-lg hover:scale-105 transition-transform duration-200 active:scale-95 shadow-xl mt-8"
            >
              Create Account
            </button>

            {/* Login Link */}
            <p className="text-center text-white/90 text-base">
              Already have an account?{' '}
              <Link to="/login" className="text-pink-200 hover:text-white font-semibold transition">
                Sign in
              </Link>
            </p>
          </form>

          
        </div>
      </main>
    </div>
  );
};

export default Register;