/**
 * Compliance Matrix - Interactive View & Edit
 * Map RFP requirements to proposal sections
 * Track compliance status for all requirements
 * GovLogicAI - Enterprise Government Contracting & Grants Platform
 */

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  CheckCircle, AlertCircle, Clock, FileText, Download, 
  Edit2, Save, X, Filter, Search, TrendingUp 
} from 'lucide-react';

interface MatrixItem {
  id: number;
  rfp_clause_id: string;
  category: string;
  requirement_text: string;
  proposal_location: string;
  compliance_status: 'Full' | 'Partial' | 'Gap' | 'Pending';
  company_capability: string;
  evidence: any[];
  gaps: any[];
}

interface ComplianceStats {
  total: number;
  full: number;
  partial: number;
  gap: number;
  pending: number;
  percentage: number;
}

const ComplianceMatrix: React.FC = () => {
  const { opportunityId } = useParams<{ opportunityId: string }>();
  const [matrixItems, setMatrixItems] = useState<MatrixItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MatrixItem[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<MatrixItem>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState<ComplianceStats>({
    total: 0,
    full: 0,
    partial: 0,
    gap: 0,
    pending: 0,
    percentage: 0
  });

  useEffect(() => {
    loadMatrix();
  }, [opportunityId]);

  useEffect(() => {
    applyFilters();
  }, [matrixItems, filterCategory, filterStatus, searchTerm]);

  const loadMatrix = async () => {
    try {
      const response = await fetch(`/api/v1/inztan/compliance-matrix/${opportunityId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to load compliance matrix');

      const data = await response.json();
      setMatrixItems(data.matrix_items || []);
      calculateStats(data.matrix_items || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (items: MatrixItem[]) => {
    const total = items.length;
    const full = items.filter(i => i.compliance_status === 'Full').length;
    const partial = items.filter(i => i.compliance_status === 'Partial').length;
    const gap = items.filter(i => i.compliance_status === 'Gap').length;
    const pending = items.filter(i => i.compliance_status === 'Pending').length;
    const percentage = total > 0 ? Math.round((full / total) * 100) : 0;

    setStats({ total, full, partial, gap, pending, percentage });
  };

  const applyFilters = () => {
    let filtered = [...matrixItems];

    if (filterCategory !== 'all') {
      filtered = filtered.filter(item => item.category === filterCategory);
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(item => item.compliance_status === filterStatus);
    }

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.requirement_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.rfp_clause_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.proposal_location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredItems(filtered);
  };

  const startEdit = (item: MatrixItem) => {
    setEditingId(item.id);
    setEditData({
      proposal_location: item.proposal_location,
      compliance_status: item.compliance_status,
      company_capability: item.company_capability
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const saveEdit = async (itemId: number) => {
    try {
      const response = await fetch(`/api/v1/inztan/compliance-matrix/${itemId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editData)
      });

      if (!response.ok) throw new Error('Failed to update item');

      // Update local state
      setMatrixItems(items =>
        items.map(item =>
          item.id === itemId ? { ...item, ...editData } : item
        )
      );

      cancelEdit();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const downloadMatrix = () => {
    const csv = convertToCSV(matrixItems);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `compliance_matrix_${opportunityId}.csv`;
    a.click();
  };

  const convertToCSV = (data: MatrixItem[]) => {
    const headers = ['ID', 'Category', 'Requirement', 'Proposal Location', 'Status', 'Capability', 'Gaps'];
    const rows = data.map(item => [
      item.rfp_clause_id,
      item.category,
      `"${item.requirement_text.replace(/"/g, '""')}"`,
      `"${item.proposal_location.replace(/"/g, '""')}"`,
      item.compliance_status,
      `"${item.company_capability.replace(/"/g, '""')}"`,
      item.gaps?.length > 0 ? `"${JSON.stringify(item.gaps)}"` : ''
    ]);

    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Full': return 'bg-green-100 text-green-800 border-green-300';
      case 'Partial': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Gap': return 'bg-red-100 text-red-800 border-red-300';
      case 'Pending': return 'bg-gray-100 text-gray-800 border-gray-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Full': return <CheckCircle className="w-4 h-4" />;
      case 'Partial': return <AlertCircle className="w-4 h-4" />;
      case 'Gap': return <X className="w-4 h-4" />;
      case 'Pending': return <Clock className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading compliance matrix...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">Error</h2>
          <p className="text-gray-600 text-center mb-6">{error}</p>
          <Link
            to={`/rfp-shredder`}
            className="block w-full py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors text-center"
          >
            Go to RFP Shredder
          </Link>
        </div>
      </div>
    );
  }

  const categories = ['all', ...Array.from(new Set(matrixItems.map(item => item.category)))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Compliance Matrix
              </h1>
              <p className="text-lg text-gray-600">
                Opportunity ID: {opportunityId}
              </p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={downloadMatrix}
                className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Download className="w-5 h-5" />
                Download CSV
              </button>
              <Link
                to={`/proposal-generator/${opportunityId}`}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-2"
              >
                <FileText className="w-5 h-5" />
                Generate Proposal
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Total</span>
              <FileText className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-green-50 rounded-lg shadow p-6 border-2 border-green-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-green-700">Full</span>
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-green-900">{stats.full}</p>
          </div>
          <div className="bg-yellow-50 rounded-lg shadow p-6 border-2 border-yellow-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-yellow-700">Partial</span>
              <AlertCircle className="w-5 h-5 text-yellow-600" />
            </div>
            <p className="text-3xl font-bold text-yellow-900">{stats.partial}</p>
          </div>
          <div className="bg-red-50 rounded-lg shadow p-6 border-2 border-red-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-red-700">Gaps</span>
              <X className="w-5 h-5 text-red-600" />
            </div>
            <p className="text-3xl font-bold text-red-900">{stats.gap}</p>
          </div>
          <div className="bg-gray-50 rounded-lg shadow p-6 border-2 border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-700">Pending</span>
              <Clock className="w-5 h-5 text-gray-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.pending}</p>
          </div>
          <div className="bg-indigo-50 rounded-lg shadow p-6 border-2 border-indigo-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-indigo-700">Complete</span>
              <TrendingUp className="w-5 h-5 text-indigo-600" />
            </div>
            <p className="text-3xl font-bold text-indigo-900">{stats.percentage}%</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Filter className="w-4 h-4 inline mr-1" />
                Category
              </label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? 'All Categories' : cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Filter className="w-4 h-4 inline mr-1" />
                Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Statuses</option>
                <option value="Full">Full Compliance</option>
                <option value="Partial">Partial Compliance</option>
                <option value="Gap">Gaps</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Search className="w-4 h-4 inline mr-1" />
                Search
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search requirements..."
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <p className="mt-4 text-sm text-gray-600">
            Showing {filteredItems.length} of {stats.total} items
          </p>
        </div>

        {/* Matrix Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Clause ID</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Category</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold w-1/3">Requirement</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Proposal Location</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-mono text-gray-900">
                      {item.rfp_clause_id}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <p className="line-clamp-3">
                        {item.requirement_text}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {editingId === item.id ? (
                        <input
                          type="text"
                          value={editData.proposal_location || ''}
                          onChange={(e) => setEditData({ ...editData, proposal_location: e.target.value })}
                          className="w-full px-3 py-2 border-2 border-indigo-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="e.g., Volume I, Section 2, Pages 10-15"
                        />
                      ) : (
                        <span className="text-gray-900">
                          {item.proposal_location || <span className="text-gray-400 italic">Not assigned</span>}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {editingId === item.id ? (
                        <select
                          value={editData.compliance_status || item.compliance_status}
                          onChange={(e) => setEditData({ ...editData, compliance_status: e.target.value as any })}
                          className="px-3 py-2 border-2 border-indigo-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="Full">Full</option>
                          <option value="Partial">Partial</option>
                          <option value="Gap">Gap</option>
                          <option value="Pending">Pending</option>
                        </select>
                      ) : (
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border-2 flex items-center gap-1 w-fit ${getStatusColor(item.compliance_status)}`}>
                          {getStatusIcon(item.compliance_status)}
                          {item.compliance_status}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {editingId === item.id ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => saveEdit(item.id)}
                            className="p-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                            title="Save"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="p-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                            title="Cancel"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEdit(item)}
                          className="p-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplianceMatrix;

