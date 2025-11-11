import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle, Sparkles } from 'lucide-react';
import { platformSections } from '../content/platformSections';

export default function PlatformAreaPage() {
  const { sectionId } = useParams<{ sectionId: string }>();
  const section = platformSections.find((item) => item.id === sectionId);

  if (!section) {
    return <Navigate to="/" replace />;
  }

  const Icon = section.icon;
  const otherSections = platformSections.filter((item) => item.id !== section.id);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-white to-blue-50">
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to GovSure
          </Link>
          <div className="flex items-center gap-3">
            <Link
              to="/signup"
              className="hidden sm:inline-flex items-center rounded-lg border border-blue-600 px-4 py-2 text-sm font-semibold text-blue-600 transition-colors hover:bg-blue-50"
            >
              Start Free Trial
            </Link>
            <Link
              to={{ pathname: '/', hash: '#book-demo' }}
              className="inline-flex items-center rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-transform hover:scale-105 hover:shadow-lg"
            >
              Book Demo
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 py-24 text-white">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-10 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-white blur-3xl" />
            <div className="absolute bottom-0 right-0 h-72 w-72 translate-x-1/3 translate-y-1/3 rounded-full bg-blue-300 blur-3xl" />
          </div>
          <div className="relative z-10 max-w-6xl mx-auto px-6">
            <div className="inline-flex items-center gap-3 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur">
              <Icon className="h-5 w-5" />
              <span>{section.title}</span>
            </div>
            <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
              {section.title}
            </h1>
            <p className="mt-4 max-w-3xl text-lg sm:text-xl text-blue-100">
              {section.description}
            </p>
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {section.valuePoints.map((point) => (
                <div
                  key={point}
                  className="flex items-start gap-3 rounded-2xl bg-white/15 p-4 text-blue-50"
                >
                  <CheckCircle className="mt-1 h-5 w-5 flex-shrink-0 text-emerald-300" />
                  <p className="text-sm sm:text-base leading-relaxed">{point}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-12">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">
                  Key Workflows
                </p>
                <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-gray-900">
                  What you can run with {section.title}
                </h2>
              </div>
              <Link
                to="/signup"
                className="inline-flex items-center rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 hover:shadow-lg"
              >
                Launch Free Trial
                <Sparkles className="ml-2 h-4 w-4 text-yellow-300" />
              </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {section.features.map((feature) => (
                <div
                  key={feature.title}
                  className="group relative overflow-hidden rounded-3xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-transparent to-purple-50 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <div className="relative z-10">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold">
                        {feature.title.charAt(0)}
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900">{feature.title}</h3>
                    </div>
                    <p className="mt-3 text-base text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="pb-24">
          <div className="max-w-6xl mx-auto px-6">
            <div className="rounded-3xl bg-gray-900 p-10 md:p-14 text-white">
              <div className="grid gap-10 md:grid-cols-[1.3fr_1fr] md:items-center">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-200">
                    Ready to see it live?
                  </p>
                  <h3 className="mt-4 text-3xl font-bold sm:text-4xl">
                    Bring {section.title} into your workflow in days, not months.
                  </h3>
                  <p className="mt-4 text-blue-100">
                    Our onboarding team migrates your templates, clause libraries, and active
                    pursuits so your capture, proposal, and compliance teams can hit the ground
                    running.
                  </p>
                  <ul className="mt-6 space-y-3 text-sm text-blue-100">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-300" />
                      White-glove setup and change management support
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-300" />
                      Continuous AI tuning with GovSure capture specialists
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-300" />
                      Security posture aligned with leading federal contractors
                    </li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <Link
                    to="/signup"
                    className="block w-full rounded-xl bg-white px-6 py-4 text-center text-base font-semibold text-blue-700 transition-transform hover:-translate-y-0.5 hover:shadow-xl"
                  >
                    Start 14-Day Free Trial
                  </Link>
                  <Link
                    to={{ pathname: '/', hash: '#book-demo' }}
                    className="block w-full rounded-xl border border-white/50 px-6 py-4 text-center text-base font-semibold text-white transition-transform hover:-translate-y-0.5 hover:bg-white/10"
                  >
                    Talk with an Expert
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="pb-24">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-10">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">
                  Explore More
                </p>
                <h3 className="mt-3 text-3xl font-bold text-gray-900">
                  Discover other areas of the GovSure workspace
                </h3>
              </div>
              <Link
                to="/"
                className="inline-flex items-center rounded-xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 transition-colors hover:border-blue-200 hover:text-blue-600"
              >
                Return to overview
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {otherSections.map((item) => {
                const ItemIcon = item.icon;
                return (
                  <Link
                    key={item.id}
                    to={item.path}
                    className="group flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-5 transition-all duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
                  >
                    <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${item.iconBg}`}>
                      <ItemIcon className={`h-5 w-5 ${item.iconClass}`} />
                    </div>
                    <div className="mt-4 space-y-2">
                      <p className="text-lg font-semibold text-gray-900">{item.title}</p>
                      <p className="text-sm text-gray-600 line-clamp-2">{item.summary}</p>
                    </div>
                    <span className="mt-6 inline-flex items-center text-sm font-semibold text-blue-600 group-hover:text-blue-700">
                      View details
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}


