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
import Knowledge from './pages/Knowledge';
import Programs from './pages/Programs';
import RFPShredder from './pages/RFPShredder';
import ComplianceMatrix from './pages/ComplianceMatrix';
import PartnerSearch from './pages/PartnerSearch';
import Grants from './pages/Grants';
import GoNoGoDashboard from './pages/GoNoGoDashboard';
import ProposalGenerator from './pages/ProposalGenerator';
import Reports from './pages/Reports';
import ProgramsEnhanced from './pages/ProgramsEnhanced';
import { Menu, X, Target, FileText, Briefcase, Database, FolderKanban, LogOut, Upload, Users, CheckSquare, DollarSign, ThumbsUp, Zap, BarChart3 } from 'lucide-react';

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('access_token');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

// Main App Layout (for authenticated pages)
function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    localStorage.removeItem('organization');
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-900 text-white shadow-lg">
        <div className="px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded hover:bg-blue-800"
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <h1 className="text-2xl font-bold">GovLogicAI</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm hidden md:block">{user?.full_name || 'User'}</span>
            <button
              onClick={handleLogout}
              className="p-2 rounded hover:bg-blue-800 flex items-center"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        {sidebarOpen && (
          <aside className="w-64 bg-white shadow-md min-h-screen">
            <nav className="p-4 space-y-2">
              <NavLink to="/dashboard" icon={<FolderKanban size={20} />} text="Dashboard" />
              <NavLink to="/opportunities" icon={<Target size={20} />} text="Opportunities" />
              <NavLink to="/proposals" icon={<FileText size={20} />} text="Proposals" />
              <NavLink to="/grants" icon={<DollarSign size={20} />} text="Grants" />
              <NavLink to="/capture" icon={<Briefcase size={20} />} text="Capture" />
              <NavLink to="/knowledge" icon={<Database size={20} />} text="Knowledge Base" />
              <NavLink to="/programs" icon={<FolderKanban size={20} />} text="Programs" />
              <NavLink to="/reports" icon={<BarChart3 size={20} />} text="Reports & Analytics" />
              
              {/* InZTan Gov Supreme Features */}
              <div className="pt-4 mt-4 border-t border-gray-200">
                <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  InZTan Gov Supreme
                </div>
                <NavLink to="/rfp-shredder" icon={<Upload size={20} />} text="RFP Shredder" />
                <NavLink to="/partner-search" icon={<Users size={20} />} text="Partner Search" />
                <NavLink to="/go-no-go" icon={<ThumbsUp size={20} />} text="Go/No-Go" />
                <NavLink to="/proposal-generator" icon={<Zap size={20} />} text="Proposal Generator" />
              </div>
            </nav>
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

function NavLink({ to, icon, text }: { to: string; icon: React.ReactNode; text: string }) {
  return (
    <Link
      to={to}
      className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-blue-50 hover:text-blue-900 transition-colors"
    >
      {icon}
      <span className="font-medium">{text}</span>
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
                <Capture />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/knowledge"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Knowledge />
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
      </Routes>
    </Router>
  );
}

export default App;

