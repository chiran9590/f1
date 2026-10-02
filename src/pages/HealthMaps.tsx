import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Camera, 
  Map, 
  FileText, 
  Phone,
  Play,
  Star,
  ChevronRight,
  Mail,
  CheckCircle,
  Activity,
  Heart,
  TreePine,
  Droplets,
  Zap,
  Shield,
  BarChart3,
  MapPin
} from 'lucide-react';
import Logo from '../components/Logo';

const HealthMaps: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    setTimeout(() => {
      setEmail('');
      setIsSubmitting(false);
      alert('Thank you for subscribing! We\'ll keep you updated.');
    }, 1000);
  };

  const services = [
    {
      icon: Camera,
      title: "Drone Scanning",
      description: "We fly over your property to collect precise & accurate image data using advanced drone technology",
      image: "/api/placeholder/600/400",
      features: ["High-resolution imagery", "Automated flight patterns", "Full coverage mapping"]
    },
    {
      icon: Map,
      title: "Health Mapping",
      description: "We detect early stress signals in grass, trees, and plants using AI-powered analysis",
      image: "/api/placeholder/600/400",
      features: ["Vegetation health detection", "Stress identification", "Growth monitoring"]
    },
    {
      icon: FileText,
      title: "Visual Reports",
      description: "We generate easy-to-read insights that help you act fast and smart with detailed analytics",
      image: "/api/placeholder/600/400",
      features: ["Comprehensive analytics", "Actionable insights", "Trend analysis"]
    },
    {
      icon: Phone,
      title: "Consultation",
      description: "We deliver data-driven tips to reduce costs and improve landscape care",
      image: "/api/placeholder/600/400",
      features: ["Expert recommendations", "Cost optimization", "Care guidance"]
    }
  ];

  const healthMetrics = [
    { 
      icon: Heart, 
      label: "Healthy Vegetation", 
      value: "72%", 
      color: "from-green-500 to-emerald-600",
      bgColor: "bg-green-50"
    },
    { 
      icon: Activity, 
      label: "Stress Detection", 
      value: "18%", 
      color: "from-yellow-500 to-orange-600",
      bgColor: "bg-yellow-50"
    },
    { 
      icon: TreePine, 
      label: "Tree Coverage", 
      value: "8%", 
      color: "from-purple-500 to-indigo-600",
      bgColor: "bg-purple-50"
    },
    { 
      icon: Droplets, 
      label: "Water Bodies", 
      value: "2%", 
      color: "from-blue-500 to-cyan-600",
      bgColor: "bg-blue-50"
    }
  ];

  const processSteps = [
    {
      number: "1",
      title: "Book a Flyover",
      description: "Schedule your drone scanning session with our expert team",
      icon: Camera
    },
    {
      number: "2", 
      title: "We Scan Your Site",
      description: "Our drones capture high-resolution imagery of your landscape",
      icon: Zap
    },
    {
      number: "3",
      title: "Get Your Report",
      description: "Receive detailed health analysis and actionable insights",
      icon: FileText
    }
  ];

  const testimonials = [
    {
      name: "David Martinez",
      role: "Golf Course Superintendent",
      company: "Pine Valley Golf Club",
      content: "The drone scanning and health mapping technology has transformed how we manage our course. We can now identify potential issues weeks before they become visible.",
      rating: 5,
      avatar: "DM"
    },
    {
      name: "Sarah Johnson",
      role: "Landscape Manager",
      company: "Royal Botanical Gardens",
      content: "The visual reports are incredibly detailed and easy to understand. Our team can make data-driven decisions that have improved plant health by 40%.",
      rating: 5,
      avatar: "SJ"
    },
    {
      name: "Michael Chen",
      role: "Park Director",
      company: "Central Municipal Park",
      content: "The consultation service provides expert insights that have helped us reduce maintenance costs while improving landscape quality.",
      rating: 5,
      avatar: "MC"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Logo size="md" />
            
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/" className="text-gray-600 hover:text-green-600 font-medium transition-colors">Home</Link>
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
                  <Zap className="w-4 h-4" />
                  <span>Drone-Powered Plant Health Monitoring</span>
                </div>
                
                <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  One Platform.
                  <span className="bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent"> Infinite Plant Insights.</span>
                </h1>
                
                <p className="text-xl text-gray-600 leading-relaxed">
                  HealthMaps uses drones to capture detailed plant health data from above. We help golf courses, gardens, and parks plan smarter and care better with precise aerial insights. No more guesswork!
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  to="/register" 
                  className="inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-green-600 to-teal-600 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-teal-700 transition-all transform hover:scale-105 shadow-lg"
                >
                  <span>Get Started</span>
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
                <span className="text-sm text-gray-600">4.9/5 from 500+ reviews</span>
              </div>
            </div>

            <div className="relative">
              <div className="relative bg-gradient-to-br from-green-100 to-teal-100 rounded-2xl p-8 shadow-2xl">
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">Live Health Dashboard</h3>
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {healthMetrics.map((metric, index) => (
                      <div key={index} className={`p-3 ${metric.bgColor} rounded-lg`}>
                        <div className="flex items-center space-x-2 mb-2">
                          <metric.icon className={`w-4 h-4 bg-gradient-to-r ${metric.color} bg-clip-text text-transparent`} />
                          <span className="text-xs font-medium text-gray-700">{metric.label}</span>
                        </div>
                        <div className={`text-lg font-bold bg-gradient-to-r ${metric.color} bg-clip-text text-transparent`}>
                          {metric.value}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">Last Scan</span>
                      <span className="text-xs font-medium">2 hours ago</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What We Do Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">What We Do</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive plant health monitoring using advanced drone technology and AI-powered analysis
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <div key={index} className="group">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <div className="h-48 bg-gradient-to-br from-green-100 to-teal-100 flex items-center justify-center">
                    <service.icon className="w-16 h-16 text-green-600" />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">{service.title}</h3>
                    <p className="text-gray-600 mb-4">{service.description}</p>
                    <ul className="space-y-2">
                      {service.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center space-x-2 text-sm text-gray-600">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get started with HealthMaps in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {processSteps.map((step, index) => (
              <div key={index} className="relative">
                <div className="bg-white rounded-xl p-8 shadow-lg text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-teal-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6">
                    {step.number}
                  </div>
                  <step.icon className="w-12 h-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
                {index < processSteps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ChevronRight className="w-8 h-8 text-green-600" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose HealthMaps Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose HealthMaps?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Innovative Insights for Thriving Landscapes
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-xl p-6">
              <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-teal-600 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Advanced Plant Health</h3>
              <p className="text-gray-600">Cutting-edge AI algorithms detect plant stress before visible symptoms appear</p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Precision Drone Mapping</h3>
              <p className="text-gray-600">High-resolution aerial imagery provides detailed landscape analysis</p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Actionable Reports</h3>
              <p className="text-gray-600">Easy-to-understand insights with specific recommendations</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Trusted by Landscape Professionals
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See how professionals are using HealthMaps to transform their landscape management
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg">
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
            Ready to Transform Your Landscape Management?
          </h2>
          <p className="text-xl text-green-100 mb-8">
            Join hundreds of professionals using HealthMaps for superior plant health monitoring
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
                Revolutionizing landscape management through advanced drone technology and AI-powered plant health analysis.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Services</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/drone-scanning" className="hover:text-white transition-colors">Drone Scanning</Link></li>
                <li><Link to="/health-mapping" className="hover:text-white transition-colors">Health Mapping</Link></li>
                <li><Link to="/visual-reports" className="hover:text-white transition-colors">Visual Reports</Link></li>
                <li><Link to="/consultation" className="hover:text-white transition-colors">Consultation</Link></li>
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
                  <span>info@healthmaps.com</span>
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

export default HealthMaps;
