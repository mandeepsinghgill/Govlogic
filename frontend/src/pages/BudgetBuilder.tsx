/**
 * Budget Builder Tool - Create Compliant Grant Budgets
 * Build SF-424A budgets with automatic calculations
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft, DollarSign, Plus, Trash2, Save, Download,
  Calculator, CheckCircle, AlertCircle, Loader
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface BudgetItem {
  id: string;
  category: string;
  description: string;
  quantity: number;
  rate: number;
  federal: number;
  nonfederal: number;
}

interface BudgetData {
  personnel: BudgetItem[];
  fringe: BudgetItem[];
  travel: BudgetItem[];
  equipment: BudgetItem[];
  supplies: BudgetItem[];
  contractual: BudgetItem[];
  other: BudgetItem[];
  indirect_cost_rate: number;
  indirect_cost_base: number;
  budget_narrative: string;
}

export default function BudgetBuilder() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const grantId = searchParams.get('grant');
  
  const [budget, setBudget] = useState<BudgetData>({
    personnel: [],
    fringe: [],
    travel: [],
    equipment: [],
    supplies: [],
    contractual: [],
    other: [],
    indirect_cost_rate: 0,
    indirect_cost_base: 0,
    budget_narrative: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (grantId) {
      loadBudgetData();
    }
  }, [grantId]);

  const loadBudgetData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
      
      const response = await fetch(`${API_URL}/api/v1/grants/${grantId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const grant = await response.json();
        if (grant.sf424a_budget) {
          setBudget(grant.sf424a_budget);
        }
      }
    } catch (err) {
      console.error('Error loading budget:', err);
    } finally {
      setLoading(false);
    }
  };

  const addItem = (category: keyof Omit<BudgetData, 'indirect_cost_rate' | 'indirect_cost_base' | 'budget_narrative'>) => {
    const newItem: BudgetItem = {
      id: `${category}-${Date.now()}`,
      category,
      description: '',
      quantity: 1,
      rate: 0,
      federal: 0,
      nonfederal: 0
    };
    
    setBudget(prev => ({
      ...prev,
      [category]: [...prev[category], newItem]
    }));
  };

  const removeItem = (category: keyof Omit<BudgetData, 'indirect_cost_rate' | 'indirect_cost_base' | 'budget_narrative'>, itemId: string) => {
    setBudget(prev => ({
      ...prev,
      [category]: prev[category].filter(item => item.id !== itemId)
    }));
  };

  const updateItem = (
    category: keyof Omit<BudgetData, 'indirect_cost_rate' | 'indirect_cost_base' | 'budget_narrative'>,
    itemId: string,
    field: keyof BudgetItem,
    value: any
  ) => {
    setBudget(prev => ({
      ...prev,
      [category]: prev[category].map(item => {
        if (item.id === itemId) {
          const updated = { ...item, [field]: value };
          
          // Auto-calculate total if quantity or rate changes
          if (field === 'quantity' || field === 'rate') {
            const total = updated.quantity * updated.rate;
            updated.federal = total;
            updated.nonfederal = 0;
          }
          
          return updated;
        }
        return item;
      })
    }));
  };

  const calculateCategoryTotal = (category: keyof Omit<BudgetData, 'indirect_cost_rate' | 'indirect_cost_base' | 'budget_narrative'>) => {
    return budget[category].reduce((sum, item) => sum + item.federal + item.nonfederal, 0);
  };

  const calculateDirectCosts = () => {
    let total = 0;
    const categories: Array<keyof Omit<BudgetData, 'indirect_cost_rate' | 'indirect_cost_base' | 'budget_narrative'>> = [
      'personnel', 'fringe', 'travel', 'equipment', 'supplies', 'contractual', 'other'
    ];
    
    categories.forEach(cat => {
      total += calculateCategoryTotal(cat);
    });
    
    return total;
  };

  const calculateIndirectCosts = () => {
    const base = budget.indirect_cost_base || calculateDirectCosts();
    return base * (budget.indirect_cost_rate / 100);
  };

  const calculateTotalCosts = () => {
    return calculateDirectCosts() + calculateIndirectCosts();
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      
      const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
      
      if (!grantId) {
        setError('No grant selected');
        return;
      }
      
      const response = await fetch(`${API_URL}/api/v1/grants/${grantId}/budget`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(budget)
      });
      
      if (!response.ok) {
        throw new Error('Failed to save budget');
      }
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save budget');
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadExcel = () => {
    alert('Excel export will be implemented with proper SF-424A formatting');
  };

  const renderBudgetCategory = (
    title: string,
    category: keyof Omit<BudgetData, 'indirect_cost_rate' | 'indirect_cost_base' | 'budget_narrative'>
  ) => (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        <button
          onClick={() => addItem(category)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Item
        </button>
      </div>
      
      {budget[category].length === 0 ? (
        <p className="text-gray-500 italic text-center py-8">No items added yet</p>
      ) : (
        <div className="space-y-3">
          {budget[category].map((item) => (
            <div key={item.id} className="grid grid-cols-12 gap-3 items-center border-2 border-gray-200 rounded-lg p-3">
              <div className="col-span-3">
                <input
                  type="text"
                  placeholder="Description"
                  value={item.description}
                  onChange={(e) => updateItem(category, item.id, 'description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="col-span-2">
                <input
                  type="number"
                  placeholder="Qty"
                  value={item.quantity}
                  onChange={(e) => updateItem(category, item.id, 'quantity', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="col-span-2">
                <input
                  type="number"
                  placeholder="Rate"
                  value={item.rate}
                  onChange={(e) => updateItem(category, item.id, 'rate', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="col-span-2">
                <input
                  type="number"
                  placeholder="Federal"
                  value={item.federal}
                  onChange={(e) => updateItem(category, item.id, 'federal', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-green-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="col-span-2">
                <input
                  type="number"
                  placeholder="Non-Federal"
                  value={item.nonfederal}
                  onChange={(e) => updateItem(category, item.id, 'nonfederal', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="col-span-1 flex justify-center">
                <button
                  onClick={() => removeItem(category, item.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border-2 border-green-200 mt-4">
            <p className="text-lg font-bold text-gray-900">
              {title} Subtotal: ${calculateCategoryTotal(category).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <Loader className="w-16 h-16 animate-spin text-indigo-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading budget data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            to="/grants"
            className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Grants
          </Link>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Budget Builder</h1>
                <p className="text-gray-600">Create compliant federal grant budgets (SF-424A)</p>
              </div>
              <DollarSign className="w-16 h-16 text-indigo-600" />
            </div>
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 bg-green-50 border-2 border-green-200 rounded-xl p-4 flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <p className="text-green-800 font-semibold">Budget saved successfully!</p>
          </div>
        )}
        
        {error && (
          <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Budget Categories */}
        {renderBudgetCategory('1. Personnel', 'personnel')}
        {renderBudgetCategory('2. Fringe Benefits', 'fringe')}
        {renderBudgetCategory('3. Travel', 'travel')}
        {renderBudgetCategory('4. Equipment', 'equipment')}
        {renderBudgetCategory('5. Supplies', 'supplies')}
        {renderBudgetCategory('6. Contractual', 'contractual')}
        {renderBudgetCategory('7. Other Direct Costs', 'other')}

        {/* Indirect Costs */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Calculator className="w-6 h-6" />
            8. Indirect Costs
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Indirect Cost Rate (%)
              </label>
              <input
                type="number"
                value={budget.indirect_cost_rate}
                onChange={(e) => setBudget(prev => ({ ...prev, indirect_cost_rate: parseFloat(e.target.value) || 0 }))}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                min="0"
                max="100"
                step="0.1"
                placeholder="e.g., 10.5"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Indirect Cost Base (optional)
              </label>
              <input
                type="number"
                value={budget.indirect_cost_base}
                onChange={(e) => setBudget(prev => ({ ...prev, indirect_cost_base: parseFloat(e.target.value) || 0 }))}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                min="0"
                step="0.01"
                placeholder="Leave blank to use total direct costs"
              />
            </div>
          </div>
          <div className="mt-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-4 border-2 border-purple-200">
            <p className="text-lg font-bold text-gray-900">
              Indirect Costs: ${calculateIndirectCosts().toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* Budget Summary */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-xl shadow-lg p-8 text-white mb-6">
          <h2 className="text-2xl font-bold mb-6">Budget Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              <p className="text-white/80 text-sm mb-1">Total Direct Costs</p>
              <p className="text-3xl font-bold">
                ${calculateDirectCosts().toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              <p className="text-white/80 text-sm mb-1">Total Indirect Costs</p>
              <p className="text-3xl font-bold">
                ${calculateIndirectCosts().toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="bg-white/20 backdrop-blur rounded-lg p-4 border-2 border-white/30">
              <p className="text-white/90 text-sm mb-1">TOTAL PROJECT COST</p>
              <p className="text-4xl font-bold">
                ${calculateTotalCosts().toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>

        {/* Budget Narrative */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Budget Narrative / Justification</h2>
          <textarea
            value={budget.budget_narrative}
            onChange={(e) => setBudget(prev => ({ ...prev, budget_narrative: e.target.value }))}
            rows={8}
            placeholder="Provide detailed justification for each budget category..."
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleSave}
              disabled={saving || !grantId}
              className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              {saving ? 'Saving...' : 'Save Budget'}
            </button>
            
            <button
              onClick={handleDownloadExcel}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Download className="w-5 h-5" />
              Download SF-424A (Excel)
            </button>
            
            <Link
              to="/grants"
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors flex items-center gap-2 ml-auto"
            >
              Cancel
            </Link>
          </div>
          
          {!grantId && (
            <p className="mt-4 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
              <AlertCircle className="w-4 h-4 inline mr-2" />
              Please select a grant from the grants list to associate this budget.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

