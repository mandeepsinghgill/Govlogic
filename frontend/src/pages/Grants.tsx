/**
 * Grants Management - Complete Grant Writing & Management System
 * SF-424 forms, NOFO parsing, grant tracking, reporting
 * GovSure - Enterprise Government Contracting & Grants Platform
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText, Upload, TrendingUp, DollarSign, Calendar,
  CheckCircle, Clock, AlertCircle, Download, Plus, Search,
  Filter, Award, Users, BarChart3
} from 'lucide-react';

interface Grant {
  id: number;
  title: string;
  agency: string;
  funding_opportunity_number: string;
  award_ceiling: number;
  deadline: string;
  status: 'Draft' | 'Submitted' | 'Under Review' | 'Awarded' | 'Closed';
  probability: number;
  last_updated: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const Grants: React.FC = () => {
  const [grants, setGrants] = useState<Grant[]>([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch grants from API
  useEffect(() => {
    fetchGrants();
  }, []);

  const fetchGrants = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get token from localStorage or sessionStorage
      const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
      
      if (!token) {
        setError('Please login to view grants');
        setGrants([]);
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/api/v1/grants/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        setError('Session expired. Please login again.');
        setGrants([]);
        setLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch grants');
      }

      const data = await response.json();
      
      // Transform API data to match our interface
      const transformedGrants = data.map((grant: any) => ({
        id: grant.id,
        title: grant.title,
        agency: grant.agency || 'Unknown Agency',
        funding_opportunity_number: grant.funding_opportunity_number,
        award_ceiling: grant.award_ceiling || 0,
        deadline: grant.deadline || grant.close_date,
        status: grant.status || 'Draft',
        probability: 75, // Default, can be calculated later
        last_updated: grant.updated_at || grant.created_at
      }));
      
      setGrants(transformedGrants);
    } catch (err) {
      console.error('Error fetching grants:', err);
      setError('Failed to load grants');
      setGrants([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredGrants = grants.filter(grant => {
    const matchesStatus = filterStatus === 'all' || grant.status === filterStatus;
    const matchesSearch = 
      grant.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      grant.agency.toLowerCase().includes(searchTerm.toLowerCase()) ||
      grant.funding_opportunity_number.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const stats = {
    total: grants.length,
    draft: grants.filter(g => g.status.toLowerCase() === 'draft').length,
    submitted: grants.filter(g => g.status.toLowerCase() === 'submitted').length,
    awarded: grants.filter(g => g.status.toLowerCase() === 'awarded').length,
    total_value: grants.reduce((sum, g) => sum + g.award_ceiling, 0)
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Draft': return 'bg-gray-100 text-gray-800';
      case 'Submitted': return 'bg-blue-100 text-blue-800';
      case 'Under Review': return 'bg-yellow-100 text-yellow-800';
      case 'Awarded': return 'bg-green-100 text-green-800';
      case 'Closed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Draft': return <FileText className="w-4 h-4" />;
      case 'Submitted': return <Upload className="w-4 h-4" />;
      case 'Under Review': return <Clock className="w-4 h-4" />;
      case 'Awarded': return <Award className="w-4 h-4" />;
      case 'Closed': return <AlertCircle className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Grant Management
          </h1>
          <p className="text-lg text-gray-600">
            Discover, write, submit, and manage federal grant applications
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-indigo-500">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Total Grants</span>
              <FileText className="w-5 h-5 text-indigo-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-gray-500">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Draft</span>
              <FileText className="w-5 h-5 text-gray-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.draft}</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Submitted</span>
              <Upload className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.submitted}</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Awarded</span>
              <Award className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.awarded}</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Total Value</span>
              <DollarSign className="w-5 h-5 text-yellow-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              ${(stats.total_value / 1000000).toFixed(1)}M
            </p>
          </div>
        </div>

        {/* Actions & Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex gap-4 w-full md:w-auto">
              <Link
                to="/grants/new"
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg font-semibold hover:from-green-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl"
              >
                <Plus className="w-5 h-5" />
                New Grant Application
              </Link>

              <Link
                to="/grants/discover"
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
              >
                <Search className="w-5 h-5" />
                Discover Opportunities
              </Link>
            </div>

            <div className="flex gap-4 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search grants..."
                  className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Status</option>
                <option value="Draft">Draft</option>
                <option value="Submitted">Submitted</option>
                <option value="Under Review">Under Review</option>
                <option value="Awarded">Awarded</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Grants List */}
        <div className="space-y-4">
          {loading ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading grants...</p>
            </div>
          ) : filteredGrants.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <FileText className="w-20 h-20 text-gray-300 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No Grants Found</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || filterStatus !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Start by creating your first grant application'}
              </p>
              <Link
                to="/grants/new"
                className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                New Grant Application
              </Link>
            </div>
          ) : (
            filteredGrants.map((grant) => (
              <div
                key={grant.id}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-2xl font-bold text-gray-900">
                        {grant.title}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 ${getStatusColor(grant.status)}`}>
                        {getStatusIcon(grant.status)}
                        {grant.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span className="font-semibold">{grant.agency}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        <span className="font-mono">{grant.funding_opportunity_number}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        <span className="font-semibold">
                          Award Ceiling: ${(grant.award_ceiling / 1000000).toFixed(1)}M
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>Deadline: {new Date(grant.deadline).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="mb-2">
                      <p className="text-sm text-gray-600">Success Probability</p>
                      <p className="text-3xl font-bold text-indigo-600">{grant.probability}%</p>
                    </div>
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-indigo-600 h-2 rounded-full"
                        style={{ width: `${grant.probability}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <Link
                    to={`/grants/${grant.id}`}
                    className="flex-1 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors text-center"
                  >
                    Open Grant
                  </Link>
                  <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors">
                    <Download className="w-5 h-5" />
                  </button>
                  <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors">
                    <BarChart3 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-gradient-to-r from-green-600 to-blue-600 rounded-xl shadow-lg p-8 text-white">
          <h2 className="text-2xl font-bold mb-4">Grant Writing Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/grants/sf-424"
              className="bg-white/10 backdrop-blur rounded-lg p-4 hover:bg-white/20 transition-colors"
            >
              <FileText className="w-8 h-8 mb-2" />
              <h3 className="font-semibold mb-1">SF-424 Forms</h3>
              <p className="text-sm text-white/80">Auto-fill standard federal forms</p>
            </Link>

            <Link
              to="/grants/nofo-parser"
              className="bg-white/10 backdrop-blur rounded-lg p-4 hover:bg-white/20 transition-colors"
            >
              <Upload className="w-8 h-8 mb-2" />
              <h3 className="font-semibold mb-1">NOFO Parser</h3>
              <p className="text-sm text-white/80">Extract requirements from NOFOs</p>
            </Link>

            <Link
              to="/grants/budget-tool"
              className="bg-white/10 backdrop-blur rounded-lg p-4 hover:bg-white/20 transition-colors"
            >
              <DollarSign className="w-8 h-8 mb-2" />
              <h3 className="font-semibold mb-1">Budget Builder</h3>
              <p className="text-sm text-white/80">Create compliant grant budgets</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Grants;

