import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  BarChart3, 
  Shield, 
  Users, 
  Heart,
  Database,
  Cloud,
  Clock,
  CheckCircle,
  ArrowRight,
  Star,
  Phone,
  Mail
} from 'lucide-react';
import Logo from '../components/Logo';

const Services: React.FC = () => {
  const [selectedService, setSelectedService] = useState<number | null>(null);

  const services = [
    {
      id: 1,
      icon: Database,
      title: "Image-Based Analysis",
      description: "Upload aerial or drone images and receive detailed vegetation health reports using our advanced AI algorithms.",
      features: [
        "Drone imagery processing",
        "High-resolution analysis",
        "Automated health reports",
        "Historical comparison",
        "Multi-format support"
      ],
      price: "Starting at $299/month",
      popular: true
    },
    {
      id: 2,
      icon: Heart,
      title: "AI Segmentation",
      description: "Pixel-level classification using trained deep learning models for precise land cover identification.",
      features: [
        "U-Net architecture",
        "Semantic segmentation",
        "95%+ accuracy",
        "Real-time processing",
        "Custom model training"
      ],
      price: "Starting at $199/month"
    },
    {
      id: 3,
      icon: BarChart3,
      title: "Health Visualization",
      description: "Color-coded maps showing real-time turf conditions with intuitive visual analytics.",
      features: [
        "Interactive color maps",
        "Health gradient overlays",
        "Time-lapse visualization",
        "Custom color schemes",
        "Export capabilities"
      ],
      price: "Starting at $399/month"
    },
    {
      id: 4,
      icon: Users,
      title: "Analytics Dashboard",
      description: "View percentage distribution of vegetation types with comprehensive analytics and insights.",
      features: [
        "Percentage breakdowns",
        "Trend analysis",
        "Performance metrics",
        "Custom reports",
        "Data export"
      ],
      price: "Starting at $149/month"
    },
    {
      id: 5,
      icon: Cloud,
      title: "Geospatial Mapping",
      description: "Interactive visualization using Mapbox integration for comprehensive course mapping.",
      features: [
        "Mapbox integration",
        "Interactive navigation",
        "Layer management",
        "GPS coordinates",
        "Mobile compatibility"
      ],
      price: "Starting at $249/month"
    }
  ];

  const benefits = [
    {
      icon: Clock,
      title: "Save Time",
      description: "Reduce course analysis time by 80% with automated AI processing"
    },
    {
      icon: CheckCircle,
      title: "Improve Accuracy",
      description: "Achieve 95%+ accuracy in vegetation health assessment with deep learning"
    },
    {
      icon: Shield,
      title: "Data Security",
      description: "Enterprise-grade encryption protects your course data and imagery"
    },
    {
      icon: Users,
      title: "Scale Easily",
      description: "Process unlimited acres with our cloud-based AI infrastructure"
    }
  ];

  const testimonials = [
    {
      name: "Robert Thompson",
      role: "Course Superintendent",
      content: "The Image-Based Analysis service has transformed how we monitor our course. We can process 100+ acres in minutes instead of hours.",
      rating: 5,
      service: "Image-Based Analysis"
    },
    {
      name: "Priya Sharma",
      role: "Golf Course Manager",
      content: "AI Segmentation accuracy is incredible. We can identify problem areas at pixel level before they become visible to players.",
      rating: 5,
      service: "AI Segmentation"
    },
    {
      name: "Rajesh Malhotra",
      role: "Turf Specialist",
      content: "The Geospatial Mapping with Mapbox integration gives us unprecedented insight into our course management. Game-changer technology.",
      rating: 5,
      service: "Geospatial Mapping"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center">
              <Logo size="md" />
            </Link>
            
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/" className="text-gray-600 hover:text-green-600 font-medium transition-colors">Home</Link>
              <Link to="/about" className="text-gray-600 hover:text-green-600 font-medium transition-colors">About</Link>
              <Link to="/services" className="text-gray-900 hover:text-green-600 font-medium transition-colors">Services</Link>
              <Link to="/contact" className="text-gray-600 hover:text-green-600 font-medium transition-colors">Contact</Link>
              <Link to="/login" className="text-gray-600 hover:text-green-600 font-medium transition-colors">Login</Link>
              <Link 
                to="/register" 
                className="bg-gradient-to-r from-green-600 to-teal-600 text-white px-4 py-2 rounded-lg hover:from-green-700 hover:to-teal-700 transition-all transform hover:scale-105"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-50 via-white to-teal-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-6">
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Our
              <span className="bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent"> Services</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Comprehensive AI-powered services designed to revolutionize golf course management through deep learning and computer vision.
            </p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => (
              <div 
                key={service.id}
                className={`relative bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all cursor-pointer border-2 ${
                  service.popular ? 'border-green-500' : 'border-transparent'
                } ${selectedService === service.id ? 'ring-2 ring-green-500' : ''}`}
                onClick={() => setSelectedService(service.id)}
              >
                {service.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-green-600 to-teal-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-teal-600 rounded-lg flex items-center justify-center">
                    <service.icon className="w-6 h-6 text-white" />
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{service.title}</h3>
                    <p className="text-gray-600 mb-4">{service.description}</p>
                  </div>
                  
                  <ul className="space-y-2">
                    {service.features.map((feature, index) => (
                      <li key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold text-gray-900">{service.price}</span>
                      <button className="text-green-600 hover:text-green-700 font-medium flex items-center space-x-1">
                        <span>Learn More</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose HealthMaps AI?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the power of cutting-edge deep learning for golf course management
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-teal-600 rounded-full flex items-center justify-center mx-auto">
                  <benefit.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Success Stories</h2>
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
                
                <div className="space-y-1">
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">{testimonial.role}</div>
                  <div className="text-sm text-green-600 font-medium">{testimonial.service}</div>
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
            Get started with HealthMaps AI today and experience the future of golf course management
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
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
              <Phone className="w-5 h-5" />
              <span>Schedule Consultation</span>
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
                Leading the AI revolution in golf course management with deep learning and semantic segmentation technology.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Services</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/services/analytics" className="hover:text-white transition-colors">Analytics</Link></li>
                <li><Link to="/services/monitoring" className="hover:text-white transition-colors">Monitoring</Link></li>
                <li><Link to="/services/cms" className="hover:text-white transition-colors">CMS</Link></li>
                <li><Link to="/services/security" className="hover:text-white transition-colors">Security</Link></li>
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
                  <span>sales@healthmaps.com</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <span>1-800-SALES-HM</span>
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

export default Services;
