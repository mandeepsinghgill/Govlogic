import { useState, useEffect } from 'react';
import DashboardEnhanced from '../pages/DashboardEnhanced';
import AdaptiveDashboard from '../pages/AdaptiveDashboard';
import CrossPollinationFeatures from './CrossPollinationFeatures';

export default function SmartDashboard() {
  const [userTypes, setUserTypes] = useState<string[]>(['proposals']);
  const [primaryFocus, setPrimaryFocus] = useState<string>('proposals');
  const [showCrossPollination, setShowCrossPollination] = useState(false);

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('user');
    const onboardingData = localStorage.getItem('onboarding_data');
    
    if (userData) {
      const user = JSON.parse(userData);
      if (user.user_types) {
        setUserTypes(user.user_types);
        setPrimaryFocus(user.primary_focus || user.user_types[0]);
      }
    }
    
    if (onboardingData) {
      const data = JSON.parse(onboardingData);
      if (data.primary_use === 'both') {
        setUserTypes(['proposals', 'grants']);
        setPrimaryFocus('proposals');
      } else if (data.primary_use) {
        setUserTypes([data.primary_use]);
        setPrimaryFocus(data.primary_use);
      }
    }
  }, []);

  // Check if user has both types
  const hasBothTypes = userTypes.length > 1 || userTypes.includes('both');

  return (
    <div className="space-y-6">
      {/* Cross-Pollination Banner for Dual Users */}
      {hasBothTypes && (
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Cross-Pollination Features Available</h3>
                <p className="text-sm text-gray-600">
                  You're using both proposals and grants - unlock powerful features that work across both!
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowCrossPollination(!showCrossPollination)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
            >
              {showCrossPollination ? 'Hide' : 'Learn More'}
            </button>
          </div>
        </div>
      )}

      {/* Cross-Pollination Features */}
      {hasBothTypes && showCrossPollination && (
        <CrossPollinationFeatures userTypes={userTypes} />
      )}

      {/* Dashboard */}
      {hasBothTypes ? (
        <AdaptiveDashboard userTypes={userTypes} primaryFocus={primaryFocus} />
      ) : (
        <DashboardEnhanced />
      )}
    </div>
  );
}
