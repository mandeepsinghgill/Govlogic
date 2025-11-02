import { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, Play, Pause, RotateCcw } from 'lucide-react';

interface TourStep {
  id: string;
  title: string;
  description: string;
  content: React.ReactNode;
  duration?: number;
}

interface ProductTourProps {
  isOpen: boolean;
  onClose: () => void;
  userTypes: string[];
}

export default function ProductTour({ isOpen, onClose, userTypes }: ProductTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const tourSteps: TourStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to GovSureAI! 🎉',
      description: 'Let\'s take a quick tour of how AI can transform your government contracting workflow',
      content: (
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">What you'll see:</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                AI-powered opportunity matching
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                Intelligent proposal generation
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                Real-time collaboration tools
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-orange-500 rounded-full mr-3"></span>
                Compliance automation
              </li>
            </ul>
          </div>
        </div>
      ),
      duration: 5000
    },
    {
      id: 'opportunities',
      title: 'AI Opportunity Matching',
      description: 'Our AI analyzes thousands of opportunities and shows you the best matches',
      content: (
        <div className="space-y-4">
          <div className="bg-white border-2 border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-900">Cybersecurity Operations Center</h4>
              <div className="flex items-center space-x-2">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-bold">93</span>
                </div>
                <span className="text-xs text-gray-500">AI Score</span>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-3">Department of Defense • $12.5M • Due in 30 days</p>
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-xs text-blue-800">
                <span className="font-semibold">Why this match:</span> Strong past performance in DoD cybersecurity, active security clearances, incumbent advantage
              </p>
            </div>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span>Live matching in real-time</span>
            </div>
          </div>
        </div>
      ),
      duration: 6000
    },
    {
      id: 'proposal-generation',
      title: 'AI Proposal Generation',
      description: 'Upload an RFP and watch AI generate a complete, compliant proposal',
      content: (
        <div className="space-y-4">
          <div className="bg-white border-2 border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-900">Proposal: IT Help Desk Support</h4>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-sm">✓</span>
                </div>
                <span className="text-xs text-gray-500">Generated</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Executive Summary</span>
                <span className="text-green-600 font-semibold">✓ Complete</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Technical Approach</span>
                <span className="text-green-600 font-semibold">✓ Complete</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Past Performance</span>
                <span className="text-green-600 font-semibold">✓ Complete</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Compliance Matrix</span>
                <span className="text-green-600 font-semibold">✓ Complete</span>
              </div>
            </div>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
              <span>Generated in 2 minutes</span>
            </div>
          </div>
        </div>
      ),
      duration: 6000
    },
    {
      id: 'collaboration',
      title: 'Real-Time Collaboration',
      description: 'Work with your team in real-time, just like Google Docs',
      content: (
        <div className="space-y-4">
          <div className="bg-white border-2 border-purple-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-900">Team Collaboration</h4>
              <div className="flex -space-x-2">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">JD</div>
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">SM</div>
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">AK</div>
              </div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg mb-3">
              <p className="text-sm text-gray-700">
                "Great work on the technical approach section. I've added some details about our cloud infrastructure capabilities."
              </p>
              <p className="text-xs text-gray-500 mt-1">Sarah M. • 2 minutes ago</p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-600">3 team members online</span>
            </div>
          </div>
        </div>
      ),
      duration: 5000
    },
    {
      id: 'compliance',
      title: 'Automated Compliance',
      description: 'Never miss a requirement again with AI-powered compliance checking',
      content: (
        <div className="space-y-4">
          <div className="bg-white border-2 border-orange-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-900">Compliance Check</h4>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-sm">95%</span>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">FAR Requirements</span>
                <span className="text-green-600 font-semibold">✓ Complete</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Security Clearances</span>
                <span className="text-green-600 font-semibold">✓ Complete</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Certifications</span>
                <span className="text-yellow-600 font-semibold">⚠ Review</span>
              </div>
            </div>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm">
              <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
              <span>Real-time compliance monitoring</span>
            </div>
          </div>
        </div>
      ),
      duration: 5000
    }
  ];

  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            nextStep();
            return 0;
          }
          return prev + 2;
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [isPlaying]);

  const nextStep = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
      setProgress(0);
    } else {
      setIsPlaying(false);
      setProgress(0);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setProgress(0);
    }
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const resetTour = () => {
    setCurrentStep(0);
    setProgress(0);
    setIsPlaying(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">{tourSteps[currentStep].title}</h2>
              <p className="text-blue-100 mt-1">{tourSteps[currentStep].description}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-blue-200 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-blue-100 mb-2">
              <span>Step {currentStep + 1} of {tourSteps.length}</span>
              <span>{Math.round(((currentStep + 1) / tourSteps.length) * 100)}% Complete</span>
            </div>
            <div className="w-full bg-blue-800 rounded-full h-2">
              <div 
                className="bg-white h-2 rounded-full transition-all duration-100"
                style={{ width: `${((currentStep + 1) / tourSteps.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {tourSteps[currentStep].content}
        </div>

        {/* Controls */}
        <div className="bg-gray-50 p-6 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={togglePlayPause}
              className="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </button>
            <button
              onClick={resetTour}
              className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50"
            >
              <RotateCcw size={20} />
            </button>
          </div>

          <div className="flex items-center space-x-3">
            {currentStep < tourSteps.length - 1 ? (
              <button
                onClick={nextStep}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
              >
                Next
              </button>
            ) : (
              <button
                onClick={onClose}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
              >
                Get Started!
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
