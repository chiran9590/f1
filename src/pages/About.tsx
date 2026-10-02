import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Target, 
  Lightbulb, 
  Heart,
  Shield,
  Mail,
  Phone,
  Instagram,
  Linkedin,
  ChevronDown,
  MapPin
} from 'lucide-react';
import Logo from '../components/Logo';

const About: React.FC = () => {
  const [languageDropdown, setLanguageDropdown] = useState(false);

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
      icon: Target,
      title: "Precision Agriculture",
      description: "Delivering accurate, data-driven insights for optimal landscape management"
    },
    {
      icon: Lightbulb,
      title: "Innovation First",
      description: "Pioneering AI technology for advanced plant health monitoring"
    },
    {
      icon: Heart,
      title: "Environmental Care",
      description: "Promoting sustainable practices through intelligent resource management"
    },
    {
      icon: Shield,
      title: "Reliability",
      description: "Consistent, accurate results you can trust for critical decisions"
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
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                Services (EN)
              </Link>
              <Link 
                to="/about" 
                className="text-gray-900 font-medium border-b-2 border-green-600 pb-1 transition-colors"
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
            About PhytoMaps
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Pioneering the future of plant health monitoring through advanced AI technology and drone-based imaging solutions
          </p>
          <div className="flex justify-center space-x-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">500+</div>
              <div className="text-gray-600">Courses Analyzed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">95%</div>
              <div className="text-gray-600">AI Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">10M+</div>
              <div className="text-gray-600">Acres Mapped</div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Story</h2>
              <p className="text-gray-600 mb-6">
                Founded in 2020, PhytoMaps emerged from a simple observation: golf course managers needed better tools to understand and maintain their landscapes. Traditional methods of plant health assessment were time-consuming, expensive, and often inaccurate.
              </p>
              <p className="text-gray-600 mb-6">
                Our team of AI researchers and agronomy experts developed a revolutionary approach combining drone technology, advanced computer vision, and deep learning to provide real-time, actionable insights about plant health.
              </p>
              <p className="text-gray-600">
                Today, we're proud to serve hundreds of golf courses, parks, and landscapes worldwide, helping them make data-driven decisions that improve plant health while reducing costs and environmental impact.
              </p>
            </div>
            <div className="relative">
              <img 
                src="/drone-scanning.jpg" 
                alt="Drone flying over golf course for plant health analysis"
                className="rounded-2xl shadow-2xl w-full h-auto object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Core Values</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <value.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The experts behind PhytoMaps' innovative technology
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-6 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-teal-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                  {member.image}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{member.name}</h3>
                <p className="text-green-600 font-medium mb-2">{member.role}</p>
                <p className="text-sm text-gray-600 mb-3">{member.credentials}</p>
                <p className="text-gray-600 text-sm mb-4">{member.bio}</p>
                <a 
                  href={member.linkedin}
                  className="inline-flex items-center justify-center w-10 h-10 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
                >
                  <Linkedin className="w-5 h-5 text-gray-600" />
                </a>
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
            Join the hundreds of professionals trusting PhytoMaps for superior plant health monitoring
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/contact" 
              className="inline-flex items-center justify-center space-x-2 bg-white text-green-600 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors shadow-lg"
            >
              <span>Contact Us</span>
            </Link>
            
            <Link 
              to="/services" 
              className="inline-flex items-center justify-center space-x-2 border border-white text-white px-6 py-3 rounded-lg hover:bg-white/10 transition-colors"
            >
              <span>View Services</span>
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

export default About;
