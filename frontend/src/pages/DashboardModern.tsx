import { useState } from 'react';
import { 
  TrendingUp, TrendingDown, DollarSign, FileText, Target, 
  Award, Clock, AlertCircle, ChevronRight, MoreVertical,
  ArrowUpRight, Activity
} from 'lucide-react';
import { Link } from 'react-router-dom';
import TopOpportunities from '../components/TopOpportunities';
import ActiveProposalsSection from '../components/ActiveProposalsSection';

export default function DashboardModern() {
  const [timeRange, setTimeRange] = useState('30d');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your pipeline.</p>
          </div>
          <div className="flex items-center space-x-3">
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
            <Link
              to="/proposals"
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
            >
              New Proposal
            </Link>
          </div>
        </div>
      </div>

      <div className="p-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Pipeline Value"
            value="$8.4M"
            change="+12.5%"
            trend="up"
            icon={<DollarSign size={24} />}
            color="blue"
          />
          <MetricCard
            title="Active Proposals"
            value="23"
            change="+8"
            trend="up"
            icon={<FileText size={24} />}
            color="green"
          />
          <MetricCard
            title="Win Rate"
            value="68%"
            change="+5.2%"
            trend="up"
            icon={<Award size={24} />}
            color="purple"
          />
          <MetricCard
            title="Avg. Proposal Time"
            value="2.3 days"
            change="-35%"
            trend="up"
            icon={<Clock size={24} />}
            color="orange"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Pipeline Chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Pipeline Performance</h2>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <MoreVertical size={20} className="text-gray-600" />
              </button>
            </div>
            <div className="space-y-4">
              <PipelineStage name="Prospecting" count={45} value="$12.5M" percentage={100} color="blue" />
              <PipelineStage name="Qualifying" count={32} value="$8.4M" percentage={70} color="indigo" />
              <PipelineStage name="Proposal" count={23} value="$5.2M" percentage={45} color="purple" />
              <PipelineStage name="Negotiation" count={12} value="$2.8M" percentage={25} color="green" />
              <PipelineStage name="Won" count={8} value="$1.6M" percentage={15} color="emerald" />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
            <div className="space-y-3">
              <QuickAction
                icon={<Target size={20} />}
                title="Find Opportunities"
                description="Browse new contracts"
                color="blue"
                link="/opportunities"
              />
              <QuickAction
                icon={<FileText size={20} />}
                title="Create Proposal"
                description="Start new bid"
                color="green"
                link="/proposals"
              />
              <QuickAction
                icon={<Activity size={20} />}
                title="Capture Plan"
                description="Manage pursuits"
                color="purple"
                link="/capture"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Opportunities - Now using real data from SAM.gov */}
          <TopOpportunities />

          {/* Active Proposals - Now showing real auto-generated proposals */}
          <ActiveProposalsSection />
        </div>

        {/* Alerts/Notifications */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 p-6">
          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <AlertCircle className="text-white" size={20} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 mb-1">3 new high-match opportunities found</h3>
              <p className="text-gray-600 mb-4">We found 3 contracts matching your NAICS codes and past performance. Review now to stay ahead of competitors.</p>
              <Link to="/opportunities" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                Review Opportunities <ArrowUpRight size={16} className="ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ 
  title, 
  value, 
  change, 
  trend, 
  icon, 
  color 
}: { 
  title: string; 
  value: string; 
  change: string; 
  trend: 'up' | 'down'; 
  icon: React.ReactNode; 
  color: string;
}) {
  const colorClasses = {
    blue: 'from-blue-500 to-indigo-500',
    green: 'from-green-500 to-emerald-500',
    purple: 'from-purple-500 to-pink-500',
    orange: 'from-orange-500 to-red-500'
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses[color as keyof typeof colorClasses]} flex items-center justify-center text-white`}>
          {icon}
        </div>
        <div className={`flex items-center space-x-1 text-sm font-semibold ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
          {trend === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
          <span>{change}</span>
        </div>
      </div>
      <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-sm text-gray-600">{title}</div>
    </div>
  );
}

function PipelineStage({ 
  name, 
  count, 
  value, 
  percentage, 
  color 
}: { 
  name: string; 
  count: number; 
  value: string; 
  percentage: number; 
  color: string;
}) {
  const colorClasses = {
    blue: 'bg-blue-500',
    indigo: 'bg-indigo-500',
    purple: 'bg-purple-500',
    green: 'bg-green-500',
    emerald: 'bg-emerald-500'
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-gray-900">{name}</span>
          <span className="text-sm text-gray-500">({count})</span>
        </div>
        <span className="font-semibold text-gray-900">{value}</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-3">
        <div 
          className={`h-3 rounded-full ${colorClasses[color as keyof typeof colorClasses]} transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}

function QuickAction({ 
  icon, 
  title, 
  description, 
  color, 
  link 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string; 
  color: string; 
  link: string;
}) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600'
  };

  return (
    <Link 
      to={link}
      className="flex items-center space-x-4 p-4 rounded-xl hover:bg-gray-50 transition-all group cursor-pointer border border-gray-100"
    >
      <div className={`w-12 h-12 rounded-xl ${colorClasses[color as keyof typeof colorClasses]} flex items-center justify-center`}>
        {icon}
      </div>
      <div className="flex-1">
        <div className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{title}</div>
        <div className="text-sm text-gray-600">{description}</div>
      </div>
      <ChevronRight className="text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" size={20} />
    </Link>
  );
}


function ProposalCard({ 
  title, 
  status, 
  progress, 
  deadline, 
  team 
}: { 
  title: string; 
  status: string; 
  progress: number; 
  deadline: string; 
  team: string[];
}) {
  return (
    <div className="p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all cursor-pointer">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
          <div className="flex items-center space-x-3 text-sm">
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
              status === 'Review' ? 'bg-yellow-100 text-yellow-700' :
              status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              {status}
            </span>
            <span className="text-gray-600">Due in {deadline}</span>
          </div>
        </div>
      </div>
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm text-gray-600">Progress</span>
          <span className="text-sm font-semibold text-gray-900">{progress}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2">
          <div 
            className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <div className="flex -space-x-2">
          {team.map((initial, i) => (
            <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-xs font-semibold border-2 border-white">
              {initial}
            </div>
          ))}
        </div>
        <span className="text-sm text-gray-600">{team.length} team members</span>
      </div>
    </div>
  );
}

