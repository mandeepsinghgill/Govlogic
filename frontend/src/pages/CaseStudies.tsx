import { TrendingUp, Clock, DollarSign, Users, CheckCircle, ArrowRight, Star } from 'lucide-react';
import Navigation from '../components/Navigation';
import ChatWidget from '../components/ChatWidget';
import { Link } from 'react-router-dom';

export default function CaseStudies() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-900 to-indigo-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-6">Transform Your GovCon Performance</h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            Read our case studies and see how our customers are transforming their GovCon business with our AI-powered tools.
          </p>
        </div>
      </section>

      {/* Featured Case Studies */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {/* Case Study 1 */}
            <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-2xl overflow-hidden shadow-2xl text-white relative">
              <div className="p-12">
                <div className="flex items-center space-x-4 mb-8">
                  <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center">
                    <span className="text-blue-900 font-bold text-xl">TS</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">TechForce Solutions</h3>
                    <p className="text-blue-200 text-sm">Defense IT Contractor</p>
                  </div>
                </div>
                <div className="mb-8">
                  <p className="text-6xl font-bold text-pink-400 mb-2">4x</p>
                  <p className="text-xl">increase in proposal output</p>
                </div>
                <p className="text-blue-100 mb-8">
                  "GovSure transformed our proposal process. What used to take 3 weeks now takes 3 days, and the quality is actually better. We're bidding on 4x more opportunities with the same team."
                </p>
                <div className="flex items-center space-x-4">
                  <img 
                    src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop" 
                    alt="Michael Torres" 
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <p className="font-semibold">Michael Torres</p>
                    <p className="text-sm text-blue-200">Capture Manager</p>
                  </div>
                </div>
              </div>
              <div className="absolute bottom-0 right-0 w-48 h-48 bg-white opacity-5 rounded-full transform translate-x-24 translate-y-24"></div>
            </div>

            {/* Case Study 2 */}
            <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-2xl overflow-hidden shadow-2xl text-white relative">
              <div className="p-12">
                <div className="flex items-center space-x-4 mb-8">
                  <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center">
                    <span className="text-indigo-900 font-bold text-xl">FS</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Federal Systems Inc</h3>
                    <p className="text-purple-200 text-sm">Professional Services</p>
                  </div>
                </div>
                <div className="mb-8">
                  <p className="text-6xl font-bold text-pink-400 mb-2">75%</p>
                  <p className="text-xl">reduction in capture time</p>
                </div>
                <p className="text-purple-100 mb-8">
                  "The AI-powered opportunity matching is a game changer. We're now finding opportunities we would have missed, and the automated bid/no-bid scoring saves us hours of analysis."
                </p>
                <div className="flex items-center space-x-4">
                  <img 
                    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop" 
                    alt="Sarah Chen" 
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <p className="font-semibold">Sarah Chen</p>
                    <p className="text-sm text-purple-200">Business Development Director</p>
                  </div>
                </div>
              </div>
              <div className="absolute bottom-0 right-0 w-48 h-48 bg-white opacity-5 rounded-full transform translate-x-24 translate-y-24"></div>
            </div>
          </div>

          {/* Additional Case Studies */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <MiniCaseStudy
              company="SecureGov Technologies"
              industry="Cybersecurity"
              metric="$2.5M"
              description="in new contracts won in first 6 months"
              quote="ROI in the first quarter. Best investment we've made."
              author="David Kim"
              role="CEO"
            />
            <MiniCaseStudy
              company="Defense Solutions Group"
              industry="Engineering Services"
              metric="90%"
              description="reduction in compliance errors"
              quote="The compliance checking saved us from multiple rejections."
              author="Jennifer Martinez"
              role="Proposal Manager"
            />
            <MiniCaseStudy
              company="Infrastructure Partners"
              industry="Construction"
              metric="50%"
              description="increase in win rate"
              quote="Win themes and past performance integration are phenomenal."
              author="Robert Johnson"
              role="VP of Business Development"
            />
          </div>
        </div>
      </section>

      {/* Results Summary */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Results Our Customers Achieve
            </h2>
            <p className="text-xl text-gray-600">
              Real metrics from real government contractors
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <ResultCard
              icon={<Clock className="text-blue-600" size={40} />}
              stat="85%"
              label="Average Time Savings"
            />
            <ResultCard
              icon={<DollarSign className="text-green-600" size={40} />}
              label="Cost Reduction per Proposal"
              stat="$12K"
            />
            <ResultCard
              icon={<TrendingUp className="text-purple-600" size={40} />}
              stat="2.3x"
              label="Increase in Win Rate"
            />
            <ResultCard
              icon={<Users className="text-orange-600" size={40} />}
              stat="3.5x"
              label="More Proposals per Team"
            />
          </div>
        </div>
      </section>

      {/* Testimonials Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              What Our Customers Say
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <TestimonialCard
              quote="GovSure is like having a team of experienced proposal writers and compliance experts on staff. The AI understands government contracting."
              author="James Williams"
              role="Capture Manager"
              company="NextGen Contracting"
              rating={5}
            />
            <TestimonialCard
              quote="We were skeptical about AI for proposals, but GovSure proved us wrong. The quality is impressive and the time savings are real."
              author="Lisa Anderson"
              role="CEO"
              company="Small Business Contractor"
              rating={5}
            />
            <TestimonialCard
              quote="The ROI is undeniable. We won two major contracts in our first quarter using GovSure. The platform paid for itself many times over."
              author="Carlos Rodriguez"
              role="Business Development"
              company="Engineering Services Firm"
              rating={5}
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-blue-900 to-indigo-900 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Transform Your Business?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Join hundreds of successful government contractors using GovSure
          </p>
          <Link
            to="/signup"
            className="inline-flex items-center px-10 py-4 bg-white text-blue-900 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-all transform hover:scale-105 shadow-xl"
          >
            Start Your Free Trial <ArrowRight className="ml-2" size={20} />
          </Link>
          <p className="mt-6 text-blue-200 text-sm">
            ✨ No credit card required • 14-day free trial • Cancel anytime
          </p>
        </div>
      </section>

      <ChatWidget />
    </div>
  );
}

function MiniCaseStudy({ 
  company, 
  industry, 
  metric, 
  description, 
  quote, 
  author, 
  role 
}: { 
  company: string;
  industry: string;
  metric: string;
  description: string;
  quote: string;
  author: string;
  role: string;
}) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-900">{company}</h3>
        <p className="text-sm text-gray-500">{industry}</p>
      </div>
      <div className="mb-6">
        <p className="text-4xl font-bold text-blue-900 mb-1">{metric}</p>
        <p className="text-gray-600">{description}</p>
      </div>
      <p className="text-gray-700 italic mb-4">"{quote}"</p>
      <div className="border-t pt-4">
        <p className="font-semibold text-gray-900">{author}</p>
        <p className="text-sm text-gray-500">{role}</p>
      </div>
    </div>
  );
}

function ResultCard({ icon, stat, label }: { icon: React.ReactNode; stat: string; label: string }) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-8 text-center">
      <div className="flex justify-center mb-4">{icon}</div>
      <p className="text-4xl font-bold text-gray-900 mb-2">{stat}</p>
      <p className="text-gray-600">{label}</p>
    </div>
  );
}

function TestimonialCard({ 
  quote, 
  author, 
  role, 
  company, 
  rating 
}: { 
  quote: string;
  author: string;
  role: string;
  company: string;
  rating: number;
}) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <div className="flex mb-4">
        {[...Array(rating)].map((_, i) => (
          <Star key={i} className="text-yellow-400 fill-current" size={20} />
        ))}
      </div>
      <p className="text-gray-700 mb-6 italic">"{quote}"</p>
      <div>
        <p className="font-bold text-gray-900">{author}</p>
        <p className="text-sm text-gray-600">{role}</p>
        <p className="text-sm text-gray-500">{company}</p>
      </div>
    </div>
  );
}

