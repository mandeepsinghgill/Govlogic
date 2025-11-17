import { Link, useLocation } from 'react-router-dom';
import { ChevronDown, Menu, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { platformSections } from '../content/platformSections';

type NavigationProps = {
  onBookDemoClick?: () => void;
  variant?: 'fixed' | 'sticky';
};

const BOOK_DEMO_URL = 'https://calendly.com/govsure/demo';

export default function Navigation({ onBookDemoClick, variant = 'sticky' }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isPlatformMenuOpen, setIsPlatformMenuOpen] = useState(false);
  const closeMenuTimeoutRef = useRef<number | null>(null);
  const platformMenuRef = useRef<HTMLDivElement | null>(null);
  const { pathname } = useLocation();
  const isOnLanding = pathname === '/';

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const handleBookDemo = () => {
    if (onBookDemoClick) {
      onBookDemoClick();
    } else {
      window.open(BOOK_DEMO_URL, '_blank', 'noreferrer noopener');
    }
    setIsMobileMenuOpen(false);
  };

  const navLinks = [
    { label: 'Features', hash: '#features' },
    { label: 'Pricing', hash: '#pricing' },
    { label: 'How It Works', hash: '#how-it-works' },
  ] as const;

  const navContainerClass =
    variant === 'fixed'
      ? 'fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-200 z-50'
      : 'sticky top-0 w-full bg-white/90 backdrop-blur border-b border-gray-200 z-40';

  const renderNavLink = (
    label: string,
    hash: string,
    className = 'text-gray-600 hover:text-gray-900 transition-colors',
    onClick?: () => void
  ) => {
    if (isOnLanding) {
      return (
        <a href={hash} className={className} onClick={onClick}>
          {label}
        </a>
      );
    }
    return (
      <Link to={`/${hash}`} className={className} onClick={onClick}>
        {label}
      </Link>
    );
  };

  return (
    <>
      <nav className={navContainerClass}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <img src="/govsure-logo.png" alt="GovSure" className="h-auto" style={{ width: '150px' }} />
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
                    setIsPlatformMenuOpen((prev) => !prev);
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
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">Explore GovSure</p>
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                          6 focus areas
                        </span>
                      </div>
                      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                        {platformSections.map((section) => {
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
                                  <p className="mt-1 text-sm text-gray-600 leading-snug">{section.summary}</p>
                                </div>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                    <div className="rounded-b-3xl border-t border-gray-100 bg-gray-50/70 px-6 py-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Tip</p>
                      <p className="mt-1 text-sm text-gray-600">
                        Pick any module above to jump down the page to deep-dive content or open it inside the platform.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {navLinks.map((link) => (
                <div key={link.label}>{renderNavLink(link.label, link.hash)}</div>
              ))}
              <Link to="/case-studies" className="text-gray-600 hover:text-gray-900 transition-colors">
                Case Studies
              </Link>
              <Link to="/login" className="text-gray-600 hover:text-gray-900 transition-colors">
                Log in
              </Link>
              <button
                onClick={handleBookDemo}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all"
              >
                Book Demo
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
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
              {navLinks.map((link) => (
                <div key={link.label}>
                  {renderNavLink(
                    link.label,
                    link.hash,
                    'block text-gray-900 font-semibold',
                    () => setIsMobileMenuOpen(false)
                  )}
                </div>
              ))}
              <Link
                to="/case-studies"
                className="block text-gray-900 font-semibold"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Case Studies
              </Link>
              <Link
                to="/login"
                className="block text-gray-900 font-semibold"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Log in
              </Link>
              <button
                onClick={handleBookDemo}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                Book Demo
              </button>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
