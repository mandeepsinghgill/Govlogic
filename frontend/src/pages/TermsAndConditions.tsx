import { Link } from 'react-router-dom';
import { 
  ArrowRight, Menu, X, Youtube, Linkedin, Twitter, Sparkles, ChevronDown
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

type SocialLink = {
  name: string;
  href: string;
  Icon: React.ComponentType<{ className?: string }>;
  hoverClass: string;
};

export default function TermsAndConditions() {
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isPlatformMenuOpen, setIsPlatformMenuOpen] = useState(false);
  const closeMenuTimeoutRef = useRef<number | null>(null);
  const platformMenuRef = useRef<HTMLDivElement | null>(null);

  const socialLinks: SocialLink[] = [
    {
      name: 'LinkedIn',
      href: 'https://www.linkedin.com/in/govsure-ai-5aa818391/',
      Icon: Linkedin,
      hoverClass: 'hover:text-blue-400 hover:border-blue-400/40'
    },
    {
      name: 'X (Twitter)',
      href: 'https://x.com/GovSureAI',
      Icon: Twitter,
      hoverClass: 'hover:text-indigo-400 hover:border-indigo-400/40'
    },
    {
      name: 'Facebook',
      href: 'https://www.facebook.com/GovSureAI',
      Icon: FacebookIcon,
      hoverClass: 'hover:text-blue-500 hover:border-blue-500/40'
    },
    {
      name: 'YouTube',
      href: 'https://www.youtube.com/@GovSureAI',
      Icon: Youtube,
      hoverClass: 'hover:text-red-400 hover:border-red-400/40'
    }
  ];

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
      <section className="pt-28 md:pt-32 pb-20 px-4 sm:px-6 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        </div>

        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-blue-200 mb-8">
            <Sparkles className="text-blue-600" size={16} />
            <span className="text-sm font-semibold text-gray-700">Legal Information</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent">
              Govsure Terms & Conditions
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Last Updated: November 12, 2025
          </p>
        </div>
      </section>

      {/* Terms Content Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 leading-relaxed mb-8">
              These Terms and Conditions ("Terms") govern your access to and use of the Govsure website and related products or services ("Services"). By accessing or using any part of Govsure's platform, you agree to comply with these Terms.
            </p>
            <p className="text-gray-700 leading-relaxed mb-12">
              If you do not agree with any portion of these Terms, you must not access or use Govsure's Services.
            </p>

            <div className="border-t border-gray-200 pt-8 mb-8">
              <div className="text-center text-gray-400 mb-8">⸻</div>
            </div>

            {/* Section 1 */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">1. Acceptance of Terms</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                By visiting or using Govsure, you acknowledge that you have read, understood, and agree to be bound by these Terms, including any updates or additional policies referenced herein.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Govsure may, from time to time, publish supplementary terms for specific features, which will form part of your agreement when you use those features.
              </p>
            </div>

            <div className="border-t border-gray-200 pt-8 mb-8">
              <div className="text-center text-gray-400 mb-8">⸻</div>
            </div>

            {/* Section 2 */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">2. Use of Services</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Govsure grants you a limited, non-exclusive, non-transferable, revocable license to use the Services in accordance with these Terms and applicable laws.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">You agree not to:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
                <li>Use Govsure for any unlawful, fraudulent, or harmful purpose.</li>
                <li>Access, tamper with, or use non-public areas of the platform or servers without authorization.</li>
                <li>Attempt to gain unauthorized access to other users' accounts or Govsure's systems.</li>
                <li>Use automated scraping, bots, or similar data-mining methods without written consent.</li>
                <li>Interfere with or disrupt Govsure's operations, networks, or security systems.</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                Violation of these conditions may result in immediate suspension or termination of access.
              </p>
            </div>

            <div className="border-t border-gray-200 pt-8 mb-8">
              <div className="text-center text-gray-400 mb-8">⸻</div>
            </div>

            {/* Section 3 */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">3. Privacy</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Your use of Govsure is governed by our Privacy Policy, which outlines how we collect, use, and safeguard your data.
              </p>
              <p className="text-gray-700 leading-relaxed">
                By using our Services, you consent to Govsure's data practices as described in that policy.
              </p>
            </div>

            <div className="border-t border-gray-200 pt-8 mb-8">
              <div className="text-center text-gray-400 mb-8">⸻</div>
            </div>

            {/* Section 4 */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">4. User Accounts</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Some areas of Govsure require registration. When creating an account, you agree to:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
                <li>Provide accurate, current, and complete information.</li>
                <li>Maintain the confidentiality of your login credentials.</li>
                <li>Accept full responsibility for all activity that occurs under your account.</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                Govsure reserves the right to suspend or terminate accounts that provide false information or engage in unauthorized use.
              </p>
            </div>

            <div className="border-t border-gray-200 pt-8 mb-8">
              <div className="text-center text-gray-400 mb-8">⸻</div>
            </div>

            {/* Section 5 */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">5. Disclaimer of Warranties</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Govsure's platform, including all tools, materials, and content, is provided on an "as is" and "as available" basis.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">We make no warranties or representations, express or implied, regarding:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
                <li>The accuracy or reliability of information;</li>
                <li>Uninterrupted or error-free operation;</li>
                <li>The absence of viruses or harmful components.</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                To the fullest extent permitted by law, Govsure disclaims all implied warranties, including but not limited to merchantability, fitness for a particular purpose, and non-infringement.
              </p>
            </div>

            <div className="border-t border-gray-200 pt-8 mb-8">
              <div className="text-center text-gray-400 mb-8">⸻</div>
            </div>

            {/* Section 6 */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">6. Limitation of Liability</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                To the maximum extent permitted by law, Govsure, its affiliates, officers, employees, and agents shall not be liable for any indirect, incidental, special, or consequential damages, including but not limited to:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
                <li>Loss of revenue, data, or profits;</li>
                <li>Business interruption;</li>
                <li>Damages arising from unauthorized access or use.</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                This limitation applies even if Govsure has been advised of the possibility of such damages.
              </p>
            </div>

            <div className="border-t border-gray-200 pt-8 mb-8">
              <div className="text-center text-gray-400 mb-8">⸻</div>
            </div>

            {/* Section 7 */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">7. Intellectual Property</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                All content, designs, software, documentation, and branding available through Govsure are owned by Govsure or its licensors and are protected under applicable copyright, trademark, and intellectual property laws.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                You may not copy, reproduce, modify, distribute, or publicly display any material from Govsure without express written permission.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Unauthorized use of Govsure's intellectual property may lead to legal action.
              </p>
            </div>

            <div className="border-t border-gray-200 pt-8 mb-8">
              <div className="text-center text-gray-400 mb-8">⸻</div>
            </div>

            {/* Section 8 */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">8. Ownership of User Content</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                All materials, files, and data created or uploaded by users ("User Content") while using Govsure remain your property.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                By using the platform, you grant Govsure a limited, non-exclusive, and revocable license to host, process, and display your content solely for:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
                <li>Operating and improving our Services;</li>
                <li>Providing technical support;</li>
                <li>Ensuring security and system integrity.</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                Govsure will never sell or use your content for unrelated commercial purposes and will comply with applicable data protection laws.
              </p>
            </div>

            <div className="border-t border-gray-200 pt-8 mb-8">
              <div className="text-center text-gray-400 mb-8">⸻</div>
            </div>

            {/* Section 9 */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">9. Third-Party Links and Integrations</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Govsure may include links or integrations with third-party services. These are provided for your convenience and do not imply endorsement.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                Govsure is not responsible for the content, privacy practices, or policies of third-party websites.
              </p>
              <p className="text-gray-700 leading-relaxed">
                We encourage users to review third-party terms before engaging with external platforms.
              </p>
            </div>

            <div className="border-t border-gray-200 pt-8 mb-8">
              <div className="text-center text-gray-400 mb-8">⸻</div>
            </div>

            {/* Section 10 */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">10. Modifications to Terms</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Govsure reserves the right to modify these Terms at any time. Updates will take effect immediately upon posting on our website.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                By continuing to use Govsure after changes become effective, you accept the revised Terms.
              </p>
              <p className="text-gray-700 leading-relaxed">
                We recommend reviewing this page periodically for the latest version.
              </p>
            </div>

            <div className="border-t border-gray-200 pt-8 mb-8">
              <div className="text-center text-gray-400 mb-8">⸻</div>
            </div>

            {/* Section 11 */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">11. Subscription and Payments</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Certain features of Govsure require a subscription. By subscribing, you agree to:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
                <li>Provide accurate billing details and valid payment information.</li>
                <li>Authorize Govsure to charge your payment method for recurring fees.</li>
                <li>Manage your subscription responsibly, including cancellation before renewal if desired.</li>
              </ul>
              
              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Renewals:</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Subscriptions automatically renew unless canceled before the renewal date.
              </p>
              
              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Free Trial:</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                New users may be eligible for a trial period. At the end of the trial, billing will commence automatically unless canceled.
              </p>
              
              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Refunds:</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                New subscribers (excluding enterprise customers) may request a refund within 30 days of their initial purchase. Refunds are reviewed individually and not guaranteed.
              </p>
              <p className="text-gray-700 leading-relaxed">
                After the initial period, all payments are non-refundable. Govsure may adjust pricing or subscription plans, with changes applying to the next billing cycle.
              </p>
            </div>

            <div className="border-t border-gray-200 pt-8 mb-8">
              <div className="text-center text-gray-400 mb-8">⸻</div>
            </div>

            {/* Section 12 */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">12. Termination</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Govsure reserves the right to suspend or terminate your account, with or without notice, if:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
                <li>You violate these Terms;</li>
                <li>Your use threatens platform security or other users; or</li>
                <li>Required by law or government authority.</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                Upon termination, your license to use the Services ends immediately.
              </p>
            </div>

            <div className="border-t border-gray-200 pt-8 mb-8">
              <div className="text-center text-gray-400 mb-8">⸻</div>
            </div>

            {/* Section 13 */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">13. Governing Law</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                These Terms are governed by the laws of the jurisdiction in which Govsure operates, without regard to conflict of law principles.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Any disputes shall be resolved exclusively in the competent courts of that jurisdiction.
              </p>
            </div>

            <div className="border-t border-gray-200 pt-8 mb-8">
              <div className="text-center text-gray-400 mb-8">⸻</div>
            </div>

            {/* Section 14 */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">14. Indemnification</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                You agree to indemnify and hold harmless Govsure, its affiliates, and their officers, employees, and agents from and against any claims, damages, losses, or expenses (including attorney's fees) arising out of:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
                <li>Your violation of these Terms;</li>
                <li>Misuse of the platform;</li>
                <li>Infringement of any rights of another party.</li>
              </ul>
            </div>

            <div className="border-t border-gray-200 pt-8 mb-8">
              <div className="text-center text-gray-400 mb-8">⸻</div>
            </div>

            {/* Section 15 */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">15. Contact Information</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                For questions regarding these Terms, please contact:
              </p>
              <div className="bg-gray-50 rounded-lg p-6 mt-4">
                <p className="text-gray-700 mb-2">
                  <strong>Email:</strong> <a href="mailto:info@govsure.ai" className="text-blue-600 hover:underline">info@govsure.ai</a>
                </p>
                <p className="text-gray-700">
                  <strong>Address:</strong> Govsure, 1 Civic Plaza (example), Your City, Country
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-10 text-blue-100">
            Join hundreds of government contractors using GovSure AI to win more contracts
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="inline-flex items-center justify-center px-10 py-4 bg-white text-blue-600 rounded-xl font-semibold text-lg hover:shadow-2xl hover:scale-105 transition-all"
            >
              Start Your Free Trial
              <ArrowRight className="ml-2" size={20} />
            </Link>
            <Link
              to="/"
              className="inline-flex items-center justify-center px-10 py-4 bg-transparent border-2 border-white text-white rounded-xl font-semibold text-lg hover:bg-white hover:text-blue-600 hover:shadow-2xl hover:scale-105 transition-all"
            >
              Learn More
            </Link>
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
              <div className="mt-6 flex items-center gap-3">
                {socialLinks.map(link => (
                  <a
                    key={link.name}
                    href={link.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label={`GovSure on ${link.name}`}
                    className={`inline-flex h-11 w-11 items-center justify-center rounded-full border border-gray-800 bg-gray-800/40 text-gray-300 transition-all duration-200 hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 ${link.hoverClass}`}
                  >
                    <link.Icon className="h-5 w-5" aria-hidden="true" />
                  </a>
                ))}
              </div>
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
                <li><a href="https://blog.govsureai.com" target="_blank" rel="noopener noreferrer" className="hover:text-white">Blog</a></li>
                <li><Link to="/careers" className="hover:text-white">Careers</Link></li>
                <li><Link to="/fractional-bd" className="hover:text-white">Fractional BD</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Privacy</a></li>
                <li><Link to="/terms" className="hover:text-white">Terms</Link></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
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

