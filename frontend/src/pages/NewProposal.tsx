import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, Wand2, Save, Loader2, AlertCircle, 
  CheckCircle, ArrowLeft 
} from 'lucide-react';

export default function NewProposal() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    solicitation_number: '',
    contract_id: '',
    description: '',
    organization_id: '', // This should come from user context
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError('');
  };

  const handleGenerateContent = async () => {
    if (!formData.description && !formData.contract_id) {
      setError('Please provide either a contract ID or description to generate content');
      return;
    }

    try {
      setGenerating(true);
      setError('');
      setSuccess('');
      
      const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
      
      if (!token) {
        setError('Please login to generate AI content');
        navigate('/login');
        return;
      }
      
      const response = await fetch('http://localhost:8000/api/v1/proposals/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          contract_id: formData.contract_id || null,
          description: formData.description || null,
        }),
      });

      if (response.status === 401) {
        setError('Session expired. Please login again.');
        navigate('/login');
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to generate content');
      }

      const data = await response.json();
      setGeneratedContent(data.content);
      
      if (data.source) {
        setSuccess(`✅ Content generated using ${data.source}`);
      } else if (data.mockGenerated) {
        setSuccess('⚠️ Content generated using mock mode (Ollama not available - using sample content)');
      } else {
        setSuccess('✅ AI content generated successfully!');
      }
    } catch (err: any) {
      console.error('Error generating content:', err);
      setError(err.message || 'Failed to generate content. Make sure Ollama is running on http://localhost:11434');
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!formData.title) {
      setError('Please provide a proposal title');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
      
      if (!token) {
        setError('Please login to create a proposal');
        navigate('/login');
        return;
      }

      const response = await fetch('http://localhost:8000/api/v1/proposals/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: formData.title,
          solicitation_number: formData.solicitation_number || null,
          opportunity_id: formData.contract_id || null,
          organization_id: 'default-org-id', // Will be overridden by backend with user's org
        }),
      });

      if (response.status === 401) {
        setError('Session expired. Please login again.');
        navigate('/login');
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to create proposal');
      }

      const data = await response.json();
      setSuccess('Proposal created successfully! Redirecting...');
      
      // Redirect to proposals list after 1 second
      setTimeout(() => {
        navigate('/proposals');
      }, 1000);
    } catch (err: any) {
      console.error('Error creating proposal:', err);
      setError(err.message || 'Failed to create proposal. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/proposals')}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">New Proposal</h1>
          <p className="text-gray-600 mt-1">
            Create a new proposal with AI-powered content generation
          </p>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <span className="text-red-800">{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <span className="text-green-800">{success}</span>
        </div>
      )}

      {/* Basic Information */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Basic Information</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Proposal Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter proposal title"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Solicitation Number
            </label>
            <input
              type="text"
              name="solicitation_number"
              value={formData.solicitation_number}
              onChange={handleInputChange}
              placeholder="e.g., FA8771-24-R-0001"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </Card>

      {/* AI Generation */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Wand2 className="h-5 w-5 text-purple-600" />
          <h2 className="text-xl font-bold">AI Content Generation</h2>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contract ID (from SAM.gov)
            </label>
            <input
              type="text"
              name="contract_id"
              value={formData.contract_id}
              onChange={handleInputChange}
              placeholder="Enter SAM.gov contract/opportunity ID"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              If provided, we'll fetch contract details from SAM.gov
            </p>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">OR</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter a description of the opportunity or requirements..."
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <button
            onClick={handleGenerateContent}
            disabled={generating || (!formData.description && !formData.contract_id)}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generating ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Generating AI Content...
              </>
            ) : (
              <>
                <Wand2 className="h-5 w-5" />
                Generate AI Proposal Draft
              </>
            )}
          </button>
        </div>
      </Card>

      {/* Generated Content Preview */}
      {generatedContent && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Generated Content</h2>
            <button
              onClick={() => setGeneratedContent('')}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Clear
            </button>
          </div>
          <div className="prose max-w-none">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 whitespace-pre-wrap">
              {generatedContent}
            </div>
          </div>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-4 justify-end pb-8">
        <button
          onClick={() => navigate('/proposals')}
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={loading || !formData.title}
          className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-5 w-5" />
              Save Proposal
            </>
          )}
        </button>
      </div>
    </div>
  );
}

