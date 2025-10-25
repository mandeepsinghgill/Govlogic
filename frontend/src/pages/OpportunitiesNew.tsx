import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { 
  Search, Filter, Building2, DollarSign, Calendar, 
  ExternalLink, TrendingUp, Loader2, RefreshCw 
} from 'lucide-react';

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
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    naicsCode: '',
    keyword: '',
  });

  const limit = 20;

  useEffect(() => {
    fetchOpportunities();
  }, [page, filters]);

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(filters.naicsCode && { naics_code: filters.naicsCode }),
        ...(filters.keyword && { keyword: filters.keyword }),
      });

      const response = await fetch(
        `http://localhost:8000/api/v1/opportunities/search?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch opportunities');
      }

      const data = await response.json();
      setOpportunities(data.items || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('Error fetching opportunities:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setFilters({ ...filters, keyword: searchTerm });
    setPage(1);
  };

  const handleRefresh = () => {
    fetchOpportunities();
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
                placeholder="Search opportunities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Search
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
      ) : opportunities.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-gray-500">No opportunities found</p>
          <p className="text-sm text-gray-400 mt-2">
            Try adjusting your search or filters
          </p>
        </Card>
      ) : (
        <>
          <div className="space-y-4">
            {opportunities.map((opp) => (
              <Card key={opp.id} className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = `/opportunities/${opp.id}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600">
                      {opp.title}
                    </h3>
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
                        <Calendar className="h-4 w-4" />
                        <span>Posted: {formatDate(opp.postedDate)}</span>
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
                  </div>

                  {opp.samGovUrl && (
                    <a
                      href={opp.samGovUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-4 flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                    >
                      <ExternalLink className="h-4 w-4" />
                      View on SAM.gov
                    </a>
                  )}
                </div>
              </Card>
            ))}
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

