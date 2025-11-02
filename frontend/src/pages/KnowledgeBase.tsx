/**
 * Knowledge Base - Comprehensive Document Management & Resource Library
 * Templates, Past Performance, Teaming Partners, and Reusable Content
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, Plus, FileText, Award, Users, FolderOpen, Download,
  Upload, Star, Clock, Eye, Edit, Trash2, Filter, Grid3x3,
  List, BookOpen, Briefcase, Shield, CheckCircle, FileCheck,
  Paperclip, Tag, Calendar, TrendingUp, Archive, File, Folder,
  X, AlertCircle, Building2, DollarSign
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface Document {
  id: string;
  title: string;
  category: string;
  type: string;
  description: string;
  uploadDate: string;
  lastModified: string;
  size: string;
  tags: string[];
  author: string;
  downloads: number;
  views: number;
  isFavorite: boolean;
}

interface PastPerformance {
  id: string;
  projectName: string;
  client: string;
  contractValue: number;
  startDate: string;
  endDate: string;
  status: 'completed' | 'ongoing';
  rating: number;
  description: string;
}

interface TeamingPartner {
  id: string;
  companyName: string;
  capabilities: string[];
  pastProjects: number;
  certifications: string[];
  contactPerson: string;
  lastEngagement: string;
}

const CATEGORIES = [
  { id: 'all', name: 'All Documents', icon: <FolderOpen className="w-5 h-5" />, count: 0 },
  { id: 'templates', name: 'Templates', icon: <FileText className="w-5 h-5" />, count: 0 },
  { id: 'past-performance', name: 'Past Performance', icon: <Award className="w-5 h-5" />, count: 0 },
  { id: 'proposals', name: 'Proposals', icon: <Briefcase className="w-5 h-5" />, count: 0 },
  { id: 'compliance', name: 'Compliance', icon: <Shield className="w-5 h-5" />, count: 0 },
  { id: 'technical', name: 'Technical Docs', icon: <BookOpen className="w-5 h-5" />, count: 0 },
  { id: 'teaming', name: 'Teaming Agreements', icon: <Users className="w-5 h-5" />, count: 0 },
];

const DOCUMENT_TYPES = [
  'Word Document', 'PDF', 'Excel Spreadsheet', 'PowerPoint', 'Template', 'Image', 'Other'
];

export default function KnowledgeBase() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [pastPerformance, setPastPerformance] = useState<PastPerformance[]>([]);
  const [teamingPartners, setTeamingPartners] = useState<TeamingPartner[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'documents' | 'performance' | 'partners'>('documents');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    category: 'templates',
    description: '',
    tags: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Mock data for comprehensive knowledge base
      const mockDocuments: Document[] = [
        {
          id: '1',
          title: 'SF-424 Application Form Template',
          category: 'templates',
          type: 'Word Document',
          description: 'Standard federal grant application form template with all required sections',
          uploadDate: '2025-10-15',
          lastModified: '2025-11-01',
          size: '245 KB',
          tags: ['Grant', 'SF-424', 'Federal', 'Template'],
          author: 'Admin',
          downloads: 145,
          views: 892,
          isFavorite: true
        },
        {
          id: '2',
          title: 'Technical Approach Boilerplate',
          category: 'proposals',
          type: 'Word Document',
          description: 'Reusable technical approach content for IT modernization projects',
          uploadDate: '2025-09-20',
          lastModified: '2025-10-28',
          size: '1.2 MB',
          tags: ['Technical', 'IT', 'Modernization', 'Boilerplate'],
          author: 'Sarah Johnson',
          downloads: 89,
          views: 456,
          isFavorite: true
        },
        {
          id: '3',
          title: 'CMMC Level 3 Compliance Checklist',
          category: 'compliance',
          type: 'Excel Spreadsheet',
          description: 'Complete checklist for Cybersecurity Maturity Model Certification Level 3',
          uploadDate: '2025-10-01',
          lastModified: '2025-10-15',
          size: '512 KB',
          tags: ['CMMC', 'Cybersecurity', 'Compliance', 'Checklist'],
          author: 'Michael Chen',
          downloads: 203,
          views: 1245,
          isFavorite: false
        },
        {
          id: '4',
          title: 'Project Management Plan Template',
          category: 'templates',
          type: 'Word Document',
          description: 'Comprehensive project management plan following PMBOK guidelines',
          uploadDate: '2025-08-15',
          lastModified: '2025-09-10',
          size: '875 KB',
          tags: ['Project Management', 'PMBOK', 'Template', 'Planning'],
          author: 'Admin',
          downloads: 167,
          views: 723,
          isFavorite: true
        },
        {
          id: '5',
          title: 'Past Performance Questionnaire',
          category: 'past-performance',
          type: 'PDF',
          description: 'Standard questionnaire for collecting past performance references',
          uploadDate: '2025-10-20',
          lastModified: '2025-10-20',
          size: '180 KB',
          tags: ['Past Performance', 'Reference', 'Questionnaire'],
          author: 'Emily Rodriguez',
          downloads: 78,
          views: 345,
          isFavorite: false
        },
        {
          id: '6',
          title: 'Quality Assurance Plan',
          category: 'technical',
          type: 'Word Document',
          description: 'Quality assurance and quality control plan for federal projects',
          uploadDate: '2025-09-01',
          lastModified: '2025-10-05',
          size: '623 KB',
          tags: ['Quality', 'QA', 'QC', 'Federal'],
          author: 'Admin',
          downloads: 134,
          views: 589,
          isFavorite: false
        },
        {
          id: '7',
          title: 'Teaming Agreement Template',
          category: 'teaming',
          type: 'Word Document',
          description: 'Standard teaming agreement for prime-subcontractor relationships',
          uploadDate: '2025-10-10',
          lastModified: '2025-10-25',
          size: '298 KB',
          tags: ['Teaming', 'Legal', 'Agreement', 'Template'],
          author: 'Legal Team',
          downloads: 92,
          views: 412,
          isFavorite: true
        },
        {
          id: '8',
          title: 'Risk Management Matrix',
          category: 'proposals',
          type: 'Excel Spreadsheet',
          description: 'Risk identification, assessment, and mitigation tracking spreadsheet',
          uploadDate: '2025-09-15',
          lastModified: '2025-10-18',
          size: '445 KB',
          tags: ['Risk', 'Management', 'Matrix', 'Tracking'],
          author: 'Sarah Johnson',
          downloads: 156,
          views: 678,
          isFavorite: false
        },
        {
          id: '9',
          title: 'Cost Volume Template',
          category: 'templates',
          type: 'Excel Spreadsheet',
          description: 'Detailed cost breakdown and pricing template for proposals',
          uploadDate: '2025-08-25',
          lastModified: '2025-09-30',
          size: '734 KB',
          tags: ['Cost', 'Pricing', 'Budget', 'Template'],
          author: 'Finance Team',
          downloads: 189,
          views: 891,
          isFavorite: true
        },
        {
          id: '10',
          title: 'SOW Writing Guide',
          category: 'technical',
          type: 'PDF',
          description: 'Best practices guide for writing clear and compliant Statements of Work',
          uploadDate: '2025-10-05',
          lastModified: '2025-10-05',
          size: '1.8 MB',
          tags: ['SOW', 'Writing', 'Guide', 'Best Practices'],
          author: 'Admin',
          downloads: 112,
          views: 534,
          isFavorite: false
        },
        {
          id: '11',
          title: 'Capability Statement',
          category: 'proposals',
          type: 'PDF',
          description: 'Company capability statement with core competencies and past performance',
          uploadDate: '2025-09-10',
          lastModified: '2025-10-22',
          size: '2.1 MB',
          tags: ['Capability', 'Marketing', 'Company Profile'],
          author: 'Marketing Team',
          downloads: 223,
          views: 1456,
          isFavorite: true
        },
        {
          id: '12',
          title: 'FAR Compliance Checklist',
          category: 'compliance',
          type: 'PDF',
          description: 'Federal Acquisition Regulation compliance verification checklist',
          uploadDate: '2025-08-20',
          lastModified: '2025-09-25',
          size: '387 KB',
          tags: ['FAR', 'Compliance', 'Federal', 'Checklist'],
          author: 'Compliance Team',
          downloads: 178,
          views: 845,
          isFavorite: false
        }
      ];

      const mockPastPerformance: PastPerformance[] = [
        {
          id: '1',
          projectName: 'DoD Enterprise Cloud Migration',
          client: 'Department of Defense',
          contractValue: 15000000,
          startDate: '2023-01-15',
          endDate: '2024-12-31',
          status: 'completed',
          rating: 5,
          description: 'Migrated 50+ legacy applications to AWS GovCloud with zero downtime'
        },
        {
          id: '2',
          projectName: 'VA Healthcare IT Modernization',
          client: 'Veterans Affairs',
          contractValue: 8500000,
          startDate: '2023-06-01',
          endDate: '2025-05-31',
          status: 'ongoing',
          rating: 5,
          description: 'Modernizing healthcare IT systems across 15 VA medical centers'
        },
        {
          id: '3',
          projectName: 'DHS Cybersecurity Operations Center',
          client: 'Department of Homeland Security',
          contractValue: 12000000,
          startDate: '2022-03-01',
          endDate: '2024-02-28',
          status: 'completed',
          rating: 5,
          description: 'Built and staffed 24/7 SOC with continuous monitoring capabilities'
        },
        {
          id: '4',
          projectName: 'NASA Data Analytics Platform',
          client: 'NASA',
          contractValue: 6200000,
          startDate: '2024-01-01',
          endDate: '2025-12-31',
          status: 'ongoing',
          rating: 5,
          description: 'AI-powered data analytics platform for mission-critical operations'
        },
        {
          id: '5',
          projectName: 'GSA Digital Transformation',
          client: 'General Services Administration',
          contractValue: 9800000,
          startDate: '2022-09-01',
          endDate: '2024-08-31',
          status: 'completed',
          rating: 4,
          description: 'Digital transformation initiative covering 12 business units'
        }
      ];

      const mockTeamingPartners: TeamingPartner[] = [
        {
          id: '1',
          companyName: 'AWS Government Services',
          capabilities: ['Cloud Infrastructure', 'Security', 'DevOps', 'Migration Services'],
          pastProjects: 28,
          certifications: ['FedRAMP High', 'DoD IL6', 'CMMC Level 5'],
          contactPerson: 'Jennifer Williams',
          lastEngagement: '2025-10-15'
        },
        {
          id: '2',
          companyName: 'Palantir Technologies',
          capabilities: ['Data Analytics', 'AI/ML', 'Big Data', 'Intelligence Systems'],
          pastProjects: 15,
          certifications: ['DoD IL6', 'CMMC Level 3', 'ISO 27001'],
          contactPerson: 'Robert Chen',
          lastEngagement: '2025-09-20'
        },
        {
          id: '3',
          companyName: 'CACI International',
          capabilities: ['Cybersecurity', 'Intel Systems', 'Network Operations', 'C4ISR'],
          pastProjects: 42,
          certifications: ['CMMC Level 5', 'DoD IL6', '8(a) Certified'],
          contactPerson: 'Maria Garcia',
          lastEngagement: '2025-11-01'
        },
        {
          id: '4',
          companyName: 'Deloitte Federal',
          capabilities: ['Management Consulting', 'Process Improvement', 'Change Management', 'Strategy'],
          pastProjects: 67,
          certifications: ['ISO 9001', 'CMMI Level 5', 'PMI Certified'],
          contactPerson: 'David Johnson',
          lastEngagement: '2025-08-10'
        },
        {
          id: '5',
          companyName: 'ManTech International',
          capabilities: ['Mission IT', 'Cyber Operations', 'Software Development', 'Data Science'],
          pastProjects: 34,
          certifications: ['CMMC Level 4', 'DoD IL5', 'ISO 27001'],
          contactPerson: 'Lisa Anderson',
          lastEngagement: '2025-10-22'
        }
      ];

      setDocuments(mockDocuments);
      setPastPerformance(mockPastPerformance);
      setTeamingPartners(mockTeamingPartners);
    } catch (err) {
      console.error('Error loading knowledge base:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const getCategoryCount = (categoryId: string) => {
    if (categoryId === 'all') return documents.length;
    return documents.filter(doc => doc.category === categoryId).length;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const toggleFavorite = (docId: string) => {
    setDocuments(docs => docs.map(doc => 
      doc.id === docId ? { ...doc, isFavorite: !doc.isFavorite } : doc
    ));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        setUploadError('File size must be less than 50MB');
        return;
      }
      
      // Validate file type
      const validTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'text/plain'
      ];
      
      if (!validTypes.includes(file.type)) {
        setUploadError('Invalid file type. Please upload PDF, Word, Excel, PowerPoint, or Text files.');
        return;
      }
      
      setSelectedFile(file);
      setUploadError(null);
      
      // Auto-fill title if empty
      if (!uploadForm.title) {
        const fileName = file.name.replace(/\.[^/.]+$/, ''); // Remove extension
        setUploadForm(prev => ({ ...prev, title: fileName }));
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadError('Please select a file');
      return;
    }
    
    if (!uploadForm.title) {
      setUploadError('Please enter a title');
      return;
    }

    try {
      setUploading(true);
      setUploadError(null);
      
      const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
      
      if (!token) {
        setUploadError('Please login to upload documents');
        return;
      }

      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('title', uploadForm.title);
      formData.append('category', uploadForm.category);
      formData.append('description', uploadForm.description);
      formData.append('tags', uploadForm.tags);

      const response = await fetch(`${API_URL}/api/v1/knowledge/documents/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to upload document');
      }

      const data = await response.json();
      
      // Add the new document to the list
      const newDoc: Document = data.document;
      setDocuments(prev => [newDoc, ...prev]);
      
      setUploadSuccess('Document uploaded successfully!');
      
      // Reset form after 2 seconds
      setTimeout(() => {
        setShowUploadModal(false);
        setUploadSuccess(null);
        setSelectedFile(null);
        setUploadForm({
          title: '',
          category: 'templates',
          description: '',
          tags: ''
        });
      }, 2000);
      
    } catch (err: any) {
      console.error('Upload error:', err);
      setUploadError(err.message || 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const getFileIcon = (type: string) => {
    if (type.includes('Word')) return <FileText className="w-8 h-8 text-blue-600" />;
    if (type.includes('PDF')) return <File className="w-8 h-8 text-red-600" />;
    if (type.includes('Excel')) return <FileCheck className="w-8 h-8 text-green-600" />;
    if (type.includes('PowerPoint')) return <FileText className="w-8 h-8 text-orange-600" />;
    return <File className="w-8 h-8 text-gray-600" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <BookOpen className="w-10 h-10 text-indigo-600" />
                Knowledge Base
              </h1>
              <p className="text-lg text-gray-600">
                Reusable content, templates, past performance, and document library
              </p>
            </div>
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Upload Document
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-semibold mb-1">Total Documents</p>
                <p className="text-3xl font-bold text-gray-900">{documents.length}</p>
              </div>
              <FileText className="w-12 h-12 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-semibold mb-1">Past Performance</p>
                <p className="text-3xl font-bold text-gray-900">{pastPerformance.length}</p>
              </div>
              <Award className="w-12 h-12 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-semibold mb-1">Teaming Partners</p>
                <p className="text-3xl font-bold text-gray-900">{teamingPartners.length}</p>
              </div>
              <Users className="w-12 h-12 text-purple-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-indigo-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-semibold mb-1">Total Downloads</p>
                <p className="text-3xl font-bold text-gray-900">
                  {documents.reduce((sum, doc) => sum + doc.downloads, 0)}
                </p>
              </div>
              <Download className="w-12 h-12 text-indigo-500" />
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-lg mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setSelectedTab('documents')}
              className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                selectedTab === 'documents'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FileText className="w-5 h-5 inline mr-2" />
              Documents ({documents.length})
            </button>
            <button
              onClick={() => setSelectedTab('performance')}
              className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                selectedTab === 'performance'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Award className="w-5 h-5 inline mr-2" />
              Past Performance ({pastPerformance.length})
            </button>
            <button
              onClick={() => setSelectedTab('partners')}
              className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                selectedTab === 'partners'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Users className="w-5 h-5 inline mr-2" />
              Teaming Partners ({teamingPartners.length})
            </button>
          </div>
        </div>

        {/* Documents Tab */}
        {selectedTab === 'documents' && (
          <>
            {/* Search and Filters */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search documents, tags, descriptions..."
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`px-3 py-2 flex items-center gap-2 ${
                        viewMode === 'grid' 
                          ? 'bg-indigo-600 text-white' 
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Grid3x3 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`px-3 py-2 flex items-center gap-2 ${
                        viewMode === 'list' 
                          ? 'bg-indigo-600 text-white' 
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <List className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Categories */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Categories
              </h3>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                      selectedCategory === cat.id
                        ? 'bg-indigo-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {cat.icon}
                    {cat.name}
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      selectedCategory === cat.id
                        ? 'bg-white/20 text-white'
                        : 'bg-gray-200 text-gray-700'
                    }`}>
                      {getCategoryCount(cat.id)}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Documents Grid/List */}
            {loading ? (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading documents...</p>
              </div>
            ) : filteredDocuments.length === 0 ? (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <FileText className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No Documents Found</h3>
                <p className="text-gray-600">
                  {searchTerm ? 'Try adjusting your search terms' : 'Upload your first document to get started'}
                </p>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDocuments.map(doc => (
                  <div key={doc.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        {getFileIcon(doc.type)}
                      </div>
                      <button
                        onClick={() => toggleFavorite(doc.id)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Star className={`w-5 h-5 ${doc.isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`} />
                      </button>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                      {doc.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {doc.description}
                    </p>

                    <div className="flex flex-wrap gap-1 mb-3">
                      {doc.tags.slice(0, 3).map((tag, idx) => (
                        <span key={idx} className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {doc.views}
                      </div>
                      <div className="flex items-center gap-1">
                        <Download className="w-3 h-3" />
                        {doc.downloads}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(doc.lastModified)}
                      </div>
                    </div>

                    <div className="flex gap-2 pt-3 border-t border-gray-200">
                      <button className="flex-1 px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center gap-1">
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                      <button className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                {filteredDocuments.map((doc, idx) => (
                  <div key={doc.id} className={`p-4 hover:bg-gray-50 transition-colors ${idx !== filteredDocuments.length - 1 ? 'border-b border-gray-200' : ''}`}>
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        {getFileIcon(doc.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-base font-bold text-gray-900 truncate">
                            {doc.title}
                          </h3>
                          {doc.isFavorite && (
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-1 mb-2">
                          {doc.description}
                        </p>
                        <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                          <span>{doc.type}</span>
                          <span>•</span>
                          <span>{doc.size}</span>
                          <span>•</span>
                          <span>{doc.views} views</span>
                          <span>•</span>
                          <span>{doc.downloads} downloads</span>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center gap-1">
                          <Download className="w-4 h-4" />
                          Download
                        </button>
                        <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Past Performance Tab */}
        {selectedTab === 'performance' && (
          <div className="space-y-4">
            {pastPerformance.map(perf => (
              <div key={perf.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{perf.projectName}</h3>
                    <div className="flex items-center gap-4 text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <Building2 className="w-4 h-4" />
                        <span className="font-semibold">{perf.client}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        <span className="font-semibold text-green-700">{formatCurrency(perf.contractValue)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                      perf.status === 'completed' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {perf.status.toUpperCase()}
                    </span>
                    <div className="flex items-center gap-1">
                      {[...Array(perf.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                </div>

                <p className="text-gray-700 mb-4">{perf.description}</p>

                <div className="flex items-center gap-6 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>Start: {formatDate(perf.startDate)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>End: {formatDate(perf.endDate)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Teaming Partners Tab */}
        {selectedTab === 'partners' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {teamingPartners.map(partner => (
              <div key={partner.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">{partner.companyName}</h3>
                  <Users className="w-8 h-8 text-indigo-600" />
                </div>

                <div className="mb-4">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Core Capabilities:</p>
                  <div className="flex flex-wrap gap-2">
                    {partner.capabilities.map((cap, idx) => (
                      <span key={idx} className="px-3 py-1 bg-indigo-100 text-indigo-700 text-sm font-medium rounded">
                        {cap}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Certifications:</p>
                  <div className="flex flex-wrap gap-2">
                    {partner.certifications.map((cert, idx) => (
                      <span key={idx} className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded">
                        <CheckCircle className="w-3 h-3 inline mr-1" />
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                  <div>
                    <p className="text-xs text-gray-600 font-semibold mb-1">Past Projects</p>
                    <p className="text-2xl font-bold text-indigo-600">{partner.pastProjects}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-semibold mb-1">Contact</p>
                    <p className="text-sm font-semibold text-gray-900">{partner.contactPerson}</p>
                  </div>
                </div>

                <div className="mt-4 text-xs text-gray-500">
                  Last Engagement: {formatDate(partner.lastEngagement)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Upload Document</h2>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setUploadError(null);
                  setUploadSuccess(null);
                  setSelectedFile(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Error/Success Messages */}
            {uploadError && (
              <div className="mb-4 bg-red-50 border-2 border-red-200 rounded-lg p-3 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <span className="text-red-800 text-sm">{uploadError}</span>
              </div>
            )}
            
            {uploadSuccess && (
              <div className="mb-4 bg-green-50 border-2 border-green-200 rounded-lg p-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-green-800 text-sm">{uploadSuccess}</span>
              </div>
            )}

            {/* File Upload Area */}
            <div className="mb-6">
              <input
                type="file"
                id="file-upload"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                onChange={handleFileSelect}
                className="hidden"
              />
              <label
                htmlFor="file-upload"
                className="block border-4 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-indigo-400 transition-colors cursor-pointer"
              >
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-lg font-semibold text-gray-900 mb-1">
                  {selectedFile ? selectedFile.name : 'Click to upload or drag and drop'}
                </p>
                <p className="text-sm text-gray-600">
                  PDF, Word, Excel, PowerPoint, or Text files (max 50MB)
                </p>
              </label>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Title <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter document title"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Category <span className="text-red-600">*</span>
                </label>
                <select
                  value={uploadForm.category}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="templates">Templates</option>
                  <option value="past-performance">Past Performance</option>
                  <option value="proposals">Proposals</option>
                  <option value="compliance">Compliance</option>
                  <option value="technical">Technical Docs</option>
                  <option value="teaming">Teaming Agreements</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter document description..."
                  rows={3}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={uploadForm.tags}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="e.g., Grant, Federal, Template"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={handleUpload}
                disabled={uploading || !selectedFile || !uploadForm.title}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    Upload Document
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setUploadError(null);
                  setSelectedFile(null);
                }}
                disabled={uploading}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

