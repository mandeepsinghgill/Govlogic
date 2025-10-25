import { Target, FileText, Briefcase, Shield, TrendingUp, Zap, Users, Database, CheckCircle, MessageSquare } from 'lucide-react';
import Navigation from '../components/Navigation';
import ChatWidget from '../components/ChatWidget';
import { Link } from 'react-router-dom';

export default function Features() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-900 to-indigo-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-6">AI for Government Contracting</h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            Everything you need to succeed in government contracting—streamlined in one platform.
          </p>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-32">
            {/* AI GovCon Agent */}
            <FeatureSection
              id="ai-agent"
              badge="AI GOVCON AGENT"
              title="Instant Contract Clarity"
              description="Stop slogging through 200-page PDFs. Get contracts broken down into clear, navigable sections with natural chat and tailored guidance."
              features={[
                "Chat with contracts and get answers tailored to your company",
                "Key sections, scope, evaluation factors & deliverables in plain English",
                "AI-powered compliance scoring and recommendations",
                "Automatic extraction of requirements and deadlines"
              ]}
              image="/feature-ai-agent.png"
              imageAlt="AI GovCon Agent Interface"
            />

            {/* Opportunity Discovery */}
            <FeatureSection
              id="opportunities"
              badge="OPPORTUNITY INTELLIGENCE"
              title="AI-Powered Contract Matching"
              description="Never miss a relevant opportunity. Our AI monitors SAM.gov 24/7 and alerts you to contracts that match your capabilities, NAICS codes, and past performance."
              features={[
                "6-factor opportunity scoring with PWin calculation",
                "Automatic bid/no-bid recommendations",
                "Federal & SLED contract aggregation",
                "Custom alerts and email notifications",
                "Geographic and agency filtering"
              ]}
              image="/feature-opportunities.png"
              imageAlt="Opportunity Discovery Dashboard"
              reverse
            />

            {/* Proposal Writer */}
            <FeatureSection
              id="proposals"
              badge="PROPOSAL AUTOMATION"
              title="Generate Winning Proposals in Minutes"
              description="Our AI creates Shipley-compliant proposals with compliance matrices, win themes, and tailored content based on your past performance and templates."
              features={[
                "AI-powered proposal generation from RFP requirements",
                "Automatic compliance matrix creation",
                "Win theme identification and integration",
                "Red team review and scoring",
                "Export to DOCX, PDF, or Government formats",
                "Real-time collaboration with your team"
              ]}
              image="/feature-proposals.png"
              imageAlt="Proposal Writer Interface"
            />

            {/* Capture Management */}
            <FeatureSection
              id="capture"
              badge="PURSUIT MANAGEMENT"
              title="Centralize Your Capture Process"
              description="Track every pursuit from discovery to award. Manage capture plans, competitive intelligence, teaming partners, and bid decisions in one place."
              features={[
                "Complete capture plan templates",
                "Competitor intelligence tracking",
                "Teaming partner management",
                "Solution architecture documentation",
                "Gate review workflows",
                "Win probability tracking"
              ]}
              image="/feature-capture.png"
              imageAlt="Capture Management Dashboard"
              reverse
            />

            {/* Document Hub */}
            <FeatureSection
              id="documents"
              badge="AI DOCUMENT HUB"
              title="Your Contracts, Searchable & Smart"
              description="Upload past proposals, capability statements, resumes, and product specs. Our AI learns from your content to generate better proposals."
              features={[
                "AI-powered semantic search across all documents",
                "Automatic content tagging and organization",
                "Version control and approval workflows",
                "Template library management",
                "Secure document sharing"
              ]}
              image="/feature-documents.png"
              imageAlt="Document Hub Interface"
            />

            {/* Compliance Engine */}
            <FeatureSection
              id="compliance"
              badge="COMPLIANCE & SECURITY"
              title="Stay Compliant, Win More"
              description="Built-in FAR, DFARS, and 2CFR200 compliance checking. Track certifications, maintain NIST 800-171 compliance, and prepare for CMMC."
              features={[
                "Automated FAR/DFARS compliance checking",
                "NIST 800-171 & CMMC compliance tracking",
                "Certification expiration alerts",
                "SOC 2 Type II certified platform",
                "Audit trail and reporting"
              ]}
              image="/feature-compliance.png"
              imageAlt="Compliance Dashboard"
              reverse
            />
          </div>
        </div>
      </section>

      {/* Feature Highlights Bar */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <HighlightCard icon={<Shield className="text-blue-600" size={32} />} text="SOC 2 Type II Certified" />
            <HighlightCard icon={<Database className="text-blue-600" size={32} />} text="Enterprise-Grade Security" />
            <HighlightCard icon={<Users className="text-blue-600" size={32} />} text="Team Collaboration" />
            <HighlightCard icon={<Zap className="text-blue-600" size={32} />} text="99.9% Uptime SLA" />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-blue-900 to-indigo-900 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Transform Your GovCon Business?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Join hundreds of contractors winning more with AI
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="px-10 py-4 bg-white text-blue-900 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-all transform hover:scale-105 shadow-xl"
            >
              Start Free Trial
            </Link>
            <button className="px-10 py-4 bg-blue-700 text-white rounded-lg font-semibold text-lg hover:bg-blue-600 transition-all border-2 border-blue-500">
              Schedule a Demo
            </button>
          </div>
        </div>
      </section>

      <ChatWidget />
    </div>
  );
}

function FeatureSection({ 
  id, 
  badge, 
  title, 
  description, 
  features, 
  image, 
  imageAlt, 
  reverse 
}: { 
  id: string;
  badge: string;
  title: string;
  description: string;
  features: string[];
  image: string;
  imageAlt: string;
  reverse?: boolean;
}) {
  return (
    <div id={id} className={`flex flex-col ${reverse ? 'md:flex-row-reverse' : 'md:flex-row'} gap-12 items-center`}>
      {/* Text Content */}
      <div className="flex-1">
        <div className="inline-block px-4 py-2 bg-blue-100 text-blue-900 rounded-full text-sm font-bold mb-4">
          {badge}
        </div>
        <h2 className="text-4xl font-bold text-gray-900 mb-4">{title}</h2>
        <p className="text-xl text-gray-600 mb-6">{description}</p>
        <ul className="space-y-3">
          {features.map((feature, i) => (
            <li key={i} className="flex items-start">
              <CheckCircle className="text-green-500 mr-3 flex-shrink-0 mt-1" size={20} />
              <span className="text-gray-700">{feature}</span>
            </li>
          ))}
        </ul>
        <Link
          to="/signup"
          className="inline-block mt-8 px-6 py-3 bg-blue-900 text-white rounded-lg font-semibold hover:bg-blue-800 transition-colors"
        >
          Try This Feature →
        </Link>
      </div>

      {/* Image/Mockup */}
      <div className="flex-1">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 shadow-xl">
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <div className="flex items-center space-x-2 mb-4 pb-4 border-b">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <div className="flex-1 text-center text-sm text-gray-500">{imageAlt}</div>
            </div>
            <div className="space-y-3">
              <div className="h-4 bg-blue-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded mt-4"></div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                <div className="h-12 bg-gray-100 rounded"></div>
                <div className="h-12 bg-blue-100 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function HighlightCard({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-center mb-3">{icon}</div>
      <p className="text-gray-700 font-medium">{text}</p>
    </div>
  );
}

