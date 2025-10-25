import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Target, Users, TrendingUp, Lightbulb } from 'lucide-react';

export default function Capture() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Capture Management</h1>
        <p className="text-gray-600 mt-1">Shipley-compliant capture planning</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Target className="text-blue-600" size={24} />
            <h2 className="text-xl font-semibold">Active Captures</h2>
          </div>
          <div className="space-y-3">
            <CaptureItem
              title="Army Cybersecurity Services"
              stage="Capture Plan"
              pwin={82}
            />
            <CaptureItem
              title="DHS Cloud Infrastructure"
              stage="Customer Engagement"
              pwin={74}
            />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Lightbulb className="text-yellow-600" size={24} />
            <h2 className="text-xl font-semibold">Win Themes</h2>
          </div>
          <ul className="space-y-2">
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              <span>Proven FedRAMP experience with 10+ agencies</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              <span>30% cost savings through automation</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              <span>CMMC Level 2 certified facilities</span>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
}

function CaptureItem({ title, stage, pwin }) {
  return (
    <div className="p-3 border rounded-lg hover:bg-gray-50">
      <h3 className="font-semibold">{title}</h3>
      <div className="flex items-center justify-between mt-2 text-sm">
        <span className="text-gray-600">{stage}</span>
        <span className="text-green-600 font-semibold">PWin: {pwin}%</span>
      </div>
    </div>
  );
}

