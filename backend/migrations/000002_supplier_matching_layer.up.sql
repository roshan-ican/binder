-- Supplier discovery + matching + agent-brain layer.
--
-- Binder's real workflow is: find supplier -> contact supplier -> get a
-- response/quote -> maybe onboard them later. Most suppliers Binder talks to
-- will never have a Binder account when first contacted, so matching,
-- outreach, and conversations point at `suppliers`, not `businesses`,
-- directly. A supplier's `business_id` stays null until (if ever) it signs
-- up -- no further migration needed for that transition, just an UPDATE.

ALTER TABLE enquiries
ADD COLUMN category TEXT,
ADD COLUMN description TEXT,
ADD COLUMN description_embedding vector (384),
ADD COLUMN attachments JSONB NOT NULL DEFAULT '[]'::jsonb,
ADD COLUMN moq NUMERIC,
ADD COLUMN certifications TEXT[],
ADD COLUMN budget_min NUMERIC,
ADD COLUMN budget_max NUMERIC;

CREATE TYPE outreach_direction AS ENUM ('outbound', 'inbound');

CREATE TYPE conversation_context_type AS ENUM ('enquiry', 'swap_listing');

CREATE TYPE participant_role AS ENUM ('buyer', 'supplier', 'system');

CREATE TYPE ai_source_type AS ENUM ('enquiry', 'swap_listing', 'supplier_reply');

-- The fulfillment-side entity: covers Binder businesses AND suppliers
-- discovered externally (directory scrape, referral, manual entry) who have
-- never signed up. business_id is nullable and set once/if they onboard.
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

-- Normalized, matchable capability records. One supplier can list several.
CREATE TABLE supplier_capabilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_id UUID NOT NULL REFERENCES suppliers (id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    capability TEXT NOT NULL,
    description TEXT,
    min_order_quantity NUMERIC,
    max_order_quantity NUMERIC,
    price_min NUMERIC,
    price_max NUMERIC,
    currency TEXT,
    lead_time_days INTEGER,
    capacity TEXT,
    service_regions TEXT[],
    certifications TEXT[],
    embedding vector (384),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_supplier_capabilities_supplier_id ON supplier_capabilities (supplier_id);
CREATE INDEX idx_supplier_capabilities_category ON supplier_capabilities (category);

-- Current state of one enquiry x one candidate supplier. `status` and
-- `ranking_version` are plain text (Go-validated), not enums, because the
-- workflow's state set will iterate faster than an ALTER TYPE migration
-- should gate on.
CREATE TABLE match_candidates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enquiry_id UUID NOT NULL REFERENCES enquiries (id) ON DELETE CASCADE,
    supplier_id UUID NOT NULL REFERENCES suppliers (id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'generated',
    rank INTEGER,
    score NUMERIC,
    score_breakdown JSONB NOT NULL DEFAULT '{}'::jsonb,
    ranking_version TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (enquiry_id, supplier_id)
);
CREATE INDEX idx_match_candidates_status ON match_candidates (status);
CREATE INDEX idx_match_candidates_enquiry_rank ON match_candidates (enquiry_id, rank);

-- Append-only learning log. event_type is intentionally NOT the same enum
-- as match_candidates.status -- new event types (message_opened,
-- followup_sent, negotiation_started, ...) must be addable independently.
CREATE TABLE match_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_candidate_id UUID NOT NULL REFERENCES match_candidates (id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    payload JSONB NOT NULL DEFAULT '{}'::jsonb
);
CREATE INDEX idx_match_events_candidate_id ON match_events (match_candidate_id);
CREATE INDEX idx_match_events_type ON match_events (event_type);

-- External WhatsApp/SMS/email log with a supplier, separate from in-app
-- `messages` because outreach happens before any conversation exists.
CREATE TABLE outreach_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_candidate_id UUID NOT NULL REFERENCES match_candidates (id) ON DELETE CASCADE,
    channel TEXT NOT NULL,
    direction outreach_direction NOT NULL,
    provider_message_id TEXT,
    body TEXT,
    status TEXT NOT NULL DEFAULT 'queued',
    sent_at TIMESTAMPTZ,
    received_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_outreach_attempts_candidate_id ON outreach_attempts (match_candidate_id);
CREATE INDEX idx_outreach_attempts_provider_message_id ON outreach_attempts (provider_message_id);

CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    context_type conversation_context_type NOT NULL,
    context_id UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_conversations_context ON conversations (context_type, context_id);

-- business_id/supplier_id is a nullable pair, not a polymorphic id, so real
-- FK integrity is enforced either way. The CHECK constraint is what lets a
-- supplier who never signed up still be a participant.
CREATE TABLE conversation_participants (
    conversation_id UUID NOT NULL REFERENCES conversations (id) ON DELETE CASCADE,
    role participant_role NOT NULL,
    business_id UUID REFERENCES businesses (id) ON DELETE CASCADE,
    supplier_id UUID REFERENCES suppliers (id) ON DELETE CASCADE,
    PRIMARY KEY (conversation_id, role),
    CONSTRAINT chk_participant_identity CHECK (
        (
            role = 'buyer'
            AND business_id IS NOT NULL
            AND supplier_id IS NULL
        )
        OR (
            role = 'supplier'
            AND supplier_id IS NOT NULL
            AND business_id IS NULL
        )
        OR (
            role = 'system'
            AND business_id IS NULL
            AND supplier_id IS NULL
        )
    )
);

-- Same nullable-pair pattern as conversation_participants, for the same
-- reason: a message's sender may be a business or an unregistered supplier.
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations (id) ON DELETE CASCADE,
    sender_role participant_role NOT NULL,
    business_id UUID REFERENCES businesses (id) ON DELETE SET NULL,
    supplier_id UUID REFERENCES suppliers (id) ON DELETE SET NULL,
    body TEXT NOT NULL,
    sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    read_at TIMESTAMPTZ,
    CONSTRAINT chk_message_sender_identity CHECK (
        (
            sender_role = 'buyer'
            AND business_id IS NOT NULL
            AND supplier_id IS NULL
        )
        OR (
            sender_role = 'supplier'
            AND supplier_id IS NOT NULL
            AND business_id IS NULL
        )
        OR (
            sender_role = 'system'
            AND business_id IS NULL
            AND supplier_id IS NULL
        )
    )
);
CREATE INDEX idx_messages_conversation_id ON messages (conversation_id);

-- Vendor-agnostic language-brain call log: provider/model_name are text, not
-- tied to one SDK, so "is the small model good enough, or is GPT/Claude
-- fallback being overused" stays an answerable query.
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

-- ANN indexes. `lists` is tuned for a small/empty table for now; revisit
-- once real row counts exist.
CREATE INDEX idx_supplier_capabilities_embedding ON supplier_capabilities USING ivfflat (embedding vector_cosine_ops)
WITH
    (lists = 100);

CREATE INDEX idx_enquiries_description_embedding ON enquiries USING ivfflat (description_embedding vector_cosine_ops)
WITH
    (lists = 100);
