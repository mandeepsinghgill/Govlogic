"""InZTan Integration Tables - Gov Supreme Overlord, RAG, Partners, Compliance

Revision ID: inztan_001
Revises: previous_revision
Create Date: 2025-01-19

Creates tables for:
- Document embeddings (RAG/semantic search)
- Compliance matrix
- RFP shredded data
- Contractors database (800K+ SAM.gov)
- Teaming agreements
- Go/No-Go analysis
- FAR/DFARS clauses
- Section 508 checks
- Project milestones
- Past performance database
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'inztan_001'
down_revision = None  # Replace with actual previous revision ID
branch_labels = None
depends_on = None


def upgrade():
    """Create InZTan integration tables"""
    
    # 1. Enable pgvector extension for RAG
    op.execute('CREATE EXTENSION IF NOT EXISTS vector')
    
    # 2. Document Embeddings (for RAG semantic search)
    op.create_table(
        'document_embeddings',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('document_id', sa.Integer(), sa.ForeignKey('documents.id', ondelete='CASCADE'), nullable=False),
        sa.Column('chunk_index', sa.Integer(), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('embedding', postgresql.ARRAY(sa.Float(), dimensions=1536), nullable=False),  # Using ARRAY instead of vector type for compatibility
        sa.Column('metadata', postgresql.JSONB(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Index('idx_document_embeddings_doc_id', 'document_id'),
    )
    # Note: For production, convert to proper vector type: ALTER TABLE document_embeddings ALTER COLUMN embedding TYPE vector(1536) USING embedding::vector;
    
    # 3. Compliance Matrix
    op.create_table(
        'compliance_matrix',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('opportunity_id', sa.Integer(), sa.ForeignKey('opportunities.id', ondelete='CASCADE'), nullable=False),
        sa.Column('rfp_clause_id', sa.String(50), nullable=False),
        sa.Column('category', sa.String(100), nullable=False),  # 'Section L', 'Section M', 'SOW'
        sa.Column('requirement_text', sa.Text(), nullable=False),
        sa.Column('proposal_location', sa.String(255), nullable=True),  # 'Volume I, Section 2, Pages 10-15'
        sa.Column('compliance_status', sa.String(50), nullable=False, server_default='Pending'),  # 'Full', 'Partial', 'Gap', 'Pending'
        sa.Column('company_capability', sa.Text(), nullable=True),
        sa.Column('evidence', postgresql.JSONB(), nullable=True),  # Array of evidence references
        sa.Column('gaps', postgresql.JSONB(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
        sa.Index('idx_compliance_matrix_opp_id', 'opportunity_id'),
        sa.Index('idx_compliance_matrix_status', 'compliance_status'),
    )
    
    # 4. RFP Shredded Data
    op.create_table(
        'rfp_shredded_data',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('opportunity_id', sa.Integer(), sa.ForeignKey('opportunities.id', ondelete='CASCADE'), nullable=False, unique=True),
        sa.Column('section_l', postgresql.JSONB(), nullable=True),  # Array of instructions
        sa.Column('section_m', postgresql.JSONB(), nullable=True),  # Array of evaluation factors
        sa.Column('sow_pws', postgresql.JSONB(), nullable=True),    # Array of tasks
        sa.Column('all_requirements', postgresql.JSONB(), nullable=True),
        sa.Column('key_information', postgresql.JSONB(), nullable=True),
        sa.Column('raw_text_length', sa.Integer(), nullable=True),
        sa.Column('shredded_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Index('idx_rfp_shredded_opp_id', 'opportunity_id'),
    )
    
    # 5. Contractors Database (800K+ SAM.gov contractors)
    op.create_table(
        'contractors',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('uei', sa.String(12), unique=True, nullable=False),  # SAM.gov Unique Entity ID
        sa.Column('duns', sa.String(13), nullable=True),
        sa.Column('legal_business_name', sa.String(500), nullable=False),
        sa.Column('doing_business_as', sa.String(500), nullable=True),
        sa.Column('naics_codes', postgresql.JSONB(), nullable=True),  # Array of NAICS codes
        sa.Column('set_aside_status', postgresql.JSONB(), nullable=True),  # ['Small Business', '8(a)', etc.]
        sa.Column('past_awards', postgresql.JSONB(), nullable=True),  # Summary from FPDS
        sa.Column('capabilities', sa.Text(), nullable=True),
        sa.Column('location', postgresql.JSONB(), nullable=True),  # {city, state, zip}
        sa.Column('contact_info', postgresql.JSONB(), nullable=True),
        sa.Column('sam_registration_date', sa.Date(), nullable=True),
        sa.Column('last_updated', sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Index('idx_contractors_uei', 'uei'),
        sa.Index('idx_contractors_naics', 'naics_codes', postgresql_using='gin'),
        sa.Index('idx_contractors_set_aside', 'set_aside_status', postgresql_using='gin'),
    )
    
    # 6. Teaming Agreements
    op.create_table(
        'teaming_agreements',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('opportunity_id', sa.Integer(), sa.ForeignKey('opportunities.id', ondelete='CASCADE'), nullable=False),
        sa.Column('prime_org_id', sa.Integer(), sa.ForeignKey('organizations.id', ondelete='CASCADE'), nullable=False),
        sa.Column('partner_contractor_id', sa.Integer(), sa.ForeignKey('contractors.id', ondelete='CASCADE'), nullable=False),
        sa.Column('role', sa.String(100), nullable=False),  # 'Prime', 'Sub', 'JV Partner'
        sa.Column('agreement_type', sa.String(50), nullable=False),  # 'NDA', 'Teaming Agreement', 'Subcontract'
        sa.Column('status', sa.String(50), nullable=False, server_default='Draft'),  # 'Draft', 'Signed', 'Active', 'Expired'
        sa.Column('signed_date', sa.Date(), nullable=True),
        sa.Column('document_id', sa.Integer(), sa.ForeignKey('documents.id', ondelete='SET NULL'), nullable=True),
        sa.Column('performance_rating', sa.Float(), nullable=True),
        sa.Column('performance_notes', sa.Text(), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
        sa.Index('idx_teaming_opp_id', 'opportunity_id'),
        sa.Index('idx_teaming_prime_org', 'prime_org_id'),
    )
    
    # 7. Go/No-Go Analysis
    op.create_table(
        'go_no_go_analysis',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('opportunity_id', sa.Integer(), sa.ForeignKey('opportunities.id', ondelete='CASCADE'), nullable=False),
        sa.Column('analyzed_by', sa.Integer(), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True),
        sa.Column('analyzed_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column('technical_fit_score', sa.Integer(), nullable=True),  # 1-100
        sa.Column('competitive_position_score', sa.Integer(), nullable=True),
        sa.Column('win_probability_score', sa.Integer(), nullable=True),
        sa.Column('resource_availability_score', sa.Integer(), nullable=True),
        sa.Column('strategic_alignment_score', sa.Integer(), nullable=True),
        sa.Column('overall_score', sa.Integer(), nullable=True),
        sa.Column('decision', sa.String(20), nullable=True),  # 'GO', 'NO-GO', 'HOLD'
        sa.Column('decision_rationale', sa.Text(), nullable=True),
        sa.Column('competitor_analysis', postgresql.JSONB(), nullable=True),
        sa.Column('price_benchmarks', postgresql.JSONB(), nullable=True),
        sa.Column('resource_estimates', postgresql.JSONB(), nullable=True),
        sa.Column('risks', postgresql.JSONB(), nullable=True),
        sa.Column('approved_by', sa.Integer(), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True),
        sa.Column('approved_at', sa.DateTime(), nullable=True),
        sa.Index('idx_go_no_go_opp_id', 'opportunity_id'),
        sa.Index('idx_go_no_go_decision', 'decision'),
    )
    
    # 8. FAR/DFARS Clauses Registry
    op.create_table(
        'far_clauses',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('clause_number', sa.String(50), unique=True, nullable=False),  # e.g., 'FAR 52.219-14'
        sa.Column('title', sa.String(500), nullable=False),
        sa.Column('full_text', sa.Text(), nullable=False),
        sa.Column('regulation_type', sa.String(20), nullable=False),  # 'FAR', 'DFARS', '2 CFR 200'
        sa.Column('category', sa.String(100), nullable=True),  # 'Small Business', 'Socioeconomic', 'Cybersecurity'
        sa.Column('applicability_rules', postgresql.JSONB(), nullable=True),  # When this clause applies
        sa.Column('mandatory', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('effective_date', sa.Date(), nullable=True),
        sa.Column('superseded_by', sa.String(50), nullable=True),
        sa.Column('source_url', sa.String(500), nullable=True),
        sa.Column('last_updated', sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Index('idx_far_clauses_number', 'clause_number'),
        sa.Index('idx_far_clauses_type', 'regulation_type'),
        sa.Index('idx_far_clauses_category', 'category'),
    )
    
    # 9. Section 508 Checks
    op.create_table(
        'section_508_checks',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('document_id', sa.Integer(), sa.ForeignKey('documents.id', ondelete='CASCADE'), nullable=False),
        sa.Column('checked_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column('checked_by', sa.Integer(), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True),
        sa.Column('wcag_level', sa.String(10), nullable=False, server_default='AA'),  # 'AA', 'AAA'
        sa.Column('overall_status', sa.String(50), nullable=False, server_default='PENDING'),  # 'PASS', 'FAIL', 'NEEDS_REVIEW'
        sa.Column('issues', postgresql.JSONB(), nullable=True),  # Array of accessibility issues
        sa.Column('report_file_id', sa.Integer(), sa.ForeignKey('documents.id', ondelete='SET NULL'), nullable=True),
        sa.Index('idx_508_checks_doc_id', 'document_id'),
        sa.Index('idx_508_checks_status', 'overall_status'),
    )
    
    # 10. Project Milestones
    op.create_table(
        'project_milestones',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('project_id', sa.Integer(), sa.ForeignKey('programs.id', ondelete='CASCADE'), nullable=False),
        sa.Column('milestone_name', sa.String(255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('due_date', sa.Date(), nullable=False),
        sa.Column('completion_date', sa.Date(), nullable=True),
        sa.Column('status', sa.String(50), nullable=False, server_default='Not Started'),  # 'Not Started', 'In Progress', 'Completed', 'At Risk'
        sa.Column('owner_user_id', sa.Integer(), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True),
        sa.Column('deliverables', postgresql.JSONB(), nullable=True),
        sa.Column('dependencies', postgresql.JSONB(), nullable=True),  # Array of milestone IDs this depends on
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
        sa.Index('idx_milestones_project_id', 'project_id'),
        sa.Index('idx_milestones_status', 'status'),
        sa.Index('idx_milestones_due_date', 'due_date'),
    )
    
    # 11. Past Performance Database
    op.create_table(
        'past_performance',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('organization_id', sa.Integer(), sa.ForeignKey('organizations.id', ondelete='CASCADE'), nullable=False),
        sa.Column('project_title', sa.String(500), nullable=False),
        sa.Column('client_agency', sa.String(255), nullable=True),
        sa.Column('contract_number', sa.String(100), nullable=True),
        sa.Column('contract_value', sa.Numeric(15, 2), nullable=True),
        sa.Column('start_date', sa.Date(), nullable=True),
        sa.Column('end_date', sa.Date(), nullable=True),
        sa.Column('scope_of_work', sa.Text(), nullable=True),
        sa.Column('relevance_tags', postgresql.JSONB(), nullable=True),  # e.g., ['cloud', 'cybersecurity', 'DoD']
        sa.Column('performance_rating', sa.String(50), nullable=True),  # 'Excellent', 'Satisfactory', etc.
        sa.Column('outcomes_achieved', sa.Text(), nullable=True),
        sa.Column('metrics', postgresql.JSONB(), nullable=True),  # Quantified results
        sa.Column('client_contact', postgresql.JSONB(), nullable=True),
        sa.Column('cpars_rating', sa.String(20), nullable=True),  # If applicable
        sa.Column('is_referenceable', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
        sa.Index('idx_past_perf_org_id', 'organization_id'),
        sa.Index('idx_past_perf_tags', 'relevance_tags', postgresql_using='gin'),
    )


def downgrade():
    """Drop InZTan integration tables"""
    op.drop_table('past_performance')
    op.drop_table('project_milestones')
    op.drop_table('section_508_checks')
    op.drop_table('far_clauses')
    op.drop_table('go_no_go_analysis')
    op.drop_table('teaming_agreements')
    op.drop_table('contractors')
    op.drop_table('rfp_shredded_data')
    op.drop_table('compliance_matrix')
    op.drop_table('document_embeddings')
    op.execute('DROP EXTENSION IF EXISTS vector')

