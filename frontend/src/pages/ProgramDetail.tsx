/**
 * Program Detail Page - GovSure
 * Detailed view of contract/program with milestones, deliverables, and analytics
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { 
  ArrowLeft, CheckCircle, Clock, AlertTriangle, TrendingUp, 
  Calendar, Users, DollarSign, FileText, Download, BarChart3,
  Edit, Plus, CheckSquare, Circle
} from 'lucide-react';

interface Milestone {
  id: number;
  name: string;
  status: 'completed' | 'in-progress' | 'pending';
  due_date: string;
  completion_date?: string;
}

interface Deliverable {
  id: number;
  name: string;
  status: 'submitted' | 'in-review' | 'pending';
  due_date: string;
  submitted_date?: string;
}

interface Program {
  id: number;
  name: string;
  contract_number: string;
  status: 'active' | 'completed' | 'at-risk';
  health: number;
  milestones: Milestone[];
  deliverables: Deliverable[];
  start_date: string;
  end_date: string;
  contract_value: number;
  program_manager: string;
  agency: string;
  description: string;
  next_milestone: string;
}

const ProgramDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [program, setProgram] = useState<Program | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadProgramDetail();
  }, [id]);

  const loadProgramDetail = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Try API call first
      if (token) {
        try {
          const response = await fetch(`/api/v1/programs/${id}`, {
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            setProgram(data);
            setLoading(false);
            return;
          }
        } catch (apiError) {
          console.warn('API not available, using demo data:', apiError);
        }
      }

      // Demo data for demonstration
      const mockProgram: Program = {
        id: parseInt(id || '1'),
        name: 'GSA Cloud Platform Modernization',
        contract_number: 'GS-35F-0119Y',
        status: 'active',
        health: 95,
        start_date: '2023-06-01',
        end_date: '2025-05-31',
        contract_value: 15000000,
        program_manager: 'Sarah Johnson',
        agency: 'GSA',
        description: 'Comprehensive cloud platform modernization initiative for GSA, including migration of legacy systems, implementation of cloud-native architecture, and staff training.',
        next_milestone: 'Phase 3 Delivery - Feb 15',
        milestones: [
          { id: 1, name: 'Phase 1: Planning & Design', status: 'completed', due_date: '2023-08-15', completion_date: '2023-08-10' },
          { id: 2, name: 'Phase 2: Infrastructure Setup', status: 'completed', due_date: '2023-10-30', completion_date: '2023-10-28' },
          { id: 3, name: 'Phase 3: Core Migration', status: 'in-progress', due_date: '2024-02-15' },
          { id: 4, name: 'Phase 4: Testing & Validation', status: 'pending', due_date: '2024-04-30' },
          { id: 5, name: 'Phase 5: Go-Live', status: 'pending', due_date: '2024-06-15' },
        ],
        deliverables: [
          { id: 1, name: 'Architecture Design Document', status: 'submitted', due_date: '2023-07-15', submitted_date: '2023-07-12' },
          { id: 2, name: 'Infrastructure Setup Report', status: 'submitted', due_date: '2023-11-01', submitted_date: '2023-10-29' },
          { id: 3, name: 'Migration Plan Document', status: 'in-review', due_date: '2024-01-15', submitted_date: '2024-01-14' },
          { id: 4, name: 'Testing Report', status: 'pending', due_date: '2024-05-01' },
        ]
      };

      setTimeout(() => {
        setProgram(mockProgram);
        setLoading(false);
      }, 500);

    } catch (err: any) {
      setError(err.message || 'Failed to load program details');
      setLoading(false);
    }
  };

  const getHealthColor = (health: number) => {
    if (health >= 80) return 'text-green-600';
    if (health >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getHealthBgColor = (health: number) => {
    if (health >= 80) return 'bg-green-100 border-green-300';
    if (health >= 60) return 'bg-yellow-100 border-yellow-300';
    return 'bg-red-100 border-red-300';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'at-risk':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getMilestoneIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'in-progress':
        return <Clock className="w-6 h-6 text-blue-600" />;
      case 'pending':
        return <Circle className="w-6 h-6 text-gray-400" />;
      default:
        return <Circle className="w-6 h-6 text-gray-400" />;
    }
  };

  const getDeliverableStatusBadge = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'bg-green-100 text-green-800';
      case 'in-review':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading program details...</p>
        </div>
      </div>
    );
  }

  if (error || !program) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 max-w-md">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">Error Loading Program</h2>
          <p className="text-gray-600 text-center mb-6">{error || 'Program not found'}</p>
          <button
            onClick={() => navigate('/programs')}
            className="w-full px-6 py-3 bg-blue-900 text-white rounded-lg font-semibold hover:bg-blue-800 transition-colors"
          >
            Back to Programs
          </button>
        </Card>
      </div>
    );
  }

  const completedMilestones = program.milestones.filter(m => m.status === 'completed').length;
  const milestoneProgress = (completedMilestones / program.milestones.length) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/programs')}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-bold text-gray-900">{program.name}</h1>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(program.status)}`}>
                {program.status.toUpperCase()}
              </span>
            </div>
            <p className="text-gray-600">{program.contract_number}</p>
          </div>
        </div>
        <button className="px-6 py-3 bg-blue-900 text-white rounded-lg font-semibold hover:bg-blue-800 transition-colors flex items-center gap-2">
          <Edit className="w-5 h-5" />
          Edit Program
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Contract Value</span>
            <DollarSign className="w-5 h-5 text-yellow-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            ${(program.contract_value / 1000000).toFixed(1)}M
          </p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Program Manager</span>
            <Users className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-lg font-semibold text-gray-900">{program.program_manager}</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Duration</span>
            <Calendar className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-sm font-semibold text-gray-900">
            {new Date(program.start_date).toLocaleDateString()} - {new Date(program.end_date).toLocaleDateString()}
          </p>
        </Card>

        <Card className={`p-4 border-2 ${getHealthBgColor(program.health)}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Health Score</span>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>
          <p className={`text-3xl font-bold ${getHealthColor(program.health)}`}>
            {program.health}%
          </p>
        </Card>
      </div>

      {/* Description */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-3">Program Description</h2>
        <p className="text-gray-700 leading-relaxed">{program.description}</p>
      </Card>

      {/* Milestones & Deliverables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Milestones */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Milestones</h2>
            <button className="px-4 py-2 bg-blue-900 text-white rounded-lg text-sm font-semibold hover:bg-blue-800 transition-colors flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Overall Progress</span>
              <span className="text-sm font-semibold text-gray-700">
                {completedMilestones}/{program.milestones.length}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all"
                style={{ width: `${milestoneProgress}%` }}
              />
            </div>
          </div>

          {/* Milestone List */}
          <div className="space-y-4">
            {program.milestones.map((milestone) => (
              <div key={milestone.id} className="flex items-start gap-3 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="mt-1">
                  {getMilestoneIcon(milestone.status)}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{milestone.name}</h3>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Due: {new Date(milestone.due_date).toLocaleDateString()}
                    </span>
                    {milestone.completion_date && (
                      <span className="text-green-600">
                        ✓ Completed {new Date(milestone.completion_date).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Deliverables */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Deliverables</h2>
            <button className="px-4 py-2 bg-blue-900 text-white rounded-lg text-sm font-semibold hover:bg-blue-800 transition-colors flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>

          <div className="space-y-4">
            {program.deliverables.map((deliverable) => (
              <div key={deliverable.id} className="p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{deliverable.name}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getDeliverableStatusBadge(deliverable.status)}`}>
                    {deliverable.status.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Due: {new Date(deliverable.due_date).toLocaleDateString()}
                  </span>
                  {deliverable.submitted_date && (
                    <span className="text-green-600">
                      ✓ Submitted {new Date(deliverable.submitted_date).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Action Buttons */}
      <Card className="p-6">
        <div className="flex gap-4">
          <button className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
            <Download className="w-5 h-5" />
            Download Report
          </button>
          <button className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
            <BarChart3 className="w-5 h-5" />
            View Analytics
          </button>
          <button className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
            <FileText className="w-5 h-5" />
            Contract Documents
          </button>
        </div>
      </Card>
    </div>
  );
};

export default ProgramDetail;

