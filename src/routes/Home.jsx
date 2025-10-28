import React from 'react'
import { useNavigate } from 'react-router-dom';
import { Search, Users, MapPin, Award } from "lucide-react";

function App() {
    const navigate=useNavigate()
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Hero Section */}
      <header className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="container mx-auto px-6 py-24 text-center">
          <h1 className="text-5xl font-bold mb-4">SolFind</h1>
          <p className="text-xl mb-8">
            Find missing items or people and get rewarded! SolFind connects the community to make finding easier.
          </p>
          <button 
          onClick={()=> navigate("/connectWallet")}
          className="bg-white text-blue-600 font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition">
            Get Started
          </button>
        </div>
      </header>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-20 grid md:grid-cols-4 gap-12 text-center">
        <div className="p-6 bg-white rounded-xl shadow hover:shadow-lg transition">
          <Search className="mx-auto mb-4 text-blue-600" size={48} />
          <h3 className="text-2xl font-semibold mb-2">Search Missing Items</h3>
          <p>Quickly search lost items and help the community locate them.</p>
        </div>

        <div className="p-6 bg-white rounded-xl shadow hover:shadow-lg transition">
          <Users className="mx-auto mb-4 text-blue-600" size={48} />
          <h3 className="text-2xl font-semibold mb-2">Connect People</h3>
          <p>Find missing persons or get alerts when someone reports them.</p>
        </div>

        <div className="p-6 bg-white rounded-xl shadow hover:shadow-lg transition">
          <MapPin className="mx-auto mb-4 text-blue-600" size={48} />
          <h3 className="text-2xl font-semibold mb-2">Locate Easily</h3>
          <p>Track lost items or people with map updates and notifications.</p>
        </div>

        <div className="p-6 bg-white rounded-xl shadow hover:shadow-lg transition">
          <Award className="mx-auto mb-4 text-blue-600" size={48} />
          <h3 className="text-2xl font-semibold mb-2">Earn Rewards</h3>
          <p>Get rewarded for submitting reports or finding lost items and persons.</p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white text-center py-20">
        <h2 className="text-4xl font-bold mb-4">Found Something?</h2>
        <p className="mb-8">Report it now and earn rewards for helping our community!</p>
        <button className="bg-white text-blue-600 font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition">
          Report & Earn
        </button>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 text-gray-700 text-center py-6">
        &copy; {new Date().getFullYear()} SolFind. Helping you find what matters — and rewarding you for it.
      </footer>
    </div>
  );
}

export default App;
