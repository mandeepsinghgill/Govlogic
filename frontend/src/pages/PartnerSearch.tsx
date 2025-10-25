/**
 * Partner Search - Search 800K+ SAM.gov Contractors
 * Find teaming partners, search by NAICS, set-aside, capabilities
 * AI-powered recommendations
 * GovLogicAI - Enterprise Government Contracting & Grants Platform
 */

import React, { useState } from 'react';
import { Search, Users, Building2, MapPin, Award, TrendingUp, Star, CheckCircle } from 'lucide-react';

interface Contractor {
  id: number;
  uei: string;
  legal_name: string;
  dba: string;
  naics: string[];
  set_aside: string[];
  capabilities: string;
  location: any;
  contact: any;
  past_awards: any;
  relevance_score: number;
}

interface SearchFilters {
  naics_codes: string[];
  set_aside: string[];
  state: string;
  capabilities: string;
  page: number;
  page_size: number;
}

const PartnerSearch: React.FC = () => {
  const [filters, setFilters] = useState<SearchFilters>({
    naics_codes: [],
    set_aside: [],
    state: '',
    capabilities: '',
    page: 1,
    page_size: 20
  });
  
  const [naicsInput, setNaicsInput] = useState('');
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedContractor, setSelectedContractor] = useState<Contractor | null>(null);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/v1/inztan/partners/search', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(filters)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Search failed');
      }

      const data = await response.json();
      setContractors(data.contractors || []);
      setTotalResults(data.pagination?.total || 0);
    } catch (err) {
      console.error('Search error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Search failed. Please try again.';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const addNaicsCode = () => {
    if (naicsInput && !filters.naics_codes.includes(naicsInput)) {
      setFilters({ ...filters, naics_codes: [...filters.naics_codes, naicsInput] });
      setNaicsInput('');
    }
  };

  const removeNaicsCode = (code: string) => {
    setFilters({
      ...filters,
      naics_codes: filters.naics_codes.filter(c => c !== code)
    });
  };

  const toggleSetAside = (setAside: string) => {
    setFilters({
      ...filters,
      set_aside: filters.set_aside.includes(setAside)
        ? filters.set_aside.filter(s => s !== setAside)
        : [...filters.set_aside, setAside]
    });
  };

  const setAsideOptions = [
    'Small Business',
    '8(a)',
    'HUBZone',
    'SDVOSB',
    'WOSB',
    'VOSB'
  ];

  const states = ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'DC'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Partner Search
          </h1>
          <p className="text-lg text-gray-600">
            Search 800K+ SAM.gov registered contractors • Find perfect teaming partners
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Search Filters */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Search className="w-5 h-5 text-indigo-600" />
                Search Filters
              </h2>

              {/* NAICS Codes */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  NAICS Codes
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={naicsInput}
                    onChange={(e) => setNaicsInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addNaicsCode()}
                    placeholder="Enter NAICS code..."
                    className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    onClick={addNaicsCode}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {filters.naics_codes.map(code => (
                    <span
                      key={code}
                      className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm flex items-center gap-2"
                    >
                      {code}
                      <button
                        onClick={() => removeNaicsCode(code)}
                        className="hover:text-indigo-900"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Set-Aside Status */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Set-Aside Status
                </label>
                <div className="space-y-2">
                  {setAsideOptions.map(option => (
                    <label key={option} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.set_aside.includes(option)}
                        onChange={() => toggleSetAside(option)}
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      />
                      <span className="text-sm text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* State */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  State
                </label>
                <select
                  value={filters.state}
                  onChange={(e) => setFilters({ ...filters, state: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">All States</option>
                  {states.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>

              {/* Capabilities */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Capabilities
                </label>
                <input
                  type="text"
                  value={filters.capabilities}
                  onChange={(e) => setFilters({ ...filters, capabilities: e.target.value })}
                  placeholder="e.g., cybersecurity, cloud..."
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Search Button */}
              <button
                onClick={handleSearch}
                disabled={loading}
                className={`w-full py-3 rounded-lg font-bold text-white transition-all flex items-center justify-center gap-2 ${
                  loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 shadow-lg hover:shadow-xl'
                }`}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    Search Contractors
                  </>
                )}
              </button>

              {/* Results Count */}
              {totalResults > 0 && (
                <p className="mt-4 text-sm text-gray-600 text-center">
                  Found {totalResults.toLocaleString()} contractors
                </p>
              )}
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-2">
            {contractors.length === 0 && !loading && (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <Users className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Search 800K+ Contractors
                </h3>
                <p className="text-gray-600 mb-6">
                  Enter search filters and click "Search Contractors" to find teaming partners
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left max-w-2xl mx-auto">
                  <div className="flex gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-gray-900">NAICS Code Search</p>
                      <p className="text-sm text-gray-600">Filter by specific industry codes</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-gray-900">Set-Aside Filtering</p>
                      <p className="text-sm text-gray-600">Find Small Business, 8(a), SDVOSB, etc.</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-gray-900">Location Search</p>
                      <p className="text-sm text-gray-600">Filter by state or region</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-gray-900">Capability Match</p>
                      <p className="text-sm text-gray-600">Search by technical capabilities</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {loading && (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
                <p className="text-gray-600 text-lg">Searching contractors...</p>
              </div>
            )}

            {contractors.length > 0 && (
              <div className="space-y-4">
                {contractors.map((contractor) => (
                  <div
                    key={contractor.id}
                    className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer"
                    onClick={() => setSelectedContractor(contractor)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-1">
                          {contractor.legal_name}
                        </h3>
                        {contractor.dba && contractor.dba !== contractor.legal_name && (
                          <p className="text-sm text-gray-600 mb-2">
                            DBA: {contractor.dba}
                          </p>
                        )}
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Building2 className="w-4 h-4" />
                          <span className="font-mono">{contractor.uei}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1 bg-indigo-100 rounded-full">
                        <Star className="w-4 h-4 text-indigo-600" />
                        <span className="text-sm font-semibold text-indigo-900">
                          {contractor.relevance_score}
                        </span>
                      </div>
                    </div>

                    {/* Set-Aside Badges */}
                    {contractor.set_aside && contractor.set_aside.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {contractor.set_aside.map((sa: string) => (
                          <span
                            key={sa}
                            className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-semibold"
                          >
                            {sa}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* NAICS Codes */}
                    {contractor.naics && contractor.naics.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {contractor.naics.slice(0, 5).map((naics: string) => (
                          <span
                            key={naics}
                            className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-mono"
                          >
                            {naics}
                          </span>
                        ))}
                        {contractor.naics.length > 5 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                            +{contractor.naics.length - 5} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Capabilities */}
                    {contractor.capabilities && (
                      <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                        {contractor.capabilities}
                      </p>
                    )}

                    {/* Location */}
                    {contractor.location && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>
                          {contractor.location.city}, {contractor.location.state} {contractor.location.zip}
                        </span>
                      </div>
                    )}

                    {/* Past Awards */}
                    {contractor.past_awards && contractor.past_awards.count > 0 && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                        <Award className="w-4 h-4 text-yellow-600" />
                        <span className="font-semibold">
                          {contractor.past_awards.count} past awards
                        </span>
                      </div>
                    )}

                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <button className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                        View Details →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Selected Contractor Modal (simplified) */}
        {selectedContractor && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedContractor(null)}
          >
            <div
              className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    {selectedContractor.legal_name}
                  </h2>
                  <p className="text-gray-600">UEI: {selectedContractor.uei}</p>
                </div>
                <button
                  onClick={() => setSelectedContractor(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              {/* Full contractor details would go here */}
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Set-Aside Status</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedContractor.set_aside?.map((sa: string) => (
                      <span key={sa} className="px-3 py-1 bg-green-100 text-green-800 rounded-lg font-semibold">
                        {sa}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">NAICS Codes</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedContractor.naics?.map((naics: string) => (
                      <span key={naics} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg font-mono">
                        {naics}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Capabilities</h3>
                  <p className="text-gray-700">{selectedContractor.capabilities}</p>
                </div>

                <div className="pt-6 border-t">
                  <button className="w-full py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors">
                    Invite to Team
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PartnerSearch;

