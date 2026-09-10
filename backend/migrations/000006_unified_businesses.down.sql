-- Rollback restores the old structure, but not discarded extraction logs or
-- original supplier UUIDs. Unclaimed businesses must be resolved first.
BEGIN;
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM businesses WHERE owner_user_id IS NULL) THEN
        RAISE EXCEPTION 'Cannot roll back: unclaimed businesses require the unified schema';
    END IF;
END $$;
CREATE TYPE ai_source_type AS ENUM ('enquiry', 'swap_listing', 'supplier_reply');
CREATE TABLE suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID UNIQUE REFERENCES businesses (id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    website TEXT,
    phone TEXT,
    email TEXT,
    whatsapp TEXT,
    city TEXT,
    region TEXT,
    country TEXT,
    source_type TEXT NOT NULL,
    source_url TEXT,
    verification_status verification_status NOT NULL DEFAULT 'unverified',
    discovered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_checked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_suppliers_business_id ON suppliers (business_id);
CREATE INDEX idx_suppliers_city ON suppliers (city);

CREATE TABLE ai_extractions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_type ai_source_type NOT NULL,
    source_id UUID NOT NULL,
    provider TEXT NOT NULL,
    model_name TEXT,
    model_version TEXT,
    prompt_version TEXT,
    schema_version TEXT,
    input_text TEXT,
    extracted_json JSONB,
    confidence NUMERIC,
    used_fallback BOOLEAN NOT NULL DEFAULT false,
    input_tokens INTEGER,
    output_tokens INTEGER,
    estimated_cost_usd NUMERIC,
    latency_ms INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_ai_extractions_source ON ai_extractions (source_type, source_id);


ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_extractions ENABLE ROW LEVEL SECURITY;
INSERT INTO suppliers (id, business_id, name, website, phone, email, whatsapp,
    city, region, country, source_type, source_url, verification_status, last_checked_at)
SELECT id, id, business_name, website, phone, email, whatsapp, city, region,
    country_code, source_type, source_url, verification_status, last_synced_at
FROM businesses;
ALTER TABLE business_capabilities DROP CONSTRAINT business_capabilities_business_id_fkey;
ALTER TABLE business_capabilities RENAME COLUMN business_id TO supplier_id;
ALTER TABLE business_capabilities RENAME TO supplier_capabilities;
ALTER TABLE supplier_capabilities ADD CONSTRAINT supplier_capabilities_supplier_id_fkey
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE;
ALTER INDEX idx_business_capabilities_business_id RENAME TO idx_supplier_capabilities_supplier_id;
ALTER INDEX idx_business_capabilities_category RENAME TO idx_supplier_capabilities_category;
ALTER INDEX idx_business_capabilities_embedding RENAME TO idx_supplier_capabilities_embedding;
ALTER TABLE match_candidates DROP CONSTRAINT match_candidates_business_id_fkey;
ALTER TABLE match_candidates RENAME COLUMN business_id TO supplier_id;
ALTER TABLE match_candidates RENAME CONSTRAINT match_candidates_enquiry_id_business_id_key TO match_candidates_enquiry_id_supplier_id_key;
ALTER TABLE match_candidates ADD CONSTRAINT match_candidates_supplier_id_fkey
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE;
ALTER TABLE conversation_participants DROP CONSTRAINT chk_participant_identity;
ALTER TABLE conversation_participants ADD COLUMN supplier_id UUID REFERENCES suppliers(id) ON DELETE CASCADE;
UPDATE conversation_participants SET supplier_id = business_id, business_id = NULL WHERE role = 'supplier';
ALTER TABLE conversation_participants ADD CONSTRAINT chk_participant_identity CHECK (
    (role = 'buyer' AND business_id IS NOT NULL AND supplier_id IS NULL)
    OR (role = 'supplier' AND supplier_id IS NOT NULL AND business_id IS NULL)
    OR (role = 'system' AND business_id IS NULL AND supplier_id IS NULL)
);
ALTER TABLE messages DROP CONSTRAINT chk_message_sender_identity;
ALTER TABLE messages ADD COLUMN supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL;
UPDATE messages SET supplier_id = business_id, business_id = NULL WHERE sender_role = 'supplier';
ALTER TABLE messages ADD CONSTRAINT chk_message_sender_identity CHECK (
    (sender_role = 'buyer' AND business_id IS NOT NULL AND supplier_id IS NULL)
    OR (sender_role = 'supplier' AND supplier_id IS NOT NULL AND business_id IS NULL)
    OR (sender_role = 'system' AND business_id IS NULL AND supplier_id IS NULL)
);
ALTER TABLE businesses DROP COLUMN is_claimed, DROP COLUMN source_type,
    DROP COLUMN source_url, DROP COLUMN source_place_id, DROP COLUMN website,
    DROP COLUMN phone, DROP COLUMN email, DROP COLUMN whatsapp,
    DROP COLUMN google_maps_url, DROP COLUMN google_rating,
    DROP COLUMN google_review_count, DROP COLUMN last_synced_at;
ALTER TABLE businesses DROP CONSTRAINT businesses_owner_user_id_fkey;
ALTER TABLE businesses ADD CONSTRAINT businesses_owner_user_id_fkey
    FOREIGN KEY (owner_user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE businesses ALTER COLUMN owner_user_id SET NOT NULL;
UPDATE businesses SET country_code = 'IN' WHERE country_code IS NULL;
ALTER TABLE businesses ALTER COLUMN country_code SET DEFAULT 'IN';
ALTER TABLE businesses ALTER COLUMN country_code SET NOT NULL;
COMMIT;
