-- Binder is not India-only. Two India assumptions were baked into the schema:
-- there was no country at all, and the business registration number column was
-- named for one country's tax regime (GSTIN). A UAE business has a TRN issued
-- by the FTA; other countries have their own. The number is the same *kind* of
-- fact everywhere -- "the id this business trades under" -- so it becomes one
-- generic column, with a companion column naming which registry it came from.

ALTER TABLE businesses ADD COLUMN country_code CHAR(2) NOT NULL DEFAULT 'IN';
ALTER TABLE businesses ADD COLUMN tax_id_kind TEXT;
ALTER TABLE businesses RENAME COLUMN gstin TO tax_id;

-- Every row that predates this migration is an Indian business with a GSTIN.
UPDATE businesses SET tax_id_kind = 'GSTIN' WHERE tax_id IS NOT NULL;

-- A tax id without its registry is unreadable; the pair travels together.
ALTER TABLE businesses ADD CONSTRAINT businesses_tax_id_kind_present
    CHECK (tax_id IS NULL OR tax_id_kind IS NOT NULL);

-- Matching and directory browsing are country-scoped: a Kanpur supplier is not
-- a result for a Dubai buyer, so country leads the index on city.
DROP INDEX idx_businesses_city;
CREATE INDEX idx_businesses_country_city ON businesses (country_code, city);
