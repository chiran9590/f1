import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Send,
  Instagram,
  Linkedin,
  ChevronDown
} from 'lucide-react';
import Logo from '../components/Logo';

const Contact: React.FC = () => {
  const [languageDropdown, setLanguageDropdown] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    service: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      alert('Thank you for your message! We\'ll get back to you within 24 hours.');
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        service: '',
        message: ''
      });
    }, 1000);
  };

  const contactInfo = [
    {
      icon: Mail,
      title: "Email Us",
      details: ["info@phytomaps.com", "support@phytomaps.com"],
      action: "Send us an email anytime!"
    },
    {
      icon: Phone,
      title: "Call Us",
      details: ["1-800-PHYTOMAPS", "+1 (415) 555-0123"],
      action: "Mon-Fri 9AM-6PM PST"
    },
    {
      icon: MapPin,
      title: "Visit Us",
      details: ["1234 Tech Boulevard", "San Francisco, CA 94105"],
      action: "Schedule a meeting"
    }
  ];

  const teamMembers = [
    {
      name: "Sarah Chen",
      role: "Sales Director",
      email: "sarah@phytomaps.com",
      phone: "Ext. 101"
    },
    {
      name: "Michael Rodriguez",
      role: "Technical Support Lead",
      email: "michael@phytomaps.com", 
      phone: "Ext. 102"
    },
    {
      name: "Emily Johnson",
      role: "Customer Success Manager",
      email: "emily@phytomaps.com",
      phone: "Ext. 103"
    }
  ];

  const faqs = [
    {
      question: "How quickly can I get my first analysis?",
      answer: "Once we schedule your drone scanning, you'll receive preliminary results within 24 hours and comprehensive reports within 48 hours."
    },
    {
      question: "What areas do you service?",
      answer: "We currently service golf courses, parks, and large landscapes throughout the United States, with expansion to international markets planned for 2025."
    },
    {
      question: "What's included in the free consultation?",
      answer: "Our free consultation includes a site assessment, demonstration of our technology, discussion of your specific needs, and a customized proposal."
    },
    {
      question: "How accurate is your plant health analysis?",
      answer: "Our AI-powered analysis achieves 95%+ accuracy in vegetation health assessment and stress detection, validated by independent agronomists."
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
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                About (EN)
              </Link>
              <Link 
                to="/contact" 
                className="text-gray-900 font-medium border-b-2 border-green-600 pb-1 transition-colors"
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
            Contact PhytoMaps
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Get in touch with our team to learn how our plant health monitoring solutions can transform your landscape management
          </p>
          <div className="flex justify-center space-x-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">24h</div>
              <div className="text-gray-600">Response Time</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">Free</div>
              <div className="text-gray-600">Consultation</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">500+</div>
              <div className="text-gray-600">Happy Clients</div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Info Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {contactInfo.map((info, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <info.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{info.title}</h3>
                <div className="space-y-2 mb-4">
                  {info.details.map((detail, detailIndex) => (
                    <p key={detailIndex} className="text-gray-600">{detail}</p>
                  ))}
                </div>
                <p className="text-sm text-green-600 font-medium">{info.action}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Send Us a Message</h2>
              <p className="text-gray-600 mb-8">
                Fill out the form below and our team will get back to you within 24 hours to discuss your plant health monitoring needs.
              </p>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                      placeholder="John Doe"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company/Organization
                    </label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                      placeholder="Golf Course Name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service Interest *
                  </label>
                  <select
                    name="service"
                    value={formData.service}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                  >
                    <option value="">Select a service</option>
                    <option value="drone-scanning">Drone Scanning</option>
                    <option value="health-mapping">Health Mapping</option>
                    <option value="visual-reports">Visual Reports</option>
                    <option value="consultation">Expert Consultation</option>
                    <option value="custom">Custom Solution</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                    placeholder="Tell us about your plant health monitoring needs..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-teal-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  <Send className="w-5 h-5" />
                  <span>{isSubmitting ? 'Sending...' : 'Send Message'}</span>
                </button>
              </form>
            </div>

            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Team</h2>
              <p className="text-gray-600 mb-8">
                Connect with our specialists who are ready to help you implement the perfect plant health monitoring solution.
              </p>
              
              <div className="space-y-6">
                {teamMembers.map((member, index) => (
                  <div key={index} className="bg-white rounded-xl p-6 shadow-lg">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-teal-600 rounded-full flex items-center justify-center text-white font-bold">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">{member.name}</h3>
                        <p className="text-green-600 font-medium mb-2">{member.role}</p>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p className="flex items-center space-x-2">
                            <Mail className="w-4 h-4" />
                            <span>{member.email}</span>
                          </p>
                          <p className="flex items-center space-x-2">
                            <Phone className="w-4 h-4" />
                            <span>{member.phone}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-600">
              Quick answers to common questions about our services
            </p>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
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
            Schedule your free consultation today and see the PhytoMaps difference
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:1-800-PHYTOMAPS"
              className="inline-flex items-center justify-center space-x-2 bg-white text-green-600 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors shadow-lg"
            >
              <Phone className="w-5 h-5" />
              <span>Call Now</span>
            </a>
            
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

export default Contact;
