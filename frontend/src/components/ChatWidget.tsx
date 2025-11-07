import { useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-2xl transition-all transform hover:scale-110 z-50"
        >
          <MessageCircle size={28} />
        </button>
      )}

      {/* Chat Widget */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 bg-white rounded-2xl shadow-2xl z-50 flex flex-col" style={{ height: '500px' }}>
          {/* Header */}
          <div className="bg-blue-900 text-white p-4 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-700 rounded-full flex items-center justify-center font-bold">
                GS
              </div>
              <div>
                <p className="font-semibold">GovSure Support</p>
                <p className="text-xs text-blue-200">Online • Usually replies instantly</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-blue-800 rounded-lg p-1 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
            {showSuggestions ? (
              <div className="space-y-3">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <p className="text-gray-700 font-medium mb-3">👋 Hi! How can we help you today?</p>
                  <p className="text-sm text-gray-500 mb-4">Looking for more information?</p>
                  <div className="space-y-2">
                    <button 
                      onClick={() => window.open('https://calendly.com/govsure/demo', '_blank')}
                      className="w-full text-left px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-lg text-blue-900 font-medium transition-colors"
                    >
                      📅 Book a Demo
                    </button>
                    <button 
                      onClick={() => window.location.href = '/features'}
                      className="w-full text-left px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-800 transition-colors"
                    >
                      ✨ View Features
                    </button>
                    <button 
                      onClick={() => window.location.href = '/pricing'}
                      className="w-full text-left px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-800 transition-colors"
                    >
                      💰 See Pricing
                    </button>
                    <button 
                      onClick={() => window.open('https://calendly.com/govsure/demo', '_blank')}
                      className="w-full text-left px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-800 transition-colors"
                    >
                      📞 Contact Sales
                    </button>
                  </div>
                </div>
                <p className="text-xs text-gray-500 text-center">Or type your question below</p>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                Start a conversation...
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Type your message..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                onFocus={() => setShowSuggestions(false)}
              />
              <button className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg transition-colors">
                <Send size={20} />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Powered by GovSure
            </p>
          </div>
        </div>
      )}
    </>
  );
}

