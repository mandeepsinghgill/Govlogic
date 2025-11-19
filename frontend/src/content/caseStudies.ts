export type CaseStudy = {
  slug: string;
  emoji: string;
  title: string;
  company: string;
  industry: string;
  resultsSummary: string;
  summary: string;
  statsHighlight: string;
  heroStats: { label: string; value: string; helper?: string }[];
  challenge: {
    heading: string;
    description: string[];
    quote?: string;
  };
  transformation: { label: string; description: string }[];
  impact: { label: string; description: string }[];
  quote: {
    text: string;
    attribution: string;
  };
};

export const caseStudies: CaseStudy[] = [
  {
    slug: 'veteran-first-win',
    emoji: '🎖',
    title: "From Zero to Federal: The Veteran's First Win",
    company: 'Veteran-Owned Consulting Firm',
    industry: 'Professional Services',
    resultsSummary: 'First federal contract won in 90 days after 18 months of trying alone',
    summary:
      "A veteran-owned consultancy went from zero pipeline to its first $240K VA award in 87 days by letting GovSure's AI match set-aside opportunities, streamline compliance, and coach their proposal process.",
    statsHighlight: '90 days to first contract • 8 hours per proposal • 100% compliance',
    heroStats: [
      { label: 'Time to First Win', value: '90 days', helper: 'down from 18+ months' },
      { label: 'Proposal Creation', value: '8 hrs', helper: 'vs 40+ hrs previously' },
      { label: 'Pipeline Built', value: '$1.2M', helper: 'in the first six months' },
    ],
    challenge: {
      heading: 'The Breaking Point',
      description: [
        'After 18 months of chasing federal contracts with zero wins, this veteran-owned firm had no pipeline, no structure, and no way to identify winnable opportunities for a newcomer.',
        '"I was drowning in SAM.gov. Every solicitation looked the same. I didn’t know if I was qualified or wasting my time."',
      ],
    },
    transformation: [
      {
        label: 'Week 1',
        description: "GovSure's AI matched 12 veteran set-aside opportunities they'd never seen.",
      },
      {
        label: 'Week 4',
        description: 'Submitted first fully compliant proposal in eight hours (vs 40+ previously).',
      },
      {
        label: 'Day 87',
        description: 'Won first $240K contract with Veterans Affairs.',
      },
    ],
    impact: [
      { label: '90 days', description: 'to first contract (vs 18+ months solo)' },
      { label: '8 hours', description: 'per proposal (down from 40+ hours)' },
      { label: '100% compliance', description: 'on their first submission' },
      { label: '$1.2M pipeline', description: 'built in the first six months' },
    ],
    quote: {
      text: "GovSure didn't just help me find opportunities—it taught me how to compete. That first win changed everything.",
      attribution: 'Founder, Veteran-Owned Consulting Firm',
    },
  },
  {
    slug: 'starlight-technologies',
    emoji: '🌟',
    title: 'Starlight Technologies: 4× More Proposals, Zero New Hires',
    company: 'Starlight Technologies',
    industry: 'Cybersecurity & Cloud Solutions',
    resultsSummary: 'Scaled from two to eight monthly proposals without adding staff',
    summary:
      'Starlight used GovSure to automate first drafts, reuse past performance, and police compliance so their two-person capture team could quadruple throughput while improving win rates.',
    statsHighlight: '4× proposal output • 30 hours saved per bid • 72% win rate',
    heroStats: [
      { label: 'Proposal Output', value: '4×', helper: '2 → 8 per month' },
      { label: 'Hours Saved', value: '30 hrs', helper: 'per proposal' },
      { label: 'Win Rate', value: '72%', helper: 'up from 65%' },
    ],
    challenge: {
      heading: 'The Bottleneck',
      description: [
        "Starlight's capture team was maxed out. Great win rate (65%), but only two proposals per month meant leaving money on the table. Hiring wasn't in the budget.",
        '"We were turning down opportunities we knew we could win. Our process was too manual, too slow."',
      ],
    },
    transformation: [
      { label: 'AI Proposal Writer', description: 'Generated compliant first drafts in 90 minutes.' },
      { label: 'Smart Templates', description: 'Reused past performance across opportunities.' },
      {
        label: 'Compliance Autopilot',
        description: 'Caught requirements human reviewers missed before submission.',
      },
    ],
    impact: [
      { label: '4× output', description: '2 → 8 proposals per month' },
      { label: '30 hours saved', description: 'per proposal thanks to automation' },
      { label: '72% win rate', description: 'up from 65%' },
      { label: '$18M added', description: 'contract value in year one' },
    ],
    quote: {
      text: "We're not working harder—we're working smarter. GovSure turned our two-person capture team into a proposal machine.",
      attribution: 'Business Development Director, Starlight Technologies',
    },
  },
  {
    slug: 'terrasecure',
    emoji: '🌍',
    title: 'TerraSecure: 75% Less Time Hunting, 3× More Wins',
    company: 'TerraSecure',
    industry: 'Environmental & Infrastructure Services',
    resultsSummary: 'Reduced opportunity search from 40 to 10 hours per week',
    summary:
      'TerraSecure unified 15+ bid portals, used predictive alerts, and claimed a 5–7 day head start on perfect-fit opportunities—fueling triple the wins without expanding the team.',
    statsHighlight: '75% less search time • 5–7 day head start • 3× win rate',
    heroStats: [
      { label: 'Search Time', value: '10 hrs', helper: 'down from 40 hrs/week' },
      { label: 'Competitive Edge', value: '5–7 days', helper: 'earlier than competitors' },
      { label: 'Win Rate', value: '68%', helper: 'up from 22%' },
    ],
    challenge: {
      heading: 'The Time Drain',
      description: [
        "TerraSecure's BD team spent half their week just finding opportunities across 15+ portals. By the time they found good fits, competitors were already ahead.",
        '"We were always playing catch-up. The opportunities we found first were the ones we won."',
      ],
    },
    transformation: [
      { label: 'Unified Search', description: 'Across federal, state, local, and specialty portals.' },
      {
        label: 'AI Matching',
        description: 'Surfaced perfect-fit solicitations 5–7 days before competitors.',
      },
      {
        label: 'Smart Alerts',
        description: 'Prioritized high-probability opportunities by win likelihood.',
      },
    ],
    impact: [
      { label: '75% less time', description: '40 → 10 hours per week searching' },
      { label: '5–7 day edge', description: 'on early discovery' },
      { label: '3× win rate', description: '22% → 68%' },
      { label: '$45M pipeline', description: 'value added in six months' },
    ],
    quote: {
      text: "We're no longer hunting—we're harvesting. GovSure delivers the right opportunities at the right time.",
      attribution: 'BD Director, TerraSecure',
    },
  },
  {
    slug: 'lexling',
    emoji: '⚖',
    title: 'LexLing: 6× Output, Better Quality, Happier Team',
    company: 'LexLing',
    industry: 'Legal & Linguistic Services',
    resultsSummary: 'Went from one proposal every two months to six per month',
    summary:
      'LexLing centralized content, automated compliance, and let AI draft sections against evaluation criteria—eliminating burnout while making zero compliance misses in 18 months.',
    statsHighlight: '6× proposal volume • 85% faster drafts • Zero misses',
    heroStats: [
      { label: 'Proposal Volume', value: '6/mo', helper: 'up from 0.5/mo' },
      { label: 'Draft Speed', value: '85% faster', helper: 'first-draft creation' },
      { label: 'Compliance', value: '0 misses', helper: 'in 18 months' },
    ],
    challenge: {
      heading: 'The Burnout Cycle',
      description: [
        "LexLing's proposals team was exhausted. Compliance reviews took forever. Writers burned out. Quality suffered under deadline pressure.",
        '"Every RFP felt like starting from scratch. We had no system, no leverage, no breathing room."',
      ],
    },
    transformation: [
      {
        label: 'Centralized Content Library',
        description: 'Made past performance instantly reusable.',
      },
      {
        label: 'Automated Compliance Checks',
        description: 'Caught errors before submission.',
      },
      {
        label: 'AI Section Drafting',
        description: 'Aligned to evaluation criteria automatically.',
      },
    ],
    impact: [
      { label: '6× output', description: '0.5 → 6 proposals per month' },
      { label: '85% faster', description: 'first drafts created in hours, not days' },
      { label: '0 misses', description: 'compliance requirements in 18 months' },
      { label: '50% less overtime', description: 'team regained nights and weekends' },
    ],
    quote: {
      text: 'Our team is winning more and burning out less. GovSure gave us back our nights and weekends—and our win rate went up.',
      attribution: 'Proposal Director, LexLing',
    },
  },
];

export const supportingContent = {
  headline: 'Real Companies. Real Wins. Real Results.',
  subheadline:
    "Government contracting doesn't have to be a black box. See how companies like yours are winning more—faster—with GovSure AI.",
  team: {
    title: 'The Team Behind the Technology',
    intro: "We're not just builders—we're former insiders who lived the pain points ourselves.",
    dna: [
      '🧠 AI Engineers from Google, Microsoft, Lockheed Martin',
      '🎯 Capture Pros from Booz Allen Hamilton, Unified, CACI',
      '💼 10+ years winning contracts at every government level',
      '🏆 $12B+ in contracts and grants awarded through our expertise',
    ],
    differentiators: [
      'Missed opportunities? We built unified cross-portal search.',
      'Compliance anxiety? We built AI that understands FAR/DFARS.',
      'Proposal overload? We built reusable content libraries.',
      'Low win rates? We built predictive matching algorithms.',
    ],
  },
  numbers: {
    title: "The Numbers Don't Lie",
    intro: 'Across 100+ organizations using GovSure:',
    rows: [
      { metric: 'Time Savings on Search', result: '95% reduction (40 → 2 hrs/week)' },
      { metric: 'Proposal Output Increase', result: '4–6× more submissions' },
      { metric: 'Win Rate Improvement', result: '+30–45 percentage points' },
      { metric: 'Compliance Error Rate', result: 'Near-zero missed requirements' },
      { metric: 'ROI Timeline', result: 'Positive in 60–90 days' },
      { metric: 'Contract Value Added', result: '$2M–$50M in first year' },
    ],
    whatItMeans: [
      'Find opportunities 5–7 days before competitors',
      'Understand requirements in minutes, not hours',
      'Write compliant proposals 85% faster',
      'Win 3× more contracts with the same team',
      'Scale without hiring or burning out',
    ],
  },
  whyDifferent: {
    title: "Why GovSure Wins Where Others Don't",
    bullets: [
      '🎯 Precision AI, not generic tools—models trained on 100,000+ awards, FAR/DFARS, and real winning proposals.',
      "🔍 True cross-portal intelligence—aggregate SAM.gov, state portals, GSA eBuy, SeaPort-e, and 40+ more sources into one search.",
      '⚡ Speed + quality, not either/or—GovSure delivers both every time.',
      '🛡 Built-in compliance shield—AI cross-references every requirement in real time.',
      '🤝 Made by GovCon pros, not just engineers—we sat in color team reviews and learned the hard lessons.',
    ],
  },
  cta: {
    title: 'Ready to Join Them?',
    description: 'Stop guessing. Start winning.',
    actions: [
      { label: 'Start Free Trial', href: '/signup', primary: true },
      { label: 'Schedule Live Demo', href: 'https://calendly.com/govsure/demo', external: true },
      { label: 'Talk to Our Team', href: '/contact' },
    ],
    finePrint: 'No credit card. Full platform access. 7 days.',
  },
  resources: [
    { label: '📚 Case Study Library', description: 'Deep dives on customer transformations' },
    { label: '🎓 GovCon Academy', description: 'Free training on capture best practices' },
    { label: '🔧 Tool Comparisons', description: 'How GovSure stacks up vs. competitors' },
    { label: '📊 ROI Calculator', description: 'Estimate your potential impact' },
    { label: '🎯 Opportunity Finder', description: 'Try our search for free' },
  ],
  contact: {
    city: 'Built by GovCon veterans in Washington, D.C.',
    company: 'GovSure AI – Government Contracting, Simplified',
    email: 'hello@govsureai.com',
    phone: '(202) 555-0147',
    site: 'govsureai.com',
    links: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms & Conditions', href: '/terms' },
      { label: 'Security', href: '#' },
    ],
  },
};

