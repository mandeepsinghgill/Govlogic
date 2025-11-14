import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, Clock, GraduationCap, Headphones, ShieldCheck, Sparkles, Users } from 'lucide-react';
import Navigation from '../components/Navigation';
import ChatWidget from '../components/ChatWidget';

const registrationUrl = 'https://www.cleat.ai/demo/booking/webinar';

const agenda = [
  { title: 'AI Briefing', detail: 'What FAR-compliant AI can (and cannot) do for BD teams.' },
  { title: 'Pipeline Builder', detail: 'Live walkthrough of multi-portal search and smart alerts.' },
  { title: 'Proposal Sprint', detail: 'See a complete section drafted, redlined, and compliance-checked.' },
  { title: 'Live Q&A', detail: 'Bring your pipeline and get tailored guidance from former COs.' },
];

const outcomes = [
  'Build a GovCon-ready AI stack without hiring another FTE.',
  'Cut capture research from 40 hours to 8 while surfacing better fits.',
  'Stand up a repeatable color-review workflow with AI copilots.',
  'Translate SAM.gov noise into a prioritized, data-backed pursuit list.',
];

export default function GovConWebinar() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navigation />
      <main>
        <Hero />
        <Details />
        <Agenda />
        <Outcomes />
        <Speakers />
        <CTA />
      </main>
      <ChatWidget />
    </div>
  );
}

function Hero() {
  return (
    <section className="bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-950">
      <div className="max-w-6xl mx-auto px-6 py-24 grid gap-12 md:grid-cols-2">
        <div>
          <p className="text-sm uppercase tracking-[0.4em] text-blue-200">Live Training</p>
          <h1 className="mt-4 text-4xl md:text-5xl font-bold leading-tight">
            AI for GovCon: Free Webinar for Capture & Proposal Leaders
          </h1>
          <p className="mt-6 text-lg text-slate-100">
            Learn exactly how top-performing contractors are multiplying their pipeline (without multiplying headcount) using GovSure’s fully compliant AI stack.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <a
              href={registrationUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-2 rounded-full bg-white text-blue-900 px-8 py-3 font-semibold shadow-lg hover:bg-blue-50 transition-all"
            >
              Reserve My Spot <ArrowRight size={18} />
            </a>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-full border border-white/30 px-8 py-3 font-semibold text-white hover:bg-white/10 transition-all"
            >
              Invite My Team
            </Link>
          </div>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur">
          <div className="flex items-center gap-4 text-white">
            <Calendar className="text-blue-200" />
            <p>
              <span className="font-semibold">Every Thursday</span>
              <br />
              1:00–2:00 PM ET (live + recording)
            </p>
          </div>
          <div className="mt-6 flex items-center gap-4 text-white">
            <Clock className="text-blue-200" />
            <p>
              <span className="font-semibold">60 minutes</span>
              <br />
              Includes live demo + Q&A
            </p>
          </div>
          <div className="mt-6 flex items-center gap-4 text-white">
            <ShieldCheck className="text-blue-200" />
            <p>
              <span className="font-semibold">FAR / DFARS aware workflows</span>
              <br />
              Built by former contracting officers
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Details() {
  return (
    <section className="py-20 bg-white text-slate-900">
      <div className="max-w-5xl mx-auto px-6 grid gap-10 md:grid-cols-2">
        <div>
          <h2 className="text-3xl font-bold">What you’ll walk away with</h2>
          <p className="mt-4 text-lg text-slate-600">
            Leave with a ready-to-use playbook for plugging AI into every phase of pursuit—from market intel through oral presentations—plus templates you can deploy immediately.
          </p>
        </div>
        <div className="space-y-4">
          <Benefit icon={<Sparkles size={20} />} title="Step-by-step frameworks" description="Replay-friendly walkthroughs you can train your team on tomorrow morning." />
          <Benefit icon={<GraduationCap size={20} />} title="GovCon-specific prompts" description="Prompts tuned for solicitations, compliance matrices, price narratives, and more." />
          <Benefit icon={<Headphones size={20} />} title="Office hours access" description="Submit your pipeline questions in advance and get live answers during Q&A." />
        </div>
      </div>
    </section>
  );
}

function Benefit({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
        {icon}
      </div>
      <div>
        <p className="text-lg font-semibold text-slate-900">{title}</p>
        <p className="text-slate-600">{description}</p>
      </div>
    </div>
  );
}

function Agenda() {
  return (
    <section className="py-20 bg-slate-50 text-slate-900">
      <div className="max-w-5xl mx-auto px-6">
        <p className="text-sm uppercase tracking-[0.4em] text-blue-700">Agenda</p>
        <h2 className="mt-4 text-3xl font-bold">60 minutes of gov-ready AI training</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {agenda.map((item) => (
            <div key={item.title} className="rounded-3xl bg-white p-6 shadow-sm">
              <p className="text-sm uppercase tracking-wide text-blue-600">{item.title}</p>
              <p className="mt-3 text-lg text-slate-700">{item.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Outcomes() {
  return (
    <section className="py-20 bg-white text-slate-900">
      <div className="max-w-5xl mx-auto px-6 grid gap-8 md:grid-cols-2">
        <div>
          <p className="text-sm uppercase tracking-[0.4em] text-blue-700">Why attend</p>
          <h2 className="mt-4 text-3xl font-bold">Proven outcomes you can replicate</h2>
          <p className="mt-4 text-lg text-slate-600">
            Everything we share comes from real implementations across veteran-owned small businesses, 8(a)s, and mid-market primes.
          </p>
        </div>
        <ul className="space-y-4">
          {outcomes.map((item) => (
            <li key={item} className="flex items-start gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-blue-600" />
              <p className="text-lg text-slate-700">{item}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Speakers() {
  return (
    <section className="py-20 bg-slate-950 text-white">
      <div className="max-w-5xl mx-auto px-6 grid gap-8 md:grid-cols-2">
        <div>
          <p className="text-sm uppercase tracking-[0.4em] text-blue-300">Hosted by</p>
          <h2 className="mt-4 text-3xl font-bold">GovSure’s capture + AI faculty</h2>
          <p className="mt-4 text-lg text-slate-200">
            Former contracting officers, Shipley-certified proposal leads, and AI engineers who ship compliant workflows for GovCon teams every week.
          </p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
          <div className="flex items-center gap-4">
            <Users className="text-blue-200" />
            <div>
              <p className="text-lg font-semibold">Interactive cohort format</p>
              <p className="text-slate-200">Breakout prompts + live teardown of volunteer opportunities.</p>
            </div>
          </div>
          <div className="mt-6 flex items-center gap-4">
            <Sparkles className="text-blue-200" />
            <div>
              <p className="text-lg font-semibold">Downloadable toolkit</p>
              <p className="text-slate-200">Get the prompts, checklists, and scorecards we use internally.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="py-24 bg-gradient-to-r from-blue-900 to-indigo-900 text-white text-center">
      <div className="max-w-3xl mx-auto px-6">
        <p className="text-sm uppercase tracking-[0.4em] text-blue-200">Reserve your seat</p>
        <h2 className="mt-4 text-4xl font-bold">Free to attend. Packed with actionable playbooks.</h2>
        <p className="mt-4 text-lg text-blue-100">Seats are limited to keep Q&A high-impact.</p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <a
            href={registrationUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-2 rounded-full bg-white text-blue-900 px-8 py-3 font-semibold shadow-xl hover:bg-blue-50 transition-all"
          >
            Save My Seat <ArrowRight size={18} />
          </a>
          <Link
            to="/case-studies"
            className="inline-flex items-center gap-2 rounded-full border border-white/30 px-8 py-3 font-semibold text-white hover:bg-white/10 transition-all"
          >
            See Customer Wins
          </Link>
        </div>
      </div>
    </section>
  );
}

