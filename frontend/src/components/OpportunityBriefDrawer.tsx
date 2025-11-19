import { useEffect, useState } from 'react';
import { X, FileText, CheckCircle2, ArrowRight, Sparkles, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { briefService } from '../services/briefService';

interface Opportunity {
  id: string;
  title: string;
  synopsis: string;
  agency: string;
  value?: number;
  dueDate?: string;
  pwin_score?: number;
}

interface OpportunityBriefDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  opportunity: Opportunity | null;
}

export default function OpportunityBriefDrawer({ isOpen, onClose, opportunity }: OpportunityBriefDrawerProps) {
  const [loading, setLoading] = useState(false);
  const [brief, setBrief] = useState<any>(null);

  useEffect(() => {
    if (isOpen && opportunity && opportunity.id) {
      loadBrief();
    } else {
      setBrief(null);
    }
  }, [isOpen, opportunity?.id]);

  const loadBrief = async () => {
    if (!opportunity || !opportunity.id) {
      console.error("No opportunity or opportunity ID provided");
      const fallbackOpp = opportunity || { id: 'unknown', title: 'Unknown', agency: 'Unknown', synopsis: '', pwin_score: 0 };
      setBrief(getMockBrief(fallbackOpp));
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      // GET endpoint checks cache first, generates if needed, and saves to DB
      // This saves money by avoiding duplicate OpenAI API calls
      console.log('Loading brief for opportunity:', opportunity.id);
      const brief = await briefService.getBrief(opportunity.id);
      console.log('Brief loaded successfully:', brief);
      setBrief(brief);
    } catch (error: any) {
      console.error("Error loading brief:", error);
      // If getBrief fails (e.g., 404), try generating
      try {
        console.log('Generating new brief for opportunity:', opportunity.id);
        const generated = await briefService.generateBrief(opportunity.id);
        console.log('Brief generated successfully:', generated);
        setBrief(generated);
      } catch (genError: any) {
        console.error("Error generating brief:", genError);
        // Fallback to mock brief if both fail
        try {
          const mockBrief = getMockBrief(opportunity);
          console.log('Using mock brief:', mockBrief);
          setBrief(mockBrief);
        } catch (mockError: any) {
          console.error("Error creating mock brief:", mockError);
          // Last resort: minimal brief structure
          setBrief({
            overview: { fitScore: 0, agency: opportunity.agency || 'Unknown', estimatedValue: 'N/A', dueDate: 'N/A' },
            bidDecisionMatrix: { overallScore: 0, gate: 'YELLOW', recommendation: 'Unable to generate brief. Please try again.' },
            companyMatch: { whyWeMatch: [], strengths: [], gaps: [] },
            nextSteps: ['Please try generating the brief again or contact support.']
          });
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const getMockBrief = (opp: Opportunity) => {
    return {
      summary: `This is a strategic opportunity with ${opp.agency}. The solicitation requires a comprehensive technical approach addressing specific agency needs.`,
      keyRequirements: [
        'Demonstrated experience in similar scope',
        'Key personnel with specific security clearances',
        'Compliance with agency-specific data standards',
        'Robust quality assurance plan',
      ],
      competitiveAnalysis: {
        estimatedCompetitors: '3-5 incumbents and major contractors',
        yourStrengths: [
          'Strong past performance with this agency',
          'Technical solution aligns with requirements',
          `${opp.pwin_score || 60}% probability of win based on initial assessment`,
        ],
        challenges: [
          'Price sensitivity is high',
          'Short turnaround time for proposal',
        ],
      },
      recommendedActions: [
        'Schedule Go/No-Go decision meeting',
        'Identify potential teaming partners',
        'Start outlining the Technical Volume',
      ],
      timeline: {
        today: 'Review solicitation documents',
        week1: 'Develop solution architecture',
        week2: 'Draft proposal content',
        final: 'Final review and submission',
      },
    };
  };

  // Don't render if not open to avoid blank page issues
  if (!isOpen) {
    return null;
  }

  // Always render the drawer container when open
  return (
    <div className="fixed inset-0 z-50 flex justify-end pointer-events-auto">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity duration-300 opacity-100"
        onClick={onClose}
      />

      {/* Drawer - Takes up half the page, slides from right */}
      <div className="relative w-1/2 bg-white h-full shadow-2xl transform transition-transform duration-500 ease-in-out flex flex-col translate-x-0">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
          <div>
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Opportunity Brief
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              AI-Generated Analysis for {opportunity?.title}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping"></div>
                <div className="relative bg-white p-4 rounded-full shadow-lg border border-blue-100">
                  <Sparkles className="h-8 w-8 text-blue-600 animate-pulse" />
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900">Generating Brief...</h3>
                <p className="text-gray-500">Analyzing requirements and competitive landscape</p>
              </div>
            </div>
          ) : brief ? (
            <div className="space-y-6">
              {/* Overview Section */}
              {brief.overview && (
                <section className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-blue-600" />
                    Opportunity Overview
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Fit Score</p>
                      <p className="text-2xl font-bold text-blue-600">{brief.overview.fitScore}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Estimated Value</p>
                      <p className="text-lg font-semibold text-gray-900">{brief.overview.estimatedValue}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Agency</p>
                      <p className="text-lg font-semibold text-gray-900">{brief.overview.agency}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Due Date</p>
                      <p className="text-lg font-semibold text-gray-900">{brief.overview.dueDate}</p>
                    </div>
                  </div>
                </section>
              )}

              {/* Bid Decision Matrix */}
              {brief.bidDecisionMatrix && (
                <section>
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">
                    Shipley Bid Decision Matrix
                  </h3>
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-600">Relationship</p>
                        <p className="text-lg font-bold text-gray-900">{brief.bidDecisionMatrix.relationship}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Price to Win</p>
                        <p className="text-lg font-bold text-gray-900">{brief.bidDecisionMatrix.priceToWin}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Solution</p>
                        <p className="text-lg font-bold text-gray-900">{brief.bidDecisionMatrix.solution}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Competitive Position</p>
                        <p className="text-lg font-bold text-gray-900">{brief.bidDecisionMatrix.competitivePosition}%</p>
                      </div>
                    </div>
                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-gray-600">Overall PWin Score</p>
                          <p className="text-2xl font-bold text-blue-600">{brief.bidDecisionMatrix.overallScore}%</p>
                        </div>
                        <div className={`px-4 py-2 rounded-lg font-semibold ${
                          brief.bidDecisionMatrix.gate === 'GREEN' ? 'bg-green-100 text-green-800' :
                          brief.bidDecisionMatrix.gate === 'YELLOW' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {brief.bidDecisionMatrix.gate}
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 mt-2">{brief.bidDecisionMatrix.recommendation}</p>
                    </div>
                  </div>
                </section>
              )}

              {/* Company Match */}
              {brief.companyMatch && (
                <section>
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">
                    Company Match Analysis
                  </h3>
                  <div className="space-y-4">
                    {brief.companyMatch.whyWeMatch && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Why We Match</h4>
                        <ul className="space-y-2">
                          {brief.companyMatch.whyWeMatch.map((item: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                              <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {brief.companyMatch.strengths && (
                      <div>
                        <h4 className="text-sm font-semibold text-green-700 mb-2">Strengths</h4>
                        <ul className="space-y-2">
                          {brief.companyMatch.strengths.map((item: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                              <div className="h-1.5 w-1.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {brief.companyMatch.gaps && brief.companyMatch.gaps.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-orange-700 mb-2">Gaps</h4>
                        <ul className="space-y-2">
                          {brief.companyMatch.gaps.map((item: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                              <div className="h-1.5 w-1.5 rounded-full bg-orange-500 mt-1.5 flex-shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* Next Steps */}
              {brief.nextSteps && brief.nextSteps.length > 0 && (
                <section>
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">
                    Recommended Next Steps
                  </h3>
                  <ul className="space-y-2">
                    {brief.nextSteps.map((step: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-3 bg-white border border-gray-100 p-3 rounded-lg shadow-sm">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                          {idx + 1}
                        </div>
                        <span className="text-gray-700 text-sm">{step}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Past Performance Section */}
              {brief.pastPerformance && brief.pastPerformance.length > 0 && (
                <section>
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">
                    Relevant Past Performance
                  </h3>
                  <div className="space-y-4">
                    {brief.pastPerformance.map((pp: any, idx: number) => (
                      <div key={idx} className="bg-white border border-gray-200 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-1">{pp.title}</h4>
                        <p className="text-sm text-gray-600 mb-2">{pp.agency} • {pp.dates}</p>
                        <p className="text-sm text-gray-700">{pp.description}</p>
                        {pp.value && <p className="text-sm font-medium text-blue-600 mt-2">Value: {pp.value}</p>}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Competitive Analysis Section */}
              {brief.competitiveAnalysis && (
                <section>
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">
                    Competitive Analysis
                  </h3>
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="mb-4">
                      <p className="text-sm text-gray-600">Win Probability</p>
                      <p className="text-2xl font-bold text-blue-600">{brief.competitiveAnalysis.winProbability}%</p>
                    </div>
                    {brief.competitiveAnalysis.competitors && (
                      <div className="mb-4">
                        <p className="text-sm font-semibold text-gray-700 mb-2">Likely Competitors</p>
                        <ul className="space-y-1">
                          {brief.competitiveAnalysis.competitors.map((comp: string, idx: number) => (
                            <li key={idx} className="text-sm text-gray-600">• {comp}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {brief.competitiveAnalysis.differentiators && (
                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-2">Key Differentiators</p>
                        <ul className="space-y-1">
                          {brief.competitiveAnalysis.differentiators.map((diff: string, idx: number) => (
                            <li key={idx} className="text-sm text-gray-600">• {diff}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* Fallback for old brief format */}
              {brief.summary && !brief.overview && (
                <section>
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-purple-600" />
                    Executive Summary
                  </h3>
                  <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 text-gray-700 leading-relaxed">
                    {brief.summary}
                  </div>
                </section>
              )}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-12">
              Failed to load brief.
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 flex items-center justify-between gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-gray-700 font-medium hover:bg-gray-200 rounded-lg transition-colors"
          >
            Close
          </button>
          
          <div className="flex items-center gap-3">
            <Link
              to={`/proposal-generator/${opportunity?.id}`}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all transform hover:-translate-y-0.5"
            >
              <Sparkles className="h-4 w-4" />
              Generate Proposal
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
