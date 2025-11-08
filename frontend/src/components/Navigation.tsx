import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

export default function Navigation() {
  const [featuresOpen, setFeaturesOpen] = useState(false);

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img 
              src="/govsure-logo.png" 
              alt="GovSure" 
              className="h-10 w-auto"
            />
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <div className="relative group">
              <button 
                className="flex items-center space-x-1 text-gray-700 hover:text-blue-900 font-medium transition-colors"
                onMouseEnter={() => setFeaturesOpen(true)}
                onMouseLeave={() => setFeaturesOpen(false)}
              >
                <span>Features</span>
                <ChevronDown size={16} />
              </button>
              
              {/* Dropdown */}
              {featuresOpen && (
                <div 
                  className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-xl py-2 border border-gray-100"
                  onMouseEnter={() => setFeaturesOpen(true)}
                  onMouseLeave={() => setFeaturesOpen(false)}
                >
                  <Link to="/features" className="block px-4 py-3 hover:bg-gray-50 transition-colors">
                    <p className="font-medium text-gray-900">All Features</p>
                    <p className="text-xs text-gray-500">Complete platform overview</p>
                  </Link>
                  <Link to="/features#opportunities" className="block px-4 py-3 hover:bg-gray-50 transition-colors">
                    <p className="font-medium text-gray-900">Opportunity Intelligence</p>
                    <p className="text-xs text-gray-500">AI-powered contract discovery</p>
                  </Link>
                  <Link to="/features#proposals" className="block px-4 py-3 hover:bg-gray-50 transition-colors">
                    <p className="font-medium text-gray-900">Proposal Writer</p>
                    <p className="text-xs text-gray-500">Generate winning proposals</p>
                  </Link>
                  <Link to="/features#capture" className="block px-4 py-3 hover:bg-gray-50 transition-colors">
                    <p className="font-medium text-gray-900">Capture Management</p>
                    <p className="text-xs text-gray-500">Track pursuits end-to-end</p>
                  </Link>
                </div>
              )}
            </div>

            <Link to="/how-it-works" className="text-gray-700 hover:text-blue-900 font-medium transition-colors">
              How It Works
            </Link>

            <Link to="/pricing" className="text-gray-700 hover:text-blue-900 font-medium transition-colors">
              Pricing
            </Link>

            <Link to="/case-studies" className="text-gray-700 hover:text-blue-900 font-medium transition-colors">
              Case Studies
            </Link>
          </div>

          {/* CTA Buttons */}
          <div className="flex items-center space-x-4">
            <Link
              to="/login"
              className="text-blue-900 hover:text-blue-700 font-medium transition-colors"
            >
              Log in
            </Link>
            <a
              href="https://calendly.com/govsure/demo"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-2 bg-blue-900 text-white rounded-lg font-semibold hover:bg-blue-800 transition-all transform hover:scale-105 shadow-md"
            >
              BOOK DEMO
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}

