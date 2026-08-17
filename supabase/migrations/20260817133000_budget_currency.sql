-- Valuta unosa za stavke budžeta. Iznosi u kolonama ostaju u RSD;
-- currency pamti da li je korisnik uneo vrednost u evrima ili dinarima.
CREATE TYPE public.budget_currency AS ENUM ('eur', 'rsd');

ALTER TABLE public.budget_items
  ADD COLUMN IF NOT EXISTS currency public.budget_currency NOT NULL DEFAULT 'rsd';

COMMENT ON COLUMN public.budget_items.currency IS
  'Valuta u kojoj je korisnik uneo iznose; planned/actual/paid/deposit se čuvaju u RSD (1 EUR = 118 RSD).';
