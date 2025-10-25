import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Search, FileText, Award, Users } from 'lucide-react';

export default function Knowledge() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Knowledge Base</h1>
          <p className="text-gray-600 mt-1">Reusable content and past performance</p>
        </div>
        <Button className="bg-blue-900 hover:bg-blue-800">
          <Plus size={20} className="mr-2" />
          Add Document
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          icon={<FileText className="text-blue-600" />}
          label="Documents"
          value="247"
        />
        <StatCard
          icon={<Award className="text-green-600" />}
          label="Past Performance"
          value="34"
        />
        <StatCard
          icon={<Users className="text-purple-600" />}
          label="Teaming Partners"
          value="18"
        />
      </div>

      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search knowledge base..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
          />
        </div>
      </Card>
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <Card className="p-6">
      <div className="flex items-center space-x-3">
        {icon}
        <div>
          <p className="text-sm text-gray-600">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </div>
    </Card>
  );
}

