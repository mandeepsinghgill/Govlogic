/**
 * New Grant Application Form
 * Create a new grant application from scratch or from discovered opportunity
 */

import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft, Save, FileText, Building2, DollarSign,
  Calendar, AlertCircle, CheckCircle
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function GrantNew() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Pre-fill from discovery if coming from there
  const prefillTitle = searchParams.get('title') || '';
  const prefillFON = searchParams.get('fon') || '';
  const prefillAgency = searchParams.get('agency') || '';

  const [formData, setFormData] = useState({
    title: prefillTitle,
    funding_opportunity_number: prefillFON,
    agency: prefillAgency,
    award_ceiling: '',
    deadline: '',
    description: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Get token from localStorage or sessionStorage
      const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
      
      if (!token) {
        setError('Please login to create grants');
        setLoading(false);
        setTimeout(() => navigate('/login'), 2000);
        return;
      }

      const response = await fetch(`${API_URL}/api/v1/grants/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          funding_opportunity_number: formData.funding_opportunity_number,
          agency: formData.agency,
          award_ceiling: formData.award_ceiling ? parseFloat(formData.award_ceiling) : null,
          deadline: formData.deadline || null,
          description: formData.description
        }),
      });

      if (response.status === 401) {
        setError('Session expired. Please login again.');
        setLoading(false);
        setTimeout(() => navigate('/login'), 2000);
        return;
      }

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.detail || 'Failed to create grant application');
      }

      setSuccess(true);
      
      // Redirect to grants list after 2 seconds
      setTimeout(() => {
        navigate('/grants');
      }, 2000);
    } catch (err: any) {
      console.error('Error creating grant:', err);
      setError(err.message || 'Failed to create grant application');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/grants')}
            className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Grants
          </button>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            New Grant Application
          </h1>
          <p className="text-lg text-gray-600">
            Create a new grant application to track and manage
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 mb-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <h3 className="text-lg font-bold text-green-900">Grant Application Created!</h3>
                <p className="text-green-700">Redirecting to grants list...</p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 mb-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-8 h-8 text-red-600" />
              <div>
                <h3 className="text-lg font-bold text-red-900">Error</h3>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                <FileText className="inline w-4 h-4 mr-1" />
                Grant Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="e.g., Healthcare Innovation Research Grant"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Funding Opportunity Number */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                <FileText className="inline w-4 h-4 mr-1" />
                Funding Opportunity Number *
              </label>
              <input
                type="text"
                name="funding_opportunity_number"
                value={formData.funding_opportunity_number}
                onChange={handleChange}
                required
                placeholder="e.g., NIH-2024-001"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Agency */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                <Building2 className="inline w-4 h-4 mr-1" />
                Agency
              </label>
              <input
                type="text"
                name="agency"
                value={formData.agency}
                onChange={handleChange}
                placeholder="e.g., National Institutes of Health (NIH)"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Award Ceiling */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                <DollarSign className="inline w-4 h-4 mr-1" />
                Award Ceiling (USD)
              </label>
              <input
                type="number"
                name="award_ceiling"
                value={formData.award_ceiling}
                onChange={handleChange}
                placeholder="e.g., 2500000"
                min="0"
                step="1000"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Deadline */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                <Calendar className="inline w-4 h-4 mr-1" />
                Application Deadline
              </label>
              <input
                type="date"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Description / Notes
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={6}
                placeholder="Add any notes or description about this grant opportunity..."
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>

            {/* Form Actions */}
            <div className="flex gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate('/grants')}
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg font-semibold hover:from-green-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Create Grant Application
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Help Text */}
        <div className="mt-6 bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
          <h3 className="font-bold text-blue-900 mb-2">💡 Tips</h3>
          <ul className="space-y-2 text-blue-800">
            <li>• The funding opportunity number is required and should match the official number</li>
            <li>• You can update all fields later after creating the application</li>
            <li>• Add notes in the description to track your progress and strategy</li>
            <li>• Use the "Discover Opportunities" button to find and add grants automatically</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

