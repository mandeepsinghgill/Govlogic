import { useState, useRef, useEffect } from 'react';
import { X, Send, MessageCircle, Search, ChevronDown, ExternalLink } from 'lucide-react';

interface Message {
  id: number;
  text: string;
  isBot: boolean;
  timestamp: Date;
  suggestions?: string[];
}

interface FAQ {
  category: string;
  question: string;
  answer: string;
  relatedQuestions?: string[];
}

const faqs: FAQ[] = [
  // Product FAQs
  {
    category: "Product",
    question: "What is GovSure?",
    answer: "GovSure is an AI-powered platform that helps government contractors and grant seekers find opportunities, write compliant proposals, and win more contracts. We streamline the entire process from opportunity discovery to proposal submission."
  },
  {
    category: "Product",
    question: "How does GovSure help me win contracts?",
    answer: "GovSure uses AI to: 1) Find opportunities matched to your capabilities, 2) Analyze RFPs and extract requirements, 3) Generate compliant proposals using Shipley standards, 4) Check compliance automatically, and 5) Provide pricing intelligence. This saves you weeks of work and increases your win rate."
  },
  {
    category: "Product",
    question: "What types of contracts does GovSure support?",
    answer: "GovSure supports all federal, state, and local government contracts including: Defense/DoD, Civilian agencies, State/Local governments, Healthcare, Education, and Infrastructure projects. We integrate with SAM.gov, Grants.gov, and other sources."
  },
  
  // Pricing & Plans
  {
    category: "Pricing",
    question: "How much does GovSure cost?",
    answer: "GovSure offers flexible pricing: Starter at $99/month (5 proposals), Professional at $299/month (20 proposals), and Enterprise with custom pricing. All plans include a 7-day free trial with no credit card required."
  },
  {
    category: "Pricing",
    question: "Is there a free trial?",
    answer: "Yes! We offer a 14-day free trial on all plans. No credit card required to start. You'll have full access to all features during the trial period."
  },
  {
    category: "Pricing",
    question: "Can I cancel anytime?",
    answer: "Absolutely! You can cancel your subscription at any time. No long-term contracts or cancellation fees. If you cancel, you'll have access until the end of your billing period."
  },

  // Getting Started
  {
    category: "Getting Started",
    question: "How do I get started?",
    answer: "Getting started is easy: 1) Sign up for a free trial, 2) Complete your business profile, 3) Upload your past performance, 4) Browse matched opportunities, 5) Generate your first proposal. Our onboarding wizard guides you through each step."
  },
  {
    category: "Getting Started",
    question: "Do I need technical skills?",
    answer: "No technical skills required! GovSure is designed for proposal managers and business development professionals. If you can use Word and email, you can use GovSure. We also provide training and support."
  },
  {
    category: "Getting Started",
    question: "How long does setup take?",
    answer: "Initial setup takes about 15-20 minutes. You'll enter your business information and upload key documents. After that, you can start finding opportunities and generating proposals immediately."
  },

  // Features
  {
    category: "Features",
    question: "Does GovSure integrate with SAM.gov?",
    answer: "Yes! GovSure integrates directly with SAM.gov, Grants.gov, and other government contracting databases. We pull opportunities automatically and match them to your capabilities."
  },
  {
    category: "Features",
    question: "Can I collaborate with my team?",
    answer: "Yes! All paid plans include team collaboration. Add team members, assign roles, track changes, and work together on proposals in real-time. Enterprise plans support unlimited users."
  },
  {
    category: "Features",
    question: "What formats can I export proposals in?",
    answer: "You can export proposals in multiple formats: Microsoft Word (.docx), PDF, and plain text. All formats maintain proper formatting and compliance matrices."
  },

  // Support & Contact
  {
    category: "Support",
    question: "How do I contact support?",
    answer: "We offer multiple support channels: Email us at support@govsure.ai, Schedule a call through our calendar, or use this chat for quick questions. Enterprise customers get dedicated support."
  },
  {
    category: "Support",
    question: "Do you offer training?",
    answer: "Yes! We provide: Live onboarding sessions, Video tutorials, Documentation library, Webinars, and One-on-one training for Enterprise customers."
  },

  // Partnership & Donation
  {
    category: "Partnership",
    question: "How can I become a partner?",
    answer: "We love partnerships! Email partnerships@govsure.ai to discuss: Referral partnerships, Integration partnerships, Reseller opportunities, or Strategic alliances. We offer competitive partner programs."
  },
  {
    category: "Partnership",
    question: "Do you have a referral program?",
    answer: "Yes! Refer other contractors and earn rewards. Contact partnerships@govsure.ai for details on our referral program and commission structure."
  },

  // Security & Compliance
  {
    category: "Security",
    question: "Is my data secure?",
    answer: "Absolutely! We use: AES-256 encryption, SOC 2 Type II compliance, NIST 800-171 standards, Regular security audits, and No AI training on your data. Your proposals and business information are completely secure."
  },
  {
    category: "Security",
    question: "Are you FedRAMP certified?",
    answer: "We are working towards FedRAMP certification and currently implement FedRAMP-equivalent security controls. We meet NIST 800-171 requirements and are SOC 2 Type II compliant."
  }
];

export default function FAQChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      text: "👋 Hi! I'm here to help you learn about GovSure. What would you like to know?",
      isBot: true,
      timestamp: new Date(),
      suggestions: [
        "What is GovSure?",
        "How much does it cost?",
        "How do I get started?",
        "Is there a free trial?"
      ]
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const categories = ['All', ...new Set(faqs.map(faq => faq.category))];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const findAnswer = (question: string): FAQ | null => {
    const q = question.toLowerCase();
    return faqs.find(faq => 
      faq.question.toLowerCase().includes(q) ||
      q.includes(faq.question.toLowerCase().split(' ').slice(0, 3).join(' ').toLowerCase())
    ) || null;
  };

  const handleSendMessage = (text?: string) => {
    const messageText = text || inputValue.trim();
    if (!messageText) return;

    // Add user message
    const userMessage: Message = {
      id: messages.length,
      text: messageText,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    // Find answer
    setTimeout(() => {
      const faq = findAnswer(messageText);
      
      if (faq) {
        const botMessage: Message = {
          id: messages.length + 1,
          text: faq.answer,
          isBot: true,
          timestamp: new Date(),
          suggestions: getRelatedSuggestions(faq.category)
        };
        setMessages(prev => [...prev, botMessage]);
      } else {
        const botMessage: Message = {
          id: messages.length + 1,
          text: "I'm not sure about that specific question. Would you like to:\n\n📧 Email us at support@govsure.ai\n📅 Book a demo to speak with our team\n📚 Browse our FAQ categories below",
          isBot: true,
          timestamp: new Date(),
          suggestions: [
            "What is GovSure?",
            "Show me pricing",
            "How do I contact support?"
          ]
        };
        setMessages(prev => [...prev, botMessage]);
      }
    }, 500);
  };

  const getRelatedSuggestions = (category: string): string[] => {
    const related = faqs
      .filter(f => f.category === category)
      .slice(0, 3)
      .map(f => f.question);
    return related.length > 0 ? related : [
      "What is GovSure?",
      "How much does it cost?",
      "How do I get started?"
    ];
  };

  const filteredFAQs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === 'All' || faq.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full p-4 shadow-2xl hover:scale-110 transition-all z-50 group"
        aria-label="Open chat"
      >
        <MessageCircle size={28} />
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-pulse">
          ?
        </span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 flex flex-col max-h-[600px]">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-t-2xl flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <MessageCircle size={20} />
          </div>
          <div>
            <p className="font-semibold">GovSure Assistant</p>
            <p className="text-xs text-blue-100">Usually replies instantly</p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="hover:bg-white/20 rounded-lg p-1 transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((message) => (
          <div key={message.id}>
            <div className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.isBot
                    ? 'bg-white text-gray-800 shadow-sm border border-gray-100'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                }`}
              >
                <p className="text-sm whitespace-pre-line">{message.text}</p>
              </div>
            </div>
            
            {/* Suggestions */}
            {message.suggestions && message.suggestions.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {message.suggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(suggestion)}
                    className="text-xs px-3 py-1.5 bg-white border border-blue-200 text-blue-600 rounded-full hover:bg-blue-50 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* FAQ Browser */}
      <div className="border-t border-gray-200 p-4 bg-white">
        <div className="mb-3">
          <p className="text-xs font-semibold text-gray-600 mb-2">Browse FAQs</p>
          
          {/* Category Filter */}
          <div className="flex items-center space-x-2 mb-2 overflow-x-auto">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs px-3 py-1 rounded-full whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Popular Questions */}
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {filteredFAQs.slice(0, 4).map((faq, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(faq.question)}
                className="w-full text-left text-xs p-2 rounded-lg hover:bg-blue-50 text-gray-700 transition-colors flex items-center justify-between"
              >
                <span className="truncate">{faq.question}</span>
                <ChevronDown size={12} className="transform -rotate-90 flex-shrink-0" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 p-4 bg-white rounded-b-2xl">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask a question..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          <button
            onClick={() => handleSendMessage()}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg px-4 py-2 hover:shadow-lg transition-all"
          >
            <Send size={18} />
          </button>
        </div>
        
        {/* Quick Actions */}
        <div className="mt-3 flex items-center justify-center space-x-4 text-xs text-gray-500">
          <a href="mailto:support@govsure.ai" className="hover:text-blue-600 flex items-center">
            <ExternalLink size={12} className="mr-1" />
            Email
          </a>
          <button onClick={() => handleSendMessage("How do I book a demo?")} className="hover:text-blue-600">
            Book Demo
          </button>
          <a href="/help" className="hover:text-blue-600">
            Help Center
          </a>
        </div>
      </div>
    </div>
  );
}

