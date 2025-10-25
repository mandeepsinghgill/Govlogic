import { useState, useEffect } from 'react';
import { 
  TrendingUp, DollarSign, Target, FileText, Calendar, 
  ArrowRight, Sparkles, Award, AlertCircle, CheckCircle2,
  BarChart3, PieChart, Activity, ToggleLeft, ToggleRight, Plus
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface DashboardProps {
  userTypes: string[];
  primaryFocus: string;
}

export default function AdaptiveDashboard({ userTypes, primaryFocus }: DashboardProps) {
  const [activeView, setActiveView] = useState(primaryFocus);
  const [showBoth, setShowBoth] = useState(userTypes.length > 1);

  // Mock data - in real app, this would come from API
  const proposalData = {
    pipeline_value: 2500000,
    win_rate: 0.78,
    active_opportunities: 15,
    proposals_in_progress: 8,
    top_opportunities: [
      {
        id: 1,
        title: 'Cybersecurity Operations Center',
        agency: 'Department of Defense',
        score: 93,
        pwin: 82,
        value: '$12.5M',
        dueIn: '30 days',
        reason: 'Strong past performance in DoD cybersecurity, active security clearances',
        tags: ['8(a)', 'Cyber', 'Secret']
      },
      {
        id: 2,
        title: 'Cloud Migration Services',
        agency: 'Department of Veterans Affairs',
        score: 89,
        pwin: 75,
        value: '$8.2M',
        dueIn: '60 days',
        reason: 'FedRAMP certified, VA past performance, strong technical team',
        tags: ['SB', 'Cloud', 'FedRAMP']
      }
    ]
  };

  const grantData = {
    total_funding: 1500000,
    success_rate: 0.65,
    active_applications: 12,
    grants_in_progress: 6,
    top_grants: [
      {
        id: 1,
        title: 'SBIR Phase II - AI Research',
        agency: 'National Science Foundation',
        score: 91,
        success_rate: 68,
        value: '$750K',
        dueIn: '45 days',
        reason: 'Strong Phase I performance, innovative AI approach, experienced team',
        tags: ['SBIR', 'AI', 'Research']
      },
      {
        id: 2,
        title: 'Healthcare Innovation Grant',
        agency: 'NIH',
        score: 87,
        success_rate: 72,
        value: '$500K',
        dueIn: '30 days',
        reason: 'Relevant past performance, clear innovation potential',
        tags: ['NIH', 'Healthcare', 'Innovation']
      }
    ]
  };

  const MiniGauge = ({ score, size = 60 }: { score: number; size?: number }) => {
    const circumference = 2 * Math.PI * 20;
    const strokeDashoffset = circumference - (score / 100) * circumference;
    
    const getColor = (score: number) => {
      if (score >= 80) return '#10b981';
      if (score >= 60) return '#f59e0b';
      return '#ef4444';
    };

    return (
      <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
        <svg className="transform -rotate-90" width={size} height={size}>
          <circle cx={size / 2} cy={size / 2} r="20" stroke="#e5e7eb" strokeWidth="4" fill="none" />
          <circle
            cx={size / 2}
            cy={size / 2}
            r="20"
            stroke={getColor(score)}
            strokeWidth="4"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold">{score}</span>
        </div>
      </div>
    );
  };

  const OpportunityCard = ({ opp, rank, type }: any) => (
    <Link 
      to={`/${type === 'proposal' ? 'opportunities' : 'grants'}`}
      className="block bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg hover:border-blue-300 transition-all group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start space-x-3 flex-1">
          <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
            rank <= 3 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white' :
            rank <= 10 ? 'bg-blue-100 text-blue-900' :
            'bg-gray-100 text-gray-700'
          }`}>
            {rank}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 group-hover:text-blue-900 mb-1 truncate">
              {opp.title}
            </h3>
            <p className="text-sm text-gray-600 truncate">{opp.agency}</p>
          </div>
        </div>

        <div className="ml-3">
          <MiniGauge score={opp.score} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="text-xs">
          <span className="text-gray-500">Value</span>
          <p className="font-semibold text-gray-900">{opp.value}</p>
        </div>
        <div className="text-xs">
          <span className="text-gray-500">{type === 'proposal' ? 'PWin' : 'Success'}</span>
          <p className="font-semibold text-green-600">{type === 'proposal' ? `${opp.pwin}%` : `${opp.success_rate}%`}</p>
        </div>
        <div className="text-xs">
          <span className="text-gray-500">Due</span>
          <p className="font-semibold text-gray-900">{opp.dueIn}</p>
        </div>
      </div>

      <div className="flex items-start text-xs text-gray-600 bg-blue-50 rounded p-2">
        <Sparkles className="text-blue-500 mr-1 flex-shrink-0 mt-0.5" size={14} />
        <span className="line-clamp-2">{opp.reason}</span>
      </div>

      <div className="flex flex-wrap gap-1 mt-2">
        {opp.tags.map((tag: string, i: number) => (
          <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
            {tag}
          </span>
        ))}
      </div>
    </Link>
  );

  const MetricsCard = ({ title, value, subtitle, icon, color }: any) => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${color}`}>
          {icon}
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-sm text-gray-600">{subtitle}</p>
        </div>
      </div>
      <h3 className="font-semibold text-gray-900">{title}</h3>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header with View Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            {showBoth 
              ? `Managing both proposals and grants • Currently viewing ${activeView === 'proposals' ? 'Proposals' : 'Grants'}`
              : `Your ${primaryFocus === 'proposals' ? 'Proposal' : 'Grant'} Management Dashboard`
            }
          </p>
        </div>
        
        {showBoth && (
          <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveView('proposals')}
              className={`px-4 py-2 rounded-md font-medium transition-all ${
                activeView === 'proposals'
                  ? 'bg-white text-blue-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📋 Proposals
            </button>
            <button
              onClick={() => setActiveView('grants')}
              className={`px-4 py-2 rounded-md font-medium transition-all ${
                activeView === 'grants'
                  ? 'bg-white text-green-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              💰 Grants
            </button>
          </div>
        )}
      </div>

      {/* Metrics Grid */}
      {(activeView === 'proposals' || !showBoth) && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <MetricsCard
            title="Pipeline Value"
            value="$2.5M"
            subtitle="Total opportunities"
            icon={<DollarSign className="text-green-600" size={24} />}
            color="bg-green-100"
          />
          <MetricsCard
            title="Win Rate"
            value="78%"
            subtitle="Last 12 months"
            icon={<Target className="text-blue-600" size={24} />}
            color="bg-blue-100"
          />
          <MetricsCard
            title="Active Opportunities"
            value="15"
            subtitle="Currently tracking"
            icon={<TrendingUp className="text-purple-600" size={24} />}
            color="bg-purple-100"
          />
          <MetricsCard
            title="Proposals in Progress"
            value="8"
            subtitle="Being developed"
            icon={<FileText className="text-orange-600" size={24} />}
            color="bg-orange-100"
          />
        </div>
      )}

      {(activeView === 'grants' || !showBoth) && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <MetricsCard
            title="Total Funding"
            value="$1.5M"
            subtitle="Available opportunities"
            icon={<DollarSign className="text-green-600" size={24} />}
            color="bg-green-100"
          />
          <MetricsCard
            title="Success Rate"
            value="65%"
            subtitle="Applications funded"
            icon={<Award className="text-blue-600" size={24} />}
            color="bg-blue-100"
          />
          <MetricsCard
            title="Active Applications"
            value="12"
            subtitle="Currently tracking"
            icon={<TrendingUp className="text-purple-600" size={24} />}
            color="bg-purple-100"
          />
          <MetricsCard
            title="Grants in Progress"
            value="6"
            subtitle="Being developed"
            icon={<FileText className="text-orange-600" size={24} />}
            color="bg-orange-100"
          />
        </div>
      )}

      {/* Top Opportunities/Grants */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Top {activeView === 'proposals' ? 'Opportunities' : 'Grant Opportunities'}
            </h2>
            <p className="text-gray-600 mt-1">
              AI-recommended {activeView === 'proposals' ? 'contracts' : 'grants'} with highest match scores
            </p>
          </div>
          <Link 
            to={`/${activeView === 'proposals' ? 'opportunities' : 'grants'}`}
            className="text-blue-600 hover:text-blue-700 font-medium flex items-center"
          >
            View all <ArrowRight className="ml-1" size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(activeView === 'proposals' ? proposalData.top_opportunities : grantData.top_grants).map((opp: any, index: number) => (
            <OpportunityCard 
              key={opp.id} 
              opp={opp} 
              rank={index + 1} 
              type={activeView === 'proposals' ? 'proposal' : 'grant'}
            />
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to={`/${activeView === 'proposals' ? 'opportunities' : 'grants'}/new`}
            className="bg-white p-4 rounded-lg border border-gray-200 hover:border-blue-300 transition-all group"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Plus className="text-blue-600" size={20} />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 group-hover:text-blue-900">
                  Create New {activeView === 'proposals' ? 'Proposal' : 'Grant Application'}
                </h4>
                <p className="text-sm text-gray-600">
                  Start from scratch or use AI templates
                </p>
              </div>
            </div>
          </Link>
          
          <Link
            to="/ai-assistant"
            className="bg-white p-4 rounded-lg border border-gray-200 hover:border-purple-300 transition-all group"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Sparkles className="text-purple-600" size={20} />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 group-hover:text-purple-900">
                  AI Assistant
                </h4>
                <p className="text-sm text-gray-600">
                  Get help with {activeView === 'proposals' ? 'proposal writing' : 'grant applications'}
                </p>
              </div>
            </div>
          </Link>
          
          <Link
            to="/analytics"
            className="bg-white p-4 rounded-lg border border-gray-200 hover:border-green-300 transition-all group"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <BarChart3 className="text-green-600" size={20} />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 group-hover:text-green-900">
                  View Analytics
                </h4>
                <p className="text-sm text-gray-600">
                  Track performance and trends
                </p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
