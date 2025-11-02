import { useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchActiveProposals, selectActiveProposals, selectPipelineLoading } from '../store/pipelineSlice';
import { formatDaysUntilDue, getDaysUntilDue } from '../utils/calendarUtils';

export default function ActiveProposals() {
  const dispatch = useAppDispatch();
  const activeProposals = useAppSelector(selectActiveProposals);
  const loading = useAppSelector(selectPipelineLoading);

  useEffect(() => {
    dispatch(fetchActiveProposals(10));
  }, [dispatch]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'review':
        return 'bg-yellow-100 text-yellow-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'submitted':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'in_progress':
        return 'In Progress';
      case 'review':
        return 'Review';
      case 'draft':
        return 'Draft';
      case 'submitted':
        return 'Submitted';
      default:
        return status;
    }
  };

  const getInitials = (index: number) => {
    const initials = ['JD', 'SK', 'MP', 'AB', 'CD', 'EF', 'GH', 'IJ', 'KL'];
    return initials[index % initials.length];
  };

  if (loading) {
    return (
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Active Proposals</h2>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading proposals...</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Active Proposals</h2>
        <Link
          to="/proposals"
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          View All →
        </Link>
      </div>

      {activeProposals.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>No active proposals</p>
          <p className="text-sm mt-2">Add opportunities to your pipeline to get started</p>
        </div>
      ) : (
        <div className="space-y-3">
          {activeProposals.map((proposal, index) => {
            const daysUntil = proposal.due_date ? getDaysUntilDue(new Date(proposal.due_date)) : null;
            const teamSize = proposal.team_members?.length || (index % 4) + 1; // Mock team size
            
            return (
              <Link
                key={proposal.id}
                to={`/proposals?status=${proposal.status}`}
                className="block border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-blue-300 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-gray-900">
                        {proposal.title}
                      </h3>
                      <span className={`text-xs px-2 py-1 rounded ${getStatusColor(proposal.status)}`}>
                        {getStatusLabel(proposal.status)}
                      </span>
                    </div>

                    {daysUntil !== null && (
                      <p className={`text-sm mb-2 ${daysUntil < 7 ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                        {formatDaysUntilDue(daysUntil)}
                      </p>
                    )}

                    {/* Progress Bar */}
                    <div className="mb-2">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-medium text-gray-900">{proposal.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            proposal.progress >= 75 
                              ? 'bg-green-600' 
                              : proposal.progress >= 50 
                              ? 'bg-blue-600' 
                              : 'bg-yellow-600'
                          }`}
                          style={{ width: `${proposal.progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Team Members */}
                    <div className="flex items-center gap-2 mt-3">
                      <div className="flex -space-x-2">
                        {Array.from({ length: Math.min(teamSize, 4) }).map((_, idx) => (
                          <div
                            key={idx}
                            className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-medium border-2 border-white"
                          >
                            {getInitials(index + idx)}
                          </div>
                        ))}
                      </div>
                      <span className="text-sm text-gray-600 flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {teamSize} team member{teamSize !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Pagination (if needed) */}
      {activeProposals.length > 0 && (
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
          <button
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={true} // Will be controlled by pagination state
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Showing {activeProposals.length} active proposals
          </span>
          <button
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={true} // Will be controlled by pagination state
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </Card>
  );
}
