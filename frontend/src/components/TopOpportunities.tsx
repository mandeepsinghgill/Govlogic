import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { TrendingUp, Building2, DollarSign, Calendar, ExternalLink, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Opportunity {
  id: string;
  title: string;
  synopsis: string;
  agency: string;
  value?: number;
  dueDate?: string;
  postedDate?: string;
  pwin_score?: number;
  naicsCode?: string;
  setAside?: string;
  samGovUrl?: string;
  mockGenerated?: boolean;
}

export default function TopOpportunities() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTopOpportunities();
  }, []);

  const fetchTopOpportunities = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/api/v1/opportunities/top?limit=5', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch opportunities');
      }

      const data = await response.json();
      setOpportunities(data.items || []);
    } catch (err) {
      console.error('Error fetching opportunities:', err);
      setError('Failed to load opportunities');
      // Set empty array so we show "no opportunities"
      setOpportunities([]);
    } finally {
      setLoading(false);
    }
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
        year: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Top Opportunities</h2>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-3 text-gray-600">Loading opportunities from SAM.gov...</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Top Opportunities</h2>
        <Link
          to="/opportunities"
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          View All →
        </Link>
      </div>

      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-yellow-800">
            {error}. Using mock data for demonstration.
          </p>
        </div>
      )}

      {opportunities.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>No opportunities available</p>
          <p className="text-sm mt-2">Check back later or configure your SAM_GOV_API_KEY</p>
        </div>
      ) : (
        <div className="space-y-4">
          {opportunities.map((opp) => (
            <div
              key={opp.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">
                      {opp.title}
                    </h3>
                    {opp.mockGenerated && (
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                        Mock
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {opp.synopsis}
                  </p>

                  <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Building2 className="h-4 w-4" />
                      <span>{opp.agency || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      <span>{formatCurrency(opp.value)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>Due: {formatDate(opp.dueDate)}</span>
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

                  {opp.setAside && (
                    <div className="mt-2">
                      <span className="inline-block text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {opp.setAside}
                      </span>
                    </div>
                  )}
                </div>

                {opp.samGovUrl && (
                  <a
                    href={opp.samGovUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-4 flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                  >
                    <ExternalLink className="h-4 w-4" />
                    SAM.gov
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

