import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, Mail, Lock, User, Phone, Globe } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    organization_name: '',
    organization_email: '',
    phone: '',
    website: '',
    user_types: ['proposals'] as string[],
    primary_focus: 'proposals' as string
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Build payload, omitting empty optional fields to satisfy backend validation
      const payload: any = { ...formData };
      if (!payload.organization_email) delete payload.organization_email;
      if (!payload.phone) delete payload.phone;
      if (!payload.website) delete payload.website;

      const response = await fetch(`${API_URL}/api/v1/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let data: any = null;
        try {
          data = await response.json();
        } catch {}
        const detail = data?.detail;
        if (Array.isArray(detail)) {
          const msg = detail
            .map((d: any) => d?.msg || d?.message || JSON.stringify(d))
            .join(', ');
          throw new Error(msg || 'Signup failed');
        }
        throw new Error(
          (typeof detail === 'string' && detail) || data?.message || 'Signup failed'
        );
      }

      const data = await response.json();
      
      // Store tokens
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('organization', JSON.stringify(data.organization));

      // Redirect to onboarding
      navigate('/onboarding');
    } catch (err: any) {
      setError(err.message || 'An error occurred during signup');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialAuth = (provider: string) => {
    // OAuth flow implemented - see OAuth API
    alert(`${provider} authentication coming soon!`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <img src="/govsure-logo.png" alt="GovSure" style={{ height: 'auto !important', width: '200px !important' }} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Create your account</h2>
          <p className="text-gray-600">Join GovSure today</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Social Auth Buttons */}
          <div className="space-y-3 mb-6">
            <button
              onClick={() => handleSocialAuth('Google')}
              className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5 mr-3" />
              <span className="font-medium text-gray-700">Continue with Google</span>
            </button>
            <button
              onClick={() => handleSocialAuth('GitHub')}
              className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
              </svg>
              <span className="font-medium text-gray-700">Continue with GitHub</span>
            </button>
            <button
              onClick={() => handleSocialAuth('Microsoft')}
              className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <img src="https://www.microsoft.com/favicon.ico" alt="Microsoft" className="w-5 h-5 mr-3" />
              <span className="font-medium text-gray-700">Continue with Microsoft</span>
            </button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or sign up with email</span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Signup Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  required
                  autoComplete="name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="john@company.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="password"
                  required
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                  minLength={8}
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">Minimum 8 characters</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Organization Name
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  required
                  autoComplete="organization"
                  value={formData.organization_name}
                  onChange={(e) => setFormData({ ...formData, organization_name: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Acme Corp"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone (Optional)
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="tel"
                  autoComplete="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Website (Optional)
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="url"
                  autoComplete="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://company.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                I'm here for (select all that apply)
              </label>
              <div className="space-y-3">
                <UserTypeOption
                  id="proposals"
                  title="Government Proposals"
                  description="Win federal contracts with AI-powered proposal generation"
                  icon="📋"
                  selected={formData.user_types.includes('proposals')}
                  onClick={() => {
                    const newTypes = formData.user_types.includes('proposals')
                      ? formData.user_types.filter(t => t !== 'proposals')
                      : [...formData.user_types, 'proposals'];
                    setFormData({ 
                      ...formData, 
                      user_types: newTypes,
                      primary_focus: newTypes.length === 1 ? newTypes[0] : formData.primary_focus
                    });
                  }}
                />
                <UserTypeOption
                  id="grants"
                  title="Grant Applications"
                  description="Secure funding with professional grant writing tools"
                  icon="💰"
                  selected={formData.user_types.includes('grants')}
                  onClick={() => {
                    const newTypes = formData.user_types.includes('grants')
                      ? formData.user_types.filter(t => t !== 'grants')
                      : [...formData.user_types, 'grants'];
                    setFormData({ 
                      ...formData, 
                      user_types: newTypes,
                      primary_focus: newTypes.length === 1 ? newTypes[0] : formData.primary_focus
                    });
                  }}
                />
              </div>
              
              {formData.user_types.length > 1 && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Primary focus
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, primary_focus: 'proposals' })}
                      className={`p-2 border-2 rounded-lg text-sm font-medium transition-all ${
                        formData.primary_focus === 'proposals'
                          ? 'border-blue-500 bg-blue-50 text-blue-900'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      Proposals
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, primary_focus: 'grants' })}
                      className={`p-2 border-2 rounded-lg text-sm font-medium transition-all ${
                        formData.primary_focus === 'grants'
                          ? 'border-blue-500 bg-blue-50 text-blue-900'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      Grants
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-900 text-white py-3 rounded-lg font-semibold hover:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-900 font-semibold hover:underline">
              Sign in
            </Link>
          </p>

          <p className="mt-4 text-center text-xs text-gray-500">
            By signing up, you agree to our{' '}
            <a href="#" className="underline">Terms</a> and{' '}
            <a href="#" className="underline">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
}

function UserTypeOption({ id, title, description, icon, selected, onClick }: any) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
        selected
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      <div className="flex items-start space-x-3">
        <div className="text-2xl">{icon}</div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
        {selected && (
          <div className="flex-shrink-0">
            <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        )}
      </div>
    </button>
  );
}

