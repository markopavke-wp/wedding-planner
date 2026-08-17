# Wedding Planner

Privatna full-stack aplikacija za planiranje jedne svadbe (gosti, seating, budžet, taskovi, vendori, timeline, beleške).

Stack: **Next.js (App Router)**, **React**, **TypeScript**, **Tailwind CSS**, **Supabase** (PostgreSQL + Auth + RLS), deploy na **Vercel**.

---

## 1. Preduslovi

- Node.js 20+ (preporučeno LTS)
- npm
- Nalog na [Supabase](https://supabase.com)
- (Opciono) [Supabase CLI](https://supabase.com/docs/guides/cli) za lokalne migracije
- (Opciono) nalog na [Vercel](https://vercel.com) i [GitHub](https://github.com)

Provera verzija:

```bash
node -v
npm -v
```

---

## 2. Instalacija zavisnosti

```bash
cd wedding-planner
npm install
```

---

## 3. Kreiranje Supabase projekta

1. Idi na [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. **New project** → unesi ime, lozinku baze, region
3. Sačekaj da se projekat podigne
4. Otvori **Project Settings → API** i sačuvaj:
   - **Project URL**
   - **anon public** ključ
   - (samo za admin skripte) **service_role** ključ — **nikada** ga ne stavljaj u frontend niti u git

---

## 4. Environment promenljive

Kopiraj primer:

```bash
cp .env.example .env.local
```

Popuni `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

| Promenljiva | Gde se koristi | Napomena |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Browser + server | Javni URL projekta |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser + server | Anon ključ; RLS štiti podatke |
| `SUPABASE_SERVICE_ROLE_KEY` | Samo opciono, server/admin | Zaobilazi RLS — ne izlagati |

---

## 5. Pokretanje SQL migracija

Migracije su u `supabase/migrations/`.

### Opcija A — Supabase Dashboard (SQL Editor)

1. Otvori **SQL Editor** u Supabase projektu
2. Nalepi sadržaj fajla:

```text
supabase/migrations/20260817120000_initial_schema.sql
```

3. Pokreni (**Run**)

### Opcija B — Supabase CLI (remote)

Prijavi se i poveži projekat:

```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
```

Primeni migracije:

```bash
npx supabase db push
```

### Opcija C — lokalni Supabase

```bash
npx supabase start
npx supabase db reset
```

`db reset` pokreće migracije i seed (vidi `supabase/config.toml`).

---

## 6. Kreiranje 4 korisnika (bez javne registracije)

Aplikacija **nema** Sign Up. Korisnike kreiraš ručno:

1. Supabase Dashboard → **Authentication → Users → Add user**
2. Za svakog korisnika unesi email i lozinku
3. Ponovi za **4** korisnika

Pri kreaciji, trigger `on_auth_user_created` automatski upisuje red u `public.profiles`.

Opciono, postavi ime i ulogu preko metadata pri kreaciji (npr. u Admin API) ili update-om:

```sql
UPDATE public.profiles
SET full_name = 'Petra Jovanović', role = 'admin'
WHERE email = 'petra@example.com';

UPDATE public.profiles
SET full_name = 'Marko Nikolić', role = 'admin'
WHERE email = 'marko@example.com';

UPDATE public.profiles
SET full_name = 'Ana Jovanović', role = 'editor'
WHERE email = 'ana@example.com';

UPDATE public.profiles
SET full_name = 'Stefan Nikolić', role = 'editor'
WHERE email = 'stefan@example.com';
```

Uloge: `admin` | `editor` (za sada svi authenticated korisnici mogu da uređuju podatke preko RLS).

---

## 7. Isključivanje Sign Up-a

U Supabase Dashboard:

1. **Authentication → Providers → Email**
2. Isključi **Enable sign ups** (ili ekvivalent: zabrani nove registracije)
3. Ostavi Email/Password login uključen

Za lokalni CLI, u `supabase/config.toml` već stoji:

```toml
[auth]
enable_signup = false

[auth.email]
enable_signup = false
```

Na produkciji obavezno uradi isto u Dashboard-u.

---

## 8. Seed (demo podaci)

Seed fajl: `supabase/seed.sql`

Sadrži:

- 1 svadbu (**Petra & Marko**)
- ~30 gostiju (bride/groom, confirmed/pending/declined)
- 7 stolova (uključujući **head table**)
- budžet stavke
- 10 taskova
- vendore
- timeline stavke
- beleške

**Ne** seeduje `profiles` / auth korisnike. Radi bez poznatih auth UUID-jeva (`notes.created_by` i `tasks.assigned_to` su `NULL`).

### Dashboard

1. Otvori **SQL Editor**
2. Nalepi `supabase/seed.sql`
3. **Run**

### CLI (lokalno)

```bash
npx supabase db reset
```

### CLI (remote SQL)

```bash
npx supabase db query -f supabase/seed.sql --linked
```

ili:

```bash
psql "$DATABASE_URL" -f supabase/seed.sql
```

---

## 9. Lokalno pokretanje aplikacije

```bash
npm run dev
```

Otvori [http://localhost:3000](http://localhost:3000).

Prijava: `/login` sa jednim od 4 ručno kreirana korisnika.

Ostale korisne komande:

```bash
npm run lint
npm run build
npm run start
```

---

## 10. Povezivanje sa GitHub-om

```bash
git init
git add .
git commit -m "Initial wedding planner setup"
git branch -M main
git remote add origin https://github.com/YOUR_USER/wedding-planner.git
git push -u origin main
```

Nemoj commitovati `.env.local` (već je u `.gitignore`). `.env.example` jeste bezbedan za git.

---

## 11. Deploy na Vercel

1. Idi na [https://vercel.com/new](https://vercel.com/new)
2. Importuj GitHub repo `wedding-planner`
3. Framework: **Next.js**
4. Dodaj Environment Variables (Production + Preview):

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

5. Deploy

Nakon deploy-a:

1. U Supabase **Authentication → URL Configuration** dodaj Vercel URL u **Site URL** i **Redirect URLs**, npr.:

```text
https://your-app.vercel.app
https://your-app.vercel.app/**
```

2. Potvrdi da su migracije i seed (ako želiš demo) primenjeni na **produkcijski** Supabase projekat
3. Kreiraj 4 korisnika i isključi signup i na produkciji

CLI alternativa:

```bash
npx vercel
npx vercel --prod
```

---

## Struktura baze (pregled)

| Tabela | Opis |
| --- | --- |
| `profiles` | Profili vezani za `auth.users` |
| `wedding` | Jedna svadba |
| `guests` | Gosti + RSVP + seating veza |
| `tables` | Stolovi / plan sale |
| `tasks` | Taskovi |
| `budget_items` | Budžet stavke |
| `vendors` | Dobavljači |
| `timeline_items` | Timeline događaji |
| `notes` | Beleške |

RLS: sve tabele zahtevaju **authenticated** role. Anon pristup nema SELECT/INSERT/UPDATE/DELETE.

Fajlovi:

```text
supabase/migrations/20260817120000_initial_schema.sql
supabase/seed.sql
supabase/config.toml
.env.example
```

---

## Bezbednost (kratko)

- Nema javne registracije
- Middleware štiti privatne rute (aplikacioni sloj)
- RLS blokira anon API pristup
- Service role ključ nikada u browseru
- Tajne samo u `.env.local` / Vercel env

---

## Ručni checklist posle kloniranja

1. `npm install`
2. Kreirati Supabase projekat
3. Popuniti `.env.local`
4. Pokrenuti migraciju
5. Isključiti signup
6. Kreirati 4 korisnika
7. Pokrenuti seed
8. `npm run dev`
9. (Opciono) povezati GitHub + Vercel
