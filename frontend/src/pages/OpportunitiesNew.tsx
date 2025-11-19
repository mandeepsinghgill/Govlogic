import { useState, useEffect, useCallback, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { 
  Search, Filter, Building2, DollarSign, Calendar, 
  ExternalLink, TrendingUp, Loader2, RefreshCw, Grid3x3, List, 
  FileText, Plus, CalendarPlus, X, Check, Eye, CheckCircle2, Sparkles
} from 'lucide-react';
import { useAppDispatch } from '../store/hooks';
import { addToPipeline } from '../store/pipelineSlice';
import { addToCalendar, getCalendarColor } from '../utils/calendarUtils';
import toast, { Toaster } from 'react-hot-toast';
import { briefService, Brief } from '../services/briefService';
import { proposalService, Proposal } from '../services/proposalService';
import { Link } from 'react-router-dom';

interface Opportunity {
  id: string;
  title: string;
  synopsis: string;
  agency: string;
  office?: string;
  value?: number;
  dueDate?: string;
  postedDate?: string;
  pwin_score?: number;
  naicsCode?: string;
  setAside?: string;
  samGovUrl?: string;
  type?: string;
}

export default function OpportunitiesNew() {
  const dispatch = useAppDispatch();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [filters, setFilters] = useState({
    naicsCode: '',
    keyword: '',
  });
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [addingToPipeline, setAddingToPipeline] = useState<Record<string, boolean>>({});
  const [showBrief, setShowBrief] = useState<string | null>(null);
  const [briefs, setBriefs] = useState<Record<string, Brief>>({});
  const [briefsLoading, setBriefsLoading] = useState<Set<string>>(new Set());
  const [proposals, setProposals] = useState<Record<string, Proposal>>({});
  const [proposalsLoading, setProposalsLoading] = useState<Set<string>>(new Set());
  const [pipelineItemIds, setPipelineItemIds] = useState<Set<string>>(new Set());
  const [searchRequestId, setSearchRequestId] = useState<string | null>(null);

  const limit = 20;

  useEffect(() => {
    // Fetch initial data or when page/filters change, but not on searchTerm change
    fetchOpportunities();
  }, [page, filters]);

  // Check for auto-generated briefs and proposals when opportunities load
  useEffect(() => {
    if (opportunities.length > 0) {
      opportunities.forEach(opp => {
        checkBriefStatus(opp.id);
        checkProposalStatus(opp.id);
      });
    }
  }, [opportunities]);

  // Clear search when input is empty
  useEffect(() => {
    if (searchTerm.length === 0 && activeSearch !== '') {
      // Clear search when input is empty
      clearSearch();
    }
  }, [searchTerm, activeSearch]);

  const fetchOpportunities = async (isSearch = false) => {
    try {
      if (isSearch) {
        setSearching(true);
      } else {
        setLoading(true);
      }
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(filters.naicsCode && { naics_code: filters.naicsCode }),
        ...(activeSearch && { keyword: activeSearch }),
      });

      const endpoint = activeSearch ? 'sam-search' : 'search';
      const response = await fetch(
        `http://localhost:8000/api/v1/opportunities/${endpoint}?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          },
        }
      );

      if (!response.ok) {
        // Provide clearer messaging for invalid SAM.gov API key
        if (response.status === 401) {
          const errorData = await response.json().catch(() => ({ detail: 'SAM.gov API key is invalid or not configured.' }));
          throw new Error(errorData.detail || 'SAM.gov API key is invalid or not configured.');
        }
        const errorData = await response.json().catch(() => ({ detail: 'Failed to fetch opportunities' }));
        throw new Error(errorData.detail || 'Failed to fetch opportunities');
      }

      const data = await response.json();
      setOpportunities(data.items || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('Error fetching opportunities:', err);
      const message = (err as any)?.message || 'Failed to fetch opportunities.';
      toast.error(message, {
        id: 'fetch-opportunities-error'
      });
    } finally {
      setLoading(false);
      setSearching(false);
    }
  };

  const searchFromSAM = async (requestId: string) => {
    if (searchTerm.length < 4) {
      toast.error('Please enter at least 4 characters to search');
      return;
    }

    // Prevent multiple simultaneous requests
    if (searching) {
      console.log(`Cancelling duplicate search request: ${requestId}`);
      return;
    }

    try {
      setSearching(true);
      setSearchRequestId(requestId);

      // Single loading toast (reuses existing if any)
      const loadingToastId = toast.loading(`Searching SAM.gov for "${searchTerm}"...`, {
        id: 'sam-search-loading'
      });

      const response = await fetch(
        `http://localhost:8000/api/v1/opportunities/sam-search`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          },
          body: JSON.stringify({
            keyword: searchTerm,
            page: page,
            limit: limit,
            naics_code: filters.naicsCode || undefined,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
        if (response.status === 401) {
          throw new Error('SAM.gov API key is invalid or not configured. Please check your API key configuration.');
        }
        throw new Error(errorData.detail || 'Failed to search SAM.gov');
      }

      const data = await response.json();
      setOpportunities(data.items || []);
      setTotal(data.total || 0);

      // Update the loading toast to success
      toast.success(`Found ${data.total || 0} opportunities from SAM.gov`, {
        id: loadingToastId,
        duration: 3000,
      });

    } catch (err: any) {
      console.error('Error searching SAM.gov:', err);
      if (err.message?.includes('API key')) {
        toast.error(
          'SAM.gov API key not configured. Please add a valid API key to enable live search.',
          {
            id: 'sam-api-key-error',
            duration: 5000,
            action: {
              label: 'Setup Guide',
              onClick: () => window.open('https://api.sam.gov/prod/opp/v1/api-key/', '_blank'),
            },
          }
        );
      } else {
        toast.error(err.message || 'Failed to search SAM.gov. Please try again.', {
          id: 'sam-search-error'
        });
      }
    } finally {
      setSearching(false);
      setSearchRequestId(null);
    }
  };

  const handleSearch = () => {
    if (searchTerm.length < 4 && searchTerm.length > 0) {
      toast.error('Please enter at least 4 characters to search', {
        id: 'search-validation-error'
      });
      return;
    }

    if (searching) {
      // Prevent multiple simultaneous searches
      return;
    }

    const requestId = `search-${Date.now()}-${Math.random()}`;
    setActiveSearch(searchTerm);
    setPage(1);

    // Update filters and search
    setFilters(prevFilters => ({ ...prevFilters, keyword: searchTerm }));
    searchFromSAM(requestId);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setActiveSearch('');
    setPage(1);
    setFilters(prevFilters => ({ ...prevFilters, keyword: '' }));
    fetchOpportunities();
  };

  const handleRefresh = () => {
    fetchOpportunities();
  };

  const checkBriefStatus = async (opportunityId: string) => {
    try {
      const exists = await briefService.briefExists(opportunityId);
      if (exists) {
        const brief = await briefService.getBrief(opportunityId);
        setBriefs(prev => ({ ...prev, [opportunityId]: brief }));
      }
    } catch (error) {
      // Brief doesn't exist yet - that's okay, it might be generating
      console.log(`Brief for ${opportunityId} not ready yet`);
    }
  };

  const checkProposalStatus = async (opportunityId: string) => {
    try {
      const proposal = await proposalService.getPrimaryProposal(opportunityId);
      if (proposal) {
        setProposals(prev => ({ ...prev, [opportunityId]: proposal }));
      }
    } catch (error) {
      // Proposal doesn't exist yet - that's okay
      console.log(`Proposal for ${opportunityId} not ready yet`);
    }
  };

  const handleGetBrief = async (opp: Opportunity, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // If brief already exists, show it
    if (briefs[opp.id]) {
      setShowBrief(opp.id);
      return;
    }

    // Otherwise, try to fetch it or generate it
    setBriefsLoading(prev => new Set(prev).add(opp.id));
    
    try {
      // First try to get existing brief (this will auto-generate if not found)
      const brief = await briefService.getBrief(opp.id);
      setBriefs(prev => ({ ...prev, [opp.id]: brief }));
      setShowBrief(opp.id);
      toast.success('Brief loaded!', {
        id: `brief-${opp.id}`,
        duration: 2000,
        icon: '📄',
      });
    } catch (error: any) {
      console.error('Error getting brief:', error);
      // If getBrief fails, try to generate it explicitly
      try {
        const brief = await briefService.generateBrief(opp.id);
        setBriefs(prev => ({ ...prev, [opp.id]: brief }));
        setShowBrief(opp.id);
        toast.success('Brief generated!', {
          id: `brief-${opp.id}`,
          duration: 3000,
          icon: '✨',
        });
      } catch (genError: any) {
        console.error('Error generating brief:', genError);
        toast.error(genError.message || 'Failed to get or generate brief. Please check your OpenAI API key configuration.', {
          id: `brief-error-${opp.id}`,
          duration: 5000,
        });
      }
    } finally {
      setBriefsLoading(prev => {
        const next = new Set(prev);
        next.delete(opp.id);
        return next;
      });
    }
  };

  const handleAddToPipeline = async (opp: Opportunity, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const toastId = toast.loading('Adding to pipeline...', {
      id: `pipeline-${opp.id}`
    });
    
    try {
      setAddingToPipeline(prev => ({ ...prev, [opp.id]: true }));
      await dispatch(addToPipeline({
        opportunity_id: opp.id,
        title: opp.title,
        agency: opp.agency,
        description: opp.synopsis,
        contract_value: opp.value,
        due_date: opp.dueDate,
        pwin_score: opp.pwin_score,
      })).unwrap();
      
      toast.success('Successfully added to pipeline!', {
        id: toastId,
        icon: '✅',
        duration: 3000,
      });
      setPipelineItemIds(prev => new Set([...prev, opp.id]));
    } catch (error: any) {
      console.error('Error adding to pipeline:', error);
      toast.error(error.message || 'Failed to add to pipeline', {
        id: toastId,
        duration: 4000,
      });
    } finally {
      setAddingToPipeline(prev => ({ ...prev, [opp.id]: false }));
    }
  };

  const handleAddToCalendar = (opp: Opportunity, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!opp.dueDate) {
      toast.error('No due date available for this opportunity', {
        id: `calendar-error-${opp.id}`
      });
      return;
    }

    const calendarEvent = {
      title: `[Proposal Due] ${opp.title}`,
      description: opp.synopsis,
      location: opp.agency,
      startDate: new Date(opp.dueDate),
      endDate: new Date(opp.dueDate),
    };

    addToCalendar(calendarEvent);
    toast.success('Added to calendar!', {
      id: `calendar-${opp.id}`,
      icon: '📅',
      duration: 3000,
    });
  };

  const getSamGovUrl = (opp: Opportunity) => {
    // If samGovUrl exists and is valid, use it
    if (opp.samGovUrl && opp.samGovUrl.startsWith('http')) {
      return opp.samGovUrl;
    }
    // Otherwise construct a SAM.gov URL using the opportunity ID
    return `https://sam.gov/opp/${opp.id}/view`;
  };

  const formatCurrency = (value?: number) => {
    if (!value) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
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
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Opportunities</h1>
        <p className="text-gray-600 mt-1">
          Browse federal contracting opportunities from SAM.gov
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <p className="text-sm text-gray-600">Total Contracts</p>
          <p className="text-2xl font-bold mt-1">{total}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">Average Value</p>
          <p className="text-2xl font-bold mt-1">
            {formatCurrency(
              opportunities.reduce((acc, opp) => acc + (opp.value || 0), 0) /
                (opportunities.filter((opp) => opp.value).length || 1)
            )}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">Page</p>
          <p className="text-2xl font-bold mt-1">
            {page} of {totalPages || 1}
          </p>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search SAM.gov (min 4 characters)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !searching && handleSearch()}
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  title="Clear search"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 flex items-center gap-2 ${
                  viewMode === 'list' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
                title="List View"
              >
                <List className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 flex items-center gap-2 ${
                  viewMode === 'grid' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
                title="Grid View"
              >
                <Grid3x3 className="h-5 w-5" />
              </button>
            </div>
            <button
              onClick={handleSearch}
              disabled={searching || (searchTerm.length > 0 && searchTerm.length < 4)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {searching ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Searching...
                </>
              ) : (
                'Search SAM.gov'
              )}
            </button>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              disabled={loading}
            >
              <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </Card>

      {/* Opportunities List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-3 text-gray-600">Loading opportunities...</span>
        </div>
      ) : searching ? (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'}>
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="p-6">
              <div className="animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6 mb-4"></div>
                <div className="flex gap-4 mb-4">
                  <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                </div>
                <div className="h-8 bg-gray-200 rounded w-full"></div>
              </div>
            </Card>
          ))}
        </div>
      ) : opportunities.length === 0 ? (
        <Card className="p-12 text-center">
          {activeSearch ? (
            <>
              <h3 className="text-lg font-semibold text-gray-700">No Results Found</h3>
              <p className="text-sm text-gray-500 mt-2">
                Your search for "{activeSearch}" did not match any opportunities.
              </p>
              <button
                onClick={clearSearch}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Clear Search
              </button>
            </>
          ) : (
            <>
              <p className="text-gray-500">No opportunities found</p>
              <p className="text-sm text-gray-400 mt-2">
                There are currently no opportunities matching your criteria.
              </p>
            </>
          )}
        </Card>
      ) : (
        <>
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'}>
            {opportunities.map((opp) => {
              const calendarColor = getCalendarColor(opp.dueDate, opp.pwin_score);
              
              return (
                <Card key={opp.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <Link
                      to={`/opportunities/${opp.id}`}
                      className="text-lg font-semibold text-gray-900 hover:text-blue-600 cursor-pointer flex-1"
                    >
                      {opp.title}
                    </Link>
                    <a
                      href={getSamGovUrl(opp)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="ml-2 flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 whitespace-nowrap"
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span className="hidden md:inline">SAM.gov</span>
                    </a>
                  </div>

                  <p className="text-sm text-gray-600 mt-2 line-clamp-3">
                    {opp.synopsis}
                  </p>

                  <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Building2 className="h-4 w-4" />
                      <span>{opp.agency}</span>
                      {opp.office && <span className="text-gray-400">• {opp.office}</span>}
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      <span>{formatCurrency(opp.value)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-red-500" />
                      <span className="text-red-600">Due: {formatDate(opp.dueDate)}</span>
                    </div>
                    {opp.pwin_score && (
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <span className="text-green-600 font-medium">
                          PWin: {opp.pwin_score}%
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 mt-3">
                    {opp.naicsCode && (
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                        NAICS: {opp.naicsCode}
                      </span>
                    )}
                    {opp.setAside && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {opp.setAside}
                      </span>
                    )}
                    {opp.type && (
                      <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                        {opp.type}
                      </span>
                    )}
                  </div>

                  {/* Auto-Generated Status Indicators */}
                  {(briefs[opp.id] || proposals[opp.id]) && (
                    <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2 text-sm text-green-800">
                        <Sparkles className="h-4 w-4" />
                        <span className="font-semibold">Auto-Generated:</span>
                        {briefs[opp.id] && (
                          <span className="flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Brief Ready
                          </span>
                        )}
                        {proposals[opp.id] && (
                          <span className="flex items-center gap-1 ml-2">
                            <CheckCircle2 className="h-3 w-3" />
                            Proposal Ready
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Brief Popup */}
                  {showBrief === opp.id && briefs[opp.id] && (
                    <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-lg relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowBrief(null);
                        }}
                        className="absolute top-2 right-2 text-blue-600 hover:text-blue-800"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Shipley-Compliant Brief
                      </h4>
                      <div className="text-sm text-blue-800 space-y-1">
                        <p><strong>Fit Score:</strong> {briefs[opp.id].overview.fitScore}%</p>
                        <p><strong>PWin:</strong> {briefs[opp.id].bidDecisionMatrix.overallScore}%</p>
                        <p><strong>Gate:</strong> 
                          <span className={`ml-1 px-2 py-0.5 rounded text-xs font-semibold ${
                            briefs[opp.id].bidDecisionMatrix.gate === 'GREEN' ? 'bg-green-500 text-white' :
                            briefs[opp.id].bidDecisionMatrix.gate === 'YELLOW' ? 'bg-yellow-500 text-white' :
                            'bg-red-500 text-white'
                          }`}>
                            {briefs[opp.id].bidDecisionMatrix.gate}
                          </span>
                        </p>
                      </div>
                      <Link
                        to={`/opportunities/${opp.id}?showBrief=true`}
                        className="mt-2 inline-flex items-center gap-1 text-sm text-blue-700 hover:text-blue-900 font-medium"
                      >
                        View Full Brief <Eye className="h-3 w-3" />
                      </Link>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-gray-100">
                    <button
                      onClick={(e) => handleGetBrief(opp, e)}
                      disabled={briefsLoading.has(opp.id)}
                      className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded transition-colors ${
                        briefs[opp.id]
                          ? 'bg-green-600 text-white hover:bg-green-700'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {briefsLoading.has(opp.id) ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Loading...
                        </>
                      ) : briefs[opp.id] ? (
                        <>
                          <CheckCircle2 className="h-4 w-4" />
                          View Brief
                        </>
                      ) : (
                        <>
                          <FileText className="h-4 w-4" />
                          Get Brief
                        </>
                      )}
                    </button>

                    {proposals[opp.id] && (
                      <Link
                        to={`/proposals/${proposals[opp.id].id}`}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                      >
                        <FileText className="h-4 w-4" />
                        View Proposal
                      </Link>
                    )}
                    
                    {pipelineItemIds.has(opp.id) ? (
                      <button
                        disabled
                        className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-200 text-green-800 rounded cursor-not-allowed"
                      >
                        <Check className="h-4 w-4" />
                        Added
                      </button>
                    ) : (
                      <button
                        onClick={(e) => handleAddToPipeline(opp, e)}
                        disabled={addingToPipeline[opp.id] === true}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
                      >
                        {addingToPipeline[opp.id] === true ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="animate-pulse">Adding...</span>
                          </>
                        ) : (
                          <>
                            <Plus className="h-4 w-4 transition-transform group-hover:scale-110" />
                            Add to Pipeline
                          </>
                        )}
                      </button>
                    )}
                    
                    <button
                      onClick={(e) => handleAddToCalendar(opp, e)}
                      className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded transition-colors ${
                        calendarColor === 'red' 
                          ? 'bg-red-600 hover:bg-red-700 text-white' 
                          : calendarColor === 'orange'
                          ? 'bg-orange-600 hover:bg-orange-700 text-white'
                          : calendarColor === 'yellow'
                          ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                          : 'bg-gray-600 hover:bg-gray-700 text-white'
                      }`}
                    >
                      <CalendarPlus className="h-4 w-4" />
                      Add to Calendar
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of{' '}
              {total} results
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
        </>
      )}
    </div>
  );
}

