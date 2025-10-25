import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';

export default function Proposals() {
  const proposals = [
    {
      id: 1,
      title: 'Army Cybersecurity Services',
      solicitation: 'W56KGU-25-R-0001',
      status: 'red_team',
      complianceScore: 94,
      redTeamScore: 87,
      dueDate: '2025-11-20',
    },
    {
      id: 2,
      title: 'VA Healthcare IT',
      solicitation: 'VA-25-00123',
      status: 'in_progress',
      complianceScore: 88,
      redTeamScore: null,
      dueDate: '2025-10-25',
    },
    {
      id: 3,
      title: 'DHS Cloud Infrastructure',
      solicitation: 'HSHQDC-25-R-00045',
      status: 'draft',
      complianceScore: null,
      redTeamScore: null,
      dueDate: '2025-10-30',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Proposals</h1>
          <p className="text-gray-600 mt-1">AI-powered proposal generation</p>
        </div>
        <Button className="bg-blue-900 hover:bg-blue-800">
          <Plus size={20} className="mr-2" />
          New Proposal
        </Button>
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <QuickAction
            icon={<Upload />}
            title="Upload RFP"
            description="Start with an RFP document"
          />
          <QuickAction
            icon={<FileText />}
            title="Generate from Scratch"
            description="Create proposal manually"
          />
          <QuickAction
            icon={<CheckCircle />}
            title="Import from Opportunity"
            description="Link to existing opportunity"
          />
        </div>
      </Card>

      {/* Proposals List */}
      <div className="space-y-4">
        {proposals.map((proposal) => (
          <ProposalCard key={proposal.id} proposal={proposal} />
        ))}
      </div>
    </div>
  );
}

function QuickAction({ icon, title, description }) {
  return (
    <button className="p-4 border-2 border-dashed rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left">
      <div className="flex items-center space-x-3">
        <div className="text-blue-600">{icon}</div>
        <div>
          <h3 className="font-semibold">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
    </button>
  );
}

function ProposalCard({ proposal }) {
  const getStatusBadge = (status) => {
    const badges = {
      draft: { label: 'Draft', color: 'bg-gray-100 text-gray-800' },
      in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-800' },
      pink_team: { label: 'Pink Team', color: 'bg-pink-100 text-pink-800' },
      red_team: { label: 'Red Team', color: 'bg-red-100 text-red-800' },
      gold_team: { label: 'Gold Team', color: 'bg-yellow-100 text-yellow-800' },
      final: { label: 'Final', color: 'bg-green-100 text-green-800' },
    };
    return badges[status] || badges.draft;
  };

  const badge = getStatusBadge(proposal.status);

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3">
            <h3 className="text-xl font-semibold">{proposal.title}</h3>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.color}`}>
              {badge.label}
            </span>
          </div>
          <p className="text-gray-600 mt-1">Solicitation: {proposal.solicitation}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Due Date</p>
          <p className="font-semibold">{proposal.dueDate}</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4">
        <div>
          <p className="text-sm text-gray-600">Compliance Score</p>
          <p className="text-2xl font-bold text-green-600">
            {proposal.complianceScore ? `${proposal.complianceScore}%` : '-'}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Red Team Score</p>
          <p className="text-2xl font-bold text-blue-600">
            {proposal.redTeamScore ? `${proposal.redTeamScore}%` : '-'}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600">508 Compliant</p>
          <div className="mt-1">
            {proposal.complianceScore ? (
              <CheckCircle className="text-green-500" size={24} />
            ) : (
              <AlertCircle className="text-gray-400" size={24} />
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

