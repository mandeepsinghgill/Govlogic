import { Link } from 'react-router-dom';
import { 
  Menu, X, Youtube, Linkedin, Twitter, ChevronDown, Shield, Lock
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

export default function PrivacyPolicy() {
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isPlatformMenuOpen, setIsPlatformMenuOpen] = useState(false);
  const closeMenuTimeoutRef = useRef<number | null>(null);
  const platformMenuRef = useRef<HTMLDivElement | null>(null);

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
            <Shield className="text-blue-600" size={16} />
            <span className="text-sm font-semibold text-gray-700">Privacy & Security</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent">
              Privacy Policy
            </span>
          </h1>
          <p className="text-sm text-gray-500 mb-4">Last Updated: November 12, 2025</p>
        </div>
      </section>

      {/* Privacy Policy Content */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="prose prose-lg max-w-none">
            {/* Overview */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <div className="w-1 h-12 bg-gradient-to-b from-blue-600 to-indigo-600 rounded"></div>
                1. Overview
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Govsure ("we," "our," or "us") provides secure technology solutions designed for government and enterprise environments. This Privacy Policy explains how we collect, use, share, and protect personal information when you visit our website or use Govsure's products and services.
              </p>
              <p className="text-gray-700 leading-relaxed">
                We are committed to being transparent about our practices and giving you control over your data.
              </p>
            </div>

            <div className="border-t border-gray-200 my-12"></div>

            {/* Information We Collect */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <div className="w-1 h-12 bg-gradient-to-b from-blue-600 to-indigo-600 rounded"></div>
                2. Information We Collect
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We only collect information that's necessary to provide our services, improve performance, and ensure security. The types of information we collect include:
              </p>
              <ul className="list-none space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <strong className="text-gray-900">Account Information:</strong> Name, email address, organization name, and login credentials when you register or use Govsure products.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <strong className="text-gray-900">Usage Data:</strong> How you interact with our platform — such as features used, pages visited, device and browser type, and timestamps.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <strong className="text-gray-900">Billing Details:</strong> Payment-related data (handled securely by our payment processors), billing name, and address.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <strong className="text-gray-900">Support & Communication:</strong> Any messages, feedback, or attachments you share with our support team.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <strong className="text-gray-900">Public Data Sources:</strong> When you connect Govsure to public or government datasets, we process that data according to your authorization.
                  </div>
                </li>
              </ul>
            </div>

            <div className="border-t border-gray-200 my-12"></div>

            {/* How We Use Information */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <div className="w-1 h-12 bg-gradient-to-b from-blue-600 to-indigo-600 rounded"></div>
                3. How We Use Information
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We use your information to deliver reliable, secure, and personalized services. Specifically, we use it to:
              </p>
              <ul className="list-none space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700">Operate and maintain Govsure's services.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700">Authenticate users and manage accounts.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700">Process billing and prevent fraud.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700">Provide product updates, notifications, and support.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700">Analyze performance to improve our platform.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700">Comply with legal requirements and enforce our terms of service.</span>
                </li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4 font-semibold">
                We do not use your data for advertising or sell it to third parties.
              </p>
            </div>

            <div className="border-t border-gray-200 my-12"></div>

            {/* Cookies */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <div className="w-1 h-12 bg-gradient-to-b from-blue-600 to-indigo-600 rounded"></div>
                4. Cookies and Tracking Technologies
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Govsure uses cookies and similar technologies to enable essential functionality like authentication, session management, and analytics.
              </p>
              <ul className="list-none space-y-3 mb-4">
                <li className="flex items-start gap-3">
                  <Lock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong className="text-gray-900">Essential Cookies:</strong> Required for login and platform stability.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Lock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong className="text-gray-900">Analytics Cookies:</strong> Help us understand usage patterns and improve performance.
                  </div>
                </li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                You can adjust your browser settings or cookie preferences to control or disable non-essential tracking. Some features may not function properly if cookies are disabled.
              </p>
            </div>

            <div className="border-t border-gray-200 my-12"></div>

            {/* Sharing */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <div className="w-1 h-12 bg-gradient-to-b from-blue-600 to-indigo-600 rounded"></div>
                5. Sharing and Third Parties
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4 font-semibold">
                We do not sell your personal information.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                We may share limited data only when necessary:
              </p>
              <ul className="list-none space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <strong className="text-gray-900">With Service Providers:</strong> Such as payment processors, hosting partners, and analytics vendors — strictly to perform services on our behalf.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <strong className="text-gray-900">For Legal Reasons:</strong> When required by law, or to protect the rights and safety of Govsure, our users, or the public.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <strong className="text-gray-900">In Business Changes:</strong> Such as a merger or acquisition, with appropriate notice provided to affected users.
                  </div>
                </li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                All partners are required to maintain strong privacy and security standards.
              </p>
            </div>

            <div className="border-t border-gray-200 my-12"></div>

            {/* Data Security */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <div className="w-1 h-12 bg-gradient-to-b from-blue-600 to-indigo-600 rounded"></div>
                6. Data Security
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Govsure uses industry-standard encryption, access controls, and monitoring systems to protect your data.
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                While no system is completely immune from risk, we continually review and update our security measures. If we ever identify a breach that affects your data, we'll notify you as required by law.
              </p>
            </div>

            <div className="border-t border-gray-200 my-12"></div>

            {/* Your Rights */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <div className="w-1 h-12 bg-gradient-to-b from-blue-600 to-indigo-600 rounded"></div>
                7. Your Rights
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Depending on your jurisdiction, you may have the right to:
              </p>
              <ul className="list-none space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700">Access a copy of your data.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700">Correct inaccurate information.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700">Request deletion of your data.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700">Object to certain processing activities.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700">Export your data to another service.</span>
                </li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                To make a request, email <a href="mailto:privacy@govsure.ai" className="text-blue-600 hover:underline">privacy@govsure.ai</a>.
              </p>
              <p className="text-gray-700 leading-relaxed mt-2">
                We verify all requests to prevent unauthorized disclosure.
              </p>
            </div>

            <div className="border-t border-gray-200 my-12"></div>

            {/* Data Retention */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <div className="w-1 h-12 bg-gradient-to-b from-blue-600 to-indigo-600 rounded"></div>
                8. Data Retention
              </h2>
              <p className="text-gray-700 leading-relaxed">
                We keep personal data only as long as needed to provide our services, comply with legal obligations, resolve disputes, and enforce agreements.
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                When data is no longer required, we securely delete or anonymize it.
              </p>
            </div>

            <div className="border-t border-gray-200 my-12"></div>

            {/* Children's Privacy */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <div className="w-1 h-12 bg-gradient-to-b from-blue-600 to-indigo-600 rounded"></div>
                9. Children's Privacy
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Govsure is designed for professional and governmental use.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                We do not knowingly collect information from individuals under 16 years of age.
              </p>
              <p className="text-gray-700 leading-relaxed">
                If you believe a child has provided personal data to us, please contact us immediately so we can take corrective action.
              </p>
            </div>

            <div className="border-t border-gray-200 my-12"></div>

            {/* Updates */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <div className="w-1 h-12 bg-gradient-to-b from-blue-600 to-indigo-600 rounded"></div>
                10. Updates to This Policy
              </h2>
              <p className="text-gray-700 leading-relaxed">
                We may revise this Privacy Policy periodically. Any significant changes will be communicated through email or on our website.
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                The "Last Updated" date at the top of this document reflects the most recent revision.
              </p>
            </div>

            <div className="border-t border-gray-200 my-12"></div>

            {/* Contact */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <div className="w-1 h-12 bg-gradient-to-b from-blue-600 to-indigo-600 rounded"></div>
                11. Contact Us
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                For any privacy-related questions, concerns, or data requests, please contact:
              </p>
              <div className="bg-blue-50 rounded-xl p-6 space-y-3">
                <p className="text-gray-700">
                  <strong className="text-gray-900">Email:</strong> <a href="mailto:privacy@govsure.ai" className="text-blue-600 hover:underline">privacy@govsure.ai</a>
                </p>
                <p className="text-gray-700">
                  <strong className="text-gray-900">Address:</strong> Govsure, 1 Civic Plaza (example), Your City, Country
                </p>
                <p className="text-gray-700">
                  <strong className="text-gray-900">Data Protection Officer:</strong> Available upon request for enterprise customers.
                </p>
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
                <li><a href="https://blog.govsureai.com" target="_blank" rel="noopener noreferrer" className="hover:text-white">Blog</a></li>
                <li><Link to="/careers" className="hover:text-white">Careers</Link></li>
                <li><Link to="/fractional-bd" className="hover:text-white">Fractional BD</Link></li>
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

