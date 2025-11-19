import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { TrendingUp, Building2, DollarSign, Calendar, ExternalLink, Loader2, Plus, FileText, CalendarPlus, CheckCircle2, Sparkles, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppDispatch } from '../store/hooks';
import { addToPipeline } from '../store/pipelineSlice';
import { addToCalendar, getCalendarColor, formatDaysUntilDue, getDaysUntilDue } from '../utils/calendarUtils';
import { briefService } from '../services/briefService';
import { proposalService } from '../services/proposalService';
import OpportunityBriefDrawer from './OpportunityBriefDrawer';

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
  const [selectedOppForBrief, setSelectedOppForBrief] = useState<string | null>(null);
  const [addingToPipeline, setAddingToPipeline] = useState<Record<string, boolean>>({});
  const [briefs, setBriefs] = useState<Record<string, any>>({});
  const [proposals, setProposals] = useState<Record<string, any>>({});
  const dispatch = useAppDispatch();

  useEffect(() => {
    fetchTopOpportunities();
  }, []);

  // Check for auto-generated briefs and proposals when opportunities load
  useEffect(() => {
    if (opportunities.length > 0) {
      opportunities.forEach(opp => {
        checkBriefStatus(opp.id);
        checkProposalStatus(opp.id);
      });
    }
  }, [opportunities]);

  const checkBriefStatus = async (opportunityId: string) => {
    try {
      const exists = await briefService.briefExists(opportunityId);
      if (exists) {
        const brief = await briefService.getBrief(opportunityId);
        setBriefs(prev => ({ ...prev, [opportunityId]: brief }));
      }
    } catch (error) {
      // Brief doesn't exist yet
    }
  };

  const checkProposalStatus = async (opportunityId: string) => {
    try {
      const proposal = await proposalService.getPrimaryProposal(opportunityId);
      if (proposal) {
        setProposals(prev => ({ ...prev, [opportunityId]: proposal }));
      }
    } catch (error) {
      // Proposal doesn't exist yet
    }
  };

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
      // Ensure items have unique IDs if backend sends duplicates (fallback)
      const items = data.items || [];
      setOpportunities(items);
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
      setAddingToPipeline(prev => ({ ...prev, [opp.id]: true }));
      
      // Check if logged in
      const token = localStorage.getItem('access_token');
      if (!token) {
        alert('Please log in first to add items to your pipeline.');
        setAddingToPipeline(prev => ({ ...prev, [opp.id]: false }));
        return;
      }
      
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
      alert(`Failed to add to pipeline: ${errorMessage}`);
    } finally {
      setAddingToPipeline(prev => ({ ...prev, [opp.id]: false }));
    }
  };

  const handleGetBrief = (opp: Opportunity, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedOppForBrief(opp.id);
  };

  const handleAddToCalendar = (opp: Opportunity, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!opp.dueDate) {
      alert('No due date available for this opportunity');
      return;
    }
    
    const dueDate = new Date(opp.dueDate);
    
    addToCalendar({
      title: `Proposal Due: ${opp.title}`,
      description: `${opp.synopsis}\n\nAgency: ${opp.agency}\nValue: ${formatCurrency(opp.value)}\nPWin Score: ${opp.pwin_score}%\n\nSAM.gov: ${opp.samGovUrl || 'N/A'}`,
      location: opp.agency,
      startDate: dueDate,
      endDate: dueDate,
      url: opp.samGovUrl,
    });
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
    <>
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
            {opportunities.map((opp, index) => {
              const daysUntil = opp.dueDate ? getDaysUntilDue(new Date(opp.dueDate)) : null;
              const calendarColor = opp.dueDate ? getCalendarColor(new Date(opp.dueDate), opp.pwin_score && opp.pwin_score >= 75 ? 'high' : 'medium') : 'gray';
              // Ensure unique key - use index as fallback if ID is missing
              const uniqueKey = opp.id || `opp-${index}`;
              
              return (
                <div key={uniqueKey} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/opportunities/${opp.id}`}
                          className="font-semibold text-gray-900 hover:text-blue-600 transition-colors cursor-pointer"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {opp.title}
                        </Link>
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

                      {/* Auto-Generated Status Indicators */}
                      {(briefs[opp.id] || proposals[opp.id]) && (
                        <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center gap-2 text-sm text-green-800">
                            <Sparkles className="h-4 w-4" />
                            <span className="font-semibold">Auto-Generated:</span>
                            {briefs[opp.id] && (
                              <span className="flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3" />
                                Brief Ready
                              </span>
                            )}
                            {proposals[opp.id] && (
                              <span className="flex items-center gap-1 ml-2">
                                <CheckCircle2 className="h-3 w-3" />
                                Proposal Ready
                              </span>
                            )}
                          </div>
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
                  <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-gray-100">
                    <button
                      onClick={(e) => handleGetBrief(opp, e)}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      <FileText className="h-4 w-4" />
                      {briefs[opp.id] ? 'View Brief' : 'Get Brief'}
                    </button>

                    <Link
                      to={`/proposal-generator/${opp.id}`}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
                    >
                      <Sparkles className="h-4 w-4" />
                      Generate Proposal
                    </Link>
                    
                    <button
                      onClick={(e) => handleAddToPipeline(opp, e)}
                      disabled={addingToPipeline[opp.id] === true}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {addingToPipeline[opp.id] === true ? (
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
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Opportunity Brief Drawer */}
      <OpportunityBriefDrawer 
        isOpen={!!selectedOppForBrief}
        onClose={() => setSelectedOppForBrief(null)}
        opportunity={opportunities.find(opp => opp.id === selectedOppForBrief) || null}
      />
    </>
  );
}
