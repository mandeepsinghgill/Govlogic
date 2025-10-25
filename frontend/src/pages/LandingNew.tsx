import { Link } from 'react-router-dom';
import { 
  ArrowRight, CheckCircle, Star, Zap, Shield, TrendingUp,
  Target, FileText, Briefcase, Users, ChevronDown, Play
} from 'lucide-react';
import { useState } from 'react';

export default function LandingNew() {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-white">
      {/* Modern Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">G</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                GovLogicAI
              </span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Features</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">Pricing</a>
              <a href="#testimonials" className="text-gray-600 hover:text-gray-900 transition-colors">Customers</a>
              <Link to="/login" className="text-gray-600 hover:text-gray-900 transition-colors">Sign In</Link>
              <Link 
                to="/signup"
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all"
              >
                Start Free Trial
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Ultra Modern */}
      <section className="pt-32 pb-20 px-6 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute top-40 left-1/2 w-80 h-80 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-blue-200 mb-8">
              <Zap className="text-blue-600" size={16} />
              <span className="text-sm font-semibold text-gray-700">AI-Powered Government Contracting Platform</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent">
                Win More Government
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Contracts with AI
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
              Generate winning proposals in <span className="font-semibold text-blue-600">5 minutes</span>, 
              not weeks. The complete AI platform for government contractors.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link
                to="/signup"
                className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold text-lg hover:shadow-2xl hover:scale-105 transition-all flex items-center justify-center"
              >
                Start Free Trial
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
              </Link>
              <button className="px-8 py-4 bg-white text-gray-700 rounded-xl font-semibold text-lg hover:shadow-lg transition-all flex items-center justify-center border border-gray-200">
                <Play className="mr-2" size={20} />
                Watch Demo
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center justify-center space-x-8 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <CheckCircle className="text-green-500" size={16} />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center space-x-1">
                <CheckCircle className="text-green-500" size={16} />
                <span>14-day free trial</span>
              </div>
              <div className="flex items-center space-x-1">
                <CheckCircle className="text-green-500" size={16} />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>

          {/* Product Screenshot/Demo */}
          <div className="mt-20 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-blue-600/20 to-purple-600/20 blur-3xl"></div>
            <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 p-2">
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-8">
                <div className="flex items-center space-x-2 mb-6">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <div className="flex-1 text-center text-sm text-gray-500 font-mono">Dashboard Overview</div>
                </div>
                <div className="grid grid-cols-4 gap-4 mb-4">
                  <div className="col-span-1 h-24 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg"></div>
                  <div className="col-span-1 h-24 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg"></div>
                  <div className="col-span-1 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg"></div>
                  <div className="col-span-1 h-24 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg"></div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2 h-48 bg-white rounded-lg shadow-sm"></div>
                  <div className="col-span-1 h-48 bg-white rounded-lg shadow-sm"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Stats */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatCard number="$127M+" label="Contracts Won" color="blue" />
            <StatCard number="850+" label="Active Users" color="green" />
            <StatCard number="99%" label="Time Saved" color="purple" />
            <StatCard number="4.9/5" label="Customer Rating" color="orange" />
          </div>
        </div>
      </section>

      {/* Features Section - Modern Cards */}
      <section id="features" className="py-24 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Everything You Need to Win
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From opportunity discovery to proposal submission, all in one powerful platform
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Target className="text-blue-600" size={32} />}
              title="Smart Opportunity Matching"
              description="AI monitors SAM.gov 24/7 and scores opportunities based on your capabilities, with automated bid/no-bid recommendations."
              gradient="from-blue-500 to-indigo-500"
              index={0}
              isHovered={hoveredFeature === 0}
              onHover={() => setHoveredFeature(0)}
              onLeave={() => setHoveredFeature(null)}
            />
            <FeatureCard
              icon={<FileText className="text-green-600" size={32} />}
              title="AI Proposal Generation"
              description="Generate Shipley-compliant proposals in minutes with automatic compliance matrices and win theme integration."
              gradient="from-green-500 to-emerald-500"
              index={1}
              isHovered={hoveredFeature === 1}
              onHover={() => setHoveredFeature(1)}
              onLeave={() => setHoveredFeature(null)}
            />
            <FeatureCard
              icon={<Briefcase className="text-purple-600" size={32} />}
              title="Capture Management"
              description="Centralize your capture plans, competitive intelligence, teaming strategy, and pipeline forecasting."
              gradient="from-purple-500 to-pink-500"
              index={2}
              isHovered={hoveredFeature === 2}
              onHover={() => setHoveredFeature(2)}
              onLeave={() => setHoveredFeature(null)}
            />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Loved by Government Contractors</h2>
            <div className="flex justify-center space-x-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="text-yellow-400 fill-yellow-400" size={24} />
              ))}
            </div>
            <p className="text-gray-600">4.9/5 from 500+ reviews</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <TestimonialCard
              quote="GovLogicAI cut our proposal time from 3 weeks to 2 days. The ROI is incredible."
              author="Sarah Chen"
              role="Capture Manager"
              company="TechForce Solutions"
              image="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop"
            />
            <TestimonialCard
              quote="Best investment we made this year. Won 3 major contracts in our first quarter."
              author="Michael Rodriguez"
              role="CEO"
              company="Federal Systems Inc"
              image="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop"
            />
            <TestimonialCard
              quote="The AI compliance checking caught errors we would have missed. Saved us from rejection."
              author="Jennifer Park"
              role="Proposal Director"
              company="Defense Solutions"
              image="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop"
            />
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-gray-600">Start free, scale as you grow</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <PricingCard
              name="Starter"
              price="99"
              description="Perfect for small contractors"
              features={[
                "5 proposals/month",
                "25 opportunities",
                "AI proposal generation",
                "Email support"
              ]}
            />
            <PricingCard
              name="Professional"
              price="299"
              description="For established businesses"
              features={[
                "20 proposals/month",
                "100 opportunities",
                "Priority support",
                "Team collaboration",
                "Advanced analytics"
              ]}
              popular
            />
            <PricingCard
              name="Enterprise"
              price="Custom"
              description="For large organizations"
              features={[
                "Unlimited proposals",
                "Unlimited opportunities",
                "Dedicated support",
                "Custom AI models",
                "On-premise option"
              ]}
            />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Win More Contracts?
          </h2>
          <p className="text-xl mb-10 text-blue-100">
            Join 850+ government contractors using AI to win more bids
          </p>
          <Link
            to="/signup"
            className="inline-flex items-center px-10 py-4 bg-white text-blue-600 rounded-xl font-semibold text-lg hover:shadow-2xl hover:scale-105 transition-all"
          >
            Start Your Free Trial
            <ArrowRight className="ml-2" size={20} />
          </Link>
          <p className="mt-6 text-blue-100 text-sm">
            ✨ No credit card required • 14-day free trial • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg"></div>
                <span className="text-white font-bold text-lg">GovLogicAI</span>
              </div>
              <p className="text-sm">AI-powered government contracting platform</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Privacy</a></li>
                <li><a href="#" className="hover:text-white">Terms</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2024 GovLogicAI. All rights reserved.</p>
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
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}

function StatCard({ number, label, color }: { number: string; label: string; color: string }) {
  const colorClasses = {
    blue: 'from-blue-500 to-indigo-500',
    green: 'from-green-500 to-emerald-500',
    purple: 'from-purple-500 to-pink-500',
    orange: 'from-orange-500 to-red-500'
  };

  return (
    <div className="text-center p-6 rounded-2xl bg-white border border-gray-100 hover:shadow-lg transition-all">
      <div className={`text-4xl font-bold bg-gradient-to-r ${colorClasses[color as keyof typeof colorClasses]} bg-clip-text text-transparent mb-2`}>
        {number}
      </div>
      <div className="text-gray-600 font-medium">{label}</div>
    </div>
  );
}

function FeatureCard({ 
  icon, 
  title, 
  description, 
  gradient,
  index,
  isHovered,
  onHover,
  onLeave
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string; 
  gradient: string;
  index: number;
  isHovered: boolean;
  onHover: () => void;
  onLeave: () => void;
}) {
  return (
    <div 
      className={`p-8 rounded-2xl bg-white border border-gray-200 hover:shadow-2xl transition-all duration-300 cursor-pointer ${isHovered ? 'scale-105 border-transparent' : ''}`}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-6 ${isHovered ? 'scale-110' : ''} transition-transform`}>
        {icon}
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}

function TestimonialCard({ 
  quote, 
  author, 
  role, 
  company, 
  image 
}: { 
  quote: string; 
  author: string; 
  role: string; 
  company: string; 
  image: string;
}) {
  return (
    <div className="p-8 rounded-2xl bg-white border border-gray-200 hover:shadow-xl transition-all">
      <div className="flex space-x-1 mb-4">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className="text-yellow-400 fill-yellow-400" size={16} />
        ))}
      </div>
      <p className="text-gray-700 mb-6 italic leading-relaxed">"{quote}"</p>
      <div className="flex items-center space-x-3">
        <img src={image} alt={author} className="w-12 h-12 rounded-full object-cover" />
        <div>
          <p className="font-bold text-gray-900">{author}</p>
          <p className="text-sm text-gray-600">{role}, {company}</p>
        </div>
      </div>
    </div>
  );
}

function PricingCard({ 
  name, 
  price, 
  description, 
  features, 
  popular 
}: { 
  name: string; 
  price: string; 
  description: string; 
  features: string[]; 
  popular?: boolean;
}) {
  return (
    <div className={`p-8 rounded-2xl bg-white border-2 ${popular ? 'border-blue-600 shadow-2xl scale-105' : 'border-gray-200'} relative`}>
      {popular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span className="px-4 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full text-sm font-semibold">
            Most Popular
          </span>
        </div>
      )}
      <h3 className="text-2xl font-bold text-gray-900 mb-2">{name}</h3>
      <p className="text-gray-600 mb-6">{description}</p>
      <div className="mb-6">
        {price !== "Custom" ? (
          <>
            <span className="text-5xl font-bold text-gray-900">${price}</span>
            <span className="text-gray-600">/month</span>
          </>
        ) : (
          <span className="text-5xl font-bold text-gray-900">{price}</span>
        )}
      </div>
      <ul className="space-y-3 mb-8">
        {features.map((feature, i) => (
          <li key={i} className="flex items-start">
            <CheckCircle className="text-green-500 mr-2 flex-shrink-0 mt-0.5" size={18} />
            <span className="text-gray-700">{feature}</span>
          </li>
        ))}
      </ul>
      <Link
        to="/signup"
        className={`block w-full py-3 px-6 rounded-xl font-semibold text-center transition-all ${
          popular
            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg'
            : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
        }`}
      >
        Get Started
      </Link>
    </div>
  );
}

