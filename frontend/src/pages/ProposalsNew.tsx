import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { 
  FileText, Plus, Search, Loader2, Eye, Edit, 
  ExternalLink, Calendar, CheckCircle 
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface Proposal {
  id: string;
  title: string;
  solicitation_number?: string;
  status: string;
  compliance_score?: number;
  red_team_score?: number;
  is_508_compliant: boolean;
  created_at?: string;
  mockGenerated?: boolean;
}

export default function ProposalsNew() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  
  const limit = 10;

  useEffect(() => {
    fetchProposals();
  }, [page, statusFilter]);

  const fetchProposals = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(statusFilter && { status: statusFilter }),
      });

      const response = await fetch(
        `http://localhost:8000/api/v1/proposals/mine?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch proposals');
      }

      const data = await response.json();
      setProposals(data.items || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('Error fetching proposals:', err);
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

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return 'N/A';
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Proposals</h1>
          <p className="text-gray-600 mt-1">
            Manage and track your proposal submissions
          </p>
        </div>
        <Link
          to="/proposals/new"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="h-5 w-5" />
          New Proposal
        </Link>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-sm text-gray-600">Total Proposals</p>
          <p className="text-2xl font-bold mt-1">{total}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">In Progress</p>
          <p className="text-2xl font-bold mt-1 text-blue-600">
            {proposals.filter((p) => ['draft', 'in_progress'].includes(p.status)).length}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">Under Review</p>
          <p className="text-2xl font-bold mt-1 text-orange-600">
            {proposals.filter((p) => ['pink_team', 'red_team', 'gold_team'].includes(p.status)).length}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">Submitted</p>
          <p className="text-2xl font-bold mt-1 text-green-600">
            {proposals.filter((p) => p.status === 'submitted').length}
          </p>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1">
            <label className="text-sm text-gray-600 mb-2 block">Filter by Status</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="in_progress">In Progress</option>
              <option value="pink_team">Pink Team</option>
              <option value="red_team">Red Team</option>
              <option value="gold_team">Gold Team</option>
              <option value="final">Final</option>
              <option value="submitted">Submitted</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Proposals List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-3 text-gray-600">Loading proposals...</span>
        </div>
      ) : proposals.length === 0 ? (
        <Card className="p-12 text-center">
          <FileText className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg">No proposals yet</p>
          <p className="text-sm text-gray-400 mt-2">
            Get started by creating your first proposal
          </p>
          <Link
            to="/proposals/new"
            className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="h-5 w-5" />
            Create Proposal
          </Link>
        </Card>
      ) : (
        <>
          <div className="space-y-4">
            {proposals.map((proposal) => (
              <Card key={proposal.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {proposal.title}
                      </h3>
                      {proposal.mockGenerated && (
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                          Mock Data
                        </span>
                      )}
                    </div>
                    
                    {proposal.solicitation_number && (
                      <p className="text-sm text-gray-600 mt-1">
                        Solicitation: {proposal.solicitation_number}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-4 mt-3 text-sm">
                      <span className={`px-3 py-1 rounded-full ${getStatusColor(proposal.status)}`}>
                        {proposal.status.replace('_', ' ').toUpperCase()}
                      </span>
                      
                      {proposal.compliance_score !== undefined && (
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-gray-600">
                            Compliance: {proposal.compliance_score}%
                          </span>
                        </div>
                      )}
                      
                      {proposal.red_team_score !== undefined && (
                        <div className="flex items-center gap-1">
                          <span className="text-gray-600">
                            Red Team: {proposal.red_team_score}/100
                          </span>
                        </div>
                      )}
                      
                      {proposal.is_508_compliant && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          508 Compliant
                        </span>
                      )}
                      
                      <div className="flex items-center gap-1 text-gray-500">
                        <Calendar className="h-4 w-4" />
                        <span>Created: {formatDate(proposal.created_at)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Link
                      to={`/proposals/${proposal.id}`}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                      title="View proposal"
                    >
                      <Eye className="h-5 w-5 text-gray-600" />
                    </Link>
                    <Link
                      to={`/proposals/${proposal.id}/edit`}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                      title="Edit proposal"
                    >
                      <Edit className="h-5 w-5 text-gray-600" />
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of{' '}
                {total} proposals
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-4 py-2 border border-gray-300 rounded-lg bg-blue-50 text-blue-600">
                  {page}
                </span>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page >= totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

