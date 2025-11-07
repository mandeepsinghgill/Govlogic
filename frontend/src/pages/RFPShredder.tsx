/**
 * RFP Shredder - Upload & Automatically Parse RFPs
 * Extracts Section L, M, SOW, generates compliance matrix
 * Powered by InZTan Gov Supreme Overlord
 */

import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Loader, Download, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ShreddedData {
  opportunity_id: number;
  section_l: any[];
  section_m: any[];
  sow_pws: any[];
  all_requirements: any[];
  key_information: any;
  compliance_matrix_template: any[];
}

interface ValidationResult {
  status: 'PASS' | 'FAIL';
  warnings: string[];
  errors: string[];
}

const RFPShredder: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [opportunityId, setOpportunityId] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [shreddedData, setShreddedData] = useState<ShreddedData | null>(null);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [error, setError] = useState<string>('');
  const [progress, setProgress] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type === 'application/pdf' || 
          selectedFile.name.endsWith('.docx') || 
          selectedFile.name.endsWith('.doc')) {
        setFile(selectedFile);
        setError('');
      } else {
        setError('Please upload a PDF or Word document');
        setFile(null);
      }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      const input = document.createElement('input');
      input.type = 'file';
      input.files = e.dataTransfer.files;
      handleFileChange({ target: input } as any);
    }
  };

  const handleUpload = async () => {
    if (!file || !opportunityId) {
      setError('Please select a file and enter an opportunity ID');
      return;
    }

    setIsUploading(true);
    setError('');
    setProgress(10);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('opportunity_id', opportunityId);

      setProgress(30);

      const response = await fetch('/api/v1/inztan/rfp/shred', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      setProgress(70);

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      setProgress(90);
      setShreddedData(result.shredded_data);
      setValidation(result.validation);
      setProgress(100);

      // Success notification
      setTimeout(() => {
        setProgress(0);
      }, 2000);

    } catch (err: any) {
      setError(err.message || 'Failed to upload and parse RFP');
      console.error('RFP Shredding error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const downloadComplianceMatrix = () => {
    if (!shreddedData) return;

    // Convert compliance matrix to CSV
    const csv = convertToCSV(shreddedData.compliance_matrix_template || []);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `compliance_matrix_${opportunityId}.csv`;
    a.click();
  };

  const convertToCSV = (data: any[]) => {
    const headers = ['ID', 'Category', 'Requirement', 'Proposal Location', 'Status'];
    const rows = data.map(item => [
      item.id || '',
      item.category || '',
      `"${(item.requirement || '').replace(/"/g, '""')}"`,
      item.proposal_location || '',
      item.compliance_status || 'PENDING'
    ]);

    return [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                RFP Shredder
              </h1>
              <p className="text-lg text-gray-600">
                Automatically extract Section L, M, SOW, and generate compliance matrix
              </p>
              <div className="mt-2 flex items-center gap-2 text-sm text-indigo-600">
                <CheckCircle className="w-4 h-4" />
                <span className="font-semibold">GovSure • Enterprise Proposal Intelligence Platform</span>
              </div>
            </div>
            <Link 
              to="/opportunities" 
              className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              ← Back to Opportunities
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Upload className="w-6 h-6 text-indigo-600" />
              Upload RFP
            </h2>

            {/* Opportunity ID */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Opportunity ID
              </label>
              <input
                type="text"
                value={opportunityId}
                onChange={(e) => setOpportunityId(e.target.value)}
                placeholder="Enter opportunity ID..."
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>

            {/* File Upload Area */}
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className={`border-4 border-dashed rounded-xl p-12 text-center transition-all ${
                file 
                  ? 'border-green-400 bg-green-50' 
                  : 'border-gray-300 bg-gray-50 hover:border-indigo-400 hover:bg-indigo-50'
              }`}
            >
              {file ? (
                <div className="space-y-4">
                  <CheckCircle className="w-16 h-16 text-green-600 mx-auto" />
                  <div>
                    <p className="text-lg font-semibold text-gray-900">{file.name}</p>
                    <p className="text-sm text-gray-600">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    onClick={() => setFile(null)}
                    className="text-sm text-red-600 hover:text-red-800 font-medium"
                  >
                    Remove file
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto" />
                  <div>
                    <p className="text-lg font-semibold text-gray-700 mb-2">
                      Drop RFP file here or click to browse
                    </p>
                    <p className="text-sm text-gray-500">
                      Supports PDF, Word (.docx, .doc)
                    </p>
                  </div>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="inline-block px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 cursor-pointer transition-colors"
                  >
                    Select File
                  </label>
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="mt-4 p-4 bg-red-50 border-2 border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Upload Button */}
            <button
              onClick={handleUpload}
              disabled={!file || !opportunityId || isUploading}
              className={`w-full mt-6 py-4 rounded-lg font-bold text-lg transition-all flex items-center justify-center gap-3 ${
                !file || !opportunityId || isUploading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white hover:from-indigo-700 hover:to-blue-700 shadow-lg hover:shadow-xl transform hover:scale-105'
              }`}
            >
              {isUploading ? (
                <>
                  <Loader className="w-6 h-6 animate-spin" />
                  Processing RFP...
                </>
              ) : (
                <>
                  <Upload className="w-6 h-6" />
                  Shred RFP & Generate Matrix
                </>
              )}
            </button>

            {/* Progress Bar */}
            {progress > 0 && (
              <div className="mt-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Processing...</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-indigo-600 to-blue-600 h-full transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Processing Steps */}
            {isUploading && (
              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Loader className="w-4 h-4 animate-spin text-indigo-600" />
                  <span className="text-gray-700">Extracting text from RFP...</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Loader className="w-4 h-4 animate-spin text-indigo-600" />
                  <span className="text-gray-700">Identifying Section L (Instructions)...</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Loader className="w-4 h-4 animate-spin text-indigo-600" />
                  <span className="text-gray-700">Identifying Section M (Evaluation)...</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Loader className="w-4 h-4 animate-spin text-indigo-600" />
                  <span className="text-gray-700">Extracting SOW/PWS tasks...</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Loader className="w-4 h-4 animate-spin text-indigo-600" />
                  <span className="text-gray-700">Generating compliance matrix...</span>
                </div>
              </div>
            )}
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {shreddedData && (
              <>
                {/* Validation Results */}
                {validation && (
                  <div className={`bg-white rounded-xl shadow-lg p-6 border-l-4 ${
                    validation.status === 'PASS' ? 'border-green-500' : 'border-yellow-500'
                  }`}>
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      {validation.status === 'PASS' ? (
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      ) : (
                        <AlertCircle className="w-6 h-6 text-yellow-600" />
                      )}
                      Validation: {validation.status}
                    </h3>

                    {validation.warnings.length > 0 && (
                      <div className="mb-4">
                        <p className="font-semibold text-yellow-800 mb-2">Warnings:</p>
                        <ul className="list-disc list-inside space-y-1 text-sm text-yellow-700">
                          {validation.warnings.map((warning, idx) => (
                            <li key={idx}>{warning}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {validation.errors.length > 0 && (
                      <div>
                        <p className="font-semibold text-red-800 mb-2">Errors:</p>
                        <ul className="list-disc list-inside space-y-1 text-sm text-red-700">
                          {validation.errors.map((error, idx) => (
                            <li key={idx}>{error}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Extracted Data Summary */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Extracted Data</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-indigo-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Section L Items</p>
                      <p className="text-3xl font-bold text-indigo-600">
                        {shreddedData.section_l?.length || 0}
                      </p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Section M Factors</p>
                      <p className="text-3xl font-bold text-blue-600">
                        {shreddedData.section_m?.length || 0}
                      </p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">SOW Tasks</p>
                      <p className="text-3xl font-bold text-green-600">
                        {shreddedData.sow_pws?.length || 0}
                      </p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Total Requirements</p>
                      <p className="text-3xl font-bold text-purple-600">
                        {shreddedData.all_requirements?.length || 0}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Key Information */}
                {shreddedData.key_information && (
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Key Information</h3>
                    <div className="space-y-3 text-sm">
                      {Object.entries(shreddedData.key_information).map(([key, value]) => (
                        <div key={key} className="flex justify-between border-b border-gray-200 pb-2">
                          <span className="font-semibold text-gray-700 capitalize">
                            {key.replace(/_/g, ' ')}:
                          </span>
                          <span className="text-gray-900">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Next Steps</h3>
                  
                  <button
                    onClick={downloadComplianceMatrix}
                    className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Download className="w-5 h-5" />
                    Download Compliance Matrix (CSV)
                  </button>

                  <Link
                    to={`/compliance-matrix/${opportunityId}`}
                    className="block w-full py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors text-center flex items-center justify-center gap-2"
                  >
                    <Eye className="w-5 h-5" />
                    View Interactive Matrix
                  </Link>

                  <Link
                    to={`/proposal-generator/${opportunityId}`}
                    className="block w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition-colors text-center flex items-center justify-center gap-2"
                  >
                    <FileText className="w-5 h-5" />
                    Generate Proposal (Gov Supreme Overlord)
                  </Link>
                </div>
              </>
            )}

            {/* Empty State */}
            {!shreddedData && !isUploading && (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <FileText className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">
                  Upload an RFP to see extracted data and compliance matrix
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-12 bg-white rounded-xl shadow-lg p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">RFP Shredder Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex gap-4">
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Section L Extraction</h4>
                <p className="text-sm text-gray-600">
                  Automatically identifies and extracts all Instructions to Offerors with page limits
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Section M Extraction</h4>
                <p className="text-sm text-gray-600">
                  Extracts evaluation criteria with weights, subfactors, and scoring approach
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">SOW/PWS Extraction</h4>
                <p className="text-sm text-gray-600">
                  Identifies all tasks, deliverables, and "shall" requirements from Statement of Work
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Compliance Matrix</h4>
                <p className="text-sm text-gray-600">
                  Auto-generates comprehensive compliance matrix mapping all requirements to proposal sections
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Requirement Analysis</h4>
                <p className="text-sm text-gray-600">
                  Finds all "shall", "must", and "will" statements with surrounding context
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Quality Validation</h4>
                <p className="text-sm text-gray-600">
                  Validates shredding quality and flags any missing critical sections
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RFPShredder;

