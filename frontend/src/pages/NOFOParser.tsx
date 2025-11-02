/**
 * NOFO Parser Tool - Extract Requirements from NOFOs
 * Upload NOFO/FOA documents and automatically extract requirements
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Upload, FileText, CheckCircle, AlertCircle,
  Loader, Download, Save, FileCheck
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface ParsedNOFO {
  title: string;
  agency: string;
  opportunity_number: string;
  deadline: string;
  eligibility: string[];
  requirements: Requirement[];
  evaluation_criteria: string[];
  budget_info: {
    max_award: number;
    min_award: number;
    total_funding: number;
  };
}

interface Requirement {
  id: string;
  text: string;
  type: 'mandatory' | 'desirable' | 'optional';
  section: string;
}

export default function NOFOParser() {
  const navigate = useNavigate();
  
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<ParsedNOFO | null>(null);
  const [saving, setSaving] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];
      if (!validTypes.includes(selectedFile.type)) {
        setError('Please upload a PDF or Word document');
        return;
      }
      
      // Validate file size (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleUploadAndParse = async () => {
    if (!file) return;
    
    try {
      setUploading(true);
      setParsing(true);
      setError(null);
      
      const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
      
      // Upload file
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(`${API_URL}/api/v1/grants/parse-nofo`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Failed to parse NOFO document');
      }
      
      const data = await response.json();
      setParsedData(data);
      
    } catch (err: any) {
      console.error('Error parsing NOFO:', err);
      setError(err.message || 'Failed to parse NOFO document');
    } finally {
      setUploading(false);
      setParsing(false);
    }
  };

  const handleSaveToGrant = async () => {
    if (!parsedData) return;
    
    try {
      setSaving(true);
      const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
      
      // Create new grant with parsed data
      const response = await fetch(`${API_URL}/api/v1/grants/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: parsedData.title,
          agency: parsedData.agency,
          funding_opportunity_number: parsedData.opportunity_number,
          deadline: parsedData.deadline,
          award_ceiling: parsedData.budget_info.max_award,
          award_floor: parsedData.budget_info.min_award,
          total_funding: parsedData.budget_info.total_funding,
          description: parsedData.eligibility.join('\n\n'),
          requirements: {
            parsed_requirements: parsedData.requirements,
            evaluation_criteria: parsedData.evaluation_criteria,
            eligibility: parsedData.eligibility
          }
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to save grant');
      }
      
      const grant = await response.json();
      alert('Grant created successfully from NOFO!');
      navigate(`/grants/${grant.id}`);
      
    } catch (err: any) {
      console.error('Error saving grant:', err);
      setError(err.message || 'Failed to save grant');
    } finally {
      setSaving(false);
    }
  };

  const handleExportRequirements = () => {
    if (!parsedData) return;
    
    // Create CSV content
    const csv = [
      ['ID', 'Requirement', 'Type', 'Section'],
      ...parsedData.requirements.map(req => [
        req.id,
        req.text,
        req.type,
        req.section
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    
    // Download
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nofo-requirements-${Date.now()}.csv`;
    a.click();
  };

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
                <h1 className="text-3xl font-bold text-gray-900 mb-2">NOFO Parser</h1>
                <p className="text-gray-600">Upload and extract requirements from NOFO/FOA documents</p>
              </div>
              <Upload className="w-16 h-16 text-indigo-600" />
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Upload Section */}
        {!parsedData && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Upload NOFO Document</h2>
            
            <div className="border-4 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-indigo-500 transition-colors">
              <input
                type="file"
                id="nofo-file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              <label
                htmlFor="nofo-file"
                className="cursor-pointer flex flex-col items-center"
              >
                <FileText className="w-20 h-20 text-gray-400 mb-4" />
                <p className="text-xl font-semibold text-gray-900 mb-2">
                  Click to upload NOFO/FOA document
                </p>
                <p className="text-gray-600 mb-4">
                  Supports PDF and Word documents (max 10MB)
                </p>
                {file && (
                  <div className="mt-4 bg-indigo-50 border-2 border-indigo-200 rounded-lg p-4">
                    <p className="text-indigo-900 font-semibold flex items-center gap-2">
                      <FileCheck className="w-5 h-5" />
                      {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  </div>
                )}
              </label>
            </div>
            
            {file && (
              <button
                onClick={handleUploadAndParse}
                disabled={uploading || parsing}
                className="mt-6 w-full px-6 py-4 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg font-semibold hover:from-green-700 hover:to-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {parsing ? (
                  <>
                    <Loader className="w-6 h-6 animate-spin" />
                    Parsing document with AI...
                  </>
                ) : (
                  <>
                    <FileText className="w-6 h-6" />
                    Parse NOFO Document
                  </>
                )}
              </button>
            )}
            
            <div className="mt-6 bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
              <h3 className="font-semibold text-blue-900 mb-2">What gets extracted:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Funding opportunity details (title, number, agency)</li>
                <li>• Eligibility requirements</li>
                <li>• Evaluation criteria</li>
                <li>• Budget information</li>
                <li>• All mandatory requirements (shall/must)</li>
                <li>• Submission deadlines</li>
              </ul>
            </div>
          </div>
        )}

        {/* Parsed Results */}
        {parsedData && (
          <div className="space-y-6">
            {/* Success Banner */}
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <p className="text-green-800 font-semibold">
                Successfully parsed NOFO! Found {parsedData.requirements.length} requirements.
              </p>
            </div>

            {/* Overview */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Opportunity Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 font-semibold">Title</p>
                  <p className="text-lg text-gray-900">{parsedData.title}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-semibold">Agency</p>
                  <p className="text-lg text-gray-900">{parsedData.agency}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-semibold">Opportunity Number</p>
                  <p className="text-lg text-gray-900 font-mono">{parsedData.opportunity_number}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-semibold">Deadline</p>
                  <p className="text-lg text-gray-900">{parsedData.deadline}</p>
                </div>
              </div>
            </div>

            {/* Budget Info */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border-2 border-green-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Budget Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600 font-semibold">Maximum Award</p>
                  <p className="text-2xl font-bold text-green-700">
                    ${parsedData.budget_info.max_award.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-semibold">Minimum Award</p>
                  <p className="text-2xl font-bold text-blue-700">
                    ${parsedData.budget_info.min_award.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-semibold">Total Funding</p>
                  <p className="text-2xl font-bold text-purple-700">
                    ${parsedData.budget_info.total_funding.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Requirements */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Extracted Requirements ({parsedData.requirements.length})
              </h2>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {parsedData.requirements.map((req) => (
                  <div
                    key={req.id}
                    className="border-2 border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded">
                        {req.id}
                      </span>
                      <span className={`px-2 py-1 text-xs font-semibold rounded ${
                        req.type === 'mandatory' ? 'bg-red-100 text-red-700' :
                        req.type === 'desirable' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {req.type.toUpperCase()}
                      </span>
                      <div className="flex-1">
                        <p className="text-gray-900">{req.text}</p>
                        <p className="text-sm text-gray-500 mt-1">Section: {req.section}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Eligibility */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Eligibility Criteria</h2>
              <ul className="space-y-2">
                {parsedData.eligibility.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Evaluation Criteria */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Evaluation Criteria</h2>
              <ul className="space-y-2">
                {parsedData.evaluation_criteria.map((criterion, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-indigo-600 font-bold">{idx + 1}.</span>
                    <span className="text-gray-700">{criterion}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleSaveToGrant}
                  disabled={saving}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  <Save className="w-5 h-5" />
                  {saving ? 'Saving...' : 'Create Grant from NOFO'}
                </button>
                
                <button
                  onClick={handleExportRequirements}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Export Requirements (CSV)
                </button>
                
                <button
                  onClick={() => {
                    setParsedData(null);
                    setFile(null);
                  }}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors ml-auto"
                >
                  Parse Another NOFO
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

