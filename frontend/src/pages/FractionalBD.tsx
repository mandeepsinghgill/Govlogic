import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle,
  Target,
  TrendingUp,
  Users,
  Briefcase,
  BarChart3,
  Zap,
  DollarSign,
  Lightbulb,
  Network,
  Rocket,
  Shield,
  Award,
  Clock,
  FileText,
  Phone,
  Mail,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';
import Navigation from '../components/Navigation';
import DemoBookingModal from '../components/DemoBookingModal';
import FAQChatbot from '../components/FAQChatbot';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function FractionalBD() {
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch(`${API_URL}/api/v1/fractional-bd/inquire`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({
          name: '',
          email: '',
          company: '',
          phone: '',
          message: '',
        });
        setTimeout(() => {
          setSubmitStatus('idle');
        }, 5000);
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Error submitting inquiry:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const services = [
    {
      icon: <Target className="w-8 h-8" />,
      title: 'Strategic Business Development',
      description:
        'Develop comprehensive go-to-market strategies tailored to the government contracting space. Identify new opportunities, assess market positioning, and create actionable growth plans.',
      color: 'from-purple-500 to-indigo-500',
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Lead Generation & Pipeline Development',
      description:
        'Build a consistent pipeline of qualified opportunities through targeted outreach, relationship building, and strategic networking within the federal marketplace.',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: <Briefcase className="w-8 h-8" />,
      title: 'Partnership & Teaming Development',
      description:
        'Identify and cultivate strategic partnerships with prime contractors, subcontractors, and complementary service providers to expand your competitive advantage.',
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: <FileText className="w-8 h-8" />,
      title: 'Proposal Support & Capture Strategy',
      description:
        'Expert guidance through the entire capture lifecycle—from opportunity qualification to proposal strategy development and win theme identification.',
      color: 'from-orange-500 to-red-500',
    },
    {
      icon: <Network className="w-8 h-8" />,
      title: 'Market Research & Intelligence',
      description:
        'Deep dive analysis of agency priorities, competitive landscapes, and procurement trends to inform strategic decision-making and opportunity prioritization.',
      color: 'from-pink-500 to-rose-500',
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: 'Performance Analytics & Reporting',
      description:
        'Track and analyze business development metrics, pipeline health, and ROI to optimize strategies and demonstrate value to stakeholders.',
      color: 'from-indigo-500 to-purple-500',
    },
  ];

  const benefits = [
    {
      icon: <DollarSign className="w-6 h-6" />,
      title: 'Cost-Effective Expertise',
      description:
        'Access senior-level BD expertise without the overhead of full-time salaries, benefits, and recruitment costs. Pay only for what you need, when you need it.',
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: 'Flexible Engagement',
      description:
        'Scale services up or down based on your business needs. Perfect for startups, small businesses, or companies exploring new markets without committing to full-time hires.',
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Immediate Impact',
      description:
        'Hit the ground running with proven strategies and processes. No ramp-up time—start seeing results from day one with experienced professionals who know the government market.',
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: 'Specialized Knowledge',
      description:
        'Leverage deep expertise in federal contracting, SAM.gov navigation, GSA schedules, IDIQs, and agency-specific procurement processes that take years to master.',
    },
    {
      icon: <Rocket className="w-6 h-6" />,
      title: 'Accelerated Growth',
      description:
        'Faster time-to-market with opportunities, reduced sales cycles, and increased win rates through strategic BD practices and industry connections.',
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Risk Mitigation',
      description:
        'Test new markets and strategies with lower risk. Evaluate BD approaches before making permanent hiring decisions or major strategic commitments.',
    },
  ];

  const processSteps = [
    {
      number: '01',
      title: 'Discovery & Assessment',
      description:
        'We start by understanding your current BD capabilities, market position, goals, and challenges. This comprehensive assessment informs our tailored approach.',
    },
    {
      number: '02',
      title: 'Strategic Planning',
      description:
        'Develop a customized BD roadmap aligned with your business objectives, target agencies, and available resources. Set clear milestones and success metrics.',
    },
    {
      number: '03',
      title: 'Execution & Implementation',
      description:
        'Our team executes the plan with hands-on BD activities including lead generation, relationship building, opportunity tracking, and strategic outreach.',
    },
    {
      number: '04',
      title: 'Monitoring & Optimization',
      description:
        'Continuously track performance, analyze results, and refine strategies based on data-driven insights and market feedback.',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navigation variant="sticky" />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600 text-white pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-6">
              <span className="text-sm font-semibold">Done-For-You Business Development</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Fractional Business Development Services
            </h1>
            <p className="text-xl md:text-2xl text-indigo-100 mb-8 leading-relaxed">
              Access expert business development professionals without the cost of full-time hires.
              Scale your federal contracting opportunities with flexible, strategic BD support.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() => setIsDemoModalOpen(true)}
                className="px-8 py-4 bg-white text-indigo-600 rounded-lg font-semibold text-lg hover:bg-indigo-50 transition-all duration-300 flex items-center space-x-2 shadow-lg"
              >
                <span>Schedule a Consultation</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <a
                href="#services"
                className="px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white rounded-lg font-semibold text-lg hover:bg-white/20 transition-all duration-300"
              >
                Learn More
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* What is Fractional BD Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">What is Fractional Business Development?</h2>
              <p className="text-lg text-gray-600 mb-4 leading-relaxed">
                Fractional Business Development (Done-For-You BD) is a flexible engagement model that provides
                your company with experienced business development professionals on a part-time or project basis.
                Instead of hiring full-time BD staff, you gain access to senior-level expertise and strategic
                support without the overhead costs.
              </p>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                This approach is ideal for government contractors who need strategic BD guidance but aren't ready
                for a full-time hire, want to explore new markets, or need specialized expertise for specific
                initiatives or contract pursuits.
              </p>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Scalable Engagement</h3>
                    <p className="text-gray-600">
                      Adjust BD resources up or down based on pipeline, opportunities, and budget.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Immediate Expertise</h3>
                    <p className="text-gray-600">
                      Tap into years of government contracting knowledge and proven processes from day one.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Risk-Free Testing</h3>
                    <p className="text-gray-600">
                      Evaluate BD strategies and approaches before making permanent hiring commitments.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl p-8 shadow-xl">
                <div className="space-y-6">
                  <div className="bg-white rounded-lg p-6 shadow-md">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                        <Target className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">Targeted Outreach</h3>
                        <p className="text-sm text-gray-600">Strategic agency engagement</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-6 shadow-md">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                        <Network className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">Partnership Development</h3>
                        <p className="text-sm text-gray-600">Strategic teaming relationships</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-6 shadow-md">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">Pipeline Growth</h3>
                        <p className="text-sm text-gray-600">Qualified opportunities</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Fractional BD Services</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive business development support tailored to your government contracting needs
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-200 hover:shadow-xl transition-all duration-300 group"
              >
                <div
                  className={`w-16 h-16 bg-gradient-to-br ${service.color} rounded-lg flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-300`}
                >
                  {service.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{service.title}</h3>
                <p className="text-gray-600 leading-relaxed">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose Fractional BD?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The smart way to scale your business development without scaling your overhead
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center text-white mb-4">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{benefit.title}</h3>
                <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our proven process for delivering strategic BD results
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {processSteps.map((step, index) => (
              <div key={index} className="relative">
                {index < processSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 transform translate-x-4"></div>
                )}
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-8 text-white relative z-10">
                  <div className="text-5xl font-bold text-white/20 mb-4">{step.number}</div>
                  <h3 className="text-xl font-bold mb-4">{step.title}</h3>
                  <p className="text-indigo-100 leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ideal For Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Perfect For</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Fractional BD services are ideal for companies in these situations
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-8 shadow-lg text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Rocket className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Startups & Small Businesses</h3>
              <p className="text-gray-600">
                Companies ready to enter the federal market but need strategic BD guidance without full-time overhead.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Companies Exploring New Markets</h3>
              <p className="text-gray-600">
                Organizations expanding into new agencies or service areas and need specialized BD expertise.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lightbulb className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Companies Testing BD Approaches</h3>
              <p className="text-gray-600">
                Organizations wanting to evaluate BD strategies before committing to permanent hiring decisions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Accelerate Your BD Efforts?</h2>
          <p className="text-xl text-indigo-100 mb-8">
            Let's discuss how our Fractional BD services can help you win more government contracts.
            Schedule a free consultation today.
          </p>
          <button
            onClick={() => setIsDemoModalOpen(true)}
            className="px-8 py-4 bg-white text-indigo-600 rounded-lg font-semibold text-lg hover:bg-indigo-50 transition-all duration-300 inline-flex items-center space-x-2 shadow-lg"
          >
            <span>Get Started</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-xl p-8 md:p-12">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Get in Touch</h2>
              <p className="text-lg text-gray-600">
                Have questions about our Fractional BD services? We'd love to hear from you.
              </p>
            </div>

            {submitStatus === 'success' && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-semibold">
                    Thank you for your inquiry! We'll be in touch soon.
                  </span>
                </div>
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
                <div className="flex items-center space-x-2">
                  <X className="w-5 h-5" />
                  <span className="font-semibold">
                    There was an error submitting your inquiry. Please try again.
                  </span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    required
                    value={formData.company}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Your Company"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={6}
                  value={formData.message}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Tell us about your BD needs and goals..."
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold text-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <span>Send Inquiry</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </section>

      <FAQChatbot />
      <DemoBookingModal isOpen={isDemoModalOpen} onClose={() => setIsDemoModalOpen(false)} />
    </div>
  );
}

