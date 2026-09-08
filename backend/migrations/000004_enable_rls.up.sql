-- Locks every application table against Supabase's Data API.
--
-- Supabase exposes `public` over PostgREST to the `anon` and `authenticated`
-- roles, which any client holding the publishable key can reach. Signing in
-- proves *who* a caller is; it does not restrict *which rows* they may touch.
-- Without row-level security, one signed-in user could read every business,
-- enquiry and message in the project straight from the client.
--
-- Binder's clients never talk to the Data API: they call the Go backend, which
-- verifies the Supabase JWT and enforces ownership itself. So the correct
-- posture is deny-everything -- RLS on with no policies at all. Adding a
-- policy later is a deliberate act of opening one table to direct client
-- access, not something we have to remember to lock down first.
--
-- This does not affect the Go backend. It connects as the table owner
-- (`postgres`), and owners are exempt from RLS unless the table is also set to
-- FORCE ROW LEVEL SECURITY, which we deliberately do not do.

-- From 000001_core_schema
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE industries ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_industries ENABLE ROW LEVEL SECURITY;
ALTER TABLE swap_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE swap_listing_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE swap_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE swap_match_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE enquiries ENABLE ROW LEVEL SECURITY;

-- From 000002_supplier_matching_layer
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_capabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE outreach_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_extractions ENABLE ROW LEVEL SECURITY;

-- Belt and braces on top of RLS. Supabase's default privileges hand `anon` and
-- `authenticated` full table grants, so without this PostgREST still advertises
-- every table in its schema cache and answers with an empty array rather than
-- an error. Dropping the grants keeps the tables out of the API surface
-- entirely. The default-privileges change covers tables created by future
-- migrations, which run as the same role.
--
-- Guarded because these roles are Supabase's, not Postgres's: a plain local or
-- CI database (what the schema tests run against) has neither.
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
        REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
        ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM anon;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
        REVOKE ALL ON ALL TABLES IN SCHEMA public FROM authenticated;
        ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM authenticated;
    END IF;
END
$$;
