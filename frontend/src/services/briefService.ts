/**
 * Brief Service - Handles fetching and displaying opportunity briefs
 */

export interface Brief {
  id: string;
  opportunityId: string;
  title: string;
  shipleyCompliant: boolean;
  overview: {
    fitScore: number;
    agency: string;
    estimatedValue: string;
    dueDate: string;
    naics: string;
    setAside: string;
  };
  bidDecisionMatrix: {
    relationship: number;
    priceToWin: number;
    solution: number;
    competitivePosition: number;
    overallScore: number;
    gate: 'GREEN' | 'YELLOW' | 'RED';
    recommendation: string;
  };
  winStrategy: {
    winStrategyStatement: string;
    themes: Array<{ name: string; description: string }>;
    ghostingStrategy: string;
  };
  discriminators: Array<{ name: string; description: string }>;
  companyMatch: {
    whyWeMatch: string[];
    strengths: string[];
    gaps: string[];
    recommendations: string[];
  };
  pastPerformance: Array<{
    title: string;
    agency: string;
    dates: string;
    description: string;
  }>;
  competitiveAnalysis: {
    winProbability: number;
    competitors: string[];
    differentiators: string[];
  };
  complianceMatrix: {
    overallCompliance: number;
    sections: Array<{ name: string; status: string }>;
  };
  proposalStructure: {
    totalPages: number;
    volumes: Array<{ name: string; sections: string[] }>;
  };
  colorTeamSchedule: Array<{ team: string; date: string; tasks: string[] }>;
  nextSteps: string[];
  generatedAt: string;
}

class BriefService {
  private baseUrl = import.meta.env.VITE_API_URL || import.meta.env.REACT_APP_API_URL || 'http://localhost:8000';

  private async getAuthHeaders(): Promise<HeadersInit> {
    const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }

  /**
   * Get brief for an opportunity (checks cache first, generates if needed)
   */
  async getBrief(opportunityId: string): Promise<Brief> {
    if (!opportunityId || opportunityId.trim() === '') {
      throw new Error('Opportunity ID is required');
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/api/v1/briefs/${opportunityId}`,
        {
          method: 'GET',
          headers: await this.getAuthHeaders(),
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          // Brief doesn't exist, backend will generate it automatically
          // But if we get 404, it means the endpoint itself failed
          throw new Error('Brief not found. The backend will generate it automatically on next request.');
        }
        const errorText = await response.text();
        let error;
        try {
          error = JSON.parse(errorText);
        } catch {
          error = { detail: errorText || 'Failed to get brief' };
        }
        throw new Error(error.detail || 'Failed to get brief');
      }

      return response.json();
    } catch (error: any) {
      if (error.message) {
        throw error;
      }
      throw new Error(`Network error: ${error.message || 'Failed to fetch brief'}`);
    }
  }

  /**
   * Generate brief for an opportunity (force regenerate, even if cached)
   */
  async generateBrief(opportunityId: string): Promise<Brief> {
    if (!opportunityId || opportunityId.trim() === '') {
      throw new Error('Opportunity ID is required');
    }

    const response = await fetch(
      `${this.baseUrl}/api/v1/briefs/generate`,
      {
        method: 'POST',
        headers: await this.getAuthHeaders(),
        body: JSON.stringify({ opportunityId }),
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Failed to generate brief' }));
      throw new Error(error.detail || 'Failed to generate brief');
    }

    return response.json();
  }

  /**
   * Check if brief exists for an opportunity
   */
  async briefExists(opportunityId: string): Promise<boolean> {
    try {
      await this.getBrief(opportunityId);
      return true;
    } catch {
      return false;
    }
  }
}

export const briefService = new BriefService();

