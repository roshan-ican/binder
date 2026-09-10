-- One business identity for imported vendors and registered businesses.
-- Existing business IDs, auth users, and feature records are preserved.
BEGIN;
ALTER TABLE businesses ALTER COLUMN owner_user_id DROP NOT NULL;
ALTER TABLE businesses DROP CONSTRAINT businesses_owner_user_id_fkey;
ALTER TABLE businesses ADD CONSTRAINT businesses_owner_user_id_fkey
    FOREIGN KEY (owner_user_id) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE businesses ALTER COLUMN country_code DROP NOT NULL;
ALTER TABLE businesses ALTER COLUMN country_code DROP DEFAULT;
ALTER TABLE businesses
    ADD COLUMN is_claimed BOOLEAN GENERATED ALWAYS AS (owner_user_id IS NOT NULL) STORED,
    ADD COLUMN source_type TEXT NOT NULL DEFAULT 'manual_entry',
    ADD COLUMN source_url TEXT,
    ADD COLUMN source_place_id TEXT UNIQUE,
    ADD COLUMN website TEXT,
    ADD COLUMN phone TEXT,
    ADD COLUMN email TEXT,
    ADD COLUMN whatsapp TEXT,
    ADD COLUMN google_maps_url TEXT,
    ADD COLUMN google_rating NUMERIC CHECK (google_rating BETWEEN 0 AND 5),
    ADD COLUMN google_review_count INTEGER CHECK (google_review_count >= 0),
    ADD COLUMN last_synced_at TIMESTAMPTZ;
UPDATE businesses SET source_type = 'binder_signup' WHERE owner_user_id IS NOT NULL;

-- Unlinked suppliers become unclaimed businesses. Unknown countries stay NULL.
INSERT INTO businesses (id, business_name, city, region, country_code,
    source_type, source_url, website, phone, email, whatsapp,
    verification_status, last_synced_at, created_at, updated_at)
SELECT id, name, city, region,
    CASE WHEN country ~ '^[A-Za-z]{2}$' THEN upper(country)
         WHEN lower(country) = 'india' THEN 'IN'
         WHEN lower(country) IN ('uae', 'united arab emirates') THEN 'AE' END,
    source_type, source_url, website, phone, email, whatsapp,
    verification_status, last_checked_at, created_at, updated_at
FROM suppliers WHERE business_id IS NULL;
UPDATE businesses b SET website = s.website, phone = s.phone, email = s.email,
    whatsapp = s.whatsapp, source_type = s.source_type, source_url = s.source_url,
    last_synced_at = s.last_checked_at
FROM suppliers s WHERE s.business_id = b.id;

ALTER TABLE supplier_capabilities DROP CONSTRAINT supplier_capabilities_supplier_id_fkey;
ALTER TABLE match_candidates DROP CONSTRAINT match_candidates_supplier_id_fkey;
ALTER TABLE conversation_participants DROP CONSTRAINT chk_participant_identity;
ALTER TABLE conversation_participants DROP CONSTRAINT conversation_participants_supplier_id_fkey;
ALTER TABLE messages DROP CONSTRAINT chk_message_sender_identity;
ALTER TABLE messages DROP CONSTRAINT messages_supplier_id_fkey;

UPDATE supplier_capabilities c SET supplier_id = coalesce(s.business_id, s.id)
FROM suppliers s WHERE c.supplier_id = s.id;
UPDATE match_candidates c SET supplier_id = coalesce(s.business_id, s.id)
FROM suppliers s WHERE c.supplier_id = s.id;
UPDATE conversation_participants c SET business_id = coalesce(s.business_id, s.id)
FROM suppliers s WHERE c.supplier_id = s.id;
UPDATE messages m SET business_id = coalesce(s.business_id, s.id)
FROM suppliers s WHERE m.supplier_id = s.id;

ALTER TABLE supplier_capabilities RENAME TO business_capabilities;
ALTER TABLE business_capabilities RENAME COLUMN supplier_id TO business_id;
ALTER TABLE business_capabilities ADD CONSTRAINT business_capabilities_business_id_fkey
    FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE;
ALTER INDEX idx_supplier_capabilities_supplier_id RENAME TO idx_business_capabilities_business_id;
ALTER INDEX idx_supplier_capabilities_category RENAME TO idx_business_capabilities_category;
ALTER INDEX idx_supplier_capabilities_embedding RENAME TO idx_business_capabilities_embedding;
ALTER TABLE match_candidates RENAME COLUMN supplier_id TO business_id;
ALTER TABLE match_candidates RENAME CONSTRAINT match_candidates_enquiry_id_supplier_id_key TO match_candidates_enquiry_id_business_id_key;
ALTER TABLE match_candidates ADD CONSTRAINT match_candidates_business_id_fkey
    FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE;
ALTER TABLE conversation_participants DROP COLUMN supplier_id;
ALTER TABLE conversation_participants ADD CONSTRAINT chk_participant_identity CHECK (
    (role IN ('buyer', 'supplier') AND business_id IS NOT NULL)
    OR (role = 'system' AND business_id IS NULL)
);
ALTER TABLE messages DROP COLUMN supplier_id;
-- Deleted businesses leave historical messages with an anonymous sender.
ALTER TABLE messages ADD CONSTRAINT chk_message_sender_identity CHECK (
    sender_role <> 'system' OR business_id IS NULL
);

DROP TABLE suppliers;
DROP TABLE ai_extractions;
DROP TYPE ai_source_type;
COMMIT;
