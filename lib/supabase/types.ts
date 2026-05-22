// Database types derived from supabase/migrations/*.sql.
// Regenerate with `supabase gen types typescript --linked > lib/supabase/types.ts`
// once the Supabase CLI is set up with a personal access token.

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type AppRole = "ops" | "brandhost" | "cleaner";

export type Database = {
  public: {
    Tables: {
      properties: {
        Row: {
          id: string;
          name: string;
          address: string;
          postcode: string | null;
          tier: Database["public"]["Enums"]["property_tier"];
          status: Database["public"]["Enums"]["property_status"];
          keynest_instructions: string | null;
          cleaning_rate_pence: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          address: string;
          postcode?: string | null;
          tier: Database["public"]["Enums"]["property_tier"];
          status?: Database["public"]["Enums"]["property_status"];
          keynest_instructions?: string | null;
          cleaning_rate_pence?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["properties"]["Insert"]>;
      };
      bookings: {
        Row: {
          id: string;
          external_id: string;
          property_id: string;
          brand_name: string;
          brand_contact_email: string | null;
          brand_contact_phone: string | null;
          check_in_date: string;
          check_out_date: string;
          check_in_time: string;
          check_out_time: string;
          ttv_pence: number;
          status: Database["public"]["Enums"]["booking_status"];
          special_instructions: string | null;
          synced_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          external_id: string;
          property_id: string;
          brand_name: string;
          brand_contact_email?: string | null;
          brand_contact_phone?: string | null;
          check_in_date: string;
          check_out_date: string;
          check_in_time?: string;
          check_out_time?: string;
          ttv_pence?: number;
          status?: Database["public"]["Enums"]["booking_status"];
          special_instructions?: string | null;
          synced_at?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["bookings"]["Insert"]>;
      };
      shifts: {
        Row: {
          id: string;
          booking_id: string;
          property_id: string;
          type: Database["public"]["Enums"]["shift_type"];
          date: string;
          start_time: string;
          end_time: string;
          status: Database["public"]["Enums"]["shift_status"];
          assigned_bh_id: string | null;
          rate_pence: number;
          is_escalated: boolean;
          escalation_level: number;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          booking_id: string;
          property_id: string;
          type: Database["public"]["Enums"]["shift_type"];
          date: string;
          start_time: string;
          end_time: string;
          status?: Database["public"]["Enums"]["shift_status"];
          assigned_bh_id?: string | null;
          rate_pence: number;
          is_escalated?: boolean;
          escalation_level?: number;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["shifts"]["Insert"]>;
      };
      shift_applications: {
        Row: {
          id: string;
          shift_id: string;
          bh_id: string;
          status: Database["public"]["Enums"]["shift_application_status"];
          applied_at: string;
          decided_at: string | null;
        };
        Insert: {
          id?: string;
          shift_id: string;
          bh_id: string;
          status?: Database["public"]["Enums"]["shift_application_status"];
          applied_at?: string;
          decided_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["shift_applications"]["Insert"]>;
      };
      cleaning_jobs: {
        Row: {
          id: string;
          booking_id: string;
          property_id: string;
          type: Database["public"]["Enums"]["cleaning_job_type"];
          date: string;
          time_window: string | null;
          status: Database["public"]["Enums"]["cleaning_job_status"];
          assigned_cleaner_id: string | null;
          rate_pence: number;
          sms_sent_at: string | null;
          confirmed_at: string | null;
          completed_at: string | null;
          completion_photos: string[];
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          booking_id: string;
          property_id: string;
          type: Database["public"]["Enums"]["cleaning_job_type"];
          date: string;
          time_window?: string | null;
          status?: Database["public"]["Enums"]["cleaning_job_status"];
          assigned_cleaner_id?: string | null;
          rate_pence?: number;
          sms_sent_at?: string | null;
          confirmed_at?: string | null;
          completed_at?: string | null;
          completion_photos?: string[];
          notes?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["cleaning_jobs"]["Insert"]>;
      };
      condition_reports: {
        Row: {
          id: string;
          booking_id: string;
          property_id: string;
          type: Database["public"]["Enums"]["condition_report_type"];
          submitted_by: string;
          status: Database["public"]["Enums"]["condition_report_status"];
          overall_condition: Database["public"]["Enums"]["condition_overall"] | null;
          has_damage_flags: boolean;
          summary: string | null;
          submitted_at: string | null;
          reviewed_at: string | null;
          reviewed_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          booking_id: string;
          property_id: string;
          type: Database["public"]["Enums"]["condition_report_type"];
          submitted_by: string;
          status?: Database["public"]["Enums"]["condition_report_status"];
          overall_condition?: Database["public"]["Enums"]["condition_overall"] | null;
          has_damage_flags?: boolean;
          summary?: string | null;
          submitted_at?: string | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["condition_reports"]["Insert"]>;
      };
      condition_report_areas: {
        Row: {
          id: string;
          report_id: string;
          area_name: string;
          condition: Database["public"]["Enums"]["condition_area_state"];
          notes: string | null;
          photos: string[];
        };
        Insert: {
          id?: string;
          report_id: string;
          area_name: string;
          condition: Database["public"]["Enums"]["condition_area_state"];
          notes?: string | null;
          photos?: string[];
        };
        Update: Partial<Database["public"]["Tables"]["condition_report_areas"]["Insert"]>;
      };
      vendors: {
        Row: {
          id: string;
          name: string;
          trade: Database["public"]["Enums"]["trade_type"];
          contact_name: string | null;
          contact_email: string | null;
          contact_phone: string | null;
          coverage_area: string | null;
          avg_response_hours: number | null;
          avg_delivery_days: number | null;
          quality_rating: number | null;
          total_jobs: number;
          total_spend_pence: number;
          is_approved: boolean;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          trade: Database["public"]["Enums"]["trade_type"];
          contact_name?: string | null;
          contact_email?: string | null;
          contact_phone?: string | null;
          coverage_area?: string | null;
          avg_response_hours?: number | null;
          avg_delivery_days?: number | null;
          quality_rating?: number | null;
          total_jobs?: number;
          total_spend_pence?: number;
          is_approved?: boolean;
          notes?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["vendors"]["Insert"]>;
      };
      vendor_jobs: {
        Row: {
          id: string;
          property_id: string;
          condition_report_id: string | null;
          vendor_id: string | null;
          title: string;
          description: string | null;
          trade: Database["public"]["Enums"]["trade_type"];
          status: Database["public"]["Enums"]["vendor_job_status"];
          quote_amount_pence: number | null;
          actual_amount_pence: number | null;
          chase_count: number;
          last_chased_at: string | null;
          due_date: string | null;
          completed_at: string | null;
          photos: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          property_id: string;
          condition_report_id?: string | null;
          vendor_id?: string | null;
          title: string;
          description?: string | null;
          trade: Database["public"]["Enums"]["trade_type"];
          status?: Database["public"]["Enums"]["vendor_job_status"];
          quote_amount_pence?: number | null;
          actual_amount_pence?: number | null;
          chase_count?: number;
          last_chased_at?: string | null;
          due_date?: string | null;
          completed_at?: string | null;
          photos?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["vendor_jobs"]["Insert"]>;
      };
      notifications: {
        Row: {
          id: string;
          channel: Database["public"]["Enums"]["notification_channel"];
          recipient_id: string | null;
          recipient_address: string;
          template: string | null;
          body: string;
          related_type: string | null;
          related_id: string | null;
          status: Database["public"]["Enums"]["notification_status"];
          sent_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          channel: Database["public"]["Enums"]["notification_channel"];
          recipient_id?: string | null;
          recipient_address: string;
          template?: string | null;
          body: string;
          related_type?: string | null;
          related_id?: string | null;
          status?: Database["public"]["Enums"]["notification_status"];
          sent_at?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["notifications"]["Insert"]>;
      };
      deposits: {
        Row: {
          id: string;
          booking_id: string;
          property_id: string;
          checkout_date: string;
          deadline_date: string;
          status: Database["public"]["Enums"]["deposit_status"];
          deduction_amount_pence: number | null;
          deduction_reason: string | null;
          condition_report_ci_id: string | null;
          condition_report_co_id: string | null;
          approved_by: string | null;
          approved_at: string | null;
          processed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          booking_id: string;
          property_id: string;
          checkout_date: string;
          deadline_date: string;
          status?: Database["public"]["Enums"]["deposit_status"];
          deduction_amount_pence?: number | null;
          deduction_reason?: string | null;
          condition_report_ci_id?: string | null;
          condition_report_co_id?: string | null;
          approved_by?: string | null;
          approved_at?: string | null;
          processed_at?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["deposits"]["Insert"]>;
      };
    };
    Views: Record<string, never>;
    Functions: {
      user_role: { Args: Record<string, never>; Returns: string | null };
      is_ops: { Args: Record<string, never>; Returns: boolean };
      is_brandhost: { Args: Record<string, never>; Returns: boolean };
      is_cleaner: { Args: Record<string, never>; Returns: boolean };
    };
    Enums: {
      property_tier: "prime" | "pro" | "other";
      property_status: "active" | "fit_out" | "archived";
      booking_status: "confirmed" | "active" | "completed" | "cancelled";
      shift_type: "check_in" | "check_out" | "viewing";
      shift_status: "open" | "applied" | "assigned" | "completed" | "cancelled";
      shift_application_status: "pending" | "accepted" | "rejected" | "withdrawn";
      cleaning_job_type: "pre_clean" | "post_clean" | "deep_clean";
      cleaning_job_status: "pending" | "dispatched" | "confirmed" | "completed" | "cancelled";
      condition_report_type: "check_in" | "check_out";
      condition_report_status: "draft" | "submitted" | "reviewed";
      condition_overall: "good" | "minor_issues" | "damage";
      condition_area_state: "fine" | "minor_wear" | "damage" | "missing";
      trade_type:
        | "signage" | "blinds" | "painting" | "plumbing"
        | "electrical" | "cleaning" | "security" | "general";
      vendor_job_status:
        | "draft" | "quoted" | "approved" | "scheduled"
        | "in_progress" | "completed" | "disputed";
      notification_channel: "sms" | "email" | "slack";
      notification_status: "sent" | "delivered" | "failed";
      deposit_status:
        | "pending_review" | "deduction_proposed"
        | "approved" | "processed" | "auto_refunded";
    };
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
