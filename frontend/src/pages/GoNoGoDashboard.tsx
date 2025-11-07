/**
 * Go/No-Go Dashboard - Bid Decision Support System
 * AI-powered analysis of opportunities for bid/no-bid decisions
 * GovSure - Enterprise Government Contracting & Grants Platform
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp, TrendingDown, Minus, AlertCircle, CheckCircle,
  Target, DollarSign, Users, Award, FileText, BarChart3,
  ThumbsUp, ThumbsDown, Clock, Upload
} from 'lucide-react';

interface GoNoGoDecision {
  id: number;
  opportunity_id: number;
  opportunity_title: string;
  agency: string;
  estimated_value: number;
  decision: 'GO' | 'NO-GO' | 'HOLD' | 'PENDING';
  overall_score: number;
  recommendation: string;
  factors: {
    strategic_fit: number;
    technical_capability: number;
    past_performance: number;
    competition_level: number;
    resource_availability: number;
    price_competitiveness: number;
  };
  risk_level: 'Low' | 'Medium' | 'High';
  probability_of_win: number;
  analyzed_at: string;
}

const GoNoGoDashboard: React.FC = () => {
  const [decisions, setDecisions] = useState<GoNoGoDecision[]>([]);
  const [filterDecision, setFilterDecision] = useState('all');
  const [loading, setLoading] = useState(true);

  // Mock data (replace with API call to /api/v1/inztan/go-no-go/analyze)
  useEffect(() => {
    const mockDecisions: GoNoGoDecision[] = [
      {
        id: 1,
        opportunity_id: 1001,
        opportunity_title: 'Cloud Infrastructure Modernization - DoD',
        agency: 'Department of Defense',
        estimated_value: 15000000,
        decision: 'GO',
        overall_score: 85,
        recommendation: 'Strong GO - Excellent strategic fit with proven past performance',
        factors: {
          strategic_fit: 95,
          technical_capability: 90,
          past_performance: 88,
          competition_level: 70,
          resource_availability: 85,
          price_competitiveness: 82
        },
        risk_level: 'Low',
        probability_of_win: 78,
        analyzed_at: '2024-01-15T10:30:00Z'
      },
      {
        id: 2,
        opportunity_id: 1002,
        opportunity_title: 'Cybersecurity Assessment Services',
        agency: 'Department of Homeland Security',
        estimated_value: 5000000,
        decision: 'HOLD',
        overall_score: 62,
        recommendation: 'HOLD - Need to assess resource availability and team teaming options',
        factors: {
          strategic_fit: 80,
          technical_capability: 75,
          past_performance: 60,
          competition_level: 45,
          resource_availability: 50,
          price_competitiveness: 65
        },
        risk_level: 'Medium',
        probability_of_win: 55,
        analyzed_at: '2024-01-14T14:20:00Z'
      },
      {
        id: 3,
        opportunity_id: 1003,
        opportunity_title: 'Legacy System Integration - FAA',
        agency: 'Federal Aviation Administration',
        estimated_value: 8000000,
        decision: 'NO-GO',
        overall_score: 42,
        recommendation: 'NO-GO - Insufficient technical capability and high competition',
        factors: {
          strategic_fit: 55,
          technical_capability: 35,
          past_performance: 40,
          competition_level: 25,
          resource_availability: 60,
          price_competitiveness: 38
        },
        risk_level: 'High',
        probability_of_win: 25,
        analyzed_at: '2024-01-13T09:15:00Z'
      }
    ];

    setTimeout(() => {
      setDecisions(mockDecisions);
      setLoading(false);
    }, 500);
  }, []);

  const filteredDecisions = decisions.filter(dec => 
    filterDecision === 'all' || dec.decision === filterDecision
  );

  const stats = {
    total: decisions.length,
    go: decisions.filter(d => d.decision === 'GO').length,
    no_go: decisions.filter(d => d.decision === 'NO-GO').length,
    hold: decisions.filter(d => d.decision === 'HOLD').length,
    pending: decisions.filter(d => d.decision === 'PENDING').length,
    avg_score: decisions.length > 0 
      ? Math.round(decisions.reduce((sum, d) => sum + d.overall_score, 0) / decisions.length)
      : 0,
    total_value: decisions.reduce((sum, d) => sum + d.estimated_value, 0)
  };

  const getDecisionColor = (decision: string) => {
    switch (decision) {
      case 'GO': return 'bg-green-100 text-green-800 border-green-300';
      case 'NO-GO': return 'bg-red-100 text-red-800 border-red-300';
      case 'HOLD': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'PENDING': return 'bg-gray-100 text-gray-800 border-gray-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getDecisionIcon = (decision: string) => {
    switch (decision) {
      case 'GO': return <ThumbsUp className="w-5 h-5" />;
      case 'NO-GO': return <ThumbsDown className="w-5 h-5" />;
      case 'HOLD': return <Clock className="w-5 h-5" />;
      case 'PENDING': return <Minus className="w-5 h-5" />;
      default: return <Minus className="w-5 h-5" />;
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low': return 'text-green-600';
      case 'Medium': return 'text-yellow-600';
      case 'High': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Go/No-Go Dashboard
          </h1>
          <p className="text-lg text-gray-600">
            AI-powered bid decision support • Make data-driven Go/No-Go decisions
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Total</span>
              <BarChart3 className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
          </div>

          <div className="bg-green-50 rounded-xl shadow-lg p-6 border-2 border-green-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-green-700">GO</span>
              <ThumbsUp className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-green-900">{stats.go}</p>
          </div>

          <div className="bg-red-50 rounded-xl shadow-lg p-6 border-2 border-red-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-red-700">NO-GO</span>
              <ThumbsDown className="w-5 h-5 text-red-600" />
            </div>
            <p className="text-3xl font-bold text-red-900">{stats.no_go}</p>
          </div>

          <div className="bg-yellow-50 rounded-xl shadow-lg p-6 border-2 border-yellow-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-yellow-700">HOLD</span>
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <p className="text-3xl font-bold text-yellow-900">{stats.hold}</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Avg Score</span>
              <TrendingUp className="w-5 h-5 text-indigo-600" />
            </div>
            <p className="text-3xl font-bold text-indigo-600">{stats.avg_score}</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Total Value</span>
              <DollarSign className="w-5 h-5 text-yellow-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              ${(stats.total_value / 1000000).toFixed(1)}M
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex gap-4">
              <Link
                to="/opportunities"
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg"
              >
                <Upload className="w-5 h-5" />
                Analyze New Opportunity
              </Link>
            </div>

            <select
              value={filterDecision}
              onChange={(e) => setFilterDecision(e.target.value)}
              className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Decisions</option>
              <option value="GO">GO</option>
              <option value="NO-GO">NO-GO</option>
              <option value="HOLD">HOLD</option>
              <option value="PENDING">PENDING</option>
            </select>
          </div>
        </div>

        {/* Decisions List */}
        <div className="space-y-6">
          {loading ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading decisions...</p>
            </div>
          ) : filteredDecisions.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <Target className="w-20 h-20 text-gray-300 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No Decisions Yet</h3>
              <p className="text-gray-600 mb-6">
                Start analyzing opportunities to make data-driven Go/No-Go decisions
              </p>
              <Link
                to="/opportunities"
                className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
              >
                Analyze Opportunity
              </Link>
            </div>
          ) : (
            filteredDecisions.map((decision) => (
              <div
                key={decision.id}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-2xl font-bold text-gray-900">
                        {decision.opportunity_title}
                      </h3>
                      <span className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 border-2 ${getDecisionColor(decision.decision)}`}>
                        {getDecisionIcon(decision.decision)}
                        {decision.decision}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{decision.agency}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        <span className="font-semibold">
                          ${(decision.estimated_value / 1000000).toFixed(1)}M
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        <span className={`font-semibold ${getRiskColor(decision.risk_level)}`}>
                          {decision.risk_level} Risk
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Award className="w-4 h-4" />
                        <span>P-Win: {decision.probability_of_win}%</span>
                      </div>
                    </div>

                    <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                      <strong>Recommendation:</strong> {decision.recommendation}
                    </p>
                  </div>

                  <div className="text-right ml-6">
                    <p className="text-sm text-gray-600 mb-1">Overall Score</p>
                    <p className="text-5xl font-bold text-indigo-600">{decision.overall_score}</p>
                    <div className="mt-2 w-24 bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-indigo-600 h-3 rounded-full"
                        style={{ width: `${decision.overall_score}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Factor Scores */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                  {Object.entries(decision.factors).map(([factor, score]) => (
                    <div key={factor} className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600 mb-1 capitalize">
                        {factor.replace(/_/g, ' ')}
                      </p>
                      <div className="flex items-center gap-2">
                        <p className="text-lg font-bold text-gray-900">{score}</p>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              score >= 80 ? 'bg-green-500' :
                              score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${score}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <Link
                    to={`/opportunities/${decision.opportunity_id}`}
                    className="flex-1 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors text-center"
                  >
                    View Opportunity
                  </Link>
                  <button className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors">
                    Re-Analyze
                  </button>
                  <button className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors">
                    Export Report
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default GoNoGoDashboard;

