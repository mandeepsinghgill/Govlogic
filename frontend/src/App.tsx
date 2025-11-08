import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './App.css';
import LandingNew from './pages/LandingNew';
import DashboardModern from './pages/DashboardModern';
import Features from './pages/Features';
import HowItWorks from './pages/HowItWorks';
import CaseStudies from './pages/CaseStudies';
import Pricing from './pages/Pricing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Onboarding from './pages/Onboarding';
import DesignTest from './pages/DesignTest';
import ProposalEditor from './pages/ProposalEditor';
import Dashboard from './pages/DashboardEnhanced';
import AdaptiveDashboard from './pages/AdaptiveDashboard';
import CrossPollinationFeatures from './components/CrossPollinationFeatures';
import SmartDashboard from './components/SmartDashboard';
import Opportunities from './pages/OpportunitiesEnhanced';
import OpportunitiesNew from './pages/OpportunitiesNew';
import Proposals from './pages/Proposals';
import ProposalsNew from './pages/ProposalsNew';
import NewProposal from './pages/NewProposal';
import Capture from './pages/Capture';
import KnowledgeBase from './pages/KnowledgeBase';
import Programs from './pages/Programs';
import RFPShredder from './pages/RFPShredder';
import ComplianceMatrix from './pages/ComplianceMatrix';
import PartnerSearch from './pages/PartnerSearch';
import PricingAnalysisCalculator from './pages/PricingAnalysisCalculator';
import Grants from './pages/Grants';
import GrantsDiscover from './pages/GrantsDiscover';
import GrantNew from './pages/GrantNew';
import GrantDetail from './pages/GrantDetail';
import SF424Forms from './pages/SF424Forms';
import NOFOParser from './pages/NOFOParser';
import BudgetBuilder from './pages/BudgetBuilder';
import CaptureManagement from './pages/CaptureManagement';
import CaptureDetail from './pages/CaptureDetail';
import GoNoGoDashboard from './pages/GoNoGoDashboard';
import ProposalGenerator from './pages/ProposalGenerator';
import Reports from './pages/Reports';
import ProgramsEnhanced from './pages/ProgramsEnhanced';
import ProgramDetail from './pages/ProgramDetail';
import { Menu, X, Target, FileText, Briefcase, Database, FolderKanban, LogOut, Upload, Users, CheckSquare, DollarSign, ThumbsUp, Zap, BarChart3, GitBranch, Search, Bell, Settings, User, ChevronDown, HelpCircle, UserCircle, MessageSquare, Sparkles } from 'lucide-react';
import PipelineManager from './pages/PipelineManager';
import AIAssistant from './pages/AIAssistant';
import { useAutoLogout } from './hooks/useAutoLogout';

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

// Main App Layout (for authenticated pages)
function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(3);

  // Enable auto-logout after 10 minutes of inactivity for security & compliance
  useAutoLogout();

  useEffect(() => {
    const userData = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    localStorage.removeItem('organization');
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('refresh_token');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('organization');
    window.location.href = '/login';
  };

  // Search suggestions based on all available pages
  const searchSuggestions = [
    { name: 'Dashboard', path: '/dashboard', icon: <FolderKanban size={16} /> },
    { name: 'Opportunities', path: '/opportunities', icon: <Target size={16} /> },
    { name: 'Pipeline Manager', path: '/pipeline', icon: <GitBranch size={16} /> },
    { name: 'Proposals', path: '/proposals', icon: <FileText size={16} /> },
    { name: 'Grants', path: '/grants', icon: <DollarSign size={16} /> },
    { name: 'Capture Management', path: '/capture', icon: <Briefcase size={16} /> },
    { name: 'Knowledge Base', path: '/knowledge', icon: <Database size={16} /> },
    { name: 'Programs', path: '/programs', icon: <FolderKanban size={16} /> },
    { name: 'Reports & Analytics', path: '/reports', icon: <BarChart3 size={16} /> },
    { name: 'Pricing Analysis', path: '/pricing-analysis', icon: <DollarSign size={16} /> },
    { name: 'RFP Shredder', path: '/rfp-shredder', icon: <Upload size={16} /> },
    { name: 'Partner Search', path: '/partner-search', icon: <Users size={16} /> },
    { name: 'Go/No-Go', path: '/go-no-go', icon: <ThumbsUp size={16} /> },
  ];

  const filteredSuggestions = searchQuery
    ? searchSuggestions.filter(s => 
        s.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const getUserInitials = () => {
    if (!user?.full_name) return 'U';
    return user.full_name
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modern Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="px-4 py-3 flex items-center justify-between">
          {/* Left Section */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? <X size={22} className="text-gray-700" /> : <Menu size={22} className="text-gray-700" />}
            </button>
            <Link to="/dashboard" className="flex items-center space-x-3">
              <img 
                  src="/govsure-logo.png" 
                  alt="GovSure" 
                  className="h-auto"
                  style={{ width: "150px"}}
                />
            </Link>
          </div>

          {/* Center Section - Search */}
          <div className="flex-1 max-w-2xl mx-8 relative hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search pages, opportunities, proposals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchOpen(true)}
                onBlur={() => setTimeout(() => setSearchOpen(false), 200)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
              
              {/* Search Suggestions Dropdown */}
              {searchOpen && filteredSuggestions.length > 0 && (
                <div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-lg border border-gray-200 py-2 max-h-96 overflow-y-auto">
                  {filteredSuggestions.map((suggestion, idx) => (
                    <Link
                      key={idx}
                      to={suggestion.path}
                      className="flex items-center space-x-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
                      onClick={() => {
                        setSearchQuery('');
                        setSearchOpen(false);
                      }}
                    >
                      <div className="text-gray-500">{suggestion.icon}</div>
                      <span className="text-gray-900 font-medium">{suggestion.name}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-2">
            {/* Mobile Search Toggle */}
            <button
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors md:hidden"
              aria-label="Search"
            >
              <Search size={20} className="text-gray-700" />
            </button>

            {/* Help */}
            <button
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors hidden lg:flex"
              title="Help & Documentation"
            >
              <HelpCircle size={20} className="text-gray-700" />
            </button>

            {/* Notifications */}
            <button
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative"
              title="Notifications"
            >
              <Bell size={20} className="text-gray-700" />
              {notificationCount > 0 && (
                <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {notificationCount}
                </span>
              )}
            </button>

            {/* Settings */}
            <Link
              to="/proposal-generator"
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors hidden sm:flex"
              title="Settings"
            >
              <Settings size={20} className="text-gray-700" />
            </Link>

            {/* Divider */}
            <div className="h-8 w-px bg-gray-200 mx-1"></div>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-9 h-9 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {getUserInitials()}
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-sm font-semibold text-gray-900">{user?.full_name || 'User'}</p>
                  <p className="text-xs text-gray-500">{user?.email || 'user@example.com'}</p>
                </div>
                <ChevronDown size={16} className="text-gray-500 hidden lg:block" />
              </button>

              {/* User Dropdown Menu */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-900">{user?.full_name || 'User'}</p>
                    <p className="text-xs text-gray-500">{user?.email || 'user@example.com'}</p>
                  </div>
                  
                  <div className="py-2">
                    <Link
                      to="/dashboard"
                      className="flex items-center space-x-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <UserCircle size={18} className="text-gray-600" />
                      <span className="text-sm text-gray-700">My Profile</span>
                    </Link>
                    
                    <Link
                      to="/proposal-generator"
                      className="flex items-center space-x-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <Settings size={18} className="text-gray-600" />
                      <span className="text-sm text-gray-700">Settings</span>
                    </Link>

                    <Link
                      to="/knowledge"
                      className="flex items-center space-x-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <Database size={18} className="text-gray-600" />
                      <span className="text-sm text-gray-700">Knowledge Base</span>
                    </Link>

                    <Link
                      to="/reports"
                      className="flex items-center space-x-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <BarChart3 size={18} className="text-gray-600" />
                      <span className="text-sm text-gray-700">Reports & Analytics</span>
                    </Link>

                    <div className="border-t border-gray-100 my-2"></div>

                    <Link
                      to="/"
                      className="flex items-center space-x-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <HelpCircle size={18} className="text-gray-600" />
                      <span className="text-sm text-gray-700">Help & Support</span>
                    </Link>

                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        handleLogout();
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-2.5 hover:bg-red-50 transition-colors text-left"
                    >
                      <LogOut size={18} className="text-red-600" />
                      <span className="text-sm text-red-600 font-medium">Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar (collapsible like YouTube: icons only when collapsed) */}
        <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white shadow-md min-h-screen transition-[width] duration-200 ease-in-out`}> 
          <nav className="p-4 space-y-2">
            <NavLink to="/dashboard" icon={<FolderKanban size={20} />} text="Dashboard" collapsed={!sidebarOpen} />
            <NavLink to="/opportunities" icon={<Target size={20} />} text="Opportunities" collapsed={!sidebarOpen} />
            <NavLink to="/pipeline" icon={<GitBranch size={20} />} text="Pipeline Manager" collapsed={!sidebarOpen} />
            <NavLink to="/proposals" icon={<FileText size={20} />} text="Proposals" collapsed={!sidebarOpen} />
            <NavLink to="/grants" icon={<DollarSign size={20} />} text="Grants" collapsed={!sidebarOpen} />
            <NavLink to="/capture" icon={<Briefcase size={20} />} text="Capture" collapsed={!sidebarOpen} />
            <NavLink to="/knowledge" icon={<Database size={20} />} text="Knowledge Base" collapsed={!sidebarOpen} />
            <NavLink to="/programs" icon={<FolderKanban size={20} />} text="Programs" collapsed={!sidebarOpen} />
            <NavLink to="/reports" icon={<BarChart3 size={20} />} text="Reports & Analytics" collapsed={!sidebarOpen} />
            
            {/* AI Assistant */}
            <div className="pt-4 mt-4 border-t border-gray-200">
              <NavLink 
                to="/ai-assistant" 
                icon={<Sparkles size={20} className="text-purple-600" />} 
                text="AI Assistant" 
                collapsed={!sidebarOpen}
              />
            </div>

            {/* Bid Workspace */}
            <div className="pt-4 mt-4 border-t border-gray-200">
              <div className={`${sidebarOpen ? 'px-4 py-2' : 'hidden'} text-xs font-semibold text-gray-500 uppercase tracking-wide`}>
                Bid Workspace
              </div>
              <NavLink to="/pricing-analysis" icon={<DollarSign size={20} />} text="Pricing Analysis" collapsed={!sidebarOpen} />
              <NavLink to="/rfp-shredder" icon={<Upload size={20} />} text="RFP Shredder" collapsed={!sidebarOpen} />
              <NavLink to="/partner-search" icon={<Users size={20} />} text="Partner Search" collapsed={!sidebarOpen} />
              <NavLink to="/go-no-go" icon={<ThumbsUp size={20} />} text="Go/No-Go" collapsed={!sidebarOpen} />
              <NavLink to="/proposal-generator" icon={<Zap size={20} />} text="Proposal Settings" collapsed={!sidebarOpen} />
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

function NavLink({ to, icon, text, collapsed }: { to: string; icon: React.ReactNode; text: string; collapsed?: boolean }) {
  return (
    <Link
      to={to}
      className={`flex items-center ${collapsed ? 'justify-center px-2' : 'space-x-3 px-4'} py-3 rounded-lg hover:bg-blue-50 hover:text-blue-900 transition-colors`}
      title={text}
    >
      {icon}
      <span className={`${collapsed ? 'hidden' : ''} font-medium`}>{text}</span>
    </Link>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingNew />} />
        <Route path="/design-test" element={<DesignTest />} />
        <Route path="/features" element={<Features />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/case-studies" element={<CaseStudies />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* Onboarding (Protected) */}
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <Onboarding />
            </ProtectedRoute>
          }
        />
        
        {/* Protected Routes with Layout */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AppLayout>
                <DashboardModern />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/opportunities/:opportunityId"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Opportunities />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/opportunities"
          element={
            <ProtectedRoute>
              <AppLayout>
                <OpportunitiesNew />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/pipeline"
          element={
            <ProtectedRoute>
              <AppLayout>
                <PipelineManager />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/proposals/new"
          element={
            <ProtectedRoute>
              <AppLayout>
                <NewProposal />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/proposals/:proposalId/edit"
          element={
            <ProtectedRoute>
              <AppLayout>
                <ProposalEditor />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/proposals/:proposalId"
          element={
            <ProtectedRoute>
              <AppLayout>
                <ProposalEditor />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/proposals"
          element={
            <ProtectedRoute>
              <AppLayout>
                <ProposalsNew />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/capture"
          element={
            <ProtectedRoute>
              <AppLayout>
                <CaptureManagement />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/capture/:id"
          element={
            <ProtectedRoute>
              <AppLayout>
                <CaptureDetail />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/knowledge"
          element={
            <ProtectedRoute>
              <AppLayout>
                <KnowledgeBase />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/programs"
          element={
            <ProtectedRoute>
              <AppLayout>
                <ProgramsEnhanced />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/programs/:id"
          element={
            <ProtectedRoute>
              <AppLayout>
                <ProgramDetail />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Reports />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        
        {/* InZTan Gov Supreme Routes */}
        <Route
          path="/pricing-analysis"
          element={
            <ProtectedRoute>
              <AppLayout>
                <PricingAnalysisCalculator />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/rfp-shredder"
          element={
            <ProtectedRoute>
              <AppLayout>
                <RFPShredder />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/compliance-matrix/:opportunityId"
          element={
            <ProtectedRoute>
              <AppLayout>
                <ComplianceMatrix />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/partner-search"
          element={
            <ProtectedRoute>
              <AppLayout>
                <PartnerSearch />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/grants"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Grants />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/grants/discover"
          element={
            <ProtectedRoute>
              <AppLayout>
                <GrantsDiscover />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/grants/new"
          element={
            <ProtectedRoute>
              <AppLayout>
                <GrantNew />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/grants/:id"
          element={
            <ProtectedRoute>
              <AppLayout>
                <GrantDetail />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/grants/sf-424"
          element={
            <ProtectedRoute>
              <AppLayout>
                <SF424Forms />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/grants/nofo-parser"
          element={
            <ProtectedRoute>
              <AppLayout>
                <NOFOParser />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/grants/budget-tool"
          element={
            <ProtectedRoute>
              <AppLayout>
                <BudgetBuilder />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/go-no-go"
          element={
            <ProtectedRoute>
              <AppLayout>
                <GoNoGoDashboard />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/proposal-generator"
          element={
            <ProtectedRoute>
              <AppLayout>
                <ProposalGenerator />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/proposal-generator/:opportunityId"
          element={
            <ProtectedRoute>
              <AppLayout>
                <ProposalGenerator />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/ai-assistant"
          element={
            <ProtectedRoute>
              <AppLayout>
                <AIAssistant />
              </AppLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;

