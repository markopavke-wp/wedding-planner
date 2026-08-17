-- Roditelji mladenaca imaju svoje grupe gostiju, ali se u analitici rasporeda
-- i dalje računaju uz odgovarajuću mladinu/mladoženjinu stranu.
ALTER TYPE public.guest_side
  ADD VALUE IF NOT EXISTS 'bride_parents' AFTER 'bride';

ALTER TYPE public.guest_side
  ADD VALUE IF NOT EXISTS 'groom_parents' AFTER 'groom';
