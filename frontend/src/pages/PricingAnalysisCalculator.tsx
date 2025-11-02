/**
 * Pricing Analysis Calculator - Comprehensive Cost Modeling Tool
 * Calculates labor mix, cost factors, and provides competitive analysis for government contracts
 */

import { useState } from 'react';
import {
  Calculator,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Target,
  BarChart3,
  FileText,
  Settings,
  Loader2,
  Activity,
  CheckCircle,
  XCircle,
  Info,
  Plus,
  Trash2
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface LaborMixItem {
  id: string;
  position: string;
  level: string;
  hours: number;
  rate: number;
}

interface PricingSettings {
  contractType: string;
  periodOfPerformance: number;
  escalationRate: number;
  feePercentage: number;
  fringeRate: number;
  overheadRate: number;
  gandaRate: number;
}

interface PricingFlag {
  type: 'error' | 'warning' | 'info';
  icon: any;
  title: string;
  message: string;
  recommendation: string;
}

export default function PricingAnalysisCalculator() {
  const [laborMix, setLaborMix] = useState<LaborMixItem[]>([
    { id: '1', position: 'Project Manager', level: 'Senior', hours: 520, rate: 150 },
    { id: '2', position: 'Senior Developer', level: 'Senior', hours: 1040, rate: 125 },
    { id: '3', position: 'Developer', level: 'Mid', hours: 1560, rate: 95 },
    { id: '4', position: 'Business Analyst', level: 'Mid', hours: 520, rate: 110 }
  ]);

  const [settings, setSettings] = useState<PricingSettings>({
    contractType: 'FFP',
    periodOfPerformance: 3,
    escalationRate: 3,
    feePercentage: 8,
    fringeRate: 28,
    overheadRate: 15,
    gandaRate: 12
  });

  const [activeTab, setActiveTab] = useState<'labor' | 'settings' | 'analysis' | 'results'>('labor');
  const [calculating, setCalculating] = useState(false);

  const laborPositions = [
    'Project Manager',
    'Program Manager',
    'Technical Lead',
    'Senior Developer',
    'Developer',
    'Business Analyst',
    'Systems Analyst',
    'Quality Assurance',
    'DevOps Engineer',
    'Security Specialist',
    'Data Scientist',
    'UX Designer',
    'Technical Writer',
    'Training Specialist',
    'Subject Matter Expert'
  ];

  const laborLevels = ['Junior', 'Mid', 'Senior', 'Principal', 'Executive'];

  const contractTypes = [
    { value: 'FFP', label: 'Fixed Price (FFP)' },
    { value: 'T&M', label: 'Time & Materials (T&M)' },
    { value: 'CPFF', label: 'Cost Plus Fixed Fee (CPFF)' },
    { value: 'CPIF', label: 'Cost Plus Incentive Fee (CPIF)' }
  ];

  // Calculate real-time totals
  const calculateTotals = () => {
    const totalHours = laborMix.reduce((sum, item) => sum + (item.hours || 0), 0);
    const totalLaborCost = laborMix.reduce((sum, item) => sum + ((item.rate || 0) * (item.hours || 0)), 0);
    const withFringe = totalLaborCost * (1 + settings.fringeRate / 100);
    const withOverhead = withFringe * (1 + settings.overheadRate / 100);
    const withGanda = withOverhead * (1 + settings.gandaRate / 100);
    const withFee = withGanda * (1 + settings.feePercentage / 100);

    return {
      totalHours,
      totalLaborCost,
      withFringe,
      withOverhead,
      withGanda,
      withFee
    };
  };

  const totals = calculateTotals();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const addLaborLine = () => {
    setLaborMix([
      ...laborMix,
      { id: Date.now().toString(), position: '', level: 'Mid', hours: 0, rate: 0 }
    ]);
  };

  const updateLaborMix = (id: string, field: keyof LaborMixItem, value: string | number) => {
    setLaborMix(laborMix.map(item => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const removeLaborLine = (id: string) => {
    setLaborMix(laborMix.filter(item => item.id !== id));
  };

  const updateSettings = (field: keyof PricingSettings, value: string | number) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const calculateCompetitivenessScore = () => {
    let score = 100;

    if (settings.feePercentage > 10) score -= 15;
    else if (settings.feePercentage < 5) score -= 10;

    if (settings.overheadRate > 25) score -= 20;
    else if (settings.overheadRate < 10) score -= 5;

    const avgRate = laborMix.reduce((sum, item) => sum + item.rate, 0) / (laborMix.length || 1);
    if (avgRate > 150) score -= 10;

    if (settings.gandaRate > 15) score -= 10;

    return Math.max(0, Math.min(100, score));
  };

  const generatePricingFlags = (): PricingFlag[] => {
    const flags: PricingFlag[] = [];

    if (settings.feePercentage > 10) {
      flags.push({
        type: 'error',
        icon: XCircle,
        title: 'High Fee Percentage',
        message: `Fee percentage of ${settings.feePercentage}% exceeds typical 8-10% range for government contracts`,
        recommendation: 'Consider reducing fee to 8-10% to improve competitiveness'
      });
    } else if (settings.feePercentage < 5) {
      flags.push({
        type: 'warning',
        icon: AlertTriangle,
        title: 'Low Fee Percentage',
        message: `Fee percentage of ${settings.feePercentage}% may be too low to cover overhead and profit`,
        recommendation: 'Consider increasing fee to at least 6-8%'
      });
    }

    if (settings.overheadRate > 25) {
      flags.push({
        type: 'error',
        icon: XCircle,
        title: 'High Overhead Rate',
        message: `Overhead rate of ${settings.overheadRate}% is above industry average of 15-20%`,
        recommendation: 'Review overhead allocation and consider cost reduction strategies'
      });
    }

    const highRates = laborMix.filter(item => item.rate > 200);
    if (highRates.length > 0) {
      flags.push({
        type: 'warning',
        icon: AlertTriangle,
        title: 'High Labor Rates',
        message: `${highRates.length} position(s) exceed $200/hour rate`,
        recommendation: 'Verify rates against market data and government wage determinations'
      });
    }

    if (settings.gandaRate > 15) {
      flags.push({
        type: 'warning',
        icon: AlertTriangle,
        title: 'High G&A Rate',
        message: `G&A rate of ${settings.gandaRate}% exceeds typical 10-12% range`,
        recommendation: 'Review G&A allocation methodology'
      });
    }

    if (settings.fringeRate < 25) {
      flags.push({
        type: 'info',
        icon: Info,
        title: 'Low Fringe Rate',
        message: `Fringe rate of ${settings.fringeRate}% is below typical 28-35% range`,
        recommendation: 'Ensure all employee benefits are included in fringe calculation'
      });
    }

    if (laborMix.length === 0) {
      flags.push({
        type: 'error',
        icon: XCircle,
        title: 'No Labor Categories',
        message: 'No labor categories have been defined',
        recommendation: 'Add labor categories to complete the pricing model'
      });
    }

    return flags;
  };

  const calculatePricing = async () => {
    setCalculating(true);
    // Simulate calculation time
    await new Promise(resolve => setTimeout(resolve, 1500));
    setCalculating(false);
    setActiveTab('results');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Pricing Analysis Calculator</h1>
            <p className="text-gray-600 mt-2">
              Comprehensive cost modeling and competitive pricing analysis for government contracts
            </p>
          </div>
          <div className="flex items-center gap-2 bg-indigo-100 text-indigo-800 px-4 py-2 rounded-full font-semibold">
            <Calculator className="h-5 w-5" />
            AI-Powered Pricing
          </div>
        </div>

        {/* Real-time Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{totals.totalHours.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Total Hours</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totals.totalLaborCost)}</div>
            <div className="text-sm text-gray-600">Base Labor</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{formatCurrency(totals.withFringe)}</div>
            <div className="text-sm text-gray-600">With Fringe</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{formatCurrency(totals.withFee)}</div>
            <div className="text-sm text-gray-600">Final Price</div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="flex gap-2 bg-white rounded-xl p-2 shadow-lg border">
          <button
            onClick={() => setActiveTab('labor')}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'labor'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Target className="h-5 w-5" />
            Labor Mix
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'settings'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Settings className="h-5 w-5" />
            Settings
          </button>
          <button
            onClick={() => setActiveTab('analysis')}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'analysis'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <BarChart3 className="h-5 w-5" />
            Analysis
          </button>
          <button
            onClick={() => setActiveTab('results')}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'results'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <FileText className="h-5 w-5" />
            Results
          </button>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          {/* Labor Mix Tab */}
          {activeTab === 'labor' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Target className="h-6 w-6 text-blue-600" />
                    Labor Mix Configuration
                  </h2>
                  <p className="text-gray-600 mt-1">Define labor categories, hours, rates, and skill levels</p>
                </div>
                <button
                  onClick={addLaborLine}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Labor Line
                </button>
              </div>

              {laborMix.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Target className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p>No labor categories added yet. Click "Add Labor Line" to get started.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Header Row */}
                  <div className="grid grid-cols-12 gap-3 items-center text-sm font-semibold text-gray-700 px-4">
                    <div className="col-span-3">Position</div>
                    <div className="col-span-2">Level</div>
                    <div className="col-span-2">Hours</div>
                    <div className="col-span-2">Rate ($)</div>
                    <div className="col-span-2">Total</div>
                    <div className="col-span-1"></div>
                  </div>

                  {laborMix.map(item => (
                    <div
                      key={item.id}
                      className="grid grid-cols-12 gap-3 items-center border-2 border-gray-200 rounded-lg p-3 hover:border-blue-300 transition-colors"
                    >
                      <div className="col-span-3">
                        <select
                          value={item.position}
                          onChange={e => updateLaborMix(item.id, 'position', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select position</option>
                          {laborPositions.map(pos => (
                            <option key={pos} value={pos}>
                              {pos}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-2">
                        <select
                          value={item.level}
                          onChange={e => updateLaborMix(item.id, 'level', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {laborLevels.map(level => (
                            <option key={level} value={level}>
                              {level}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          value={item.hours}
                          onChange={e => updateLaborMix(item.id, 'hours', Number(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Hours"
                          min="0"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          value={item.rate}
                          onChange={e => updateLaborMix(item.id, 'rate', Number(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Rate"
                          min="0"
                        />
                      </div>
                      <div className="col-span-2">
                        <div className="px-3 py-2 bg-green-50 rounded-lg font-semibold text-green-700">
                          {formatCurrency((item.hours || 0) * (item.rate || 0))}
                        </div>
                      </div>
                      <div className="col-span-1 flex justify-center">
                        <button
                          onClick={() => removeLaborLine(item.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-6">
                  <Settings className="h-6 w-6 text-blue-600" />
                  Contract Settings & Cost Factors
                </h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Contract Settings */}
                <div className="space-y-6 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border-2 border-blue-200">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Settings className="h-5 w-5 text-blue-600" />
                    Contract Settings
                  </h3>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Contract Type</label>
                    <select
                      value={settings.contractType}
                      onChange={e => updateSettings('contractType', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {contractTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Period of Performance (Years)
                    </label>
                    <input
                      type="number"
                      value={settings.periodOfPerformance}
                      onChange={e => updateSettings('periodOfPerformance', Number(e.target.value))}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="1"
                      max="10"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Annual Escalation Rate (%)
                    </label>
                    <input
                      type="number"
                      value={settings.escalationRate}
                      onChange={e => updateSettings('escalationRate', Number(e.target.value))}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      step="0.1"
                      min="0"
                    />
                  </div>
                </div>

                {/* Cost Factors */}
                <div className="space-y-6 bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border-2 border-green-200">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    Cost Factors
                  </h3>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Fringe Benefits (%)</label>
                    <input
                      type="number"
                      value={settings.fringeRate}
                      onChange={e => updateSettings('fringeRate', Number(e.target.value))}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      step="0.1"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Overhead Rate (%)</label>
                    <input
                      type="number"
                      value={settings.overheadRate}
                      onChange={e => updateSettings('overheadRate', Number(e.target.value))}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      step="0.1"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">G&A Rate (%)</label>
                    <input
                      type="number"
                      value={settings.gandaRate}
                      onChange={e => updateSettings('gandaRate', Number(e.target.value))}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      step="0.1"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Fee Percentage (%)</label>
                    <input
                      type="number"
                      value={settings.feePercentage}
                      onChange={e => updateSettings('feePercentage', Number(e.target.value))}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      step="0.1"
                      min="0"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Analysis Tab */}
          {activeTab === 'analysis' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-6">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                  Pricing Analysis & Competitive Intelligence
                </h2>
              </div>

              {/* Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border-2 border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-800">Competitiveness Score</p>
                      <p className="text-3xl font-bold text-blue-600">{calculateCompetitivenessScore()}/100</p>
                    </div>
                    <Activity className="h-10 w-10 text-blue-500" />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border-2 border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-800">Total Labor Hours</p>
                      <p className="text-3xl font-bold text-green-600">{totals.totalHours.toLocaleString()}</p>
                    </div>
                    <Target className="h-10 w-10 text-green-500" />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border-2 border-purple-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-800">Average Rate</p>
                      <p className="text-3xl font-bold text-purple-600">
                        $
                        {laborMix.length > 0
                          ? (laborMix.reduce((sum, item) => sum + item.rate, 0) / laborMix.length).toFixed(0)
                          : 0}
                        /hr
                      </p>
                    </div>
                    <TrendingUp className="h-10 w-10 text-purple-500" />
                  </div>
                </div>
              </div>

              {/* Cost Breakdown Analysis */}
              <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
                  <DollarSign className="h-5 w-5 text-blue-600" />
                  Cost Breakdown Analysis
                </h3>
                <p className="text-gray-600 mb-6">Visual breakdown of total contract cost by category</p>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                    <div className="w-4 h-4 bg-blue-600 rounded-full mx-auto mb-2"></div>
                    <div className="text-sm font-semibold text-gray-700">Base Labor</div>
                    <div className="text-lg font-bold text-blue-600">{formatCurrency(totals.totalLaborCost)}</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg border-2 border-green-200">
                    <div className="w-4 h-4 bg-green-600 rounded-full mx-auto mb-2"></div>
                    <div className="text-sm font-semibold text-gray-700">Fringe</div>
                    <div className="text-lg font-bold text-green-600">
                      {formatCurrency(totals.withFringe - totals.totalLaborCost)}
                    </div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg border-2 border-yellow-200">
                    <div className="w-4 h-4 bg-yellow-600 rounded-full mx-auto mb-2"></div>
                    <div className="text-sm font-semibold text-gray-700">Overhead</div>
                    <div className="text-lg font-bold text-yellow-600">
                      {formatCurrency(totals.withOverhead - totals.withFringe)}
                    </div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg border-2 border-purple-200">
                    <div className="w-4 h-4 bg-purple-600 rounded-full mx-auto mb-2"></div>
                    <div className="text-sm font-semibold text-gray-700">G&A</div>
                    <div className="text-lg font-bold text-purple-600">
                      {formatCurrency(totals.withGanda - totals.withOverhead)}
                    </div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg border-2 border-red-200">
                    <div className="w-4 h-4 bg-red-600 rounded-full mx-auto mb-2"></div>
                    <div className="text-sm font-semibold text-gray-700">Fee</div>
                    <div className="text-lg font-bold text-red-600">
                      {formatCurrency(totals.withFee - totals.withGanda)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Labor Mix Analysis */}
              <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
                  <BarChart3 className="h-5 w-5 text-green-600" />
                  Labor Mix Analysis
                </h3>
                <p className="text-gray-600 mb-6">Cost distribution across labor categories</p>

                <div className="space-y-3">
                  {laborMix.map(item => {
                    const cost = item.hours * item.rate;
                    const percentage = totals.totalLaborCost > 0 ? (cost / totals.totalLaborCost) * 100 : 0;
                    return (
                      <div key={item.id} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium text-gray-700">
                            {item.position} ({item.level})
                          </span>
                          <span className="font-semibold text-blue-600">{formatCurrency(cost)}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Pricing Flags and Recommendations */}
              <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  Pricing Analysis & Recommendations
                </h3>
                <p className="text-gray-600 mb-6">
                  Intelligent analysis of your pricing model with actionable recommendations
                </p>

                <div className="space-y-4">
                  {generatePricingFlags().length > 0 ? (
                    generatePricingFlags().map((flag, index) => {
                      const IconComponent = flag.icon;
                      return (
                        <div
                          key={index}
                          className={`p-4 rounded-lg border-l-4 ${
                            flag.type === 'error'
                              ? 'border-red-500 bg-red-50'
                              : flag.type === 'warning'
                              ? 'border-yellow-500 bg-yellow-50'
                              : 'border-blue-500 bg-blue-50'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <IconComponent
                              className={`h-5 w-5 mt-0.5 ${
                                flag.type === 'error'
                                  ? 'text-red-500'
                                  : flag.type === 'warning'
                                  ? 'text-yellow-500'
                                  : 'text-blue-500'
                              }`}
                            />
                            <div className="flex-1">
                              <h4
                                className={`font-semibold ${
                                  flag.type === 'error'
                                    ? 'text-red-800'
                                    : flag.type === 'warning'
                                    ? 'text-yellow-800'
                                    : 'text-blue-800'
                                }`}
                              >
                                {flag.title}
                              </h4>
                              <p
                                className={`text-sm mt-1 ${
                                  flag.type === 'error'
                                    ? 'text-red-700'
                                    : flag.type === 'warning'
                                    ? 'text-yellow-700'
                                    : 'text-blue-700'
                                }`}
                              >
                                {flag.message}
                              </p>
                              <p
                                className={`text-sm mt-2 font-medium ${
                                  flag.type === 'error'
                                    ? 'text-red-800'
                                    : flag.type === 'warning'
                                    ? 'text-yellow-800'
                                    : 'text-blue-800'
                                }`}
                              >
                                💡 Recommendation: {flag.recommendation}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8">
                      <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Excellent Pricing Model!</h3>
                      <p className="text-gray-600">
                        No major pricing issues detected. Your model appears competitive and well-structured.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Market Comparison */}
              <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  Market Comparison Analysis
                </h3>
                <p className="text-gray-600 mb-6">How your pricing compares to industry benchmarks</p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center p-4 border-2 border-gray-200 rounded-lg">
                    <div className="text-sm text-gray-600">Fee Rate</div>
                    <div className="text-2xl font-bold text-blue-600">{settings.feePercentage}%</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {settings.feePercentage <= 10 ? '✅ Competitive' : '⚠️ Above average'}
                    </div>
                  </div>

                  <div className="text-center p-4 border-2 border-gray-200 rounded-lg">
                    <div className="text-sm text-gray-600">Overhead Rate</div>
                    <div className="text-2xl font-bold text-green-600">{settings.overheadRate}%</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {settings.overheadRate <= 20 ? '✅ Competitive' : '⚠️ Above average'}
                    </div>
                  </div>

                  <div className="text-center p-4 border-2 border-gray-200 rounded-lg">
                    <div className="text-sm text-gray-600">G&A Rate</div>
                    <div className="text-2xl font-bold text-purple-600">{settings.gandaRate}%</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {settings.gandaRate <= 12 ? '✅ Competitive' : '⚠️ Above average'}
                    </div>
                  </div>

                  <div className="text-center p-4 border-2 border-gray-200 rounded-lg">
                    <div className="text-sm text-gray-600">Fringe Rate</div>
                    <div className="text-2xl font-bold text-orange-600">{settings.fringeRate}%</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {settings.fringeRate >= 25 ? '✅ Competitive' : '⚠️ Below average'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Results Tab */}
          {activeTab === 'results' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-6">
                  <FileText className="h-6 w-6 text-blue-600" />
                  Comprehensive Pricing Results
                </h2>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-8 border-2 border-green-200">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Total Contract Value</p>
                  <p className="text-5xl font-bold text-green-600 mb-4">{formatCurrency(totals.withFee)}</p>
                  <p className="text-gray-600">
                    Over {settings.periodOfPerformance} year{settings.periodOfPerformance > 1 ? 's' : ''} with{' '}
                    {settings.escalationRate}% annual escalation
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl p-6 border-2 border-blue-200">
                  <p className="text-sm text-gray-600">Base Period</p>
                  <p className="text-2xl font-bold text-blue-600">{formatCurrency(totals.withFee / settings.periodOfPerformance)}</p>
                  <p className="text-xs text-gray-500 mt-1">Year 1 pricing</p>
                </div>
                <div className="bg-white rounded-xl p-6 border-2 border-purple-200">
                  <p className="text-sm text-gray-600">Average Hourly</p>
                  <p className="text-2xl font-bold text-purple-600">
                    ${totals.totalHours > 0 ? (totals.withFee / totals.totalHours).toFixed(2) : '0'}/hr
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Fully loaded rate</p>
                </div>
                <div className="bg-white rounded-xl p-6 border-2 border-orange-200">
                  <p className="text-sm text-gray-600">Effective Multiplier</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {totals.totalLaborCost > 0 ? (totals.withFee / totals.totalLaborCost).toFixed(2) : '0'}x
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Total markup factor</p>
                </div>
              </div>

              <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Cost Summary Breakdown</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="font-medium text-gray-700">Base Labor Cost</span>
                    <span className="font-bold text-blue-600">{formatCurrency(totals.totalLaborCost)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="font-medium text-gray-700">+ Fringe Benefits ({settings.fringeRate}%)</span>
                    <span className="font-bold text-green-600">
                      {formatCurrency(totals.withFringe - totals.totalLaborCost)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                    <span className="font-medium text-gray-700">+ Overhead ({settings.overheadRate}%)</span>
                    <span className="font-bold text-yellow-600">
                      {formatCurrency(totals.withOverhead - totals.withFringe)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                    <span className="font-medium text-gray-700">+ G&A ({settings.gandaRate}%)</span>
                    <span className="font-bold text-purple-600">
                      {formatCurrency(totals.withGanda - totals.withOverhead)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                    <span className="font-medium text-gray-700">+ Fee ({settings.feePercentage}%)</span>
                    <span className="font-bold text-red-600">{formatCurrency(totals.withFee - totals.withGanda)}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg border-2 border-green-300">
                    <span className="font-bold text-gray-900 text-lg">Total Contract Price</span>
                    <span className="font-bold text-green-700 text-2xl">{formatCurrency(totals.withFee)}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-center pt-4">
                <button
                  onClick={() => window.print()}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <FileText className="h-5 w-5" />
                  Export Pricing Summary
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Calculate Button - Always Visible */}
        <div className="flex justify-center">
          <button
            onClick={calculatePricing}
            disabled={calculating || laborMix.length === 0}
            className="px-12 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl font-bold text-lg hover:from-indigo-700 hover:to-blue-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
          >
            {calculating ? (
              <>
                <Loader2 className="h-6 w-6 animate-spin" />
                Calculating Pricing Analysis...
              </>
            ) : (
              <>
                <Calculator className="h-6 w-6" />
                Calculate Complete Pricing Analysis
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

