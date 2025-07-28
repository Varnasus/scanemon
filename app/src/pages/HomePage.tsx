import React from 'react';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 to-cyan-900 text-white font-sans">
      {/* Navigation Bar */}
      <nav className="flex items-center justify-between px-8 py-4 backdrop-blur-sm bg-black/30">
        {/* Logo */}
        <div className="flex items-center space-x-2 font-bold text-xl">
          <span role="img" aria-label="pokeball">🪙</span>
          <span>Scanémon</span>
        </div>
        
        {/* Navigation Elements */}
        <div className="flex items-center space-x-6">
          {/* Upload Button */}
          <button className="bg-pink-500 hover:bg-pink-600 text-white font-semibold px-4 py-2 rounded-md transition-all duration-150 hover:scale-105">
            ⬆ Upload
          </button>
          
          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <a href="#" className="hover:underline transition-all duration-150">Collection</a>
            <a href="#" className="hover:underline transition-all duration-150">Achievements</a>
            <a href="#" className="hover:underline transition-all duration-150">Events</a>
          </div>
          
          {/* Right Side Icons */}
          <div className="flex items-center space-x-2">
            <span className="text-sm bg-white/10 px-3 py-1 rounded-full">Lv 3</span>
            <button className="text-lg hover:scale-105 transition-all duration-150">⚙️</button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="text-center mt-24 px-6">
        <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
          Your Collection,<br />Leveled Up.
        </h1>
        <p className="mt-4 text-gray-300 text-lg">
          Scan, organize, and flex your Pokémon cards with AI.
        </p>
        <Link to="/scan">
          <button className="mt-8 bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold px-6 py-3 rounded-xl flex items-center justify-center mx-auto gap-2 transition-all duration-150 hover:scale-105">
            <span role="img" aria-label="pokeball">⚪</span> Start Scanning
          </button>
        </Link>
      </header>

      {/* Feature Strip - Unified Card */}
      <section className="mt-20 px-6">
        <div className="max-w-5xl mx-auto bg-white/10 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-center text-white shadow-lg space-y-6 md:space-y-0 md:space-x-6">
          {/* AI-Powered Scanning */}
          <div className="flex items-center gap-4">
            <div className="text-2xl">📷</div>
            <div>
              <h3 className="font-bold">AI-Powered Scanning</h3>
              <p className="text-sm text-gray-300">Instantly ID cards</p>
            </div>
          </div>
          
          {/* Smart Collection */}
          <div className="flex items-center gap-4">
            <div className="text-2xl">📊</div>
            <div>
              <h3 className="font-bold">Smart Collection</h3>
              <p className="text-sm text-gray-300">Track progress</p>
            </div>
          </div>
          
          {/* XP System */}
          <div className="flex items-center gap-4">
            <div className="text-2xl">🏆</div>
            <div>
              <h3 className="font-bold">XP System</h3>
              <p className="text-sm text-gray-300">Unlock rewards</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage; 