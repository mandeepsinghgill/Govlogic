# Proposal Database Schema Verification

## ✅ Database Tables Required for Proposals

Based on the `backend/app/models/proposal.py` file, the following tables are required:

### 1. **proposals** table
**Required Columns:**
- `id` (String(36), Primary Key) - UUID
- `title` (String(500), NOT NULL)
- `solicitation_number` (String(100), nullable)
- `status` (Enum: draft, in_progress, pink_team, red_team, gold_team, final, submitted)
- `opportunity_id` (String(36), ForeignKey to opportunities.id, nullable)
- `organization_id` (String(36), ForeignKey to organizations.id, NOT NULL) ⚠️ **REQUIRED**
- `created_by` (String(36), ForeignKey to users.id, nullable, indexed)
- `rfp_file_path` (String(500), nullable)
- `rfp_text` (Text, nullable)
- `requirements` (JSON, nullable)
- `compliance_matrix` (JSON, nullable)
- `outline` (JSON, nullable)
- `page_budget` (JSON, nullable)
- `sections` (JSON, nullable) - **This is where generated content is stored**
- `readability_score` (Float, nullable)
- `compliance_score` (Float, nullable)
- `citation_score` (Float, nullable)
- `red_team_report` (JSON, nullable)
- `red_team_score` (Integer, nullable)
- `docx_file_path` (String(500), nullable)
- `pdf_file_path` (String(500), nullable)
- `excel_file_path` (String(500), nullable)
- `is_508_compliant` (Boolean, default=False)
- `sharepoint_url` (String(1000), nullable)
- `sharepoint_file_id` (String(100), nullable)
- `auto_sync_sharepoint` (Boolean, default=False)
- `sharepoint_folder_path` (String(500), nullable)
- `created_at` (DateTime, NOT NULL)
- `updated_at` (DateTime, NOT NULL)
- `is_deleted` (Boolean, default=False)
- `deleted_at` (DateTime, nullable)

### 2. **proposal_sections** table
**Required Columns:**
- `id` (String(36), Primary Key)
- `proposal_id` (String(36), ForeignKey to proposals.id, NOT NULL)
- `section_number` (String(20), NOT NULL)
- `section_title` (String(255), NOT NULL)
- `content` (Text, nullable)
- `word_count` (Integer, default=0)
- `page_count` (Integer, default=0)
- `ai_generated` (Boolean, default=False)
- `ai_model` (String(50), nullable)
- `prompt_used` (Text, nullable)
- `status` (String(50), default="draft")
- `assigned_to` (String(36), nullable)
- `order` (Integer, default=0)
- `created_at` (DateTime, NOT NULL)
- `updated_at` (DateTime, NOT NULL)

### 3. **proposal_reviews** table
**Required Columns:**
- `id` (String(36), Primary Key)
- `proposal_id` (String(36), ForeignKey to proposals.id, NOT NULL)
- `review_type` (String(50), NOT NULL) - pink, red, gold
- `reviewer_id` (String(36), ForeignKey to users.id, NOT NULL)
- `overall_score` (Integer, nullable)
- `technical_score` (Integer, nullable)
- `management_score` (Integer, nullable)
- `past_performance_score` (Integer, nullable)
- `strengths` (Text, nullable)
- `weaknesses` (Text, nullable)
- `recommendations` (Text, nullable)
- `comments` (JSON, nullable)
- `status` (String(50), default="in_progress")
- `completed_at` (DateTime, nullable)
- `created_at` (DateTime, NOT NULL)
- `updated_at` (DateTime, NOT NULL)

## 🔧 How Tables Are Created

Tables are automatically created on backend startup via:
```python
Base.metadata.create_all(bind=engine)
```

This is in `backend/app/main.py` in the `startup()` function.

## ✅ Verification

The schema supports:
- ✅ Saving generated proposal content in `sections` JSON field
- ✅ Linking proposals to opportunities via `opportunity_id`
- ✅ User-scoped proposals via `created_by`
- ✅ Organization-scoped proposals via `organization_id`
- ✅ Soft delete functionality
- ✅ All required fields for proposal generation

## ⚠️ Important Notes

1. **organization_id is REQUIRED** - The Proposal model inherits from `TenantMixin` which requires `organization_id` to be NOT NULL
2. **User must have organization_id** - When creating a proposal, the user's `organization_id` is used
3. **Generated content is stored in `sections` JSON field** - Format: `{"content": "...", "estimated_pages": 70}`

