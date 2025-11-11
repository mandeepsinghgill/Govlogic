import {
  LayoutDashboard,
  HandCoins,
  PenSquare,
  Shield,
  Users,
  BarChart3,
  type LucideIcon,
} from 'lucide-react';

export type PlatformFeature = {
  title: string;
  description: string;
};

export type PlatformSection = {
  id: string;
  title: string;
  summary: string;
  description: string;
  icon: LucideIcon;
  iconBg: string;
  iconClass: string;
  path: string;
  valuePoints: string[];
  features: PlatformFeature[];
};

export const platformSections: PlatformSection[] = [
  {
    id: 'pipeline',
    title: 'Pipeline',
    summary: 'Orchestrate every opportunity from first notice to submitted proposal.',
    description:
      'GovSure Pipeline gives capture and BD teams a real-time command center for every opportunity. Track the journey from sourced lead to green-lighted proposal with shared playbooks, stage-based forecasting, and automated alerts when momentum stalls.',
    icon: LayoutDashboard,
    iconBg: 'from-blue-50 via-blue-100 to-indigo-100',
    iconClass: 'text-blue-600',
    path: '/platform/pipeline',
    valuePoints: [
      'See capture health, stage probabilities, and revenue projections in one view.',
      'Automate intake from SAM.gov, forecasts, and task assignments for each pursuit.',
      'Collaborate across capture, pricing, and delivery with shared context and notes.',
    ],
    features: [
      {
        title: 'Opportunity Intake',
        description: 'Auto-ingest notices with AI summaries, compliance flags, and go/no-go signals.',
      },
      {
        title: 'Stage Forecasting',
        description: 'Model win probabilities, value, and critical dates across capture stages.',
      },
      {
        title: 'Team Assignments',
        description: 'Coordinate capture leads, reviewers, and due dates with workload balancing.',
      },
    ],
  },
  {
    id: 'granting',
    title: 'Granting',
    summary: 'Manage federal, state, and foundation awards with transparent workflows.',
    description:
      'Bring structure to the full grant lifecycle—from discovery and fit checks to post-award reporting. GovSure Granting keeps deadlines, documentation, and compliance tasks aligned so nothing slips.',
    icon: HandCoins,
    iconBg: 'from-amber-50 via-orange-50 to-rose-100',
    iconClass: 'text-amber-600',
    path: '/platform/granting',
    valuePoints: [
      'View every open and active grant with status, owners, and next actions.',
      'Centralize eligibility decisions and required attachments for quick go/no-go meetings.',
      'Stay compliant post-award with reporting calendars and automated reminders.',
    ],
    features: [
      {
        title: 'Funding Calendar',
        description: 'Track deadlines with automatic reminders, required documents, and owners.',
      },
      {
        title: 'Eligibility Checks',
        description: 'Validate fit using configurable criteria and reviewer scoring templates.',
      },
      {
        title: 'Reporting Tracker',
        description: 'Monitor deliverables, drawdowns, and audit trails across award cycles.',
      },
    ],
  },
  {
    id: 'proposal-workspace',
    title: 'Proposal Workspace',
    summary: 'Collaborative drafting that keeps writers, reviewers, and SMEs aligned.',
    description:
      'Accelerate proposal creation with AI-assisted drafting, clause reuse, and structured review cycles. Proposal Workspace ensures every section lands on message, compliant, and ready for submission.',
    icon: PenSquare,
    iconBg: 'from-purple-50 via-fuchsia-50 to-pink-100',
    iconClass: 'text-purple-600',
    path: '/platform/proposal-workspace',
    valuePoints: [
      'Generate Shipley-aligned outlines and responses tailored to each solicitation.',
      'Reuse approved text with clause libraries that maintain compliance context.',
      'Run pink/red team reviews with tracked changes, tasks, and final approval workflows.',
    ],
    features: [
      {
        title: 'Clause Library',
        description: 'Reuse approved language with live compliance references and tailoring notes.',
      },
      {
        title: 'Narrative Drafts',
        description: 'Generate tailored responses seeded with capture intel and past performance.',
      },
      {
        title: 'Review Rooms',
        description: 'Structure pink and red team feedback with comment assignment and approvals.',
      },
    ],
  },
  {
    id: 'compliance-control',
    title: 'Compliance Control',
    summary: 'Guardrails that enforce FAR, DFARS, and grant-specific rules.',
    description:
      'Compliance Control tracks every clause requirement, approval, and supporting artifact so you submit with confidence. Configure guardrails per solicitation to eliminate late-stage surprises.',
    icon: Shield,
    iconBg: 'from-emerald-50 via-green-50 to-teal-100',
    iconClass: 'text-emerald-600',
    path: '/platform/compliance-control',
    valuePoints: [
      'Trace requirements to response content, attachments, and compliance owners.',
      'Get proactive alerts for missing approvals, expired certs, or data gaps.',
      'Maintain audit-ready trails with role-based access and change history.',
    ],
    features: [
      {
        title: 'Requirement Mapping',
        description: 'Map clauses to response sections, evidence, and owners with coverage status.',
      },
      {
        title: 'Audit Trail',
        description: 'Capture approvals, edits, and justifications across every compliance check.',
      },
      {
        title: 'Risk Alerts',
        description: 'Receive proactive notifications when documents expire or controls fail.',
      },
    ],
  },
  {
    id: 'teaming-network',
    title: 'Teaming Network',
    summary: 'Expand your roster with vetted primes, subs, and partners.',
    description:
      'Quickly identify, evaluate, and onboard partners to strengthen your pursuit. Teaming Network matches capability gaps with qualified vendors and manages the relationships through execution.',
    icon: Users,
    iconBg: 'from-sky-50 via-blue-50 to-cyan-100',
    iconClass: 'text-sky-600',
    path: '/platform/teaming-network',
    valuePoints: [
      'Search 800K+ vendors by socio-economic status, NAICS, and past performance.',
      'Assess fit with AI-ranked matches and combined scorecards.',
      'Onboard partners securely with NDAs, intake forms, and task assignments.',
    ],
    features: [
      {
        title: 'Partner Discovery',
        description: 'Filter primes and subs by socio-economic status, NAICS, and performance data.',
      },
      {
        title: 'Capability Matching',
        description: 'Score teaming fit based on experience, certifications, and open gaps.',
      },
      {
        title: 'NDA & Intake',
        description: 'Automate partner onboarding with templated agreements and requirements.',
      },
    ],
  },
  {
    id: 'insights-forecasts',
    title: 'Insights & Forecasts',
    summary: 'Real-time analytics to keep leadership ahead of the curve.',
    description:
      'Insights & Forecasts transforms capture and delivery data into dashboards leadership relies on. Track performance, staffing demand, and revenue outlooks with interactive analytics.',
    icon: BarChart3,
    iconBg: 'from-slate-50 via-gray-50 to-blue-100',
    iconClass: 'text-slate-600',
    path: '/platform/insights-forecasts',
    valuePoints: [
      'Monitor win rate, pipeline value, and top risks with executive-ready dashboards.',
      'Spot stalled pursuits with AI nudges and health scoring.',
      'Forecast staffing, proposal throughput, and revenue impact with scenario modeling.',
    ],
    features: [
      {
        title: 'Executive Dashboards',
        description: 'Present capture KPIs, revenue outlook, and delivery readiness to leadership.',
      },
      {
        title: 'Capture Health',
        description: 'Surface pursuits that need attention with AI-powered risk scoring.',
      },
      {
        title: 'Resource Planning',
        description: 'Balance proposal workloads and delivery staffing with forward-looking analytics.',
      },
    ],
  },
];


