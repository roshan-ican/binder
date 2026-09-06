DROP INDEX IF EXISTS idx_enquiries_description_embedding;
DROP INDEX IF EXISTS idx_supplier_capabilities_embedding;

DROP TABLE IF EXISTS ai_extractions;
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS conversation_participants;
DROP TABLE IF EXISTS conversations;
DROP TABLE IF EXISTS outreach_attempts;
DROP TABLE IF EXISTS match_events;
DROP TABLE IF EXISTS match_candidates;
DROP TABLE IF EXISTS supplier_capabilities;
DROP TABLE IF EXISTS suppliers;

DROP TYPE IF EXISTS ai_source_type;
DROP TYPE IF EXISTS participant_role;
DROP TYPE IF EXISTS conversation_context_type;
DROP TYPE IF EXISTS outreach_direction;

ALTER TABLE enquiries
DROP COLUMN IF EXISTS budget_max,
DROP COLUMN IF EXISTS budget_min,
DROP COLUMN IF EXISTS certifications,
DROP COLUMN IF EXISTS moq,
DROP COLUMN IF EXISTS attachments,
DROP COLUMN IF EXISTS description_embedding,
DROP COLUMN IF EXISTS description,
DROP COLUMN IF EXISTS category;
