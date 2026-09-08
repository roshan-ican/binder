-- Links our own `users` table to Supabase Auth identities (Google sign-in
-- and, later, any other provider Supabase handles). Supabase verifies the
-- OAuth flow and issues a JWT; this backend only ever sees that JWT's `sub`
-- claim (a UUID) and `email` -- it never sees a Google credential directly.
-- UNIQUE already creates the index this column needs; no separate CREATE INDEX.
ALTER TABLE users
ADD COLUMN supabase_user_id UUID UNIQUE;
