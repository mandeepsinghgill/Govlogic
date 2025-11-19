import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Loader2, FileText, CheckCircle2, Sparkles } from 'lucide-react';
import { proposalService } from '../services/proposalService';

interface Proposal {
  id: string;
  title: string;
  status: string;
  opportunity_id?: string;
  created_at?: string;
}

function ProposalCard({ 
  proposal 
}: { 
  proposal: Proposal 
}) {
  const statusLabels: { [key: string]: string } = {
    'draft': 'Draft',
    'in_progress': 'In Progress',
    'pink_team': 'Pink Team',
    'red_team': 'Red Team',
    'gold_team': 'Gold Team',
    'final': 'Final',
    'submitted': 'Submitted'
  };

  const statusColors: { [key: string]: string } = {
    'draft': 'bg-gray-100 text-gray-800',
    'in_progress': 'bg-blue-100 text-blue-800',
    'pink_team': 'bg-pink-100 text-pink-800',
    'red_team': 'bg-red-100 text-red-800',
    'gold_team': 'bg-yellow-100 text-yellow-800',
    'final': 'bg-green-100 text-green-800',
    'submitted': 'bg-purple-100 text-purple-800'
  };

  return (
    <Link
      to={`/proposals/${proposal.id}`}
      className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-gray-900 flex-1">{proposal.title}</h3>
        <span className={`ml-2 px-2 py-1 rounded text-xs font-semibold ${statusColors[proposal.status] || 'bg-gray-100 text-gray-800'}`}>
          {statusLabels[proposal.status] || proposal.status}
        </span>
      </div>
      <div className="flex items-center gap-2 text-xs text-gray-600">
        {proposal.opportunity_id && (
          <span className="flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-green-600" />
            <span className="text-green-700 font-medium">Auto-Generated</span>
          </span>
        )}
        {proposal.created_at && (
          <span>
            Created {new Date(proposal.created_at).toLocaleDateString()}
          </span>
        )}
      </div>
    </Link>
  );
}

export default function ActiveProposalsSection() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActiveProposals();
  }, []);

  const fetchActiveProposals = async () => {
    try {
      setLoading(true);
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      
      // Fetch proposals with active statuses
      const response = await fetch(
        `${API_URL}/api/v1/proposals?skip=0&limit=5&status=draft`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const proposalsList = Array.isArray(data) ? data : (data.items || []);
        // Filter to show only active statuses
        const activeProposals = proposalsList.filter((p: Proposal) => 
          ['draft', 'in_progress', 'pink_team', 'red_team'].includes(p.status)
        ).slice(0, 3);
        setProposals(activeProposals);
      }
    } catch (err) {
      console.error('Error fetching active proposals:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Active Proposals</h2>
        <Link to="/proposals" className="text-blue-600 hover:text-blue-700 font-semibold text-sm flex items-center">
          View All <ChevronRight size={16} />
        </Link>
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading proposals...</span>
        </div>
      ) : proposals.length === 0 ? (
        <div className="text-center py-8">
          <FileText className="h-12 w-12 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-600">No active proposals yet</p>
          <p className="text-xs text-gray-500 mt-1">
            Proposals are auto-generated when you add opportunities to your pipeline
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {proposals.map((proposal) => (
            <ProposalCard key={proposal.id} proposal={proposal} />
          ))}
        </div>
      )}
    </div>
  );
}

