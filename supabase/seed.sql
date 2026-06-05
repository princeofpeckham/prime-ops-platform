-- PRIME Ops Platform seed data.
-- Loaded by `supabase db reset` (local) or run manually against the dev project.
-- Idempotent via ON CONFLICT clauses keyed on natural unique columns.
-- Runs after migrations, so org_id (NOT NULL since the multi tenancy migration)
-- must be set. Everything here belongs to the Appear Here org.

-- =========================================================
-- 0. Appear Here organization (matches migration 20260605120001)
-- =========================================================
insert into public.organizations (id, name, slug)
values ('a0000000-0000-4000-8000-000000000001', 'Appear Here', 'appear-here')
on conflict (id) do nothing;

-- =========================================================
-- 1. Properties (18 spaces from Spec Section 7.1)
-- =========================================================
insert into public.properties (org_id, name, address, postcode, tier, status) values
  ('a0000000-0000-4000-8000-000000000001', 'Greek St',             '59 Greek St',           'W1D 3DZ', 'prime', 'active'),
  ('a0000000-0000-4000-8000-000000000001', 'D''arblay',            '19 D''Arblay St',       'W1F 8DR', 'prime', 'active'),
  ('a0000000-0000-4000-8000-000000000001', 'Hay Hill',             '14a Hay Hill',          'W1J 8NZ', 'prime', 'active'),
  ('a0000000-0000-4000-8000-000000000001', 'Paddington',           '3 Paddington St',       'W1U 5QD', 'prime', 'active'),
  ('a0000000-0000-4000-8000-000000000001', 'Monmouth',             '6 Monmouth St',         'WC2H 9HB','prime', 'fit_out'),
  ('a0000000-0000-4000-8000-000000000001', 'Retro Studio',         '228 Brick Lane',         null,     'other', 'active'),
  ('a0000000-0000-4000-8000-000000000001', 'Corner Space',         '123 Bethnal Green Rd',   null,     'other', 'active'),
  ('a0000000-0000-4000-8000-000000000001', 'Black Box',            '3 Bateman St',           null,     'other', 'active'),
  ('a0000000-0000-4000-8000-000000000001', 'Black Brick Shop',     '11a Kingsland Rd',       null,     'other', 'active'),
  ('a0000000-0000-4000-8000-000000000001', 'Blue Vintage Shop',    '17b Kingsland Rd',       null,     'other', 'active'),
  ('a0000000-0000-4000-8000-000000000001', 'Raw Glass Shop',       '259 Kingsland Rd',       null,     'other', 'active'),
  ('a0000000-0000-4000-8000-000000000001', 'Gallery',              '15 Bateman St',          null,     'other', 'active'),
  ('a0000000-0000-4000-8000-000000000001', 'Portobello 331',       '331 Portobello Rd',      null,     'other', 'active'),
  ('a0000000-0000-4000-8000-000000000001', 'Portobello 281',       '281 Portobello Rd',      null,     'other', 'active'),
  ('a0000000-0000-4000-8000-000000000001', 'Eastcastle',           '36 Eastcastle St',       null,     'other', 'active'),
  ('a0000000-0000-4000-8000-000000000001', 'Kensington Park Rd',   '19 Kensington Park Rd',  null,     'other', 'active'),
  ('a0000000-0000-4000-8000-000000000001', 'Sidings Ground',       'The Sidings, Waterloo',  null,     'other', 'active'),
  ('a0000000-0000-4000-8000-000000000001', 'Sidings Underground',  'The Sidings, Waterloo',  null,     'other', 'active')
on conflict (name) do update set
  org_id = excluded.org_id,
  address = excluded.address,
  postcode = excluded.postcode,
  tier = excluded.tier,
  status = excluded.status;

-- =========================================================
-- 2. Vendors (12 vendors from Spec Section 7.3)
-- =========================================================
insert into public.vendors (org_id, name, trade, is_approved) values
  ('a0000000-0000-4000-8000-000000000001', 'FORMD',                  'signage',     true),
  ('a0000000-0000-4000-8000-000000000001', 'ASCOT',                  'signage',     true),
  ('a0000000-0000-4000-8000-000000000001', 'FirstDisplay',           'signage',     true),
  ('a0000000-0000-4000-8000-000000000001', 'UK Sign Shop',           'signage',     true),
  ('a0000000-0000-4000-8000-000000000001', 'One Four Design',        'signage',     true),
  ('a0000000-0000-4000-8000-000000000001', 'Brunel Engraving',       'signage',     true),
  ('a0000000-0000-4000-8000-000000000001', 'Complete Blind Service', 'blinds',      true),
  ('a0000000-0000-4000-8000-000000000001', 'Adams Blinds',           'blinds',      true),
  ('a0000000-0000-4000-8000-000000000001', 'Luxe Blinds',            'blinds',      true),
  ('a0000000-0000-4000-8000-000000000001', 'TSI Security',           'security',    true),
  ('a0000000-0000-4000-8000-000000000001', 'EDF',                    'electrical',  true),
  ('a0000000-0000-4000-8000-000000000001', 'Water2Business',         'general',     true)
on conflict (name) do update set
  org_id = excluded.org_id,
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
