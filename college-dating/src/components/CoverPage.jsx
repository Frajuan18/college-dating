// CoverPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const CoverPage = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-rose-50">
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ 
          backgroundImage: `url('https://images.unsplash.com/photo-1516589174184-c685266d4af4?q=80&w=2000&auto=format&fit=crop')` 
        }}
      >
        {/* Consistent gradient for all screens - dark overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-rose-900/95 via-rose-800/90 to-rose-900/95" />
        
        {/* Slight dark overlay for extra text contrast */}
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Navigation Bar */}
      <nav className="relative z-10 flex justify-between items-center px-6 py-6 md:px-8 lg:px-16">
        <div className="text-white text-2xl font-bold tracking-tighter drop-shadow-lg">
          MATCH<span className="text-pink-200">MAKER</span>
        </div>
      </nav>

      {/* Main Hero Content - Centered */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-6 md:px-8 lg:px-16">
        <div className="max-w-3xl text-center">
          {/* Centered Title */}
          <h1 className="text-white text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.1] mb-4 md:mb-6 drop-shadow-lg">
            Find your <span className="text-pink-200">Perfect match</span> Today.
          </h1>
          
          {/* Centered Description */}
          <p className="text-white/95 text-base sm:text-lg md:text-xl mb-8 md:mb-10 max-w-2xl mx-auto leading-relaxed drop-shadow">
            Join thousands of people finding meaningful connections every day. 
            Your journey to a perfect partner starts with a single click.
          </p>

          {/* Centered Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
            <button 
              onClick={() => navigate('/register')}
              className="bg-white text-rose-600 text-base sm:text-lg font-bold px-8 sm:px-10 py-3.5 sm:py-4 rounded-full shadow-xl hover:scale-105 transition-transform duration-200 active:scale-95 w-full sm:w-auto min-w-[200px]"
            >
              Get Started Free
            </button>
            <button 
              onClick={() => navigate('/login')}
              className="bg-white/20 backdrop-blur-md border-2 border-white/40 text-white text-base sm:text-lg font-semibold px-8 sm:px-10 py-3.5 sm:py-4 rounded-full hover:bg-white/30 transition active:bg-white/40 w-full sm:w-auto min-w-[200px]"
            >
              Login
            </button>
          </div>

         
        </div>
      </main>

      
    </div>
  );
};

export default CoverPage;