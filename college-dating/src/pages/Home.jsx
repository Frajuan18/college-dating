// pages/Home.jsx or components/Home.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl md:text-7xl font-bold text-white mb-4 animate-pulse">
          Welcome! 🎉
        </h1>
        <p className="text-white/90 text-xl mb-8">
          You're all set to get started
        </p>
        <Link
          to="/dashboard"
          className="inline-block bg-white text-rose-600 px-8 py-3 rounded-lg font-semibold hover:bg-rose-50 transition"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default Home;