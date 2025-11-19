import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { 
  fetchPipelineItems, 
  deletePipelineItem, 
  updatePipelineItem,
  sharePipelineItem 
} from '../store/pipelineSlice';
import { 
  Trash2, 
  Edit2, 
  Share2, 
  Filter, 
  Download,
  Calendar,
  DollarSign,
  TrendingUp,
  Clock,
  Search,
  Eye,
  CheckCircle,
  XCircle,
  FileText,
  Sparkles
} from 'lucide-react';
import OpportunityBriefDrawer from '../components/OpportunityBriefDrawer';

interface FilterState {
  status: string;
  stage: string;
  priority: string;
  search: string;
}

const PipelineManager: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items, loading, error } = useAppSelector((state) => state.pipeline);
  
  const [filters, setFilters] = useState<FilterState>({
    status: 'all',
    stage: 'all',
    priority: 'all',
    search: ''
  });
  
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [shareEmail, setShareEmail] = useState<string>('');
  const [shareItemId, setShareItemId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid'); // Default to grid view
  const [selectedOppForBrief, setSelectedOppForBrief] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchPipelineItems({}));
  }, [dispatch]);

  // Filter items
  const filteredItems = items.filter(item => {
    if (filters.status !== 'all' && item.status !== filters.status) return false;
    if (filters.stage !== 'all' && item.stage !== filters.stage) return false;
    if (filters.priority !== 'all' && item.priority !== filters.priority) return false;
    if (filters.search && !item.title.toLowerCase().includes(filters.search.toLowerCase()) &&
        !item.agency.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    return true;
  });

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this pipeline item?')) {
      await dispatch(deletePipelineItem(id));
      dispatch(fetchPipelineItems({}));
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    await dispatch(updatePipelineItem({ id, data: { status } }));
    dispatch(fetchPipelineItems({}));
  };

  const handleShare = async () => {
    if (shareItemId && shareEmail) {
      await dispatch(sharePipelineItem({ id: shareItemId, email: shareEmail }));
      setShareItemId(null);
      setShareEmail('');
      alert('Pipeline item shared successfully!');
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-700',
      in_progress: 'bg-blue-100 text-blue-700',
      review: 'bg-yellow-100 text-yellow-700',
      submitted: 'bg-green-100 text-green-700'
    };
    return colors[status as keyof typeof colors] || colors.draft;
  };

  const getStageColor = (stage: string) => {
    const colors = {
      prospecting: 'bg-purple-100 text-purple-700',
      qualifying: 'bg-indigo-100 text-indigo-700',
      proposal: 'bg-blue-100 text-blue-700',
      negotiation: 'bg-orange-100 text-orange-700',
      won: 'bg-green-100 text-green-700',
      lost: 'bg-red-100 text-red-700'
    };
    return colors[stage as keyof typeof colors] || colors.prospecting;
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'bg-gray-100 text-gray-600',
      medium: 'bg-blue-100 text-blue-600',
      high: 'bg-orange-100 text-orange-600',
      critical: 'bg-red-100 text-red-600'
    };
    return colors[priority as keyof typeof colors] || colors.medium;
  };

  const formatCurrency = (value: number | null | undefined) => {
    if (!value) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Calculate stats
  const stats = {
    total: filteredItems.length,
    totalValue: filteredItems.reduce((sum, item) => sum + (item.contract_value || 0), 0),
    active: filteredItems.filter(i => i.status === 'in_progress').length,
    avgPwin: filteredItems.reduce((sum, item) => sum + (item.pwin_score || 0), 0) / (filteredItems.length || 1)
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Pipeline Manager</h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage your opportunities and track proposal progress
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                {viewMode === 'list' ? 'Grid View' : 'List View'}
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">Total Items</p>
                  <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
                </div>
                <div className="bg-blue-200 p-3 rounded-full">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium">Total Value</p>
                  <p className="text-2xl font-bold text-green-900">
                    {formatCurrency(stats.totalValue)}
                  </p>
                </div>
                <div className="bg-green-200 p-3 rounded-full">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-600 font-medium">Active</p>
                  <p className="text-2xl font-bold text-orange-900">{stats.active}</p>
                </div>
                <div className="bg-orange-200 p-3 rounded-full">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 font-medium">Avg P-Win</p>
                  <p className="text-2xl font-bold text-purple-900">{stats.avgPwin.toFixed(0)}%</p>
                </div>
                <div className="bg-purple-200 p-3 rounded-full">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <span className="font-medium text-gray-700">Filters:</span>
            </div>

            {/* Search */}
            <div className="flex-1 min-w-[200px] max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by title or agency..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Status Filter */}
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="in_progress">In Progress</option>
              <option value="review">Review</option>
              <option value="submitted">Submitted</option>
            </select>

            {/* Stage Filter */}
            <select
              value={filters.stage}
              onChange={(e) => setFilters({ ...filters, stage: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Stages</option>
              <option value="prospecting">Prospecting</option>
              <option value="qualifying">Qualifying</option>
              <option value="proposal">Proposal</option>
              <option value="negotiation">Negotiation</option>
              <option value="won">Won</option>
              <option value="lost">Lost</option>
            </select>

            {/* Priority Filter */}
            <select
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>

            {/* Clear Filters */}
            <button
              onClick={() => setFilters({ status: 'all', stage: 'all', priority: 'all', search: '' })}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
            >
              Clear All
            </button>
          </div>
        </div>

        {/* Results Count */}
        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredItems.length} of {items.length} items
        </div>

        {/* Items List/Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
            <p className="text-red-700">{error}</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center mt-4">
            <p className="text-gray-500 text-lg">No pipeline items found</p>
            <p className="text-gray-400 text-sm mt-2">Try adjusting your filters or add new opportunities to the pipeline</p>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4' : 'space-y-4 mt-4'}>
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <Link
                        to={`/proposal-generator/${item.opportunity_id || item.id}`}
                        className="text-lg font-semibold text-gray-900 mb-1 hover:text-blue-600 transition-colors cursor-pointer block"
                      >
                        {item.title}
                      </Link>
                      <p className="text-sm text-gray-600">{item.agency}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShareItemId(item.id)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                        title="Share"
                      >
                        <Share2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Description */}
                  {item.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {item.description}
                    </p>
                  )}

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                      {item.status.replace('_', ' ').toUpperCase()}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStageColor(item.stage)}`}>
                      {item.stage.toUpperCase()}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(item.priority)}`}>
                      {item.priority.toUpperCase()}
                    </span>
                  </div>

                  {/* Info Grid */}
                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div>
                      <p className="text-gray-500 mb-1">Contract Value</p>
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(item.contract_value)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Due Date</p>
                      <p className="font-semibold text-gray-900">
                        {formatDate(item.due_date)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">P-Win Score</p>
                      <p className="font-semibold text-gray-900">
                        {item.pwin_score ? `${item.pwin_score}%` : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Progress</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${item.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-medium">{item.progress}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 pt-4 border-t border-gray-100">
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedOppForBrief(item.opportunity_id || item.id);
                        }}
                        className="flex-1 px-3 py-2 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 flex items-center justify-center gap-2"
                      >
                        <FileText className="h-4 w-4" />
                        Get Brief
                      </button>
                      <Link
                        to={`/proposal-generator/${item.opportunity_id || item.id}`}
                        className="flex-1 px-3 py-2 text-sm bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded hover:from-purple-700 hover:to-indigo-700 flex items-center justify-center gap-2"
                      >
                        <Sparkles className="h-4 w-4" />
                        Generate Proposal
                      </Link>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdateStatus(item.id, 'in_progress')}
                        disabled={item.status === 'in_progress'}
                        className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Start Work
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(item.id, 'submitted')}
                        disabled={item.status === 'submitted'}
                        className="flex-1 px-3 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Mark Submitted
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Share Modal */}
      {shareItemId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Share Pipeline Item</h3>
            <input
              type="email"
              placeholder="Enter email address"
              value={shareEmail}
              onChange={(e) => setShareEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={handleShare}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Share
              </button>
              <button
                onClick={() => {
                  setShareItemId(null);
                  setShareEmail('');
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Opportunity Brief Drawer */}
      <OpportunityBriefDrawer 
        isOpen={!!selectedOppForBrief}
        onClose={() => setSelectedOppForBrief(null)}
        opportunity={filteredItems.find(item => (item.opportunity_id || item.id) === selectedOppForBrief) ? {
          id: selectedOppForBrief || '',
          title: filteredItems.find(item => (item.opportunity_id || item.id) === selectedOppForBrief)?.title || '',
          synopsis: filteredItems.find(item => (item.opportunity_id || item.id) === selectedOppForBrief)?.description || '',
          agency: filteredItems.find(item => (item.opportunity_id || item.id) === selectedOppForBrief)?.agency || '',
          value: filteredItems.find(item => (item.opportunity_id || item.id) === selectedOppForBrief)?.contract_value || undefined,
          dueDate: filteredItems.find(item => (item.opportunity_id || item.id) === selectedOppForBrief)?.due_date || undefined,
          pwin_score: filteredItems.find(item => (item.opportunity_id || item.id) === selectedOppForBrief)?.pwin_score || undefined,
        } : null}
      />
    </div>
  );
};

export default PipelineManager;

