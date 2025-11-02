/**
 * Grant Detail Page - View and manage a specific grant application
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Building2, Calendar, DollarSign, FileText, 
  Download, Edit, Trash2, CheckCircle, Clock, AlertCircle,
  ExternalLink, Upload, Save, X
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface Grant {
  id: string;
  title: string;
  funding_opportunity_number: string;
  agency: string;
  status: string;
  award_ceiling?: number;
  award_floor?: number;
  total_funding?: number;
  deadline?: string;
  close_date?: string;
  open_date?: string;
  posted_date?: string;
  description?: string;
  nofo_text?: string;
  requirements?: {
    cfda_numbers?: string[];
    category?: string;
    sam_gov_url?: string;
  };
  created_at?: string;
  updated_at?: string;
}

export default function GrantDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [grant, setGrant] = useState<Grant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedNotes, setEditedNotes] = useState('');
  const [editedStatus, setEditedStatus] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchGrant();
  }, [id]);

  const fetchGrant = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
      
      if (!token) {
        setError('Please login to view grant details');
        navigate('/login');
        return;
      }

      const response = await fetch(`${API_URL}/api/v1/grants/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        setError('Session expired. Please login again.');
        setTimeout(() => navigate('/login'), 2000);
        return;
      }

      if (response.status === 404) {
        setError('Grant not found');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch grant details');
      }

      const data = await response.json();
      setGrant(data);
      setEditedTitle(data.title);
      setEditedStatus(data.status);
      setEditedNotes(data.nofo_text || '');
    } catch (err: any) {
      console.error('Error fetching grant:', err);
      setError(err.message || 'Failed to load grant details');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!grant) return;

    try {
      setSaving(true);
      const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');

      const response = await fetch(`${API_URL}/api/v1/grants/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: editedTitle,
          status: editedStatus,
          notes: editedNotes,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update grant');
      }

      const updatedGrant = await response.json();
      setGrant(updatedGrant);
      setIsEditing(false);
      alert('Grant updated successfully!');
    } catch (err: any) {
      console.error('Error updating grant:', err);
      alert(err.message || 'Failed to update grant');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!grant) return;
    
    if (!confirm(`Are you sure you want to delete "${grant.title}"?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');

      const response = await fetch(`${API_URL}/api/v1/grants/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete grant');
      }

      alert('Grant deleted successfully');
      navigate('/grants');
    } catch (err: any) {
      console.error('Error deleting grant:', err);
      alert(err.message || 'Failed to delete grant');
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
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'draft':
        return 'bg-gray-100 text-gray-700 border-gray-300';
      case 'in_progress':
      case 'in progress':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'submitted':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'awarded':
        return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'rejected':
        return 'bg-red-100 text-red-700 border-red-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'draft':
        return <FileText className="w-5 h-5" />;
      case 'in_progress':
      case 'in progress':
        return <Clock className="w-5 h-5" />;
      case 'submitted':
        return <CheckCircle className="w-5 h-5" />;
      case 'awarded':
        return <CheckCircle className="w-5 h-5" />;
      case 'rejected':
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading grant details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 p-6">
        <div className="max-w-6xl mx-auto">
          <Link
            to="/grants"
            className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Grants
          </Link>
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Error</h3>
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!grant) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            to="/grants"
            className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Grants
          </Link>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-8">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {isEditing ? (
                  <input
                    type="text"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    className="text-3xl font-bold bg-white/20 text-white placeholder-white/70 border-2 border-white/30 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-white"
                  />
                ) : (
                  <h1 className="text-4xl font-bold mb-2">{grant.title}</h1>
                )}
                
                <div className="flex flex-wrap gap-4 mt-4 text-white/90">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    <span>{grant.agency}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    <span className="font-mono">{grant.funding_opportunity_number}</span>
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div className="ml-4">
                {isEditing ? (
                  <select
                    value={editedStatus}
                    onChange={(e) => setEditedStatus(e.target.value)}
                    className="px-4 py-2 rounded-lg border-2 text-gray-900 font-semibold focus:outline-none focus:ring-2 focus:ring-white"
                  >
                    <option value="draft">Draft</option>
                    <option value="in_progress">In Progress</option>
                    <option value="submitted">Submitted</option>
                    <option value="awarded">Awarded</option>
                    <option value="rejected">Rejected</option>
                  </select>
                ) : (
                  <div className={`px-4 py-2 rounded-lg border-2 font-semibold flex items-center gap-2 ${getStatusColor(grant.status)} bg-opacity-90`}>
                    {getStatusIcon(grant.status)}
                    <span className="capitalize">{grant.status.replace('_', ' ')}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-8">
            {/* Key Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Award Ceiling */}
              {grant.award_ceiling && (
                <div className="bg-green-50 rounded-xl p-6 border-2 border-green-200">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-green-600 rounded-lg">
                      <DollarSign className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Award Ceiling</p>
                      <p className="text-2xl font-bold text-green-700">
                        {formatCurrency(grant.award_ceiling)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Deadline */}
              {(grant.deadline || grant.close_date) && (
                <div className="bg-orange-50 rounded-xl p-6 border-2 border-orange-200">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-orange-600 rounded-lg">
                      <Calendar className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Deadline</p>
                      <p className="text-xl font-bold text-orange-700">
                        {formatDate(grant.deadline || grant.close_date)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Last Updated */}
              {grant.updated_at && (
                <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-200">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-600 rounded-lg">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Last Updated</p>
                      <p className="text-xl font-bold text-blue-700">
                        {formatDate(grant.updated_at)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Additional Grant Details */}
            {(grant.award_floor || grant.total_funding || grant.open_date || grant.requirements) && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="w-6 h-6" />
                  Grant Details
                </h2>
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border-2 border-blue-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {grant.award_floor && (
                      <div>
                        <p className="text-sm text-gray-600 font-semibold mb-1">Award Floor</p>
                        <p className="text-lg font-bold text-gray-900">{formatCurrency(grant.award_floor)}</p>
                      </div>
                    )}
                    {grant.total_funding && (
                      <div>
                        <p className="text-sm text-gray-600 font-semibold mb-1">Total Funding</p>
                        <p className="text-lg font-bold text-gray-900">{formatCurrency(grant.total_funding)}</p>
                      </div>
                    )}
                    {grant.open_date && (
                      <div>
                        <p className="text-sm text-gray-600 font-semibold mb-1">Posted Date</p>
                        <p className="text-lg font-bold text-gray-900">{formatDate(grant.open_date)}</p>
                      </div>
                    )}
                    {grant.requirements?.category && (
                      <div>
                        <p className="text-sm text-gray-600 font-semibold mb-1">Category</p>
                        <p className="text-lg font-bold text-gray-900">{grant.requirements.category}</p>
                      </div>
                    )}
                    {grant.requirements?.cfda_numbers && grant.requirements.cfda_numbers.length > 0 && (
                      <div className="md:col-span-2">
                        <p className="text-sm text-gray-600 font-semibold mb-2">CFDA Numbers</p>
                        <div className="flex flex-wrap gap-2">
                          {grant.requirements.cfda_numbers.map((cfda, idx) => (
                            <span key={idx} className="px-3 py-1 bg-white rounded-lg border-2 border-blue-300 text-blue-700 font-mono text-sm">
                              {cfda}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Description/Notes Section */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-6 h-6" />
                Description & Notes
              </h2>
              
              {isEditing ? (
                <textarea
                  value={editedNotes}
                  onChange={(e) => setEditedNotes(e.target.value)}
                  rows={10}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Add notes about this grant opportunity..."
                />
              ) : (
                <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
                  {grant.nofo_text || grant.description ? (
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {grant.nofo_text || grant.description}
                    </p>
                  ) : (
                    <p className="text-gray-400 italic">No description available</p>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 pt-6 border-t border-gray-200">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    <Save className="w-5 h-5" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditedTitle(grant.title);
                      setEditedStatus(grant.status);
                      setEditedNotes(grant.nofo_text || '');
                    }}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors flex items-center gap-2"
                  >
                    <X className="w-5 h-5" />
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-2"
                  >
                    <Edit className="w-5 h-5" />
                    Edit Grant
                  </button>
                  <a
                    href={grant.requirements?.sam_gov_url || `https://sam.gov/search?index=opp&page=1&sort=-modifiedDate&sfm[0][key]=noticeType&sfm[0][value]=o&sfm[1][key]=solicitationNumber&sfm[1][value]=${grant.funding_opportunity_number}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <ExternalLink className="w-5 h-5" />
                    View on SAM.gov
                  </a>
                  <button
                    onClick={handleDelete}
                    className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center gap-2 ml-auto"
                  >
                    <Trash2 className="w-5 h-5" />
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Additional Information Card */}
        <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Grant Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Grant ID</p>
              <p className="font-mono text-sm text-gray-900">{grant.id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Opportunity Number</p>
              <p className="font-mono text-sm text-gray-900">{grant.funding_opportunity_number}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Created</p>
              <p className="text-sm text-gray-900">{formatDate(grant.created_at)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Last Modified</p>
              <p className="text-sm text-gray-900">{formatDate(grant.updated_at)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

