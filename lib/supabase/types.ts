// Auto-generated from the live Supabase schema.
// Regenerate with: npm run supabase:types (requires SUPABASE_ACCESS_TOKEN set).

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      bookings: {
        Row: {
          brand_contact_email: string | null
          brand_contact_phone: string | null
          brand_name: string
          check_in_date: string
          check_in_time: string
          check_out_date: string
          check_out_time: string
          created_at: string
          external_id: string
          id: string
          property_id: string
          special_instructions: string | null
          status: Database["public"]["Enums"]["booking_status"]
          synced_at: string | null
          ttv_pence: number
        }
        Insert: {
          brand_contact_email?: string | null
          brand_contact_phone?: string | null
          brand_name: string
          check_in_date: string
          check_in_time?: string
          check_out_date: string
          check_out_time?: string
          created_at?: string
          external_id: string
          id?: string
          property_id: string
          special_instructions?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
          synced_at?: string | null
          ttv_pence?: number
        }
        Update: {
          brand_contact_email?: string | null
          brand_contact_phone?: string | null
          brand_name?: string
          check_in_date?: string
          check_in_time?: string
          check_out_date?: string
          check_out_time?: string
          created_at?: string
          external_id?: string
          id?: string
          property_id?: string
          special_instructions?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
          synced_at?: string | null
          ttv_pence?: number
        }
        Relationships: [
          {
            foreignKeyName: "bookings_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      cleaning_jobs: {
        Row: {
          assigned_cleaner_id: string | null
          booking_id: string
          completed_at: string | null
          completion_photos: string[]
          confirmed_at: string | null
          created_at: string
          date: string
          id: string
          notes: string | null
          property_id: string
          rate_pence: number
          sms_sent_at: string | null
          status: Database["public"]["Enums"]["cleaning_job_status"]
          time_window: string | null
          type: Database["public"]["Enums"]["cleaning_job_type"]
        }
        Insert: {
          assigned_cleaner_id?: string | null
          booking_id: string
          completed_at?: string | null
          completion_photos?: string[]
          confirmed_at?: string | null
          created_at?: string
          date: string
          id?: string
          notes?: string | null
          property_id: string
          rate_pence?: number
          sms_sent_at?: string | null
          status?: Database["public"]["Enums"]["cleaning_job_status"]
          time_window?: string | null
          type: Database["public"]["Enums"]["cleaning_job_type"]
        }
        Update: {
          assigned_cleaner_id?: string | null
          booking_id?: string
          completed_at?: string | null
          completion_photos?: string[]
          confirmed_at?: string | null
          created_at?: string
          date?: string
          id?: string
          notes?: string | null
          property_id?: string
          rate_pence?: number
          sms_sent_at?: string | null
          status?: Database["public"]["Enums"]["cleaning_job_status"]
          time_window?: string | null
          type?: Database["public"]["Enums"]["cleaning_job_type"]
        }
        Relationships: [
          {
            foreignKeyName: "cleaning_jobs_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cleaning_jobs_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      condition_report_areas: {
        Row: {
          area_name: string
          condition: Database["public"]["Enums"]["condition_area_state"]
          id: string
          notes: string | null
          photos: string[]
          report_id: string
        }
        Insert: {
          area_name: string
          condition: Database["public"]["Enums"]["condition_area_state"]
          id?: string
          notes?: string | null
          photos?: string[]
          report_id: string
        }
        Update: {
          area_name?: string
          condition?: Database["public"]["Enums"]["condition_area_state"]
          id?: string
          notes?: string | null
          photos?: string[]
          report_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "condition_report_areas_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "condition_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      condition_reports: {
        Row: {
          booking_id: string
          created_at: string
          has_damage_flags: boolean
          id: string
          overall_condition:
            | Database["public"]["Enums"]["condition_overall"]
            | null
          property_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["condition_report_status"]
          submitted_at: string | null
          submitted_by: string
          summary: string | null
          type: Database["public"]["Enums"]["condition_report_type"]
        }
        Insert: {
          booking_id: string
          created_at?: string
          has_damage_flags?: boolean
          id?: string
          overall_condition?:
            | Database["public"]["Enums"]["condition_overall"]
            | null
          property_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["condition_report_status"]
          submitted_at?: string | null
          submitted_by: string
          summary?: string | null
          type: Database["public"]["Enums"]["condition_report_type"]
        }
        Update: {
          booking_id?: string
          created_at?: string
          has_damage_flags?: boolean
          id?: string
          overall_condition?:
            | Database["public"]["Enums"]["condition_overall"]
            | null
          property_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["condition_report_status"]
          submitted_at?: string | null
          submitted_by?: string
          summary?: string | null
          type?: Database["public"]["Enums"]["condition_report_type"]
        }
        Relationships: [
          {
            foreignKeyName: "condition_reports_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "condition_reports_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      deposits: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          booking_id: string
          checkout_date: string
          condition_report_ci_id: string | null
          condition_report_co_id: string | null
          created_at: string
          deadline_date: string
          deduction_amount_pence: number | null
          deduction_reason: string | null
          id: string
          processed_at: string | null
          property_id: string
          status: Database["public"]["Enums"]["deposit_status"]
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          booking_id: string
          checkout_date: string
          condition_report_ci_id?: string | null
          condition_report_co_id?: string | null
          created_at?: string
          deadline_date: string
          deduction_amount_pence?: number | null
          deduction_reason?: string | null
          id?: string
          processed_at?: string | null
          property_id: string
          status?: Database["public"]["Enums"]["deposit_status"]
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          booking_id?: string
          checkout_date?: string
          condition_report_ci_id?: string | null
          condition_report_co_id?: string | null
          created_at?: string
          deadline_date?: string
          deduction_amount_pence?: number | null
          deduction_reason?: string | null
          id?: string
          processed_at?: string | null
          property_id?: string
          status?: Database["public"]["Enums"]["deposit_status"]
        }
        Relationships: [
          {
            foreignKeyName: "deposits_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deposits_condition_report_ci_id_fkey"
            columns: ["condition_report_ci_id"]
            isOneToOne: false
            referencedRelation: "condition_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deposits_condition_report_co_id_fkey"
            columns: ["condition_report_co_id"]
            isOneToOne: false
            referencedRelation: "condition_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deposits_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string
          channel: Database["public"]["Enums"]["notification_channel"]
          created_at: string
          id: string
          recipient_address: string
          recipient_id: string | null
          related_id: string | null
          related_type: string | null
          sent_at: string | null
          status: Database["public"]["Enums"]["notification_status"]
          template: string | null
        }
        Insert: {
          body: string
          channel: Database["public"]["Enums"]["notification_channel"]
          created_at?: string
          id?: string
          recipient_address: string
          recipient_id?: string | null
          related_id?: string | null
          related_type?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["notification_status"]
          template?: string | null
        }
        Update: {
          body?: string
          channel?: Database["public"]["Enums"]["notification_channel"]
          created_at?: string
          id?: string
          recipient_address?: string
          recipient_id?: string | null
          related_id?: string | null
          related_type?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["notification_status"]
          template?: string | null
        }
        Relationships: []
      }
      properties: {
        Row: {
          address: string
          cleaning_rate_pence: number
          created_at: string
          id: string
          keynest_instructions: string | null
          name: string
          postcode: string | null
          status: Database["public"]["Enums"]["property_status"]
          tier: Database["public"]["Enums"]["property_tier"]
          updated_at: string
        }
        Insert: {
          address: string
          cleaning_rate_pence?: number
          created_at?: string
          id?: string
          keynest_instructions?: string | null
          name: string
          postcode?: string | null
          status?: Database["public"]["Enums"]["property_status"]
          tier: Database["public"]["Enums"]["property_tier"]
          updated_at?: string
        }
        Update: {
          address?: string
          cleaning_rate_pence?: number
          created_at?: string
          id?: string
          keynest_instructions?: string | null
          name?: string
          postcode?: string | null
          status?: Database["public"]["Enums"]["property_status"]
          tier?: Database["public"]["Enums"]["property_tier"]
          updated_at?: string
        }
        Relationships: []
      }
      shift_applications: {
        Row: {
          applied_at: string
          bh_id: string
          decided_at: string | null
          id: string
          shift_id: string
          status: Database["public"]["Enums"]["shift_application_status"]
        }
        Insert: {
          applied_at?: string
          bh_id: string
          decided_at?: string | null
          id?: string
          shift_id: string
          status?: Database["public"]["Enums"]["shift_application_status"]
        }
        Update: {
          applied_at?: string
          bh_id?: string
          decided_at?: string | null
          id?: string
          shift_id?: string
          status?: Database["public"]["Enums"]["shift_application_status"]
        }
        Relationships: [
          {
            foreignKeyName: "shift_applications_shift_id_fkey"
            columns: ["shift_id"]
            isOneToOne: false
            referencedRelation: "shifts"
            referencedColumns: ["id"]
          },
        ]
      }
      shifts: {
        Row: {
          assigned_bh_id: string | null
          booking_id: string
          created_at: string
          date: string
          end_time: string
          escalation_level: number
          id: string
          is_escalated: boolean
          notes: string | null
          property_id: string
          rate_pence: number
          start_time: string
          status: Database["public"]["Enums"]["shift_status"]
          type: Database["public"]["Enums"]["shift_type"]
          updated_at: string
        }
        Insert: {
          assigned_bh_id?: string | null
          booking_id: string
          created_at?: string
          date: string
          end_time: string
          escalation_level?: number
          id?: string
          is_escalated?: boolean
          notes?: string | null
          property_id: string
          rate_pence: number
          start_time: string
          status?: Database["public"]["Enums"]["shift_status"]
          type: Database["public"]["Enums"]["shift_type"]
          updated_at?: string
        }
        Update: {
          assigned_bh_id?: string | null
          booking_id?: string
          created_at?: string
          date?: string
          end_time?: string
          escalation_level?: number
          id?: string
          is_escalated?: boolean
          notes?: string | null
          property_id?: string
          rate_pence?: number
          start_time?: string
          status?: Database["public"]["Enums"]["shift_status"]
          type?: Database["public"]["Enums"]["shift_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shifts_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shifts_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_jobs: {
        Row: {
          actual_amount_pence: number | null
          chase_count: number
          completed_at: string | null
          condition_report_id: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          last_chased_at: string | null
          photos: string[]
          property_id: string
          quote_amount_pence: number | null
          status: Database["public"]["Enums"]["vendor_job_status"]
          title: string
          trade: Database["public"]["Enums"]["trade_type"]
          updated_at: string
          vendor_id: string | null
        }
        Insert: {
          actual_amount_pence?: number | null
          chase_count?: number
          completed_at?: string | null
          condition_report_id?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          last_chased_at?: string | null
          photos?: string[]
          property_id: string
          quote_amount_pence?: number | null
          status?: Database["public"]["Enums"]["vendor_job_status"]
          title: string
          trade: Database["public"]["Enums"]["trade_type"]
          updated_at?: string
          vendor_id?: string | null
        }
        Update: {
          actual_amount_pence?: number | null
          chase_count?: number
          completed_at?: string | null
          condition_report_id?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          last_chased_at?: string | null
          photos?: string[]
          property_id?: string
          quote_amount_pence?: number | null
          status?: Database["public"]["Enums"]["vendor_job_status"]
          title?: string
          trade?: Database["public"]["Enums"]["trade_type"]
          updated_at?: string
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendor_jobs_condition_report_id_fkey"
            columns: ["condition_report_id"]
            isOneToOne: false
            referencedRelation: "condition_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_jobs_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_jobs_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendors: {
        Row: {
          avg_delivery_days: number | null
          avg_response_hours: number | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          coverage_area: string | null
          created_at: string
          id: string
          is_approved: boolean
          name: string
          notes: string | null
          quality_rating: number | null
          total_jobs: number
          total_spend_pence: number
          trade: Database["public"]["Enums"]["trade_type"]
        }
        Insert: {
          avg_delivery_days?: number | null
          avg_response_hours?: number | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          coverage_area?: string | null
          created_at?: string
          id?: string
          is_approved?: boolean
          name: string
          notes?: string | null
          quality_rating?: number | null
          total_jobs?: number
          total_spend_pence?: number
          trade: Database["public"]["Enums"]["trade_type"]
        }
        Update: {
          avg_delivery_days?: number | null
          avg_response_hours?: number | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          coverage_area?: string | null
          created_at?: string
          id?: string
          is_approved?: boolean
          name?: string
          notes?: string | null
          quality_rating?: number | null
          total_jobs?: number
          total_spend_pence?: number
          trade?: Database["public"]["Enums"]["trade_type"]
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_brandhost: { Args: never; Returns: boolean }
      is_cleaner: { Args: never; Returns: boolean }
      is_ops: { Args: never; Returns: boolean }
      user_role: { Args: never; Returns: string }
    }
    Enums: {
      booking_status: "confirmed" | "active" | "completed" | "cancelled"
      cleaning_job_status:
        | "pending"
        | "dispatched"
        | "confirmed"
        | "completed"
        | "cancelled"
      cleaning_job_type: "pre_clean" | "post_clean" | "deep_clean"
      condition_area_state: "fine" | "minor_wear" | "damage" | "missing"
      condition_overall: "good" | "minor_issues" | "damage"
      condition_report_status: "draft" | "submitted" | "reviewed"
      condition_report_type: "check_in" | "check_out"
      deposit_status:
        | "pending_review"
        | "deduction_proposed"
        | "approved"
        | "processed"
        | "auto_refunded"
      notification_channel: "sms" | "email" | "slack"
      notification_status: "sent" | "delivered" | "failed"
      property_status: "active" | "fit_out" | "archived"
      property_tier: "prime" | "pro" | "other"
      shift_application_status:
        | "pending"
        | "accepted"
        | "rejected"
        | "withdrawn"
      shift_status: "open" | "applied" | "assigned" | "completed" | "cancelled"
      shift_type: "check_in" | "check_out" | "viewing"
      trade_type:
        | "signage"
        | "blinds"
        | "painting"
        | "plumbing"
        | "electrical"
        | "cleaning"
        | "security"
        | "general"
      vendor_job_status:
        | "draft"
        | "quoted"
        | "approved"
        | "scheduled"
        | "in_progress"
        | "completed"
        | "disputed"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      booking_status: ["confirmed", "active", "completed", "cancelled"],
      cleaning_job_status: [
        "pending",
        "dispatched",
        "confirmed",
        "completed",
        "cancelled",
      ],
      cleaning_job_type: ["pre_clean", "post_clean", "deep_clean"],
      condition_area_state: ["fine", "minor_wear", "damage", "missing"],
      condition_overall: ["good", "minor_issues", "damage"],
      condition_report_status: ["draft", "submitted", "reviewed"],
      condition_report_type: ["check_in", "check_out"],
      deposit_status: [
        "pending_review",
        "deduction_proposed",
        "approved",
        "processed",
        "auto_refunded",
      ],
      notification_channel: ["sms", "email", "slack"],
      notification_status: ["sent", "delivered", "failed"],
      property_status: ["active", "fit_out", "archived"],
      property_tier: ["prime", "pro", "other"],
      shift_application_status: [
        "pending",
        "accepted",
        "rejected",
        "withdrawn",
      ],
      shift_status: ["open", "applied", "assigned", "completed", "cancelled"],
      shift_type: ["check_in", "check_out", "viewing"],
      trade_type: [
        "signage",
        "blinds",
        "painting",
        "plumbing",
        "electrical",
        "cleaning",
        "security",
        "general",
      ],
      vendor_job_status: [
        "draft",
        "quoted",
        "approved",
        "scheduled",
        "in_progress",
        "completed",
        "disputed",
      ],
    },
  },
} as const

// PRIME Ops app-level type. Kept here so consumers only import from one place.
export type AppRole = "ops" | "brandhost" | "cleaner";
