/**
 * New Program Modal - GovSure
 * Modal for creating new programs/contracts
 */

import React, { useState } from 'react';
import { X } from 'lucide-react';

interface NewProgramModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (programData: any) => void;
}

const NewProgramModal: React.FC<NewProgramModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    contract_number: '',
    agency: '',
    program_manager: '',
    contract_value: '',
    start_date: '',
    end_date: '',
    description: '',
    status: 'active'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      contract_value: parseFloat(formData.contract_value)
    });
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      name: '',
      contract_number: '',
      agency: '',
      program_manager: '',
      contract_value: '',
      start_date: '',
      end_date: '',
      description: '',
      status: 'active'
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Add New Program</h2>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Program Name */}
            <div className="md:col-span-2">
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                Program Name *
              </label>
              <input
                type="text"
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., GSA Cloud Platform Modernization"
              />
            </div>

            {/* Contract Number */}
            <div>
              <label htmlFor="contract_number" className="block text-sm font-semibold text-gray-700 mb-2">
                Contract Number *
              </label>
              <input
                type="text"
                id="contract_number"
                required
                value={formData.contract_number}
                onChange={(e) => setFormData({ ...formData, contract_number: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., GS-35F-0119Y"
              />
            </div>

            {/* Agency */}
            <div>
              <label htmlFor="agency" className="block text-sm font-semibold text-gray-700 mb-2">
                Agency *
              </label>
              <input
                type="text"
                id="agency"
                required
                value={formData.agency}
                onChange={(e) => setFormData({ ...formData, agency: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., GSA"
              />
            </div>

            {/* Program Manager */}
            <div>
              <label htmlFor="program_manager" className="block text-sm font-semibold text-gray-700 mb-2">
                Program Manager *
              </label>
              <input
                type="text"
                id="program_manager"
                required
                value={formData.program_manager}
                onChange={(e) => setFormData({ ...formData, program_manager: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Sarah Johnson"
              />
            </div>

            {/* Contract Value */}
            <div>
              <label htmlFor="contract_value" className="block text-sm font-semibold text-gray-700 mb-2">
                Contract Value ($) *
              </label>
              <input
                type="number"
                id="contract_value"
                required
                min="0"
                step="0.01"
                value={formData.contract_value}
                onChange={(e) => setFormData({ ...formData, contract_value: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., 15000000"
              />
            </div>

            {/* Start Date */}
            <div>
              <label htmlFor="start_date" className="block text-sm font-semibold text-gray-700 mb-2">
                Start Date *
              </label>
              <input
                type="date"
                id="start_date"
                required
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* End Date */}
            <div>
              <label htmlFor="end_date" className="block text-sm font-semibold text-gray-700 mb-2">
                End Date *
              </label>
              <input
                type="date"
                id="end_date"
                required
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Status */}
            <div className="md:col-span-2">
              <label htmlFor="status" className="block text-sm font-semibold text-gray-700 mb-2">
                Status
              </label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="active">Active</option>
                <option value="at-risk">At Risk</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Brief description of the program..."
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-blue-900 text-white rounded-lg font-semibold hover:bg-blue-800 transition-colors"
            >
              Create Program
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewProgramModal;

