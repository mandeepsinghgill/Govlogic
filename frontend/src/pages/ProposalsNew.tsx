/**
 * Proposals Management - Complete AI-Powered Proposal System
 * Shipley Standards, Red Team Reviews, Compliance Matrix, 508 Compliance
 * GovSure - Enterprise Government Contracting Platform
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { 
  FileText, Plus, Search, Loader2, Eye, Edit, 
  Calendar, CheckCircle, TrendingUp, Upload, Target,
  BookOpen, Award, Shield, Sparkles, Download, BarChart3,
  AlertCircle, Clock, FileCheck, Zap, Users, Brain
} from 'lucide-react';

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

interface ProposalStats {
  total: number;
  draft: number;
  in_progress: number;
  review: number;
  submitted: number;
  avg_compliance: number;
  avg_red_team: number;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function ProposalsNew() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [stats, setStats] = useState<ProposalStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const limit = 10;

  useEffect(() => {
    fetchProposals();
    fetchStats();
  }, [page, statusFilter]);

  const fetchStats = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/v1/proposals/stats`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const fetchProposals = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(statusFilter && { status: statusFilter }),
      });

      const response = await fetch(
        `${API_URL}/api/v1/proposals/mine?${params}`,
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <FileText className="w-4 h-4" />;
      case 'in_progress': return <Edit className="w-4 h-4" />;
      case 'pink_team': case 'red_team': case 'gold_team': return <Users className="w-4 h-4" />;
      case 'final': return <CheckCircle className="w-4 h-4" />;
      case 'submitted': return <Award className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
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

  const filteredProposals = proposals.filter(proposal =>
    proposal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (proposal.solicitation_number?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
  );

  const totalPages = Math.ceil(total / limit);

  // Calculate stats from proposals if not available from API
  const displayStats = stats || {
    total: proposals.length,
    draft: proposals.filter(p => p.status === 'draft').length,
    in_progress: proposals.filter(p => p.status === 'in_progress').length,
    review: proposals.filter(p => ['pink_team', 'red_team', 'gold_team'].includes(p.status)).length,
    submitted: proposals.filter(p => p.status === 'submitted').length,
    avg_compliance: proposals.reduce((acc, p) => acc + (p.compliance_score || 0), 0) / proposals.length || 0,
    avg_red_team: proposals.reduce((acc, p) => acc + (p.red_team_score || 0), 0) / proposals.length || 0,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            AI-Powered Proposal Management
          </h1>
          <p className="text-lg text-gray-600">
            Create winning proposals with Shipley standards, compliance matrices, and AI-powered content generation
          </p>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Total Proposals</span>
              <FileText className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{displayStats.total}</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-gray-500">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Draft</span>
              <FileText className="w-5 h-5 text-gray-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{displayStats.draft}</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">In Progress</span>
              <Edit className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{displayStats.in_progress}</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Under Review</span>
              <Users className="w-5 h-5 text-orange-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{displayStats.review}</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Submitted</span>
              <Award className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{displayStats.submitted}</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-indigo-500">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Avg Score</span>
              <TrendingUp className="w-5 h-5 text-indigo-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {displayStats.avg_compliance > 0 ? Math.round(displayStats.avg_compliance) : '-'}%
            </p>
          </div>
        </div>

        {/* Actions & Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex gap-4 w-full md:w-auto">
              <Link
                to="/proposals/new"
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
              >
                <Plus className="w-5 h-5" />
                New Proposal
              </Link>

              <button
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                <Upload className="w-5 h-5" />
                Upload RFP
              </button>
            </div>

            <div className="flex gap-4 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search proposals..."
                  className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">All Status</option>
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
        </div>

        {/* Proposals List */}
        <div className="space-y-4 mb-8">
          {loading ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading proposals...</p>
            </div>
          ) : filteredProposals.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <FileText className="w-20 h-20 text-gray-300 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No Proposals Yet</h3>
              <p className="text-gray-600 mb-6">
                Start creating winning proposals with AI-powered tools
              </p>
              <Link
                to="/proposals/new"
                className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Create Your First Proposal
              </Link>
            </div>
          ) : (
            <>
              {filteredProposals.map((proposal) => (
                <div
                  key={proposal.id}
                  className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-2xl font-bold text-gray-900">
                          {proposal.title}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 ${getStatusColor(proposal.status)}`}>
                          {getStatusIcon(proposal.status)}
                          {proposal.status.replace('_', ' ').toUpperCase()}
                        </span>
                        {proposal.mockGenerated && (
                          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                            Sample Data
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                        {proposal.solicitation_number && (
                          <div className="flex items-center gap-1">
                            <FileText className="w-4 h-4" />
                            <span className="font-mono">{proposal.solicitation_number}</span>
                          </div>
                        )}
                        
                        {proposal.compliance_score !== undefined && (
                          <div className="flex items-center gap-1">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="font-semibold">
                              Compliance: {proposal.compliance_score}%
                            </span>
                          </div>
                        )}
                        
                        {proposal.red_team_score !== undefined && proposal.red_team_score > 0 && (
                          <div className="flex items-center gap-1">
                            <Shield className="w-4 h-4 text-red-600" />
                            <span className="font-semibold">
                              Red Team: {proposal.red_team_score}/100
                            </span>
                          </div>
                        )}
                        
                        {proposal.is_508_compliant && (
                          <span className="text-xs bg-green-100 text-green-800 px-3 py-1 rounded-full font-semibold">
                            ✓ 508 Compliant
                          </span>
                        )}
                        
                        <div className="flex items-center gap-1 text-gray-500">
                          <Calendar className="w-4 h-4" />
                          <span>Created: {formatDate(proposal.created_at)}</span>
                        </div>
                      </div>

                      {/* Progress Bar for Compliance Score */}
                      {proposal.compliance_score !== undefined && (
                        <div className="mt-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-600">Compliance Progress</span>
                            <span className="text-xs font-bold text-purple-600">{proposal.compliance_score}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-purple-600 to-indigo-600 h-2 rounded-full transition-all"
                              style={{ width: `${proposal.compliance_score}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 ml-4">
                      <Link
                        to={`/proposals/${proposal.id}`}
                        className="p-3 border border-gray-300 rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-colors"
                        title="View proposal"
                      >
                        <Eye className="h-5 w-5 text-purple-600" />
                      </Link>
                      <Link
                        to={`/proposals/${proposal.id}/edit`}
                        className="p-3 border border-gray-300 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
                        title="Edit proposal"
                      >
                        <Edit className="h-5 w-5 text-blue-600" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
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
                    <span className="px-4 py-2 border border-gray-300 rounded-lg bg-purple-50 text-purple-600 font-semibold">
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

        {/* Proposal Writing Tools */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl shadow-lg p-8 text-white mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-8 h-8" />
            <h2 className="text-2xl font-bold">AI-Powered Proposal Tools</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur rounded-lg p-5 hover:bg-white/20 transition-colors cursor-pointer">
              <Brain className="w-8 h-8 mb-3" />
              <h3 className="font-semibold mb-2">AI Content Generator</h3>
              <p className="text-sm text-white/80">Generate compelling proposal content using advanced AI</p>
            </div>

            <div className="bg-white/10 backdrop-blur rounded-lg p-5 hover:bg-white/20 transition-colors cursor-pointer">
              <FileCheck className="w-8 h-8 mb-3" />
              <h3 className="font-semibold mb-2">Compliance Matrix</h3>
              <p className="text-sm text-white/80">Automated compliance checking and requirement tracking</p>
            </div>

            <div className="bg-white/10 backdrop-blur rounded-lg p-5 hover:bg-white/20 transition-colors cursor-pointer">
              <Shield className="w-8 h-8 mb-3" />
              <h3 className="font-semibold mb-2">Red Team Review</h3>
              <p className="text-sm text-white/80">AI-powered critical review and scoring</p>
            </div>
          </div>
        </div>

        {/* Shipley Standards & Best Practices */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <BookOpen className="w-6 h-6 text-indigo-600" />
              <h3 className="text-xl font-bold text-gray-900">Shipley Standards</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-indigo-50 rounded-lg">
                <Target className="w-5 h-5 text-indigo-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-gray-900">Win Strategy</h4>
                  <p className="text-sm text-gray-600">Define clear win themes and discriminators</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-purple-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-gray-900">Compliance</h4>
                  <p className="text-sm text-gray-600">100% compliance with RFP requirements</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                <Award className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-gray-900">Value Proposition</h4>
                  <p className="text-sm text-gray-600">Clear benefits and competitive advantages</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Zap className="w-6 h-6 text-yellow-600" />
              <h3 className="text-xl font-bold text-gray-900">Quick Actions</h3>
            </div>
            <div className="space-y-3">
              <button className="w-full flex items-center gap-3 p-3 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors text-left">
                <Upload className="w-5 h-5 text-yellow-600" />
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">Upload RFP</h4>
                  <p className="text-sm text-gray-600">Extract requirements automatically</p>
                </div>
              </button>
              <button className="w-full flex items-center gap-3 p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors text-left">
                <BarChart3 className="w-5 h-5 text-green-600" />
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">Generate Outline</h4>
                  <p className="text-sm text-gray-600">AI-powered proposal structure</p>
                </div>
              </button>
              <button className="w-full flex items-center gap-3 p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors text-left">
                <Download className="w-5 h-5 text-red-600" />
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">Export to PDF</h4>
                  <p className="text-sm text-gray-600">508-compliant proposal documents</p>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-6 h-6 text-gray-600" />
            <h3 className="text-xl font-bold text-gray-900">Recent Activity</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FileText className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">New proposal created</p>
                <p className="text-sm text-gray-600">IT Infrastructure Modernization - 2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">Compliance check completed</p>
                <p className="text-sm text-gray-600">Cybersecurity Assessment - 94% compliant - 5 hours ago</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
              <div className="p-2 bg-red-100 rounded-lg">
                <Shield className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">Red team review completed</p>
                <p className="text-sm text-gray-600">Healthcare IT Proposal - Score: 87/100 - Yesterday</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">Deadline reminder</p>
                <p className="text-sm text-gray-600">DOD Cloud Services - Due in 5 days</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
