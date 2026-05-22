-- PRIME Ops Platform seed data.
-- Loaded by `supabase db reset` (local) or run manually against the dev project.
-- Idempotent via ON CONFLICT clauses keyed on natural unique columns.

-- =========================================================
-- 1. Properties (18 spaces from Spec Section 7.1)
-- =========================================================
insert into public.properties (name, address, postcode, tier, status) values
  ('Greek St',             '59 Greek St',           'W1D 3DZ', 'prime', 'active'),
  ('D''arblay',            '19 D''Arblay St',       'W1F 8DR', 'prime', 'active'),
  ('Hay Hill',             '14a Hay Hill',          'W1J 8NZ', 'prime', 'active'),
  ('Paddington',           '3 Paddington St',       'W1U 5QD', 'prime', 'active'),
  ('Monmouth',             '6 Monmouth St',         'WC2H 9HB','prime', 'fit_out'),
  ('Retro Studio',         '228 Brick Lane',         null,     'other', 'active'),
  ('Corner Space',         '123 Bethnal Green Rd',   null,     'other', 'active'),
  ('Black Box',            '3 Bateman St',           null,     'other', 'active'),
  ('Black Brick Shop',     '11a Kingsland Rd',       null,     'other', 'active'),
  ('Blue Vintage Shop',    '17b Kingsland Rd',       null,     'other', 'active'),
  ('Raw Glass Shop',       '259 Kingsland Rd',       null,     'other', 'active'),
  ('Gallery',              '15 Bateman St',          null,     'other', 'active'),
  ('Portobello 331',       '331 Portobello Rd',      null,     'other', 'active'),
  ('Portobello 281',       '281 Portobello Rd',      null,     'other', 'active'),
  ('Eastcastle',           '36 Eastcastle St',       null,     'other', 'active'),
  ('Kensington Park Rd',   '19 Kensington Park Rd',  null,     'other', 'active'),
  ('Sidings Ground',       'The Sidings, Waterloo',  null,     'other', 'active'),
  ('Sidings Underground',  'The Sidings, Waterloo',  null,     'other', 'active')
on conflict (name) do update set
  address = excluded.address,
  postcode = excluded.postcode,
  tier = excluded.tier,
  status = excluded.status;

-- =========================================================
-- 2. Vendors (12 vendors from Spec Section 7.3)
-- =========================================================
insert into public.vendors (name, trade, is_approved) values
  ('FORMD',                  'signage',     true),
  ('ASCOT',                  'signage',     true),
  ('FirstDisplay',           'signage',     true),
  ('UK Sign Shop',           'signage',     true),
  ('One Four Design',        'signage',     true),
  ('Brunel Engraving',       'signage',     true),
  ('Complete Blind Service', 'blinds',      true),
  ('Adams Blinds',           'blinds',      true),
  ('Luxe Blinds',            'blinds',      true),
  ('TSI Security',           'security',    true),
  ('EDF',                    'electrical',  true),
  ('Water2Business',         'general',     true)
on conflict (name) do update set
  trade = excluded.trade,
  is_approved = excluded.is_approved;

-- =========================================================
-- 3. Brand Host Rates (Spec Section 7.2)
--
-- Section 3 of the spec defines 11 tables, none of which is a rates table.
-- Rates are applied at shift creation time and stored on shifts.rate_pence.
-- The canonical source for these constants lives in lib/rates.ts; this block
-- exists so a DBA reading seed.sql understands the rate model.
--
--   Weekday shift          1700 pence per hour
--   Weekend shift          2000 pence per hour
--   Converted viewing      3500 pence per hour
--   Travel allowance       1050 pence per shift
--   Double rate escalate   2x standard
--   Referral bonus         2000 pence after 5 referred shifts
-- =========================================================
