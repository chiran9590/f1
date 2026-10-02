import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Instagram, 
  Linkedin, 
  ChevronDown,
  MessageCircle
} from 'lucide-react';
import Logo from '../components/Logo';

const MainDashboard: React.FC = () => {
  const [languageDropdown, setLanguageDropdown] = useState(false);

  const services = [
    {
      title: "Informed Decision Making",
      description: "Empower course managers with data-driven insights for better agronomic practices and disease detection."
    },
    {
      title: "Multispectral Drone Services", 
      description: "Assess plant health and detect diseases with advanced drone technology for golf courses."
    },
    {
      title: "Vegetation Indices Analysis",
      description: "Measure NDVI and other indices to enhance grass health and maintenance strategies effectively."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Bar */}
      <nav className="bg-white border-b border-gray-200 relative z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <Logo size="lg" />
              <div className="border-l border-gray-300 h-8 mx-3"></div>
              <span className="text-sm font-medium text-gray-600">FARMING WITH FORESIGHT</span>
            </div>
            
            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <Link 
                to="/" 
                className="text-gray-900 font-medium border-b-2 border-green-600 pb-1 transition-colors"
              >
                Home (EN)
              </Link>
              <Link 
                to="/services" 
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                Services (EN)
              </Link>
              <Link 
                to="/about" 
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                About (EN)
              </Link>
              <Link 
                to="/contact" 
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                Contact (EN)
              </Link>
            </div>

            {/* Right Side Icons */}
            <div className="flex items-center space-x-4">
              {/* Language Selector */}
              <div className="relative">
                <button
                  onClick={() => setLanguageDropdown(!languageDropdown)}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <div className="w-6 h-4 bg-blue-600 rounded-sm flex items-center justify-center">
                    <div className="text-white text-xs font-bold">US</div>
                  </div>
                  <ChevronDown className="w-4 h-4" />
                </button>
                
                {languageDropdown && (
                  <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-lg shadow-lg py-2">
                    <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      English
                    </button>
                    <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Spanish
                    </button>
                    <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      French
                    </button>
                  </div>
                )}
              </div>
              
              {/* Social Media Icons */}
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-teal-50 via-green-50 to-emerald-100 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
              Advanced Plant Health
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Optimizing golf course care with drone-based plant health insights
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Plant Health Map Image */}
            <div className="relative">
              <div className="rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src="/plant-health-map.jpg" 
                  alt="Plant Health Map showing NDVI analysis of golf course with green, yellow, and red zones indicating vegetation health levels"
                  className="w-full h-auto object-cover"
                />
                {/* Overlay elements to simulate the map markers */}
                <div className="absolute top-1/4 left-1/4 w-8 h-8 border-2 border-white rounded-full bg-red-500 opacity-80"></div>
                <div className="absolute top-1/3 right-1/3 w-8 h-8 border-2 border-white rounded-full bg-yellow-500 opacity-80"></div>
                <div className="absolute bottom-1/4 left-1/3 w-8 h-8 border-2 border-white rounded-full bg-green-500 opacity-80"></div>
                <div className="absolute top-1/2 left-1/2 border-2 border-white rounded-lg" style={{width: '120px', height: '80px'}}></div>
              </div>
            </div>

            {/* Right Side - Service Sections */}
            <div className="space-y-8">
              {services.map((service, index) => (
                <div key={index} className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {service.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* WhatsApp Floating Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <a
          href="https://wa.me/1234567890"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-lg transition-all duration-300 transform hover:scale-110"
        >
          <MessageCircle className="w-6 h-6" />
        </a>
      </div>
    </div>
  );
};

export default MainDashboard;
