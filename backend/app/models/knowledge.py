from sqlalchemy import Column, String, Text, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.models.base import Base, UUIDMixin, TimestampMixin, TenantMixin

class KnowledgeDocument(Base, UUIDMixin, TimestampMixin, TenantMixin):
    __tablename__ = "knowledge_documents"
    title = Column(String, nullable=False)
    document_type = Column(String, nullable=False)  # e.g., 'RFP', 'Contract', 'Internal'
    content = Column(Text)
    source_url = Column(String)
    is_deleted = Column(Boolean, default=False)

class PastPerformance(Base, UUIDMixin, TimestampMixin, TenantMixin):
    __tablename__ = "past_performance"
    project_name = Column(String, nullable=False)
    client_name = Column(String, nullable=False)
    contract_value = Column(String)
    start_date = Column(DateTime)
    end_date = Column(DateTime)
    description = Column(Text)

class TeamingPartner(Base, UUIDMixin, TimestampMixin, TenantMixin):
    __tablename__ = "teaming_partners"
    company_name = Column(String, nullable=False)
    contact_person = Column(String)
    contact_email = Column(String)
    capabilities = Column(Text)
    agreement_status = Column(String)  # e.g., 'MOU', 'Teaming Agreement', 'NDA'

class TeamingAgreement(Base, UUIDMixin, TimestampMixin, TenantMixin):
    __tablename__ = "teaming_agreements"
    partner_id = Column(String, ForeignKey("teaming_partners.id"))
    opportunity_id = Column(String, ForeignKey("opportunities.id"))
    agreement_details = Column(Text)
    start_date = Column(DateTime)
    end_date = Column(DateTime)
    
    partner = relationship("TeamingPartner")
    opportunity = relationship("Opportunity")

