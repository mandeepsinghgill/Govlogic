/**
 * Grants Discovery Page - Search federal grant opportunities from SAM.gov
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search, DollarSign, Calendar, Building2, FileText,
  Plus, TrendingUp, Filter, Download, ArrowLeft, ExternalLink, Check
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface GrantOpportunity {
  id: string;
  title: string;
  agency: string;
  funding_opportunity_number: string;
  award_ceiling?: number;
  award_floor?: number;
  deadline?: string;
  posted_date?: string;
  description?: string;
  synopsis?: string;
  url?: string;
  source?: string;
  category?: string;
  cfda_numbers?: string[];
  estimated_funding?: number;
}

export default function GrantsDiscover() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [agency, setAgency] = useState('');
  const [opportunities, setOpportunities] = useState<GrantOpportunity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [addedOpportunities, setAddedOpportunities] = useState<Set<string>>(new Set());

  const searchGrants = async () => {
    try {
      setLoading(true);
      setError(null);
      setHasSearched(true);

      const params = new URLSearchParams();
      if (keyword) params.append('keyword', keyword);
      if (agency) params.append('agency', agency);
      params.append('limit', '20');

      // Discovery search is public - no auth required
      const response = await fetch(`${API_URL}/api/v1/grants/discover?${params}`);

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.detail || 'Failed to search grants');
      }

      const data = await response.json();
      setOpportunities(data.items || []);
    } catch (err: any) {
      console.error('Error searching grants:', err);
      setError(err.message || 'Failed to search grants. Please try again.');
      setOpportunities([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchGrants();
  };

  const addToMyGrants = async (opportunity: GrantOpportunity) => {
    try {
      // Get token from localStorage or sessionStorage
      const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
      
      if (!token) {
        alert('Please login to add grants');
        navigate('/login');
        return;
      }

      const response = await fetch(`${API_URL}/api/v1/grants/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: opportunity.title,
          funding_opportunity_number: opportunity.funding_opportunity_number,
          agency: opportunity.agency || 'Unknown Agency',
          award_ceiling: opportunity.award_ceiling,
          award_floor: opportunity.award_floor,
          deadline: opportunity.deadline,
          posted_date: opportunity.posted_date,
          description: opportunity.synopsis || opportunity.description || '',
          url: opportunity.url,
          category: opportunity.category,
          cfda_numbers: opportunity.cfda_numbers,
          estimated_funding: opportunity.estimated_funding || opportunity.award_ceiling
        }),
      });

      if (response.status === 401) {
        alert('Session expired. Please login again.');
        navigate('/login');
        return;
      }

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.detail || 'Failed to add grant');
      }

      // Mark this opportunity as added
      setAddedOpportunities(prev => new Set(prev).add(opportunity.id));
      
      alert('Grant added to your applications!');
    } catch (err: any) {
      console.error('Error adding grant:', err);
      alert(err.message || 'Failed to add grant. Please try again.');
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/grants"
            className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to My Grants
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Discover Grant Opportunities
          </h1>
          <p className="text-lg text-gray-600">
            Search federal grant opportunities from SAM.gov and Grants.gov
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Keyword Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="e.g., healthcare, energy, education"
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Agency
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={agency}
                    onChange={(e) => setAgency(e.target.value)}
                    placeholder="e.g., NIH, DOE, NSF"
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg font-semibold hover:from-green-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Searching...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Search className="w-5 h-5" />
                  Search Grant Opportunities
                </span>
              )}
            </button>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6">
            <p className="text-red-800 font-semibold">{error}</p>
          </div>
        )}

        {/* Results */}
        {hasSearched && !loading && (
          <div className="mb-4 flex items-center justify-between">
            <p className="text-lg text-gray-700">
              Found <span className="font-bold text-indigo-600">{opportunities.length}</span> grant opportunities
            </p>
          </div>
        )}

        {/* Opportunities List */}
        <div className="space-y-4">
          {loading ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Searching grant opportunities...</p>
            </div>
          ) : opportunities.length === 0 && hasSearched ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <FileText className="w-20 h-20 text-gray-300 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No Grants Found</h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your search criteria or keywords
              </p>
            </div>
          ) : !hasSearched ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <Search className="w-20 h-20 text-gray-300 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Start Your Search</h3>
              <p className="text-gray-600">
                Enter keywords or agency name to discover federal grant opportunities
              </p>
            </div>
          ) : (
            opportunities.map((opp) => (
              <div
                key={opp.id}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {opp.title}
                    </h3>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <Building2 className="w-4 h-4" />
                        <span className="font-semibold">{opp.agency}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        <span className="font-mono">{opp.funding_opportunity_number}</span>
                      </div>
                      {opp.award_ceiling && (
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          <span className="font-semibold">
                            Up to {formatCurrency(opp.award_ceiling)}
                          </span>
                        </div>
                      )}
                      {opp.deadline && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>Deadline: {formatDate(opp.deadline)}</span>
                        </div>
                      )}
                    </div>

                    {/* Description/Synopsis */}
                    {(opp.synopsis || opp.description) && (
                      <div className="mt-3 text-gray-700">
                        <p className="line-clamp-2">
                          {opp.synopsis || opp.description || 'No description available'}
                        </p>
                      </div>
                    )}
                    
                    {/* Posted Date */}
                    {opp.posted_date && (
                      <div className="mt-2 text-sm text-gray-500">
                        Posted: {formatDate(opp.posted_date)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4 border-t border-gray-200">
                  {addedOpportunities.has(opp.id) ? (
                    <button
                      disabled
                      className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium cursor-not-allowed flex items-center gap-1.5"
                    >
                      <Check className="w-4 h-4" />
                      Added
                    </button>
                  ) : (
                    <button
                      onClick={() => addToMyGrants(opp)}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      Add to My Grants
                    </button>
                  )}
                  {opp.url && (
                    <a
                      href={opp.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-1.5"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View Details
                    </a>
                  )}
                </div>

                {/* Source Badge */}
                {opp.source && (
                  <div className="mt-2">
                    <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                      Source: {opp.source}
                    </span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Quick Filters (Coming Soon) */}
        {hasSearched && opportunities.length > 0 && (
          <div className="mt-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg p-6 text-white">
            <h3 className="text-xl font-bold mb-2">💡 Pro Tip</h3>
            <p className="text-white/90">
              Refine your search with specific keywords, agency names, or CFDA numbers to find the most relevant grant opportunities for your organization.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

