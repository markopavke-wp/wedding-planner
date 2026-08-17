-- Wedding Planner: initial schema, RLS, triggers

-- Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enums
CREATE TYPE public.guest_side AS ENUM (
  'bride',
  'groom',
  'bride_parents',
  'groom_parents'
);
CREATE TYPE public.guest_group AS ENUM ('family', 'friends', 'work', 'other');
CREATE TYPE public.invitation_status AS ENUM ('pending', 'confirmed', 'declined');
CREATE TYPE public.table_shape AS ENUM ('round', 'rectangular', 'head_table');
CREATE TYPE public.table_side AS ENUM ('bride', 'groom', 'mixed');
CREATE TYPE public.task_priority AS ENUM ('low', 'medium', 'high');
CREATE TYPE public.task_status AS ENUM ('todo', 'in_progress', 'completed');
CREATE TYPE public.budget_status AS ENUM (
  'planned',
  'deposit_paid',
  'partially_paid',
  'paid'
);

-- Profiles (1:1 with auth.users)
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  full_name text,
  email text,
  role text NOT NULL DEFAULT 'editor' CHECK (role IN ('admin', 'editor')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Wedding (single wedding app scope)
CREATE TABLE public.wedding (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  wedding_date date NOT NULL,
  venue text,
  city text,
  planned_budget numeric(12, 2) NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Tables (seating)
CREATE TABLE public.tables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id uuid NOT NULL REFERENCES public.wedding (id) ON DELETE CASCADE,
  name text NOT NULL,
  capacity integer NOT NULL CHECK (capacity > 0),
  shape public.table_shape NOT NULL DEFAULT 'round',
  position_x numeric NOT NULL DEFAULT 0,
  position_y numeric NOT NULL DEFAULT 0,
  width numeric,
  height numeric,
  rotation numeric NOT NULL DEFAULT 0,
  side public.table_side,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Guests
CREATE TABLE public.guests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id uuid NOT NULL REFERENCES public.wedding (id) ON DELETE CASCADE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  side public.guest_side NOT NULL,
  group_name public.guest_group NOT NULL DEFAULT 'other',
  invitation_status public.invitation_status NOT NULL DEFAULT 'pending',
  plus_one boolean NOT NULL DEFAULT false,
  plus_one_name text,
  children_count integer NOT NULL DEFAULT 0 CHECK (children_count >= 0),
  phone text,
  notes text,
  table_id uuid REFERENCES public.tables (id) ON DELETE SET NULL,
  seat_number integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Vendors (before budget_items due to FK)
CREATE TABLE public.vendors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id uuid NOT NULL REFERENCES public.wedding (id) ON DELETE CASCADE,
  category text NOT NULL,
  company_name text NOT NULL,
  contact_person text,
  phone text,
  email text,
  instagram text,
  website text,
  agreed_price numeric(12, 2) NOT NULL DEFAULT 0,
  deposit numeric(12, 2) NOT NULL DEFAULT 0,
  remaining_amount numeric(12, 2) NOT NULL DEFAULT 0,
  payment_due_date date,
  status text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Tasks
CREATE TABLE public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id uuid NOT NULL REFERENCES public.wedding (id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  category text,
  deadline date,
  priority public.task_priority NOT NULL DEFAULT 'medium',
  status public.task_status NOT NULL DEFAULT 'todo',
  assigned_to uuid REFERENCES public.profiles (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Budget items
CREATE TABLE public.budget_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id uuid NOT NULL REFERENCES public.wedding (id) ON DELETE CASCADE,
  category text NOT NULL,
  description text,
  planned_amount numeric(12, 2) NOT NULL DEFAULT 0,
  actual_amount numeric(12, 2) NOT NULL DEFAULT 0,
  paid_amount numeric(12, 2) NOT NULL DEFAULT 0,
  deposit_amount numeric(12, 2) NOT NULL DEFAULT 0,
  due_date date,
  status public.budget_status NOT NULL DEFAULT 'planned',
  vendor_id uuid REFERENCES public.vendors (id) ON DELETE SET NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Timeline
CREATE TABLE public.timeline_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id uuid NOT NULL REFERENCES public.wedding (id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  event_date date NOT NULL,
  event_time time,
  category text,
  completed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Notes (created_by nullable so seed radi bez auth UUID-jeva)
CREATE TABLE public.notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id uuid NOT NULL REFERENCES public.wedding (id) ON DELETE CASCADE,
  title text NOT NULL,
  content text,
  category text,
  created_by uuid REFERENCES public.profiles (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_tables_wedding_id ON public.tables (wedding_id);
CREATE INDEX idx_guests_wedding_id ON public.guests (wedding_id);
CREATE INDEX idx_guests_table_id ON public.guests (table_id);
CREATE INDEX idx_guests_side ON public.guests (side);
CREATE INDEX idx_guests_invitation_status ON public.guests (invitation_status);
CREATE INDEX idx_guests_group_name ON public.guests (group_name);
CREATE INDEX idx_vendors_wedding_id ON public.vendors (wedding_id);
CREATE INDEX idx_tasks_wedding_id ON public.tasks (wedding_id);
CREATE INDEX idx_tasks_status ON public.tasks (status);
CREATE INDEX idx_tasks_assigned_to ON public.tasks (assigned_to);
CREATE INDEX idx_budget_items_wedding_id ON public.budget_items (wedding_id);
CREATE INDEX idx_budget_items_vendor_id ON public.budget_items (vendor_id);
CREATE INDEX idx_budget_items_status ON public.budget_items (status);
CREATE INDEX idx_timeline_items_wedding_id ON public.timeline_items (wedding_id);
CREATE INDEX idx_timeline_items_event_date ON public.timeline_items (event_date);
CREATE INDEX idx_notes_wedding_id ON public.notes (wedding_id);
CREATE INDEX idx_notes_created_by ON public.notes (created_by);

-- updated_at helper
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER guests_set_updated_at
BEFORE UPDATE ON public.guests
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER notes_set_updated_at
BEFORE UPDATE ON public.notes
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- Auto-create profile on signup / admin user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      split_part(NEW.email, '@', 1)
    ),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'editor')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- Row Level Security: only authenticated users
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wedding ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timeline_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "profiles_select_authenticated"
ON public.profiles FOR SELECT TO authenticated
USING (true);

CREATE POLICY "profiles_update_own"
ON public.profiles FOR UPDATE TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Wedding
CREATE POLICY "wedding_select_authenticated"
ON public.wedding FOR SELECT TO authenticated
USING (true);

CREATE POLICY "wedding_insert_authenticated"
ON public.wedding FOR INSERT TO authenticated
WITH CHECK (true);

CREATE POLICY "wedding_update_authenticated"
ON public.wedding FOR UPDATE TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "wedding_delete_authenticated"
ON public.wedding FOR DELETE TO authenticated
USING (true);

-- Tables
CREATE POLICY "tables_select_authenticated"
ON public.tables FOR SELECT TO authenticated
USING (true);

CREATE POLICY "tables_insert_authenticated"
ON public.tables FOR INSERT TO authenticated
WITH CHECK (true);

CREATE POLICY "tables_update_authenticated"
ON public.tables FOR UPDATE TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "tables_delete_authenticated"
ON public.tables FOR DELETE TO authenticated
USING (true);

-- Guests
CREATE POLICY "guests_select_authenticated"
ON public.guests FOR SELECT TO authenticated
USING (true);

CREATE POLICY "guests_insert_authenticated"
ON public.guests FOR INSERT TO authenticated
WITH CHECK (true);

CREATE POLICY "guests_update_authenticated"
ON public.guests FOR UPDATE TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "guests_delete_authenticated"
ON public.guests FOR DELETE TO authenticated
USING (true);

-- Vendors
CREATE POLICY "vendors_select_authenticated"
ON public.vendors FOR SELECT TO authenticated
USING (true);

CREATE POLICY "vendors_insert_authenticated"
ON public.vendors FOR INSERT TO authenticated
WITH CHECK (true);

CREATE POLICY "vendors_update_authenticated"
ON public.vendors FOR UPDATE TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "vendors_delete_authenticated"
ON public.vendors FOR DELETE TO authenticated
USING (true);

-- Tasks
CREATE POLICY "tasks_select_authenticated"
ON public.tasks FOR SELECT TO authenticated
USING (true);

CREATE POLICY "tasks_insert_authenticated"
ON public.tasks FOR INSERT TO authenticated
WITH CHECK (true);

CREATE POLICY "tasks_update_authenticated"
ON public.tasks FOR UPDATE TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "tasks_delete_authenticated"
ON public.tasks FOR DELETE TO authenticated
USING (true);

-- Budget items
CREATE POLICY "budget_items_select_authenticated"
ON public.budget_items FOR SELECT TO authenticated
USING (true);

CREATE POLICY "budget_items_insert_authenticated"
ON public.budget_items FOR INSERT TO authenticated
WITH CHECK (true);

CREATE POLICY "budget_items_update_authenticated"
ON public.budget_items FOR UPDATE TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "budget_items_delete_authenticated"
ON public.budget_items FOR DELETE TO authenticated
USING (true);

-- Timeline
CREATE POLICY "timeline_items_select_authenticated"
ON public.timeline_items FOR SELECT TO authenticated
USING (true);

CREATE POLICY "timeline_items_insert_authenticated"
ON public.timeline_items FOR INSERT TO authenticated
WITH CHECK (true);

CREATE POLICY "timeline_items_update_authenticated"
ON public.timeline_items FOR UPDATE TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "timeline_items_delete_authenticated"
ON public.timeline_items FOR DELETE TO authenticated
USING (true);

-- Notes
CREATE POLICY "notes_select_authenticated"
ON public.notes FOR SELECT TO authenticated
USING (true);

CREATE POLICY "notes_insert_authenticated"
ON public.notes FOR INSERT TO authenticated
WITH CHECK (true);

CREATE POLICY "notes_update_authenticated"
ON public.notes FOR UPDATE TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "notes_delete_authenticated"
ON public.notes FOR DELETE TO authenticated
USING (true);
