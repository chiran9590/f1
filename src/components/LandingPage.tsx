import React from 'react';
import { motion } from 'framer-motion';
import { Plane, Trees, Map, BarChart3, Phone, Mail, Facebook, Twitter, Linkedin, Instagram, ChevronRight, CheckCircle, ArrowRight, Globe, Leaf, Camera, FileText, Users, Zap, Target, TrendingUp, User, LogIn, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white overflow-hidden">
      {/* Navigation */}
      <motion.nav 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-green-100"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <motion.div 
              className="flex items-center space-x-2"
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Health Maps</span>
            </motion.div>

            {/* Right Section */}
            <div className="flex items-center space-x-4">
              {/* Language Selector */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg border border-gray-200 hover:border-green-300 transition-colors"
              >
                <Globe className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-700">EN</span>
              </motion.button>

              {/* Auth Buttons */}
              <div className="flex items-center space-x-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/login')}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-green-600 font-medium transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Login</span>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/register')}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors shadow-sm"
                >
                  <User className="w-4 h-4" />
                  <span>Register</span>
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <HeroSection navigate={navigate} />
      
      {/* Intro Section */}
      <IntroSection />
      
      {/* What We Do */}
      <WhatWeDoSection />
      
      {/* How It Works */}
      <HowItWorksSection />
      
      {/* Why Choose Us */}
      <WhyChooseUsSection />
      
      {/* Main Visual Section */}
      <MainVisualSection navigate={navigate} />
      
      {/* Advanced Features */}
      <AdvancedFeaturesSection />
      
      {/* Services Section */}
      <ServicesSection />
      
      {/* Gallery Section */}
      <GallerySection />
      
      {/* CTA Section */}
      <CTASection navigate={navigate} />
      
      {/* Footer */}
      <FooterSection />
    </div>
  );
};

// Hero Section Component
const HeroSection: React.FC<{navigate: any}> = ({navigate}) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/80 via-emerald-800/60 to-teal-700/40 z-10" />
        <img 
          src="/h3.png"
          alt="Drone flying over golf course"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="relative z-20 text-center text-white px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto"
      >
        <motion.h1 
          className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          Optimize Your Course.
          <span className="block text-green-300">Perfect Your Greens.</span>
        </motion.h1>
        
        <motion.p 
          className="text-xl sm:text-2xl mb-10 text-green-100 max-w-3xl mx-auto leading-relaxed"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          Advanced AI-powered drone analysis for golf course superintendents. Monitor grass health, detect stress, and maintain championship-quality conditions.
        </motion.p>
        
        <motion.div 
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(0,0,0,0.3)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/contact')}
            className="px-8 py-4 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-full transition-all duration-300 shadow-xl"
          >
            Contact
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(0,0,0,0.3)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/register')}
            className="px-8 py-4 bg-white/20 backdrop-blur-md hover:bg-white/30 text-white font-semibold rounded-full transition-all duration-300 border border-white/30"
          >
            Get Started
          </motion.button>
        </motion.div>
      </motion.div>

      {/* Floating Elements */}
      <motion.div
        animate={{ y: [-10, 10, -10] }}
        transition={{ duration: 4, repeat: Infinity }}
        className="absolute top-20 left-10 z-10"
      >
        <Plane className="w-8 h-8 text-white/60" />
      </motion.div>
      
      <motion.div
        animate={{ y: [10, -10, 10] }}
        transition={{ duration: 3, repeat: Infinity }}
        className="absolute bottom-20 right-10 z-10"
      >
        <Trees className="w-8 h-8 text-white/60" />
      </motion.div>
    </section>
  );
};

// Intro Section Component
const IntroSection: React.FC = () => {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <motion.p 
            className="text-2xl sm:text-3xl text-gray-700 leading-relaxed max-w-4xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Whether you're managing fairways, greens, or rough areas, our platform brings championship-level clarity to your turf management.
          </motion.p>
          
          <motion.div 
            className="mt-12 flex justify-center items-center space-x-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <Plane className="w-16 h-16 text-green-500" />
            </motion.div>
            <div className="w-24 h-0.5 bg-gradient-to-r from-green-200 to-green-400" />
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Trees className="w-16 h-16 text-green-600" />
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

// What We Do Section Component
const WhatWeDoSection: React.FC = () => {
  const services = [
    {
      icon: <Camera className="w-8 h-8" />,
      title: "Drone Scanning",
      description: "High-resolution aerial imaging of your golf course for detailed turf analysis.",
      color: "from-blue-500 to-cyan-600"
    },
    {
      icon: <Map className="w-8 h-8" />,
      title: "Health Mapping",
      description: "AI-powered detection of grass stress, disease, and moisture levels across all course areas.",
      color: "from-green-500 to-emerald-600"
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Turf Reports",
      description: "Detailed greens, fairways, and rough health reports with actionable insights.",
      color: "from-purple-500 to-pink-600"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Expert Consultation",
      description: "Golf course management recommendations based on data-driven analysis.",
      color: "from-orange-500 to-red-600"
    }
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">What We Do</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive golf course turf health analysis powered by AI and drone technology
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="group"
            >
              <div className="h-full p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100">
                <motion.div 
                  className={`w-16 h-16 bg-gradient-to-br ${service.color} rounded-xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-300`}
                >
                  {service.icon}
                </motion.div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{service.title}</h3>
                <p className="text-gray-600 leading-relaxed">{service.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// How It Works Section Component
const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      number: "1",
      title: "Schedule Course Scan",
      description: "Book your comprehensive golf course drone analysis",
      icon: <Calendar className="w-6 h-6" />
    },
    {
      number: "2", 
      title: "Analyze Turf Health",
      description: "Our AI analyzes greens, fairways, and rough conditions",
      icon: <Camera className="w-6 h-6" />
    },
    {
      number: "3",
      title: "Receive Action Plan",
      description: "Get detailed reports and turf management recommendations",
      icon: <FileText className="w-6 h-6" />
    }
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">How It Works</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Simple three-step process to optimize your golf course turf management
          </p>
        </motion.div>

        <div className="relative">
          {/* Connecting Line */}
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-green-200 via-green-400 to-green-200 transform -translate-y-1/2 hidden lg:block" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="relative"
              >
                {/* Step Card */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-8 rounded-2xl border border-green-100 hover:shadow-xl transition-all duration-300 group">
                  {/* Number Badge */}
                  <motion.div 
                    className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-lg mb-6 mx-auto group-hover:scale-110 transition-transform duration-300"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    {step.number}
                  </motion.div>
                  
                  {/* Icon */}
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-green-600 mb-4 mx-auto">
                    {step.icon}
                  </div>
                  
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 text-center">{step.title}</h3>
                  <p className="text-gray-600 text-center leading-relaxed">{step.description}</p>
                </div>

                {/* Arrow for mobile */}
                {index < steps.length - 1 && (
                  <div className="flex justify-center mt-4 lg:hidden">
                    <ChevronRight className="w-6 h-6 text-green-400" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

// Why Choose Us Section Component
const WhyChooseUsSection: React.FC = () => {
  const benefits = [
    "Data-driven golf course management",
    "Early detection of turf stress and disease", 
    "Optimized irrigation and water conservation",
    "Championship-quality greens maintenance",
    "Reduced chemical usage and costs",
    "Sustainable golf course operations"
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-green-50 to-white">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">Why Choose Us</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Leading golf course turf management with AI-powered insights and aerial analytics
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ x: 10 }}
              className="flex items-center space-x-3 p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300"
            >
              <motion.div
                whileHover={{ scale: 1.2, rotate: 360 }}
                transition={{ duration: 0.4 }}
              >
                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
              </motion.div>
              <span className="text-gray-700 font-medium">{benefit}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Main Visual Section Component
const MainVisualSection: React.FC<{navigate: any}> = ({navigate}) => {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="order-2 lg:order-1"
          >
            <motion.h2 
              className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              Championship-Level
              <span className="block text-green-600">Turf Management</span>
            </motion.h2>
            
            <motion.p 
              className="text-lg text-gray-600 leading-relaxed mb-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
            >
              Our advanced AI algorithms analyze multispectral drone imagery to detect turf stress, 
              disease patterns, and moisture levels that are invisible to the human eye. 
              By combining cutting-edge technology with golf course management expertise, we provide 
              actionable insights that help you optimize irrigation, reduce chemical usage, and 
              maintain pristine playing conditions throughout the season.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              viewport={{ once: true }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/about')}
                className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-full transition-colors duration-300 shadow-lg"
              >
                Learn More
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/register')}
                className="px-6 py-3 border-2 border-green-500 text-green-600 hover:bg-green-50 font-semibold rounded-full transition-all duration-300"
              >
                View Demo
              </motion.button>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="order-1 lg:order-2"
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.4 }}
              className="relative rounded-2xl overflow-hidden shadow-2xl"
            >
              <img 
                src="/h1.png"
                alt="Aerial golf course view"
                className="w-full h-auto"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// Advanced Features Section Component
const AdvancedFeaturesSection: React.FC = () => {
  const leftFeatures = [
    {
      icon: <Camera className="w-6 h-6" />,
      title: "Multispectral Drone Imaging",
      description: "Advanced imaging technology for comprehensive turf health analysis"
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Turf Health Indices (NDVI)",
      description: "Scientific metrics for grass health and stress assessment"
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "Data-driven Course Management",
      description: "Analytics-powered insights for superior playing conditions"
    }
  ];

  const rightFeatures = [
    {
      icon: <Map className="w-6 h-6" />,
      title: "Course Area Mapping",
      description: "Detailed analysis of greens, fairways, and rough areas"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Irrigation Optimization",
      description: "Precise water usage recommendations for each course section"
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Turf Performance Tracking",
      description: "Comprehensive health monitoring over time"
    }
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">Advanced Features</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Cutting-edge technology for comprehensive golf course turf analysis
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column */}
          <div className="space-y-6">
            {leftFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ x: 10 }}
                className="flex items-start space-x-4 p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.3 }}
                  className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center text-white flex-shrink-0"
                >
                  {feature.icon}
                </motion.div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {rightFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ x: -10 }}
                className="flex items-start space-x-4 p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: -5 }}
                  transition={{ duration: 0.3 }}
                  className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center text-white flex-shrink-0"
                >
                  {feature.icon}
                </motion.div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

// Services Section Component
const ServicesSection: React.FC = () => {
  const services = [
    {
      image: "/h2.png",
      title: "Greens Health Analysis",
      description: "Detailed monitoring of putting surface conditions and health"
    },
    {
      image: "/h5.png",
      title: "Fairway Performance Tracking",
      description: "Comprehensive analysis of fairway turf quality and stress levels"
    },
    {
      image: "/h6.png",
      title: "Course Area Mapping",
      description: "Complete aerial mapping of all golf course sections"
    },
    {
      image: "/h1.png",
      title: "Turf Stress Detection",
      description: "Early identification of disease, drought, and nutrient issues"
    },
    {
      image: "/h3.png",
      title: "Treatment Impact Analysis",
      description: "Monitor effectiveness of fertilizers and treatments"
    },
    {
      image: "/h7.png",
      title: "Seasonal Health Reports",
      description: "Track turf performance trends throughout the year"
    }
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">Our Services</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Specialized golf course turf management solutions for championship conditions
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
              className="group"
            >
              <div className="h-full bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100">
                <motion.div 
                  className="relative h-48 overflow-hidden"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.4 }}
                >
                  <img 
                    src={service.image}
                    alt={service.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </motion.div>
                
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{service.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{service.description}</p>
                  
                  <motion.button
                    whileHover={{ x: 5 }}
                    whileTap={{ scale: 0.95 }}
                    className="mt-4 flex items-center text-green-600 hover:text-green-700 font-medium transition-colors duration-300"
                  >
                    Learn More
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Gallery Section Component
const GallerySection: React.FC = () => {
  const images = [
    "/h3.png",
    "/h1.png",
    "/h2.png",
    "/h5.png",
    "/h6.png",
    "/h9.png"
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">Gallery</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            See our golf course analysis technology in action
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((image, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05, z: 10 }}
              className="relative overflow-hidden rounded-2xl shadow-lg group"
            >
              <img 
                src={image}
                alt={`Gallery image ${index + 1}`}
                className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <motion.div 
                className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
              >
                <div className="absolute bottom-4 left-4 text-white">
                  <p className="text-sm font-medium">Aerial Analysis</p>
                  <p className="text-xs opacity-80">High-resolution imagery</p>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// CTA Section Component
const CTASection: React.FC<{navigate: any}> = ({navigate}) => {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-600 to-emerald-700">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <motion.h2 
            className="text-4xl sm:text-5xl font-bold text-white mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Ready to optimize your golf course?
          </motion.h2>
          
          <motion.p 
            className="text-xl text-green-100 mb-8 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            Transform your turf management with AI-powered insights and aerial analytics for championship-quality conditions.
          </motion.p>
          
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(0,0,0,0.3)" }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            viewport={{ once: true }}
            onClick={() => navigate('/contact')}
            className="px-8 py-4 bg-white text-green-600 font-semibold rounded-full hover:bg-green-50 transition-all duration-300 shadow-xl"
          >
            Contact Now
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

// Footer Section Component
const FooterSection: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Tagline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="col-span-1 md:col-span-2"
          >
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold">Health Maps</span>
            </div>
            <p className="text-gray-400 mb-4">Golf Course Intelligence</p>
            <div className="flex space-x-4">
              <motion.a
                href="#"
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.9 }}
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors duration-300"
              >
                <Facebook className="w-5 h-5" />
              </motion.a>
              <motion.a
                href="#"
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.9 }}
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors duration-300"
              >
                <Twitter className="w-5 h-5" />
              </motion.a>
              <motion.a
                href="#"
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.9 }}
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors duration-300"
              >
                <Linkedin className="w-5 h-5" />
              </motion.a>
              <motion.a
                href="#"
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.9 }}
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors duration-300"
              >
                <Instagram className="w-5 h-5" />
              </motion.a>
            </div>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <div className="space-y-3">
              <motion.a
                href="mailto:info@phytomaps.com"
                whileHover={{ x: 5 }}
                className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors duration-300"
              >
                <Mail className="w-4 h-4" />
                <span>info@phytomaps.com</span>
              </motion.a>
              <motion.a
                href="tel:+1234567890"
                whileHover={{ x: 5 }}
                className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors duration-300"
              >
                <Phone className="w-4 h-4" />
                <span>+1 (234) 567-890</span>
              </motion.a>
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <div className="space-y-2">
              <motion.a
                href="#"
                whileHover={{ x: 5 }}
                className="block text-gray-400 hover:text-white transition-colors duration-300"
              >
                Privacy Policy
              </motion.a>
              <motion.a
                href="#"
                whileHover={{ x: 5 }}
                className="block text-gray-400 hover:text-white transition-colors duration-300"
              >
                Terms of Service
              </motion.a>
              <motion.a
                href="#"
                whileHover={{ x: 5 }}
                className="block text-gray-400 hover:text-white transition-colors duration-300"
              >
                Support
              </motion.a>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
          className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400"
        >
          <p>&copy; 2024 Health Maps. All rights reserved.</p>
        </motion.div>
      </div>
    </footer>
  );
};

export default LandingPage;
