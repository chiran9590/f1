import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Target, 
  Lightbulb, 
  Globe, 
  Heart,
  Shield,
  Mail,
  Phone,
  Twitter,
  Linkedin,
  Facebook
} from 'lucide-react';
import Logo from '../components/Logo';

const About: React.FC = () => {
  const team = [
    {
      name: "Dr. Arjun Kumar",
      role: "Chief Executive Officer",
      bio: "AI researcher and computer vision expert with 12+ years in deep learning and remote sensing applications for agriculture.",
      image: "AK",
      credentials: "PhD, AI/ML",
      linkedin: "#"
    },
    {
      name: "Priya Sharma",
      role: "Chief Technology Officer",
      bio: "Deep learning specialist specializing in semantic segmentation and U-Net architectures for satellite imagery analysis.",
      image: "PS",
      credentials: "MS, Computer Science",
      linkedin: "#"
    },
    {
      name: "Rajesh Malhotra",
      role: "Lead AI Engineer",
      bio: "Computer vision engineer with extensive experience in geospatial AI and vegetation health monitoring systems.",
      image: "RM",
      credentials: "BTech, AI & DS",
      linkedin: "#"
    },
    {
      name: "Anita Desai",
      role: "Head of Operations",
      bio: "Golf course management expert with a track record of implementing AI solutions in sports turf management.",
      image: "AD",
      credentials: "MBA, Hospitality",
      linkedin: "#"
    }
  ];

  const values = [
    {
      icon: Heart,
      title: "AI-First Approach",
      description: "Every solution is powered by cutting-edge deep learning to provide the most accurate vegetation analysis."
    },
    {
      icon: Shield,
      title: "Scientific Accuracy",
      description: "We maintain the highest standards of model validation and accuracy verification for all AI predictions."
    },
    {
      icon: Lightbulb,
      title: "Technical Innovation",
      description: "Continuously advancing semantic segmentation and computer vision for turf management applications."
    },
    {
      icon: Users,
      title: "Research Collaboration",
      description: "Working with academic institutions and golf course professionals to advance AI in turf science."
    }
  ];

  const milestones = [
    { year: "2020", title: "Research Started", description: "Began research on semantic segmentation for golf course vegetation analysis at Bangalore University." },
    { year: "2021", title: "U-Net Model Developed", description: "Successfully trained first U-Net architecture for golf course land classification with 85% accuracy." },
    { year: "2022", title: "Prototype Launch", description: "Deployed initial AI analysis platform with 5 pilot golf courses across India." },
    { year: "2023", title: "Commercial Release", description: "Launched HealthMaps platform with 50+ golf courses and achieved 95% model accuracy." },
    { year: "2024", title: "AI Expansion", description: "Integrated satellite imagery processing and expanded to 200+ courses globally." },
    { year: "2025", title: "Advanced Analytics", description: "Added real-time processing and Mapbox integration for 500+ courses worldwide." }
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
              <Link to="/about" className="text-gray-900 hover:text-green-600 font-medium transition-colors">About</Link>
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
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-50 via-white to-teal-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-6">
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              About 
              <span className="bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent"> HealthMaps</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Our platform leverages advanced deep learning techniques such as U-Net architecture for semantic segmentation of golf course imagery. The system classifies land into healthy grass, unhealthy grass, water bodies, and trees with pixel-level accuracy.
            </p>
            
            <div className="flex justify-center space-x-8 pt-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">95%</div>
                <div className="text-gray-600">AI Accuracy</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">500+</div>
                <div className="text-gray-600">Courses</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">10M+</div>
                <div className="text-gray-600">Acres Analyzed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">24/7</div>
                <div className="text-gray-600">AI Processing</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="space-y-4">
                <h2 className="text-4xl font-bold text-gray-900">Our Mission</h2>
                <p className="text-lg text-gray-600 leading-relaxed">
                  To revolutionize golf course management by providing superintendents with advanced AI and deep learning tools that enable precise vegetation analysis and data-driven turf care decisions.
                </p>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-gray-900">Our Vision</h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  A world where every golf course is managed with AI-powered precision, using semantic segmentation and satellite imagery to achieve perfect turf conditions and sustainable resource management.
                </p>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-green-100 to-teal-100 rounded-2xl p-8">
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Target className="w-6 h-6 text-green-600" />
                    <h4 className="font-semibold text-gray-900">Impact-Driven</h4>
                  </div>
                  <p className="text-gray-600">
                    Every AI model we develop is designed to make a measurable impact on turf health and operational efficiency through precise vegetation classification.
                  </p>
                </div>
                
                <div className="space-y-4 mt-6">
                  <div className="flex items-center space-x-3">
                    <Globe className="w-6 h-6 text-teal-600" />
                    <h4 className="font-semibold text-gray-900">Global Reach</h4>
                  </div>
                  <p className="text-gray-600">
                    Our AI platform serves golf courses globally, adapting to diverse climates, grass types, and management practices with localized model training.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Core Values</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The principles that guide everything we do at HealthMaps
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-teal-600 rounded-full flex items-center justify-center mx-auto">
                  <value.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Journey</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Key milestones in our journey to advance AI in golf course management
            </p>
          </div>

          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-gradient-to-b from-green-600 to-teal-600"></div>
            
            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <div key={index} className={`flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                  <div className="flex-1"></div>
                  <div className="w-8 h-8 bg-white border-4 border-green-600 rounded-full z-10"></div>
                  <div className="flex-1 px-8">
                    <div className="bg-white rounded-lg p-6 shadow-lg border border-gray-200">
                      <div className="text-green-600 font-bold mb-2">{milestone.year}</div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{milestone.title}</h3>
                      <p className="text-gray-600">{milestone.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Leadership Team</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Meet the experts pioneering AI in golf course management
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-teal-600 rounded-full flex items-center justify-center mx-auto text-white text-2xl font-bold">
                    {member.image}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{member.name}</h3>
                    <div className="text-green-600 font-medium">{member.role}</div>
                    <div className="text-gray-500 text-sm">{member.credentials}</div>
                  </div>
                  <p className="text-gray-600 text-sm">{member.bio}</p>
                  <div className="flex justify-center space-x-3">
                    <a href={member.linkedin} className="text-gray-400 hover:text-blue-600 transition-colors">
                      <Linkedin className="w-5 h-5" />
                    </a>
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
            Join the AI Revolution in Golf Course Management
          </h2>
          <p className="text-xl text-green-100 mb-8">
            Whether you're a golf course superintendent, technology partner, or AI researcher, there's a place for you at HealthMaps.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/register" 
              className="inline-flex items-center justify-center space-x-2 bg-white text-green-600 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors shadow-lg"
            >
              <span>Start Your Journey</span>
            </Link>
            
            <Link 
              to="/careers" 
              className="inline-flex items-center justify-center space-x-2 border border-white text-white px-6 py-3 rounded-lg hover:bg-white/10 transition-colors"
            >
              <span>View Careers</span>
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
                Pioneering the future of turf management through advanced AI, deep learning, and semantic segmentation technology.
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
              <h4 className="font-semibold text-white mb-4">Connect</h4>
              <div className="flex space-x-4 mb-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Linkedin className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span>contact@healthmaps.com</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <span>1-800-HEALTHMAPS</span>
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

export default About;
