import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Plus, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

export default function Programs() {
  const programs = [
    { id: 1, name: 'GSA Cloud Platform', status: 'active', health: 95, milestones: 12, completed: 8 },
    { id: 2, name: 'Navy Training Systems', status: 'active', health: 78, milestones: 8, completed: 5 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Program Management</h1>
          <p className="text-gray-600 mt-1">Track deliverables and milestones</p>
        </div>
        <Button className="bg-blue-900 hover:bg-blue-800">
          <Plus size={20} className="mr-2" />
          New Program
        </Button>
      </div>

      <div className="space-y-4">
        {programs.map((program) => (
          <ProgramCard key={program.id} program={program} />
        ))}
      </div>
    </div>
  );
}

function ProgramCard({ program }) {
  const getHealthColor = (health) => {
    if (health >= 80) return 'text-green-600';
    if (health >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold">{program.name}</h3>
          <p className="text-gray-600 mt-1">
            {program.completed} of {program.milestones} milestones completed
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Health Score</p>
          <p className={`text-3xl font-bold ${getHealthColor(program.health)}`}>
            {program.health}%
          </p>
        </div>
      </div>

      <div className="mt-4">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full"
            style={{ width: `${(program.completed / program.milestones) * 100}%` }}
          />
        </div>
      </div>
    </Card>
  );
}

