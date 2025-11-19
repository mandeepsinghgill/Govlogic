import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Search,
  FileText,
  ChevronRight,
  ChevronDown,
  BookOpen,
  Download,
  ExternalLink,
  Menu,
  X,
  CheckCircle,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import Navigation from '../components/Navigation';
import DemoBookingModal from '../components/DemoBookingModal';
import FAQChatbot from '../components/FAQChatbot';

interface FARPart {
  id: string;
  title: string;
  subparts: FARSubpart[];
}

interface FARSubpart {
  id: string;
  title: string;
  items: number;
}

const farParts: FARPart[] = [
  {
    id: '1',
    title: 'Federal Acquisition Regulations System',
    subparts: [
      { id: '1.0', title: 'Scope of part', items: 1 },
      { id: '1.1', title: 'Purpose, Authority, Issuance', items: 10 },
      { id: '1.2', title: 'Administration', items: 5 },
      { id: '1.3', title: 'Agency Acquisition Regulations', items: 8 },
      { id: '1.4', title: 'Deviations from the FAR', items: 6 },
      { id: '1.5', title: 'Agency and Public Participation', items: 4 },
      { id: '1.6', title: 'Career Development, Contracting Authority, and Responsibilities', items: 12 },
    ],
  },
  {
    id: '2',
    title: 'Definitions of Words and Terms',
    subparts: [
      { id: '2.0', title: 'Scope of part', items: 1 },
      { id: '2.1', title: 'Definitions', items: 200 },
    ],
  },
  {
    id: '3',
    title: 'Improper Business Practices and Personal Conflicts of Interest',
    subparts: [
      { id: '3.0', title: 'Scope of part', items: 1 },
      { id: '3.1', title: 'Safeguards', items: 15 },
      { id: '3.2', title: 'Contractor Gratuities to Government Personnel', items: 8 },
      { id: '3.3', title: 'Reports of Suspected Antitrust Violations', items: 5 },
      { id: '3.4', title: 'Contingent Fees', items: 6 },
      { id: '3.5', title: 'Other Improper Business Practices', items: 10 },
      { id: '3.6', title: 'Contracts with Government Employees or Organizations Owned or Controlled by Them', items: 4 },
      { id: '3.7', title: 'Voiding and Rescinding Contracts', items: 3 },
      { id: '3.8', title: 'Limitation on the Payment of Funds to Influence Federal Transactions', items: 7 },
      { id: '3.9', title: 'Whistleblower Protections for Contractor Employees', items: 6 },
      { id: '3.10', title: 'Contractor Code of Business Ethics and Conduct', items: 9 },
      { id: '3.11', title: 'Preventing Personal Conflicts of Interest for Contractor Employees Performing Acquisition Functions', items: 12 },
    ],
  },
  {
    id: '4',
    title: 'Administrative Matters',
    subparts: [
      { id: '4.0', title: 'Scope of part', items: 1 },
      { id: '4.1', title: 'Contract Execution', items: 8 },
      { id: '4.2', title: 'Contract Distribution', items: 5 },
      { id: '4.3', title: 'Paper Documents', items: 4 },
      { id: '4.4', title: 'Safeguarding Classified Information Within Industry', items: 6 },
      { id: '4.5', title: 'Electronic Commerce in Contracting', items: 10 },
      { id: '4.6', title: 'Contract Reporting', items: 12 },
      { id: '4.7', title: 'Contractor Records Retention', items: 7 },
      { id: '4.8', title: 'Government Contract Files', items: 9 },
      { id: '4.9', title: 'Taxpayer Identification Number Information', items: 5 },
      { id: '4.10', title: 'Service Contract Reporting Requirements', items: 4 },
      { id: '4.11', title: 'System for Award Management', items: 8 },
      { id: '4.12', title: 'System for Award Management Data', items: 6 },
      { id: '4.13', title: 'Personal Identity Verification', items: 5 },
      { id: '4.14', title: 'Service Contract Reporting Requirements', items: 4 },
      { id: '4.15', title: 'Representation and Certifications', items: 7 },
    ],
  },
  {
    id: '5',
    title: 'Publicizing Contract Actions',
    subparts: [
      { id: '5.0', title: 'Scope of part', items: 1 },
      { id: '5.1', title: 'Dissemination of Information', items: 6 },
      { id: '5.2', title: 'Synopsis of Proposed Contract Actions', items: 15 },
      { id: '5.3', title: 'Synopsis of Contract Awards', items: 8 },
      { id: '5.4', title: 'Release of Information', items: 7 },
      { id: '5.5', title: 'Paid Advertisements', items: 4 },
    ],
  },
  {
    id: '6',
    title: 'Competition Requirements',
    subparts: [
      { id: '6.0', title: 'Scope of part', items: 1 },
      { id: '6.1', title: 'Full and Open Competition', items: 5 },
      { id: '6.2', title: 'Full and Open Competition After Exclusion of Sources', items: 4 },
      { id: '6.3', title: 'Other Than Full and Open Competition', items: 20 },
    ],
  },
  {
    id: '7',
    title: 'Acquisition Planning',
    subparts: [
      { id: '7.0', title: 'Scope of part', items: 1 },
      { id: '7.1', title: 'Acquisition Plans', items: 12 },
      { id: '7.2', title: 'Planning for the Purchase of Supplies in Economic Quantities', items: 4 },
      { id: '7.3', title: 'Contractor Versus Government Performance', items: 8 },
      { id: '7.4', title: 'Equipment Lease or Purchase', items: 6 },
      { id: '7.5', title: 'Inherently Governmental Functions', items: 5 },
    ],
  },
  {
    id: '8',
    title: 'Required Sources of Supplies and Services',
    subparts: [
      { id: '8.0', title: 'Scope of part', items: 1 },
      { id: '8.1', title: 'Priorities for Use of Government Supply Sources', items: 6 },
      { id: '8.2', title: 'Required Sources of Supplies and Services', items: 8 },
      { id: '8.3', title: 'Use of Other Sources', items: 4 },
      { id: '8.4', title: 'Federal Supply Schedules', items: 15 },
      { id: '8.5', title: 'Acquisition of Commercial Products and Commercial Services', items: 12 },
      { id: '8.6', title: 'Acquisition from Federal Prison Industries, Inc.', items: 5 },
      { id: '8.7', title: 'Acquisition from Nonprofit Agencies Employing People Who Are Blind or Severely Disabled', items: 8 },
    ],
  },
  {
    id: '9',
    title: 'Contractor Qualifications',
    subparts: [
      { id: '9.0', title: 'Scope of part', items: 1 },
      { id: '9.1', title: 'Responsible Prospective Contractors', items: 15 },
      { id: '9.2', title: 'Qualification Requirements', items: 8 },
      { id: '9.3', title: 'First Article Testing and Approval', items: 6 },
      { id: '9.4', title: 'Debarment, Suspension, and Ineligibility', items: 20 },
      { id: '9.5', title: 'Organizational and Consultant Conflicts of Interest', items: 12 },
    ],
  },
  {
    id: '10',
    title: 'Market Research',
    subparts: [
      { id: '10.0', title: 'Scope of part', items: 1 },
      { id: '10.1', title: 'Market Research', items: 8 },
    ],
  },
  {
    id: '11',
    title: 'Describing Agency Needs',
    subparts: [
      { id: '11.0', title: 'Scope of part', items: 1 },
      { id: '11.1', title: 'Selecting and Developing Requirements Documents', items: 12 },
      { id: '11.2', title: 'Using and Maintaining Requirements Documents', items: 8 },
      { id: '11.3', title: 'Acceptable Material', items: 5 },
      { id: '11.4', title: 'Delivery or Performance Schedules', items: 6 },
      { id: '11.5', title: 'Liquidated Damages', items: 4 },
      { id: '11.6', title: 'Priorities and Allocations', items: 3 },
    ],
  },
  {
    id: '12',
    title: 'Acquisition of Commercial Products and Commercial Services',
    subparts: [
      { id: '12.0', title: 'Scope of part', items: 1 },
      { id: '12.1', title: 'General', items: 10 },
      { id: '12.2', title: 'Special Requirements for the Acquisition of Commercial Products and Commercial Services', items: 15 },
      { id: '12.3', title: 'Contract Format', items: 8 },
      { id: '12.4', title: 'Unique Requirements Regarding Terms and Conditions for Commercial Products and Commercial Services', items: 12 },
      { id: '12.5', title: 'Applicability of Certain Laws to Executive Agency Contracts for the Acquisition of Commercial Products and Commercial Services', items: 6 },
    ],
  },
  {
    id: '13',
    title: 'Simplified Acquisition Procedures',
    subparts: [
      { id: '13.0', title: 'Scope of part', items: 1 },
      { id: '13.1', title: 'Procedures', items: 20 },
      { id: '13.2', title: 'Actions at or Below the Micro-Purchase Threshold', items: 5 },
      { id: '13.3', title: 'Simplified Acquisition Methods', items: 12 },
      { id: '13.4', title: 'Fast Payment Procedure', items: 4 },
      { id: '13.5', title: 'Test Program for Certain Commercial Products and Commercial Services', items: 6 },
    ],
  },
  {
    id: '14',
    title: 'Sealed Bidding',
    subparts: [
      { id: '14.0', title: 'Scope of part', items: 1 },
      { id: '14.1', title: 'Use of Sealed Bidding', items: 5 },
      { id: '14.2', title: 'Solicitation of Bids', items: 15 },
      { id: '14.3', title: 'Submission of Bids', items: 10 },
      { id: '14.4', title: 'Opening of Bids and Award of Contract', items: 18 },
      { id: '14.5', title: 'Two-Step Sealed Bidding', items: 8 },
    ],
  },
  {
    id: '15',
    title: 'Contracting by Negotiation',
    subparts: [
      { id: '15.0', title: 'Scope of part', items: 1 },
      { id: '15.1', title: 'Source Selection Processes and Techniques', items: 12 },
      { id: '15.2', title: 'Solicitation and Receipt of Proposals and Information', items: 20 },
      { id: '15.3', title: 'Source Selection', items: 25 },
      { id: '15.4', title: 'Contract Pricing', items: 18 },
      { id: '15.5', title: 'Preaward, Award, and Postaward Notifications, Protests, and Mistakes', items: 15 },
      { id: '15.6', title: 'Unsolicited Proposals', items: 8 },
    ],
  },
  {
    id: '16',
    title: 'Types of Contracts',
    subparts: [
      { id: '16.0', title: 'Scope of part', items: 1 },
      { id: '16.1', title: 'Selecting Contract Types', items: 10 },
      { id: '16.2', title: 'Fixed-Price Contracts', items: 12 },
      { id: '16.3', title: 'Cost-Reimbursement Contracts', items: 10 },
      { id: '16.4', title: 'Incentive Contracts', items: 8 },
      { id: '16.5', title: 'Indefinite-Delivery Contracts', items: 15 },
      { id: '16.6', title: 'Time-and-Materials, Labor-Hour, and Letter Contracts', items: 10 },
      { id: '16.7', title: 'Agreement', items: 4 },
    ],
  },
  {
    id: '17',
    title: 'Special Contracting Methods',
    subparts: [
      { id: '17.0', title: 'Scope of part', items: 1 },
      { id: '17.1', title: 'Multi-Year Contracting', items: 8 },
      { id: '17.2', title: 'Options', items: 12 },
      { id: '17.3', title: 'Leader Company Contracting', items: 5 },
      { id: '17.4', title: 'Interagency Acquisitions', items: 10 },
      { id: '17.5', title: 'Interagency Acquisitions: Acquisitions by Nondefense Agencies on Behalf of the Department of Defense', items: 6 },
      { id: '17.6', title: 'Management and Operating Contracts', items: 4 },
      { id: '17.7', title: 'Service Contracts', items: 8 },
    ],
  },
  {
    id: '18',
    title: 'Emergency Acquisitions',
    subparts: [
      { id: '18.0', title: 'Scope of part', items: 1 },
      { id: '18.1', title: 'Available Acquisition Flexibilities', items: 15 },
      { id: '18.2', title: 'Emergency Acquisition Flexibilities', items: 12 },
    ],
  },
  {
    id: '19',
    title: 'Small Business Programs',
    subparts: [
      { id: '19.0', title: 'Scope of part', items: 1 },
      { id: '19.1', title: 'Size Standards', items: 6 },
      { id: '19.2', title: 'Policies', items: 10 },
      { id: '19.3', title: 'Determination of Small Business Status for Small Business Programs', items: 8 },
      { id: '19.4', title: 'Cooperation with the Small Business Administration', items: 5 },
      { id: '19.5', title: 'Set-Asides for Small Business', items: 12 },
      { id: '19.6', title: 'Certificates of Competency and Determinations of Responsibility', items: 6 },
      { id: '19.7', title: 'The Small Business Subcontracting Program', items: 15 },
      { id: '19.8', title: 'Contracting with the Small Business Administration (The 8(a) Program)', items: 10 },
      { id: '19.9', title: 'Service-Disabled Veteran-Owned Small Business Procurement Program', items: 8 },
      { id: '19.10', title: 'HUBZone Program', items: 6 },
      { id: '19.11', title: 'Women-Owned Small Business Program', items: 8 },
      { id: '19.12', title: 'Veteran-Owned Small Business Program', items: 5 },
      { id: '19.13', title: 'Historically Underutilized Business Zone (HUBZone) Program', items: 6 },
    ],
  },
  {
    id: '20',
    title: 'Reserved',
    subparts: [],
  },
  {
    id: '21',
    title: 'Reserved',
    subparts: [],
  },
  {
    id: '22',
    title: 'Application of Labor Laws to Government Acquisitions',
    subparts: [
      { id: '22.0', title: 'Scope of part', items: 1 },
      { id: '22.1', title: 'Basic Labor Policies', items: 12 },
      { id: '22.2', title: 'Convict Labor', items: 4 },
      { id: '22.3', title: 'Contract Work Hours and Safety Standards Act', items: 6 },
      { id: '22.4', title: 'Labor Standards for Contracts Involving Construction', items: 10 },
      { id: '22.5', title: 'Use of Project Labor Agreements for Federal Construction Projects', items: 5 },
      { id: '22.6', title: 'Walsh-Healey Public Contracts Act', items: 4 },
      { id: '22.7', title: 'Employment of Workers with Disabilities', items: 5 },
      { id: '22.8', title: 'Equal Employment Opportunity', items: 8 },
      { id: '22.9', title: 'Nondiscrimination Because of Age', items: 4 },
      { id: '22.10', title: 'Service Contract Labor Standards', items: 12 },
      { id: '22.11', title: 'Professional Employee Compensation', items: 5 },
      { id: '22.12', title: 'Nondisplacement of Qualified Workers Under Service Contracts', items: 6 },
      { id: '22.13', title: 'Equal Opportunity for Veterans', items: 5 },
      { id: '22.14', title: 'Employment of Workers with Disabilities', items: 4 },
      { id: '22.15', title: 'Prohibition of Acquisition of Products Produced by Forced or Indentured Child Labor', items: 5 },
      { id: '22.16', title: 'Notification of Employee Rights Under the National Labor Relations Act', items: 3 },
      { id: '22.17', title: 'Combating Trafficking in Persons', items: 8 },
      { id: '22.18', title: 'Employment Eligibility Verification', items: 4 },
      { id: '22.19', title: 'Establishing a Minimum Wage for Contractors', items: 6 },
    ],
  },
  {
    id: '23',
    title: 'Environment, Energy and Water Efficiency, Renewable Energy Technologies, Occupational Safety, and Drug-Free Workplace',
    subparts: [
      { id: '23.0', title: 'Scope of part', items: 1 },
      { id: '23.1', title: 'Sustainable Acquisition', items: 10 },
      { id: '23.2', title: 'Energy and Water Efficiency and Renewable Energy', items: 8 },
      { id: '23.3', title: 'Hazardous Material Identification and Material Safety Data', items: 5 },
      { id: '23.4', title: 'Use of Recovered Materials and Biobased Products', items: 6 },
      { id: '23.5', title: 'Drug-Free Workplace', items: 4 },
      { id: '23.6', title: 'Notice of Radioactive Material', items: 3 },
      { id: '23.7', title: 'Contracting for Environmentally Preferable Products and Services', items: 5 },
      { id: '23.8', title: 'Ozone-Depleting Substances', items: 4 },
      { id: '23.9', title: 'Contractor Compliance with Environmental Management Systems', items: 3 },
    ],
  },
  {
    id: '24',
    title: 'Protection of Privacy and Freedom of Information',
    subparts: [
      { id: '24.0', title: 'Scope of part', items: 1 },
      { id: '24.1', title: 'Protection of Individual Privacy', items: 8 },
      { id: '24.2', title: 'Freedom of Information Act', items: 6 },
    ],
  },
  {
    id: '25',
    title: 'Foreign Acquisition',
    subparts: [
      { id: '25.0', title: 'Scope of part', items: 1 },
      { id: '25.1', title: 'Buy American—Supplies', items: 15 },
      { id: '25.2', title: 'Buy American—Construction Materials', items: 10 },
      { id: '25.3', title: 'Contractor Personnel in a Designated Operational Area or Supporting a Diplomatic or Consular Mission', items: 8 },
      { id: '25.4', title: 'Trade Agreements', items: 12 },
      { id: '25.5', title: 'Evaluating Foreign Offers—Supply Contracts', items: 8 },
      { id: '25.6', title: 'American Recovery and Reinvestment Act—Buy American Statute—Construction Materials', items: 4 },
      { id: '25.7', title: 'Prohibited Sources', items: 6 },
      { id: '25.8', title: 'Other International Agreements and Coordination', items: 5 },
      { id: '25.9', title: 'Customs and Duties', items: 4 },
      { id: '25.10', title: 'Additional Foreign Acquisition Regulations', items: 3 },
    ],
  },
  {
    id: '26',
    title: 'Other Socioeconomic Programs',
    subparts: [
      { id: '26.0', title: 'Scope of part', items: 1 },
      { id: '26.1', title: 'Indian Incentive Program', items: 5 },
      { id: '26.2', title: 'Minority Institutions', items: 4 },
      { id: '26.3', title: 'Historically Black Colleges and Universities and Minority Institutions', items: 6 },
    ],
  },
  {
    id: '27',
    title: 'Patents, Data, and Copyrights',
    subparts: [
      { id: '27.0', title: 'Scope of part', items: 1 },
      { id: '27.1', title: 'General', items: 8 },
      { id: '27.2', title: 'Patents and Copyrights', items: 15 },
      { id: '27.3', title: 'Patent Rights Under Government Contracts', items: 20 },
      { id: '27.4', title: 'Rights in Data and Copyrights', items: 18 },
    ],
  },
  {
    id: '28',
    title: 'Bonds and Insurance',
    subparts: [
      { id: '28.0', title: 'Scope of part', items: 1 },
      { id: '28.1', title: 'Bonds and Other Financial Protections', items: 12 },
      { id: '28.2', title: 'Sureties and Other Security for Bonds', items: 6 },
      { id: '28.3', title: 'Insurance', items: 10 },
    ],
  },
  {
    id: '29',
    title: 'Taxes',
    subparts: [
      { id: '29.0', title: 'Scope of part', items: 1 },
      { id: '29.1', title: 'General', items: 6 },
      { id: '29.2', title: 'Federal Excise Taxes', items: 4 },
      { id: '29.3', title: 'State and Local Taxes', items: 5 },
      { id: '29.4', title: 'Contract Clauses', items: 8 },
    ],
  },
  {
    id: '30',
    title: 'Cost Accounting Standards Administration',
    subparts: [
      { id: '30.0', title: 'Scope of part', items: 1 },
      { id: '30.1', title: 'General', items: 8 },
      { id: '30.2', title: 'CAS Program Requirements', items: 15 },
      { id: '30.3', title: 'CAS Rules and Regulations', items: 10 },
      { id: '30.4', title: 'Cost Accounting Standards', items: 5 },
      { id: '30.5', title: 'Cost Accounting Standards—Educational Institutions', items: 6 },
      { id: '30.6', title: 'CAS Administration', items: 12 },
    ],
  },
  {
    id: '31',
    title: 'Contract Cost Principles and Procedures',
    subparts: [
      { id: '31.0', title: 'Scope of part', items: 1 },
      { id: '31.1', title: 'Applicability', items: 6 },
      { id: '31.2', title: 'Contracts with Commercial Organizations', items: 20 },
      { id: '31.3', title: 'Contracts with Educational Institutions', items: 12 },
      { id: '31.4', title: 'Contracts with State, Local, and Federally Recognized Indian Tribal Governments', items: 10 },
      { id: '31.5', title: 'Contracts with Nonprofit Organizations', items: 8 },
      { id: '31.6', title: 'Contracts with Foreign Organizations', items: 6 },
      { id: '31.7', title: 'Contracts with Nonprofit Organizations Other Than Educational and State and Local Governments', items: 5 },
    ],
  },
  {
    id: '32',
    title: 'Contract Financing',
    subparts: [
      { id: '32.0', title: 'Scope of part', items: 1 },
      { id: '32.1', title: 'Non-Commercial Item Purchase Financing', items: 15 },
      { id: '32.2', title: 'Commercial Item Purchase Financing', items: 8 },
      { id: '32.3', title: 'Loan Guarantees for Defense Production', items: 4 },
      { id: '32.4', title: 'Advance Payments for Non-Commercial Items', items: 10 },
      { id: '32.5', title: 'Progress Payments Based on Costs', items: 12 },
      { id: '32.6', title: 'Contract Debts', items: 8 },
      { id: '32.7', title: 'Contract Funding', items: 6 },
      { id: '32.8', title: 'Assignment of Claims', items: 5 },
      { id: '32.9', title: 'Prompt Payment', items: 15 },
      { id: '32.10', title: 'Performance-Based Payments', items: 8 },
      { id: '32.11', title: 'Electronic Funds Transfer', items: 6 },
    ],
  },
  {
    id: '33',
    title: 'Protests, Disputes, and Appeals',
    subparts: [
      { id: '33.0', title: 'Scope of part', items: 1 },
      { id: '33.1', title: 'Protests', items: 20 },
      { id: '33.2', title: 'Disputes and Appeals', items: 15 },
    ],
  },
  {
    id: '34',
    title: 'Major System Acquisition',
    subparts: [
      { id: '34.0', title: 'Scope of part', items: 1 },
      { id: '34.1', title: 'Testing, Qualification and Use of Industrial Resources Developed Under Title III, Defense Production Act', items: 5 },
    ],
  },
  {
    id: '35',
    title: 'Research and Development Contracting',
    subparts: [
      { id: '35.0', title: 'Scope of part', items: 1 },
      { id: '35.1', title: 'Use of Research and Development', items: 8 },
      { id: '35.2', title: 'General', items: 10 },
      { id: '35.3', title: 'Contract Methods', items: 12 },
      { id: '35.4', title: 'Solicitation Provisions and Contract Clauses', items: 8 },
    ],
  },
  {
    id: '36',
    title: 'Construction and Architect-Engineer Contracts',
    subparts: [
      { id: '36.0', title: 'Scope of part', items: 1 },
      { id: '36.1', title: 'General', items: 10 },
      { id: '36.2', title: 'Special Aspects of Contracting for Construction', items: 15 },
      { id: '36.3', title: 'Two-Phase Design-Build Selection Procedures', items: 8 },
      { id: '36.4', title: 'Service Contracting', items: 6 },
      { id: '36.5', title: 'Contract Clauses', items: 12 },
      { id: '36.6', title: 'Architect-Engineer Services', items: 10 },
      { id: '36.7', title: 'Standard and Optional Forms for Contracting for Construction, Architect-Engineer Services, and Dismantling, Demolition, or Removal of Improvements', items: 5 },
    ],
  },
  {
    id: '37',
    title: 'Service Contracting',
    subparts: [
      { id: '37.0', title: 'Scope of part', items: 1 },
      { id: '37.1', title: 'Service Contracts—General', items: 12 },
      { id: '37.2', title: 'Advisory and Assistance Services', items: 10 },
      { id: '37.3', title: 'Dismantling, Demolition, or Removal of Improvements', items: 6 },
      { id: '37.4', title: 'Nonpersonal Health Care Services', items: 8 },
      { id: '37.5', title: 'Management and Operating Contracts', items: 5 },
      { id: '37.6', title: 'Performance-Based Acquisition', items: 15 },
    ],
  },
  {
    id: '38',
    title: 'Federal Supply Schedule Contracting',
    subparts: [
      { id: '38.0', title: 'Scope of part', items: 1 },
      { id: '38.1', title: 'Federal Supply Schedule Program', items: 15 },
      { id: '38.2', title: 'Ordering Procedures for Federal Supply Schedules', items: 12 },
    ],
  },
  {
    id: '39',
    title: 'Acquisition of Information Technology',
    subparts: [
      { id: '39.0', title: 'Scope of part', items: 1 },
      { id: '39.1', title: 'General', items: 10 },
      { id: '39.2', title: 'Electronic and Information Technology', items: 8 },
    ],
  },
  {
    id: '40',
    title: 'Reserved',
    subparts: [],
  },
  {
    id: '41',
    title: 'Acquisition of Utility Services',
    subparts: [
      { id: '41.0', title: 'Scope of part', items: 1 },
      { id: '41.1', title: 'General', items: 8 },
      { id: '41.2', title: 'Acquiring Utility Services', items: 10 },
    ],
  },
  {
    id: '42',
    title: 'Contract Administration and Audit Services',
    subparts: [
      { id: '42.0', title: 'Scope of part', items: 1 },
      { id: '42.1', title: 'Contract Audit Services', items: 10 },
      { id: '42.2', title: 'Contract Administration Services', items: 15 },
      { id: '42.3', title: 'Contract Modifications', items: 12 },
      { id: '42.4', title: 'Termination of Contracts', items: 8 },
      { id: '42.5', title: 'Postaward Orientation', items: 6 },
      { id: '42.6', title: 'Administrative Matters', items: 8 },
      { id: '42.7', title: 'Indirect Cost Rates', items: 6 },
      { id: '42.8', title: 'Disallowance of Costs', items: 5 },
      { id: '42.9', title: 'Contractor Insurance', items: 4 },
      { id: '42.10', title: 'Contractor Performance Information', items: 8 },
      { id: '42.11', title: 'Production Surveillance and Reporting', items: 6 },
      { id: '42.12', title: 'Novation and Change-of-Name Agreements', items: 5 },
      { id: '42.13', title: 'Suspension of Work, Stop-Work Orders, and Government Delay of Work', items: 6 },
      { id: '42.14', title: 'Traffic and Transportation Management', items: 4 },
      { id: '42.15', title: 'Contractor Performance Information', items: 5 },
    ],
  },
  {
    id: '43',
    title: 'Contract Modifications',
    subparts: [
      { id: '43.0', title: 'Scope of part', items: 1 },
      { id: '43.1', title: 'General', items: 8 },
      { id: '43.2', title: 'Change Orders', items: 10 },
      { id: '43.3', title: 'Forms', items: 4 },
    ],
  },
  {
    id: '44',
    title: 'Subcontracting Policies and Procedures',
    subparts: [
      { id: '44.0', title: 'Scope of part', items: 1 },
      { id: '44.1', title: 'General', items: 8 },
      { id: '44.2', title: 'Consent to Subcontracts', items: 12 },
      { id: '44.3', title: 'Contractors\' Purchasing Systems Reviews', items: 8 },
      { id: '44.4', title: 'Subcontracts for Commercial Products and Commercial Services', items: 6 },
    ],
  },
  {
    id: '45',
    title: 'Government Property',
    subparts: [
      { id: '45.0', title: 'Scope of part', items: 1 },
      { id: '45.1', title: 'General', items: 10 },
      { id: '45.2', title: 'Solicitation and Evaluation Procedures', items: 8 },
      { id: '45.3', title: 'Authorizing the Use and Rental of Government Property', items: 6 },
      { id: '45.4', title: 'Title to Government Property', items: 5 },
      { id: '45.5', title: 'Support Property Administration', items: 8 },
      { id: '45.6', title: 'Reporting, Redistribution, and Disposal of Government Property', items: 10 },
    ],
  },
  {
    id: '46',
    title: 'Quality Assurance',
    subparts: [
      { id: '46.0', title: 'Scope of part', items: 1 },
      { id: '46.1', title: 'General', items: 8 },
      { id: '46.2', title: 'Contract Quality Requirements', items: 12 },
      { id: '46.3', title: 'Contract Clauses', items: 6 },
      { id: '46.4', title: 'Government Contract Quality Assurance', items: 10 },
      { id: '46.5', title: 'Acceptance', items: 8 },
      { id: '46.6', title: 'Material Inspection and Receiving Reports', items: 5 },
      { id: '46.7', title: 'Warranties', items: 8 },
      { id: '46.8', title: 'Source Inspection', items: 6 },
    ],
  },
  {
    id: '47',
    title: 'Transportation',
    subparts: [
      { id: '47.0', title: 'Scope of part', items: 1 },
      { id: '47.1', title: 'General', items: 8 },
      { id: '47.2', title: 'Contracts for Transportation or Transportation-Related Services', items: 10 },
      { id: '47.3', title: 'Transportation in Supply Contracts', items: 12 },
      { id: '47.4', title: 'Air Transportation by U.S.-Flag Carriers', items: 5 },
      { id: '47.5', title: 'Ocean Transportation by U.S.-Flag Vessels', items: 6 },
    ],
  },
  {
    id: '48',
    title: 'Value Engineering',
    subparts: [
      { id: '48.0', title: 'Scope of part', items: 1 },
      { id: '48.1', title: 'Policies and Procedures', items: 10 },
      { id: '48.2', title: 'Contract Clauses', items: 6 },
    ],
  },
  {
    id: '49',
    title: 'Termination of Contracts',
    subparts: [
      { id: '49.0', title: 'Scope of part', items: 1 },
      { id: '49.1', title: 'General Principles', items: 8 },
      { id: '49.2', title: 'Additional Principles for Fixed-Price Contracts Terminated for Convenience', items: 10 },
      { id: '49.3', title: 'Additional Principles for Cost-Reimbursement Contracts Terminated for Convenience', items: 8 },
      { id: '49.4', title: 'Termination for Default', items: 12 },
      { id: '49.5', title: 'Contract Termination Clauses', items: 8 },
    ],
  },
  {
    id: '50',
    title: 'Extraordinary Contractual Actions and the Safety Act',
    subparts: [
      { id: '50.0', title: 'Scope of part', items: 1 },
      { id: '50.1', title: 'General', items: 6 },
      { id: '50.2', title: 'Delegation of and Limitations on Exercise of Authority', items: 5 },
      { id: '50.3', title: 'Contract Adjustments', items: 10 },
      { id: '50.4', title: 'Relief from Contract Terms', items: 8 },
      { id: '50.5', title: 'Contractor Requests for Adjustment', items: 6 },
    ],
  },
  {
    id: '51',
    title: 'Use of Government Sources by Contractors',
    subparts: [
      { id: '51.0', title: 'Scope of part', items: 1 },
      { id: '51.1', title: 'Contractor Use of Government Supply Sources', items: 8 },
      { id: '51.2', title: 'Contractor Use of Interagency Fleet Management System Vehicles', items: 5 },
    ],
  },
  {
    id: '52',
    title: 'Solicitation Provisions and Contract Clauses',
    subparts: [
      { id: '52.0', title: 'Scope of part', items: 1 },
      { id: '52.1', title: 'Instructions for Using Provisions and Clauses', items: 12 },
      { id: '52.2', title: 'Text of Provisions and Clauses', items: 500 },
    ],
  },
  {
    id: '53',
    title: 'Forms',
    subparts: [
      { id: '53.0', title: 'Scope of part', items: 1 },
      { id: '53.1', title: 'General', items: 6 },
      { id: '53.2', title: 'Prescription of Forms', items: 200 },
      { id: '53.3', title: 'Illustrations of Forms', items: 150 },
    ],
  },
];

const farContent: Record<string, any> = {
  '1': {
    title: 'Federal Acquisition Regulations System',
    intro: 'FAR Part 1 establishes the foundational rules, authority, and structure for all federal acquisition activities, making it essential for understanding and complying with government contracting requirements.',
    overview: `FAR Part 1 serves as the cornerstone of the Federal Acquisition Regulation system. It defines the purpose, authority, and administrative framework that governs all federal procurement activities. This part establishes the legal foundation, organizational structure, and procedural guidelines that contracting officers, contractors, and agencies must follow throughout the acquisition lifecycle.

The regulations outlined in Part 1 provide the essential framework for understanding how federal acquisitions are conducted, who has authority to make contracting decisions, and how deviations from standard procedures may be authorized. It sets forth the principles of competition, transparency, and accountability that underpin the entire federal acquisition system.`,
    keyRules: [
      {
        number: '1.1',
        title: 'Purpose, Authority, Issuance',
        content: 'Establishes the purpose of the FAR system, which is to provide uniform policies and procedures for acquisition by all executive agencies. The FAR is issued and maintained by the Department of Defense (DoD), the General Services Administration (GSA), and the National Aeronautics and Space Administration (NASA) under the authority of the Office of Federal Procurement Policy Act.',
      },
      {
        number: '1.2',
        title: 'Administration',
        content: 'Defines the roles and responsibilities of the FAR Council, which consists of the Administrator for Federal Procurement Policy, the Secretary of Defense, the Administrator of General Services, and the Administrator of NASA. The Council is responsible for developing, maintaining, and updating the FAR.',
      },
      {
        number: '1.3',
        title: 'Agency Acquisition Regulations',
        content: 'Establishes the process for agencies to develop and maintain their own acquisition regulations that supplement the FAR. These agency-specific regulations must be consistent with the FAR and approved by the FAR Council.',
      },
      {
        number: '1.4',
        title: 'Deviations from the FAR',
        content: 'Provides procedures for agencies to deviate from the FAR when necessary. Deviations may be authorized for individual contracts or classes of contracts, and must be documented and approved according to specified procedures.',
      },
      {
        number: '1.5',
        title: 'Agency and Public Participation',
        content: 'Establishes mechanisms for agencies and the public to participate in the development and revision of the FAR. This includes public comment periods, advisory committees, and other forms of stakeholder engagement.',
      },
      {
        number: '1.6',
        title: 'Career Development, Contracting Authority, and Responsibilities',
        content: 'Defines the qualifications, training, and authority of contracting officers. It establishes the requirements for contracting officer appointments, delegations of authority, and the responsibilities associated with making binding commitments on behalf of the government.',
      },
    ],
    responsibilities: {
      contractingOfficers: 'Contracting officers must be properly appointed, trained, and authorized before they can enter into contracts on behalf of the government. They are responsible for ensuring compliance with all applicable regulations and for making decisions that are in the best interest of the government.',
      contractors: 'Contractors must understand the FAR system and comply with all applicable regulations. They are responsible for submitting accurate proposals, performing work in accordance with contract terms, and maintaining proper records.',
      agencies: 'Agencies must ensure that their acquisition activities comply with the FAR and that their personnel are properly trained. They must also develop and maintain agency-specific regulations that supplement the FAR when necessary.',
    },
    practicalImplications: `Understanding FAR Part 1 is crucial for anyone involved in federal contracting. It provides the foundation for all subsequent FAR parts and establishes the legal and administrative framework that governs federal acquisitions.

Common issues that arise from misunderstanding Part 1 include:
- Unauthorized contracting actions by personnel without proper authority
- Failure to follow proper deviation procedures when necessary
- Lack of understanding of the relationship between the FAR and agency-specific regulations
- Inadequate training of contracting personnel

Contractors should be aware that contracting officers must have proper authority, and that any deviations from standard procedures must be properly documented and approved.`,
    crossReferences: [
      { part: 'FAR 2.101', title: 'Definitions', description: 'Key terms used throughout the FAR' },
      { part: 'FAR 1.602', title: 'Contracting Officer', description: 'Appointment and authority of contracting officers' },
      { part: 'FAR 1.403', title: 'Individual Deviations', description: 'Procedures for individual contract deviations' },
      { part: 'FAR 1.404', title: 'Class Deviations', description: 'Procedures for class deviations' },
    ],
  },
  '2': {
    title: 'Definitions of Words and Terms',
    intro: 'FAR Part 2 provides standardized definitions for terms used throughout the Federal Acquisition Regulation, ensuring consistent interpretation and application across all federal procurement activities.',
    overview: `FAR Part 2 serves as the glossary for the entire Federal Acquisition Regulation system. It contains comprehensive definitions of words, phrases, and terms that are used throughout the FAR. These definitions are critical for understanding the precise meaning of terms in contracts, solicitations, and other procurement documents.

The definitions in Part 2 ensure that all parties—contracting officers, contractors, and other stakeholders—have a common understanding of key terms. This standardization reduces ambiguity, prevents misunderstandings, and promotes fair and consistent application of procurement regulations.`,
    keyRules: [
      {
        number: '2.101',
        title: 'Definitions',
        content: 'Contains over 200 definitions of terms used throughout the FAR. These definitions cover a wide range of topics including contract types, business classifications, procurement methods, and technical terms. Key definitions include terms such as "commercial product," "small business," "contracting officer," and many others that are fundamental to understanding federal procurement.',
      },
    ],
    responsibilities: {
      contractingOfficers: 'Contracting officers must use the definitions in Part 2 when interpreting contract terms and applying FAR provisions. They should ensure that solicitations and contracts use terms consistently with these definitions.',
      contractors: 'Contractors must understand the definitions in Part 2 to properly interpret contract requirements, respond to solicitations, and comply with contract terms. Misunderstanding definitions can lead to non-compliance or proposal rejection.',
      agencies: 'Agencies must ensure that their personnel are familiar with Part 2 definitions and use them consistently in all procurement documents.',
    },
    practicalImplications: `Understanding FAR Part 2 definitions is essential for successful federal contracting. Many contract disputes arise from misunderstandings about the meaning of specific terms.

Key considerations:
- Definitions may differ from common usage or industry terminology
- Some terms have very specific legal meanings that must be understood
- Definitions are updated periodically, so contractors should stay current
- Agency-specific supplements may add additional definitions

Contractors should always refer to Part 2 when uncertain about the meaning of a term in a solicitation or contract.`,
    crossReferences: [
      { part: 'FAR 1.1', title: 'Purpose, Authority, Issuance', description: 'Foundation of the FAR system' },
      { part: 'FAR 12.101', title: 'Commercial Products and Commercial Services', description: 'Definitions related to commercial items' },
      { part: 'FAR 19.101', title: 'Small Business Programs', description: 'Small business definitions' },
    ],
  },
};

// Helper function to generate default content for parts without detailed content
const generateDefaultContent = (partId: string, partTitle: string): any => {
  const part = farParts.find((p) => p.id === partId);
  if (!part) return null;

  return {
    title: partTitle,
    intro: `FAR Part ${partId} addresses ${partTitle.toLowerCase()}, providing regulations and guidance for federal acquisition activities in this area.`,
    overview: `FAR Part ${partId} establishes policies, procedures, and requirements related to ${partTitle.toLowerCase()}. This part provides comprehensive guidance for contracting officers, contractors, and other stakeholders involved in federal procurement activities.

The regulations in this part ensure consistent application of acquisition policies and promote fair and effective procurement practices. Understanding these regulations is essential for compliance and successful contract performance.`,
    keyRules: part.subparts.length > 0
      ? part.subparts.slice(0, 6).map((subpart) => ({
          number: subpart.id,
          title: subpart.title,
          content: `${subpart.title} establishes requirements and procedures for ${subpart.title.toLowerCase()} in federal acquisitions. This section provides detailed guidance on compliance, documentation, and implementation.`,
        }))
      : [
          {
            number: `${partId}.1`,
            title: 'General',
            content: 'Establishes general policies and procedures applicable to this part of the FAR.',
          },
        ],
    responsibilities: {
      contractingOfficers: `Contracting officers must understand and apply the regulations in Part ${partId} when conducting acquisitions. They are responsible for ensuring compliance with all applicable requirements.`,
      contractors: `Contractors must comply with all requirements in Part ${partId} that apply to their contracts. Understanding these regulations is essential for successful contract performance.`,
      agencies: `Agencies must ensure that their acquisition activities comply with Part ${partId} and that personnel are properly trained on these requirements.`,
    },
    practicalImplications: `FAR Part ${partId} has significant implications for federal contracting activities. Contractors and contracting officers must be familiar with these regulations to ensure compliance and avoid potential issues.

Key considerations:
- These regulations apply to all relevant federal acquisitions
- Non-compliance can result in contract issues or penalties
- Understanding these requirements is essential for successful contracting
- Regular updates may modify requirements, so staying current is important`,
    crossReferences: [
      { part: `FAR ${partId}.0`, title: 'Scope of part', description: 'Scope and applicability of this part' },
      { part: 'FAR 1.1', title: 'Purpose, Authority, Issuance', description: 'Foundation of the FAR system' },
      { part: 'FAR 2.101', title: 'Definitions', description: 'Key terms used throughout the FAR' },
    ],
  };
};

export default function FARNavigator() {
  const { partId } = useParams<{ partId?: string }>();
  const navigate = useNavigate();
  const [selectedPart, setSelectedPart] = useState<string>(partId || '1');
  const [expandedParts, setExpandedParts] = useState<Set<string>>(new Set(['1']));
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  const currentPart = farParts.find((p) => p.id === selectedPart);
  const currentContent = farContent[selectedPart] || (currentPart ? generateDefaultContent(selectedPart, currentPart.title) : null);

  useEffect(() => {
    if (partId) {
      setSelectedPart(partId);
      setExpandedParts((prev) => new Set([...prev, partId]));
    }
  }, [partId]);

  const togglePart = (partId: string) => {
    setExpandedParts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(partId)) {
        newSet.delete(partId);
      } else {
        newSet.add(partId);
      }
      return newSet;
    });
  };

  const handlePartSelect = (partId: string) => {
    setSelectedPart(partId);
    navigate(`/far-navigator/${partId}`);
    setExpandedParts((prev) => new Set([...prev, partId]));
  };

  const filteredParts = farParts.filter(
    (part) =>
      part.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      part.subparts.some((sub) => sub.title.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-white">
      <Navigation variant="sticky" />

      {/* Top Banner */}
      <div className="bg-blue-600 text-white py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium">Free Live Webinar: AI for GovCon</span>
            <span className="text-sm">Thursday, November 27 • 2:00 PM EST</span>
          </div>
          <button
            onClick={() => setIsDemoModalOpen(true)}
            className="px-4 py-1 bg-white text-blue-600 rounded text-sm font-semibold hover:bg-blue-50 transition-colors"
          >
            Register Free →
          </button>
        </div>
      </div>

      <div className="flex min-h-screen pt-16">
        {/* Left Sidebar */}
        <aside
          className={`${
            isSidebarOpen ? 'w-80' : 'w-0'
          } bg-gray-50 border-r border-gray-200 transition-all duration-300 overflow-hidden fixed md:static h-screen md:h-auto`}
        >
          <div className="p-6 h-full overflow-y-auto">
            {/* Mobile Sidebar Toggle */}
            <div className="md:hidden flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900">FAR Navigator</h2>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-2 hover:bg-gray-200 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <Link
              to="/toolkit-assessment"
              className="block mb-6 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-center"
            >
              All Free Tools
            </Link>

            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                Federal Acquisition Regulations System
              </h3>
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Search Part"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <nav className="space-y-1">
              {(searchQuery ? filteredParts : farParts).map((part) => (
                <div key={part.id}>
                  <button
                    onClick={() => togglePart(part.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
                      selectedPart === part.id
                        ? 'bg-blue-100 text-blue-900 font-semibold'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-sm">
                      Part {part.id} {part.title}
                    </span>
                    {expandedParts.has(part.id) ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>
                  {expandedParts.has(part.id) && (
                    <div className="ml-4 mt-1 space-y-1">
                      {part.subparts.map((subpart) => (
                        <button
                          key={subpart.id}
                          onClick={() => handlePartSelect(part.id)}
                          className="w-full text-left px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded"
                        >
                          {subpart.id} {subpart.title} ({subpart.items} item{subpart.items !== 1 ? 's' : ''})
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 md:p-10">
          {/* Mobile Sidebar Toggle Button */}
          {!isSidebarOpen && (
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden fixed top-20 left-4 z-40 p-2 bg-blue-600 text-white rounded-lg shadow-lg"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          {currentPart && currentContent ? (
            <>
              {/* Header */}
              <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  Part {selectedPart} {currentContent.title}
                </h1>
                <p className="text-lg text-gray-600 mb-6 leading-relaxed">{currentContent.intro}</p>
                <div className="flex flex-wrap gap-4">
                  <button className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center space-x-2">
                    <FileText className="w-5 h-5" />
                    <span>Summary</span>
                  </button>
                  <button className="px-6 py-2 border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center space-x-2">
                    <Download className="w-5 h-5" />
                    <span>Open PDF</span>
                  </button>
                </div>
              </div>

              <div className="grid lg:grid-cols-3 gap-8">
                {/* Main Content Column */}
                <div className="lg:col-span-2 space-y-8">
                  {/* Overview */}
                  <section className="bg-white rounded-xl p-6 border border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Overview</h2>
                    <div className="prose max-w-none text-gray-700 leading-relaxed">
                      <p>{currentContent.overview}</p>
                    </div>
                  </section>

                  {/* Key Rules */}
                  <section className="bg-white rounded-xl p-6 border border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Key Rules</h2>
                    <div className="space-y-6">
                      {currentContent.keyRules.map((rule: any, index: number) => (
                        <div key={index} className="border-l-4 border-blue-500 pl-4">
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            {rule.number} {rule.title}
                          </h3>
                          <p className="text-gray-700 leading-relaxed">{rule.content}</p>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Responsibilities */}
                  <section className="bg-white rounded-xl p-6 border border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Responsibilities</h2>
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Contracting Officers</h3>
                        <p className="text-gray-700 leading-relaxed">{currentContent.responsibilities.contractingOfficers}</p>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Contractors</h3>
                        <p className="text-gray-700 leading-relaxed">{currentContent.responsibilities.contractors}</p>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Agencies</h3>
                        <p className="text-gray-700 leading-relaxed">{currentContent.responsibilities.agencies}</p>
                      </div>
                    </div>
                  </section>

                  {/* Practical Implications */}
                  <section className="bg-white rounded-xl p-6 border border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Practical Implications</h2>
                    <div className="prose max-w-none text-gray-700 leading-relaxed whitespace-pre-line">
                      {currentContent.practicalImplications}
                    </div>
                  </section>

                  {/* Subparts */}
                  <section className="bg-white rounded-xl p-6 border border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Subparts</h2>
                    <div className="space-y-2">
                      {currentPart.subparts.map((subpart) => (
                        <button
                          key={subpart.id}
                          className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-between"
                        >
                          <span className="text-gray-900 font-medium">
                            {subpart.id} {subpart.title}
                          </span>
                          <span className="text-sm text-gray-500">
                            ({subpart.items} item{subpart.items !== 1 ? 's' : ''})
                          </span>
                        </button>
                      ))}
                    </div>
                  </section>
                </div>

                {/* Right Sidebar - Cross References */}
                <div className="lg:col-span-1">
                  <div className="bg-blue-50 rounded-xl p-6 border border-blue-200 sticky top-24">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Cross References</h3>
                    <div className="space-y-3">
                      {currentContent.crossReferences.map((ref: any, index: number) => (
                        <div key={index} className="bg-white rounded-lg p-3 border border-blue-200">
                          <div className="font-semibold text-blue-900 text-sm mb-1">{ref.part}</div>
                          <div className="text-sm font-medium text-gray-900 mb-1">{ref.title}</div>
                          <div className="text-xs text-gray-600">{ref.description}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-20">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Select a FAR Part</h2>
              <p className="text-gray-600">Choose a part from the sidebar to view its content</p>
            </div>
          )}
        </main>
      </div>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 text-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center">
            Win more contracts with AI-powered tools and comprehensive market intelligence
          </h2>
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {[
              'Complete contract database with advanced search and filtering',
              'AI-powered proposal writer and contract matching technology',
              'Real-time opportunity alerts and deadline notifications',
              'End-to-end pursuit management from discovery to award',
            ].map((feature, index) => (
              <div key={index} className="flex items-start space-x-3">
                <CheckCircle className="w-6 h-6 text-green-400 mt-1 flex-shrink-0" />
                <span className="text-lg">{feature}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-pink-600 to-red-600 text-white rounded-lg font-semibold text-lg hover:from-pink-700 hover:to-red-700 transition-all shadow-xl"
            >
              Try for Free
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <button
              onClick={() => setIsDemoModalOpen(true)}
              className="inline-flex items-center justify-center px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white rounded-lg font-semibold text-lg hover:bg-white/20 transition-all"
            >
              Schedule Demo
            </button>
          </div>
          <div className="mt-8 flex items-center justify-center space-x-4">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 border-2 border-white flex items-center justify-center text-white font-semibold text-sm"
                >
                  {String.fromCharCode(64 + i)}
                </div>
              ))}
            </div>
            <p className="text-blue-200">
              Join <span className="font-semibold text-white">500+</span> contractors already using GovSure
            </p>
          </div>
        </div>
      </section>

      <FAQChatbot />
      <DemoBookingModal isOpen={isDemoModalOpen} onClose={() => setIsDemoModalOpen(false)} />
    </div>
  );
}

