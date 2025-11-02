"""add pipeline_items table

Revision ID: pipeline_001
Revises: inztan_integration_tables
Create Date: 2025-10-27 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'pipeline_001'
down_revision = None  # This will be the first migration or set to previous revision ID
branch_labels = None
depends_on = None


def upgrade():
    """Add pipeline_items table"""
    op.create_table(
        'pipeline_items',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('opportunity_id', sa.String(), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('agency', sa.String(), nullable=False),
        sa.Column('description', sa.String(), nullable=True),
        sa.Column('contract_value', sa.Float(), nullable=True),
        sa.Column('due_date', sa.Date(), nullable=True),
        sa.Column('status', sa.Enum('draft', 'in_progress', 'review', 'submitted', name='pipelinestatus'), nullable=False),
        sa.Column('stage', sa.Enum('prospecting', 'qualifying', 'proposal', 'negotiation', 'won', 'lost', name='pipelinestage'), nullable=False),
        sa.Column('priority', sa.Enum('low', 'medium', 'high', 'critical', name='pipelinepriority'), nullable=False),
        sa.Column('progress', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('pwin_score', sa.Integer(), nullable=True),
        sa.Column('notes', sa.String(), nullable=True),
        sa.Column('team_members', sa.JSON(), nullable=True),
        sa.Column('brief_generated', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('user_id', sa.String(36), nullable=False),
        sa.Column('organization_id', sa.String(36), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes
    op.create_index(op.f('ix_pipeline_items_opportunity_id'), 'pipeline_items', ['opportunity_id'], unique=False)
    op.create_index(op.f('ix_pipeline_items_status'), 'pipeline_items', ['status'], unique=False)
    op.create_index(op.f('ix_pipeline_items_stage'), 'pipeline_items', ['stage'], unique=False)
    op.create_index(op.f('ix_pipeline_items_user_id'), 'pipeline_items', ['user_id'], unique=False)
    op.create_index(op.f('ix_pipeline_items_organization_id'), 'pipeline_items', ['organization_id'], unique=False)
    
    # Add foreign keys (if users and organizations tables exist)
    try:
        op.create_foreign_key('fk_pipeline_items_user_id', 'pipeline_items', 'users', ['user_id'], ['id'])
    except:
        pass  # Skip if users table doesn't exist yet
    
    try:
        op.create_foreign_key('fk_pipeline_items_organization_id', 'pipeline_items', 'organizations', ['organization_id'], ['id'])
    except:
        pass  # Skip if organizations table doesn't exist yet


def downgrade():
    """Remove pipeline_items table"""
    op.drop_index(op.f('ix_pipeline_items_organization_id'), table_name='pipeline_items')
    op.drop_index(op.f('ix_pipeline_items_user_id'), table_name='pipeline_items')
    op.drop_index(op.f('ix_pipeline_items_stage'), table_name='pipeline_items')
    op.drop_index(op.f('ix_pipeline_items_status'), table_name='pipeline_items')
    op.drop_index(op.f('ix_pipeline_items_opportunity_id'), table_name='pipeline_items')
    op.drop_table('pipeline_items')
    
    # Drop enums (PostgreSQL)
    try:
        op.execute('DROP TYPE IF EXISTS pipelinestatus')
        op.execute('DROP TYPE IF EXISTS pipelinestage')
        op.execute('DROP TYPE IF EXISTS pipelinepriority')
    except:
        pass  # SQLite doesn't use enums

