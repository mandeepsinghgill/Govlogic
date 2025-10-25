import { useState } from 'react';
import { 
  TrendingUp, DollarSign, Target, FileText, Calendar, 
  ArrowRight, Sparkles, Award, AlertCircle, CheckCircle2,
  BarChart3, PieChart, Activity
} from 'lucide-react';
import { Link } from 'react-router-dom';

// Mini Compliance Gauge for Dashboard
function MiniGauge({ score, size = 60 }: { score: number; size?: number }) {
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
}

// Opportunity Card for Top 25
function OpportunityCard({ opp, rank }: any) {
  return (
    <Link 
      to="/opportunities"
      className="block bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg hover:border-blue-300 transition-all group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start space-x-3 flex-1">
          {/* Rank Badge */}
          <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
            rank <= 3 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white' :
            rank <= 10 ? 'bg-blue-100 text-blue-900' :
            'bg-gray-100 text-gray-700'
          }`}>
            {rank}
          </div>
          
          {/* Title and Agency */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 group-hover:text-blue-900 mb-1 truncate">
              {opp.title}
            </h3>
            <p className="text-sm text-gray-600 truncate">{opp.agency}</p>
          </div>
        </div>

        {/* Score Gauge */}
        <div className="ml-3">
          <MiniGauge score={opp.score} />
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="text-xs">
          <span className="text-gray-500">Value</span>
          <p className="font-semibold text-gray-900">{opp.value}</p>
        </div>
        <div className="text-xs">
          <span className="text-gray-500">PWin</span>
          <p className="font-semibold text-green-600">{opp.pwin}%</p>
        </div>
        <div className="text-xs">
          <span className="text-gray-500">Due</span>
          <p className="font-semibold text-gray-900">{opp.dueIn}</p>
        </div>
      </div>

      {/* AI Reason */}
      <div className="flex items-start text-xs text-gray-600 bg-blue-50 rounded p-2">
        <Sparkles className="text-blue-500 mr-1 flex-shrink-0 mt-0.5" size={14} />
        <span className="line-clamp-2">{opp.reason}</span>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1 mt-2">
        {opp.tags.map((tag: string, i: number) => (
          <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
            {tag}
          </span>
        ))}
      </div>
    </Link>
  );
}

export default function DashboardEnhanced() {
  // Mock data for Top 25 opportunities
  const topOpportunities = [
    {
      id: 1,
      title: 'Transit Authority Bus Procurement',
      agency: 'Department of Transportation',
      score: 93,
      pwin: 78,
      value: '$5.0M',
      dueIn: '45 days',
      reason: 'Perfect NAICS match, 3 similar past performance projects, small business set-aside advantage',
      tags: ['SB', 'Transit', 'NAICS 336120']
    },
    {
      id: 2,
      title: 'Cybersecurity Operations Center',
      agency: 'Department of Defense',
      score: 91,
      pwin: 82,
      value: '$12.5M',
      dueIn: '30 days',
      reason: 'Strong past performance in DoD cybersecurity, active security clearances, incumbent advantage',
      tags: ['8(a)', 'Cyber', 'Secret']
    },
    {
      id: 3,
      title: 'Cloud Migration Services',
      agency: 'Department of Veterans Affairs',
      score: 89,
      pwin: 75,
      value: '$8.2M',
      dueIn: '60 days',
      reason: 'FedRAMP certified, VA past performance, strong technical team',
      tags: ['SB', 'Cloud', 'FedRAMP']
    },
    {
      id: 4,
      title: 'IT Help Desk Support',
      agency: 'General Services Administration',
      score: 87,
      pwin: 71,
      value: '$3.5M',
      dueIn: '21 days',
      reason: 'Geographic proximity, similar contract experience, competitive pricing',
      tags: ['SB', 'IT Support']
    },
    {
      id: 5,
      title: 'Facilities Maintenance',
      agency: 'Department of Energy',
      score: 85,
      pwin: 68,
      value: '$6.8M',
      dueIn: '52 days',
      reason: 'Local presence, relevant certifications, strong safety record',
      tags: ['SB', 'Facilities']
    },
    {
      id: 6,
      title: 'Software Development IDIQ',
      agency: 'Department of Homeland Security',
      score: 84,
      pwin: 70,
      value: '$25.0M',
      dueIn: '90 days',
      reason: 'Agile expertise, DHS past performance, strong technical proposal capability',
      tags: ['SB', 'Software', 'Agile']
    }
  ];

  const stats = [
    { label: 'Pipeline Value', value: '$127.5M', change: '+12%', icon: <DollarSign size={24} />, color: 'blue' },
    { label: 'Active Opportunities', value: '48', change: '+5', icon: <Target size={24} />, color: 'green' },
    { label: 'Proposals in Progress', value: '12', change: '+3', icon: <FileText size={24} />, color: 'purple' },
    { label: 'Avg PWin Score', value: '74%', change: '+8%', icon: <TrendingUp size={24} />, color: 'orange' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">AI-powered opportunity intelligence and pipeline management</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 bg-${stat.color}-100 rounded-lg flex items-center justify-center text-${stat.color}-600`}>
                {stat.icon}
              </div>
              <span className="text-sm font-semibold text-green-600 flex items-center">
                <TrendingUp size={16} className="mr-1" />
                {stat.change}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
            <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Top 25 Opportunities */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <Award className="text-yellow-500 mr-2" size={28} />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Top 25 Recommended</h2>
                  <p className="text-sm text-gray-600">AI-ranked by win probability and strategic fit</p>
                </div>
              </div>
              <Link 
                to="/opportunities"
                className="text-blue-900 hover:text-blue-700 font-semibold flex items-center text-sm"
              >
                View All <ArrowRight size={16} className="ml-1" />
              </Link>
            </div>

            {/* Opportunities List */}
            <div className="space-y-3">
              {topOpportunities.map((opp, i) => (
                <OpportunityCard key={opp.id} opp={opp} rank={i + 1} />
              ))}
            </div>

            <div className="mt-4 text-center">
              <Link 
                to="/opportunities"
                className="inline-flex items-center px-6 py-3 bg-blue-900 text-white rounded-lg hover:bg-blue-800 font-semibold transition-colors"
              >
                View All 25 Opportunities <ArrowRight size={20} className="ml-2" />
              </Link>
            </div>
          </div>
        </div>

        {/* Right: Activity & Insights */}
        <div className="space-y-6">
          {/* Pipeline Health */}
          <div className="bg-gradient-to-br from-blue-900 to-indigo-900 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center mb-4">
              <Activity className="mr-2" size={24} />
              <h3 className="text-xl font-bold">Pipeline Health</h3>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Tracking</span>
                  <span className="font-bold">18</span>
                </div>
                <div className="w-full bg-blue-800 rounded-full h-2">
                  <div className="bg-blue-300 h-2 rounded-full" style={{ width: '40%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Qualified</span>
                  <span className="font-bold">12</span>
                </div>
                <div className="w-full bg-blue-800 rounded-full h-2">
                  <div className="bg-green-400 h-2 rounded-full" style={{ width: '60%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Capture</span>
                  <span className="font-bold">8</span>
                </div>
                <div className="w-full bg-blue-800 rounded-full h-2">
                  <div className="bg-yellow-400 h-2 rounded-full" style={{ width: '50%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Bid</span>
                  <span className="font-bold">6</span>
                </div>
                <div className="w-full bg-blue-800 rounded-full h-2">
                  <div className="bg-orange-400 h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Submitted</span>
                  <span className="font-bold">4</span>
                </div>
                <div className="w-full bg-blue-800 rounded-full h-2">
                  <div className="bg-purple-400 h-2 rounded-full" style={{ width: '80%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* AI Insights */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-4">
              <Sparkles className="text-purple-600 mr-2" size={24} />
              <h3 className="text-xl font-bold text-gray-900">AI Insights</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-start p-3 bg-green-50 border-l-4 border-green-500 rounded">
                <CheckCircle2 className="text-green-600 mr-2 flex-shrink-0 mt-0.5" size={18} />
                <div className="text-sm">
                  <p className="font-semibold text-gray-900">Strong Month Ahead</p>
                  <p className="text-gray-600">6 high-probability opportunities closing in next 30 days</p>
                </div>
              </div>
              <div className="flex items-start p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
                <AlertCircle className="text-blue-600 mr-2 flex-shrink-0 mt-0.5" size={18} />
                <div className="text-sm">
                  <p className="font-semibold text-gray-900">Action Needed</p>
                  <p className="text-gray-600">3 proposals need red team review before submission</p>
                </div>
              </div>
              <div className="flex items-start p-3 bg-yellow-50 border-l-4 border-yellow-500 rounded">
                <TrendingUp className="text-yellow-600 mr-2 flex-shrink-0 mt-0.5" size={18} />
                <div className="text-sm">
                  <p className="font-semibold text-gray-900">Trending Up</p>
                  <p className="text-gray-600">DoD opportunities increased 23% this week</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Link to="/opportunities" className="block w-full px-4 py-3 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors text-center font-semibold">
                New Opportunity
              </Link>
              <Link to="/proposals" className="block w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-center font-semibold">
                Generate Proposal
              </Link>
              <Link to="/capture" className="block w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-center font-semibold">
                Create Capture Plan
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

