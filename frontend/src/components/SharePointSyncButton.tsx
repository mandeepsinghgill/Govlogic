import { useState } from 'react';
import { Upload, CheckCircle, X, AlertCircle, Loader2 } from 'lucide-react';
import { sharepointService, SharePointSyncResult } from '../services/sharepointService';

interface SharePointSyncButtonProps {
  proposalId: string;
  folderPath?: string;
  onSyncComplete?: (result: SharePointSyncResult) => void;
  className?: string;
}

export default function SharePointSyncButton({
  proposalId,
  folderPath = 'Shared Documents/Proposals',
  onSyncComplete,
  className = '',
}: SharePointSyncButtonProps) {
  const [syncing, setSyncing] = useState(false);
  const [synced, setSynced] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sharepointUrl, setSharepointUrl] = useState<string | null>(null);

  const handleSync = async () => {
    setSyncing(true);
    setError(null);
    setSynced(false);

    try {
      const result = await sharepointService.syncProposal(proposalId, folderPath);
      setSynced(true);
      setSharepointUrl(result.sharepoint_url);

      if (onSyncComplete) {
        onSyncComplete(result);
      }

      // Reset success state after 5 seconds
      setTimeout(() => {
        setSynced(false);
      }, 5000);
    } catch (err: any) {
      setError(err.message || 'Failed to sync to SharePoint');
      setSynced(false);
    } finally {
      setSyncing(false);
    }
  };

  if (synced && sharepointUrl) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <a
          href={sharepointUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
        >
          <CheckCircle className="w-4 h-4" />
          <span>View in SharePoint</span>
        </a>
      </div>
    );
  }

  return (
    <div className={`flex flex-col space-y-2 ${className}`}>
      <button
        onClick={handleSync}
        disabled={syncing}
        className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {syncing ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Syncing to SharePoint...</span>
          </>
        ) : (
          <>
            <Upload className="w-4 h-4" />
            <span>Sync to SharePoint</span>
          </>
        )}
      </button>

      {error && (
        <div className="flex items-center space-x-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-auto hover:text-red-900"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

