-- Demo seed za Wedding Planner
-- Ne seeduje profiles / auth korisnike.
-- notes.created_by i tasks.assigned_to ostaju NULL.

BEGIN;

-- Fiksni UUID-jevi (samo za wedding podatke, ne auth)
-- wedding: a0000000-0000-4000-8000-000000000001

DELETE FROM public.notes;
DELETE FROM public.timeline_items;
DELETE FROM public.budget_items;
DELETE FROM public.tasks;
DELETE FROM public.guests;
DELETE FROM public.tables;
DELETE FROM public.vendors;
DELETE FROM public.wedding;

INSERT INTO public.wedding (
  id,
  title,
  wedding_date,
  venue,
  city,
  planned_budget,
  notes
) VALUES (
  'a0000000-0000-4000-8000-000000000001',
  'Petra & Marko',
  '2027-06-05',
  'Sala Belvedere',
  'Beograd',
  2500000.00,
  'Demo svadba za lokalni razvoj i testiranje.'
);

-- Vendors
INSERT INTO public.vendors (
  id, wedding_id, category, company_name, contact_person, phone, email,
  instagram, website, agreed_price, deposit, remaining_amount,
  payment_due_date, status, notes
) VALUES
  (
    'b0000000-0000-4000-8000-000000000001',
    'a0000000-0000-4000-8000-000000000001',
    'Venue', 'Sala Belvedere', 'Jelena Nikolić', '+381641112233',
    'info@belvedere.rs', '@salabelvedere', 'https://belvedere.rs',
    900000, 300000, 600000, '2027-05-01', 'confirmed',
    'Uključena dekoracija sale i meni za 80 gostiju.'
  ),
  (
    'b0000000-0000-4000-8000-000000000002',
    'a0000000-0000-4000-8000-000000000001',
    'Photographer', 'Studio Svetlost', 'Ivan Ristić', '+381601234567',
    'ivan@svetlost.rs', '@studiosvetlost', 'https://svetlost.rs',
    180000, 60000, 120000, '2027-05-20', 'deposit_paid',
    'Pun dan + album.'
  ),
  (
    'b0000000-0000-4000-8000-000000000003',
    'a0000000-0000-4000-8000-000000000001',
    'Videographer', 'Film Moments', 'Ana Đukić', '+381655554433',
    'ana@filmmoments.rs', '@filmmoments', NULL,
    150000, 50000, 100000, '2027-05-20', 'deposit_paid', NULL
  ),
  (
    'b0000000-0000-4000-8000-000000000004',
    'a0000000-0000-4000-8000-000000000001',
    'Band', 'Orkestar Harmonia', 'Miloš Jovanović', '+381637778899',
    'booking@harmonia.rs', '@orkestarharmonia', NULL,
    220000, 70000, 150000, '2027-04-15', 'confirmed',
    '4 sata svirke + ceremonija.'
  ),
  (
    'b0000000-0000-4000-8000-000000000005',
    'a0000000-0000-4000-8000-000000000001',
    'Flowers', 'Cvećara Magnolija', 'Sara Petrović', '+381621112244',
    'sara@magnolija.rs', '@cvecaramagnolija', NULL,
    95000, 30000, 65000, '2027-05-25', 'planned', NULL
  ),
  (
    'b0000000-0000-4000-8000-000000000006',
    'a0000000-0000-4000-8000-000000000001',
    'Cake', 'Poslastičarnica Med', 'Tamara Ilić', '+381648889900',
    'info@med.rs', '@poslasticarnicamed', NULL,
    45000, 15000, 30000, '2027-05-28', 'deposit_paid',
    'Torta za 80 osoba, 3 kata.'
  );

-- 7 stolova (1 head table + 6 gostiju)
INSERT INTO public.tables (
  id, wedding_id, name, capacity, shape,
  position_x, position_y, width, height, rotation, side, notes
) VALUES
  (
    'c0000000-0000-4000-8000-000000000001',
    'a0000000-0000-4000-8000-000000000001',
    'Glavni sto', 8, 'head_table',
    400, 80, 320, 80, 0, 'mixed', 'Mladenci i kumovi'
  ),
  (
    'c0000000-0000-4000-8000-000000000002',
    'a0000000-0000-4000-8000-000000000001',
    'Sto 1', 8, 'round',
    160, 280, 140, 140, 0, 'bride', NULL
  ),
  (
    'c0000000-0000-4000-8000-000000000003',
    'a0000000-0000-4000-8000-000000000001',
    'Sto 2', 8, 'round',
    360, 280, 140, 140, 0, 'bride', NULL
  ),
  (
    'c0000000-0000-4000-8000-000000000004',
    'a0000000-0000-4000-8000-000000000001',
    'Sto 3', 10, 'rectangular',
    560, 280, 200, 100, 0, 'groom', NULL
  ),
  (
    'c0000000-0000-4000-8000-000000000005',
    'a0000000-0000-4000-8000-000000000001',
    'Sto 4', 8, 'round',
    160, 480, 140, 140, 0, 'groom', NULL
  ),
  (
    'c0000000-0000-4000-8000-000000000006',
    'a0000000-0000-4000-8000-000000000001',
    'Sto 5', 8, 'round',
    360, 480, 140, 140, 0, 'mixed', NULL
  ),
  (
    'c0000000-0000-4000-8000-000000000007',
    'a0000000-0000-4000-8000-000000000001',
    'Sto 6', 10, 'rectangular',
    560, 480, 200, 100, 15, 'groom', NULL
  );

-- ~30 gostiju
INSERT INTO public.guests (
  id, wedding_id, first_name, last_name, side, group_name,
  invitation_status, plus_one, plus_one_name, children_count,
  phone, notes, table_id, seat_number
) VALUES
  -- Glavni sto
  ('d0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'Petra', 'Jovanović', 'bride', 'family', 'confirmed', false, NULL, 0, '+381641000001', 'Mlada', 'c0000000-0000-4000-8000-000000000001', 1),
  ('d0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000001', 'Marko', 'Nikolić', 'groom', 'family', 'confirmed', false, NULL, 0, '+381641000002', 'Mladoženja', 'c0000000-0000-4000-8000-000000000001', 2),
  ('d0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000001', 'Ana', 'Jovanović', 'bride', 'family', 'confirmed', false, NULL, 0, '+381641000003', 'Kuma', 'c0000000-0000-4000-8000-000000000001', 3),
  ('d0000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000001', 'Stefan', 'Nikolić', 'groom', 'family', 'confirmed', false, NULL, 0, '+381641000004', 'Kum', 'c0000000-0000-4000-8000-000000000001', 4),
  ('d0000000-0000-4000-8000-000000000005', 'a0000000-0000-4000-8000-000000000001', 'Milica', 'Jovanović', 'bride', 'family', 'confirmed', true, 'Dragan Jovanović', 0, '+381641000005', 'Majka mlade', 'c0000000-0000-4000-8000-000000000001', 5),
  ('d0000000-0000-4000-8000-000000000006', 'a0000000-0000-4000-8000-000000000001', 'Dragan', 'Jovanović', 'bride', 'family', 'confirmed', false, NULL, 0, '+381641000006', 'Otac mlade', 'c0000000-0000-4000-8000-000000000001', 6),

  -- Sto 1 (bride)
  ('d0000000-0000-4000-8000-000000000007', 'a0000000-0000-4000-8000-000000000001', 'Ivana', 'Petrović', 'bride', 'friends', 'confirmed', true, 'Nenad Petrović', 0, '+381641000007', NULL, 'c0000000-0000-4000-8000-000000000002', 1),
  ('d0000000-0000-4000-8000-000000000008', 'a0000000-0000-4000-8000-000000000001', 'Nenad', 'Petrović', 'bride', 'friends', 'confirmed', false, NULL, 0, '+381641000008', NULL, 'c0000000-0000-4000-8000-000000000002', 2),
  ('d0000000-0000-4000-8000-000000000009', 'a0000000-0000-4000-8000-000000000001', 'Jelena', 'Stanković', 'bride', 'friends', 'confirmed', false, NULL, 0, '+381641000009', NULL, 'c0000000-0000-4000-8000-000000000002', 3),
  ('d0000000-0000-4000-8000-000000000010', 'a0000000-0000-4000-8000-000000000001', 'Marija', 'Đorđević', 'bride', 'work', 'pending', false, NULL, 0, '+381641000010', NULL, 'c0000000-0000-4000-8000-000000000002', 4),

  -- Sto 2 (bride)
  ('d0000000-0000-4000-8000-000000000011', 'a0000000-0000-4000-8000-000000000001', 'Katarina', 'Ilić', 'bride', 'family', 'confirmed', true, 'Luka Ilić', 1, '+381641000011', NULL, 'c0000000-0000-4000-8000-000000000003', 1),
  ('d0000000-0000-4000-8000-000000000012', 'a0000000-0000-4000-8000-000000000001', 'Luka', 'Ilić', 'bride', 'family', 'confirmed', false, NULL, 0, '+381641000012', NULL, 'c0000000-0000-4000-8000-000000000003', 2),
  ('d0000000-0000-4000-8000-000000000013', 'a0000000-0000-4000-8000-000000000001', 'Sofija', 'Mitić', 'bride', 'friends', 'confirmed', false, NULL, 0, '+381641000013', NULL, 'c0000000-0000-4000-8000-000000000003', 3),
  ('d0000000-0000-4000-8000-000000000014', 'a0000000-0000-4000-8000-000000000001', 'Teodora', 'Pavlović', 'bride', 'other', 'pending', false, NULL, 0, '+381641000014', NULL, 'c0000000-0000-4000-8000-000000000003', 4),

  -- Sto 3 (groom)
  ('d0000000-0000-4000-8000-000000000015', 'a0000000-0000-4000-8000-000000000001', 'Nikola', 'Nikolić', 'groom', 'family', 'confirmed', true, 'Sanja Nikolić', 0, '+381641000015', 'Brat mladoženje', 'c0000000-0000-4000-8000-000000000004', 1),
  ('d0000000-0000-4000-8000-000000000016', 'a0000000-0000-4000-8000-000000000001', 'Sanja', 'Nikolić', 'groom', 'family', 'confirmed', false, NULL, 0, '+381641000016', NULL, 'c0000000-0000-4000-8000-000000000004', 2),
  ('d0000000-0000-4000-8000-000000000017', 'a0000000-0000-4000-8000-000000000001', 'Vladimir', 'Nikolić', 'groom', 'family', 'confirmed', false, NULL, 0, '+381641000017', 'Otac mladoženje', 'c0000000-0000-4000-8000-000000000004', 3),
  ('d0000000-0000-4000-8000-000000000018', 'a0000000-0000-4000-8000-000000000001', 'Vesna', 'Nikolić', 'groom', 'family', 'confirmed', false, NULL, 0, '+381641000018', 'Majka mladoženje', 'c0000000-0000-4000-8000-000000000004', 4),
  ('d0000000-0000-4000-8000-000000000019', 'a0000000-0000-4000-8000-000000000001', 'Aleksandar', 'Tomić', 'groom', 'friends', 'confirmed', false, NULL, 0, '+381641000019', NULL, 'c0000000-0000-4000-8000-000000000004', 5),

  -- Sto 4 (groom)
  ('d0000000-0000-4000-8000-000000000020', 'a0000000-0000-4000-8000-000000000001', 'Dušan', 'Marković', 'groom', 'friends', 'confirmed', true, 'Irena Marković', 0, '+381641000020', NULL, 'c0000000-0000-4000-8000-000000000005', 1),
  ('d0000000-0000-4000-8000-000000000021', 'a0000000-0000-4000-8000-000000000001', 'Irena', 'Marković', 'groom', 'friends', 'confirmed', false, NULL, 0, '+381641000021', NULL, 'c0000000-0000-4000-8000-000000000005', 2),
  ('d0000000-0000-4000-8000-000000000022', 'a0000000-0000-4000-8000-000000000001', 'Goran', 'Savić', 'groom', 'work', 'pending', false, NULL, 0, '+381641000022', NULL, 'c0000000-0000-4000-8000-000000000005', 3),

  -- Sto 5 (mixed)
  ('d0000000-0000-4000-8000-000000000023', 'a0000000-0000-4000-8000-000000000001', 'Bojana', 'Ristić', 'bride', 'friends', 'confirmed', false, NULL, 0, '+381641000023', NULL, 'c0000000-0000-4000-8000-000000000006', 1),
  ('d0000000-0000-4000-8000-000000000024', 'a0000000-0000-4000-8000-000000000001', 'Filip', 'Janković', 'groom', 'friends', 'confirmed', false, NULL, 0, '+381641000024', NULL, 'c0000000-0000-4000-8000-000000000006', 2),
  ('d0000000-0000-4000-8000-000000000025', 'a0000000-0000-4000-8000-000000000001', 'Nataša', 'Kovačević', 'bride', 'work', 'declined', false, NULL, 0, '+381641000025', 'Ne može da dođe', NULL, NULL),

  -- Neraspoređeni / razni statusi
  ('d0000000-0000-4000-8000-000000000026', 'a0000000-0000-4000-8000-000000000001', 'Milan', 'Đukić', 'groom', 'other', 'pending', false, NULL, 0, '+381641000026', NULL, NULL, NULL),
  ('d0000000-0000-4000-8000-000000000027', 'a0000000-0000-4000-8000-000000000001', 'Elena', 'Popović', 'bride', 'family', 'pending', true, NULL, 1, '+381641000027', 'Čeka potvrdu plus one', NULL, NULL),
  ('d0000000-0000-4000-8000-000000000028', 'a0000000-0000-4000-8000-000000000001', 'Uroš', 'Lazić', 'groom', 'friends', 'confirmed', false, NULL, 0, '+381641000028', NULL, NULL, NULL),
  ('d0000000-0000-4000-8000-000000000029', 'a0000000-0000-4000-8000-000000000001', 'Andjela', 'Simić', 'bride', 'friends', 'declined', false, NULL, 0, '+381641000029', NULL, NULL, NULL),
  ('d0000000-0000-4000-8000-000000000030', 'a0000000-0000-4000-8000-000000000001', 'Petar', 'Vasić', 'groom', 'work', 'confirmed', false, NULL, 0, '+381641000030', NULL, 'c0000000-0000-4000-8000-000000000007', 1);

-- Budget stavke
INSERT INTO public.budget_items (
  id, wedding_id, category, description, planned_amount, actual_amount,
  paid_amount, deposit_amount, due_date, status, vendor_id, notes
) VALUES
  ('e0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'venue', 'Iznajmljivanje sale i meni', 900000, 900000, 300000, 300000, '2027-05-01', 'deposit_paid', 'b0000000-0000-4000-8000-000000000001', NULL),
  ('e0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000001', 'photography', 'Fotografisanje celog dana', 180000, 180000, 60000, 60000, '2027-05-20', 'deposit_paid', 'b0000000-0000-4000-8000-000000000002', NULL),
  ('e0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000001', 'video', 'Video produkcija', 150000, 150000, 50000, 50000, '2027-05-20', 'deposit_paid', 'b0000000-0000-4000-8000-000000000003', NULL),
  ('e0000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000001', 'music', 'Orkestar', 220000, 220000, 70000, 70000, '2027-04-15', 'deposit_paid', 'b0000000-0000-4000-8000-000000000004', NULL),
  ('e0000000-0000-4000-8000-000000000005', 'a0000000-0000-4000-8000-000000000001', 'flowers', 'Buketi i dekoracija cveća', 100000, 95000, 30000, 30000, '2027-05-25', 'deposit_paid', 'b0000000-0000-4000-8000-000000000005', NULL),
  ('e0000000-0000-4000-8000-000000000006', 'a0000000-0000-4000-8000-000000000001', 'other', 'Torta', 50000, 45000, 15000, 15000, '2027-05-28', 'deposit_paid', 'b0000000-0000-4000-8000-000000000006', NULL),
  ('e0000000-0000-4000-8000-000000000007', 'a0000000-0000-4000-8000-000000000001', 'dress', 'Venčanica', 250000, 240000, 240000, 0, '2027-03-01', 'paid', NULL, NULL),
  ('e0000000-0000-4000-8000-000000000008', 'a0000000-0000-4000-8000-000000000001', 'suit', 'Odelo mladoženje', 80000, 78000, 78000, 0, '2027-03-10', 'paid', NULL, NULL),
  ('e0000000-0000-4000-8000-000000000009', 'a0000000-0000-4000-8000-000000000001', 'rings', 'Burme', 120000, 115000, 115000, 0, '2027-02-15', 'paid', NULL, NULL),
  ('e0000000-0000-4000-8000-000000000010', 'a0000000-0000-4000-8000-000000000001', 'invitations', 'Pozivnice i stationery', 40000, 0, 0, 0, '2027-04-01', 'planned', NULL, 'Još nije naručeno'),
  ('e0000000-0000-4000-8000-000000000011', 'a0000000-0000-4000-8000-000000000001', 'drinks', 'Dodatna pića i bar', 150000, 0, 0, 0, '2027-05-15', 'planned', NULL, NULL),
  ('e0000000-0000-4000-8000-000000000012', 'a0000000-0000-4000-8000-000000000001', 'decoration', 'Dodatna dekoracija sale', 70000, 0, 0, 0, '2027-05-10', 'planned', NULL, NULL);

-- 10 taskova
INSERT INTO public.tasks (
  id, wedding_id, title, description, category, deadline, priority, status, assigned_to
) VALUES
  ('f0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'Potvrditi meni sa salom', 'Finalni izbor predjela, glavnog i deserta.', 'venue', '2027-03-15', 'high', 'in_progress', NULL),
  ('f0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000001', 'Naručiti pozivnice', 'Dizajn i štampa za 80 gostiju.', 'invitations', '2027-04-01', 'medium', 'todo', NULL),
  ('f0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000001', 'Probati venčanicu', 'Završne izmene kroja.', 'dress', '2027-04-20', 'high', 'todo', NULL),
  ('f0000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000001', 'Zakazati frizera i šminku', 'Probni termin + dan svadbe.', 'beauty', '2027-03-01', 'medium', 'completed', NULL),
  ('f0000000-0000-4000-8000-000000000005', 'a0000000-0000-4000-8000-000000000001', 'Potvrditi playlist sa orkestrom', 'Lista obaveznih pesama i tempo.', 'music', '2027-05-01', 'medium', 'todo', NULL),
  ('f0000000-0000-4000-8000-000000000006', 'a0000000-0000-4000-8000-000000000001', 'Rasporediti goste po stolovima', 'Finalna seating lista.', 'seating', '2027-05-20', 'high', 'in_progress', NULL),
  ('f0000000-0000-4000-8000-000000000007', 'a0000000-0000-4000-8000-000000000001', 'Rezervisati smeštaj za goste', 'Hotel za 10 soba.', 'accommodation', '2027-04-10', 'low', 'todo', NULL),
  ('f0000000-0000-4000-8000-000000000008', 'a0000000-0000-4000-8000-000000000001', 'Kupiti poklone za kumove', NULL, 'gifts', '2027-05-15', 'low', 'todo', NULL),
  ('f0000000-0000-4000-8000-000000000009', 'a0000000-0000-4000-8000-000000000001', 'Potpisati ugovor sa fotografom', 'Proveriti paket i rokove isporuke.', 'photography', '2027-02-28', 'high', 'completed', NULL),
  ('f0000000-0000-4000-8000-000000000010', 'a0000000-0000-4000-8000-000000000001', 'Pripremiti timeline dana', 'Podeliti sa vendorima.', 'timeline', '2027-05-25', 'medium', 'todo', NULL);

-- Timeline
INSERT INTO public.timeline_items (
  id, wedding_id, title, description, event_date, event_time, category, completed
) VALUES
  ('aa000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'Frizer', 'Priprema frizure mlade', '2027-06-05', '09:00', 'beauty', false),
  ('aa000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000001', 'Šminka', 'Profesionalna šminka', '2027-06-05', '11:00', 'beauty', false),
  ('aa000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000001', 'Fotograf', 'Getting ready snimanje', '2027-06-05', '13:00', 'photography', false),
  ('aa000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000001', 'Okupljanje', 'Gosti kod crkve', '2027-06-05', '15:00', 'ceremony', false),
  ('aa000000-0000-4000-8000-000000000005', 'a0000000-0000-4000-8000-000000000001', 'Crkva', 'Venčanje', '2027-06-05', '16:00', 'ceremony', false),
  ('aa000000-0000-4000-8000-000000000006', 'a0000000-0000-4000-8000-000000000001', 'Fotografisanje', 'Fotografisanje vani', '2027-06-05', '17:00', 'photography', false),
  ('aa000000-0000-4000-8000-000000000007', 'a0000000-0000-4000-8000-000000000001', 'Sala', 'Dolazak gostiju u salu', '2027-06-05', '18:00', 'reception', false),
  ('aa000000-0000-4000-8000-000000000008', 'a0000000-0000-4000-8000-000000000001', 'Ulazak mladenaca', 'Svečani ulazak', '2027-06-05', '19:00', 'reception', false),
  ('aa000000-0000-4000-8000-000000000009', 'a0000000-0000-4000-8000-000000000001', 'Probni sastanak sa salom', 'Proba menija i rasporeda', '2027-05-20', '18:00', 'planning', false);

-- Beleške (bez created_by)
INSERT INTO public.notes (
  id, wedding_id, title, content, category, created_by
) VALUES
  (
    'ab000000-0000-4000-8000-000000000001',
    'a0000000-0000-4000-8000-000000000001',
    'Ideje za dekoraciju',
    'Neutralne boje, bele ruže, blage zlatne detalje. Bez previše balona.',
    'decoration',
    NULL
  ),
  (
    'ab000000-0000-4000-8000-000000000002',
    'a0000000-0000-4000-8000-000000000001',
    'Lista alergena',
    'Dvoje gostiju bez glutena, jedan vegan meni.',
    'food',
    NULL
  ),
  (
    'ab000000-0000-4000-8000-000000000003',
    'a0000000-0000-4000-8000-000000000001',
    'Parking',
    'Sala ima 40 mesta. Dogovoriti valet za starije goste.',
    'logistics',
    NULL
  ),
  (
    'ab000000-0000-4000-8000-000000000004',
    'a0000000-0000-4000-8000-000000000001',
    'Playlist must-have',
    'Prvi ples: Perfect – Ed Sheeran. Zatim folk set oko 22h.',
    'music',
    NULL
  );

COMMIT;
