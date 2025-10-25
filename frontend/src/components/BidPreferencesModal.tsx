import { useState } from 'react';
import { X, Save, RotateCcw, Info } from 'lucide-react';

interface BidPreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (preferences: any) => void;
}

export default function BidPreferencesModal({ isOpen, onClose, onSave }: BidPreferencesModalProps) {
  const [preferences, setPreferences] = useState({
    contractValue: 80,
    pastPerformance: 90,
    naicsMatch: 85,
    setAsideAdvantage: 70,
    geographicProximity: 60,
    competitivePosition: 75,
    minScore: 70,
    autoQualify: true,
    focusAreas: ['defense', 'it'],
    excludeAgencies: [] as string[]
  });

  const handleSave = () => {
    onSave(preferences);
    onClose();
  };

  const handleReset = () => {
    setPreferences({
      contractValue: 80,
      pastPerformance: 90,
      naicsMatch: 85,
      setAsideAdvantage: 70,
      geographicProximity: 60,
      competitivePosition: 75,
      minScore: 70,
      autoQualify: true,
      focusAreas: ['defense', 'it'],
      excludeAgencies: []
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Bid Preferences</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start">
            <Info className="text-blue-600 mr-3 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <p className="text-sm text-gray-700">
                Customize how opportunities are scored and ranked. Higher weights mean that factor matters more in your decision-making.
              </p>
            </div>
          </div>

          {/* Scoring Weights */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Scoring Weights</h3>
            <div className="space-y-4">
              <SliderControl
                label="Contract Value Alignment"
                value={preferences.contractValue}
                onChange={(v) => setPreferences({ ...preferences, contractValue: v })}
                description="How important is the contract size matching your capacity?"
              />
              <SliderControl
                label="Past Performance Match"
                value={preferences.pastPerformance}
                onChange={(v) => setPreferences({ ...preferences, pastPerformance: v })}
                description="Weight given to similar past projects"
              />
              <SliderControl
                label="NAICS Code Match"
                value={preferences.naicsMatch}
                onChange={(v) => setPreferences({ ...preferences, naicsMatch: v })}
                description="Importance of primary NAICS code alignment"
              />
              <SliderControl
                label="Set-Aside Advantage"
                value={preferences.setAsideAdvantage}
                onChange={(v) => setPreferences({ ...preferences, setAsideAdvantage: v })}
                description="Boost for small business, 8(a), WOSB, etc."
              />
              <SliderControl
                label="Geographic Proximity"
                value={preferences.geographicProximity}
                onChange={(v) => setPreferences({ ...preferences, geographicProximity: v })}
                description="Preference for local/regional opportunities"
              />
              <SliderControl
                label="Competitive Position"
                value={preferences.competitivePosition}
                onChange={(v) => setPreferences({ ...preferences, competitivePosition: v })}
                description="Estimated advantage vs. competitors"
              />
            </div>
          </div>

          {/* Minimum Score Threshold */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Qualification Threshold</h3>
            <SliderControl
              label="Minimum Score to Show"
              value={preferences.minScore}
              onChange={(v) => setPreferences({ ...preferences, minScore: v })}
              description="Only show opportunities scoring above this threshold"
              min={0}
              max={100}
            />
          </div>

          {/* Auto-Qualify Toggle */}
          <div>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.autoQualify}
                onChange={(e) => setPreferences({ ...preferences, autoQualify: e.target.checked })}
                className="w-5 h-5 text-blue-900 rounded focus:ring-blue-500"
              />
              <div>
                <span className="font-semibold text-gray-900">Auto-qualify high-scoring opportunities</span>
                <p className="text-sm text-gray-600">Automatically move 90+ scored opportunities to "Qualified" stage</p>
              </div>
            </label>
          </div>

          {/* Focus Areas */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-3">Focus Areas</h3>
            <div className="grid grid-cols-2 gap-3">
              {['Defense', 'IT & Cybersecurity', 'Professional Services', 'Construction', 'Healthcare', 'Research'].map((area) => (
                <label key={area} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.focusAreas.includes(area.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-'))}
                    onChange={(e) => {
                      const areaKey = area.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-');
                      if (e.target.checked) {
                        setPreferences({ ...preferences, focusAreas: [...preferences.focusAreas, areaKey] });
                      } else {
                        setPreferences({ ...preferences, focusAreas: preferences.focusAreas.filter(a => a !== areaKey) });
                      }
                    }}
                    className="w-4 h-4 text-blue-900 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{area}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-between">
          <button
            onClick={handleReset}
            className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg flex items-center transition-colors"
          >
            <RotateCcw size={18} className="mr-2" />
            Reset to Defaults
          </button>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-6 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 flex items-center transition-colors"
            >
              <Save size={18} className="mr-2" />
              Save Preferences
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SliderControl({ label, value, onChange, description, min = 0, max = 100 }: any) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="font-medium text-gray-900">{label}</label>
        <span className="text-lg font-bold text-blue-900">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-900"
      />
      <p className="text-xs text-gray-500 mt-1">{description}</p>
    </div>
  );
}

