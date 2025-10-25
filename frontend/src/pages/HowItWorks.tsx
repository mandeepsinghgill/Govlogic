import { Upload, Sparkles, Search, FileText, Users, Trophy, ArrowRight, CheckCircle } from 'lucide-react';
import Navigation from '../components/Navigation';
import ChatWidget from '../components/ChatWidget';
import { Link } from 'react-router-dom';

export default function HowItWorks() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-900 to-indigo-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-6">How GovLogicAI Works</h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
            Our streamlined process turns opportunities into wins
          </p>
          <div className="inline-flex items-center px-6 py-3 bg-blue-800 rounded-full">
            <Sparkles className="mr-2" size={20} />
            <span className="font-semibold">Powered by AI</span>
          </div>
        </div>
      </section>

      {/* Main Process Flow */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative">
            {/* Connecting Line */}
            <div className="hidden md:block absolute top-32 left-1/2 w-1 h-[calc(100%-128px)] bg-gradient-to-b from-blue-300 to-purple-300 transform -translate-x-1/2"></div>

            {/* Steps */}
            <div className="space-y-24">
              <ProcessStep
                number="1"
                title="Learn"
                subtitle="Build Your Company Profile"
                description="GOVLOGIC builds a complete profile of your business by learning from your documents, past performance, capabilities, and expertise."
                icon={<Upload className="text-white" size={32} />}
                color="blue"
                items={[
                  { icon: "💼", text: "Solutions & Win Themes" },
                  { icon: "📋", text: "Templates & Past Proposals" },
                  { icon: "⚙️", text: "Product Specs & Capabilities" },
                  { icon: "💰", text: "Pricing Models" },
                  { icon: "👔", text: "Team Resumes" },
                  { icon: "🏆", text: "Past Performance" },
                  { icon: "📄", text: "Whitepapers & Marketing" },
                  { icon: "🤝", text: "Partners & Subcontractors" }
                ]}
              />

              <ProcessStep
                number="2"
                title="Find"
                subtitle="Discover Perfect Opportunities"
                description="Our AI monitors SAM.gov and other sources 24/7, matching opportunities to your profile and alerting you to the best fits."
                icon={<Search className="text-white" size={32} />}
                color="green"
                items={[
                  { icon: "🎯", text: "AI-powered opportunity matching" },
                  { icon: "📊", text: "6-factor scoring & PWin analysis" },
                  { icon: "🔔", text: "Real-time alerts & notifications" },
                  { icon: "✅", text: "Automated bid/no-bid recommendations" }
                ]}
                reverse
              />

              <ProcessStep
                number="3"
                title="Bid"
                subtitle="Create Winning Proposals"
                description="Generate Shipley-compliant proposals in minutes with AI-powered drafting, compliance checking, and collaboration tools."
                icon={<FileText className="text-white" size={32} />}
                color="purple"
                items={[
                  { icon: "📝", text: "AI-generated proposal outlines" },
                  { icon: "✓", text: "Automatic compliance matrices" },
                  { icon: "🎨", text: "Branded templates & formatting" },
                  { icon: "🤝", text: "Team collaboration & reviews" }
                ]}
              />

              <ProcessStep
                number="4"
                title="Manage"
                subtitle="Track Your Pursuits"
                description="Centralize capture planning, competitive intelligence, teaming, and pipeline forecasting in one powerful dashboard."
                icon={<Users className="text-white" size={32} />}
                color="orange"
                items={[
                  { icon: "📈", text: "Capture plan management" },
                  { icon: "🔍", text: "Competitive intelligence" },
                  { icon: "💼", text: "Teaming partner coordination" },
                  { icon: "📊", text: "Pipeline & forecast tracking" }
                ]}
                reverse
              />

              <ProcessStep
                number="5"
                title="Win"
                subtitle="Close More Contracts"
                description="Track performance, analyze wins and losses, and continuously improve your approach with data-driven insights."
                icon={<Trophy className="text-white" size={32} />}
                color="yellow"
                items={[
                  { icon: "📊", text: "Win/loss analysis" },
                  { icon: "📈", text: "Performance dashboards" },
                  { icon: "🎯", text: "Continuous improvement insights" },
                  { icon: "🏆", text: "Success metrics & ROI tracking" }
                ]}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Government Contractors Choose GovLogicAI
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <BenefitCard
              title="Save Time & Money"
              description="Reduce proposal development time by 90% and save over $10,000 per proposal with AI automation."
              stat="90%"
              statLabel="Time Saved"
            />
            <BenefitCard
              title="Increase Win Rate"
              description="Win more contracts with AI-powered insights, compliance checking, and best-practice guidance."
              stat="2.5x"
              statLabel="Higher Win Rate"
            />
            <BenefitCard
              title="Scale Your Business"
              description="Bid on more opportunities with the same team. Scale your GovCon business without scaling overhead."
              stat="5x"
              statLabel="More Proposals"
            />
          </div>
        </div>
      </section>

      {/* Video/Demo Section */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              See GovLogicAI in Action
            </h2>
            <p className="text-xl text-gray-600">
              Watch how easy it is to generate a winning proposal
            </p>
          </div>
          <div className="bg-gray-900 rounded-2xl shadow-2xl overflow-hidden aspect-video flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-0 h-0 border-t-[12px] border-t-transparent border-l-[20px] border-l-blue-900 border-b-[12px] border-b-transparent ml-1"></div>
              </div>
              <p className="text-white text-lg font-semibold">Demo Video</p>
              <p className="text-gray-400 text-sm mt-2">5 minutes • Full walkthrough</p>
            </div>
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
            Try GovLogicAI free for 14 days. No credit card required.
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

function ProcessStep({ 
  number, 
  title, 
  subtitle, 
  description, 
  icon, 
  color, 
  items, 
  reverse 
}: { 
  number: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  items: { icon: string; text: string }[];
  reverse?: boolean;
}) {
  const colorClasses = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    purple: 'bg-purple-600',
    orange: 'bg-orange-600',
    yellow: 'bg-yellow-600'
  };

  return (
    <div className={`flex flex-col ${reverse ? 'md:flex-row-reverse' : 'md:flex-row'} gap-12 items-center relative`}>
      {/* Number Badge (centered on mobile, floating on desktop) */}
      <div className="md:absolute md:left-1/2 md:transform md:-translate-x-1/2 z-10">
        <div className={`w-24 h-24 ${colorClasses[color as keyof typeof colorClasses]} rounded-full flex items-center justify-center shadow-xl`}>
          {icon}
        </div>
        <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-white px-3 py-1 rounded-full shadow-md">
          <span className="text-2xl font-bold text-gray-900">{number}</span>
        </div>
      </div>

      {/* Content */}
      <div className={`flex-1 ${reverse ? 'md:text-right' : 'md:text-left'} text-center`}>
        <h3 className="text-3xl font-bold text-blue-900 mb-2">{title}</h3>
        <p className="text-xl text-gray-600 mb-4">{subtitle}</p>
        <p className="text-gray-700 mb-6">{description}</p>
      </div>

      {/* Items */}
      <div className="flex-1">
        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
          <div className="grid grid-cols-2 gap-4">
            {items.map((item, i) => (
              <div key={i} className="flex items-center space-x-2">
                <span className="text-2xl">{item.icon}</span>
                <span className="text-sm text-gray-700">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function BenefitCard({ title, description, stat, statLabel }: { title: string; description: string; stat: string; statLabel: string }) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-8 text-center">
      <div className="text-5xl font-bold text-blue-900 mb-2">{stat}</div>
      <div className="text-sm text-gray-500 uppercase tracking-wide mb-4">{statLabel}</div>
      <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

