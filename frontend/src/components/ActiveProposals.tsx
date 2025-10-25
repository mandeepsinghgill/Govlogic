import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { FileText, Loader2, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Proposal {
  id: string;
  title: string;
  solicitation_number?: string;
  status: string;
  compliance_score?: number;
  created_at?: string;
  mockGenerated?: boolean;
}

export default function ActiveProposals() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProposals();
  }, []);

  const fetchProposals = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/api/v1/proposals/mine?limit=5', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch proposals');
      }

      const data = await response.json();
      setProposals(data.items || []);
    } catch (err) {
      console.error('Error fetching proposals:', err);
      setError('Failed to load proposals');
      setProposals([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'draft': 'bg-gray-100 text-gray-800',
      'in_progress': 'bg-blue-100 text-blue-800',
      'pink_team': 'bg-pink-100 text-pink-800',
      'red_team': 'bg-red-100 text-red-800',
      'gold_team': 'bg-yellow-100 text-yellow-800',
      'final': 'bg-green-100 text-green-800',
      'submitted': 'bg-purple-100 text-purple-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Active Proposals</h2>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-3 text-gray-600">Loading proposals...</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Active Proposals</h2>
        <div className="flex gap-2">
          <Link
            to="/proposals/new"
            className="flex items-center gap-1 text-sm bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            New
          </Link>
          <Link
            to="/proposals"
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            View All →
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-yellow-800">{error}</p>
        </div>
      )}

      {proposals.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <FileText className="h-12 w-12 mx-auto mb-3 text-gray-400" />
          <p>No active proposals</p>
          <Link
            to="/proposals/new"
            className="inline-block mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Create your first proposal →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {proposals.map((proposal) => (
            <Link
              key={proposal.id}
              to={`/proposals/${proposal.id}`}
              className="block border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">
                      {proposal.title}
                    </h3>
                    {proposal.mockGenerated && (
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                        Mock
                      </span>
                    )}
                  </div>
                  {proposal.solicitation_number && (
                    <p className="text-sm text-gray-600 mt-1">
                      {proposal.solicitation_number}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-2">
                    <span className={`text-xs px-2 py-1 rounded ${getStatusColor(proposal.status)}`}>
                      {proposal.status.replace('_', ' ').toUpperCase()}
                    </span>
                    {proposal.compliance_score && (
                      <span className="text-xs text-gray-600">
                        Compliance: {proposal.compliance_score}%
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </Card>
  );
}

