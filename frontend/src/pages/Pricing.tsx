import { CheckCircle, ArrowRight, Zap, Shield, Users, Star } from 'lucide-react';
import Navigation from '../components/Navigation';
import ChatWidget from '../components/ChatWidget';
import { Link } from 'react-router-dom';
import { useState } from 'react';

export default function Pricing() {
  const [interval, setInterval] = useState<'monthly' | 'annual'>('monthly');

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-900 to-indigo-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-6">Simple, Transparent Pricing</h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
            Start free, scale as you grow. No hidden fees, no surprises.
          </p>
          
          {/* Billing Toggle */}
          <div className="inline-flex items-center bg-blue-800 rounded-full p-1">
            <button
              onClick={() => setInterval('monthly')}
              className={`px-6 py-2 rounded-full font-semibold transition-all ${
                interval === 'monthly'
                  ? 'bg-white text-blue-900'
                  : 'text-white hover:text-blue-200'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setInterval('annual')}
              className={`px-6 py-2 rounded-full font-semibold transition-all ${
                interval === 'annual'
                  ? 'bg-white text-blue-900'
                  : 'text-white hover:text-blue-200'
              }`}
            >
              Annual
              <span className="ml-2 text-xs bg-green-500 text-white px-2 py-1 rounded-full">Save 20%</span>
            </button>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <PricingCard
              name="Free"
              price={0}
              interval={interval}
              description="Perfect for trying out GovSure"
              features={[
                "1 proposal per month",
                "5 opportunities tracked",
                "Basic AI features",
                "Community support",
                "7-day data retention"
              ]}
              cta="Start Free"
              ctaLink="/signup"
            />
            
            <PricingCard
              name="Starter"
              price={interval === 'monthly' ? 99 : 79}
              interval={interval}
              description="For small contractors getting started"
              features={[
                "5 proposals per month",
                "25 opportunities tracked",
                "Full AI proposal generation",
                "Email support (24hr response)",
                "Compliance checking",
                "Basic analytics",
                "30-day data retention"
              ]}
              cta="Get Started"
              ctaLink="/signup"
              popular
            />
            
            <PricingCard
              name="Professional"
              price={interval === 'monthly' ? 299 : 239}
              interval={interval}
              description="For established GovCon businesses"
              features={[
                "20 proposals per month",
                "100 opportunities tracked",
                "Advanced AI features",
                "Priority support (4hr response)",
                "Team collaboration (up to 10 users)",
                "API access",
                "Advanced analytics & reporting",
                "Custom templates",
                "90-day data retention"
              ]}
              cta="Get Started"
              ctaLink="/signup"
            />
            
            <PricingCard
              name="Enterprise"
              price={null}
              interval={interval}
              description="For large organizations"
              features={[
                "Unlimited proposals",
                "Unlimited opportunities",
                "Custom AI models",
                "Dedicated support & CSM",
                "Unlimited users",
                "SSO & SAML",
                "Custom integrations",
                "On-premise deployment option",
                "SLA guarantees",
                "Unlimited data retention",
                "White-label options"
              ]}
              cta="Contact Sales"
              ctaLink="/signup"
            />
          </div>
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Compare All Features
            </h2>
          </div>
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Feature</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Free</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Starter</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Professional</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Enterprise</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <FeatureRow feature="Proposals per month" free="1" starter="5" professional="20" enterprise="Unlimited" />
                <FeatureRow feature="Opportunities tracked" free="5" starter="25" professional="100" enterprise="Unlimited" />
                <FeatureRow feature="Team members" free="1" starter="1" professional="10" enterprise="Unlimited" />
                <FeatureRow feature="AI proposal generation" free="✓" starter="✓" professional="✓" enterprise="✓" />
                <FeatureRow feature="Compliance checking" free="Basic" starter="✓" professional="✓" enterprise="✓" />
                <FeatureRow feature="Opportunity matching" free="✓" starter="✓" professional="✓" enterprise="✓" />
                <FeatureRow feature="Document library" free="10 docs" starter="100 docs" professional="1000 docs" enterprise="Unlimited" />
                <FeatureRow feature="API access" free="—" starter="—" professional="✓" enterprise="✓" />
                <FeatureRow feature="SSO/SAML" free="—" starter="—" professional="—" enterprise="✓" />
                <FeatureRow feature="Custom AI models" free="—" starter="—" professional="—" enterprise="✓" />
                <FeatureRow feature="Support" free="Community" starter="Email" professional="Priority" enterprise="Dedicated" />
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
          </div>
          <div className="space-y-6">
            <FAQItem
              question="Can I change plans anytime?"
              answer="Yes! You can upgrade, downgrade, or cancel your subscription at any time. Changes take effect at the start of your next billing cycle."
            />
            <FAQItem
              question="What payment methods do you accept?"
              answer="We accept all major credit cards (Visa, Mastercard, Amex, Discover) and ACH for annual plans. Enterprise customers can also pay via wire transfer or check."
            />
            <FAQItem
              question="Is there a long-term contract?"
              answer="No. All our plans are month-to-month or annual with no long-term commitment. You can cancel anytime."
            />
            <FAQItem
              question="What happens if I exceed my proposal limit?"
              answer="You'll receive a notification when you're approaching your limit. You can either upgrade to a higher plan or purchase additional proposals à la carte."
            />
            <FAQItem
              question="Do you offer non-profit or educational discounts?"
              answer="Yes! We offer 25% discounts for registered non-profits and educational institutions. Contact our sales team for details."
            />
            <FAQItem
              question="Is my data secure?"
              answer="Absolutely. We're SOC 2 Type II certified, encrypt all data in transit and at rest, and offer NIST 800-171 compliant hosting for enterprise customers."
            />
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <TrustCard icon={<Shield size={32} />} title="SOC 2 Type II" subtitle="Certified Security" />
            <TrustCard icon={<Zap size={32} />} title="99.9% Uptime" subtitle="SLA Guarantee" />
            <TrustCard icon={<Users size={32} />} title="500+ Customers" subtitle="And Growing" />
            <TrustCard icon={<Star size={32} />} title="4.9/5 Rating" subtitle="Customer Satisfaction" />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-blue-900 to-indigo-900 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Try GovSure free for 14 days. No credit card required.
          </p>
          <Link
            to="/signup"
            className="inline-flex items-center px-10 py-4 bg-white text-blue-900 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-all transform hover:scale-105 shadow-xl"
          >
            Start Your Free Trial <ArrowRight className="ml-2" size={20} />
          </Link>
        </div>
      </section>

      <ChatWidget />
    </div>
  );
}

function PricingCard({
  name,
  price,
  interval,
  description,
  features,
  cta,
  ctaLink,
  popular
}: {
  name: string;
  price: number | null;
  interval: 'monthly' | 'annual';
  description: string;
  features: string[];
  cta: string;
  ctaLink: string;
  popular?: boolean;
}) {
  return (
    <div className={`bg-white rounded-2xl shadow-lg p-8 relative ${popular ? 'ring-4 ring-blue-500 transform scale-105' : ''}`}>
      {popular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
            Most Popular
          </span>
        </div>
      )}
      <h3 className="text-2xl font-bold text-gray-900 mb-2">{name}</h3>
      <p className="text-gray-600 text-sm mb-6">{description}</p>
      <div className="mb-6">
        {price !== null ? (
          <>
            <span className="text-5xl font-bold text-gray-900">${price}</span>
            <span className="text-gray-600">/{interval === 'monthly' ? 'mo' : 'yr'}</span>
          </>
        ) : (
          <span className="text-5xl font-bold text-gray-900">Custom</span>
        )}
      </div>
      <Link
        to={ctaLink}
        className={`block w-full py-3 px-6 rounded-lg font-semibold text-center transition-all mb-8 ${
          popular
            ? 'bg-blue-900 text-white hover:bg-blue-800'
            : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
        }`}
      >
        {cta}
      </Link>
      <ul className="space-y-3">
        {features.map((feature, i) => (
          <li key={i} className="flex items-start">
            <CheckCircle className="text-green-500 mr-2 flex-shrink-0 mt-0.5" size={18} />
            <span className="text-gray-700 text-sm">{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FeatureRow({ 
  feature, 
  free, 
  starter, 
  professional, 
  enterprise 
}: { 
  feature: string;
  free: string;
  starter: string;
  professional: string;
  enterprise: string;
}) {
  return (
    <tr>
      <td className="px-6 py-4 text-sm text-gray-900">{feature}</td>
      <td className="px-6 py-4 text-sm text-gray-600 text-center">{free}</td>
      <td className="px-6 py-4 text-sm text-gray-600 text-center">{starter}</td>
      <td className="px-6 py-4 text-sm text-gray-600 text-center">{professional}</td>
      <td className="px-6 py-4 text-sm text-gray-600 text-center">{enterprise}</td>
    </tr>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-2">{question}</h3>
      <p className="text-gray-700">{answer}</p>
    </div>
  );
}

function TrustCard({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="text-blue-600 mb-3">{icon}</div>
      <p className="font-bold text-gray-900">{title}</p>
      <p className="text-sm text-gray-600">{subtitle}</p>
    </div>
  );
}

