-- Drop lead table indexes
DROP INDEX IF EXISTS "lead_organization_id_idx";
DROP INDEX IF EXISTS "lead_status_idx";
DROP INDEX IF EXISTS "lead_source_idx";
DROP INDEX IF EXISTS "lead_assigned_to_id_idx";
DROP INDEX IF EXISTS "lead_email_idx";
DROP INDEX IF EXISTS "lead_created_at_idx";
DROP INDEX IF EXISTS "lead_org_status_idx";

-- Drop lead table
DROP TABLE IF EXISTS "lead";

-- Drop lead enums
DROP TYPE IF EXISTS "LeadStatus";
DROP TYPE IF EXISTS "LeadSource";
