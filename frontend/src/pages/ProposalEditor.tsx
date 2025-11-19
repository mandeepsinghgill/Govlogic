import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SharePointSyncButton from '../components/SharePointSyncButton';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const WS_URL = API_URL.replace('http', 'ws');

interface ProposalSection {
  id: string;
  title: string;
  content: string;
  order: number;
}

interface CollaboratorCursor {
  userId: string;
  userName: string;
  color: string;
  position: number;
}

const ProposalEditor: React.FC = () => {
  const { proposalId } = useParams();
  const navigate = useNavigate();
  
  const [proposal, setProposal] = useState<any>(null);
  const [sections, setSections] = useState<ProposalSection[]>([]);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [content, setContent] = useState('');
  const [collaborators, setCollaborators] = useState<CollaboratorCursor[]>([]);
  const [saving, setSaving] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  
  useEffect(() => {
    // Load proposal data
    loadProposal();
    
    // Connect to WebSocket for real-time collaboration
    connectWebSocket();
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [proposalId]);
  
  const loadProposal = async () => {
    try {
      // Fetch from API
      const response = await fetch(`${API_URL}/api/v1/proposals-data/${proposalId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to load proposal');
      }
      
      const proposalData = await response.json();
      
      setProposal(proposalData);
      setSections(proposalData.sections);
      
      if (proposalData.sections.length > 0) {
        setActiveSection(proposalData.sections[0].id);
        setContent(proposalData.sections[0].content);
      }
    } catch (error) {
      console.error('Failed to load proposal:', error);
      // Fallback to mock data for demo
      const mockProposal = {
        id: proposalId,
        title: 'Fairfax County IT Staff Augmentation Proposal',
        rfp_number: 'RFP-2000003964',
        status: 'draft',
        created_at: '2024-10-18',
        sections: [
          { id: '1', title: '1.0 Introduction', content: '', order: 1 },
          { id: '2', title: '2.0 Understanding of the Statement of Needs', content: '', order: 2 },
          { id: '3', title: '3.0 Proposed Technical Approaches', content: '', order: 3 },
          { id: '4', title: '4.0 Treatment of the Issues', content: '', order: 4 },
          { id: '5', title: '5.0 Statement of Qualifications', content: '', order: 5 },
          { id: '6', title: '6.0 Financial Statements', content: '', order: 6 },
        ]
      };
      
      setProposal(mockProposal);
      setSections(mockProposal.sections);
      
      if (mockProposal.sections.length > 0) {
        setActiveSection(mockProposal.sections[0].id);
        setContent(mockProposal.sections[0].content);
      }
    }
  };
  
  const connectWebSocket = () => {
    // Connect to WebSocket server
    const token = localStorage.getItem('access_token');
    if (!token || !proposalId) return;
    
    const wsUrl = `${WS_URL}/api/v1/realtime/proposals/${proposalId}?token=${token}`;
    
    try {
      wsRef.current = new WebSocket(wsUrl);
      
      wsRef.current.onopen = () => {
        console.log('WebSocket connected');
      };
      
      wsRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        handleWebSocketMessage(data);
      };
      
      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
      
      wsRef.current.onclose = () => {
        console.log('WebSocket disconnected');
      };
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
    }
  };
  
  const handleWebSocketMessage = (data: any) => {
    switch (data.type) {
      case 'user_joined':
        console.log(`${data.user_name} joined`);
        break;
      case 'user_left':
        console.log(`${data.user_name} left`);
        break;
      case 'content_changed':
        // Update content if editing different section
        if (data.section_id !== activeSection) {
          const updatedSections = sections.map(s =>
            s.id === data.section_id ? { ...s, content: data.content } : s
          );
          setSections(updatedSections);
        }
        break;
      case 'cursor_update':
        // Update collaborator cursors
        setCollaborators(prev => {
          const filtered = prev.filter(c => c.userId !== data.user_id);
          return [...filtered, {
            userId: data.user_id,
            userName: data.user_name || 'User',
            color: '#' + Math.floor(Math.random()*16777215).toString(16),
            position: data.position
          }];
        });
        break;
      case 'initial_state':
        // Set initial collaborators
        if (data.active_users) {
          setCollaborators(data.active_users.map((u: any) => ({
            userId: u.user_id,
            userName: u.user_name,
            color: '#' + Math.floor(Math.random()*16777215).toString(16),
            position: u.position || 0
          })));
        }
        break;
    }
  };
  
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    
    // Send update via WebSocket
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'content_update',
        section_id: activeSection,
        content: newContent,
        cursor_position: e.target.selectionStart
      }));
    }
    
    // Auto-save after 2 seconds of inactivity
    debouncedSave(newContent);
  };
  
  const debouncedSave = (() => {
    let timeout: NodeJS.Timeout;
    return (content: string) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => saveContent(content), 2000);
    };
  })();
  
  const saveContent = async (contentToSave: string) => {
    setSaving(true);
    try {
      // In production: Save to API
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log('Content saved');
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      setSaving(false);
    }
  };
  
  const handleSectionClick = (sectionId: string) => {
    // Save current section before switching
    if (activeSection) {
      const updatedSections = sections.map(s =>
        s.id === activeSection ? { ...s, content } : s
      );
      setSections(updatedSections);
    }
    
    // Switch to new section
    const section = sections.find(s => s.id === sectionId);
    if (section) {
      setActiveSection(sectionId);
      setContent(section.content);
    }
  };
  
  const handleExport = async (format: 'word' | 'excel' | 'pdf') => {
    try {
      const exportData = {
        proposal_id: proposalId,
        title: proposal.title,
        rfp_info: {
          agency: 'Fairfax County Government',
          title: 'IT Staff Augmentation and IT Services',
          number: proposal.rfp_number
        },
        company: {
          name: 'Your Company Name',
          address: '123 Main Street',
          city: 'Alexandria',
          state: 'VA',
          zip: '22315',
          phone: '(703) 555-1234'
        },
        sections: sections.map(s => ({
          title: s.title,
          content: s.content,
          subsections: [],
          tables: []
        })),
        include_cover_page: true,
        include_toc: true
      };
      
      const endpoint = format === 'excel' ? '/api/v1/documents/export/excel' : `/api/v1/documents/export/${format}`;
      
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(format === 'excel' ? {
          proposal_title: proposal.title,
          rfp_number: proposal.rfp_number,
          labor_categories: [],
          cost_items: [],
          totals: { 'Total Cost': 0 }
        } : exportData)
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${proposal.title}.${format === 'word' ? 'docx' : format === 'excel' ? 'xlsx' : 'pdf'}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    }
    
    setShowExportMenu(false);
  };
  
  const generateWithAI = async () => {
    if (!activeSection) return;
    
    try {
      const section = sections.find(s => s.id === activeSection);
      if (!section) return;
      
      // Call AI generation API
      const response = await fetch(`${API_URL}/api/v1/documents/learn/generate-section`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          section_title: section.title,
          requirements: ['Address all RFP requirements', 'Demonstrate qualifications', 'Provide examples'],
          context: {
            proposal_title: proposal.title,
            rfp_number: proposal.rfp_number
          }
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setContent(data.generated_content || 'AI-generated content will appear here...');
      }
    } catch (error) {
      console.error('AI generation failed:', error);
    }
  };
  
  if (!proposal) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading proposal...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/proposals')}
              className="text-gray-600 hover:text-gray-900"
            >
              ← Back
            </button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{proposal.title}</h1>
              <p className="text-sm text-gray-500">RFP: {proposal.rfp_number}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {saving && (
              <span className="text-sm text-gray-500">Saving...</span>
            )}
            {!saving && (
              <span className="text-sm text-green-600">✓ Saved</span>
            )}
            
            <button
              onClick={generateWithAI}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center space-x-2"
            >
              <span>✨</span>
              <span>Generate with AI</span>
            </button>
            
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              >
                <span>📥</span>
                <span>Export</span>
              </button>
              
              {showExportMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                  <button
                    onClick={() => handleExport('word')}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center space-x-2"
                  >
                    <span>📄</span>
                    <span>Export to Word</span>
                  </button>
                  <button
                    onClick={() => handleExport('excel')}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center space-x-2"
                  >
                    <span>📊</span>
                    <span>Export to Excel</span>
                  </button>
                  <button
                    onClick={() => handleExport('pdf')}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center space-x-2"
                  >
                    <span>📕</span>
                    <span>Export to PDF</span>
                  </button>
                  <div className="border-t border-gray-200 my-1"></div>
                  {proposalId && (
                    <div className="px-4 py-2">
                      <SharePointSyncButton 
                        proposalId={proposalId}
                        className="w-full"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              Share
            </button>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Sections */}
        <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-4">
            <h2 className="text-sm font-semibold text-gray-700 uppercase mb-3">Sections</h2>
            <div className="space-y-1">
              {sections.map(section => (
                <button
                  key={section.id}
                  onClick={() => handleSectionClick(section.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    activeSection === section.id
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <div className="font-medium">{section.title}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {section.content ? `${section.content.split(' ').length} words` : 'Empty'}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Editor */}
        <div className="flex-1 flex flex-col">
          <div className="bg-white border-b border-gray-200 px-6 py-3">
            <h2 className="text-lg font-semibold text-gray-900">
              {sections.find(s => s.id === activeSection)?.title}
            </h2>
          </div>
          
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="max-w-4xl mx-auto">
              <textarea
                ref={editorRef}
                value={content}
                onChange={handleContentChange}
                className="w-full h-full min-h-[600px] p-6 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-serif text-lg leading-relaxed"
                placeholder="Start writing your proposal section here..."
              />
            </div>
          </div>
        </div>
        
        {/* Right Sidebar - Collaborators & AI Suggestions */}
        <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
          <div className="p-4">
            <h2 className="text-sm font-semibold text-gray-700 uppercase mb-3">Collaborators</h2>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 p-2 bg-green-50 rounded-lg">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold">
                  You
                </div>
                <div>
                  <div className="text-sm font-medium">You (Editing)</div>
                  <div className="text-xs text-gray-500">Active now</div>
                </div>
              </div>
            </div>
            
            <h2 className="text-sm font-semibold text-gray-700 uppercase mb-3 mt-6">AI Suggestions</h2>
            <div className="space-y-3">
              <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-start space-x-2">
                  <span className="text-purple-600">💡</span>
                  <div>
                    <p className="text-sm text-gray-700">
                      Consider adding more specific examples from past performance
                    </p>
                    <button className="text-xs text-purple-600 hover:text-purple-700 mt-1">
                      Apply suggestion
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start space-x-2">
                  <span className="text-blue-600">📊</span>
                  <div>
                    <p className="text-sm text-gray-700">
                      This section is 30% shorter than similar winning proposals
                    </p>
                    <button className="text-xs text-blue-600 hover:text-blue-700 mt-1">
                      Expand section
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProposalEditor;

