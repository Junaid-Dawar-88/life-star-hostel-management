-- Drop ai_chat table indexes
DROP INDEX IF EXISTS "ai_chat_organization_id_idx";
DROP INDEX IF EXISTS "ai_chat_user_id_idx";
DROP INDEX IF EXISTS "ai_chat_created_at_idx";

-- Drop ai_chat table
DROP TABLE IF EXISTS "ai_chat";
