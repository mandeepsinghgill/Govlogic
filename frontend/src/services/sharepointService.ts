/**
 * SharePoint Integration Service
 * Handles document sync, export, and collaboration with SharePoint Online
 */

export interface SharePointSyncResult {
  sharepoint_url: string;
  file_id: string;
  filename: string;
  message: string;
}

export interface SharePointStatus {
  configured: boolean;
  available: boolean;
  tenant_url: string | null;
}

export interface SharePointFolder {
  folder_path: string;
  folders: string[];
}

export class SharePointService {
  private baseUrl: string;

  constructor() {
    // Use import.meta.env for Vite (browser environment)
    this.baseUrl = import.meta.env.VITE_API_URL || import.meta.env.REACT_APP_API_URL || '/api/v1';
  }

  private async getAuthHeaders(): Promise<HeadersInit> {
    const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }

  /**
   * Check if SharePoint is configured and available
   */
  async getStatus(): Promise<SharePointStatus> {
    const response = await fetch(`${this.baseUrl}/sharepoint/status`, {
      method: 'GET',
      headers: await this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to get SharePoint status');
    }

    return response.json();
  }

  /**
   * Sync proposal to SharePoint
   */
  async syncProposal(
    proposalId: string,
    folderPath: string = 'Shared Documents/Proposals'
  ): Promise<SharePointSyncResult> {
    const response = await fetch(`${this.baseUrl}/sharepoint/sync-proposal`, {
      method: 'POST',
      headers: await this.getAuthHeaders(),
      body: JSON.stringify({
        proposal_id: proposalId,
        folder_path: folderPath,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to sync proposal to SharePoint');
    }

    return response.json();
  }

  /**
   * Upload any file to SharePoint
   */
  async uploadFile(
    fileContent: string, // Base64 encoded
    filename: string,
    folderPath: string = 'Shared Documents'
  ): Promise<SharePointSyncResult> {
    const response = await fetch(`${this.baseUrl}/sharepoint/upload`, {
      method: 'POST',
      headers: await this.getAuthHeaders(),
      body: JSON.stringify({
        file_content: fileContent,
        filename,
        folder_path: folderPath,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to upload file to SharePoint');
    }

    return response.json();
  }

  /**
   * Get SharePoint folder structure
   */
  async getFolders(folderPath: string = 'Shared Documents'): Promise<SharePointFolder> {
    const response = await fetch(
      `${this.baseUrl}/sharepoint/folders?folder_path=${encodeURIComponent(folderPath)}`,
      {
        method: 'GET',
        headers: await this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to get SharePoint folders');
    }

    return response.json();
  }

  /**
   * Create folder in SharePoint
   */
  async createFolder(folderPath: string): Promise<void> {
    const response = await fetch(
      `${this.baseUrl}/sharepoint/create-folder?folder_path=${encodeURIComponent(folderPath)}`,
      {
        method: 'POST',
        headers: await this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to create folder');
    }
  }

  /**
   * Get document versions
   */
  async getVersions(fileUrl: string): Promise<any[]> {
    const response = await fetch(
      `${this.baseUrl}/sharepoint/versions?file_url=${encodeURIComponent(fileUrl)}`,
      {
        method: 'GET',
        headers: await this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to get document versions');
    }

    const data = await response.json();
    return data.versions || [];
  }

  /**
   * Set up automatic sync for a proposal
   */
  async setupAutoSync(
    proposalId: string,
    folderPath: string = 'Shared Documents/Proposals',
    autoSync: boolean = true
  ): Promise<void> {
    const response = await fetch(
      `${this.baseUrl}/sharepoint/setup-auto-sync?proposal_id=${proposalId}&folder_path=${encodeURIComponent(folderPath)}&auto_sync=${autoSync}`,
      {
        method: 'POST',
        headers: await this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to setup auto-sync');
    }
  }
}

export const sharepointService = new SharePointService();

