import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle,
  Star,
  Zap,
  Shield,
  Target,
  FileText,
  Briefcase,
  Play,
  Lock,
  Database,
  Youtube,
  Linkedin,
  Twitter,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import DemoBookingModal from '../components/DemoBookingModal';
import FAQChatbot from '../components/FAQChatbot';
import { platformSections } from '../content/platformSections';
import Navigation from '../components/Navigation';

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

export default function LandingNew() {
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const discountRate = 0.25;

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

  const verifiedSourceCategories = [
    {
      title: 'Defense & Intelligence',
      agencies: 'DoD • DIA • NSA',
      description:
        'Stay current on mission needs with direct feeds from the Department of Defense and intelligence community notices, classified summaries, and procurement forecasts.',
      logos: [
        { key: 'dod', label: 'Department of Defense' },
        { key: 'dia', label: 'Defense Intelligence Agency' }
      ]
    },
    {
      title: 'Civilian Agencies',
      agencies: 'NASA • GSA • SBA',
      description:
        'Track technology priorities across civilian agencies with curated award history, mission roadmaps, and program spending trends.',
      logos: [
        { key: 'nasa', label: 'NASA' },
        { key: 'house', label: 'U.S. House of Representatives' },
        { key: 'state', label: 'Department of State' }
      ]
    },
    {
      title: 'Health & Research',
      agencies: 'NIH • HHS • CDC',
      description:
        'Unlock grant and contract opportunities in health, bioscience, and public sector research with consolidated program intelligence and compliance checklists.',
      logos: [
        { key: 'nih', label: 'National Institutes of Health' },
        { key: 'doe', label: 'Department of Energy' },
        { key: 'ohio', label: 'State of Ohio' }
      ]
    },
  ] as const;

  const verifiedSourceBadges = [
    { label: 'Department of Defense', subtext: 'DoD', spriteKey: 'dod' },
    { label: 'NASA', subtext: 'NASA', spriteKey: 'nasa' },
    { label: 'U.S. House of Representatives', subtext: 'House', spriteKey: 'house' },
    { label: 'Department of State', subtext: 'State', spriteKey: 'state' },
    { label: 'Department of Energy', subtext: 'DOE', spriteKey: 'doe' },
    { label: 'Defense Intelligence Agency', subtext: 'DIA', spriteKey: 'dia' },
    { label: 'National Institutes of Health', subtext: 'NIH', spriteKey: 'nih' },
    { label: 'State of Ohio', subtext: 'Ohio', spriteKey: 'ohio' },
  ] as const;

  const spriteClassMap: Record<string, string> = {
    dod: 'verified-sprite--dod',
    nasa: 'verified-sprite--nasa',
    house: 'verified-sprite--house',
    state: 'verified-sprite--state',
    doe: 'verified-sprite--doe',
    dia: 'verified-sprite--dia',
    nih: 'verified-sprite--nih',
    ohio: 'verified-sprite--ohio'
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation variant="fixed" onBookDemoClick={() => setIsDemoModalOpen(true)} />

      {/* Hero Section - Ultra Modern */}
      <section className="pt-28 md:pt-32 pb-20 px-4 sm:px-6 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute top-40 left-1/2 w-80 h-80 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-5xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-blue-200 mb-8">
              <Zap className="text-blue-600" size={16} />
              <span className="text-sm font-semibold text-gray-700">AI-Powered Government Contracting Platform</span>
            </div>

            {/* Main Headline */}
            <h1 style={{ fontSize: '44px' }} className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent">
              Win Contracts. Secure Grants. Accelerate Growth.
              </span>
              <br />
              {/* <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                 with GovSure AI
              </span> */}
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            GovSure AI identifies&nbsp;
            <span className="font-semibold text-blue-600">winning RFPs&nbsp;</span> before competitors, optimizes your pricing strategy, and crafts compliant winning proposals and grant applications—giving you the edge to be first to know, first to bid, and first to win every contract.
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
              <button
                onClick={() => setIsDemoModalOpen(true)}
                id="book-demo"
                className="px-8 py-4 bg-white text-gray-700 rounded-xl font-semibold text-lg hover:shadow-lg transition-all flex items-center justify-center border border-gray-200"
              >
                <Play className="mr-2" size={20} />
                Book Demo
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
                <span>7-day free trial</span>
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
                <div className="w-full rounded-lg overflow-hidden bg-white">
                  {/* Replace placeholder UI with real dashboard screenshot */}
                  <img
                    src="/dashboard-hero.png"
                    alt="GovSure Dashboard"
                    className="w-full h-auto object-cover"
                    loading="eager"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Stats */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatCard number="$127M+" label="Active Pipeline" color="blue" />
            <StatCard number="100+" label="Active Users" color="green" />
            <StatCard number="99%" label="Time Saved" color="purple" />
            <StatCard number="5/5" label="Customer Rating" color="orange" />
          </div>
        </div>
      </section>

      {/* The Numbers Don't Lie - Metrics Table */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
              The Numbers Don't Lie
            </h2>
            <p className="text-base text-gray-600 max-w-2xl mx-auto">
              Across 100+ Organizations Using GovSure:
            </p>
          </div>

          <div className="flex justify-center">
            <div className="w-full" style={{ maxWidth: '960px' }}>
              <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden">
                <div className="p-8 md:p-10">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-700/50">
                          <th className="text-left py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-[0.1em]">
                            Metric
                          </th>
                          <th className="text-left py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-[0.1em]">
                            Average Result
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700/40">
                        <tr className="hover:bg-slate-800/30 transition-colors">
                          <td className="py-4 px-6">
                            <span className="text-white font-semibold text-base">Time Savings on Search</span>
                          </td>
                          <td className="py-4 px-6">
                            <span className="text-white font-semibold text-base">95% reduction</span>
                            <span className="text-slate-400 text-sm block mt-1">(40 → 2 week)</span>
                          </td>
                        </tr>
                        <tr className="hover:bg-slate-800/30 transition-colors">
                          <td className="py-4 px-6">
                            <span className="text-white font-semibold text-base">Proposal Output Increase</span>
                          </td>
                          <td className="py-4 px-6">
                            <span className="text-white font-semibold text-base">4-6× more submission</span>
                          </td>
                        </tr>
                        <tr className="hover:bg-slate-800/30 transition-colors">
                          <td className="py-4 px-6">
                            <span className="text-white font-semibold text-base">Win-Readiness Improvement</span>
                          </td>
                          <td className="py-4 px-6">
                            <span className="text-white font-semibold text-base">+30-45 percentage point</span>
                            <span className="text-slate-400 text-sm block mt-1">quality & preparedness</span>
                          </td>
                        </tr>
                        <tr className="hover:bg-slate-800/30 transition-colors">
                          <td className="py-4 px-6">
                            <span className="text-white font-semibold text-base">Compliance Error Rate</span>
                          </td>
                          <td className="py-4 px-6">
                            <span className="text-white font-semibold text-base">Near-zero missed requirements</span>
                          </td>
                        </tr>
                        <tr className="hover:bg-slate-800/30 transition-colors">
                          <td className="py-4 px-6">
                            <span className="text-white font-semibold text-base">ROI Timeline</span>
                          </td>
                          <td className="py-4 px-6">
                            <span className="text-white font-semibold text-base">Positive in 60-90 days</span>
                          </td>
                        </tr>
                        <tr className="hover:bg-slate-800/30 transition-colors">
                          <td className="py-4 px-6">
                            <span className="text-white font-semibold text-base">Potential Contract Value</span>
                          </td>
                          <td className="py-4 px-6">
                            <span className="text-white font-semibold text-base">$2M-$50M surfaced in year</span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Verified Sources */}
      <section className="py-24 bg-gradient-to-b from-blue-50 via-white to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-white shadow-sm rounded-full border border-blue-200 mb-6">
              <Shield className="w-5 h-5 text-blue-600 mr-2" />
              <span className="text-sm font-semibold text-blue-700 uppercase tracking-[0.2em]">
                Verified Sources
              </span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Trusted Government Data at Your Fingertips
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              GovSure connects to authoritative U.S. Government systems to deliver compliant,
              audit-ready insights for capture, proposal, and compliance teams.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {verifiedSourceCategories.map(({ title, agencies, description, logos }) => (
              <div
                key={title}
                className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm hover:shadow-lg transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
                    <p className="text-sm text-gray-500 mt-1">{agencies}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {logos.map(({ key, label }) => (
                      <span
                        key={key}
                        className={`verified-sprite verified-sprite--lg ${spriteClassMap[key]}`}
                        role="img"
                        aria-label={label}
                      />
                    ))}
                  </div>
                </div>
                <p className="mt-6 text-gray-600 leading-relaxed">
                  {description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-12 flex flex-wrap justify-center gap-6">
            {verifiedSourceBadges.map((seal) => (
              <div
                key={seal.label}
                className="flex h-20 w-20 flex-col items-center justify-center rounded-full border border-gray-200 bg-white text-center shadow-sm transition-all hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
              >
                <span className={`verified-sprite verified-sprite--sm ${spriteClassMap[seal.spriteKey]}`} role="img" aria-label={seal.label} />
                <span className="mt-1 px-2 text-[10px] font-medium text-gray-600 leading-tight">
                  {seal.subtext}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section - Modern Cards */}
      <section id="features" className="py-24 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            
            <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Everything You Need to Win
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From opportunity discovery to proposal submission, each workspace accelerates a critical GovCon workflow.
            </p>
          </div>

 
          <div className="mt-16">
            <div className="rounded-[32px] border border-blue-500/20 bg-slate-950/90 p-10 shadow-[0_40px_80px_rgba(15,23,42,0.55)]">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mb-10">
            {[
              {
                icon: <Target className="text-blue-200" size={28} />,
                title: 'Smart Opportunity Matching',
                description:
                  'AI monitors SAM.gov 24/7 and scores opportunities based on your capabilities, with automated bid/no-bid recommendations.',
                cta: { label: 'Explore Pipeline', to: '/platform/pipeline' },
                highlights: [
                  'Opportunity scoring with capture-ready summaries',
                  'Competitor radar and historical insights',
                  'KPI dashboard for pursuit ROI'
                ]
              },
              {
                icon: <FileText className="text-emerald-200" size={28} />,
                title: 'AI Proposal Generation',
                description:
                  'Generate Shipley-compliant proposals in minutes with automatic compliance matrices and win theme integration.',
                cta: { label: 'Explore Proposal Workspace', to: '/platform/proposal-workspace' },
                highlights: [
                  'Clause library with ownership and version tracking',
                  'AI drafting assistant tuned to Shipley best practices',
                  'Review rooms that capture pink/red team feedback'
                ]
              },
              {
                icon: <Briefcase className="text-purple-200" size={28} />,
                title: 'Capture Management',
                description:
                  'Centralize your capture plans, competitive intelligence, teaming strategy, and pipeline forecasting.',
                cta: { label: 'Explore Capture HQ', to: '/platform/pipeline' },
                highlights: [
                  'Gate review scorecards and executive briefs',
                  'Partner and subcontractor gap analysis',
                  'Forecasting tied to revenue and resource plans'
                ]
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="group relative overflow-hidden rounded-3xl border border-blue-500/30 bg-slate-900 p-8 shadow-[0_30px_60px_rgba(15,23,42,0.45)] transition-transform duration-300 hover:-translate-y-2 hover:border-blue-400/60"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-900" />
                <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ background: 'radial-gradient(120% 120% at 0% 0%, rgba(59,130,246,0.25), transparent 60%)' }} />
                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-800/80 shadow-inner border border-slate-700`}
                    >
                      {feature.icon}
                    </div>
                    <div>
                      <p className="text-xs font-semibold tracking-[0.3em] text-slate-400 uppercase">Powered by GovSure AI</p>
                      <h3 className="mt-2 text-2xl font-semibold text-white">{feature.title}</h3>
                    </div>
                  </div>
                  <p className="mt-6 text-slate-200 leading-relaxed flex-1 mb-6">{feature.description}</p>
                  
                  <div className="mt-8 flex flex-wrap items-center gap-3">
                    <Link
                      to={feature.cta.to}
                      className="inline-flex items-center gap-2 rounded-xl bg-white text-blue-600 px-5 py-2.5 text-sm font-semibold transition-transform hover:-translate-y-0.5 hover:shadow-lg"
                    >
                      {feature.cta.label}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {platformSections.map((section) => (
                  <div
                    key={section.id}
                    className="group relative overflow-hidden rounded-3xl border border-slate-700/60 bg-slate-900 p-8 transition-transform duration-300 hover:-translate-y-2 hover:border-blue-400/60"
                  >
                    <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ background: 'radial-gradient(120% 120% at 0% 0%, rgba(59,130,246,0.18), transparent 60%)' }} />
                    <div className="relative z-10 flex flex-col h-full">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-800/80 shadow-inner border border-slate-700`}>
                          <section.icon className={`h-6 w-6 ${section.iconClass}`} />
                        </div>
                        <div>
                          <h3 className="text-2xl font-semibold text-white">{section.title}</h3>
                          <p className="mt-1 text-sm text-slate-300">{section.summary}</p>
                        </div>
                      </div>
                      <p className="mt-6 text-slate-200 leading-relaxed flex-1 mb-6">{section.description}</p>
                      <Link
                        to={section.path}
                        className="inline-flex items-center gap-2 rounded-xl bg-white text-blue-600 px-5 py-2.5 text-sm font-semibold transition-transform hover:-translate-y-0.5 hover:shadow-lg mb-2"
                      >
                        Explore {section.title}
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Loved by Government Contractors</h2>
            <div className="flex justify-center space-x-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="text-yellow-400 fill-yellow-400" size={24} />
              ))}
            </div>
            <p className="text-gray-600">5/5 from 100+ reviews</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <TestimonialCard
              quote="GovSure cut our proposal time from 3 weeks to 2 days. The ROI is incredible."
              author="Sam B"
              role="Chief Growth Officer"
              company="StarLight GCS"
              image="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop"
            />
            <TestimonialCard
              quote="Best investment we made this year. Won 3 major contracts in our first quarter."
              author="Collin C"
              role="CEO"
              company="TerraSecure"
              image="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop"
            />
            <TestimonialCard
              quote="The AI compliance checking caught errors we would have missed. Saved us from rejection."
              author="Elijah O"
              role="Proposal Director"
              company="LexLing Consulting"
              image="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop"
            />
          </div>
        </div>
      </section>

      {/* How GovSure Works */}
      <section id="how-it-works" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Header */}
          <div className="text-center mb-16">
            {/* Powred by AI badge - commented out for now */}
            {/* <div className="inline-flex items-center px-4 py-2 bg-blue-50 rounded-full mb-6">
              <Zap className="w-5 h-5 text-blue-600 mr-2" />
              <span className="text-blue-600 font-semibold">Powered by AI</span>
            </div> */}
            <h2 className="text-5xl font-bold text-gray-900 mb-4">
              How <span className="text-blue-600">GovSure</span> Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our streamlined process turns opportunities into wins
            </p>
          </div>

          {/* Process Flow */}
          <div className="relative">
            {/* Connection Line - Desktop */}
            <div className="hidden lg:block absolute top-20 left-0 right-0 h-1 bg-gradient-to-r from-blue-200 via-indigo-300 to-purple-200 mx-24"></div>

            {/* Steps */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-4">
              {/* Step 1: Learn */}
              <div className="relative group">
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all border-2 border-blue-100 hover:border-blue-300 h-full">
                  <div className="absolute -top-4 left-8 bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                    1
                  </div>
                  <div className="mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                      <Target className="w-8 h-8 text-blue-600" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">Learn</h3>
                  <p className="text-gray-600 text-center text-sm">
                    GovSure builds a complete profile of your business, analyzing past performance, certifications, and capabilities.
                  </p>
                </div>
              </div>

              {/* Step 2: Find */}
              <div className="relative group">
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all border-2 border-green-100 hover:border-green-300 h-full">
                  <div className="absolute -top-4 left-8 bg-green-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                    2
                  </div>
                  <div className="mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                      <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">Find</h3>
                  <p className="text-gray-600 text-center text-sm">
                    AI-powered opportunity matching finds contracts perfectly aligned with your capabilities and experience.
                  </p>
                </div>
              </div>

              {/* Step 3: Bid */}
              <div className="relative group">
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all border-2 border-purple-100 hover:border-purple-300 h-full">
                  <div className="absolute -top-4 left-8 bg-purple-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                    3
                  </div>
                  <div className="mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                      <svg className="w-8 h-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">Bid</h3>
                  <p className="text-gray-600 text-center text-sm">
                    Smart pricing analysis and competitive intelligence help you submit winning bids with optimal pricing.
                  </p>
                </div>
              </div>

              {/* Step 4: Respond */}
              <div className="relative group">
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all border-2 border-orange-100 hover:border-orange-300 h-full">
                  <div className="absolute -top-4 left-8 bg-orange-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                    4
                  </div>
                  <div className="mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                      <svg className="w-8 h-8 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">Respond</h3>
                  <p className="text-gray-600 text-center text-sm">
                    Generate compliant, compelling proposals in minutes with AI-powered writing and compliance checking.
                  </p>
                </div>
              </div>

              {/* Step 5: Win */}
              <div className="relative group">
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all border-2 border-cyan-100 hover:border-cyan-300 h-full">
                  <div className="absolute -top-4 left-8 bg-cyan-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                    5
                  </div>
                  <div className="mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-cyan-100 to-cyan-200 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                      <svg className="w-8 h-8 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">Win</h3>
                  <p className="text-gray-600 text-center text-sm">
                    Track progress, manage post-award activities, and leverage insights to win even more contracts.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-16 text-center">
            <button
              onClick={() => setIsDemoModalOpen(true)}
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold text-lg hover:shadow-2xl hover:scale-105 transition-all"
            >
              <Play className="mr-2" size={20} />
              See How It Works
            </button>
            <p className="mt-4 text-gray-600">
              Schedule a personalized walkthrough
            </p>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-gray-600">Start free, scale as you grow</p>
          </div>

          <div className="flex flex-col items-center mb-12">
            <div className="flex items-center gap-4">
              <span className={`text-sm font-semibold transition-colors ${billingCycle === 'monthly' ? 'text-gray-900' : 'text-gray-500'}`}>
                Monthly
              </span>
              <button
                type="button"
                onClick={() => setBillingCycle(prev => prev === 'monthly' ? 'yearly' : 'monthly')}
                role="switch"
                aria-checked={billingCycle === 'yearly'}
                aria-label="Toggle billing frequency"
                className={`relative w-16 h-9 rounded-full transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 ${billingCycle === 'yearly' ? 'bg-indigo-600' : 'bg-gray-300'}`}
              >
                <span
                  className={`absolute top-1 left-1 w-7 h-7 bg-white rounded-full shadow-md transform transition-transform duration-300 ${billingCycle === 'yearly' ? 'translate-x-7' : ''}`}
                />
              </button>
              <span className={`text-sm font-semibold flex items-center gap-2 transition-colors ${billingCycle === 'yearly' ? 'text-gray-900' : 'text-gray-500'}`}>
                Yearly
                <span className="px-2 py-0.5 text-xs font-semibold text-green-700 bg-green-100 rounded-full">
                  Save 25%
                </span>
              </span>
            </div>
            <p className="mt-3 text-sm text-gray-500 text-center">
              {billingCycle === 'monthly'
                ? 'Switch to yearly billing and save 25% on every plan.'
                : 'Prices reflect a 25% discount when billed annually.'}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <PricingCard
              name="Starter"
              priceMonthly={150}
              billingCycle={billingCycle}
              discountRate={discountRate}
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
              priceMonthly={300}
              billingCycle={billingCycle}
              discountRate={discountRate}
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
              customLabel="Custom"
              billingCycle={billingCycle}
              discountRate={discountRate}
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

      {/* Enterprise-Grade Security */}
      <section className="py-24 bg-white relative overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-green-50 border border-green-200 rounded-full mb-6">
              <Shield className="w-5 h-5 text-green-600 mr-2" />
              <span className="text-green-700 font-semibold">Trusted & Secure</span>
            </div>
            <h2 className="text-5xl font-bold text-gray-900 mb-4">
              Enterprise-Grade <span className="text-blue-600">Security</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Your data security is our top priority. GovSure implements industry-leading security measures to protect your sensitive information.
            </p>
          </div>

          {/* Security Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Government-Grade Security */}
            <div className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all border-2 border-blue-100 hover:border-blue-300">
              <div className="mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                  <Shield className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">
                Government-Grade Security
              </h3>
              <p className="text-gray-600 text-center text-sm">
                Built to satisfy strict federal controls and compliance requirements including NIST 800-171 standards.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                <span className="text-xs px-3 py-1 bg-blue-50 text-blue-700 rounded-full">NIST 800-171</span>
                <span className="text-xs px-3 py-1 bg-blue-50 text-blue-700 rounded-full">CMMC Ready</span>
              </div>
            </div>

            {/* AES-256 Encryption */}
            <div className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all border-2 border-purple-100 hover:border-purple-300">
              <div className="mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                  <Lock className="w-8 h-8 text-purple-600" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">
                AES-256 Encryption
              </h3>
              <p className="text-gray-600 text-center text-sm">
                Military-grade data protection with end-to-end encryption for all your sensitive proposal and business data.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                <span className="text-xs px-3 py-1 bg-purple-50 text-purple-700 rounded-full">In Transit</span>
                <span className="text-xs px-3 py-1 bg-purple-50 text-purple-700 rounded-full">At Rest</span>
              </div>
            </div>

            {/* Data Privacy */}
            <div className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all border-2 border-green-100 hover:border-green-300">
              <div className="mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                  <Database className="w-8 h-8 text-green-600" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">
                Data Privacy
              </h3>
              <p className="text-gray-600 text-center text-sm">
                No AI training with your data. Your proposals, business information, and documents remain 100% private and confidential.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                <span className="text-xs px-3 py-1 bg-green-50 text-green-700 rounded-full">SOC 2 Type II</span>
                <span className="text-xs px-3 py-1 bg-green-50 text-green-700 rounded-full">GDPR</span>
              </div>
            </div>

            {/* Granular Access Control */}
            <div className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all border-2 border-orange-100 hover:border-orange-300">
              <div className="mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                  <CheckCircle className="w-8 h-8 text-orange-600" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">
                Granular Access Control
              </h3>
              <p className="text-gray-600 text-center text-sm">
                Granular permissions with restricted user options. Control who sees what with role-based access and audit logs.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                <span className="text-xs px-3 py-1 bg-orange-50 text-orange-700 rounded-full">RBAC</span>
                <span className="text-xs px-3 py-1 bg-orange-50 text-orange-700 rounded-full">Audit Logs</span>
              </div>
            </div>
          </div>

          {/* Additional Security Features */}
          <div className="mt-16 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl p-10 border border-blue-100">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">99.9%</div>
                <div className="text-gray-600 font-medium">Uptime SLA</div>
              </div>
              <div className="text-center border-x border-blue-200 md:border-x md:border-y-0">
                <div className="text-4xl font-bold text-indigo-600 mb-2">24/7</div>
                <div className="text-gray-600 font-medium">Security Monitoring</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-600 mb-2">ISO 27001</div>
                <div className="text-gray-600 font-medium">Ready</div>
              </div>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="mt-16 text-center">
            <p className="text-gray-600 mb-8 text-lg">Trusted by government contractors and compliant with:</p>
            <div className="flex flex-wrap justify-center items-center gap-4">
              <div className="px-6 py-3 bg-white rounded-xl shadow-sm border-2 border-gray-100 hover:border-blue-200 hover:shadow-md transition-all">
                <span className="font-bold text-gray-700">FedRAMP</span>
              </div>
              <div className="px-6 py-3 bg-white rounded-xl shadow-sm border-2 border-gray-100 hover:border-blue-200 hover:shadow-md transition-all">
                <span className="font-bold text-gray-700">SOC 2 Type II</span>
              </div>
              <div className="px-6 py-3 bg-white rounded-xl shadow-sm border-2 border-gray-100 hover:border-blue-200 hover:shadow-md transition-all">
                <span className="font-bold text-gray-700">ISO 27001</span>
              </div>
              <div className="px-6 py-3 bg-white rounded-xl shadow-sm border-2 border-gray-100 hover:border-blue-200 hover:shadow-md transition-all">
                <span className="font-bold text-gray-700">NIST 800-171</span>
              </div>
              <div className="px-6 py-3 bg-white rounded-xl shadow-sm border-2 border-gray-100 hover:border-blue-200 hover:shadow-md transition-all">
                <span className="font-bold text-gray-700">CMMC Ready</span>
              </div>
            </div>
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
            Join 100+ government contractors using AI to win more bids
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="inline-flex items-center justify-center px-10 py-4 bg-white text-blue-600 rounded-xl font-semibold text-lg hover:shadow-2xl hover:scale-105 transition-all"
            >
              Start Your Free Trial
              <ArrowRight className="ml-2" size={20} />
            </Link>
            <button
              onClick={() => setIsDemoModalOpen(true)}
              className="inline-flex items-center justify-center px-10 py-4 bg-transparent border-2 border-white text-white rounded-xl font-semibold text-lg hover:bg-white hover:text-blue-600 hover:shadow-2xl hover:scale-105 transition-all"
            >
              <Play className="mr-2" size={20} />
              Book Demo
            </button>
          </div>
          <p className="mt-6 text-blue-100 text-sm">
            ✨ No credit card required • 7-day free trial • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-6 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <img 
                  src="/govsure-icon.svg" 
                  alt="GovSure" 
                  className="h-10 w-10"
                />
                <span className="text-white font-bold text-xl">GovSure</span>
              </div>
              <p className="text-sm">GovSure is the AI-powered platform that helps contractors and grant-seekers discover government opportunities the moment they’re released, analyze pricing, craft winning proposals and grant applications, ensure compliance, and manage every step from submission to award—giving you the edge to bid smarter, win faster, and grow predictable government and grant revenue.</p>
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
                <li><a href="#" className="hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/about" className="hover:text-white">About</Link></li>
                <li><a href="https://blog.govsureai.com" target="_blank" rel="noopener noreferrer" className="hover:text-white">Blog</a></li>
                <li><Link to="/case-studies" className="hover:text-white">Case Studies</Link></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/privacy" className="hover:text-white">Privacy</Link></li>
                <li><Link to="/terms" className="hover:text-white">Terms</Link></li>
                <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/resources/ai-govcon-webinar" className="hover:text-white">
                    AI for GovCon Free Webinar
                  </Link>
                </li>
                <li>
                  <Link to="/resources/free-govcon-tools" className="hover:text-white">
                    Free Government Contracting Tools
                  </Link>
                </li>
                <li>
                  <Link to="/how-it-works" className="hover:text-white">
                    Learn GovCon
                  </Link>
                </li>
                <li>
                  <Link to="/partner-search" className="hover:text-white">
                    Fractional BD ( Done-For-You BD )                    )
                  </Link>
                </li>
                <li>
                  <Link to="/signup" className="hover:text-white">
                    Start Your GovCon Journey
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p className='mb-2'>🇺🇸 Made in Washington, D.C.</p>
            <p>&copy; 2025 GovSure. All rights reserved.</p>
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
        .verified-sprite {
          display: inline-block;
          width: 48px;
          height: 48px;
          border-radius: 9999px;
          border: 1px solid #e5e7eb;
          background-color: #ffffff;
          background-image: url('/seals/verified-sprite.jpg');
          background-size: 300% 300%;
          background-repeat: no-repeat;
          background-position: center;
        }
        .verified-sprite--lg {
          width: 52px;
          height: 52px;
        }
        .verified-sprite--sm {
          width: 44px;
          height: 44px;
        }
        .verified-sprite--dod { background-position: 0% 0%; }
        .verified-sprite--nasa { background-position: 50% 0%; }
        .verified-sprite--house { background-position: 100% 0%; }
        .verified-sprite--state { background-position: 0% 50%; }
        .verified-sprite--doe { background-position: 50% 50%; }
        .verified-sprite--dia { background-position: 100% 50%; }
        .verified-sprite--nih { background-position: 26% 97%; }
        .verified-sprite--ohio { background-position: 72% 97%; }
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
    <div className="p-6 md:p-8 rounded-2xl bg-white border border-gray-200 hover:shadow-xl transition-all">
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
  priceMonthly,
  customLabel,
  description, 
  features, 
  popular,
  billingCycle,
  discountRate
}: { 
  name: string; 
  priceMonthly?: number;
  customLabel?: string;
  description: string; 
  features: string[]; 
  popular?: boolean;
  billingCycle: 'monthly' | 'yearly';
  discountRate: number;
}) {
  const isCustom = typeof priceMonthly !== 'number';
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: value % 1 === 0 ? 0 : 2,
      maximumFractionDigits: value % 1 === 0 ? 0 : 2,
    }).format(value);

  let displayPrice = '';
  let billedCopy = '';

  if (!isCustom && typeof priceMonthly === 'number') {
    if (billingCycle === 'monthly') {
      displayPrice = formatCurrency(priceMonthly);
      billedCopy = 'Billed monthly. Cancel anytime.';
    } else {
      const discountedMonthly = priceMonthly * (1 - discountRate);
      const roundedMonthly = Math.round(discountedMonthly);
      const annualTotal = roundedMonthly * 12;
      displayPrice = formatCurrency(roundedMonthly);
      billedCopy = `Billed annually at ${formatCurrency(annualTotal)}.`;
    }
  }

  return (
    <div className={`p-6 md:p-8 rounded-2xl bg-white border-2 ${popular ? 'border-blue-600 shadow-2xl scale-105' : 'border-gray-200'} relative`}>
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
        {!isCustom && priceMonthly !== undefined ? (
          <>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold text-gray-900">{displayPrice}</span>
              <span className="text-gray-600 text-lg">/month</span>
            </div>
            {billingCycle === 'yearly' && (
              <span className="inline-flex items-center px-3 py-1 mt-3 text-xs font-semibold text-green-700 bg-green-100 rounded-full">
                Save {Math.round(discountRate * 100)}%
              </span>
            )}
            <p className="text-sm text-gray-500 mt-2">{billedCopy}</p>
          </>
        ) : (
          <span className="text-5xl font-bold text-gray-900">{customLabel ?? 'Custom'}</span>
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

