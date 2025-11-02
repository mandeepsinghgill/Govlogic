/**
 * SF-424 Forms Tool - Auto-fill Standard Federal Grant Forms
 * Implements the SF-424 suite for federal grant applications
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft, FileText, Download, Save, Building2, User,
  MapPin, DollarSign, Calendar, CheckCircle, AlertCircle,
  Upload, Loader
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface SF424Data {
  // Applicant Information
  applicant_name: string;
  applicant_duns: string;
  applicant_ein: string;
  organizational_unit: string;
  
  // Address
  street_address: string;
  city: string;
  state: string;
  zip_code: string;
  
  // Contact Person
  contact_name: string;
  contact_title: string;
  contact_phone: string;
  contact_email: string;
  
  // Federal Agency
  federal_agency: string;
  cfda_number: string;
  cfda_title: string;
  
  // Project Information
  project_title: string;
  project_description: string;
  areas_affected: string;
  
  // Funding
  federal_amount: number;
  applicant_amount: number;
  state_amount: number;
  local_amount: number;
  other_amount: number;
  program_income: number;
  
  // Dates
  project_start_date: string;
  project_end_date: string;
  
  // Type of Application
  application_type: string;
  
  // Congressional District
  applicant_congressional_district: string;
  project_congressional_district: string;
  
  // Authorized Representative
  authorized_rep_name: string;
  authorized_rep_title: string;
  authorized_rep_phone: string;
  authorized_rep_email: string;
  signature_date: string;
}

export default function SF424Forms() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const grantId = searchParams.get('grant');
  
  const [formData, setFormData] = useState<SF424Data>({
    applicant_name: '',
    applicant_duns: '',
    applicant_ein: '',
    organizational_unit: '',
    street_address: '',
    city: '',
    state: '',
    zip_code: '',
    contact_name: '',
    contact_title: '',
    contact_phone: '',
    contact_email: '',
    federal_agency: '',
    cfda_number: '',
    cfda_title: '',
    project_title: '',
    project_description: '',
    areas_affected: '',
    federal_amount: 0,
    applicant_amount: 0,
    state_amount: 0,
    local_amount: 0,
    other_amount: 0,
    program_income: 0,
    project_start_date: '',
    project_end_date: '',
    application_type: 'new',
    applicant_congressional_district: '',
    project_congressional_district: '',
    authorized_rep_name: '',
    authorized_rep_title: '',
    authorized_rep_phone: '',
    authorized_rep_email: '',
    signature_date: new Date().toISOString().split('T')[0]
  });
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (grantId) {
      loadGrantData();
    } else {
      loadOrganizationDefaults();
    }
  }, [grantId]);

  const loadGrantData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
      
      const response = await fetch(`${API_URL}/api/v1/grants/${grantId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const grant = await response.json();
        
        // Pre-fill from grant data
        if (grant.sf424_data) {
          setFormData(grant.sf424_data);
        } else {
          // Pre-fill basic grant info
          setFormData(prev => ({
            ...prev,
            project_title: grant.title,
            federal_agency: grant.agency,
            project_description: grant.nofo_text || grant.description || '',
            federal_amount: grant.award_ceiling || 0,
            cfda_number: grant.requirements?.cfda_numbers?.[0] || ''
          }));
        }
      }
    } catch (err) {
      console.error('Error loading grant:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadOrganizationDefaults = async () => {
    try {
      const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
      const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
      const orgStr = localStorage.getItem('organization') || sessionStorage.getItem('organization');
      
      if (orgStr) {
        const org = JSON.parse(orgStr);
        setFormData(prev => ({
          ...prev,
          applicant_name: org.name || '',
          applicant_ein: org.ein || '',
          applicant_duns: org.duns || ''
        }));
      }
      
      if (userStr) {
        const user = JSON.parse(userStr);
        setFormData(prev => ({
          ...prev,
          contact_name: user.full_name || '',
          contact_email: user.email || ''
        }));
      }
    } catch (err) {
      console.error('Error loading defaults:', err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('amount') || name.includes('income') ? parseFloat(value) || 0 : value
    }));
  };

  const calculateTotal = () => {
    return (
      formData.federal_amount +
      formData.applicant_amount +
      formData.state_amount +
      formData.local_amount +
      formData.other_amount +
      formData.program_income
    );
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      
      const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
      
      if (!grantId) {
        setError('No grant selected. Please select a grant first.');
        return;
      }
      
      // Save SF-424 data to grant
      const response = await fetch(`${API_URL}/api/v1/grants/${grantId}/sf424`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to save SF-424 form');
      }
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save form');
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadPDF = () => {
    alert('PDF download will be implemented with proper SF-424 formatting');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <Loader className="w-16 h-16 animate-spin text-indigo-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading form data...</p>
          </div>
        </div>
      </div>
    );
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
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">SF-424 Application Form</h1>
                <p className="text-gray-600">Application for Federal Assistance</p>
              </div>
              <FileText className="w-16 h-16 text-indigo-600" />
            </div>
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 bg-green-50 border-2 border-green-200 rounded-xl p-4 flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <p className="text-green-800 font-semibold">SF-424 form saved successfully!</p>
          </div>
        )}
        
        {error && (
          <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Form Sections */}
        <div className="space-y-6">
          {/* Section 1: Type of Submission */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">1. Type of Submission</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Application Type *
                </label>
                <select
                  name="application_type"
                  value={formData.application_type}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  <option value="new">New</option>
                  <option value="continuation">Continuation</option>
                  <option value="revision">Revision</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Applicant Information */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Building2 className="w-6 h-6" />
              2. Applicant Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Legal Name of Applicant *
                </label>
                <input
                  type="text"
                  name="applicant_name"
                  value={formData.applicant_name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  DUNS Number
                </label>
                <input
                  type="text"
                  name="applicant_duns"
                  value={formData.applicant_duns}
                  onChange={handleChange}
                  placeholder="9 digits"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  EIN (Tax ID)
                </label>
                <input
                  type="text"
                  name="applicant_ein"
                  value={formData.applicant_ein}
                  onChange={handleChange}
                  placeholder="XX-XXXXXXX"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Organizational Unit
                </label>
                <input
                  type="text"
                  name="organizational_unit"
                  value={formData.organizational_unit}
                  onChange={handleChange}
                  placeholder="Department or Division"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Address */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="w-6 h-6" />
              3. Address
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Street Address *
                </label>
                <input
                  type="text"
                  name="street_address"
                  value={formData.street_address}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  State *
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="CA"
                  maxLength={2}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  ZIP Code *
                </label>
                <input
                  type="text"
                  name="zip_code"
                  value={formData.zip_code}
                  onChange={handleChange}
                  placeholder="12345"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Congressional District (Applicant)
                </label>
                <input
                  type="text"
                  name="applicant_congressional_district"
                  value={formData.applicant_congressional_district}
                  onChange={handleChange}
                  placeholder="CA-12"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Contact Person */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-6 h-6" />
              4. Contact Person
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  name="contact_name"
                  value={formData.contact_name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  name="contact_title"
                  value={formData.contact_title}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone *
                </label>
                <input
                  type="tel"
                  name="contact_phone"
                  value={formData.contact_phone}
                  onChange={handleChange}
                  placeholder="(555) 123-4567"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="contact_email"
                  value={formData.contact_email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 5: Federal Agency and CFDA */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">5. Federal Agency and Program</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Federal Agency Name *
                </label>
                <input
                  type="text"
                  name="federal_agency"
                  value={formData.federal_agency}
                  onChange={handleChange}
                  placeholder="e.g., Department of Health and Human Services"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  CFDA Number
                </label>
                <input
                  type="text"
                  name="cfda_number"
                  value={formData.cfda_number}
                  onChange={handleChange}
                  placeholder="93.242"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  CFDA Title
                </label>
                <input
                  type="text"
                  name="cfda_title"
                  value={formData.cfda_title}
                  onChange={handleChange}
                  placeholder="Mental Health Research Grants"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Section 6: Project Information */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">6. Project Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Project Title *
                </label>
                <input
                  type="text"
                  name="project_title"
                  value={formData.project_title}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Project Description *
                </label>
                <textarea
                  name="project_description"
                  value={formData.project_description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Areas Affected by Project
                </label>
                <input
                  type="text"
                  name="areas_affected"
                  value={formData.areas_affected}
                  onChange={handleChange}
                  placeholder="Cities, counties, or states"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Congressional District (Project)
                </label>
                <input
                  type="text"
                  name="project_congressional_district"
                  value={formData.project_congressional_district}
                  onChange={handleChange}
                  placeholder="CA-12"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Project Start Date *
                  </label>
                  <input
                    type="date"
                    name="project_start_date"
                    value={formData.project_start_date}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Project End Date *
                  </label>
                  <input
                    type="date"
                    name="project_end_date"
                    value={formData.project_end_date}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 7: Estimated Funding */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <DollarSign className="w-6 h-6" />
              7. Estimated Funding
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    a. Federal
                  </label>
                  <input
                    type="number"
                    name="federal_amount"
                    value={formData.federal_amount}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    min="0"
                    step="0.01"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    b. Applicant
                  </label>
                  <input
                    type="number"
                    name="applicant_amount"
                    value={formData.applicant_amount}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    min="0"
                    step="0.01"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    c. State
                  </label>
                  <input
                    type="number"
                    name="state_amount"
                    value={formData.state_amount}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    min="0"
                    step="0.01"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    d. Local
                  </label>
                  <input
                    type="number"
                    name="local_amount"
                    value={formData.local_amount}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    min="0"
                    step="0.01"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    e. Other
                  </label>
                  <input
                    type="number"
                    name="other_amount"
                    value={formData.other_amount}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    min="0"
                    step="0.01"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    f. Program Income
                  </label>
                  <input
                    type="number"
                    name="program_income"
                    value={formData.program_income}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border-2 border-green-200">
                <p className="text-lg font-bold text-gray-900">
                  Total Project Cost: ${calculateTotal().toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>

          {/* Section 8: Authorized Representative */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">8. Authorized Representative</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  name="authorized_rep_name"
                  value={formData.authorized_rep_name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  name="authorized_rep_title"
                  value={formData.authorized_rep_title}
                  onChange={handleChange}
                  placeholder="e.g., Executive Director"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone *
                </label>
                <input
                  type="tel"
                  name="authorized_rep_phone"
                  value={formData.authorized_rep_phone}
                  onChange={handleChange}
                  placeholder="(555) 123-4567"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="authorized_rep_email"
                  value={formData.authorized_rep_email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Signature Date *
                </label>
                <input
                  type="date"
                  name="signature_date"
                  value={formData.signature_date}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>
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
                {saving ? 'Saving...' : 'Save Form'}
              </button>
              
              <button
                onClick={handleDownloadPDF}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Download className="w-5 h-5" />
                Download PDF
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
                Please select a grant from the grants list to associate this SF-424 form.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

