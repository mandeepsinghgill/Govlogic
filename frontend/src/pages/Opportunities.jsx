import { useState, useEffect } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Plus, Search, Filter, TrendingUp, Calendar, DollarSign } from 'lucide-react';

export default function Opportunities() {
  const [view, setView] = useState('kanban'); // kanban or table

    const [opportunities, setOpportunities] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const stages = [
    { id: 'tracking', name: 'Tracking', color: 'bg-gray-200' },
    { id: 'qualified', name: 'Qualified', color: 'bg-blue-200' },
    { id: 'capture', name: 'Capture', color: 'bg-purple-200' },
    { id: 'bid', name: 'Bid', color: 'bg-orange-200' },
    { id: 'submitted', name: 'Submitted', color: 'bg-yellow-200' },
    { id: 'won', name: 'Won', color: 'bg-green-200' },
  ];

  useEffect(() => {
    const fetchOpportunities = async () => {
      try {
        setLoading(true);
     const response = await fetch("/api/v1/opportunities");        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        const groupedOpportunities = data.reduce((acc, opp) => {
          const stage = opp.stage.toLowerCase();
          if (!acc[stage]) {
            acc[stage] = [];
          }
          acc[stage].push(opp);
          return acc;
        }, {});

        setOpportunities(groupedOpportunities);
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchOpportunities();
  }, []);

  if (loading) return <div>Loading opportunities...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Opportunities</h1>
          <p className="text-gray-600 mt-1">Manage your BD pipeline</p>
        </div>
        <Button className="bg-blue-900 hover:bg-blue-800">
          <Plus size={20} className="mr-2" />
          New Opportunity
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search opportunities..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
            />
          </div>
          <Button variant="outline">
            <Filter size={20} className="mr-2" />
            Filters
          </Button>
        </div>
      </Card>

      {/* Kanban Board */}
      <div className="overflow-x-auto">
        <div className="flex space-x-4 min-w-max pb-4">
          {stages.map((stage) => (
            <KanbanColumn
              key={stage.id}
              stage={stage}
              opportunities={opportunities[stage.id] || []}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function KanbanColumn({ stage, opportunities }) {
  return (
    <div className="w-80 flex-shrink-0">
      <div className={`${stage.color} rounded-t-lg p-3`}>
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-900">{stage.name}</h3>
          <span className="bg-white px-2 py-1 rounded-full text-sm font-semibold">
            {stage.count}
          </span>
        </div>
      </div>
      <div className="bg-gray-100 p-3 space-y-3 min-h-[600px] rounded-b-lg">
        {opportunities.map((opp) => (
          <OpportunityCard key={opp.id} opportunity={opp} />
        ))}
      </div>
    </div>
  );
}

function OpportunityCard({ opportunity }) {
  const getPWinColor = (pwin) => {
    if (pwin >= 70) return 'text-green-600 bg-green-100';
    if (pwin >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
      <h4 className="font-semibold text-gray-900 mb-2">{opportunity.title}</h4>
      
      <div className="space-y-2 text-sm">
        <div className="flex items-center text-gray-600">
          <DollarSign size={16} className="mr-1" />
          ${(opportunity.value / 1000000).toFixed(1)}M
        </div>
        
        <div className="flex items-center text-gray-600">
          <Calendar size={16} className="mr-1" />
          {opportunity.dueDate}
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-gray-600">PWin:</span>
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getPWinColor(opportunity.pwin)}`}>
            {opportunity.pwin}%
          </span>
        </div>
        
        <div className="pt-2 border-t">
          <span className="text-xs text-gray-500">{opportunity.agency}</span>
        </div>
      </div>
    </Card>
  );
}

