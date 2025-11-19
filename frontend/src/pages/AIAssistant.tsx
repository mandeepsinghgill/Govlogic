/**
 * AI Assistant - Your Intelligent Proposal Writing Companion
 * ChatGPT-like interface with OpenAI integration
 * Optimized prompts for government contracting and proposal writing
 * Returns formatted responses with markdown support
 */

import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Copy, ThumbsUp, ThumbsDown, RotateCcw, Loader2, FileText, Lightbulb, Search, BookOpen } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface QuickPrompt {
  icon: React.ReactNode;
  title: string;
  prompt: string;
  category: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gpt-4o');
  const [aiStatus, setAiStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Check AI status on mount
  useEffect(() => {
    checkAIStatus();
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const checkAIStatus = async () => {
    try {
      const response = await fetch(`${API_URL}/api/v1/ai/status`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      const data = await response.json();
      setAiStatus(data.status === 'online' ? 'online' : 'offline');
    } catch {
      setAiStatus('offline');
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [input]);

  // Quick action prompts optimized for proposal writing
  const quickPrompts: QuickPrompt[] = [
    {
      icon: <FileText className="w-5 h-5" />,
      title: 'Write Executive Summary',
      prompt: 'Help me write a compelling executive summary for a government proposal. The opportunity is about [describe your opportunity]. Please create a concise, persuasive executive summary following Shipley standards.',
      category: 'Proposal Writing'
    },
    {
      icon: <Lightbulb className="w-5 h-5" />,
      title: 'Generate Win Themes',
      prompt: 'Help me develop 3-5 strong win themes for my proposal. The client is [agency name] and they need [requirement]. What are our key competitive advantages and how should we position them?',
      category: 'Strategy'
    },
    {
      icon: <Search className="w-5 h-5" />,
      title: 'Research Requirements',
      prompt: 'Analyze this RFP section and extract all compliance requirements. Then help me understand what the government is really asking for: [paste RFP section]',
      category: 'Research'
    },
    {
      icon: <BookOpen className="w-5 h-5" />,
      title: 'Improve Section',
      prompt: 'Review and improve this proposal section. Make it more compelling, ensure it addresses evaluation criteria, and follows Shipley best practices: [paste section]',
      category: 'Editing'
    },
  ];

  const systemPrompt = `You are an expert AI assistant specializing in government contracting and proposal writing. You have deep knowledge of:

- Federal acquisition regulations (FAR)
- Shipley proposal development standards
- Winning proposal strategies and themes
- Compliance matrix development
- Government evaluation criteria
- Technical writing for proposals
- Past performance narratives
- Price-to-win strategies

Your role is to help users:
1. Write compelling, compliant proposals
2. Develop strong win themes and discriminators
3. Analyze RFPs and extract requirements
4. Improve proposal sections for maximum impact
5. Provide strategic advice on capture and proposal management

Always be concise, actionable, and focused on helping win government contracts. Use clear, professional language suitable for proposal documents.`;

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      console.log('🤖 Sending message to AI...', {
        model: selectedModel,
        messageCount: messages.length + 1
      });

      // Call OpenAI API through backend
      const response = await fetch(`${API_URL}/api/v1/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages.map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: input.trim() }
          ],
          stream: false,
          temperature: 0.7,
          max_tokens: 2000,
        }),
      });

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error:', errorText);
        let errorMessage = 'Failed to get AI response.';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.detail || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('✅ Received response from AI');
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || 'I apologize, but I received an empty response. Please try again.',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      setAiStatus('online'); // Update status on successful response
    } catch (error: any) {
      console.error('❌ AI Error:', error);
      setAiStatus('offline'); // Update status on error
      
      // Error message for user
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I'm having trouble connecting to the AI service. ${error.message || 'Please check your OpenAI API key configuration.'}

**Troubleshooting:**
1. **Check API Key**: Ensure OPENAI_API_KEY is set in backend environment
2. **Verify Connection**: Check backend logs for errors
3. **Try Again**: The service may be temporarily unavailable

If the issue persists, please contact support.`,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt);
    textareaRef.current?.focus();
  };

  // Format message content with markdown support
  const formatMessageContent = (content: string) => {
    // Split content into lines for processing
    const lines = content.split('\n');
    const formattedLines: React.ReactNode[] = [];
    let inList = false;
    let listItems: string[] = [];
    
    lines.forEach((line, index) => {
      const trimmed = line.trim();
      
      // Headers
      if (trimmed.startsWith('### ')) {
        if (inList) {
          formattedLines.push(<ul key={`list-${index}`} className="list-disc list-inside my-2 space-y-1">{listItems.map((item, i) => <li key={i}>{item}</li>)}</ul>);
          listItems = [];
          inList = false;
        }
        formattedLines.push(<h3 key={index} className="font-bold text-lg mt-4 mb-2">{trimmed.substring(4)}</h3>);
        return;
      }
      if (trimmed.startsWith('## ')) {
        if (inList) {
          formattedLines.push(<ul key={`list-${index}`} className="list-disc list-inside my-2 space-y-1">{listItems.map((item, i) => <li key={i}>{item}</li>)}</ul>);
          listItems = [];
          inList = false;
        }
        formattedLines.push(<h2 key={index} className="font-bold text-xl mt-4 mb-2">{trimmed.substring(3)}</h2>);
        return;
      }
      if (trimmed.startsWith('# ')) {
        if (inList) {
          formattedLines.push(<ul key={`list-${index}`} className="list-disc list-inside my-2 space-y-1">{listItems.map((item, i) => <li key={i}>{item}</li>)}</ul>);
          listItems = [];
          inList = false;
        }
        formattedLines.push(<h1 key={index} className="font-bold text-2xl mt-4 mb-2">{trimmed.substring(2)}</h1>);
        return;
      }
      
      // Lists
      if (trimmed.match(/^[-*] /) || trimmed.match(/^\d+\. /)) {
        const itemText = trimmed.replace(/^[-*] /, '').replace(/^\d+\. /, '');
        listItems.push(itemText);
        inList = true;
        return;
      }
      
      // Close list if we hit a non-list line
      if (inList && trimmed) {
        formattedLines.push(<ul key={`list-${index}`} className="list-disc list-inside my-2 space-y-1">{listItems.map((item, i) => <li key={i}>{item}</li>)}</ul>);
        listItems = [];
        inList = false;
      }
      
      // Code blocks
      if (trimmed.startsWith('```')) {
        // Skip code block markers, they'll be handled separately if needed
        return;
      }
      
      // Regular text with markdown formatting
      if (trimmed) {
        let formatted = trimmed;
        // Bold (**text**)
        formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        // Inline code (`code`)
        formatted = formatted.replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">$1</code>');
        formattedLines.push(<p key={index} dangerouslySetInnerHTML={{ __html: formatted }} className="mb-2" />);
      } else if (!inList) {
        formattedLines.push(<br key={`br-${index}`} />);
      }
    });
    
    // Close any remaining list
    if (inList && listItems.length > 0) {
      formattedLines.push(<ul key="list-final" className="list-disc list-inside my-2 space-y-1">{listItems.map((item, i) => <li key={i}>{item}</li>)}</ul>);
    }
    
    return <div>{formattedLines}</div>;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    // Could add toast notification here
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">AI Assistant</h1>
              <p className="text-sm text-gray-600">Your intelligent proposal writing companion</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                aiStatus === 'online' ? 'bg-green-500' : 
                aiStatus === 'offline' ? 'bg-red-500' : 
                'bg-yellow-500'
              }`} title={aiStatus === 'online' ? 'OpenAI Online' : 'OpenAI Offline'} />
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="gpt-4o">GPT-4o (Recommended)</option>
                <option value="gpt-4o-mini">GPT-4o Mini (Faster)</option>
                <option value="gpt-4-turbo">GPT-4 Turbo</option>
              </select>
            </div>
            {messages.length > 0 && (
              <button
                onClick={clearChat}
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span className="text-sm">Clear</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.length === 0 ? (
            // Welcome Screen
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                Welcome to Your AI Assistant
              </h2>
              <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                I'm here to help you write winning government proposals. Ask me anything about proposal development, RFP analysis, or writing strategies.
              </p>

              {/* Quick Prompts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                {quickPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleQuickPrompt(prompt.prompt)}
                    className="text-left p-4 bg-white rounded-xl border-2 border-gray-200 hover:border-purple-500 hover:shadow-lg transition-all group"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-purple-100 rounded-lg text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                        {prompt.icon}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 mb-1">{prompt.title}</p>
                        <p className="text-sm text-gray-600 line-clamp-2">{prompt.prompt}</p>
                        <span className="inline-block mt-2 text-xs text-purple-600 font-medium">
                          {prompt.category}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            // Chat Messages
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-3xl ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'
                      : 'bg-white border border-gray-200'
                  } rounded-2xl px-6 py-4 shadow-sm`}
                >
                  <div className="flex items-start space-x-3">
                    {message.role === 'assistant' && (
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className={`prose prose-sm max-w-none ${message.role === 'user' ? 'prose-invert' : ''}`}>
                        <div className={`${message.role === 'user' ? 'text-white' : 'text-gray-800'}`}>
                          {formatMessageContent(message.content)}
                        </div>
                      </div>
                      {message.role === 'assistant' && (
                        <div className="flex items-center space-x-2 mt-3 pt-3 border-t border-gray-100">
                          <button
                            onClick={() => copyMessage(message.content)}
                            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Copy"
                          >
                            <Copy className="w-4 h-4 text-gray-600" />
                          </button>
                          <button
                            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Good response"
                          >
                            <ThumbsUp className="w-4 h-4 text-gray-600" />
                          </button>
                          <button
                            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Bad response"
                          >
                            <ThumbsDown className="w-4 h-4 text-gray-600" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 rounded-2xl px-6 py-4 shadow-sm">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center">
                    <Loader2 className="w-4 h-4 text-white animate-spin" />
                  </div>
                  <p className="text-gray-600">Thinking...</p>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end space-x-3">
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything about proposal writing, RFP analysis, or strategy..."
                rows={1}
                className="w-full px-4 py-3 pr-12 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none max-h-32"
                disabled={loading}
              />
              <div className="absolute right-3 bottom-3 text-xs text-gray-400">
                {input.length > 0 && `${input.length} chars`}
              </div>
            </div>
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="p-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Press Enter to send, Shift+Enter for new line • Powered by OpenAI GPT-4o
          </p>
        </div>
      </div>
    </div>
  );
}

