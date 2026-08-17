-- Raspored sale prema originalnom planu (18 stolova + glavni, dečiji/muzički i sweet table)
-- Koordinatni sistem platna: 40px = 1m (vidi components/seating/geometry.ts)
-- Sala je u pejzažnoj orijentaciji, ~42 x 24 m, kao na skici.

BEGIN;

DELETE FROM public.tables
WHERE wedding_id = 'a0000000-0000-4000-8000-000000000001';

INSERT INTO public.tables (
  wedding_id, name, capacity, shape,
  position_x, position_y, width, height, rotation, side, notes
) VALUES
  -- Gornji red uz binu (bina je između stola 15 i 16)
  ('a0000000-0000-4000-8000-000000000001', 'Sto 14', 14, 'rectangular',  250,  40, 112, 172,   0, NULL, '8-14 mesta'),
  ('a0000000-0000-4000-8000-000000000001', 'Sto 15', 12, 'round',        520,  50, 150, 150,   0, NULL, '10-12 mesta'),
  ('a0000000-0000-4000-8000-000000000001', 'Sto 16', 12, 'round',       1180,  50, 150, 150,   0, NULL, '10-12 mesta'),
  ('a0000000-0000-4000-8000-000000000001', 'Dečiji / muzički sto', 8, 'rectangular', 1580, 45, 104, 156, 0, NULL, 'Dečiji i muzički sto, 8 mesta'),

  -- Drugi red
  ('a0000000-0000-4000-8000-000000000001', 'Sto 11', 12, 'round',        300, 280, 150, 150,   0, NULL, '10-12 mesta'),
  ('a0000000-0000-4000-8000-000000000001', 'Sto 12', 12, 'round',        520, 280, 150, 150,   0, NULL, '10-12 mesta'),
  ('a0000000-0000-4000-8000-000000000001', 'Sto 13', 12, 'round',       1180, 260, 150, 150,   0, NULL, '10-12 mesta'),

  -- Glavni sto uz desni zid
  ('a0000000-0000-4000-8000-000000000001', 'Glavni sto', 8, 'head_table',1600, 330, 112, 232,  0, 'mixed', '4-8 mesta, mladenci'),

  -- Dijagonalni stolovi 17 i 18
  ('a0000000-0000-4000-8000-000000000001', 'Sto 17', 8, 'rectangular',   460, 470, 112, 112, 330, NULL, '8 mesta'),
  ('a0000000-0000-4000-8000-000000000001', 'Sto 18', 8, 'rectangular',   650, 470, 112, 112, 330, NULL, '8 mesta'),

  -- Srednji red okruglih stolova
  ('a0000000-0000-4000-8000-000000000001', 'Sto 6',  12, 'round',        250, 620, 150, 150,   0, NULL, '10-12 mesta'),
  ('a0000000-0000-4000-8000-000000000001', 'Sto 7',  12, 'round',        440, 620, 150, 150,   0, NULL, '10-12 mesta'),
  ('a0000000-0000-4000-8000-000000000001', 'Sto 8',  12, 'round',        630, 620, 150, 150,   0, NULL, '10-12 mesta'),
  ('a0000000-0000-4000-8000-000000000001', 'Sto 9',  12, 'round',        900, 620, 150, 150,   0, NULL, '10-12 mesta'),
  ('a0000000-0000-4000-8000-000000000001', 'Sto 10', 12, 'round',       1090, 620, 150, 150,   0, NULL, '10-12 mesta'),

  -- Donji red pravougaonih stolova
  ('a0000000-0000-4000-8000-000000000001', 'Sto 1',  12, 'rectangular',  250, 830, 112, 172,   0, NULL, '8-12 mesta'),
  ('a0000000-0000-4000-8000-000000000001', 'Sto 2',  14, 'rectangular',  440, 830, 112, 172,   0, NULL, '8-14 mesta'),
  ('a0000000-0000-4000-8000-000000000001', 'Sto 3',  14, 'rectangular',  630, 830, 112, 172,   0, NULL, '8-14 mesta'),
  ('a0000000-0000-4000-8000-000000000001', 'Sto 4',  14, 'rectangular',  900, 830, 112, 172,   0, NULL, '8-14 mesta'),
  ('a0000000-0000-4000-8000-000000000001', 'Sto 5',  12, 'rectangular', 1090, 830, 112, 172,   0, NULL, '8-12 mesta'),

  -- Sweet table (servisni sto, nije za sedenje)
  ('a0000000-0000-4000-8000-000000000001', 'Sweet table', 1, 'rectangular', 30, 880, 190, 72, 0, NULL, 'Servisni sto za kolače, nije za sedenje');

COMMIT;
