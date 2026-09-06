DROP TABLE IF EXISTS enquiries;
DROP TABLE IF EXISTS swap_match_members;
DROP TABLE IF EXISTS swap_matches;
DROP TABLE IF EXISTS swap_listing_assets;
DROP TABLE IF EXISTS swap_listings;
DROP TABLE IF EXISTS business_industries;
DROP TABLE IF EXISTS industries;
DROP TABLE IF EXISTS business_roles;
DROP TABLE IF EXISTS businesses;
DROP TABLE IF EXISTS users;

DROP TYPE IF EXISTS swap_match_quality;
DROP TYPE IF EXISTS swap_match_kind;
DROP TYPE IF EXISTS swap_asset_role;
DROP TYPE IF EXISTS listing_status;
DROP TYPE IF EXISTS business_role_type;
DROP TYPE IF EXISTS accepts_orders_from_t;
DROP TYPE IF EXISTS verification_status;

DROP EXTENSION IF EXISTS vector;
DROP EXTENSION IF EXISTS pgcrypto;
