import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Star, Calendar, Video, User, Award, Clock, X } from 'lucide-react';
import Navigation from '../components/Navigation';
import DemoBookingModal from '../components/DemoBookingModal';

interface Expert {
  id: string;
  name: string;
  email: string;
  expertise_areas: string[];
  years_experience: number;
  rating: number;
  bio: string;
}

interface Session {
  id: string;
  expert_id: string;
  status: string;
  scheduled_at: string | null;
  meeting_url: string | null;
}

export default function ExpertOnboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'matching' | 'scheduling' | 'confirmed'>('matching');
  const [matchedExpert, setMatchedExpert] = useState<Expert | null>(null);
  const [availableExperts, setAvailableExperts] = useState<Expert[]>([]);
  const [selectedExpert, setSelectedExpert] = useState<string | null>(null);
  const [selectedDateTime, setSelectedDateTime] = useState('');
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  useEffect(() => {
    matchExpert();
    loadAvailableExperts();
  }, []);

  const matchExpert = async () => {
    setLoading(true);
    setError(null);

    try {
      const onboardingData = localStorage.getItem('onboarding_data');
      const userProfile = onboardingData ? JSON.parse(onboardingData) : null;

      const response = await fetch('/api/v1/expert-onboarding/match-expert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token') || sessionStorage.getItem('access_token')}`
        },
        body: JSON.stringify({ user_profile: userProfile })
      });

      if (!response.ok) {
        throw new Error('Failed to match expert');
      }

      const data = await response.json();
      setMatchedExpert(data.expert);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableExperts = async () => {
    try {
      const response = await fetch('/api/v1/expert-onboarding/available-experts', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token') || sessionStorage.getItem('access_token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAvailableExperts(data.experts || []);
      }
    } catch (err) {
      console.error('Failed to load experts:', err);
    }
  };

  const scheduleSession = async () => {
    if (!selectedExpert && !matchedExpert) {
      setError('Please select an expert');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const expertId = selectedExpert || matchedExpert?.id;
      const scheduledAt = selectedDateTime || new Date().toISOString();

      const response = await fetch('/api/v1/expert-onboarding/schedule-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token') || sessionStorage.getItem('access_token')}`
        },
        body: JSON.stringify({
          expert_id: expertId,
          scheduled_at: scheduledAt,
          session_type: 'initial'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to schedule session');
      }

      const data = await response.json();
      setSession(data.session);
      setStep('confirmed');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navigation variant="sticky" />

      <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Dashboard
            </button>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Expert Onboarding</h1>
            <p className="text-lg text-gray-600">
              Get personalized guidance from a GovCon expert to accelerate your success
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-12 space-x-4">
            <div className={`flex items-center ${step === 'matching' ? 'text-blue-600' : step === 'scheduling' || step === 'confirmed' ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${step === 'matching' ? 'border-blue-600 bg-blue-50' : step === 'scheduling' || step === 'confirmed' ? 'border-green-600 bg-green-50' : 'border-gray-300'}`}>
                {step === 'scheduling' || step === 'confirmed' ? <CheckCircle className="w-6 h-6" /> : '1'}
              </div>
              <span className="ml-2 font-semibold">Match Expert</span>
            </div>
            <div className={`w-16 h-1 ${step === 'scheduling' || step === 'confirmed' ? 'bg-green-600' : 'bg-gray-300'}`}></div>
            <div className={`flex items-center ${step === 'scheduling' ? 'text-blue-600' : step === 'confirmed' ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${step === 'scheduling' ? 'border-blue-600 bg-blue-50' : step === 'confirmed' ? 'border-green-600 bg-green-50' : 'border-gray-300'}`}>
                {step === 'confirmed' ? <CheckCircle className="w-6 h-6" /> : '2'}
              </div>
              <span className="ml-2 font-semibold">Schedule Session</span>
            </div>
            <div className={`w-16 h-1 ${step === 'confirmed' ? 'bg-green-600' : 'bg-gray-300'}`}></div>
            <div className={`flex items-center ${step === 'confirmed' ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${step === 'confirmed' ? 'border-green-600 bg-green-50' : 'border-gray-300'}`}>
                {step === 'confirmed' ? <CheckCircle className="w-6 h-6" /> : '3'}
              </div>
              <span className="ml-2 font-semibold">Confirmed</span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <X className="w-5 h-5 text-red-600" />
                <span className="text-red-700">{error}</span>
              </div>
              <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800">
                <X className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Matching Step */}
          {step === 'matching' && (
            <div className="bg-white rounded-xl shadow-lg p-8">
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                  <p className="text-gray-600">Matching you with the best expert...</p>
                </div>
              ) : matchedExpert ? (
                <>
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mb-4">
                      <User className="text-white" size={40} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">We Found Your Expert!</h2>
                    <p className="text-gray-600">Based on your profile, we've matched you with an expert</p>
                  </div>

                  {/* Matched Expert Card */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 mb-6 border-2 border-blue-200">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                          {matchedExpert.name.charAt(0)}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-xl font-bold text-gray-900">{matchedExpert.name}</h3>
                          <div className="flex items-center space-x-1">
                            <Star className="w-5 h-5 text-yellow-400 fill-current" />
                            <span className="font-semibold text-gray-900">{matchedExpert.rating}.0</span>
                          </div>
                        </div>
                        <p className="text-gray-600 mb-3">{matchedExpert.bio || 'GovCon expert with extensive experience'}</p>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {matchedExpert.expertise_areas?.slice(0, 3).map((area: string, idx: number) => (
                            <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                              {area}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Award className="w-4 h-4" />
                            <span>{matchedExpert.years_experience || '5+'} years experience</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Alternative Experts */}
                  {availableExperts.length > 1 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Or choose another expert:</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        {availableExperts
                          .filter(expert => expert.id !== matchedExpert.id)
                          .slice(0, 2)
                          .map((expert) => (
                            <button
                              key={expert.id}
                              onClick={() => {
                                setSelectedExpert(expert.id);
                                setMatchedExpert(expert);
                              }}
                              className={`p-4 border-2 rounded-lg text-left transition-all ${
                                selectedExpert === expert.id || matchedExpert.id === expert.id
                                  ? 'border-blue-500 bg-blue-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-semibold text-gray-900">{expert.name}</h4>
                                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                              </div>
                              <p className="text-sm text-gray-600">{expert.years_experience || '5+'} years</p>
                            </button>
                          ))}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => setStep('scheduling')}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center"
                  >
                    Continue to Scheduling <ArrowLeft className="ml-2 rotate-180" size={20} />
                  </button>
                </>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-600 mb-4">No experts available at the moment</p>
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Go to Dashboard
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Scheduling Step */}
          {step === 'scheduling' && matchedExpert && (
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Schedule Your Session</h2>
                <p className="text-gray-600">Choose a time that works for you</p>
              </div>

              {/* Expert Info */}
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                    {matchedExpert.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{matchedExpert.name}</h3>
                    <p className="text-sm text-gray-600">Your onboarding expert</p>
                  </div>
                </div>
              </div>

              {/* Date/Time Selection */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Preferred Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={selectedDateTime}
                  onChange={(e) => setSelectedDateTime(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min={new Date().toISOString().slice(0, 16)}
                />
                <p className="text-sm text-gray-500 mt-2">
                  Sessions typically last 30-60 minutes. You'll receive a calendar invite with meeting link.
                </p>
              </div>

              {/* Session Benefits */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">What to expect:</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Personalized platform walkthrough</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Best practices for government contracting</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Answer your questions</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Setup recommendations for your use case</span>
                  </li>
                </ul>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => setStep('matching')}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={scheduleSession}
                  disabled={loading || !selectedDateTime}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Scheduling...
                    </>
                  ) : (
                    <>
                      <Calendar className="mr-2" size={20} />
                      Schedule Session
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Confirmed Step */}
          {step === 'confirmed' && session && (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Session Scheduled!</h2>
              <p className="text-lg text-gray-600 mb-8">
                Your onboarding session has been confirmed. You'll receive a calendar invite and meeting link via email.
              </p>

              {session.scheduled_at && (
                <div className="bg-blue-50 rounded-lg p-6 mb-6">
                  <div className="flex items-center justify-center space-x-4 text-gray-700">
                    <Clock className="w-5 h-5" />
                    <span className="font-semibold">
                      {new Date(session.scheduled_at).toLocaleString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Go to Dashboard
                </button>
                <button
                  onClick={() => setIsDemoModalOpen(true)}
                  className="w-full border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Schedule Another Demo
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <DemoBookingModal isOpen={isDemoModalOpen} onClose={() => setIsDemoModalOpen(false)} />
    </div>
  );
}

