import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Target, FileText, DollarSign, Award, Loader2 } from 'lucide-react';
import TopOpportunities from '../components/TopOpportunities';
import ActiveProposals from '../components/ActiveProposals';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pipelineData, setPipelineData] = useState([
    { stage: 'Tracking', count: 45 },
    { stage: 'Qualified', count: 12 },
    { stage: 'Capture', count: 8 },
    { stage: 'Bid', count: 3 },
    { stage: 'Submitted', count: 2 },
    { stage: 'Won', count: 1 },
  ]);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/api/v1/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value || 0);
  };

  const statsCards = stats ? [
    { 
      label: 'Total Pipeline Value', 
      value: formatCurrency(stats.totalPipelineValue || stats.avgBidValue * stats.totalContracts), 
      icon: <DollarSign />, 
      color: 'bg-green-500' 
    },
    { 
      label: 'Active Opportunities', 
      value: stats.totalActiveContracts?.toString() || '0', 
      icon: <Target />, 
      color: 'bg-blue-500' 
    },
    { 
      label: 'Active Proposals', 
      value: stats.activeProposalsCount?.toString() || '0', 
      icon: <FileText />, 
      color: 'bg-purple-500' 
    },
    { 
      label: 'Avg Bid Value', 
      value: formatCurrency(stats.avgBidValue), 
      icon: <TrendingUp />, 
      color: 'bg-orange-500' 
    },
  ] : [
    { label: 'Total Pipeline Value', value: '$0', icon: <DollarSign />, color: 'bg-green-500' },
    { label: 'Active Opportunities', value: '0', icon: <Target />, color: 'bg-blue-500' },
    { label: 'Active Proposals', value: '0', icon: <FileText />, color: 'bg-purple-500' },
    { label: 'Avg Bid Value', value: '$0', icon: <TrendingUp />, color: 'bg-orange-500' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">
          {stats?.user?.name ? `Welcome back, ${stats.user.name}` : 'Welcome to GovLogicAI'}
        </p>
      </div>

      {/* Stats Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-3 text-gray-600">Loading dashboard...</span>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statsCards.map((stat, index) => (
              <Card key={index} className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                    <p className="text-3xl font-bold mt-2">{stat.value}</p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg text-white`}>
                    {stat.icon}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Top Opportunities and Active Proposals */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TopOpportunities />
            <ActiveProposals />
          </div>
        </>
      )}

      {/* Pipeline Chart */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Pipeline Overview</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={pipelineData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="stage" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#1e3a8a" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Recent Activity */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
        <div className="space-y-4">
          <ActivityItem
            icon={<Award className="text-green-500" />}
            title="Navy Training Systems awarded!"
            subtitle="$2.3M contract"
            time="2 hours ago"
          />
          <ActivityItem
            icon={<Target className="text-blue-500" />}
            title="DHS Cloud Infrastructure"
            subtitle="PWin increased to 74%"
            time="5 hours ago"
          />
          <ActivityItem
            icon={<FileText className="text-purple-500" />}
            title="Army Cybersecurity proposal"
            subtitle="Pink Team review due tomorrow"
            time="1 day ago"
          />
        </div>
      </Card>
    </div>
  );
}

function ActivityItem({ icon, title, subtitle, time }) {
  return (
    <div className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg">
      <div className="flex-shrink-0">{icon}</div>
      <div className="flex-1">
        <p className="font-semibold">{title}</p>
        <p className="text-sm text-gray-600">{subtitle}</p>
      </div>
      <div className="text-sm text-gray-500">{time}</div>
    </div>
  );
}

