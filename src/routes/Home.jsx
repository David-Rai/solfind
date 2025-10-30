import React, { useState, useEffect } from 'react'
import { Search, Users, MapPin, Award, Sparkles } from "lucide-react";
import { useNavigate } from 'react-router-dom';

function App() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
const navigate=useNavigate()
  useEffect(() => {
    setIsVisible(true);
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-white overflow-hidden relative">
      {/* Animated Background Grid */}
      <div className="fixed inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
          animation: 'gridMove 20s linear infinite'
        }}></div>
      </div>

      {/* Gradient Orb Following Mouse */}
      <div 
        className="fixed w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none transition-all duration-1000 ease-out"
        style={{
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.4), rgba(99, 102, 241, 0.2), transparent)',
          left: mousePosition.x - 192,
          top: mousePosition.y - 192,
        }}
      ></div>

      {/* Hero Section */}
      <header className="relative z-10 border-b border-blue-500/20">
        <div className="container mx-auto px-6 py-32">
          <div className={`text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            {/* Glowing Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-400/30 mb-8 backdrop-blur-sm hover:bg-blue-500/20 transition-all duration-300 group">
              <Sparkles className="w-4 h-4 text-blue-400 group-hover:rotate-12 transition-transform" />
              <span className="text-sm text-blue-300">Powered by Blockchain</span>
            </div>

            <h1 className="text-7xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500 bg-clip-text text-transparent animate-pulse-slow">
              SolFind
            </h1>
            <p className="text-xl mb-12 text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Find missing items or people and get rewarded! Connect with the community through decentralized trust.
            </p>
            
            <div className="flex gap-4 justify-center flex-wrap">
              <button className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg font-semibold overflow-hidden hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105">
                <span className="relative z-10" onClick={()=> navigate("/connectWallet")}>Create Account</span>
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </button>
              
              <button className="group px-8 py-4 bg-slate-800/50 backdrop-blur-sm border border-blue-500/30 rounded-lg font-semibold hover:bg-slate-800 hover:border-blue-400/50 transition-all duration-300 hover:scale-105">
                <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent" onClick={()=> navigate("/explore")}>Explore</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-24 relative z-10">
        <div className="grid md:grid-cols-4 gap-6">
          {[
            { icon: Search, title: "Search Missing Items", desc: "Quickly search lost items and help the community locate them.", delay: "0ms" },
            { icon: Users, title: "Connect People", desc: "Find missing persons or get alerts when someone reports them.", delay: "100ms" },
            { icon: MapPin, title: "Locate Easily", desc: "Track lost items or people with map updates and notifications.", delay: "200ms" },
            { icon: Award, title: "Earn Rewards", desc: "Get rewarded for submitting reports or finding lost items.", delay: "300ms" }
          ].map((feature, idx) => (
            <div 
              key={idx}
              className="group p-8 bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl hover:border-blue-500/50 transition-all duration-500 hover:shadow-lg hover:shadow-blue-500/10 hover:-translate-y-2"
              style={{ animationDelay: feature.delay }}
            >
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full group-hover:bg-blue-400/30 transition-all duration-500"></div>
                <feature.icon className="relative mx-auto text-blue-400 group-hover:text-cyan-300 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6" size={48} />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white group-hover:text-blue-300 transition-colors">{feature.title}</h3>
              <p className="text-slate-400 leading-relaxed">{feature.desc}</p>
              
              {/* Animated corner accent */}
              <div className="absolute top-0 right-0 w-16 h-16 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute top-4 right-4 w-8 h-0.5 bg-gradient-to-r from-blue-500 to-transparent"></div>
                <div className="absolute top-4 right-4 w-0.5 h-8 bg-gradient-to-b from-blue-500 to-transparent"></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-24 my-12">
        <div className="container mx-auto px-6">
          <div className="relative p-12 rounded-3xl bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-blue-500/30 backdrop-blur-sm overflow-hidden">
            {/* Animated background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(59, 130, 246, 0.3) 1px, transparent 0)',
                backgroundSize: '40px 40px',
                animation: 'patternMove 15s linear infinite'
              }}></div>
            </div>
            
            <div className="relative z-10 text-center">
              <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                Found Something?
              </h2>
              <p className="text-xl mb-10 text-slate-300 max-w-2xl mx-auto">
                Report it now and earn rewards for helping our community!
              </p>
              <button className="group relative px-10 py-5 bg-white text-slate-900 rounded-lg font-bold overflow-hidden hover:shadow-xl hover:shadow-white/20 transition-all duration-300 hover:scale-105">
                <span className="relative z-10 flex items-center gap-2 justify-center">
                  Report & Earn
                  <Award className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-cyan-100 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800 bg-slate-950/50 backdrop-blur-sm py-8 mt-auto">
        <div className="container mx-auto px-6 text-center text-slate-400">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
            <span className="text-sm">Decentralized & Secure</span>
          </div>
          <p>&copy; {new Date().getFullYear()} SolFind. Helping you find what matters — and rewarding you for it.</p>
        </div>
      </footer>

      <style>{`
        @keyframes gridMove {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }
        
        @keyframes patternMove {
          0% { transform: translate(0, 0); }
          100% { transform: translate(40px, 40px); }
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

export default App;