"""
Compliance models for FAR/DFARS/2CFR200 rules engine
"""
from sqlalchemy import Column, String, Text, ForeignKey, JSON, Boolean, Integer, Date, DateTime, Enum as SQLEnum
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.base import UUIDMixin, TimestampMixin, TenantMixin
import enum


class ComplianceFramework(str, enum.Enum):
    """Compliance framework types"""
    FAR = "far"  # Federal Acquisition Regulation
    DFARS = "dfars"  # Defense FAR Supplement
    CFR_200 = "2cfr200"  # Federal Grant Rules
    NIST_800_171 = "nist_800_171"  # Cybersecurity
    CMMC = "cmmc"  # Cybersecurity Maturity Model
    FEDRAMP = "fedramp"  # Cloud Security


class ComplianceRule(Base, UUIDMixin, TimestampMixin):
    """Compliance rules database"""
    __tablename__ = "compliance_rules"
    
    # Rule identification
    framework = Column(SQLEnum(ComplianceFramework), nullable=False)
    rule_number = Column(String(50), nullable=False)  # e.g., "FAR 52.222-50"
    title = Column(String(500), nullable=False)
    
    # Content
    description = Column(Text, nullable=True)
    requirements = Column(JSON, nullable=True)  # List of specific requirements
    
    # Applicability
    applies_to_contracts = Column(Boolean, default=True)
    applies_to_grants = Column(Boolean, default=False)
    threshold_value = Column(Integer, nullable=True)  # Dollar threshold
    
    # Guidance
    compliance_guidance = Column(Text, nullable=True)
    common_violations = Column(JSON, nullable=True)
    
    # Keywords for auto-detection
    keywords = Column(JSON, nullable=True)


class ComplianceCheck(Base, UUIDMixin, TimestampMixin, TenantMixin):
    """Compliance check results for proposals"""
    __tablename__ = "compliance_checks"
    
    # What was checked
    proposal_id = Column(String(36), ForeignKey("proposals.id"), nullable=True)
    grant_id = Column(String(36), ForeignKey("grants.id"), nullable=True)
    
    # Check details
    framework = Column(SQLEnum(ComplianceFramework), nullable=False)
    rule_id = Column(String(36), ForeignKey("compliance_rules.id"), nullable=False)
    
    # Results
    is_compliant = Column(Boolean, nullable=False)
    confidence_score = Column(Integer, default=0)  # 0-100
    
    # Findings
    findings = Column(Text, nullable=True)
    recommendations = Column(Text, nullable=True)
    
    # Evidence
    evidence_sections = Column(JSON, nullable=True)  # Which sections address this
    evidence_text = Column(Text, nullable=True)
    
    # Status
    status = Column(String(50), default="pending")  # pending, passed, failed, waived
    waived_by = Column(String(36), nullable=True)
    waiver_reason = Column(Text, nullable=True)
    
    # Organization
    organization_id = Column(String(36), ForeignKey("organizations.id"), nullable=False)


class NISTControl(Base, UUIDMixin, TimestampMixin, TenantMixin):
    """NIST 800-171 security controls"""
    __tablename__ = "nist_controls"
    
    # Control identification
    control_number = Column(String(50), nullable=False)  # e.g., "3.1.1"
    control_family = Column(String(100), nullable=False)  # Access Control, etc.
    title = Column(String(500), nullable=False)
    
    # Requirements
    requirement = Column(Text, nullable=False)
    discussion = Column(Text, nullable=True)
    
    # Implementation
    implementation_status = Column(String(50), default="not_implemented")
    implementation_notes = Column(Text, nullable=True)
    evidence_documents = Column(JSON, nullable=True)
    
    # Assessment
    last_assessed = Column(DateTime, nullable=True)
    assessment_score = Column(Integer, nullable=True)  # 0-5
    
    # Organization
    organization_id = Column(String(36), ForeignKey("organizations.id"), nullable=False)


class CMMCLevel(Base, UUIDMixin, TimestampMixin, TenantMixin):
    """CMMC certification tracking"""
    __tablename__ = "cmmc_levels"
    
    # Organization
    organization_id = Column(String(36), ForeignKey("organizations.id"), nullable=False)
    
    # Certification
    level = Column(Integer, nullable=False)  # 1-3
    certification_date = Column(Date, nullable=True)
    expiry_date = Column(Date, nullable=True)
    
    # Assessor
    c3pao_name = Column(String(255), nullable=True)  # Certified 3rd Party Assessor Org
    assessment_date = Column(Date, nullable=True)
    
    # Status
    status = Column(String(50), default="in_progress")
    certificate_number = Column(String(100), nullable=True)
    
    # Scope
    scope_description = Column(Text, nullable=True)
    facilities_covered = Column(JSON, nullable=True)
    
    # Documentation
    certificate_file_path = Column(String(500), nullable=True)
    assessment_report_path = Column(String(500), nullable=True)


class AccessibilityCheck(Base, UUIDMixin, TimestampMixin):
    """508 Accessibility compliance checks"""
    __tablename__ = "accessibility_checks"
    
    # Document checked
    proposal_id = Column(String(36), ForeignKey("proposals.id"), nullable=True)
    document_path = Column(String(500), nullable=False)
    
    # Check type
    check_type = Column(String(50), nullable=False)  # pdf, docx, web
    
    # Results
    is_compliant = Column(Boolean, nullable=False)
    wcag_level = Column(String(10), nullable=True)  # A, AA, AAA
    
    # Issues found
    issues = Column(JSON, nullable=True)  # List of accessibility issues
    issue_count = Column(Integer, default=0)
    
    # Specific checks
    has_alt_text = Column(Boolean, default=False)
    has_proper_headings = Column(Boolean, default=False)
    has_table_headers = Column(Boolean, default=False)
    has_color_contrast = Column(Boolean, default=False)
    has_tagged_pdf = Column(Boolean, default=False)
    
    # Score
    compliance_score = Column(Integer, default=0)  # 0-100
    
    # Recommendations
    recommendations = Column(JSON, nullable=True)

