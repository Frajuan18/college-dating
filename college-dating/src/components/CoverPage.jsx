import React from 'react';

const CoverPage = () => {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-rose-50">
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ 
          backgroundImage: `url('https://images.unsplash.com/photo-1516589174184-c685266d4af4?q=80&w=2000&auto=format&fit=crop')` 
        }}
      >
        {/* Dynamic Gradient: Stronger on the left for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-rose-600/90 via-rose-500/40 to-transparent" />
      </div>

      {/* Navigation Bar */}
      <nav className="relative z-10 flex justify-between items-center px-8 py-6 md:px-16">
        <div className="text-white text-2xl font-bold tracking-tighter">
          MATCH<span className="text-pink-200">MAKER</span>
        </div>
        
        
      </nav>

      {/* Main Hero Content */}
      <main className="relative z-10 flex flex-col justify-center h-[calc(100vh-80px)] px-8 md:px-16 max-w-7xl mx-auto">
        <div className="max-w-2xl">
          <h1 className="text-white text-5xl md:text-7xl font-extrabold leading-[1.1] mb-6 drop-shadow-md">
            Find your <br />
            <span className="text-pink-200">Perfect match</span> <br />
            Today.
          </h1>
          
          <p className="text-white/90 text-lg md:text-xl mb-10 max-w-lg leading-relaxed">
            Join thousands of people finding meaningful connections every day. 
            Your journey to a perfect partner starts with a single click.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <button className="bg-white text-rose-600 text-lg font-bold px-10 py-4 rounded-full shadow-xl hover:scale-105 transition-transform duration-200">
              Get Started Free
            </button>
            <button className="bg-white/10 backdrop-blur-md border border-white/30 text-white text-lg font-semibold px-10 py-4 rounded-full hover:bg-white/20 transition">
              Login
            </button>
          </div>
        </div>
      </main>

      
    </div>
  );
};

export default CoverPage;