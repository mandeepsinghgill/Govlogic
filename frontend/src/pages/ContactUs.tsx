import { Link } from 'react-router-dom';
import { 
  ArrowRight, Mail, MapPin, MessageSquare,
  Menu, X, Youtube, Linkedin, Twitter, ChevronDown, Sparkles, Send
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import DemoBookingModal from '../components/DemoBookingModal';
import FAQChatbot from '../components/FAQChatbot';
import { platformSections } from '../content/platformSections';

// Facebook Icon Component
const FacebookIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
  </svg>
);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function ContactUs() {
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isPlatformMenuOpen, setIsPlatformMenuOpen] = useState(false);
  const closeMenuTimeoutRef = useRef<number | null>(null);
  const platformMenuRef = useRef<HTMLDivElement | null>(null);
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    subject: '',
    phone: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const handleClickAway = (event: MouseEvent) => {
      if (platformMenuRef.current && !platformMenuRef.current.contains(event.target as Node)) {
        setIsPlatformMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsPlatformMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickAway);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickAway);
      window.removeEventListener('keydown', handleKeyDown);
      if (closeMenuTimeoutRef.current) {
        window.clearTimeout(closeMenuTimeoutRef.current);
      }
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch(`${API_URL}/api/v1/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({
          fullName: '',
          email: '',
          subject: '',
          phone: '',
          message: ''
        });
        setTimeout(() => setSubmitStatus('idle'), 5000);
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Modern Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <img 
                src="/govsure-logo.png" 
                alt="GovSure" 
                className="h-auto"
                style={{ width: "150px"}}
              />
            </Link>
            
            <div className="hidden md:flex items-center space-x-8">
              <div
                ref={platformMenuRef}
                className="relative"
                onMouseEnter={() => {
                  if (closeMenuTimeoutRef.current) {
                    window.clearTimeout(closeMenuTimeoutRef.current);
                    closeMenuTimeoutRef.current = null;
                  }
                  setIsPlatformMenuOpen(true);
                }}
                onMouseLeave={() => {
                  closeMenuTimeoutRef.current = window.setTimeout(() => {
                    setIsPlatformMenuOpen(false);
                  }, 160);
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    if (closeMenuTimeoutRef.current) {
                      window.clearTimeout(closeMenuTimeoutRef.current);
                      closeMenuTimeoutRef.current = null;
                    }
                    setIsPlatformMenuOpen(prev => !prev);
                  }}
                  className="flex items-center gap-1 text-gray-600 hover:text-gray-900 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                  aria-haspopup="true"
                  aria-expanded={isPlatformMenuOpen}
                >
                  Platform
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${isPlatformMenuOpen ? 'rotate-180 text-gray-900' : ''}`}
                  />
                </button>

                {isPlatformMenuOpen && (
                  <div
                    className="absolute left-1/2 top-full z-50 mt-4 w-[760px] -translate-x-1/2 rounded-3xl border border-gray-200 bg-white/95 shadow-[0_24px_70px_rgba(15,23,42,0.18)] backdrop-blur"
                    onMouseEnter={() => {
                      if (closeMenuTimeoutRef.current) {
                        window.clearTimeout(closeMenuTimeoutRef.current);
                        closeMenuTimeoutRef.current = null;
                      }
                    }}
                    onMouseLeave={() => {
                      closeMenuTimeoutRef.current = window.setTimeout(() => {
                        setIsPlatformMenuOpen(false);
                      }, 150);
                    }}
                  >
                    <div className="px-6 pt-6 pb-4">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
                          Explore GovSure
                        </p>
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                          6 focus areas
                        </span>
                      </div>
                      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                        {platformSections.map(section => {
                          const Icon = section.icon;
                          return (
                            <Link
                              key={section.id}
                              to={section.path}
                              onClick={() => setIsPlatformMenuOpen(false)}
                              className="group rounded-2xl border border-transparent bg-white/70 p-4 transition-all duration-200 hover:-translate-y-[2px] hover:border-blue-200 hover:bg-white hover:shadow-lg"
                            >
                              <div className="flex items-start gap-3">
                                <div className={`mt-0.5 inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${section.iconBg}`}>
                                  <Icon className={`h-5 w-5 ${section.iconClass}`} />
                                </div>
                                <div>
                                  <p className="text-base font-semibold text-gray-900">{section.title}</p>
                                  <p className="mt-1 text-sm text-gray-600 leading-snug">
                                    {section.summary}
                                  </p>
                                </div>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                    <div className="rounded-b-3xl border-t border-gray-100 bg-gray-50/70 px-6 py-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                        Tip
                      </p>
                      <p className="mt-1 text-sm text-gray-600">
                        Pick any module above to jump down the page to deep-dive content or open it inside the platform.
                      </p>
                    </div>
                  </div>
                )}
              </div>
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Features</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">Pricing</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-gray-900 transition-colors">How It Works</a>
              <Link to="/about" className="text-gray-600 hover:text-gray-900 transition-colors">About</Link>
              <Link to="/contact" className="text-gray-600 hover:text-gray-900 transition-colors font-semibold">Contact</Link>
              <Link to="/login" className="text-gray-600 hover:text-gray-900 transition-colors">Sign In</Link>
              <button
                onClick={() => setIsDemoModalOpen(true)}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all"
              >
                Book Demo
              </button>
            </div>
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(prev => !prev)}
              className="md:hidden inline-flex items-center justify-center p-2 rounded-xl text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              aria-label="Toggle navigation menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-gray-900/55" onClick={() => setIsMobileMenuOpen(false)}></div>
          <div className="relative bg-white h-full w-full pt-24 px-6 pb-16 overflow-y-auto">
            <nav className="space-y-6 text-lg">
              <a
                href="#features"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-gray-900 font-semibold"
              >
                Features
              </a>
              <a
                href="#pricing"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-gray-900 font-semibold"
              >
                Pricing
              </a>
              <a
                href="#how-it-works"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-gray-900 font-semibold"
              >
                How It Works
              </a>
              <Link
                to="/about"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-gray-900 font-semibold"
              >
                About
              </Link>
              <Link
                to="/contact"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-gray-900 font-semibold"
              >
                Contact
              </Link>
              <Link
                to="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-gray-900 font-semibold"
              >
                Sign In
              </Link>
            </nav>
            <div className="mt-10 rounded-2xl border border-gray-200 bg-gray-50/80 p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Platform Areas
              </p>
              <div className="mt-4 space-y-4">
                {platformSections.map(section => {
                  const Icon = section.icon;
                  return (
                    <Link
                      key={section.id}
                      to={section.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white/70 p-4 transition-all duration-200 hover:border-blue-200 hover:shadow-sm"
                    >
                      <div className={`inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${section.iconBg}`}>
                        <Icon className={`h-5 w-5 ${section.iconClass}`} />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{section.title}</p>
                        <p className="mt-1 text-sm text-gray-600">{section.summary}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
            <div className="mt-10 space-y-4">
              <Link
                to="/signup"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block w-full text-center py-3 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg"
              >
                Start Free Trial
              </Link>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsDemoModalOpen(true);
                }}
                className="block w-full text-center py-3 px-6 border-2 border-blue-600 text-blue-600 rounded-xl font-semibold"
              >
                Book Demo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="pt-28 md:pt-32 pb-16 px-4 sm:px-6 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        </div>

        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-blue-200 mb-8">
            <MessageSquare className="text-blue-600" size={16} />
            <span className="text-sm font-semibold text-gray-700">Get in Touch</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent">
              Contact Us
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Have questions? We're here to help. Send us a message and we'll get back to you as soon as possible.
          </p>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Send a message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Full name"
                    required
                    className="w-full px-4 py-3 border-b-2 border-gray-200 focus:border-blue-600 focus:outline-none text-gray-900 placeholder-gray-400 transition-colors"
                  />
                </div>
                <div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email address"
                    required
                    className="w-full px-4 py-3 border-b-2 border-gray-200 focus:border-blue-600 focus:outline-none text-gray-900 placeholder-gray-400 transition-colors"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="Subject"
                    required
                    className="w-full px-4 py-3 border-b-2 border-gray-200 focus:border-blue-600 focus:outline-none text-gray-900 placeholder-gray-400 transition-colors"
                  />
                </div>
                <div>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Phone number"
                    className="w-full px-4 py-3 border-b-2 border-gray-200 focus:border-blue-600 focus:outline-none text-gray-900 placeholder-gray-400 transition-colors"
                  />
                </div>
                <div>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Message"
                    required
                    rows={6}
                    className="w-full px-4 py-3 border-b-2 border-gray-200 focus:border-blue-600 focus:outline-none text-gray-900 placeholder-gray-400 transition-colors resize-y"
                  />
                </div>
                
                {submitStatus === 'success' && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-800 text-sm">Thank you! Your message has been sent successfully.</p>
                  </div>
                )}
                
                {submitStatus === 'error' && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-800 text-sm">Something went wrong. Please try again later.</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    'Sending...'
                  ) : (
                    <>
                      Send Message
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Contact Information */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Find us</h2>
              <div className="space-y-8">
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Our Location</h3>
                  <div className="flex items-center gap-3 text-gray-900">
                    <div className="w-6 h-6 flex items-center justify-center">
                      <span className="text-xl">🇺🇸</span>
                    </div>
                    <span className="text-lg">Washington, D.C.</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Email Address</h3>
                  <div className="flex items-center gap-3 text-gray-900">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <a href="mailto:info@govsureai.com" className="text-lg hover:text-blue-600 transition-colors">
                      info@govsureai.com
                    </a>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Live Chat</h3>
                  <div className="flex items-center gap-4">
                    <a
                      href="https://x.com/GovSureAI"
                      target="_blank"
                      rel="noreferrer noopener"
                      className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 hover:border-blue-400 hover:text-blue-400 transition-colors text-gray-400"
                      aria-label="Twitter"
                    >
                      <Twitter className="w-5 h-5" />
                    </a>
                    <a
                      href="https://www.youtube.com/@GovSureAI"
                      target="_blank"
                      rel="noreferrer noopener"
                      className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 hover:border-red-400 hover:text-red-400 transition-colors text-gray-400"
                      aria-label="YouTube"
                    >
                      <Youtube className="w-5 h-5" />
                    </a>
                    <a
                      href="https://www.linkedin.com/in/govsure-ai-5aa818391/"
                      target="_blank"
                      rel="noreferrer noopener"
                      className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 hover:border-blue-400 hover:text-blue-400 transition-colors text-gray-400"
                      aria-label="LinkedIn"
                    >
                      <Linkedin className="w-5 h-5" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <img 
                  src="/govsure-icon.svg" 
                  alt="GovSure" 
                  className="h-10 w-10"
                />
                <span className="text-white font-bold text-xl">GovSure</span>
              </div>
              <p className="text-sm">AI-powered government contracting platform</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white">Features</a></li>
                <li><a href="#pricing" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/about" className="hover:text-white">About</Link></li>
                <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/privacy" className="hover:text-white">Privacy</Link></li>
                <li><a href="#" className="hover:text-white">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2024 GovSure. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>

      {/* Demo Booking Modal */}
      <DemoBookingModal 
        isOpen={isDemoModalOpen} 
        onClose={() => setIsDemoModalOpen(false)} 
      />
      
      <FAQChatbot />
    </div>
  );
}

