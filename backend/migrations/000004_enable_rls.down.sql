-- Restores Supabase's stock posture: tables readable by the Data API roles and
-- no row-level security. Only ever roll this back knowingly -- it re-opens
-- every table to any client holding the publishable key.
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
        ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon;
        GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
        ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
        GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
    END IF;
END
$$;

ALTER TABLE ai_extractions DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants DISABLE ROW LEVEL SECURITY;
ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE outreach_attempts DISABLE ROW LEVEL SECURITY;
ALTER TABLE match_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE match_candidates DISABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_capabilities DISABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers DISABLE ROW LEVEL SECURITY;

ALTER TABLE enquiries DISABLE ROW LEVEL SECURITY;
ALTER TABLE swap_match_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE swap_matches DISABLE ROW LEVEL SECURITY;
ALTER TABLE swap_listing_assets DISABLE ROW LEVEL SECURITY;
ALTER TABLE swap_listings DISABLE ROW LEVEL SECURITY;
ALTER TABLE business_industries DISABLE ROW LEVEL SECURITY;
ALTER TABLE industries DISABLE ROW LEVEL SECURITY;
ALTER TABLE business_roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE businesses DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
