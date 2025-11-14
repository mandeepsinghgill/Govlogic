import { Link } from 'react-router-dom';
import { ArrowRight, ExternalLink } from 'lucide-react';
import Navigation from '../components/Navigation';
import ChatWidget from '../components/ChatWidget';
import { CaseStudy, caseStudies, supportingContent } from '../content/caseStudies';

export default function CaseStudies() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navigation />

      <main>
        <Hero />
        <CaseStudyGrid />
        <TeamSection />
        <NumbersSection />
        <Differentiators />
        <CTASection />
        <Resources />
        <ContactStrip />
      </main>

      <ChatWidget />
    </div>
  );
}

function Hero() {
  return (
    <section className="bg-gradient-to-br from-slate-950 via-blue-900/70 to-slate-900 py-24">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <p className="text-blue-200 uppercase tracking-[0.3em] text-xs mb-6">Case Study Library</p>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
          {supportingContent.headline}
        </h1>
        <p className="mt-6 text-lg md:text-xl text-slate-200 max-w-3xl mx-auto">
          {supportingContent.subheadline}
        </p>
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {supportingContent.numbers.rows.slice(0, 3).map((row) => (
            <div
              key={row.metric}
              className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur"
            >
              <p className="text-sm uppercase tracking-wide text-blue-200">{row.metric}</p>
              <p className="text-2xl font-semibold mt-2">{row.result}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CaseStudyGrid() {
  return (
    <section className="bg-white text-slate-900 py-24">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.4em] text-blue-700">
              Real Stories
            </p>
            <h2 className="text-3xl md:text-4xl font-bold mt-2">Four companies, four breakthrough wins.</h2>
          </div>
          <p className="text-lg text-slate-600 max-w-lg">
            Browse the highlights below, then click through to explore the full playbooks, timelines,
            and outcomes for every GovSure customer story.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {caseStudies.map((study) => (
            <CaseStudyCard key={study.slug} study={study} />
          ))}
        </div>
      </div>
    </section>
  );
}

function CaseStudyCard({ study }: { study: CaseStudy }) {
  return (
    <article className="rounded-3xl border border-slate-200 p-8 shadow-lg hover:-translate-y-1 hover:shadow-2xl transition-all duration-200">
      <div className="flex items-center gap-3">
        <div className="text-3xl">{study.emoji}</div>
        <div>
          <p className="text-sm uppercase tracking-wide text-slate-500">{study.industry}</p>
          <h3 className="text-2xl font-bold text-slate-900">{study.title}</h3>
        </div>
      </div>
      <p className="mt-6 text-base text-slate-600">{study.summary}</p>
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {study.heroStats.map((stat) => (
          <div key={stat.label} className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-500">{stat.label}</p>
            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            {stat.helper && <p className="text-xs text-slate-500 mt-1">{stat.helper}</p>}
          </div>
        ))}
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        {study.impact.slice(0, 2).map((point) => (
          <span
            key={point.label}
            className="inline-flex items-center rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-900"
          >
            {point.label} • {point.description}
          </span>
        ))}
      </div>
      <div className="mt-10 flex items-center justify-between">
        <p className="text-sm uppercase tracking-[0.4em] text-slate-500">{study.company}</p>
        <Link
          to={`/case-studies/${study.slug}`}
          className="inline-flex items-center gap-2 text-blue-700 font-semibold hover:gap-3 transition-all"
        >
          Read Full Story <ArrowRight size={18} />
        </Link>
      </div>
    </article>
  );
}

function TeamSection() {
  return (
    <section className="py-24 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.4em] text-blue-300">
            {supportingContent.team.title}
          </p>
          <h2 className="mt-4 text-3xl md:text-4xl font-bold">{supportingContent.team.intro}</h2>
          <div className="mt-8 space-y-4">
            {supportingContent.team.dna.map((item) => (
              <p key={item} className="text-lg text-slate-200">
                {item}
              </p>
            ))}
          </div>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur">
          <p className="text-sm uppercase tracking-[0.4em] text-blue-200">Why we're different</p>
          <div className="mt-6 space-y-4">
            {supportingContent.team.differentiators.map((item) => (
              <p key={item} className="text-slate-100">
                {item}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function NumbersSection() {
  return (
    <section className="py-24 bg-white text-slate-900">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto">
          <p className="text-sm font-semibold uppercase tracking-[0.4em] text-blue-700">
            {supportingContent.numbers.title}
          </p>
          <h2 className="text-3xl md:text-4xl font-bold mt-4">{supportingContent.numbers.intro}</h2>
        </div>
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          {supportingContent.numbers.rows.map((row) => (
            <div key={row.metric} className="rounded-2xl border border-slate-200 p-6 shadow-sm">
              <p className="text-sm uppercase tracking-wide text-slate-500">{row.metric}</p>
              <p className="text-2xl font-semibold mt-2 text-slate-900">{row.result}</p>
            </div>
          ))}
        </div>
        <div className="mt-12 rounded-3xl bg-blue-900 text-white p-8 md:p-12">
          <p className="text-sm font-semibold uppercase tracking-[0.4em] text-blue-200">
            What this means for you
          </p>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {supportingContent.numbers.whatItMeans.map((item) => (
              <p key={item} className="text-lg">
                ✅ {item}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Differentiators() {
  return (
    <section className="py-24 bg-slate-950 text-white">
      <div className="max-w-5xl mx-auto px-6">
        <p className="text-sm font-semibold uppercase tracking-[0.4em] text-blue-300">
          {supportingContent.whyDifferent.title}
        </p>
        <div className="mt-10 space-y-6 text-lg text-slate-100">
          {supportingContent.whyDifferent.bullets.map((bullet) => (
            <p key={bullet} className="rounded-3xl border border-white/10 bg-white/5 p-6">
              {bullet}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-24 bg-gradient-to-r from-blue-900 to-indigo-900 text-white">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.4em] text-blue-200">
          {supportingContent.cta.title}
        </p>
        <h2 className="mt-4 text-4xl font-bold">{supportingContent.cta.description}</h2>
        <p className="mt-4 text-lg text-blue-100">{supportingContent.cta.finePrint}</p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          {supportingContent.cta.actions.map((action) =>
            action.external ? (
              <a
                key={action.label}
                href={action.href}
                target="_blank"
                rel="noreferrer noopener"
                className={`inline-flex items-center gap-2 rounded-full px-8 py-3 text-base font-semibold transition-all ${
                  action.primary
                    ? 'bg-white text-blue-900 shadow-xl hover:bg-blue-50'
                    : 'border border-white/40 text-white hover:bg-white/10'
                }`}
              >
                {action.label}
                <ExternalLink size={16} />
              </a>
            ) : (
              <Link
                key={action.label}
                to={action.href}
                className={`inline-flex items-center gap-2 rounded-full px-8 py-3 text-base font-semibold transition-all ${
                  action.primary
                    ? 'bg-white text-blue-900 shadow-xl hover:bg-blue-50'
                    : 'border border-white/40 text-white hover:bg-white/10'
                }`}
              >
                {action.label}
              </Link>
            )
          )}
        </div>
      </div>
    </section>
  );
}

function Resources() {
  return (
    <section className="py-24 bg-white text-slate-900">
      <div className="max-w-5xl mx-auto px-6">
        <p className="text-sm font-semibold uppercase tracking-[0.4em] text-blue-700">
          More Resources
        </p>
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
          {supportingContent.resources.map((resource) => (
            <div
              key={resource.label}
              className="rounded-2xl border border-slate-200 p-6 hover:border-blue-200 hover:shadow-md transition-all"
            >
              <p className="text-lg font-semibold text-slate-900">{resource.label}</p>
              <p className="text-slate-600 mt-2">{resource.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ContactStrip() {
  return (
    <section className="py-16 bg-slate-950 text-slate-200 border-t border-white/5">
      <div className="max-w-5xl mx-auto px-6 text-center space-y-4">
        <p>{supportingContent.contact.city}</p>
        <p className="text-lg font-semibold">{supportingContent.contact.company}</p>
        <p>
          📧 {supportingContent.contact.email} | 📱 {supportingContent.contact.phone} | 🌐{' '}
          {supportingContent.contact.site}
        </p>
        <div className="flex flex-wrap justify-center gap-6 text-sm text-slate-400">
          {supportingContent.contact.links.map((link) =>
            link.href.startsWith('/') ? (
              <Link key={link.label} to={link.href} className="hover:text-white transition-colors">
                {link.label}
              </Link>
            ) : (
              <a key={link.label} href={link.href} className="hover:text-white transition-colors">
                {link.label}
              </a>
            )
          )}
        </div>
      </div>
    </section>
  );
}

