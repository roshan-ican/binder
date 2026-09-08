DROP INDEX idx_businesses_country_city;
CREATE INDEX idx_businesses_city ON businesses (city);

ALTER TABLE businesses DROP CONSTRAINT businesses_tax_id_kind_present;

-- Only Indian GSTINs fit the column this reverts to; anything else would be
-- silently mislabelled, so drop non-Indian registration numbers on the way down.
UPDATE businesses SET tax_id = NULL WHERE tax_id_kind IS DISTINCT FROM 'GSTIN';

ALTER TABLE businesses RENAME COLUMN tax_id TO gstin;
ALTER TABLE businesses DROP COLUMN tax_id_kind;
ALTER TABLE businesses DROP COLUMN country_code;
