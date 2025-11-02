/**
 * Capture Detail Page - Complete view and management of a capture opportunity
 * Shipley-compliant capture planning and tracking
 */

import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Target, Building2, DollarSign, Calendar, TrendingUp,
  User, Clock, Edit, Trash2, Save, X, CheckCircle, AlertCircle,
  FileText, Users, Lightbulb, Shield, Award, MessageSquare,
  GitBranch, Flag, Star, Eye, Download, Plus, Brain, Zap
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface CaptureOpportunity {
  id: string;
  name: string;
  customer: string;
  agency: string;
  value: number;
  phase: string;
  pWin: number;
  status: 'active' | 'won' | 'lost' | 'no-bid';
  dueDate: string;
  captureManager: string;
  createdDate: string;
  lastUpdate: string;
  description: string;
  
  // Strategic Information
  customerHotButtons: string[];
  winThemes: string[];
  discriminators: string[];
  competitors: string[];
  teamingPartners: string[];
  
  // Phase-specific data
  phaseActivities: {
    phase: string;
    activities: Array<{ name: string; completed: boolean; dueDate: string }>;
  }[];
  
  // Intelligence
  customerContacts: Array<{ name: string; role: string; lastContact: string }>;
  competitiveIntel: string;
  solutionSummary: string;
  pricingStrategy: string;
  
  // Reviews
  reviews: Array<{
    type: 'pink' | 'red' | 'gold' | 'gate';
    date: string;
    status: 'scheduled' | 'completed' | 'pending';
    findings: string;
  }>;
}

const PHASES = [
  { id: 'phase1', name: 'Qualify', color: 'blue' },
  { id: 'phase2', name: 'Position', color: 'indigo' },
  { id: 'phase3', name: 'Develop', color: 'purple' },
  { id: 'phase4', name: 'Execute', color: 'green' }
];

export default function CaptureDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [capture, setCapture] = useState<CaptureOpportunity | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'strategy' | 'intelligence' | 'activities' | 'reviews'>('overview');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadCapture();
  }, [id]);

  const loadCapture = async () => {
    try {
      setLoading(true);
      
      // Mock data for now
      const mockCapture: CaptureOpportunity = {
        id: id || '1',
        name: 'Defense Logistics Modernization',
        customer: 'Department of Defense',
        agency: 'Defense Logistics Agency',
        value: 50000000,
        phase: 'phase2',
        pWin: 65,
        status: 'active',
        dueDate: '2025-12-15',
        captureManager: 'Sarah Johnson',
        createdDate: '2025-08-01',
        lastUpdate: '2025-11-02',
        description: 'Major modernization effort to upgrade logistics systems across all DoD branches. Includes cloud migration, AI-powered inventory management, and real-time tracking capabilities.',
        
        customerHotButtons: [
          'Cloud-first architecture',
          'Cybersecurity compliance (CMMC Level 3)',
          'Rapid deployment timeline',
          'Cost savings through automation',
          'Interoperability with existing systems'
        ],
        
        winThemes: [
          'Proven DoD experience with 15+ successful deployments',
          'Best-in-class cybersecurity with continuous monitoring',
          'Accelerated timeline with parallel implementation approach',
          '30% cost reduction through AI-driven automation',
          'Seamless integration with legacy systems'
        ],
        
        discriminators: [
          'Only vendor with DoD IL6 cloud authorization',
          'Proprietary AI algorithms reduce inventory costs by 40%',
          'Pre-existing ATO for similar systems',
          'Strategic partnership with AWS GovCloud',
          '24/7 CONUS support with <15 min response time'
        ],
        
        competitors: [
          'Lockheed Martin',
          'Northrop Grumman',
          'General Dynamics IT',
          'Leidos'
        ],
        
        teamingPartners: [
          'AWS Government Services',
          'Palantir Technologies',
          'CACI International'
        ],
        
        phaseActivities: [
          {
            phase: 'phase1',
            activities: [
              { name: 'Initial market research', completed: true, dueDate: '2025-08-15' },
              { name: 'Opportunity gate review', completed: true, dueDate: '2025-08-30' },
              { name: 'Bid/No-Bid decision', completed: true, dueDate: '2025-09-05' }
            ]
          },
          {
            phase: 'phase2',
            activities: [
              { name: 'Customer engagement plan', completed: true, dueDate: '2025-09-15' },
              { name: 'Competitive intelligence gathering', completed: true, dueDate: '2025-09-30' },
              { name: 'Win strategy development', completed: false, dueDate: '2025-11-10' },
              { name: 'Solution validation workshop', completed: false, dueDate: '2025-11-20' },
              { name: 'Capture gate review', completed: false, dueDate: '2025-11-25' }
            ]
          }
        ],
        
        customerContacts: [
          { name: 'Col. James Mitchell', role: 'Program Manager', lastContact: '2025-10-28' },
          { name: 'Sarah Chen', role: 'Technical Lead', lastContact: '2025-10-25' },
          { name: 'Michael Roberts', role: 'Contracting Officer', lastContact: '2025-10-15' }
        ],
        
        competitiveIntel: 'Lockheed Martin is the incumbent with existing relationship but struggling with legacy tech debt. Northrop Grumman team recently lost a similar contract due to cost overruns. General Dynamics has strong technical approach but weak cybersecurity posture.',
        
        solutionSummary: 'Cloud-native microservices architecture deployed on AWS GovCloud with AI/ML-powered predictive analytics. Zero-trust security model with continuous monitoring. Phased rollout approach minimizes operational disruption.',
        
        pricingStrategy: 'Price-to-win target: $47-52M (competitive with incumbents). Front-load transition costs, back-load steady-state operations. Propose 5-year contract with 2 option years. Show 30% savings in years 3-5.',
        
        reviews: [
          {
            type: 'gate',
            date: '2025-09-05',
            status: 'completed',
            findings: 'Approved to proceed. Strong strategic fit, adequate resources, P(Win) >50%'
          },
          {
            type: 'gate',
            date: '2025-11-25',
            status: 'scheduled',
            findings: ''
          }
        ]
      };

      setCapture(mockCapture);
    } catch (err) {
      console.error('Error loading capture:', err);
      setError('Failed to load capture opportunity');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      
      // API call would go here
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      setSuccess('Capture opportunity updated successfully!');
      setEditing(false);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this capture opportunity?')) {
      return;
    }
    
    try {
      // API call would go here
      navigate('/capture');
    } catch (err) {
      setError('Failed to delete capture opportunity');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getPhaseInfo = (phaseId: string) => {
    return PHASES.find(p => p.id === phaseId) || PHASES[0];
  };

  const getPWinColor = (pWin: number) => {
    if (pWin >= 70) return 'text-green-600 bg-green-100 border-green-300';
    if (pWin >= 50) return 'text-yellow-600 bg-yellow-100 border-yellow-300';
    return 'text-red-600 bg-red-100 border-red-300';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading capture details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!capture) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <AlertCircle className="w-20 h-20 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Capture Not Found</h2>
            <p className="text-gray-600 mb-6">The capture opportunity you're looking for doesn't exist.</p>
            <Link
              to="/capture"
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors inline-block"
            >
              Back to Capture Management
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const phase = getPhaseInfo(capture.phase);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            to="/capture"
            className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Capture Management
          </Link>

          {/* Success/Error Messages */}
          {success && (
            <div className="mb-4 bg-green-50 border-2 border-green-200 rounded-xl p-4 flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <p className="text-green-800 font-semibold">{success}</p>
            </div>
          )}
          
          {error && (
            <div className="mb-4 bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-red-600" />
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Title Card */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Target className="w-8 h-8 text-indigo-600" />
                  <h1 className="text-3xl font-bold text-gray-900">{capture.name}</h1>
                </div>
                <div className="flex items-center gap-4 text-gray-600">
                  <div className="flex items-center gap-1">
                    <Building2 className="w-4 h-4" />
                    <span className="font-semibold">{capture.customer}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    <span>{capture.captureManager}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                {!editing ? (
                  <>
                    <button
                      onClick={() => setEditing(true)}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={handleDelete}
                      className="px-4 py-2 border-2 border-red-300 text-red-700 rounded-lg font-medium hover:bg-red-50 transition-colors flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={() => setEditing(false)}
                      className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Key Metrics Row */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mt-6">
              <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-lg p-4">
                <p className="text-xs text-gray-600 font-semibold mb-1">Contract Value</p>
                <p className="text-xl font-bold text-green-700">{formatCurrency(capture.value)}</p>
              </div>
              
              <div className={`border-2 rounded-lg p-4 ${getPWinColor(capture.pWin)}`}>
                <p className="text-xs font-semibold mb-1 opacity-75">P(Win)</p>
                <p className="text-xl font-bold">{capture.pWin}%</p>
              </div>
              
              <div className={`bg-gradient-to-br from-${phase.color}-50 to-${phase.color}-100 border-2 border-${phase.color}-200 rounded-lg p-4`}>
                <p className="text-xs text-gray-600 font-semibold mb-1">Phase</p>
                <p className={`text-sm font-bold text-${phase.color}-700`}>{phase.name}</p>
              </div>
              
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-lg p-4">
                <p className="text-xs text-gray-600 font-semibold mb-1">Due Date</p>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-blue-700" />
                  <p className="text-sm font-bold text-blue-700">{formatDate(capture.dueDate)}</p>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 rounded-lg p-4">
                <p className="text-xs text-gray-600 font-semibold mb-1">Status</p>
                <p className="text-sm font-bold text-purple-700 capitalize">{capture.status}</p>
              </div>
              
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-lg p-4">
                <p className="text-xs text-gray-600 font-semibold mb-1">Last Update</p>
                <p className="text-sm font-bold text-gray-700">{formatDate(capture.lastUpdate)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                activeTab === 'overview'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FileText className="w-5 h-5 inline mr-2" />
              Overview
            </button>
            <button
              onClick={() => setActiveTab('strategy')}
              className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                activeTab === 'strategy'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Lightbulb className="w-5 h-5 inline mr-2" />
              Win Strategy
            </button>
            <button
              onClick={() => setActiveTab('intelligence')}
              className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                activeTab === 'intelligence'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Brain className="w-5 h-5 inline mr-2" />
              Intelligence
            </button>
            <button
              onClick={() => setActiveTab('activities')}
              className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                activeTab === 'activities'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <CheckCircle className="w-5 h-5 inline mr-2" />
              Activities
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                activeTab === 'reviews'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Flag className="w-5 h-5 inline mr-2" />
              Reviews
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <>
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Opportunity Description</h2>
                <p className="text-gray-700 leading-relaxed">{capture.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Users className="w-6 h-6 text-indigo-600" />
                    Teaming Partners
                  </h2>
                  <ul className="space-y-2">
                    {capture.teamingPartners.map((partner, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-gray-700">
                        <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                        {partner}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Shield className="w-6 h-6 text-red-600" />
                    Competitors
                  </h2>
                  <ul className="space-y-2">
                    {capture.competitors.map((competitor, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-gray-700">
                        <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                        {competitor}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </>
          )}

          {/* Strategy Tab */}
          {activeTab === 'strategy' && (
            <>
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Zap className="w-6 h-6 text-yellow-600" />
                  Customer Hot Buttons
                </h2>
                <ul className="space-y-2">
                  {capture.customerHotButtons.map((hotButton, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Star className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-800">{hotButton}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Award className="w-6 h-6 text-blue-600" />
                  Win Themes
                </h2>
                <ul className="space-y-3">
                  {capture.winThemes.map((theme, idx) => (
                    <li key={idx} className="flex items-start gap-3 bg-white rounded-lg p-3 border border-blue-200">
                      <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm">
                        {idx + 1}
                      </div>
                      <span className="text-gray-800">{theme}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                  Key Discriminators
                </h2>
                <ul className="space-y-3">
                  {capture.discriminators.map((disc, idx) => (
                    <li key={idx} className="flex items-start gap-3 bg-white rounded-lg p-3 border border-green-200">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-800">{disc}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <DollarSign className="w-6 h-6 text-green-600" />
                  Pricing Strategy
                </h2>
                <p className="text-gray-700 leading-relaxed">{capture.pricingStrategy}</p>
              </div>
            </>
          )}

          {/* Intelligence Tab */}
          {activeTab === 'intelligence' && (
            <>
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Users className="w-6 h-6 text-indigo-600" />
                  Customer Contacts
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {capture.customerContacts.map((contact, idx) => (
                    <div key={idx} className="bg-gradient-to-br from-indigo-50 to-blue-50 border-2 border-indigo-200 rounded-lg p-4">
                      <p className="font-bold text-gray-900 mb-1">{contact.name}</p>
                      <p className="text-sm text-gray-600 mb-2">{contact.role}</p>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        Last contact: {formatDate(contact.lastContact)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Shield className="w-6 h-6 text-red-600" />
                  Competitive Intelligence
                </h2>
                <p className="text-gray-700 leading-relaxed">{capture.competitiveIntel}</p>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Brain className="w-6 h-6 text-purple-600" />
                  Solution Summary
                </h2>
                <p className="text-gray-700 leading-relaxed">{capture.solutionSummary}</p>
              </div>
            </>
          )}

          {/* Activities Tab */}
          {activeTab === 'activities' && (
            <>
              {capture.phaseActivities.map((phaseActivity, phaseIdx) => {
                const phaseInfo = getPhaseInfo(phaseActivity.phase);
                return (
                  <div key={phaseIdx} className="bg-white rounded-xl shadow-lg p-6">
                    <h2 className={`text-xl font-bold text-gray-900 mb-4 flex items-center gap-2`}>
                      <GitBranch className={`w-6 h-6 text-${phaseInfo.color}-600`} />
                      Phase {phaseIdx + 1}: {phaseInfo.name} Activities
                    </h2>
                    <div className="space-y-3">
                      {phaseActivity.activities.map((activity, actIdx) => (
                        <div
                          key={actIdx}
                          className={`flex items-center justify-between p-4 rounded-lg border-2 ${
                            activity.completed
                              ? 'bg-green-50 border-green-200'
                              : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {activity.completed ? (
                              <CheckCircle className="w-6 h-6 text-green-600" />
                            ) : (
                              <div className="w-6 h-6 border-2 border-gray-400 rounded-full"></div>
                            )}
                            <span className={`font-medium ${activity.completed ? 'text-gray-700' : 'text-gray-900'}`}>
                              {activity.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Calendar className="w-4 h-4" />
                            {formatDate(activity.dueDate)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </>
          )}

          {/* Reviews Tab */}
          {activeTab === 'reviews' && (
            <>
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Flag className="w-6 h-6 text-purple-600" />
                  Gate Reviews & Team Reviews
                </h2>
                <div className="space-y-4">
                  {capture.reviews.map((review, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-lg border-2 ${
                        review.status === 'completed'
                          ? 'bg-green-50 border-green-200'
                          : review.status === 'scheduled'
                          ? 'bg-blue-50 border-blue-200'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-lg font-bold text-sm ${
                            review.type === 'pink'
                              ? 'bg-pink-200 text-pink-800'
                              : review.type === 'red'
                              ? 'bg-red-200 text-red-800'
                              : review.type === 'gold'
                              ? 'bg-yellow-200 text-yellow-800'
                              : 'bg-purple-200 text-purple-800'
                          }`}>
                            {review.type.toUpperCase()} {review.type !== 'gate' && 'TEAM'}
                          </span>
                          <span className="text-sm font-semibold text-gray-700">
                            {formatDate(review.date)}
                          </span>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          review.status === 'completed'
                            ? 'bg-green-200 text-green-800'
                            : review.status === 'scheduled'
                            ? 'bg-blue-200 text-blue-800'
                            : 'bg-gray-200 text-gray-800'
                        }`}>
                          {review.status.toUpperCase()}
                        </span>
                      </div>
                      {review.findings && (
                        <p className="text-gray-700 text-sm mt-2">{review.findings}</p>
                      )}
                    </div>
                  ))}
                </div>

                <button className="mt-6 w-full px-4 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2">
                  <Plus className="w-5 h-5" />
                  Schedule Review
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

