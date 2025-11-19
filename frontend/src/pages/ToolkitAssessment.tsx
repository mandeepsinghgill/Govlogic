import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle,
  Compass,
  Handshake,
  FileText,
  BookOpen,
  BarChart3,
  Search,
  Target,
  Zap,
  Shield,
  Users,
  Download,
  PlayCircle,
  Star,
  Award,
} from 'lucide-react';
import { useState } from 'react';
import Navigation from '../components/Navigation';
import DemoBookingModal from '../components/DemoBookingModal';
import FAQChatbot from '../components/FAQChatbot';

export default function ToolkitAssessment() {
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  const toolkitItems = [
    {
      icon: <Compass className="w-8 h-8" />,
      title: 'Federal Acquisition Regulation Navigator',
      description:
        'Navigate complex federal procurement regulations with intelligent search and contextual guidance. Access updated FAR clauses, understand compliance requirements, and track regulatory changes in real-time.',
      benefits: [
        'Quickly locate relevant FAR sections and clauses',
        'Understand compliance implications for your contracts',
        'Stay updated on regulatory changes and amendments',
      ],
      ctaText: 'Explore FAR Navigator',
      gradient: 'from-blue-600 to-cyan-600',
    },
    {
      icon: <Handshake className="w-8 h-8" />,
      title: 'Federal Contractor Directory & Research',
      description:
        'Discover potential teaming partners, analyze competitor capabilities, and research award histories across federal databases. Build strategic partnerships with data-driven insights.',
      benefits: [
        'Identify prime and subcontractor opportunities',
        'Review historical contract awards and performance',
        'Research competitor capabilities and past performance',
      ],
      ctaText: 'Search Contractors',
      gradient: 'from-purple-600 to-pink-600',
    },
    {
      icon: <FileText className="w-8 h-8" />,
      title: 'Professional Capability Statement Generator',
      description:
        'Create polished, agency-specific capability statements that highlight your company\'s strengths. Customize templates with your credentials, past performance, and core competencies.',
      benefits: [
        'Generate agency-tailored capability statements',
        'Showcase your qualifications and past performance',
        'Export in multiple formats for easy distribution',
      ],
      ctaText: 'Build Capability Statement',
      gradient: 'from-green-600 to-emerald-600',
    },
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: 'Government Contracting Knowledge Hub',
      description:
        'Access expert insights, best practices, and industry intelligence to enhance your contracting success. Learn from proven strategies and stay ahead of market trends.',
      benefits: [
        'Learn winning strategies from successful contractors',
        'Stay current on industry trends and best practices',
        'Access compliance guides and regulatory updates',
      ],
      ctaText: 'Visit Knowledge Hub',
      gradient: 'from-orange-600 to-red-600',
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: 'Small Business Set-Aside Opportunity Finder',
      description:
        'Discover set-aside programs and small business contracting opportunities across federal agencies. Filter by business type, NAICS codes, and agency preferences.',
      benefits: [
        'Find relevant set-aside programs for your business',
        'View market data and opportunity trends',
        'Track upcoming solicitations in your target areas',
      ],
      ctaText: 'Browse Set-Asides',
      gradient: 'from-indigo-600 to-purple-600',
    },
    {
      icon: <Search className="w-8 h-8" />,
      title: 'NAICS Code Finder & Market Intelligence',
      description:
        'Identify the right NAICS codes for your services and explore market opportunities. Access spending trends, competitor analysis, and procurement forecasts.',
      benefits: [
        'Find accurate NAICS codes for your offerings',
        'Analyze market size and spending trends',
        'Discover opportunities aligned with your capabilities',
      ],
      ctaText: 'Find NAICS Codes',
      gradient: 'from-teal-600 to-blue-600',
    },
  ];

  const features = [
    {
      icon: <Target className="w-6 h-6" />,
      title: 'Complete Contract Database',
      description: 'Access federal, state, and local opportunities in one unified platform',
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'AI-Powered Proposal Assistant',
      description: 'Generate winning proposals faster with intelligent content suggestions',
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Real-Time Opportunity Alerts',
      description: 'Never miss a relevant opportunity with automated notifications',
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'End-to-End Pursuit Management',
      description: 'Track every opportunity from discovery to award with comprehensive tools',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navigation variant="sticky" />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-950 via-blue-900 to-indigo-900 text-white pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-block px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-6 border border-white/20">
              <span className="text-sm font-semibold">Comprehensive Toolkit</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Free Government Contracting Resources
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 leading-relaxed">
              Empower your contracting business with professional-grade tools, templates, and resources. 
              Everything you need to navigate federal procurement, build winning proposals, and grow your 
              government revenue—all available at no cost.
            </p>
            <div className="flex flex-wrap justify-center gap-4 items-center">
              <button
                onClick={() => setIsDemoModalOpen(true)}
                className="px-8 py-4 bg-white text-blue-900 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-all duration-300 inline-flex items-center space-x-2 shadow-lg"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <Link
                to="/signup"
                className="px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white rounded-lg font-semibold text-lg hover:bg-white/20 transition-all duration-300 inline-flex items-center justify-center"
              >
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Toolkit Grid Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Your Complete Toolkit</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Six powerful resources designed to streamline your government contracting workflow
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {toolkitItems.map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-gray-200 flex flex-col"
              >
                {/* Icon Header */}
                <div className={`bg-gradient-to-br ${item.gradient} p-8 flex items-center justify-center`}>
                  <div className="text-white">{item.icon}</div>
                </div>

                {/* Content - flex-1 to push button to bottom */}
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed flex-shrink-0">{item.description}</p>

                  <div className="mb-6 flex-shrink-0">
                    <p className="text-sm font-semibold text-gray-900 mb-3">
                      This resource helps you:
                    </p>
                    <ul className="space-y-2">
                      {item.benefits.map((benefit, idx) => (
                        <li key={idx} className="flex items-start space-x-2">
                          <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Button at bottom - mt-auto pushes it down */}
                  <div className="mt-auto pt-4">
                    {item.ctaText === 'Explore FAR Navigator' ? (
                      <Link
                        to="/far-navigator/1"
                        className={`block w-full py-3 bg-gradient-to-r ${item.gradient} text-white rounded-lg font-semibold hover:opacity-90 transition-all duration-300 text-center`}
                      >
                        <span className="flex items-center justify-center space-x-2">
                          <span>{item.ctaText}</span>
                          <ArrowRight className="w-5 h-5" />
                        </span>
                      </Link>
                    ) : (
                      <button
                        onClick={() => setIsDemoModalOpen(true)}
                        className={`w-full py-3 bg-gradient-to-r ${item.gradient} text-white rounded-lg font-semibold hover:opacity-90 transition-all duration-300 flex items-center justify-center space-x-2`}
                      >
                        <span>{item.ctaText}</span>
                        <ArrowRight className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Use Our Toolkit?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Professional resources built specifically for government contractors
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Getting Started is Simple</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Three easy steps to access your complete toolkit
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white rounded-xl p-8 text-center shadow-lg">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Create Your Account</h3>
              <p className="text-gray-600">
                Sign up for free—no credit card required. Get instant access to all tools and resources.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 text-center shadow-lg">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-indigo-600">2</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Explore the Tools</h3>
              <p className="text-gray-600">
                Browse our library of resources. Each tool includes guides and best practices.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 text-center shadow-lg">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">3</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Start Winning Contracts</h3>
              <p className="text-gray-600">
                Use professional templates and tools to enhance your proposals and pursue opportunities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm uppercase tracking-wider text-blue-200 mb-4">Ready to Elevate Your Contracting?</p>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Access Federal, State & Local Contracts with Advanced AI Tools
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Go beyond free tools with our comprehensive platform. Access all resources plus AI-powered features 
            that help you win more contracts.
          </p>

          <div className="grid md:grid-cols-2 gap-4 mb-10 max-w-2xl mx-auto">
            {[
              'Comprehensive contract opportunity database',
              'AI-enhanced proposal generation and optimization',
              'Real-time alerts for matching opportunities',
              'Complete pursuit lifecycle management',
            ].map((feature, index) => (
              <div key={index} className="flex items-start space-x-3 text-left">
                <CheckCircle className="w-6 h-6 text-green-400 mt-1 flex-shrink-0" />
                <span className="text-lg leading-relaxed">{feature}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/signup"
              className="inline-flex items-center justify-center px-10 py-4 bg-gradient-to-r from-pink-600 to-red-600 text-white rounded-lg font-semibold text-lg hover:from-pink-700 hover:to-red-700 transition-all duration-300 shadow-xl min-h-[56px]"
            >
              Start Free Trial
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <button
              onClick={() => setIsDemoModalOpen(true)}
              className="inline-flex items-center justify-center px-10 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white rounded-lg font-semibold text-lg hover:bg-white/20 transition-all duration-300 min-h-[56px]"
            >
              <PlayCircle className="mr-2 w-5 h-5" />
              Schedule Demo
            </button>
          </div>

          <div className="mt-10 flex items-center justify-center space-x-4">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 border-2 border-white flex items-center justify-center text-white font-semibold"
                >
                  {String.fromCharCode(64 + i)}
                </div>
              ))}
            </div>
            <p className="text-blue-200">
              <span className="font-semibold text-white">500+</span> contractors already using GovSure
            </p>
          </div>
        </div>
      </section>

      {/* Additional Resources Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-10 border border-gray-200">
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div>
                <div className="inline-block px-4 py-2 bg-blue-100 rounded-full mb-4">
                  <span className="text-sm font-semibold text-blue-700">Bonus Resources</span>
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-4">Additional Value Included</h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-center space-x-3">
                    <Download className="w-5 h-5 text-blue-600" />
                    <span>Business development meeting agenda templates</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Zap className="w-5 h-5 text-blue-600" />
                    <span>AI prompt library for opportunities, proposals, and pricing</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Target className="w-5 h-5 text-blue-600" />
                    <span>30-day pipeline acceleration checklist</span>
                  </li>
                </ul>
              </div>
              <div className="space-y-4">
                <div className="bg-white rounded-xl p-6 shadow-md">
                  <div className="flex items-center space-x-3 mb-2">
                    <FileText className="w-6 h-6 text-indigo-600" />
                    <h4 className="font-semibold text-gray-900">Multiple Formats</h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    Available in Google Sheets, Excel, Notion, and PDF formats for maximum flexibility.
                  </p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-md">
                  <div className="flex items-center space-x-3 mb-2">
                    <Star className="w-6 h-6 text-yellow-500" />
                    <h4 className="font-semibold text-gray-900">Regular Updates</h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    New resources and templates added monthly. Your access link automatically updates.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <FAQChatbot />
      <DemoBookingModal isOpen={isDemoModalOpen} onClose={() => setIsDemoModalOpen(false)} />
    </div>
  );
}

