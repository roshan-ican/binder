-- Core schema: users, businesses, industries, swap listings/matches, enquiries.
-- Mirrors the "Binder Core Schema" artifact. Job-seeker matching is dropped
-- from the product and intentionally has no tables here.

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TYPE verification_status AS ENUM ('unverified', 'pending', 'verified');
CREATE TYPE accepts_orders_from_t AS ENUM ('businesses_only', 'businesses_and_individuals');
CREATE TYPE business_role_type AS ENUM ('seller', 'buyer', 'service_provider');
CREATE TYPE listing_status AS ENUM ('draft', 'active', 'closed', 'expired');
CREATE TYPE swap_asset_role AS ENUM ('offering', 'seeking');
CREATE TYPE swap_match_kind AS ENUM ('direct', 'chain');
CREATE TYPE swap_match_quality AS ENUM ('strong', 'good', 'potential');

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE,
    phone TEXT,
    password_hash TEXT,
    full_name TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE businesses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    business_name TEXT NOT NULL,
    contact_name TEXT,
    city TEXT,
    region TEXT,
    latitude NUMERIC(9, 6),
    longitude NUMERIC(9, 6),
    gstin TEXT,
    verification_status verification_status NOT NULL DEFAULT 'unverified',
    about TEXT,
    accepts_orders_from accepts_orders_from_t NOT NULL DEFAULT 'businesses_only',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_businesses_owner_user_id ON businesses (owner_user_id);
CREATE INDEX idx_businesses_city ON businesses (city);

CREATE TABLE business_roles (
    business_id UUID NOT NULL REFERENCES businesses (id) ON DELETE CASCADE,
    role_type business_role_type NOT NULL,
    PRIMARY KEY (business_id, role_type)
);

CREATE TABLE industries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id TEXT NOT NULL,
    group_label TEXT NOT NULL,
    industry_label TEXT NOT NULL,
    UNIQUE (group_id, industry_label)
);

CREATE TABLE business_industries (
    business_id UUID NOT NULL REFERENCES businesses (id) ON DELETE CASCADE,
    industry_id UUID NOT NULL REFERENCES industries (id) ON DELETE CASCADE,
    PRIMARY KEY (business_id, industry_id)
);

CREATE TABLE swap_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses (id) ON DELETE CASCADE,
    location TEXT,
    status listing_status NOT NULL DEFAULT 'draft',
    expires_at TIMESTAMPTZ,
    relevant_count INTEGER NOT NULL DEFAULT 0,
    interested_count INTEGER NOT NULL DEFAULT 0,
    connected_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_swap_listings_business_id ON swap_listings (business_id);
CREATE INDEX idx_swap_listings_status ON swap_listings (status);

-- One row per role (offering/seeking); embedding included now so swap
-- matching can move server-side later without another migration.
CREATE TABLE swap_listing_assets (
    listing_id UUID NOT NULL REFERENCES swap_listings (id) ON DELETE CASCADE,
    role swap_asset_role NOT NULL,
    category TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    quantity TEXT,
    embedding vector (384),
    PRIMARY KEY (listing_id, role)
);

CREATE TABLE swap_matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kind swap_match_kind NOT NULL,
    quality swap_match_quality NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE swap_match_members (
    match_id UUID NOT NULL REFERENCES swap_matches (id) ON DELETE CASCADE,
    listing_id UUID NOT NULL REFERENCES swap_listings (id) ON DELETE CASCADE,
    "position" INTEGER NOT NULL,
    PRIMARY KEY (match_id, listing_id)
);

CREATE TABLE enquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_business_id UUID NOT NULL REFERENCES businesses (id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    location TEXT,
    needed_by TEXT,
    quantity TEXT,
    budget TEXT,
    fit_note TEXT,
    status listing_status NOT NULL DEFAULT 'draft',
    expires_at TIMESTAMPTZ,
    relevant_count INTEGER NOT NULL DEFAULT 0,
    interested_count INTEGER NOT NULL DEFAULT 0,
    connected_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_enquiries_buyer_business_id ON enquiries (buyer_business_id);
CREATE INDEX idx_enquiries_status ON enquiries (status);
