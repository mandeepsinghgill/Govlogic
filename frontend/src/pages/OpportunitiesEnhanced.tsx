import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import BidPreferencesModal from '../components/BidPreferencesModal';
import { 
  Target, TrendingUp, DollarSign, Calendar, MapPin, Building2, 
  CheckCircle, AlertCircle, ArrowRight, ChevronDown, ChevronUp,
  Sparkles, Zap, FileText, Users, Settings, ArrowLeft
} from 'lucide-react';

// Circular Compliance Gauge Component
function ComplianceGauge({ score, size = 120 }: { score: number; size?: number }) {
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  
  const getColor = (score: number) => {
    if (score >= 80) return '#10b981'; // green
    if (score >= 60) return '#f59e0b'; // yellow
    return '#ef4444'; // red
  };

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r="45"
          stroke="#e5e7eb"
          strokeWidth="10"
          fill="none"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r="45"
          stroke={getColor(score)}
          strokeWidth="10"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-gray-900">{score}</span>
        <span className="text-xs text-gray-500">Score</span>
      </div>
    </div>
  );
}

// Action Card Component
function ActionCard({ title, description, icon, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className="w-full p-4 bg-blue-50 border-2 border-blue-200 rounded-lg hover:bg-blue-100 transition-all text-left group"
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
          {icon}
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 group-hover:text-blue-900">{title}</h4>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        </div>
        <CheckCircle className="text-blue-500 flex-shrink-0" size={20} />
      </div>
    </button>
  );
}

// Contract Section Accordion
function ContractSection({ letter, title, summary, isExpanded, onToggle }: any) {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 flex items-center justify-between transition-colors"
      >
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-900 text-white rounded-lg flex items-center justify-center font-bold">
            {letter}
          </div>
          <span className="font-semibold text-gray-900">{title}</span>
        </div>
        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>
      {isExpanded && (
        <div className="px-4 py-3 bg-white border-t border-gray-200">
          <p className="text-sm text-gray-700">{summary}</p>
        </div>
      )}
    </div>
  );
}

export default function OpportunitiesEnhanced() {
  const navigate = useNavigate();
  const { opportunityId } = useParams();
  const [selectedOpp, setSelectedOpp] = useState<any>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [showPreferences, setShowPreferences] = useState(false);
  const [opportunity, setOpportunity] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [brief, setBrief] = useState<any>(null);
  const [briefLoading, setBriefLoading] = useState(false);
  const [showBrief, setShowBrief] = useState(false);

  // Fetch opportunity details from backend
  useEffect(() => {
    const fetchOpportunityDetails = async () => {
      if (!opportunityId) {
        setError('No opportunity ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const token = localStorage.getItem('access_token');
        const response = await fetch(`http://localhost:8000/api/v1/opportunities/${opportunityId}/details`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch opportunity details');
        }

        const data = await response.json();
        
        // Transform the data to match our component's expected format
        const transformedData = {
          id: data.id,
          title: data.title,
          agency: data.agency,
          naics: data.naicsCode,
          value: typeof data.value === 'number' ? `$${(data.value / 1000000).toFixed(1)}M` : 'TBD',
          deadline: data.dueDate ? new Date(data.dueDate).toLocaleDateString() : 'TBD',
          location: data.placeOfPerformance?.city ? `${data.placeOfPerformance.city}, ${data.placeOfPerformance.state}` : 'Remote/Various',
          setAside: data.setAside || 'Full and Open Competition',
          complianceScore: 83, // Default, would come from AI analysis
          pwin: 72, // Default, would come from AI analysis
          aiAnalysis: data.fullDescription || data.synopsis || 'Full opportunity details available from SAM.gov.',
          scoreExplanation: 'AI-powered analysis available with full subscription.',
          sections: data.sections && data.sections.length > 0 ? data.sections : [
            { letter: 'H', title: 'Special Contract Requirements', summary: 'See full solicitation document on SAM.gov for details.' },
            { letter: 'I', title: 'Contract Clauses', summary: 'See full solicitation document on SAM.gov for details.' },
            { letter: 'J', title: 'List of Attachments', summary: data.attachments?.map((a: any) => a.name).join(', ') || 'See SAM.gov for attachments.' },
            { letter: 'K', title: 'Representations and Certifications', summary: 'SAM.gov registration and standard certifications required.' },
            { letter: 'L', title: 'Instructions, Conditions, and Notices', summary: `Proposals due: ${data.dueDate ? new Date(data.dueDate).toLocaleDateString() : 'See SAM.gov'}` }
          ],
          qualificationBrief: {
            eligible: true,
            reasons: [
              { check: true, text: `Set-aside: ${data.setAside || 'Full and Open'}` },
              { check: true, text: `NAICS ${data.naicsCode || 'Various'}` },
              { check: true, text: 'SAM.gov registration required' },
              { check: true, text: 'Review full requirements in solicitation' }
            ]
          },
          suggestedActions: [
            { 
              title: 'Start Building Proposal', 
              description: 'Generate Shipley-compliant outline in 2 minutes', 
              icon: <FileText className="text-white" size={16} />,
              handler: 'handleStartProposal'
            },
            { 
              title: 'Review Past Performance', 
              description: 'Find relevant projects in your library', 
              icon: <CheckCircle className="text-white" size={16} />,
              handler: 'handleReviewPastPerformance'
            },
            { 
              title: 'Identify Teaming Partners', 
              description: 'Search for qualified partners', 
              icon: <Users className="text-white" size={16} />,
              handler: 'handleTeamingPartners'
            },
            { 
              title: 'View on SAM.gov', 
              description: 'Open full solicitation on SAM.gov', 
              icon: <Calendar className="text-white" size={16} />,
              handler: 'handleViewSAMGov'
            }
          ],
          samGovUrl: data.samGovUrl || data.url,
          mockGenerated: data.mockGenerated,
          note: data.note
        };

        setOpportunity(transformedData);
        setError(null);
      } catch (err) {
        console.error('Error fetching opportunity:', err);
        setError(err instanceof Error ? err.message : 'Failed to load opportunity');
      } finally {
        setLoading(false);
      }
    };

    fetchOpportunityDetails();
  }, [opportunityId]);

  const toggleSection = (letter: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(letter)) {
      newExpanded.delete(letter);
    } else {
      newExpanded.add(letter);
    }
    setExpandedSections(newExpanded);
  };

  // Action handlers
  const handleStartProposal = () => {
    if (!opportunity) return;
    
    navigate('/proposals/new', { 
      state: { 
        opportunityId: opportunityId || '1',
        opportunityTitle: opportunity.title,
        agency: opportunity.agency,
        naics: opportunity.naics,
        value: opportunity.value
      } 
    });
  };

  const handleReviewPastPerformance = () => {
    if (!opportunity) return;
    
    // Navigate to knowledge base filtered by relevant projects
    navigate('/knowledge', { 
      state: { 
        filter: 'past-performance',
        naics: opportunity.naics 
      } 
    });
  };

  const handleTeamingPartners = () => {
    if (!opportunity) return;
    
    // Navigate to partner search with filters
    navigate('/partner-search', { 
      state: { 
        expertise: 'electric vehicle',
        naics: opportunity.naics 
      } 
    });
  };

  const handleScheduleSiteVisit = () => {
    if (!opportunity) return;
    
    // Create calendar event
    const eventDate = new Date('2024-11-15T10:00:00');
    const eventTitle = `Site Visit: ${opportunity.title}`;
    const eventDetails = `Location: ${opportunity.location}\nAgency: ${opportunity.agency}`;
    
    // Create ICS format
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART:20241115T100000
DTEND:20241115T120000
SUMMARY:${eventTitle}
DESCRIPTION:${eventDetails}
LOCATION:${opportunity.location}
END:VEVENT
END:VCALENDAR`;
    
    // Create download link
    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'site-visit.ics';
    link.click();
    window.URL.revokeObjectURL(url);
    
    alert('✅ Calendar event created! Check your downloads.');
  };

  const handleViewSAMGov = () => {
    if (opportunity?.samGovUrl) {
      window.open(opportunity.samGovUrl, '_blank');
    } else {
      alert('SAM.gov link not available');
    }
  };

  const handleGenerateBrief = async () => {
    if (!opportunityId) {
      alert('No opportunity ID available');
      return;
    }

    try {
      setBriefLoading(true);
      const response = await fetch('http://localhost:8000/api/v1/briefs/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ opportunityId })
      });

      if (!response.ok) {
        throw new Error('Failed to generate brief');
      }

      const data = await response.json();
      setBrief(data);
      setShowBrief(true);
    } catch (err) {
      console.error('Error generating brief:', err);
      alert('Failed to generate brief. Please try again.');
    } finally {
      setBriefLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading opportunity details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !opportunity) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Failed to Load Opportunity</h2>
          <p className="text-gray-600 mb-4">{error || 'Opportunity not found'}</p>
          <button
            onClick={() => navigate('/opportunities')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Opportunities
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Mock Data Banner */}
      {opportunity.mockGenerated && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="text-yellow-600 mr-2 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <p className="text-sm font-semibold text-yellow-900">Mock Data</p>
              <p className="text-sm text-yellow-700">{opportunity.note}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/opportunities')}
            className="p-2 hover:bg-gray-100 rounded-lg"
            title="Back to all opportunities"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Opportunity Details</h1>
            <p className="text-gray-600 mt-1">AI-powered opportunity intelligence</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Link
            to="/proposals/new"
            state={{ opportunityId: opportunityId || '1', opportunityTitle: opportunity.title }}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center"
          >
            <Zap size={20} className="mr-2" />
            Generate Proposal
          </Link>
          <button
            onClick={() => handleGenerateBrief()}
            className="px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 flex items-center"
          >
            <FileText size={20} className="mr-2" />
            Generate Brief
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Opportunity Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Card */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{opportunity.title}</h2>
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <span className="flex items-center">
                    <Building2 size={16} className="mr-1" />
                    {opportunity.agency}
                  </span>
                  <span className="flex items-center">
                    <MapPin size={16} className="mr-1" />
                    {opportunity.location}
                  </span>
                  <span className="flex items-center">
                    <Calendar size={16} className="mr-1" />
                    Due: {opportunity.deadline}
                  </span>
                </div>
              </div>
              
              {/* Compliance Score Gauge */}
              <div className="ml-6">
                <ComplianceGauge score={opportunity.complianceScore} />
              </div>
            </div>

            {/* Score Explanation */}
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
              <div className="flex items-start">
                <Sparkles className="text-blue-600 mr-2 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="text-sm font-semibold text-blue-900 mb-1">Why this score?</p>
                  <p className="text-sm text-gray-700">{opportunity.scoreExplanation}</p>
                </div>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-4 gap-4 mt-6">
              <MetricCard label="Contract Value" value={opportunity.value} icon={<DollarSign size={20} />} />
              <MetricCard label="PWin" value={`${opportunity.pwin}%`} icon={<TrendingUp size={20} />} />
              <MetricCard label="NAICS" value={opportunity.naics} icon={<Target size={20} />} />
              <MetricCard label="Set-Aside" value={opportunity.setAside} icon={<CheckCircle size={20} />} />
            </div>
          </div>

          {/* AI Match Analysis (Narrative) */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-4">
              <Sparkles className="text-purple-600 mr-2" size={24} />
              <h3 className="text-xl font-bold text-gray-900">AI Match Analysis</h3>
            </div>
            <div className="prose prose-sm max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: opportunity.aiAnalysis.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>') }} />
          </div>

          {/* Qualification Brief (Structured) */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Why You Qualify</h3>
            <div className="space-y-3">
              {opportunity.qualificationBrief.reasons.map((reason: any, i: number) => (
                <div key={i} className="flex items-start">
                  {reason.check ? (
                    <CheckCircle className="text-green-500 mr-3 flex-shrink-0 mt-0.5" size={20} />
                  ) : (
                    <AlertCircle className="text-yellow-500 mr-3 flex-shrink-0 mt-0.5" size={20} />
                  )}
                  <span className="text-gray-700">{reason.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Contract Breakdown (Accordion) */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Contract Breakdown</h3>
            <div className="space-y-2">
              {opportunity.sections.map((section: any) => (
                <ContractSection
                  key={section.letter}
                  letter={section.letter}
                  title={section.title}
                  summary={section.summary}
                  isExpanded={expandedSections.has(section.letter)}
                  onToggle={() => toggleSection(section.letter)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right: AI Agent Sidebar */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-blue-900 to-indigo-900 rounded-xl shadow-lg p-6 text-white sticky top-6">
            <div className="flex items-center mb-4">
              <Zap className="mr-2" size={24} />
              <h3 className="text-xl font-bold">GovSure AI Agent</h3>
            </div>
            <p className="text-blue-100 text-sm mb-6">
              Recommended next steps to maximize your win probability
            </p>
            
            <div className="space-y-3">
              {opportunity.suggestedActions.map((action: any, i: number) => {
                const actionHandlers: { [key: string]: () => void } = {
                  'handleStartProposal': handleStartProposal,
                  'handleReviewPastPerformance': handleReviewPastPerformance,
                  'handleTeamingPartners': handleTeamingPartners,
                  'handleScheduleSiteVisit': handleScheduleSiteVisit,
                  'handleViewSAMGov': handleViewSAMGov
                };
                
                return (
                  <ActionCard 
                    key={i}
                    title={action.title}
                    description={action.description}
                    icon={action.icon}
                    onClick={actionHandlers[action.handler] || (() => alert(`Action: ${action.title}`))}
                  />
                );
              })}
            </div>

            <button 
              onClick={() => setShowPreferences(true)}
              className="w-full mt-6 px-4 py-3 bg-white text-blue-900 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center justify-center"
            >
              <Settings size={20} className="mr-2" />
              Adjust Bid Preferences
            </button>
          </div>
        </div>
      </div>

      {/* Brief Modal */}
      {showBrief && brief && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Shipley-Compliant Opportunity Brief</h2>
                  {brief.shipleyCompliant && (
                    <p className="text-sm text-green-600 font-semibold mt-1">✓ Shipley Methodology Applied</p>
                  )}
                </div>
                <button
                  onClick={() => setShowBrief(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Overview */}
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="text-lg font-bold text-gray-900 mb-3">{brief.title}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Fit Score</span>
                    <p className="font-bold text-xl text-green-600">{brief.overview.fitScore}%</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Agency</span>
                    <p className="font-semibold text-gray-900">{brief.overview.agency}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Value</span>
                    <p className="font-semibold text-gray-900">{brief.overview.estimatedValue}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">NAICS</span>
                    <p className="font-semibold text-gray-900">{brief.overview.naics}</p>
                  </div>
                </div>
              </div>

              {/* Shipley Bid Decision Matrix */}
              {brief.bidDecisionMatrix && (
                <div className="mb-6 p-5 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border-2 border-green-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                    <span className="mr-2">🎯</span>
                    Shipley Bid Decision Matrix
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Relationship</p>
                      <p className="text-2xl font-bold text-gray-900">{brief.bidDecisionMatrix.relationship}%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Price to Win</p>
                      <p className="text-2xl font-bold text-gray-900">{brief.bidDecisionMatrix.priceToWin}%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Solution</p>
                      <p className="text-2xl font-bold text-gray-900">{brief.bidDecisionMatrix.solution}%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Competitive</p>
                      <p className="text-2xl font-bold text-gray-900">{brief.bidDecisionMatrix.competitivePosition}%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">PWin Score</p>
                      <p className="text-3xl font-bold text-green-600">{brief.bidDecisionMatrix.overallScore}%</p>
                    </div>
                  </div>
                  <div className={`p-3 rounded-lg ${
                    brief.bidDecisionMatrix.gate === 'GREEN' ? 'bg-green-100 border-2 border-green-500' :
                    brief.bidDecisionMatrix.gate === 'YELLOW' ? 'bg-yellow-100 border-2 border-yellow-500' :
                    'bg-red-100 border-2 border-red-500'
                  }`}>
                    <p className="font-bold text-gray-900">
                      <span className={`text-2xl mr-2 ${
                        brief.bidDecisionMatrix.gate === 'GREEN' ? 'text-green-600' :
                        brief.bidDecisionMatrix.gate === 'YELLOW' ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {brief.bidDecisionMatrix.gate}
                      </span>
                      {brief.bidDecisionMatrix.recommendation}
                    </p>
                  </div>
                </div>
              )}

              {/* Win Strategy & Themes */}
              {brief.winStrategy && (
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                    <span className="mr-2">🏆</span>
                    Win Strategy & Themes
                  </h3>
                  <div className="p-4 bg-purple-50 rounded-lg mb-4">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Win Strategy Statement:</p>
                    <p className="text-gray-900">{brief.winStrategy.winStrategyStatement}</p>
                  </div>
                  <div className="space-y-4">
                    {brief.winStrategy.themes.map((theme: any, i: number) => (
                      <div key={i} className="p-4 bg-white border-2 border-purple-200 rounded-lg">
                        <h4 className="font-bold text-purple-900 mb-2">{theme.theme}</h4>
                        <p className="text-sm text-gray-600 mb-2 italic">{theme.discriminator}</p>
                        <ul className="space-y-1">
                          {theme.proofPoints.map((point: string, j: number) => (
                            <li key={j} className="text-sm text-gray-700 flex items-start">
                              <span className="text-purple-500 mr-2">✓</span>
                              {point}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700">
                      <strong>Ghosting Strategy:</strong> {brief.winStrategy.ghostingStrategy}
                    </p>
                  </div>
                </div>
              )}

              {/* Discriminators */}
              {brief.discriminators && brief.discriminators.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                    <span className="mr-2">⚡</span>
                    Key Discriminators
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {brief.discriminators.map((disc: any, i: number) => (
                      <div key={i} className="p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-lg">
                        <h4 className="font-bold text-gray-900 mb-2">{disc.discriminator}</h4>
                        <p className="text-sm text-gray-700 mb-2">{disc.description}</p>
                        <p className="text-xs text-yellow-700 font-semibold">
                          Impact: {disc.competitiveImpact}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Company Match */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-3">Why We Match</h3>
                <ul className="space-y-2">
                  {brief.companyMatch.whyWeMatch.map((reason: string, i: number) => (
                    <li key={i} className="flex items-start">
                      <CheckCircle className="text-green-500 mr-2 flex-shrink-0 mt-0.5" size={16} />
                      <span className="text-gray-700">{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Strengths & Gaps */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Strengths</h3>
                  <ul className="space-y-2">
                    {brief.companyMatch.strengths.map((strength: string, i: number) => (
                      <li key={i} className="flex items-start text-sm">
                        <span className="text-green-500 mr-2">✓</span>
                        <span className="text-gray-700">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Gaps & Recommendations</h3>
                  <ul className="space-y-2">
                    {brief.companyMatch.gaps.map((gap: string, i: number) => (
                      <li key={i} className="flex items-start text-sm">
                        <AlertCircle className="text-yellow-500 mr-2 flex-shrink-0 mt-0.5" size={16} />
                        <span className="text-gray-700">{gap}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Past Performance */}
              {brief.pastPerformance && brief.pastPerformance.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Relevant Past Performance</h3>
                  <div className="space-y-3">
                    {brief.pastPerformance.map((proj: any) => (
                      <div key={proj.id} className="p-3 bg-gray-50 rounded-lg">
                        <h4 className="font-semibold text-gray-900">{proj.title}</h4>
                        <p className="text-sm text-gray-600">{proj.agency} | {proj.dates} | {proj.value}</p>
                        <p className="text-sm text-gray-700 mt-1">{proj.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Competitive Analysis */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                  <span className="mr-2">🎪</span>
                  Competitive Analysis
                </h3>
                
                {brief.competitiveAnalysis.competitors ? (
                  <div className="space-y-4">
                    {brief.competitiveAnalysis.competitors.map((comp: any, i: number) => (
                      <div key={i} className="p-4 bg-white border-2 border-gray-200 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-gray-900">{comp.name}</h4>
                          <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">{comp.type}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3 mb-2">
                          <div>
                            <p className="text-xs font-semibold text-green-600 mb-1">Strengths:</p>
                            <ul className="text-xs text-gray-700">
                              {comp.strengths.map((s: string, j: number) => (
                                <li key={j}>• {s}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-red-600 mb-1">Weaknesses:</p>
                            <ul className="text-xs text-gray-700">
                              {comp.weaknesses.map((w: string, j: number) => (
                                <li key={j}>• {w}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        <div className="bg-blue-50 p-2 rounded text-xs">
                          <strong>Ghosting Strategy:</strong> {comp.ghostingStrategy || comp.phantomStrategy}
                        </div>
                      </div>
                    ))}
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <div className="mb-3">
                        <span className="text-sm text-gray-600">Overall Win Probability: </span>
                        <span className="text-2xl font-bold text-purple-600">{brief.competitiveAnalysis.winProbability}%</span>
                      </div>
                      {brief.competitiveAnalysis.pwinBreakdown && (
                        <div className="grid grid-cols-4 gap-2 text-xs mb-3">
                          <div>Technical: <strong>{brief.competitiveAnalysis.pwinBreakdown.technical}%</strong></div>
                          <div>Management: <strong>{brief.competitiveAnalysis.pwinBreakdown.management}%</strong></div>
                          <div>Past Perf: <strong>{brief.competitiveAnalysis.pwinBreakdown.pastPerformance}%</strong></div>
                          <div>Cost: <strong>{brief.competitiveAnalysis.pwinBreakdown.cost}%</strong></div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <div className="mb-3">
                      <span className="text-sm text-gray-600">Win Probability: </span>
                      <span className="text-xl font-bold text-purple-600">{brief.competitiveAnalysis.winProbability}%</span>
                    </div>
                    <div className="mb-3">
                      <h4 className="font-semibold text-gray-900 mb-2">Key Differentiators:</h4>
                      <ul className="space-y-1">
                        {brief.competitiveAnalysis.differentiators.map((diff: string, i: number) => (
                          <li key={i} className="text-sm text-gray-700 flex items-start">
                            <span className="text-purple-500 mr-2">→</span>
                            {diff}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              {/* Compliance Matrix */}
              {brief.complianceMatrix && (
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                    <span className="mr-2">📋</span>
                    Compliance Matrix ({brief.complianceMatrix.overallCompliance} Compliant)
                  </h3>
                  <div className="space-y-3">
                    {brief.complianceMatrix.sections.map((section: any, i: number) => (
                      <div key={i} className="bg-white border rounded-lg p-3">
                        <h4 className="font-semibold text-gray-900 mb-2">{section.section}</h4>
                        <div className="space-y-1">
                          {section.requirements.map((req: any, j: number) => (
                            <div key={j} className="flex justify-between text-sm">
                              <span className="text-gray-700">{req.id || req.criterion}: {req.requirement || req.criterion}</span>
                              <span className={`font-semibold ${req.status === 'Compliant' || req.strength === 'Strong' ? 'text-green-600' : 'text-yellow-600'}`}>
                                {req.status || req.strength}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Proposal Structure */}
              {brief.proposalStructure && (
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                    <span className="mr-2">📚</span>
                    Shipley Proposal Structure ({brief.proposalStructure.totalPages} pages)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {brief.proposalStructure.volumes.map((vol: any, i: number) => (
                      <div key={i} className="bg-white border-2 border-blue-200 rounded-lg p-3">
                        <h4 className="font-bold text-blue-900 mb-2">{vol.volume}</h4>
                        <p className="text-xs text-gray-600 mb-2">Page Limit: {vol.pageLimit}</p>
                        <ul className="text-xs text-gray-700 space-y-1">
                          {vol.sections.map((section: string, j: number) => (
                            <li key={j}>{section}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Color Team Schedule */}
              {brief.colorTeamSchedule && (
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                    <span className="mr-2">🎨</span>
                    Color Team Review Schedule
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {brief.colorTeamSchedule.map((team: any, i: number) => (
                      <div key={i} className={`p-3 rounded-lg ${
                        team.team === 'Pink Team' ? 'bg-pink-50 border-2 border-pink-300' :
                        team.team === 'Red Team' ? 'bg-red-50 border-2 border-red-300' :
                        team.team === 'Gold Team' ? 'bg-yellow-50 border-2 border-yellow-300' :
                        'bg-gray-800 text-white border-2 border-gray-600'
                      }`}>
                        <h4 className={`font-bold mb-1 ${team.team === 'Black Hat' ? 'text-white' : 'text-gray-900'}`}>{team.team}</h4>
                        <p className={`text-xs mb-2 ${team.team === 'Black Hat' ? 'text-gray-200' : 'text-gray-600'}`}>{team.purpose}</p>
                        <p className={`text-xs ${team.team === 'Black Hat' ? 'text-gray-300' : 'text-gray-500'}`}>
                          <strong>Timing:</strong> {team.timing}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Next Steps */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-3">Recommended Next Steps</h3>
                <ol className="space-y-2">
                  {brief.nextSteps.map((step: string, i: number) => (
                    <li key={i} className="flex items-start">
                      <span className="inline-block w-6 h-6 bg-blue-600 text-white rounded-full text-center text-sm font-bold mr-3 flex-shrink-0">
                        {i + 1}
                      </span>
                      <span className="text-gray-700">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <Link
                  to="/proposals/new"
                  state={{ opportunityId, opportunityTitle: opportunity?.title }}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-center"
                >
                  Start Proposal
                </Link>
                <button
                  onClick={() => setShowBrief(false)}
                  className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay for Brief Generation */}
      {briefLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-700 font-semibold">Generating AI-Powered Brief...</p>
            <p className="text-gray-500 text-sm mt-2">Analyzing opportunity and company match</p>
          </div>
        </div>
      )}

      {/* Bid Preferences Modal */}
      <BidPreferencesModal
        isOpen={showPreferences}
        onClose={() => setShowPreferences(false)}
        onSave={(prefs) => {
          console.log('Saved preferences:', prefs);
          alert('Bid preferences saved! Opportunities will be re-scored.');
        }}
      />
    </div>
  );
}

function MetricCard({ label, value, icon }: any) {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex items-center text-gray-600 mb-1">
        {icon}
        <span className="text-xs ml-1">{label}</span>
      </div>
      <div className="text-lg font-bold text-gray-900">{value}</div>
    </div>
  );
}

