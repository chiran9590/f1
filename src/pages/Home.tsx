import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  BarChart3, 
  Shield, 
  Users, 
  TrendingUp,
  Heart,
  Activity,
  Stethoscope,
  Play,
  Star,
  ChevronRight,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';
import Logo from '../components/Logo';

const Home: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setEmail('');
      setIsSubmitting(false);
      alert('Thank you for subscribing! We\'ll keep you updated.');
    }, 1000);
  };

  const features = [
    {
      icon: BarChart3,
      title: "Real-time AI Analysis",
      description: "Instant deep learning processing of satellite and drone imagery for immediate turf health insights",
      color: "from-blue-500 to-cyan-600"
    },
    {
      icon: Shield,
      title: "High-Resolution Mapping",
      description: "Pixel-level vegetation classification with 95%+ accuracy using advanced semantic segmentation",
      color: "from-green-500 to-emerald-600"
    },
    {
      icon: Users,
      title: "Geospatial Dashboard",
      description: "Interactive Mapbox-powered visualization with real-time course condition monitoring",
      color: "from-purple-500 to-pink-600"
    },
    {
      icon: TrendingUp,
      title: "Vegetation Health Tracking",
      description: "Continuous monitoring of healthy/unhealthy grass, water bodies, and tree coverage",
      color: "from-orange-500 to-red-600"
    },
    {
      icon: Heart,
      title: "Data-Driven Decisions",
      description: "AI-powered recommendations for optimal turf management and resource allocation",
      color: "from-red-500 to-pink-600"
    },
    {
      icon: Activity,
      title: "Deep Learning Insights",
      description: "U-Net architecture analysis for precise land classification and health assessment",
      color: "from-teal-500 to-cyan-600"
    }
  ];

  const testimonials = [
    {
      name: "Robert Thompson",
      role: "Course Superintendent",
      company: "Royal Bangalore Golf Club",
      content: "The AI-powered vegetation analysis has revolutionized our turf management. We can now identify problem areas before they become visible to the naked eye.",
      rating: 5,
      avatar: "RT"
    },
    {
      name: "Michael Chen",
      role: "Golf Course Manager",
      company: "Karnataka Golf Association",
      content: "The real-time satellite imagery analysis and semantic segmentation accuracy is remarkable. Our maintenance efficiency has improved by 40%.",
      rating: 5,
      avatar: "MC"
    },
    {
      name: "Sarah Williams",
      role: "Turf Specialist",
      company: "Palm Meadows Golf Course",
      content: "The U-Net deep learning models provide incredibly detailed vegetation health maps. It's like having an expert agronomist on staff 24/7.",
      rating: 5,
      avatar: "SW"
    }
  ];

  const stats = [
    { number: "500+", label: "Golf Courses Analyzed" },
    { number: "10M+", label: "Acres Mapped" },
    { number: "95%", label: "AI Accuracy" },
    { number: "24/7", label: "Real-time Analysis" }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Logo size="md" />
            
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/" className="text-gray-900 hover:text-green-600 font-medium transition-colors">Home</Link>
              <Link to="/about" className="text-gray-600 hover:text-green-600 font-medium transition-colors">About</Link>
              <Link to="/services" className="text-gray-600 hover:text-green-600 font-medium transition-colors">Services</Link>
              <Link to="/contact" className="text-gray-600 hover:text-green-600 font-medium transition-colors">Contact</Link>
              <Link to="/login" className="text-gray-600 hover:text-green-600 font-medium transition-colors">Login</Link>
              <Link 
                to="/register" 
                className="bg-gradient-to-r from-green-600 to-teal-600 text-white px-4 py-2 rounded-lg hover:from-green-700 hover:to-teal-700 transition-all transform hover:scale-105"
              >
                Get Started
              </Link>
            </div>

            <button className="md:hidden p-2 rounded-lg hover:bg-gray-100">
              <div className="w-6 h-6 flex flex-col justify-center space-y-1">
                <div className="w-full h-0.5 bg-gray-600"></div>
                <div className="w-full h-0.5 bg-gray-600"></div>
                <div className="w-full h-0.5 bg-gray-600"></div>
              </div>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-50 via-white to-teal-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center space-x-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  <TrendingUp className="w-4 h-4" />
                  <span>AI-Powered Turf Intelligence</span>
                </div>
                
                <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  AI-Powered Golf Course
                  <span className="bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent"> Health Monitoring</span>
                </h1>
                
                <p className="text-xl text-gray-600 leading-relaxed">
                  We provide intelligent analysis of golf course landscapes using deep learning and satellite imagery. Our system identifies vegetation health, water bodies, and terrain features, helping golf course managers make data-driven decisions.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  to="/register" 
                  className="inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-green-600 to-teal-600 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-teal-700 transition-all transform hover:scale-105 shadow-lg"
                >
                  <span>Start Free Trial</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
                
                <button className="inline-flex items-center justify-center space-x-2 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <Play className="w-5 h-5" />
                  <span>Watch Demo</span>
                </button>
              </div>

              <div className="flex items-center space-x-8">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div 
                      key={i}
                      className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-teal-600 border-2 border-white flex items-center justify-center text-white text-xs font-bold"
                    >
                      {String.fromCharCode(65 + i)}
                    </div>
                  ))}
                </div>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <span className="text-sm text-gray-600">4.9/5 from 2,000+ reviews</span>
              </div>
            </div>

            <div className="relative">
              <div className="relative bg-gradient-to-br from-green-100 to-teal-100 rounded-2xl p-8 shadow-2xl">
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">AI Analysis Dashboard</h3>
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Heart className="w-5 h-5 text-green-600" />
                        <span className="text-sm font-medium">Healthy Grass</span>
                      </div>
                      <span className="text-sm font-bold text-green-600">72%</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Activity className="w-5 h-5 text-yellow-600" />
                        <span className="text-sm font-medium">Unhealthy Grass</span>
                      </div>
                      <span className="text-sm font-bold text-yellow-600">18%</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Stethoscope className="w-5 h-5 text-blue-600" />
                        <span className="text-sm font-medium">Water Bodies</span>
                      </div>
                      <span className="text-sm font-bold text-blue-600">8%</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Stethoscope className="w-5 h-5 text-purple-600" />
                        <span className="text-sm font-medium">Trees</span>
                      </div>
                      <span className="text-sm font-bold text-purple-600">2%</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">Last Updated</span>
                      <span className="text-xs font-medium">2 mins ago</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need for AI-Powered Course Management
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Cutting-edge deep learning features designed to revolutionize turf management and optimize course conditions
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Trusted by Golf Course Innovators
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See how golf course professionals are leveraging AI technology with HealthMaps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                
                <p className="text-gray-700 mb-6 italic">"{testimonial.content}"</p>
                
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-teal-600 flex items-center justify-center text-white font-bold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                    <div className="text-sm text-gray-500">{testimonial.company}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-teal-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Transform Your Course with AI?
          </h2>
          <p className="text-xl text-green-100 mb-8">
            Join hundreds of golf course managers using HealthMaps AI to achieve superior course conditions
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link 
              to="/register" 
              className="inline-flex items-center justify-center space-x-2 bg-white text-green-600 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors shadow-lg"
            >
              <span>Start Free Trial</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            
            <Link 
              to="/contact" 
              className="inline-flex items-center justify-center space-x-2 border border-white text-white px-6 py-3 rounded-lg hover:bg-white/10 transition-colors"
            >
              <span>Schedule Demo</span>
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>

          <form onSubmit={handleSubscribe} className="max-w-md mx-auto flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 px-4 py-2 rounded-lg border border-white/20 bg-white/10 text-white placeholder-green-200 focus:outline-none focus:ring-2 focus:ring-white/50"
              required
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-white text-green-600 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Subscribing...' : 'Subscribe'}
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <Logo size="md" className="mb-4" />
              <p className="text-sm">
                Revolutionizing turf management through advanced AI, deep learning, and satellite imagery analysis.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link to="/security" className="hover:text-white transition-colors">Security</Link></li>
                <li><Link to="/api" className="hover:text-white transition-colors">API</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link to="/careers" className="hover:text-white transition-colors">Careers</Link></li>
                <li><Link to="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link to="/press" className="hover:text-white transition-colors">Press</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Contact</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span>support@healthmaps.com</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <span>1-800-HEALTHMAPS</span>
                </li>
                <li className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4" />
                  <span>San Francisco, CA</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2024 HealthMaps. All rights reserved. | 
              <Link to="/privacy" className="hover:text-white transition-colors ml-2">Privacy Policy</Link> | 
              <Link to="/terms" className="hover:text-white transition-colors ml-2">Terms of Service</Link>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
