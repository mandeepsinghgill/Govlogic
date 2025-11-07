import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowRight, ArrowLeft, Target, FileText, Users, Zap, Play, Sparkles, Star } from 'lucide-react';
import ProductTour from '../components/ProductTour';

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [showTour, setShowTour] = useState(false);
  const [data, setData] = useState({
    primary_use: '',
    team_size: '',
    industry: '',
    goals: [] as string[],
    subscription_tier: 'free',
    user_types: [] as string[]
  });

  const handleComplete = () => {
    // Save onboarding data
    localStorage.setItem('onboarding_completed', 'true');
    localStorage.setItem('onboarding_data', JSON.stringify(data));
    
    // Redirect to dashboard
    navigate('/dashboard');
  };

  const toggleGoal = (goal: string) => {
    setData({
      ...data,
      goals: data.goals.includes(goal)
        ? data.goals.filter(g => g !== goal)
        : [...data.goals, goal]
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Step {step} of 4</span>
            <span className="text-sm text-gray-500">{Math.round((step / 4) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-900 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mb-4">
                  <Sparkles className="text-white" size={32} />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Welcome to GovSure! 🎉
                </h2>
                <p className="text-gray-600 mb-4">
                  Let's personalize your experience. What brings you here?
                </p>
                <button
                  onClick={() => setShowTour(true)}
                  className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all text-sm font-medium"
                >
                  <Play size={16} className="mr-2" />
                  Take a quick tour
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <EnhancedOptionCard
                  icon={<FileText size={40} className="text-blue-600" />}
                  title="Government Proposals"
                  description="Win federal contracts with AI-powered proposal generation"
                  features={["AI proposal generation", "SAM.gov integration", "Compliance checking", "Team collaboration"]}
                  selected={data.primary_use === 'proposals'}
                  onClick={() => setData({ ...data, primary_use: 'proposals' })}
                  color="blue"
                />
                <EnhancedOptionCard
                  icon={<Target size={40} className="text-green-600" />}
                  title="Grant Applications"
                  description="Secure funding with professional grant writing tools"
                  features={["NOFO tracking", "SF-424 forms", "Budget narratives", "Award management"]}
                  selected={data.primary_use === 'grants'}
                  onClick={() => setData({ ...data, primary_use: 'grants' })}
                  color="green"
                />
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-500 mb-3">Or work on both?</p>
                <button
                  onClick={() => setData({ ...data, primary_use: 'both' })}
                  className={`px-6 py-3 border-2 rounded-lg font-semibold transition-all ${
                    data.primary_use === 'both'
                      ? 'border-purple-500 bg-purple-50 text-purple-900'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  Both Proposals & Grants
                </button>
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!data.primary_use}
                className="w-full bg-blue-900 text-white py-3 rounded-lg font-semibold hover:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                Continue <ArrowRight className="ml-2" size={20} />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Tell us about your team
                </h2>
                <p className="text-gray-600">
                  This helps us customize your workspace
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Team Size
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {['Just me', '2-5', '6-20', '20+'].map((size) => (
                    <button
                      key={size}
                      onClick={() => setData({ ...data, team_size: size })}
                      className={`p-4 border-2 rounded-lg text-center font-medium transition-all ${
                        data.team_size === size
                          ? 'border-blue-500 bg-blue-50 text-blue-900'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Industry
                </label>
                <select
                  value={data.industry}
                  onChange={(e) => setData({ ...data, industry: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select your industry</option>
                  <option value="defense">Defense & Aerospace</option>
                  <option value="it">IT & Cybersecurity</option>
                  <option value="consulting">Professional Services</option>
                  <option value="construction">Construction & Engineering</option>
                  <option value="healthcare">Healthcare</option>
                  <option value="research">Research & Development</option>
                  <option value="education">Education & Training</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center"
                >
                  <ArrowLeft className="mr-2" size={20} /> Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!data.team_size || !data.industry}
                  className="flex-1 bg-blue-900 text-white py-3 rounded-lg font-semibold hover:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  Continue <ArrowRight className="ml-2" size={20} />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  What are your goals?
                </h2>
                <p className="text-gray-600">
                  Select all that apply
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { id: 'win_more', label: 'Win more contracts', icon: <Target size={24} /> },
                  { id: 'save_time', label: 'Save time on proposals', icon: <Zap size={24} /> },
                  { id: 'improve_quality', label: 'Improve proposal quality', icon: <FileText size={24} /> },
                  { id: 'team_collaboration', label: 'Better team collaboration', icon: <Users size={24} /> },
                  { id: 'compliance', label: 'Ensure compliance', icon: <CheckCircle size={24} /> },
                  { id: 'pipeline', label: 'Manage pipeline better', icon: <Target size={24} /> },
                ].map((goal) => (
                  <button
                    key={goal.id}
                    onClick={() => toggleGoal(goal.id)}
                    className={`p-4 border-2 rounded-lg text-left font-medium transition-all flex items-center ${
                      data.goals.includes(goal.id)
                        ? 'border-blue-500 bg-blue-50 text-blue-900'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="mr-3">{goal.icon}</span>
                    {goal.label}
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center"
                >
                  <ArrowLeft className="mr-2" size={20} /> Back
                </button>
                <button
                  onClick={() => setStep(4)}
                  disabled={data.goals.length === 0}
                  className="flex-1 bg-blue-900 text-white py-3 rounded-lg font-semibold hover:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  Continue <ArrowRight className="ml-2" size={20} />
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Choose your plan
                </h2>
                <p className="text-gray-600">
                  Start with our free tier, upgrade anytime
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <PlanCard
                  name="Free"
                  price="$0"
                  features={[
                    '1 proposal/month',
                    '5 opportunities',
                    'Basic AI features',
                    'Community support'
                  ]}
                  selected={data.subscription_tier === 'free'}
                  onClick={() => setData({ ...data, subscription_tier: 'free' })}
                />
                <PlanCard
                  name="Starter"
                  price="$99"
                  features={[
                    '5 proposals/month',
                    '25 opportunities',
                    'Full AI features',
                    'Email support',
                    'Compliance checking'
                  ]}
                  selected={data.subscription_tier === 'starter'}
                  onClick={() => setData({ ...data, subscription_tier: 'starter' })}
                  popular
                />
                <PlanCard
                  name="Professional"
                  price="$299"
                  features={[
                    '20 proposals/month',
                    '100 opportunities',
                    'Advanced AI',
                    'Priority support',
                    'Team collaboration'
                  ]}
                  selected={data.subscription_tier === 'professional'}
                  onClick={() => setData({ ...data, subscription_tier: 'professional' })}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center"
                >
                  <ArrowLeft className="mr-2" size={20} /> Back
                </button>
                <button
                  onClick={handleComplete}
                  className="flex-1 bg-blue-900 text-white py-3 rounded-lg font-semibold hover:bg-blue-800 transition-colors flex items-center justify-center"
                >
                  Get Started <ArrowRight className="ml-2" size={20} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Product Tour Modal */}
      <ProductTour 
        isOpen={showTour}
        onClose={() => setShowTour(false)}
        userTypes={data.user_types}
      />
    </div>
  );
}

function EnhancedOptionCard({ icon, title, description, features, selected, onClick, color }: any) {
  const colorClasses = {
    blue: {
      selected: 'border-blue-500 bg-blue-50',
      icon: 'text-blue-600',
      accent: 'text-blue-600'
    },
    green: {
      selected: 'border-green-500 bg-green-50',
      icon: 'text-green-600',
      accent: 'text-green-600'
    }
  };

  const currentColor = colorClasses[color as keyof typeof colorClasses] || colorClasses.blue;

  return (
    <button
      onClick={onClick}
      className={`p-6 border-2 rounded-xl text-left transition-all hover:shadow-lg ${
        selected
          ? currentColor.selected
          : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      <div className="mb-4">{icon}</div>
      <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600 mb-4">{description}</p>
      
      {/* Features List */}
      <div className="space-y-2 mb-4">
        {features.map((feature: string, index: number) => (
          <div key={index} className="flex items-center text-sm">
            <CheckCircle size={16} className={`mr-2 ${currentColor.accent}`} />
            <span className="text-gray-700">{feature}</span>
          </div>
        ))}
      </div>

      {selected && (
        <div className="flex items-center text-blue-600">
          <CheckCircle size={20} className="mr-2" />
          <span className="text-sm font-medium">Selected</span>
        </div>
      )}
    </button>
  );
}

function OptionCard({ icon, title, description, selected, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`p-6 border-2 rounded-xl text-left transition-all ${
        selected
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      <div className="mb-4">{icon}</div>
      <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
      {selected && (
        <div className="mt-4 flex items-center text-blue-600">
          <CheckCircle size={20} className="mr-2" />
          <span className="text-sm font-medium">Selected</span>
        </div>
      )}
    </button>
  );
}

function PlanCard({ name, price, features, selected, onClick, popular }: any) {
  return (
    <button
      onClick={onClick}
      className={`p-6 border-2 rounded-xl text-left transition-all relative ${
        selected
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-200 hover:border-gray-300'
      } ${popular ? 'ring-2 ring-blue-400' : ''}`}
    >
      {popular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
            Most Popular
          </span>
        </div>
      )}
      <h3 className="text-xl font-bold text-gray-900 mb-2">{name}</h3>
      <div className="mb-4">
        <span className="text-3xl font-bold text-gray-900">{price}</span>
        {price !== 'Custom' && <span className="text-gray-600">/month</span>}
      </div>
      <ul className="space-y-2 mb-4">
        {features.map((feature: string, i: number) => (
          <li key={i} className="flex items-start text-sm text-gray-600">
            <CheckCircle size={16} className="text-green-500 mr-2 flex-shrink-0 mt-0.5" />
            {feature}
          </li>
        ))}
      </ul>
      {selected && (
        <div className="flex items-center text-blue-600">
          <CheckCircle size={20} className="mr-2" />
          <span className="text-sm font-medium">Selected</span>
        </div>
      )}
    </button>
  );
}

