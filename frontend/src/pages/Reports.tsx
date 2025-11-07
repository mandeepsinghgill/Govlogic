/**
 * Advanced Reporting Dashboard - GovSure
 * Analytics, KPIs, Win/Loss tracking, Pipeline metrics
 * Executive dashboards and custom reports
 */

import React, { useState } from 'react';
import {
  BarChart3, TrendingUp, DollarSign, Award, Target, Users,
  Calendar, Download, Filter, PieChart, Activity, FileText
} from 'lucide-react';

interface ReportMetrics {
  total_opportunities: number;
  total_proposals: number;
  total_grants: number;
  win_rate: number;
  total_pipeline_value: number;
  active_captures: number;
  avg_proposal_score: number;
  avg_days_to_submit: number;
}

const Reports: React.FC = () => {
  const [timeRange, setTimeRange] = useState('90d');
  const [reportType, setReportType] = useState('overview');

  // Mock metrics (replace with API call)
  const metrics: ReportMetrics = {
    total_opportunities: 127,
    total_proposals: 43,
    total_grants: 18,
    win_rate: 32.5,
    total_pipeline_value: 45000000,
    active_captures: 12,
    avg_proposal_score: 87,
    avg_days_to_submit: 18
  };

  const winLossData = [
    { month: 'Jan', wins: 3, losses: 5, pipeline: 8 },
    { month: 'Feb', wins: 4, losses: 6, pipeline: 9 },
    { month: 'Mar', wins: 5, losses: 4, pipeline: 12 },
    { month: 'Apr', wins: 6, losses: 3, pipeline: 15 },
    { month: 'May', wins: 7, losses: 5, pipeline: 11 },
    { month: 'Jun', wins: 8, losses: 4, pipeline: 14 }
  ];

  const topOpportunities = [
    { title: 'Cloud Infrastructure - DoD', value: 15000000, probability: 78, status: 'Proposal' },
    { title: 'Cybersecurity Services - DHS', value: 8000000, probability: 65, status: 'Capture' },
    { title: 'Healthcare IT - VA', value: 6500000, probability: 72, status: 'Proposal' },
    { title: 'Data Analytics - DoE', value: 4200000, probability: 58, status: 'Go/No-Go' }
  ];

  const agencyBreakdown = [
    { agency: 'Department of Defense', count: 45, value: 18500000 },
    { agency: 'Department of Homeland Security', count: 28, value: 12300000 },
    { agency: 'Veterans Affairs', count: 22, value: 8700000 },
    { agency: 'Department of Energy', count: 18, value: 5500000 },
    { agency: 'Other Federal', count: 14, value: 3000000 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Advanced Reports & Analytics
              </h1>
              <p className="text-lg text-gray-600">
                Track performance, analyze trends, and optimize your pipeline
              </p>
            </div>
            
            <div className="flex gap-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
                <option value="6m">Last 6 Months</option>
                <option value="1y">Last Year</option>
                <option value="all">All Time</option>
              </select>

              <button className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors">
                <Download className="w-5 h-5" />
                Export Report
              </button>
            </div>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-indigo-500">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Win Rate</span>
              <Award className="w-5 h-5 text-indigo-600" />
            </div>
            <p className="text-3xl font-bold text-indigo-600">{metrics.win_rate}%</p>
            <p className="text-xs text-gray-500 mt-1">↑ 5.2% from last period</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Pipeline Value</span>
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-green-600">
              ${(metrics.total_pipeline_value / 1000000).toFixed(1)}M
            </p>
            <p className="text-xs text-gray-500 mt-1">↑ $2.3M from last period</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Avg Proposal Score</span>
              <BarChart3 className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-blue-600">{metrics.avg_proposal_score}</p>
            <p className="text-xs text-gray-500 mt-1">↑ 3 points from last period</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Active Captures</span>
              <Target className="w-5 h-5 text-yellow-600" />
            </div>
            <p className="text-3xl font-bold text-yellow-600">{metrics.active_captures}</p>
            <p className="text-xs text-gray-500 mt-1">↑ 2 from last period</p>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Win/Loss Trend */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              Win/Loss Trend
            </h3>
            <div className="space-y-3">
              {winLossData.map((data) => (
                <div key={data.month} className="flex items-center gap-4">
                  <span className="text-sm font-semibold text-gray-700 w-12">{data.month}</span>
                  <div className="flex-1 flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-8 relative overflow-hidden">
                      <div
                        className="absolute left-0 top-0 h-full bg-green-500 flex items-center justify-end pr-2"
                        style={{ width: `${(data.wins / (data.wins + data.losses)) * 100}%` }}
                      >
                        <span className="text-xs font-bold text-white">{data.wins}W</span>
                      </div>
                      <div
                        className="absolute right-0 top-0 h-full bg-red-500 flex items-center justify-start pl-2"
                        style={{ width: `${(data.losses / (data.wins + data.losses)) * 100}%` }}
                      >
                        <span className="text-xs font-bold text-white">{data.losses}L</span>
                      </div>
                    </div>
                    <span className="text-sm text-gray-600 w-16">{data.pipeline} active</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Agency Breakdown */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-indigo-600" />
              Agency Breakdown
            </h3>
            <div className="space-y-3">
              {agencyBreakdown.map((agency, idx) => (
                <div key={agency.agency}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-gray-700">{agency.agency}</span>
                    <span className="text-sm text-gray-600">
                      ${(agency.value / 1000000).toFixed(1)}M
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full ${
                        idx === 0 ? 'bg-indigo-600' :
                        idx === 1 ? 'bg-blue-600' :
                        idx === 2 ? 'bg-purple-600' :
                        idx === 3 ? 'bg-green-600' : 'bg-gray-600'
                      }`}
                      style={{ width: `${(agency.count / metrics.total_opportunities) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{agency.count} opportunities</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Opportunities */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-600" />
            Top Opportunities by Value
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Opportunity</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Value</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">P-Win</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {topOpportunities.map((opp, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{opp.title}</td>
                    <td className="px-6 py-4 text-sm text-gray-700 font-semibold">
                      ${(opp.value / 1000000).toFixed(1)}M
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-indigo-600 h-2 rounded-full"
                            style={{ width: `${opp.probability}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-gray-700">{opp.probability}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                        {opp.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h4 className="text-sm font-semibold text-gray-600 mb-3">Activity Summary</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-700">Total Opportunities</span>
                <span className="text-sm font-bold text-gray-900">{metrics.total_opportunities}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-700">Total Proposals</span>
                <span className="text-sm font-bold text-gray-900">{metrics.total_proposals}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-700">Total Grants</span>
                <span className="text-sm font-bold text-gray-900">{metrics.total_grants}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h4 className="text-sm font-semibold text-gray-600 mb-3">Performance Metrics</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-700">Win Rate</span>
                <span className="text-sm font-bold text-green-600">{metrics.win_rate}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-700">Avg Proposal Score</span>
                <span className="text-sm font-bold text-blue-600">{metrics.avg_proposal_score}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-700">Avg Days to Submit</span>
                <span className="text-sm font-bold text-gray-900">{metrics.avg_days_to_submit}</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg p-6 text-white">
            <h4 className="text-sm font-semibold mb-3">Custom Reports</h4>
            <p className="text-sm mb-4">Generate detailed reports for executives and stakeholders</p>
            <button className="w-full py-2 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2">
              <FileText className="w-4 h-4" />
              Create Custom Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;

