export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type GuestSide =
  | "bride"
  | "groom"
  | "bride_parents"
  | "groom_parents";
export type GuestGroup = "family" | "friends" | "work" | "other";
export type InvitationStatus = "pending" | "confirmed" | "declined";
export type TableShape = "round" | "rectangular" | "head_table";
export type TableSide = "bride" | "groom" | "mixed";
export type TaskPriority = "low" | "medium" | "high";
export type TaskStatus = "todo" | "in_progress" | "completed";
export type BudgetStatus =
  | "planned"
  | "deposit_paid"
  | "partially_paid"
  | "paid";
export type ProfileRole = "admin" | "editor";

export type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  role: ProfileRole;
  created_at: string;
};

export type Wedding = {
  id: string;
  title: string;
  wedding_date: string;
  venue: string | null;
  city: string | null;
  planned_budget: number;
  notes: string | null;
  created_at: string;
};

export type Guest = {
  id: string;
  wedding_id: string;
  first_name: string;
  last_name: string;
  side: GuestSide;
  group_name: GuestGroup;
  invitation_status: InvitationStatus;
  plus_one: boolean;
  plus_one_name: string | null;
  children_count: number;
  phone: string | null;
  notes: string | null;
  table_id: string | null;
  seat_number: number | null;
  created_at: string;
  updated_at: string;
};

export type SeatingTable = {
  id: string;
  wedding_id: string;
  name: string;
  capacity: number;
  shape: TableShape;
  position_x: number;
  position_y: number;
  width: number | null;
  height: number | null;
  rotation: number;
  side: TableSide | null;
  notes: string | null;
  created_at: string;
};

export type Task = {
  id: string;
  wedding_id: string;
  title: string;
  description: string | null;
  category: string | null;
  deadline: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  assigned_to: string | null;
  created_at: string;
};

export type BudgetItem = {
  id: string;
  wedding_id: string;
  category: string;
  description: string | null;
  planned_amount: number;
  actual_amount: number;
  paid_amount: number;
  deposit_amount: number;
  due_date: string | null;
  status: BudgetStatus;
  vendor_id: string | null;
  notes: string | null;
  created_at: string;
};

export type Vendor = {
  id: string;
  wedding_id: string;
  category: string;
  company_name: string;
  contact_person: string | null;
  phone: string | null;
  email: string | null;
  instagram: string | null;
  website: string | null;
  agreed_price: number;
  deposit: number;
  remaining_amount: number;
  payment_due_date: string | null;
  status: string | null;
  notes: string | null;
  created_at: string;
};

export type TimelineItem = {
  id: string;
  wedding_id: string;
  title: string;
  description: string | null;
  event_date: string;
  event_time: string | null;
  category: string | null;
  completed: boolean;
  created_at: string;
};

export type Note = {
  id: string;
  wedding_id: string;
  title: string;
  content: string | null;
  category: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: {
          id: string;
          full_name?: string | null;
          email?: string | null;
          role?: ProfileRole;
          created_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          email?: string | null;
          role?: ProfileRole;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      wedding: {
        Row: Wedding;
        Insert: {
          id?: string;
          title: string;
          wedding_date: string;
          venue?: string | null;
          city?: string | null;
          planned_budget?: number;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          wedding_date?: string;
          venue?: string | null;
          city?: string | null;
          planned_budget?: number;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      guests: {
        Row: Guest;
        Insert: {
          id?: string;
          wedding_id: string;
          first_name: string;
          last_name: string;
          side: GuestSide;
          group_name?: GuestGroup;
          invitation_status?: InvitationStatus;
          plus_one?: boolean;
          plus_one_name?: string | null;
          children_count?: number;
          phone?: string | null;
          notes?: string | null;
          table_id?: string | null;
          seat_number?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          wedding_id?: string;
          first_name?: string;
          last_name?: string;
          side?: GuestSide;
          group_name?: GuestGroup;
          invitation_status?: InvitationStatus;
          plus_one?: boolean;
          plus_one_name?: string | null;
          children_count?: number;
          phone?: string | null;
          notes?: string | null;
          table_id?: string | null;
          seat_number?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "guests_wedding_id_fkey";
            columns: ["wedding_id"];
            isOneToOne: false;
            referencedRelation: "wedding";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "guests_table_id_fkey";
            columns: ["table_id"];
            isOneToOne: false;
            referencedRelation: "tables";
            referencedColumns: ["id"];
          },
        ];
      };
      tables: {
        Row: SeatingTable;
        Insert: {
          id?: string;
          wedding_id: string;
          name: string;
          capacity: number;
          shape?: TableShape;
          position_x?: number;
          position_y?: number;
          width?: number | null;
          height?: number | null;
          rotation?: number;
          side?: TableSide | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          wedding_id?: string;
          name?: string;
          capacity?: number;
          shape?: TableShape;
          position_x?: number;
          position_y?: number;
          width?: number | null;
          height?: number | null;
          rotation?: number;
          side?: TableSide | null;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tables_wedding_id_fkey";
            columns: ["wedding_id"];
            isOneToOne: false;
            referencedRelation: "wedding";
            referencedColumns: ["id"];
          },
        ];
      };
      tasks: {
        Row: Task;
        Insert: {
          id?: string;
          wedding_id: string;
          title: string;
          description?: string | null;
          category?: string | null;
          deadline?: string | null;
          priority?: TaskPriority;
          status?: TaskStatus;
          assigned_to?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          wedding_id?: string;
          title?: string;
          description?: string | null;
          category?: string | null;
          deadline?: string | null;
          priority?: TaskPriority;
          status?: TaskStatus;
          assigned_to?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tasks_wedding_id_fkey";
            columns: ["wedding_id"];
            isOneToOne: false;
            referencedRelation: "wedding";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tasks_assigned_to_fkey";
            columns: ["assigned_to"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      budget_items: {
        Row: BudgetItem;
        Insert: {
          id?: string;
          wedding_id: string;
          category: string;
          description?: string | null;
          planned_amount?: number;
          actual_amount?: number;
          paid_amount?: number;
          deposit_amount?: number;
          due_date?: string | null;
          status?: BudgetStatus;
          vendor_id?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          wedding_id?: string;
          category?: string;
          description?: string | null;
          planned_amount?: number;
          actual_amount?: number;
          paid_amount?: number;
          deposit_amount?: number;
          due_date?: string | null;
          status?: BudgetStatus;
          vendor_id?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "budget_items_wedding_id_fkey";
            columns: ["wedding_id"];
            isOneToOne: false;
            referencedRelation: "wedding";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "budget_items_vendor_id_fkey";
            columns: ["vendor_id"];
            isOneToOne: false;
            referencedRelation: "vendors";
            referencedColumns: ["id"];
          },
        ];
      };
      vendors: {
        Row: Vendor;
        Insert: {
          id?: string;
          wedding_id: string;
          category: string;
          company_name: string;
          contact_person?: string | null;
          phone?: string | null;
          email?: string | null;
          instagram?: string | null;
          website?: string | null;
          agreed_price?: number;
          deposit?: number;
          remaining_amount?: number;
          payment_due_date?: string | null;
          status?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          wedding_id?: string;
          category?: string;
          company_name?: string;
          contact_person?: string | null;
          phone?: string | null;
          email?: string | null;
          instagram?: string | null;
          website?: string | null;
          agreed_price?: number;
          deposit?: number;
          remaining_amount?: number;
          payment_due_date?: string | null;
          status?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "vendors_wedding_id_fkey";
            columns: ["wedding_id"];
            isOneToOne: false;
            referencedRelation: "wedding";
            referencedColumns: ["id"];
          },
        ];
      };
      timeline_items: {
        Row: TimelineItem;
        Insert: {
          id?: string;
          wedding_id: string;
          title: string;
          description?: string | null;
          event_date: string;
          event_time?: string | null;
          category?: string | null;
          completed?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          wedding_id?: string;
          title?: string;
          description?: string | null;
          event_date?: string;
          event_time?: string | null;
          category?: string | null;
          completed?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "timeline_items_wedding_id_fkey";
            columns: ["wedding_id"];
            isOneToOne: false;
            referencedRelation: "wedding";
            referencedColumns: ["id"];
          },
        ];
      };
      notes: {
        Row: Note;
        Insert: {
          id?: string;
          wedding_id: string;
          title: string;
          content?: string | null;
          category?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          wedding_id?: string;
          title?: string;
          content?: string | null;
          category?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notes_wedding_id_fkey";
            columns: ["wedding_id"];
            isOneToOne: false;
            referencedRelation: "wedding";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "notes_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      guest_side: GuestSide;
      guest_group: GuestGroup;
      invitation_status: InvitationStatus;
      table_shape: TableShape;
      table_side: TableSide;
      task_priority: TaskPriority;
      task_status: TaskStatus;
      budget_status: BudgetStatus;
    };
    CompositeTypes: Record<string, never>;
  };
};

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];
export type Enums<T extends keyof Database["public"]["Enums"]> =
  Database["public"]["Enums"][T];

/** Alias za budžet entitet (tabela `budget_items`). */
export type Budget = BudgetItem;
/** Alias za timeline entitet (tabela `timeline_items`). */
export type Timeline = TimelineItem;
/** Alias za sto (tabela `tables`). */
export type Table = SeatingTable;
