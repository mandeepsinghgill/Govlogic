import React from 'react';
import { 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer,
  Tooltip
} from 'recharts';
import { Info } from 'lucide-react';

interface PWinAnalysisProps {
  score: number;
  factors: {
    capability_match: number;
    past_performance: number;
    set_aside: number;
    contract_size: number;
    geography: number;
    clearance: number;
    agency_relationship?: number;
    team_capacity?: number;
    compliance_complexity?: number;
    timeline_constraints?: number;
    strategic_fit?: number;
    market_trends?: number;
    [key: string]: number | undefined;
  };
  recommendation?: string;
}

const PWinAnalysis: React.FC<PWinAnalysisProps> = ({ score, factors, recommendation }) => {
  
  // Normalize factors for radar chart (0-100 scale)
  // Some factors have different max points, so we scale them
  const data = [
    { subject: 'Capability', A: (factors.capability_match || 0) / 30 * 100, fullMark: 100 },
    { subject: 'Past Perf', A: (factors.past_performance || 0) / 25 * 100, fullMark: 100 },
    { subject: 'Set-Aside', A: (factors.set_aside || 0) / 20 * 100, fullMark: 100 },
    { subject: 'Size', A: (factors.contract_size || 0) / 15 * 100, fullMark: 100 },
    { subject: 'Geography', A: (factors.geography || 0) / 10 * 100, fullMark: 100 },
    { subject: 'Clearance', A: (factors.clearance || 0) / 10 * 100, fullMark: 100 },
  ];

  // Add enhanced factors if present
  if (factors.agency_relationship !== undefined) {
    data.push({ subject: 'Agency Rel', A: factors.agency_relationship, fullMark: 100 });
  }
  if (factors.strategic_fit !== undefined) {
    data.push({ subject: 'Strategic', A: factors.strategic_fit, fullMark: 100 });
  }

  const getScoreColor = (s: number) => {
    if (s >= 80) return 'text-green-600';
    if (s >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (s: number) => {
    if (s >= 80) return 'bg-green-100 border-green-200';
    if (s >= 60) return 'bg-yellow-100 border-yellow-200';
    return 'bg-red-100 border-red-200';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <Info className="w-5 h-5 text-indigo-600" />
          </div>
          10-Factor PWin Analysis
        </h2>
        <div className={`px-4 py-2 rounded-lg border-2 ${getScoreBg(score)}`}>
          <span className="text-sm font-semibold text-gray-600 mr-2">Overall Score:</span>
          <span className={`text-2xl font-bold ${getScoreColor(score)}`}>{score}%</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Radar Chart */}
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" />
              <PolarRadiusAxis angle={30} domain={[0, 100]} />
              <Radar
                name="PWin Factors"
                dataKey="A"
                stroke="#4f46e5"
                fill="#4f46e5"
                fillOpacity={0.6}
              />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Detailed Breakdown */}
        <div className="space-y-4 overflow-y-auto max-h-80 pr-2">
          <h3 className="font-semibold text-gray-700 mb-2">Factor Breakdown</h3>
          
          {data.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="font-medium text-gray-700">{item.subject}</span>
              <div className="flex items-center gap-3">
                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${
                      item.A >= 80 ? 'bg-green-500' : 
                      item.A >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${item.A}%` }}
                  />
                </div>
                <span className="font-bold text-gray-900 w-12 text-right">
                  {Math.round(item.A)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {recommendation && (
        <div className="mt-6 p-4 bg-indigo-50 border border-indigo-100 rounded-lg">
          <h4 className="font-semibold text-indigo-900 mb-1">AI Recommendation</h4>
          <p className="text-indigo-700">{recommendation}</p>
        </div>
      )}
    </div>
  );
};

export default PWinAnalysis;
