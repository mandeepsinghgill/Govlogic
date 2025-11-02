/**
 * Capture Management - Shipley-Compliant Capture Planning
 * Structured process to identify, assess, and win business opportunities
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Target, Users, TrendingUp, FileText, CheckCircle, AlertCircle,
  Calendar, DollarSign, Award, BarChart3, Lightbulb, Search,
  Plus, Filter, Clock, Star, Flag, ChevronDown, ChevronRight,
  Edit, Trash2, Eye, ArrowRight, Building2, UserCheck, Shield,
  Brain, Zap, GitBranch, MessageSquare, FileCheck, PieChart
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Shipley Capture Phases
const CAPTURE_PHASES = [
  {
    id: 'phase1',
    name: 'Phase 1: Qualify',
    description: 'Identify and qualify opportunities',
    color: 'blue',
    gates: ['Opportunity Gate'],
    activities: [
      'Market intelligence gathering',
      'Opportunity identification',
      'Initial customer contact',
      'Preliminary qualification',
      'Bid/No-Bid decision'
    ]
  },
  {
    id: 'phase2',
    name: 'Phase 2: Position',
    description: 'Develop competitive positioning',
    color: 'indigo',
    gates: ['Capture Gate'],
    activities: [
      'Customer engagement plan',
      'Competitive intelligence',
      'Win strategy development',
      'Solution validation',
      'Teaming strategy'
    ]
  },
  {
    id: 'phase3',
    name: 'Phase 3: Develop',
    description: 'Create proposal strategy',
    color: 'purple',
    gates: ['Proposal Gate'],
    activities: [
      'Capture plan finalization',
      'Price-to-win analysis',
      'Proposal kickoff',
      'Proposal planning',
      'Resource allocation'
    ]
  },
  {
    id: 'phase4',
    name: 'Phase 4: Execute',
    description: 'Execute proposal and submit',
    color: 'green',
    gates: ['Submit Gate'],
    activities: [
      'Proposal development',
      'Pink Team review',
      'Red Team review',
      'Gold Team review',
      'Final production & submission'
    ]
  }
];

// Review Gates
const REVIEW_GATES = [
  { name: 'Pink Team', color: 'pink', description: 'Early content review', timing: 'Days 1-5' },
  { name: 'Red Team', color: 'red', description: 'Complete proposal review', timing: 'Days 10-12' },
  { name: 'Gold Team', color: 'yellow', description: 'Final quality review', timing: 'Days 15-17' },
];

interface Opportunity {
  id: string;
  name: string;
  customer: string;
  value: number;
  phase: string;
  pWin: number;
  status: 'active' | 'won' | 'lost' | 'no-bid';
  dueDate: string;
  captureManager: string;
  lastUpdate: string;
}

interface CaptureStats {
  totalOpportunities: number;
  activePursuits: number;
  totalValue: number;
  avgPWin: number;
  phaseDistribution: { [key: string]: number };
}

export default function CaptureManagement() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [stats, setStats] = useState<CaptureStats>({
    totalOpportunities: 0,
    activePursuits: 0,
    totalValue: 0,
    avgPWin: 0,
    phaseDistribution: {}
  });
  const [selectedPhase, setSelectedPhase] = useState<string>('all');
  const [expandedPhase, setExpandedPhase] = useState<string | null>(null);
  const [showNewCapture, setShowNewCapture] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // New Capture Form State
  const [newCapture, setNewCapture] = useState({
    name: '',
    customer: '',
    agency: '',
    value: '',
    phase: 'phase1',
    pWin: '50',
    captureManager: '',
    dueDate: '',
    description: ''
  });

  useEffect(() => {
    loadCaptures();
  }, []);

  const loadCaptures = async () => {
    try {
      setLoading(true);
      
      // Mock data for now - will integrate with backend
      const mockOpportunities: Opportunity[] = [
        {
          id: '1',
          name: 'Defense Logistics Modernization',
          customer: 'Department of Defense',
          value: 50000000,
          phase: 'phase2',
          pWin: 65,
          status: 'active',
          dueDate: '2025-12-15',
          captureManager: 'Sarah Johnson',
          lastUpdate: '2025-11-01'
        },
        {
          id: '2',
          name: 'Healthcare IT Infrastructure',
          customer: 'VA Medical Centers',
          value: 25000000,
          phase: 'phase3',
          pWin: 75,
          status: 'active',
          dueDate: '2025-11-30',
          captureManager: 'Michael Chen',
          lastUpdate: '2025-11-02'
        },
        {
          id: '3',
          name: 'Cybersecurity Operations Center',
          customer: 'Department of Homeland Security',
          value: 35000000,
          phase: 'phase1',
          pWin: 45,
          status: 'active',
          dueDate: '2026-01-20',
          captureManager: 'Emily Rodriguez',
          lastUpdate: '2025-10-28'
        }
      ];

      setOpportunities(mockOpportunities);

      // Calculate stats
      const activeOpps = mockOpportunities.filter(o => o.status === 'active');
      const totalValue = activeOpps.reduce((sum, o) => sum + o.value, 0);
      const avgPWin = activeOpps.reduce((sum, o) => sum + o.pWin, 0) / activeOpps.length;

      const phaseDistribution: { [key: string]: number } = {};
      activeOpps.forEach(o => {
        phaseDistribution[o.phase] = (phaseDistribution[o.phase] || 0) + 1;
      });

      setStats({
        totalOpportunities: mockOpportunities.length,
        activePursuits: activeOpps.length,
        totalValue,
        avgPWin,
        phaseDistribution
      });
    } catch (err) {
      console.error('Error loading captures:', err);
    } finally {
      setLoading(false);
    }
  };

  const getPhaseInfo = (phaseId: string) => {
    return CAPTURE_PHASES.find(p => p.id === phaseId) || CAPTURE_PHASES[0];
  };

  const getPWinColor = (pWin: number) => {
    if (pWin >= 70) return 'text-green-600 bg-green-100';
    if (pWin >= 50) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
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

  const filteredOpportunities = selectedPhase === 'all' 
    ? opportunities 
    : opportunities.filter(o => o.phase === selectedPhase);

  const handleCreateCapture = async () => {
    try {
      // Validate required fields
      if (!newCapture.name || !newCapture.customer || !newCapture.value || !newCapture.captureManager || !newCapture.dueDate) {
        alert('Please fill in all required fields');
        return;
      }

      const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
      
      // API call would go here
      const captureData = {
        ...newCapture,
        value: parseFloat(newCapture.value),
        pWin: parseInt(newCapture.pWin),
        status: 'active',
        lastUpdate: new Date().toISOString().split('T')[0]
      };

      console.log('Creating capture:', captureData);
      
      // Simulate API call
      alert('Capture opportunity created successfully!');
      
      // Reset form and close modal
      setNewCapture({
        name: '',
        customer: '',
        agency: '',
        value: '',
        phase: 'phase1',
        pWin: '50',
        captureManager: '',
        dueDate: '',
        description: ''
      });
      setShowNewCapture(false);
      
      // Reload captures
      loadCaptures();
    } catch (err) {
      console.error('Error creating capture:', err);
      alert('Failed to create capture opportunity');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <Target className="w-10 h-10 text-indigo-600" />
                Capture Management
              </h1>
              <p className="text-lg text-gray-600">
                Shipley-Compliant Capture Planning & Execution
              </p>
            </div>
            <button
              onClick={() => setShowNewCapture(true)}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              New Capture
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-semibold mb-1">Active Pursuits</p>
                <p className="text-3xl font-bold text-gray-900">{stats.activePursuits}</p>
              </div>
              <Target className="w-12 h-12 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-semibold mb-1">Total Pipeline Value</p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatCurrency(stats.totalValue).slice(0, -3)}
                </p>
                <p className="text-xs text-gray-500">Million</p>
              </div>
              <DollarSign className="w-12 h-12 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-semibold mb-1">Avg P(Win)</p>
                <p className="text-3xl font-bold text-gray-900">{stats.avgPWin.toFixed(0)}%</p>
              </div>
              <TrendingUp className="w-12 h-12 text-purple-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-indigo-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-semibold mb-1">Opportunities</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalOpportunities}</p>
              </div>
              <Award className="w-12 h-12 text-indigo-500" />
            </div>
          </div>
        </div>

        {/* Shipley Capture Process */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <GitBranch className="w-7 h-7 text-indigo-600" />
            Shipley Capture Process Framework
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {CAPTURE_PHASES.map((phase, index) => (
              <div key={phase.id} className="relative">
                <div
                  className={`bg-gradient-to-br from-${phase.color}-50 to-${phase.color}-100 border-2 border-${phase.color}-200 rounded-xl p-5 hover:shadow-lg transition-all cursor-pointer`}
                  onClick={() => setExpandedPhase(expandedPhase === phase.id ? null : phase.id)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-10 h-10 bg-${phase.color}-600 text-white rounded-lg flex items-center justify-center font-bold text-lg`}>
                      {index + 1}
                    </div>
                    {expandedPhase === phase.id ? (
                      <ChevronDown className="w-5 h-5 text-gray-600" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-600" />
                    )}
                  </div>
                  
                  <h3 className="font-bold text-gray-900 mb-1">{phase.name.split(': ')[1]}</h3>
                  <p className="text-sm text-gray-600 mb-3">{phase.description}</p>
                  
                  {/* Gate Badge */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {phase.gates.map(gate => (
                      <span key={gate} className={`px-2 py-1 bg-${phase.color}-200 text-${phase.color}-800 text-xs font-semibold rounded`}>
                        {gate}
                      </span>
                    ))}
                  </div>
                  
                  {/* Opportunity Count */}
                  <div className="flex items-center gap-2 text-sm">
                    <Target className="w-4 h-4 text-gray-600" />
                    <span className="font-semibold text-gray-700">
                      {stats.phaseDistribution[phase.id] || 0} opportunities
                    </span>
                  </div>
                  
                  {/* Expanded Activities */}
                  {expandedPhase === phase.id && (
                    <div className="mt-4 pt-4 border-t border-gray-300">
                      <p className="text-xs font-semibold text-gray-700 mb-2">Key Activities:</p>
                      <ul className="space-y-1">
                        {phase.activities.map((activity, idx) => (
                          <li key={idx} className="text-xs text-gray-600 flex items-start gap-1">
                            <CheckCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                            <span>{activity}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                
                {/* Arrow between phases */}
                {index < CAPTURE_PHASES.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-2 transform -translate-y-1/2 z-10">
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Review Gates */}
        <div className="bg-gradient-to-r from-pink-50 via-red-50 to-yellow-50 rounded-xl shadow-lg p-6 mb-8 border-2 border-pink-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FileCheck className="w-6 h-6 text-red-600" />
            Shipley Review Gates
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {REVIEW_GATES.map(gate => (
              <div key={gate.name} className="bg-white rounded-lg p-4 border-2 border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-3 h-3 bg-${gate.color}-500 rounded-full`}></div>
                  <h3 className="font-bold text-gray-900">{gate.name}</h3>
                </div>
                <p className="text-sm text-gray-600 mb-2">{gate.description}</p>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  <span>{gate.timing}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
          <div className="flex items-center gap-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setSelectedPhase('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedPhase === 'all'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Phases
              </button>
              {CAPTURE_PHASES.map(phase => (
                <button
                  key={phase.id}
                  onClick={() => setSelectedPhase(phase.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedPhase === phase.id
                      ? `bg-${phase.color}-600 text-white`
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {phase.name.split(': ')[1]} ({stats.phaseDistribution[phase.id] || 0})
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Opportunities List */}
        <div className="space-y-4">
          {loading ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading capture opportunities...</p>
            </div>
          ) : filteredOpportunities.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <Target className="w-20 h-20 text-gray-300 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No Opportunities</h3>
              <p className="text-gray-600 mb-6">
                Start tracking your capture opportunities
              </p>
              <button
                onClick={() => setShowNewCapture(true)}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
              >
                Create First Capture
              </button>
            </div>
          ) : (
            filteredOpportunities.map(opp => {
              const phase = getPhaseInfo(opp.phase);
              return (
                <div
                  key={opp.id}
                  className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3 mb-3">
                        <Target className="w-6 h-6 text-indigo-600 mt-1" />
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900 mb-1">{opp.name}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Building2 className="w-4 h-4" />
                              <span className="font-semibold">{opp.customer}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <UserCheck className="w-4 h-4" />
                              <span>{opp.captureManager}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
                        <div>
                          <p className="text-xs text-gray-500 font-semibold mb-1">Contract Value</p>
                          <p className="text-lg font-bold text-green-700">{formatCurrency(opp.value)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-semibold mb-1">P(Win)</p>
                          <p className={`text-lg font-bold px-3 py-1 rounded-lg inline-block ${getPWinColor(opp.pWin)}`}>
                            {opp.pWin}%
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-semibold mb-1">Phase</p>
                          <span className={`px-3 py-1 bg-${phase.color}-100 text-${phase.color}-700 text-sm font-semibold rounded-lg inline-block`}>
                            {phase.name.split(': ')[1]}
                          </span>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-semibold mb-1">Due Date</p>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4 text-gray-600" />
                            <span className="text-sm font-semibold text-gray-900">{formatDate(opp.dueDate)}</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-semibold mb-1">Last Update</p>
                          <span className="text-sm text-gray-700">{formatDate(opp.lastUpdate)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-4 border-t border-gray-200">
                    <Link
                      to={`/capture/${opp.id}`}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center gap-1.5"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </Link>
                    <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-1.5">
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                    <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-1.5">
                      <FileText className="w-4 h-4" />
                      Capture Plan
                    </button>
                    <button className="ml-auto px-4 py-2 border border-red-300 text-red-700 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors flex items-center gap-1.5">
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Shipley Resources */}
        <div className="mt-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Lightbulb className="w-6 h-6" />
            Shipley Capture Management Best Practices
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              <Brain className="w-8 h-8 mb-2" />
              <h4 className="font-bold mb-1">Early Engagement</h4>
              <p className="text-sm text-white/90">Start capture activities 12-18 months before RFP release</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              <Shield className="w-8 h-8 mb-2" />
              <h4 className="font-bold mb-1">Customer Focus</h4>
              <p className="text-sm text-white/90">Understand customer hot buttons and decision criteria</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              <Zap className="w-8 h-8 mb-2" />
              <h4 className="font-bold mb-1">Win Strategy</h4>
              <p className="text-sm text-white/90">Develop discriminators and competitive advantages</p>
            </div>
          </div>
        </div>
      </div>

      {/* New Capture Modal */}
      {showNewCapture && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Target className="w-8 h-8" />
                  <h2 className="text-2xl font-bold">Create New Capture Opportunity</h2>
                </div>
                <button
                  onClick={() => setShowNewCapture(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Opportunity Name <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      value={newCapture.name}
                      onChange={(e) => setNewCapture({ ...newCapture, name: e.target.value })}
                      placeholder="e.g., Defense Logistics Modernization"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Customer <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      value={newCapture.customer}
                      onChange={(e) => setNewCapture({ ...newCapture, customer: e.target.value })}
                      placeholder="e.g., Department of Defense"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Agency / Department
                    </label>
                    <input
                      type="text"
                      value={newCapture.agency}
                      onChange={(e) => setNewCapture({ ...newCapture, agency: e.target.value })}
                      placeholder="e.g., Defense Logistics Agency"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Contract Value ($) <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="number"
                      value={newCapture.value}
                      onChange={(e) => setNewCapture({ ...newCapture, value: e.target.value })}
                      placeholder="e.g., 50000000"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      min="0"
                      step="1000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Due Date <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="date"
                      value={newCapture.dueDate}
                      onChange={(e) => setNewCapture({ ...newCapture, dueDate: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Capture Details */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Capture Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Initial Phase <span className="text-red-600">*</span>
                    </label>
                    <select
                      value={newCapture.phase}
                      onChange={(e) => setNewCapture({ ...newCapture, phase: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="phase1">Phase 1: Qualify</option>
                      <option value="phase2">Phase 2: Position</option>
                      <option value="phase3">Phase 3: Develop</option>
                      <option value="phase4">Phase 4: Execute</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Initial P(Win) % <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="range"
                      value={newCapture.pWin}
                      onChange={(e) => setNewCapture({ ...newCapture, pWin: e.target.value })}
                      min="0"
                      max="100"
                      step="5"
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-gray-600">0%</span>
                      <span className="font-bold text-indigo-600">{newCapture.pWin}%</span>
                      <span className="text-gray-600">100%</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Capture Manager <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      value={newCapture.captureManager}
                      onChange={(e) => setNewCapture({ ...newCapture, captureManager: e.target.value })}
                      placeholder="e.g., Sarah Johnson"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Description</h3>
                <textarea
                  value={newCapture.description}
                  onChange={(e) => setNewCapture({ ...newCapture, description: e.target.value })}
                  placeholder="Provide a brief description of the opportunity..."
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={handleCreateCapture}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  Create Capture Opportunity
                </button>
                <button
                  onClick={() => setShowNewCapture(false)}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

