/**
 * Proposal Service - Handles fetching and displaying proposals
 */

export interface Proposal {
  id: string;
  title: string;
  opportunity_id: string;
  status: 'draft' | 'in_progress' | 'pink_team' | 'red_team' | 'gold_team' | 'final' | 'submitted';
  sections?: any;
  compliance_matrix?: any;
  outline?: any;
  red_team_report?: any;
  red_team_score?: number;
  created_at: string;
  updated_at: string;
}

class ProposalService {
  private baseUrl = import.meta.env.VITE_API_URL || import.meta.env.REACT_APP_API_URL || 'http://localhost:8000';

  private async getAuthHeaders(): Promise<HeadersInit> {
    const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }

  /**
   * Get proposals for an opportunity (auto-generated)
   */
  async getProposalsForOpportunity(opportunityId: string): Promise<Proposal[]> {
    const response = await fetch(
      `${this.baseUrl}/api/v1/proposals?opportunity_id=${opportunityId}&skip=0&limit=10`,
      {
        method: 'GET',
        headers: await this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to get proposals');
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  }

  /**
   * Get a single proposal by ID
   */
  async getProposal(proposalId: string): Promise<Proposal> {
    const response = await fetch(
      `${this.baseUrl}/api/v1/proposals/${proposalId}`,
      {
        method: 'GET',
        headers: await this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to get proposal');
    }

    return response.json();
  }

  /**
   * Check if proposal exists for an opportunity
   */
  async proposalExists(opportunityId: string): Promise<boolean> {
    try {
      const proposals = await this.getProposalsForOpportunity(opportunityId);
      return proposals.length > 0;
    } catch {
      return false;
    }
  }

  /**
   * Get the first/primary proposal for an opportunity
   */
  async getPrimaryProposal(opportunityId: string): Promise<Proposal | null> {
    try {
      const proposals = await this.getProposalsForOpportunity(opportunityId);
      return proposals.length > 0 ? proposals[0] : null;
    } catch {
      return null;
    }
  }
}

export const proposalService = new ProposalService();

