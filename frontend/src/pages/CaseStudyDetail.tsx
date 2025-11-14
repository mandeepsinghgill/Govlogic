import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Quote } from 'lucide-react';
import Navigation from '../components/Navigation';
import ChatWidget from '../components/ChatWidget';
import { caseStudies, supportingContent } from '../content/caseStudies';

export default function CaseStudyDetail() {
  const { slug } = useParams();
  const study = caseStudies.find((item) => item.slug === slug);

  if (!study) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <Navigation />
        <main className="py-24">
          <div className="max-w-3xl mx-auto px-6 text-center space-y-6">
            <p className="text-sm uppercase tracking-[0.4em] text-blue-300">Case Study</p>
            <h1 className="text-4xl font-bold">We couldn’t find that story.</h1>
            <p className="text-lg text-slate-300">
              The case study you’re looking for has been moved or no longer exists. Explore the full
              library to find another transformation.
            </p>
            <Link
              to="/case-studies"
              className="inline-flex items-center gap-2 rounded-full bg-white text-blue-900 px-8 py-3 font-semibold"
            >
              Back to Case Studies <ArrowRight size={18} />
            </Link>
          </div>
        </main>
        <ChatWidget />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navigation />
      <main>
        <Hero study={study} />
        <ChallengeSection study={study} />
        <TransformationSection study={study} />
        <ImpactSection study={study} />
        <QuoteBlock study={study} />
        <SupportSections />
        <ContactStrip />
      </main>
      <ChatWidget />
    </div>
  );
}

function Hero({ study }: { study: (typeof caseStudies)[number] }) {
  return (
    <section className="bg-gradient-to-br from-slate-950 via-blue-900/60 to-slate-900 py-20">
      <div className="max-w-5xl mx-auto px-6">
        <Link
          to="/case-studies"
          className="inline-flex items-center gap-2 text-sm text-blue-200 hover:text-white transition-colors"
        >
          <ArrowLeft size={16} /> Back to case studies
        </Link>
        <div className="mt-10 flex items-start gap-6">
          <div className="text-6xl">{study.emoji}</div>
          <div>
            <p className="uppercase tracking-[0.3em] text-blue-200 text-xs">{study.industry}</p>
            <h1 className="text-4xl md:text-5xl font-bold mt-4">{study.title}</h1>
            <p className="mt-4 text-lg text-slate-200 max-w-3xl">{study.resultsSummary}</p>
            <p className="mt-2 text-sm text-slate-300">{study.statsHighlight}</p>
          </div>
        </div>
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {study.heroStats.map((stat) => (
            <div key={stat.label} className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <p className="text-sm uppercase tracking-wide text-blue-200">{stat.label}</p>
              <p className="text-3xl font-semibold mt-3 text-white">{stat.value}</p>
              {stat.helper && <p className="text-sm text-slate-300 mt-2">{stat.helper}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ChallengeSection({ study }: { study: (typeof caseStudies)[number] }) {
  return (
    <section className="py-20 bg-white text-slate-900">
      <div className="max-w-4xl mx-auto px-6 space-y-6">
        <p className="text-sm font-semibold uppercase tracking-[0.4em] text-blue-700">
          {study.challenge.heading}
        </p>
        {study.challenge.description.map((paragraph) => (
          <p key={paragraph} className="text-lg text-slate-700 leading-relaxed">
            {paragraph}
          </p>
        ))}
      </div>
    </section>
  );
}

function TransformationSection({ study }: { study: (typeof caseStudies)[number] }) {
  return (
    <section className="py-20 bg-slate-50 text-slate-900">
      <div className="max-w-5xl mx-auto px-6">
        <h2 className="text-3xl font-bold">The Transformation</h2>
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          {study.transformation.map((step) => (
            <div key={step.label} className="rounded-3xl bg-white p-6 shadow">
              <p className="text-sm uppercase tracking-wide text-blue-700">{step.label}</p>
              <p className="mt-3 text-lg text-slate-800">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ImpactSection({ study }: { study: (typeof caseStudies)[number] }) {
  return (
    <section className="py-20 bg-white text-slate-900">
      <div className="max-w-5xl mx-auto px-6">
        <h2 className="text-3xl font-bold">Measured Impact</h2>
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
          {study.impact.map((item) => (
            <div
              key={item.label}
              className="rounded-3xl border border-slate-200 p-6 hover:border-blue-200 transition-colors"
            >
              <p className="text-2xl font-semibold text-slate-900">{item.label}</p>
              <p className="text-slate-600 mt-2">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function QuoteBlock({ study }: { study: (typeof caseStudies)[number] }) {
  return (
    <section className="py-20 bg-gradient-to-br from-blue-900 to-indigo-900 text-white">
      <div className="max-w-4xl mx-auto px-6 text-center space-y-6">
        <Quote size={48} className="mx-auto text-blue-200" />
        <p className="text-2xl leading-relaxed">&ldquo;{study.quote.text}&rdquo;</p>
        <p className="text-sm uppercase tracking-[0.4em] text-blue-200">{study.quote.attribution}</p>
      </div>
    </section>
  );
}

function SupportSections() {
  return (
    <>
      <section className="py-20 bg-white text-slate-900">
        <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <p className="text-sm uppercase tracking-[0.4em] text-blue-700">
              {supportingContent.team.title}
            </p>
            <h3 className="text-3xl font-bold mt-4">{supportingContent.team.intro}</h3>
            <div className="mt-6 space-y-3 text-lg text-slate-700">
              {supportingContent.team.dna.map((item) => (
                <p key={item}>{item}</p>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-slate-200 p-6">
            <p className="text-sm uppercase tracking-[0.4em] text-blue-700">
              Why GovSure wins
            </p>
            <div className="mt-4 space-y-3 text-slate-700">
              {supportingContent.whyDifferent.bullets.map((bullet) => (
                <p key={bullet}>• {bullet}</p>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-slate-950 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-sm uppercase tracking-[0.4em] text-blue-200">
            {supportingContent.cta.title}
          </p>
          <h3 className="text-4xl font-bold mt-4">{supportingContent.cta.description}</h3>
          <p className="mt-4 text-slate-300">{supportingContent.cta.finePrint}</p>
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
                  <ArrowRight size={16} />
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
    </>
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

