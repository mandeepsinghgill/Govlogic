import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { TrendingUp, Building2, DollarSign, Calendar, ExternalLink, Loader2, Plus, FileText, CalendarPlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppDispatch } from '../store/hooks';
import { addToPipeline } from '../store/pipelineSlice';
import { addToCalendar, getCalendarColor, formatDaysUntilDue, getDaysUntilDue } from '../utils/calendarUtils';

interface Opportunity {
  id: string;
  title: string;
  synopsis: string;
  agency: string;
  value?: number;
  dueDate?: string;
  postedDate?: string;
  pwin_score?: number;
  naicsCode?: string;
  setAside?: string;
  samGovUrl?: string;
  mockGenerated?: boolean;
}

export default function TopOpportunities() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showBrief, setShowBrief] = useState<string | null>(null);
  const [addingToPipeline, setAddingToPipeline] = useState<string | null>(null);
  const dispatch = useAppDispatch();

  useEffect(() => {
    fetchTopOpportunities();
  }, []);

  const fetchTopOpportunities = async () => {
    try {
      setLoading(true);
      // Fetch only 3 opportunities as requested
      const response = await fetch('http://localhost:8000/api/v1/opportunities/top?limit=3', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch opportunities');
      }

      const data = await response.json();
      setOpportunities(data.items || []);
    } catch (err) {
      console.error('Error fetching opportunities:', err);
      setError('Failed to load opportunities');
      // Set empty array so we show "no opportunities"
      setOpportunities([]);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value?: number) => {
    if (!value) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  };

  const handleAddToPipeline = async (opp: Opportunity, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      setAddingToPipeline(opp.id);
      
      // Check if logged in
      const token = localStorage.getItem('access_token');
      if (!token) {
        alert('Please log in first to add items to your pipeline.');
        setAddingToPipeline(null);
        return;
      }
      
      console.log('Adding to pipeline:', {
        opportunity_id: opp.id,
        title: opp.title,
        agency: opp.agency,
      });
      
      await dispatch(addToPipeline({
        opportunity_id: opp.id,
        title: opp.title,
        agency: opp.agency,
        description: opp.synopsis,
        contract_value: opp.value,
        due_date: opp.dueDate,
        pwin_score: opp.pwin_score,
      })).unwrap();
      
      alert('Successfully added to pipeline! Check Active Proposals section.');
    } catch (error: any) {
      console.error('Error adding to pipeline:', error);
      const errorMessage = error.message || 'Failed to add to pipeline. Please try again.';
      alert(`Failed to add to pipeline: ${errorMessage}\n\nPlease check:\n1. Backend is running on port 8000\n2. You are logged in\n3. Check browser console for details`);
    } finally {
      setAddingToPipeline(null);
    }
  };

  const handleGetBrief = (opp: Opportunity, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowBrief(showBrief === opp.id ? null : opp.id);
  };

  const handleAddToCalendar = (opp: Opportunity, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!opp.dueDate) {
      alert('No due date available for this opportunity');
      return;
    }
    
    const dueDate = new Date(opp.dueDate);
    const priority = opp.pwin_score && opp.pwin_score >= 75 ? 'high' : 'medium';
    
    addToCalendar({
      title: `Proposal Due: ${opp.title}`,
      description: `${opp.synopsis}\n\nAgency: ${opp.agency}\nValue: ${formatCurrency(opp.value)}\nPWin Score: ${opp.pwin_score}%\n\nSAM.gov: ${opp.samGovUrl || 'N/A'}`,
      location: opp.agency,
      startDate: dueDate,
      endDate: dueDate,
      url: opp.samGovUrl,
    });
  };

  const getMockBrief = (opp: Opportunity) => {
    return {
      summary: `This is a ${formatCurrency(opp.value)} opportunity from ${opp.agency}.`,
      keyRequirements: [
        'Technical capability and experience in similar projects',
        'Security clearance for key personnel',
        'Proven past performance with federal agencies',
        'Competitive pricing and value proposition',
      ],
      competitiveAnalysis: {
        estimatedCompetitors: '3-5 major contractors',
        yourStrengths: [
          'Strong past performance ratings',
          'Specialized technical expertise',
          `${opp.pwin_score}% probability of win based on AI analysis`,
        ],
        challenges: [
          'Competitive pricing environment',
          'Incumbent advantage considerations',
        ],
      },
      recommendedActions: [
        'Schedule capability brief with contracting officer',
        'Identify and engage teaming partners',
        'Begin drafting technical approach',
        `Submit proposal by ${formatDate(opp.dueDate)}`,
      ],
      timeline: {
        today: 'Begin opportunity analysis',
        week1: 'Complete competitive intelligence',
        week2: 'Finalize teaming strategy',
        week3: 'Draft technical and cost volumes',
        final: `Submit by ${formatDate(opp.dueDate)}`,
      },
    };
  };

  if (loading) {
    return (
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Top Opportunities</h2>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-3 text-gray-600">Loading opportunities from SAM.gov...</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Top Opportunities</h2>
        <Link
          to="/opportunities"
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          View All →
        </Link>
      </div>

      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-yellow-800">
            {error}. Using mock data for demonstration.
          </p>
        </div>
      )}

      {opportunities.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>No opportunities available</p>
          <p className="text-sm mt-2">Check back later or configure your SAM_GOV_API_KEY</p>
        </div>
      ) : (
        <div className="space-y-4">
          {opportunities.map((opp) => {
            const brief = getMockBrief(opp);
            const daysUntil = opp.dueDate ? getDaysUntilDue(new Date(opp.dueDate)) : null;
            const calendarColor = opp.dueDate ? getCalendarColor(new Date(opp.dueDate), opp.pwin_score && opp.pwin_score >= 75 ? 'high' : 'medium') : 'gray';
            
            return (
              <div key={opp.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">
                        {opp.title}
                      </h3>
                      {opp.mockGenerated && (
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                          Mock
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {opp.synopsis}
                    </p>

                    <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Building2 className="h-4 w-4" />
                        <span>{opp.agency || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        <span>{formatCurrency(opp.value)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>Due: {formatDate(opp.dueDate)}</span>
                        {daysUntil !== null && (
                          <span className={`ml-1 text-xs ${daysUntil < 7 ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                            ({formatDaysUntilDue(daysUntil)})
                          </span>
                        )}
                      </div>
                      {opp.pwin_score && (
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-4 w-4 text-green-600" />
                          <span className="text-green-600 font-medium">
                            PWin: {opp.pwin_score}%
                          </span>
                        </div>
                      )}
                    </div>

                    {opp.setAside && (
                      <div className="mt-2">
                        <span className="inline-block text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {opp.setAside}
                        </span>
                      </div>
                    )}
                  </div>

                  {opp.samGovUrl && (
                    <a
                      href={opp.samGovUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="ml-4 flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                    >
                      <ExternalLink className="h-4 w-4" />
                      SAM.gov
                    </a>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
                  <button
                    onClick={(e) => handleGetBrief(opp, e)}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    <FileText className="h-4 w-4" />
                    Get Brief
                  </button>
                  
                  <button
                    onClick={(e) => handleAddToPipeline(opp, e)}
                    disabled={addingToPipeline === opp.id}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {addingToPipeline === opp.id ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4" />
                        Add to Pipeline
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={(e) => handleAddToCalendar(opp, e)}
                    className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded transition-colors ${
                      calendarColor === 'red' 
                        ? 'bg-red-600 hover:bg-red-700 text-white' 
                        : calendarColor === 'orange'
                        ? 'bg-orange-600 hover:bg-orange-700 text-white'
                        : calendarColor === 'yellow'
                        ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                        : 'bg-gray-600 hover:bg-gray-700 text-white'
                    }`}
                  >
                    <CalendarPlus className="h-4 w-4" />
                    Add to Calendar
                  </button>
                </div>

                {/* Brief Modal/Accordion */}
                {showBrief === opp.id && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-2">Opportunity Brief</h4>
                    
                    <div className="space-y-3 text-sm">
                      <div>
                        <p className="font-medium text-gray-700">Summary:</p>
                        <p className="text-gray-600">{brief.summary}</p>
                      </div>
                      
                      <div>
                        <p className="font-medium text-gray-700">Key Requirements:</p>
                        <ul className="list-disc list-inside text-gray-600 space-y-1">
                          {brief.keyRequirements.map((req, idx) => (
                            <li key={idx}>{req}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <p className="font-medium text-gray-700">Competitive Analysis:</p>
                        <p className="text-gray-600 mb-1">Estimated Competitors: {brief.competitiveAnalysis.estimatedCompetitors}</p>
                        <p className="text-gray-600 font-medium">Your Strengths:</p>
                        <ul className="list-disc list-inside text-gray-600 space-y-1">
                          {brief.competitiveAnalysis.yourStrengths.map((strength, idx) => (
                            <li key={idx}>{strength}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <p className="font-medium text-gray-700">Recommended Actions:</p>
                        <ol className="list-decimal list-inside text-gray-600 space-y-1">
                          {brief.recommendedActions.map((action, idx) => (
                            <li key={idx}>{action}</li>
                          ))}
                        </ol>
                      </div>
                      
                      <div>
                        <p className="font-medium text-gray-700">Timeline:</p>
                        <div className="grid grid-cols-2 gap-2 text-gray-600">
                          <div><span className="font-medium">Today:</span> {brief.timeline.today}</div>
                          <div><span className="font-medium">Week 1:</span> {brief.timeline.week1}</div>
                          <div><span className="font-medium">Week 2:</span> {brief.timeline.week2}</div>
                          <div><span className="font-medium">Week 3:</span> {brief.timeline.week3}</div>
                          <div className="col-span-2"><span className="font-medium">Final:</span> {brief.timeline.final}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

