import { Link } from 'react-router-dom';
import { 
  Target, FileText, Briefcase, TrendingUp, Shield, Zap, 
  Users, CheckCircle, ArrowRight, Star, Award 
} from 'lucide-react';
import Navigation from '../components/Navigation';
import ChatWidget from '../components/ChatWidget';

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <Navigation />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in">
              Win More Government Contracts
              <span className="block text-blue-300 mt-2">With AI-Powered Intelligence</span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Generate winning proposals in minutes, not weeks. Automate capture planning, 
              compliance checking, and bid qualification with Fortune 500-grade AI.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/signup"
                className="px-8 py-4 bg-white text-blue-900 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-all transform hover:scale-105 shadow-xl"
              >
                Start Free Trial <ArrowRight className="inline ml-2" size={20} />
              </Link>
              <Link
                to="/login"
                className="px-8 py-4 bg-blue-700 text-white rounded-lg font-semibold text-lg hover:bg-blue-600 transition-all border-2 border-blue-500"
              >
                Sign In
              </Link>
            </div>
            <p className="mt-6 text-blue-200">
              ✨ No credit card required • 14-day free trial • Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <StatCard number="99%" label="Time Saved" />
            <StatCard number="$10K" label="Cost Reduction" />
            <StatCard number="5 min" label="Proposal Generation" />
            <StatCard number="500+" label="Happy Customers" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Win
            </h2>
            <p className="text-xl text-gray-600">
              From opportunity discovery to post-award management
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Target className="text-blue-600" size={40} />}
              title="Opportunity Intelligence"
              description="AI-powered SAM.gov integration with 6-factor scoring, bid/no-bid analysis, and PWin calculation."
            />
            <FeatureCard
              icon={<FileText className="text-green-600" size={40} />}
              title="Proposal Automation"
              description="Generate Shipley-compliant proposals with AI drafting, compliance matrices, and red team review."
            />
            <FeatureCard
              icon={<Briefcase className="text-purple-600" size={40} />}
              title="Capture Management"
              description="Win themes, solution architecture, competitive intelligence, and teaming strategy in one place."
            />
            <FeatureCard
              icon={<Shield className="text-red-600" size={40} />}
              title="Compliance Engine"
              description="FAR/DFARS/2CFR200 rules engine with NIST 800-171 and CMMC tracking built-in."
            />
            <FeatureCard
              icon={<TrendingUp className="text-orange-600" size={40} />}
              title="Advanced Analytics"
              description="Win/loss analysis, pipeline forecasting, and performance dashboards with real-time insights."
            />
            <FeatureCard
              icon={<Zap className="text-yellow-600" size={40} />}
              title="AI Co-Pilot"
              description="GovBot AI assistant for instant answers on RFPs, regulations, and best practices."
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Three simple steps to winning proposals
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <StepCard
              number="1"
              title="Upload RFP"
              description="Drop your RFP document and our AI extracts requirements, deadlines, and evaluation criteria automatically."
            />
            <StepCard
              number="2"
              title="AI Generates Proposal"
              description="Our AI creates a Shipley-compliant outline, compliance matrix, and drafts each section with your past performance."
            />
            <StepCard
              number="3"
              title="Review & Submit"
              description="Collaborate with your team, run red team reviews, and export to DOCX/PDF ready for submission."
            />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Trusted by Government Contractors
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <TestimonialCard
              quote="GovLogicAI reduced our proposal time from 3 weeks to 2 days. Game changer!"
              author="Sarah Johnson"
              role="Capture Manager, Defense Contractor"
              rating={5}
            />
            <TestimonialCard
              quote="The AI compliance checking caught issues our team missed. Saved us from a rejection."
              author="Michael Chen"
              role="Proposal Director, IT Services"
              rating={5}
            />
            <TestimonialCard
              quote="Best investment we made. ROI in the first month. Highly recommended."
              author="David Martinez"
              role="CEO, Small Business"
              rating={5}
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600">
              Start free, scale as you grow
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <PricingCard
              tier="Free"
              price="$0"
              features={[
                "1 proposal/month",
                "5 opportunities",
                "Basic AI features",
                "Community support"
              ]}
            />
            <PricingCard
              tier="Starter"
              price="$99"
              features={[
                "5 proposals/month",
                "25 opportunities",
                "Full AI features",
                "Email support",
                "Compliance checking"
              ]}
              popular
            />
            <PricingCard
              tier="Professional"
              price="$299"
              features={[
                "20 proposals/month",
                "100 opportunities",
                "Advanced AI",
                "Priority support",
                "Team collaboration",
                "API access"
              ]}
            />
            <PricingCard
              tier="Enterprise"
              price="Custom"
              features={[
                "Unlimited proposals",
                "Unlimited opportunities",
                "Custom AI models",
                "Dedicated support",
                "SSO & SAML",
                "On-premise option"
              ]}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-900 to-indigo-900 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Win More Contracts?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Join hundreds of government contractors using AI to win more bids
          </p>
          <Link
            to="/signup"
            className="inline-block px-10 py-4 bg-white text-blue-900 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-all transform hover:scale-105 shadow-xl"
          >
            Start Your Free Trial <ArrowRight className="inline ml-2" size={20} />
          </Link>
        </div>
      </section>

      {/* Trusted Companies */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-gray-500 text-sm font-semibold uppercase tracking-wide mb-8">
              Trusted by Leading Government Contractors
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 items-center opacity-60">
              <CompanyLogo name="TechForce Solutions" />
              <CompanyLogo name="Federal Systems Inc" />
              <CompanyLogo name="SecureGov Technologies" />
              <CompanyLogo name="Defense Solutions Group" />
              <CompanyLogo name="Infrastructure Partners" />
              <CompanyLogo name="NextGen Contracting" />
            </div>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center space-x-8 text-center">
              <div>
                <p className="text-3xl font-bold text-blue-900">$100M+</p>
                <p className="text-sm text-gray-600">Contracts Won</p>
              </div>
              <div className="h-12 w-px bg-gray-300"></div>
              <div>
                <p className="text-3xl font-bold text-blue-900">500+</p>
                <p className="text-sm text-gray-600">Active Users</p>
              </div>
              <div className="h-12 w-px bg-gray-300"></div>
              <div>
                <p className="text-3xl font-bold text-blue-900">98%</p>
                <p className="text-sm text-gray-600">Success Rate</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-white font-bold text-lg mb-4">GovLogicAI</h3>
              <p className="text-sm">AI-powered government contracting platform</p>
              <p className="text-sm mt-2">info@GovSure.ai</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Features</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/features" className="hover:text-white">AI GovCon Agent</Link></li>
                <li><Link to="/features" className="hover:text-white">Opportunity Discovery</Link></li>
                <li><Link to="/features" className="hover:text-white">Proposal Writer</Link></li>
                <li><Link to="/features" className="hover:text-white">Capture Management</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Pages</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/" className="hover:text-white">Home</Link></li>
                <li><Link to="/pricing" className="hover:text-white">Pricing</Link></li>
                <li><Link to="/how-it-works" className="hover:text-white">How It Works</Link></li>
                <li><Link to="/case-studies" className="hover:text-white">Case Studies</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white">Security</a></li>
                <li><a href="#" className="hover:text-white">Contact Us</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            <p>&copy; 2024 GovLogicAI. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Chat Widget */}
      <ChatWidget />
    </div>
  );
}

function CompanyLogo({ name }: { name: string }) {
  return (
    <div className="flex items-center justify-center h-16">
      <div className="text-gray-400 font-bold text-sm text-center">{name}</div>
    </div>
  );
}

function StatCard({ number, label }: { number: string; label: string }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="text-4xl font-bold text-blue-900 mb-2">{number}</div>
      <div className="text-gray-600">{label}</div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function StepCard({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-900 text-white rounded-full text-2xl font-bold mb-4">
        {number}
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function TestimonialCard({ quote, author, role, rating }: { quote: string; author: string; role: string; rating: number }) {
  return (
    <div className="bg-white p-8 rounded-xl shadow-lg">
      <div className="flex mb-4">
        {[...Array(rating)].map((_, i) => (
          <Star key={i} className="text-yellow-400 fill-current" size={20} />
        ))}
      </div>
      <p className="text-gray-700 mb-6 italic">"{quote}"</p>
      <div>
        <p className="font-bold text-gray-900">{author}</p>
        <p className="text-sm text-gray-600">{role}</p>
      </div>
    </div>
  );
}

function PricingCard({ tier, price, features, popular }: { tier: string; price: string; features: string[]; popular?: boolean }) {
  return (
    <div className={`bg-white p-8 rounded-xl shadow-lg ${popular ? 'ring-4 ring-blue-500 relative' : ''}`}>
      {popular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
            Most Popular
          </span>
        </div>
      )}
      <h3 className="text-2xl font-bold text-gray-900 mb-2">{tier}</h3>
      <div className="mb-6">
        <span className="text-4xl font-bold text-gray-900">{price}</span>
        {price !== "Custom" && <span className="text-gray-600">/month</span>}
      </div>
      <ul className="space-y-3 mb-8">
        {features.map((feature, i) => (
          <li key={i} className="flex items-start">
            <CheckCircle className="text-green-500 mr-2 flex-shrink-0" size={20} />
            <span className="text-gray-600">{feature}</span>
          </li>
        ))}
      </ul>
      <Link
        to="/signup"
        className={`block w-full py-3 px-6 rounded-lg font-semibold text-center transition-all ${
          popular
            ? 'bg-blue-900 text-white hover:bg-blue-800'
            : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
        }`}
      >
        Get Started
      </Link>
    </div>
  );
}

