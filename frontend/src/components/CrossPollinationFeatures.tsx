import { useState } from 'react';
import { 
  ArrowRight, ArrowLeft, Sparkles, FileText, Target, 
  TrendingUp, Users, Award, CheckCircle, Lightbulb
} from 'lucide-react';

interface CrossPollinationFeaturesProps {
  userTypes: string[];
}

export default function CrossPollinationFeatures({ userTypes }: CrossPollinationFeaturesProps) {
  const [activeFeature, setActiveFeature] = useState(0);

  const features = [
    {
      id: 'shared-knowledge',
      title: 'Shared Knowledge Base',
      description: 'Use insights from grant applications to improve proposal writing and vice versa',
      icon: <Lightbulb className="text-yellow-600" size={32} />,
      benefits: [
        'Transfer successful strategies between proposals and grants',
        'Learn from past performance in both areas',
        'Identify common themes and approaches',
        'Build comprehensive capability profiles'
      ],
      examples: [
        'Grant research methodology → Proposal technical approach',
        'Proposal past performance → Grant project narrative',
        'Grant budget planning → Proposal cost estimation',
        'Proposal compliance checking → Grant requirements tracking'
      ]
    },
    {
      id: 'unified-analytics',
      title: 'Unified Analytics Dashboard',
      description: 'Track success across both proposals and grants with integrated metrics',
      icon: <TrendingUp className="text-blue-600" size={32} />,
      benefits: [
        'See total business development performance',
        'Identify patterns in successful approaches',
        'Track ROI across all government work',
        'Optimize resource allocation'
      ],
      examples: [
        'Combined win rate analysis',
        'Revenue attribution by source',
        'Time investment optimization',
        'Success factor identification'
      ]
    },
    {
      id: 'team-collaboration',
      title: 'Unified Team Collaboration',
      description: 'Seamlessly switch between proposal and grant work with the same team tools',
      icon: <Users className="text-green-600" size={32} />,
      benefits: [
        'Same team works on both proposals and grants',
        'Shared calendars and deadlines',
        'Unified communication channels',
        'Cross-training opportunities'
      ],
      examples: [
        'Real-time collaboration on both document types',
        'Shared team knowledge and expertise',
        'Unified project management',
        'Consistent quality standards'
      ]
    },
    {
      id: 'ai-learning',
      title: 'AI Cross-Learning',
      description: 'Our AI learns from your success in both areas to improve recommendations',
      icon: <Sparkles className="text-purple-600" size={32} />,
      benefits: [
        'AI gets smarter with more data points',
        'Better recommendations across both areas',
        'Pattern recognition across all work',
        'Continuous improvement'
      ],
      examples: [
        'Grant success patterns → Proposal optimization',
        'Proposal win factors → Grant application strategies',
        'Client relationship insights → Both areas',
        'Market intelligence sharing'
      ]
    }
  ];

  const currentFeature = features[activeFeature];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Cross-Pollination Features
        </h2>
        <p className="text-gray-600">
          Get the most value by using both proposals and grants together
        </p>
      </div>

      {/* Feature Navigation */}
      <div className="flex justify-center mb-8">
        <div className="bg-gray-100 rounded-lg p-1 flex space-x-1">
          {features.map((feature, index) => (
            <button
              key={feature.id}
              onClick={() => setActiveFeature(index)}
              className={`px-4 py-2 rounded-md font-medium transition-all ${
                activeFeature === index
                  ? 'bg-white text-blue-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {feature.title}
            </button>
          ))}
        </div>
      </div>

      {/* Feature Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Side - Feature Details */}
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gray-100 rounded-lg">
              {currentFeature.icon}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                {currentFeature.title}
              </h3>
              <p className="text-gray-600">
                {currentFeature.description}
              </p>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Key Benefits:</h4>
            <ul className="space-y-2">
              {currentFeature.benefits.map((benefit, index) => (
                <li key={index} className="flex items-start">
                  <CheckCircle className="text-green-500 mr-2 flex-shrink-0 mt-0.5" size={16} />
                  <span className="text-gray-700">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Side - Examples */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6">
          <h4 className="font-semibold text-gray-900 mb-4">Real Examples:</h4>
          <div className="space-y-3">
            {currentFeature.examples.map((example, index) => (
              <div key={index} className="flex items-start">
                <ArrowRight className="text-blue-500 mr-2 flex-shrink-0 mt-1" size={16} />
                <span className="text-gray-700 text-sm">{example}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <button
          onClick={() => setActiveFeature(Math.max(0, activeFeature - 1))}
          disabled={activeFeature === 0}
          className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowLeft size={16} className="mr-2" />
          Previous
        </button>
        
        <div className="flex space-x-2">
          {features.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveFeature(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                activeFeature === index ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>

        <button
          onClick={() => setActiveFeature(Math.min(features.length - 1, activeFeature + 1))}
          disabled={activeFeature === features.length - 1}
          className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
          <ArrowRight size={16} className="ml-2" />
        </button>
      </div>
    </div>
  );
}
