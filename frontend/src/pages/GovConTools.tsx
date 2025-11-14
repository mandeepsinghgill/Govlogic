import { Link } from 'react-router-dom';
import { ArrowRight, BarChart3, CheckCircle2, Download, FolderKanban, Layers, Search, Shield, Workflow } from 'lucide-react';
import Navigation from '../components/Navigation';
import ChatWidget from '../components/ChatWidget';

const toolsUrl = 'https://www.cleat.ai/free-govcon-tools';

const kits = [
  {
    title: 'Bid / No-Bid Matrix',
    description: 'Score opportunities with objective criteria mapped to FAR requirements.',
    icon: <Workflow size={20} />,
  },
  {
    title: 'Opportunity Tracker',
    description: 'Centralize SAM.gov, state, and partner intel with automated reminders.',
    icon: <FolderKanban size={20} />,
  },
  {
    title: 'Compliance Checklist Builder',
    description: 'Generate section-by-section requirements traceability in minutes.',
    icon: <Shield size={20} />,
  },
  {
    title: 'Pricing Storyboard',
    description: 'Model pricing strategies, sensitivity, and evaluation risks visually.',
    icon: <BarChart3 size={20} />,
  },
];

export default function GovConTools() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navigation />
      <main>
        <Hero />
        <Toolset />
        <Usage />
        <Downloads />
        <CTA />
      </main>
      <ChatWidget />
    </div>
  );
}

function Hero() {
  return (
    <section className="bg-gradient-to-br from-slate-950 via-slate-900 to-blue-900">
      <div className="max-w-6xl mx-auto px-6 py-24 grid gap-10 md:grid-cols-2">
        <div>
          <p className="text-sm uppercase tracking-[0.4em] text-blue-200">Free resource kit</p>
          <h1 className="mt-4 text-4xl md:text-5xl font-bold">
            Download the Free Government Contracting Tools Library
          </h1>
          <p className="mt-6 text-lg text-slate-100">
            Templates, scorecards, and automations built by GovSure strategists to accelerate every phase of your GovCon lifecycle. No credit card. No trial. Just plug-and-play leverage.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <a
              href={toolsUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-2 rounded-full bg-white text-blue-900 px-8 py-3 font-semibold shadow-lg hover:bg-blue-50 transition-all"
            >
              Access Toolkit <ArrowRight size={18} />
            </a>
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 rounded-full border border-white/30 px-8 py-3 font-semibold hover:bg-white/10 transition-all"
            >
              Try GovSure Free
            </Link>
          </div>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur">
          <div className="space-y-4">
            <Stat label="Templates Included" value="12+" helper="Proposal + capture workflows" />
            <Stat label="Automations" value="6" helper="Sheets + Notion ready" />
            <Stat label="Implementation Time" value="<30 min" helper="Per tool with guided video" />
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value, helper }: { label: string; value: string; helper: string }) {
  return (
    <div className="rounded-2xl bg-white/10 p-4">
      <p className="text-sm uppercase tracking-wide text-blue-200">{label}</p>
      <p className="text-3xl font-semibold text-white mt-2">{value}</p>
      <p className="text-sm text-slate-200">{helper}</p>
    </div>
  );
}

function Toolset() {
  return (
    <section className="py-20 bg-white text-slate-900">
      <div className="max-w-5xl mx-auto px-6">
        <p className="text-sm uppercase tracking-[0.4em] text-blue-700">Inside the toolkit</p>
        <h2 className="mt-4 text-3xl font-bold">Built by capture strategists, QA’d by proposal pros</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {kits.map((kit) => (
            <div key={kit.title} className="rounded-3xl border border-slate-200 p-6 shadow-sm hover:border-blue-200 transition-colors">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 mb-4">
                {kit.icon}
              </div>
              <p className="text-xl font-semibold">{kit.title}</p>
              <p className="text-slate-600 mt-2">{kit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Usage() {
  return (
    <section className="py-20 bg-slate-50 text-slate-900">
      <div className="max-w-5xl mx-auto px-6 grid gap-10 md:grid-cols-2">
        <div>
          <h2 className="text-3xl font-bold">How teams are using the templates</h2>
          <p className="mt-4 text-lg text-slate-600">
            From veteran-owned start-ups to fast-scaling primes, GovSure customers are using these assets to establish repeatable pursuit playbooks without reinventing the wheel.
          </p>
        </div>
        <ul className="space-y-4">
          <UsageItem text="Operationalize Shipley-style color reviews with auto-generated checklists." />
          <UsageItem text="Create GTM scoreboards for BD, capture, pricing, and proposal in a single workspace." />
          <UsageItem text="Give partners and subs a lightweight pipeline share-out without needing another tool." />
          <UsageItem text="Stand up executive dashboards that trace win probability from intel to submission." />
        </ul>
      </div>
    </section>
  );
}

function UsageItem({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-3">
      <CheckCircle2 className="text-blue-700 mt-1" size={20} />
      <p className="text-lg text-slate-700">{text}</p>
    </li>
  );
}

function Downloads() {
  return (
    <section className="py-20 bg-white text-slate-900">
      <div className="max-w-5xl mx-auto px-6 rounded-3xl border border-slate-200 bg-slate-50 p-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <p className="text-sm uppercase tracking-[0.4em] text-blue-700">Bonus files</p>
            <h3 className="mt-2 text-2xl font-bold">Also includes</h3>
            <ul className="mt-4 space-y-2 text-slate-700">
              <li className="flex items-center gap-2"><Download size={16} /> Growth-ready BD meeting agenda template</li>
              <li className="flex items-center gap-2"><Download size={16} /> GovCon AI prompt library (opportunity, proposal, pricing)</li>
              <li className="flex items-center gap-2"><Download size={16} /> 30-day pipeline sprint checklist</li>
            </ul>
          </div>
          <div className="space-y-3">
            <Callout icon={<Layers size={18} />} title="Formats" body="Google Sheets, Excel, Notion, and PDF versions included." />
            <Callout icon={<Search size={18} />} title="Updates" body="New templates drop monthly—download link auto-updates." />
          </div>
        </div>
      </div>
    </section>
  );
}

function Callout({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
          {icon}
        </div>
        <div>
          <p className="font-semibold">{title}</p>
          <p className="text-sm text-slate-600">{body}</p>
        </div>
      </div>
    </div>
  );
}

function CTA() {
  return (
    <section className="py-24 bg-gradient-to-r from-blue-900 to-indigo-900 text-white text-center">
      <div className="max-w-3xl mx-auto px-6">
        <p className="text-sm uppercase tracking-[0.4em] text-blue-200">Ready in minutes</p>
        <h2 className="mt-4 text-4xl font-bold">Get the exact assets our GovSure strategists deploy</h2>
        <p className="mt-4 text-lg text-blue-100">
          Instant access, no gated sales call. Use them as-is or load them into GovSure to power your automation layer.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <a
            href={toolsUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-2 rounded-full bg-white text-blue-900 px-8 py-3 font-semibold shadow-xl hover:bg-blue-50 transition-all"
          >
            Download Toolkit <ArrowRight size={18} />
          </a>
          <Link
            to="/case-studies"
            className="inline-flex items-center gap-2 rounded-full border border-white/30 px-8 py-3 font-semibold hover:bg-white/10 transition-all"
          >
            See How Teams Use It
          </Link>
        </div>
      </div>
    </section>
  );
}

