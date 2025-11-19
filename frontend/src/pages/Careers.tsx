import { Link } from 'react-router-dom';
import { 
  ArrowRight, CheckCircle, Users, Briefcase, Code, Paintbrush, Megaphone,
  Menu, X, Youtube, Linkedin, Twitter, User, Mail, Phone, MapPin, Upload,
  Award, Target, Zap, Heart, TrendingUp, Building2
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import DemoBookingModal from '../components/DemoBookingModal';
import FAQChatbot from '../components/FAQChatbot';
import Navigation from '../components/Navigation';

// Facebook Icon Component
const FacebookIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
  </svg>
);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const teamMembers = [
  {
    id: 1,
    name: 'Sarah Chen',
    role: 'CEO & Founder',
    department: 'Leadership',
    description: 'Visionary leader with 15+ years in government contracting and AI technology. Former DoD contractor with deep expertise in proposal management and business development. Leads strategic vision and company direction.',
    image: '/team/ceo.jpg',
    icon: <Building2 className="w-8 h-8" />
  },
  {
    id: 2,
    name: 'Michael Rodriguez',
    role: 'Senior Backend Developer',
    department: 'Engineering',
    description: 'Full-stack engineer specializing in scalable cloud infrastructure and microservices. Expert in Python, FastAPI, and PostgreSQL with a passion for solving complex technical challenges. Leads backend architecture decisions.',
    image: '/team/backend1.jpg',
    icon: <Code className="w-8 h-8" />
  },
  {
    id: 3,
    name: 'David Kim',
    role: 'Backend Developer',
    department: 'Engineering',
    description: 'API architect focused on building robust backend systems. Strong background in database optimization and system integration for enterprise applications. Ensures system reliability and performance.',
    image: '/team/backend2.jpg',
    icon: <Code className="w-8 h-8" />
  },
  {
    id: 4,
    name: 'Emily Zhang',
    role: 'Backend Developer',
    department: 'Engineering',
    description: 'Cloud-native developer with expertise in containerization and DevOps. Passionate about writing clean, maintainable code and improving system performance. Implements CI/CD pipelines and infrastructure automation.',
    image: '/team/backend3.jpg',
    icon: <Code className="w-8 h-8" />
  },
  {
    id: 5,
    name: 'Jessica Park',
    role: 'Senior Frontend Developer',
    department: 'Engineering',
    description: 'UI/UX specialist creating beautiful, intuitive interfaces. Expert in React, TypeScript, and modern design systems. Passionate about accessibility and user experience. Leads frontend architecture and design system.',
    image: '/team/frontend1.jpg',
    icon: <Paintbrush className="w-8 h-8" />
  },
  {
    id: 6,
    name: 'Alex Thompson',
    role: 'Frontend Developer',
    department: 'Engineering',
    description: 'Creative developer building responsive web applications. Skilled in React ecosystem, state management, and creating delightful user interactions. Focuses on performance optimization and user engagement.',
    image: '/team/frontend2.jpg',
    icon: <Paintbrush className="w-8 h-8" />
  },
  {
    id: 7,
    name: 'Rachel Martinez',
    role: 'Marketing Director',
    department: 'Marketing',
    description: 'Growth marketing expert with a track record of scaling B2B SaaS companies. Specializes in content marketing, SEO, and demand generation for tech companies. Develops comprehensive marketing strategies.',
    image: '/team/marketing1.jpg',
    icon: <Megaphone className="w-8 h-8" />
  },
  {
    id: 8,
    name: 'Jordan Lee',
    role: 'Marketing Manager',
    department: 'Marketing',
    description: 'Digital marketing strategist focused on brand awareness and customer acquisition. Expert in social media, email marketing, and marketing automation platforms. Executes campaigns and analyzes performance metrics.',
    image: '/team/marketing2.jpg',
    icon: <Megaphone className="w-8 h-8" />
  },
  {
    id: 9,
    name: 'Taylor Brown',
    role: 'Product Manager',
    department: 'Product',
    description: 'Product strategist translating user needs into exceptional features. Experienced in agile development, user research, and cross-functional collaboration. Bridges the gap between technical teams and customers.',
    image: '/team/pm.jpg',
    icon: <Target className="w-8 h-8" />
  },
  {
    id: 10,
    name: 'Morgan Davis',
    role: 'Customer Success Manager',
    department: 'Customer Success',
    description: 'Dedicated to ensuring customer satisfaction and success. Expert in onboarding, training, and building strong relationships with government contractors. Ensures clients achieve maximum value from our platform.',
    image: '/team/cs.jpg',
    icon: <Heart className="w-8 h-8" />
  }
];

const openPositions = [
  {
    id: 1,
    title: 'Senior Full-Stack Developer',
    department: 'Engineering',
    location: 'Remote / Hybrid',
    type: 'Full-time',
    description: 'We\'re looking for an experienced full-stack developer to join our growing engineering team. You\'ll work on building scalable features for our government contracting platform.',
    requirements: [
      '5+ years of experience in software development',
      'Proficiency in Python, React, and TypeScript',
      'Experience with PostgreSQL and Redis',
      'Strong understanding of RESTful APIs and microservices',
      'Experience with cloud platforms (AWS, GCP, or Azure)'
    ],
    responsibilities: [
      'Design and develop new features and enhancements',
      'Collaborate with cross-functional teams on product development',
      'Write clean, maintainable, and well-tested code',
      'Participate in code reviews and technical discussions',
      'Mentor junior developers'
    ]
  },
  {
    id: 2,
    title: 'DevOps Engineer',
    department: 'Engineering',
    location: 'Remote',
    type: 'Full-time',
    description: 'Join our infrastructure team to help scale our platform and improve deployment processes. You\'ll work with Docker, Kubernetes, and CI/CD pipelines.',
    requirements: [
      '3+ years of DevOps experience',
      'Strong knowledge of Docker and containerization',
      'Experience with Kubernetes or similar orchestration tools',
      'Proficiency in Linux system administration',
      'Experience with CI/CD tools (GitHub Actions, GitLab CI, etc.)'
    ],
    responsibilities: [
      'Manage and improve infrastructure and deployment pipelines',
      'Monitor system performance and optimize resources',
      'Implement security best practices',
      'Automate operational processes',
      'Collaborate with development teams on infrastructure needs'
    ]
  },
  {
    id: 3,
    title: 'Business Development Representative',
    department: 'Sales',
    location: 'Remote / Hybrid',
    type: 'Full-time',
    description: 'Help grow our customer base by identifying and qualifying leads in the government contracting space. This is a great opportunity to learn and grow in B2B SaaS sales.',
    requirements: [
      '1-3 years of experience in sales or business development',
      'Excellent communication and interpersonal skills',
      'Ability to work in a fast-paced environment',
      'Experience with CRM systems (Salesforce, HubSpot, etc.)',
      'Knowledge of government contracting is a plus'
    ],
    responsibilities: [
      'Generate and qualify leads through outbound prospecting',
      'Conduct initial discovery calls with prospects',
      'Schedule product demos with qualified leads',
      'Maintain accurate records in CRM',
      'Collaborate with sales and marketing teams'
    ]
  },
  {
    id: 4,
    title: 'UX/UI Designer',
    department: 'Design',
    location: 'Remote',
    type: 'Full-time',
    description: 'Create beautiful, intuitive user experiences for our platform. You\'ll work closely with product and engineering teams to design features that users love.',
    requirements: [
      '3+ years of UX/UI design experience',
      'Strong portfolio demonstrating design thinking',
      'Proficiency in Figma, Sketch, or Adobe XD',
      'Understanding of user research and testing methodologies',
      'Knowledge of front-end development principles'
    ],
    responsibilities: [
      'Design user interfaces and user flows',
      'Create wireframes, prototypes, and high-fidelity designs',
      'Conduct user research and usability testing',
      'Collaborate with product and engineering teams',
      'Maintain and evolve our design system'
    ]
  }
];

export default function Careers() {
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    position: '',
    coverLetter: '',
    resume: null as File | null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, resume: e.target.files![0] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('full_name', formData.fullName);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('position', formData.position);
      formDataToSend.append('cover_letter', formData.coverLetter);
      if (formData.resume) {
        formDataToSend.append('resume', formData.resume);
      }

      const response = await fetch(`${API_URL}/api/v1/careers/apply`, {
        method: 'POST',
        body: formDataToSend,
      });

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({
          fullName: '',
          email: '',
          phone: '',
          position: '',
          coverLetter: '',
          resume: null
        });
        setTimeout(() => {
          setSubmitStatus('idle');
          setSelectedJob(null);
        }, 5000);
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (selectedJob) {
      const job = openPositions.find(j => j.id === selectedJob);
      if (job) {
        setFormData(prev => ({ ...prev, position: job.title }));
      }
    }
  }, [selectedJob]);

  return (
    <div className="min-h-screen bg-white">
      <Navigation variant="sticky" />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 text-white pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Join the GovSure Team
            </h1>
            <p className="text-xl md:text-2xl text-purple-100 mb-8 max-w-3xl mx-auto">
              We're building the future of government contracting with AI-powered tools. 
              Join our team of passionate professionals making a real impact.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-lg">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-6 h-6" />
                <span>Remote-first culture</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-6 h-6" />
                <span>Competitive benefits</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-6 h-6" />
                <span>Growth opportunities</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      

      {/* Open Positions Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Open Positions</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We're always looking for talented individuals to join our team
            </p>
          </div>

          <div className="space-y-6">
            {openPositions.map((job) => (
              <div
                key={job.id}
                className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-purple-500 transition-colors duration-300"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{job.title}</h3>
                    <div className="flex flex-wrap gap-3 mb-4">
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                        {job.department}
                      </span>
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                        {job.location}
                      </span>
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                        {job.type}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-4">{job.description}</p>
                    
                    {selectedJob === job.id && (
                      <div className="mt-6 space-y-4">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Key Responsibilities:</h4>
                          <ul className="list-disc list-inside space-y-1 text-gray-600">
                            {job.responsibilities.map((resp, idx) => (
                              <li key={idx}>{resp}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Requirements:</h4>
                          <ul className="list-disc list-inside space-y-1 text-gray-600">
                            {job.requirements.map((req, idx) => (
                              <li key={idx}>{req}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => setSelectedJob(selectedJob === job.id ? null : job.id)}
                    className="mt-4 md:mt-0 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 flex items-center space-x-2"
                  >
                    <span>{selectedJob === job.id ? 'Hide Details' : 'View Details'}</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Application Form Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Apply Now</h2>
              <p className="text-lg text-gray-600">
                Ready to join our team? Fill out the form below and we'll get back to you soon.
              </p>
            </div>

            {submitStatus === 'success' && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-semibold">Application submitted successfully! We'll be in touch soon.</span>
                </div>
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
                <div className="flex items-center space-x-2">
                  <X className="w-5 h-5" />
                  <span className="font-semibold">There was an error submitting your application. Please try again.</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-2">
                  Position Applied For <span className="text-red-500">*</span>
                </label>
                <select
                  id="position"
                  name="position"
                  required
                  value={formData.position}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Select a position</option>
                  {openPositions.map((job) => (
                    <option key={job.id} value={job.title}>
                      {job.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="john@example.com"
                  />
                </div>
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div>
                <label htmlFor="resume" className="block text-sm font-medium text-gray-700 mb-2">
                  Resume/CV <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="file"
                    id="resume"
                    name="resume"
                    required
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                  />
                  {formData.resume && (
                    <span className="text-sm text-gray-600">{formData.resume.name}</span>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="coverLetter" className="block text-sm font-medium text-gray-700 mb-2">
                  Cover Letter <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="coverLetter"
                  name="coverLetter"
                  required
                  rows={6}
                  value={formData.coverLetter}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Tell us why you're interested in this position and what makes you a great fit..."
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-semibold text-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Application</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Why Join Us Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Join GovSure?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We're not just building software—we're transforming an entire industry
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Cutting-Edge Technology</h3>
              <p className="text-gray-600">
                Work with the latest AI and cloud technologies in a modern tech stack
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Growth Opportunities</h3>
              <p className="text-gray-600">
                Fast-growing startup with room for career advancement and skill development
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Great Culture</h3>
              <p className="text-gray-600">
                Collaborative, inclusive environment where your voice matters
              </p>
            </div>
          </div>
        </div>
      </section>

      <FAQChatbot />
    </div>
  );
}

