import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Camera, 
  Map, 
  FileText, 
  Phone,
  BarChart3, 
  Shield, 
  Heart,
  CheckCircle,
  ArrowRight,
  Mail,
  Instagram,
  Linkedin,
  ChevronDown,
  Zap,
  MapPin
} from 'lucide-react';
import Logo from '../components/Logo';

const Services: React.FC = () => {
  const [languageDropdown, setLanguageDropdown] = useState(false);
  const [selectedService, setSelectedService] = useState<number | null>(null);

  const services = [
    {
      id: 1,
      icon: Camera,
      title: "Drone Scanning",
      description: "High-resolution aerial imagery collection using advanced drone technology for comprehensive landscape analysis.",
      features: [
        "Automated flight patterns",
        "High-resolution imagery",
        "Full coverage mapping",
        "Real-time data capture",
        "Weather-resistant operations"
      ],
      price: "Starting at $299/month",
      popular: true
    },
    {
      id: 2,
      icon: Map,
      title: "Health Mapping",
      description: "AI-powered vegetation health analysis with detailed stress detection and growth monitoring capabilities.",
      features: [
        "NDVI analysis",
        "Stress identification",
        "Growth monitoring",
        "Historical comparison",
        "Custom health metrics"
      ],
      price: "Starting at $199/month"
    },
    {
      id: 3,
      icon: FileText,
      title: "Visual Reports",
      description: "Comprehensive analytics and actionable insights delivered through easy-to-understand visual reports.",
      features: [
        "Detailed analytics",
        "Actionable insights",
        "Trend analysis",
        "PDF exports",
        "Executive summaries"
      ],
      price: "Starting at $149/month"
    },
    {
      id: 4,
      icon: Phone,
      title: "Expert Consultation",
      description: "Professional guidance and recommendations from our team of agronomy and AI experts.",
      features: [
        "Expert recommendations",
        "Cost optimization",
        "Care guidance",
        "Seasonal planning",
        "Emergency support"
      ],
      price: "Starting at $399/month"
    }
  ];

  const processSteps = [
    {
      number: "1",
      title: "Consultation & Planning",
      description: "We assess your needs and develop a customized scanning and analysis plan",
      icon: Phone
    },
    {
      number: "2", 
      title: "Data Collection",
      description: "Our drones capture high-resolution imagery of your landscape",
      icon: Camera
    },
    {
      number: "3",
      title: "AI Analysis",
      description: "Advanced algorithms process the data to generate health insights",
      icon: BarChart3
    },
    {
      number: "4",
      title: "Report Delivery",
      description: "Receive comprehensive reports with actionable recommendations",
      icon: FileText
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
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                Home (EN)
              </Link>
              <Link 
                to="/services" 
                className="text-gray-900 font-medium border-b-2 border-green-600 pb-1 transition-colors"
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
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Our Services
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Comprehensive plant health monitoring solutions powered by advanced drone technology and AI analysis
          </p>
          <div className="flex justify-center space-x-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">4</div>
              <div className="text-gray-600">Core Services</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">24/7</div>
              <div className="text-gray-600">Monitoring</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">95%</div>
              <div className="text-gray-600">Accuracy Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Service Plan</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Flexible solutions tailored to your specific landscape management needs
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service) => (
              <div 
                key={service.id}
                className={`relative rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer ${
                  selectedService === service.id 
                    ? 'bg-gradient-to-br from-green-50 to-teal-50 border-2 border-green-600' 
                    : service.popular 
                    ? 'bg-white border-2 border-green-600' 
                    : 'bg-white border border-gray-200'
                }`}
                onClick={() => setSelectedService(service.id)}
              >
                {service.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className={`w-16 h-16 rounded-xl flex items-center justify-center mb-6 ${
                  selectedService === service.id || service.popular
                    ? 'bg-gradient-to-r from-green-600 to-teal-600'
                    : 'bg-gray-100'
                }`}>
                  <service.icon className={`w-8 h-8 ${
                    selectedService === service.id || service.popular
                      ? 'text-white'
                      : 'text-gray-600'
                  }`} />
                </div>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{service.title}</h3>
                <p className="text-gray-600 mb-6">{service.description}</p>
                
                <ul className="space-y-3 mb-6">
                  {service.features.map((feature, index) => (
                    <li key={index} className="flex items-center space-x-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <div className="pt-6 border-t border-gray-200">
                  <div className="text-2xl font-bold text-gray-900 mb-4">{service.price}</div>
                  <button className={`w-full py-3 rounded-lg font-medium transition-colors ${
                    selectedService === service.id || service.popular
                      ? 'bg-gradient-to-r from-green-600 to-teal-600 text-white hover:from-green-700 hover:to-teal-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}>
                    Get Started
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our streamlined process delivers insights in four simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {processSteps.map((step, index) => (
              <div key={index} className="relative">
                <div className="bg-white rounded-xl p-6 text-center shadow-lg">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-teal-600 rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-4">
                    {step.number}
                  </div>
                  <step.icon className="w-10 h-10 text-green-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-600 text-sm">{step.description}</p>
                </div>
                {index < processSteps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ArrowRight className="w-6 h-6 text-green-600" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose PhytoMaps?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Advanced technology and expertise that deliver results
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-xl p-6">
              <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-teal-600 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Real-Time Analysis</h3>
              <p className="text-gray-600">Get instant insights with our AI-powered processing that delivers results in minutes, not days.</p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">High Accuracy</h3>
              <p className="text-gray-600">Our advanced algorithms achieve 95%+ accuracy in vegetation health assessment and stress detection.</p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Expert Support</h3>
              <p className="text-gray-600">Work with our team of agronomy experts and AI specialists to optimize your landscape management.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-teal-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-green-100 mb-8">
            Contact us today for a free consultation and demo of our plant health monitoring services
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/contact" 
              className="inline-flex items-center justify-center space-x-2 bg-white text-green-600 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors shadow-lg"
            >
              <span>Free Consultation</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            
            <Link 
              to="/about" 
              className="inline-flex items-center justify-center space-x-2 border border-white text-white px-6 py-3 rounded-lg hover:bg-white/10 transition-colors"
            >
              <span>Learn More</span>
            </Link>
          </div>
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
                <li><Link to="/services" className="hover:text-white transition-colors">Drone Scanning</Link></li>
                <li><Link to="/services" className="hover:text-white transition-colors">Health Mapping</Link></li>
                <li><Link to="/services" className="hover:text-white transition-colors">Visual Reports</Link></li>
                <li><Link to="/services" className="hover:text-white transition-colors">Consultation</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link to="/careers" className="hover:text-white transition-colors">Careers</Link></li>
                <li><Link to="/blog" className="hover:text-white transition-colors">Blog</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Contact</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span>info@phytomaps.com</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <span>1-800-PHYTOMAPS</span>
                </li>
                <li className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4" />
                  <span>San Francisco, CA</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2024 PhytoMaps. All rights reserved. | 
              <Link to="/privacy" className="hover:text-white transition-colors ml-2">Privacy Policy</Link> | 
              <Link to="/terms" className="hover:text-white transition-colors ml-2">Terms of Service</Link>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Services;
