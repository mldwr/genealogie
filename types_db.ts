export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      deport: {
        Row: {
          Arbeitsort: string | null
          Eintragsnr: number
          Familienname: string | null
          Familiennr: number | null
          Familienrolle: string | null
          Geburtsjahr: string | null
          Geburtsort: string | null
          Geschlecht: string | null
          id: string | null
          Laufendenr: number
          logical_id: string | null
          Seite: number | null
          updated_at: string | null
          updated_by: string | null
          Vatersname: string | null
          version: Database["public"]["Enums"]["version_state"]
          Vorname: string | null
        }
        Insert: {
          Arbeitsort?: string | null
          Eintragsnr: number
          Familienname?: string | null
          Familiennr?: number | null
          Familienrolle?: string | null
          Geburtsjahr?: string | null
          Geburtsort?: string | null
          Geschlecht?: string | null
          id?: string | null
          Laufendenr: number
          logical_id?: string | null
          Seite?: number | null
          updated_at?: string | null
          updated_by?: string | null
          Vatersname?: string | null
          version?: Database["public"]["Enums"]["version_state"]
          Vorname?: string | null
        }
        Update: {
          Arbeitsort?: string | null
          Eintragsnr?: number
          Familienname?: string | null
          Familiennr?: number | null
          Familienrolle?: string | null
          Geburtsjahr?: string | null
          Geburtsort?: string | null
          Geschlecht?: string | null
          id?: string | null
          Laufendenr?: number
          logical_id?: string | null
          Seite?: number | null
          updated_at?: string | null
          updated_by?: string | null
          Vatersname?: string | null
          version?: Database["public"]["Enums"]["version_state"]
          Vorname?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          email: string
          id: string
          last_login: string | null
          role: string
        }
        Insert: {
          email: string
          id: string
          last_login?: string | null
          role?: string
        }
        Update: {
          email?: string
          id?: string
          last_login?: string | null
          role?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      approve_invoice: {
        Args: { invoice_id: string; approve_id: string }
        Returns: boolean
      }
      change_password: {
        Args: { email_param: string; new_password_param: string }
        Returns: boolean
      }
      count_matching_invoices: {
        Args:
          | { query_param: string }
          | { query_param: string; sparte_param: string }
        Returns: number
      }
      count_matching_invoices_for_user: {
        Args: { query_param: string; sessionuseremail_param: string }
        Returns: number
      }
      count_matching_invoices_with_email: {
        Args: { query_param: string; session_email_param: string }
        Returns: number
      }
      delete_invoice: {
        Args: { invoice_id: string }
        Returns: boolean
      }
      edit_invoice: {
        Args: {
          customer_id_param: string
          division_param: string
          hours_param: number
          date_param: string
          id_param: string
        }
        Returns: boolean
      }
      get_customers: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          name: string
          email: string
        }[]
      }
      get_invoice_by_id: {
        Args: { id_param: string }
        Returns: {
          id: string
          customer_id: string
          amount: number
          hours: number
          date: string
          status: string
          groupid: string
        }[]
      }
      get_invoice_customer_counts: {
        Args: { sessionuseremail: string }
        Returns: {
          invoice_count: number
          customer_count: number
          paid: number
          pending: number
        }[]
      }
      get_invoices_by_user_month: {
        Args: { session_email_param: string }
        Returns: {
          id: string
          amount: number
          hours: number
          date: string
          status: string
          name: string
          email: string
          image_url: string
          groupid: string
        }[]
      }
      get_invoices_with_email_and_pagination: {
        Args: {
          query_param: string
          session_email_param: string
          items_per_page_param: number
          offset_param: number
        }
        Returns: {
          id: string
          amount: number
          hours: number
          date: string
          status: string
          name: string
          email: string
          image_url: string
          groupid: string
        }[]
      }
      get_latest_invoice: {
        Args: { sessionuseremail: string }
        Returns: {
          amount: number
          name: string
          image_url: string
          email: string
          id: string
          date: string
        }[]
      }
      get_past_invoices_amount: {
        Args: { session_email_param: string }
        Returns: {
          total_amount: number
        }[]
      }
      get_revenue_data: {
        Args: { sessionuseremail: string }
        Returns: {
          year: string
          month: string
          revenue: number
        }[]
      }
      get_user: {
        Args: { sessionuseremail: string }
        Returns: {
          id: string
          name: string
          email: string
          password: string
          image: string
        }[]
      }
      insert_invoice: {
        Args: {
          customer_id: string
          status: string
          date: string
          division: string
          hours: number
        }
        Returns: boolean
      }
      log_change_password: {
        Args: { email_param: string }
        Returns: boolean
      }
      log_last_login: {
        Args: { email_param: string }
        Returns: boolean
      }
      search_customer_by_id: {
        Args: { customer_id_param: string }
        Returns: {
          id: string
          name: string
          email: string
        }[]
      }
      search_customers: {
        Args: { query_param: string; sparte_param: string }
        Returns: {
          id: string
          name: string
          email: string
          image_url: string
          groupid: string
          total_ausstehend: number
          total_geprueft: number
          total_genehmigt: number
          rate: number
        }[]
      }
      search_customers_summary: {
        Args: { query_param: string }
        Returns: {
          id: string
          name: string
          email: string
          image_url: string
          total_ausstehend: number
          total_geprueft: number
          total_genehmigt: number
          rate: number
        }[]
      }
      search_customers_summary_for_user: {
        Args: { query_param: string; sessionuseremail_param: string }
        Returns: {
          id: string
          name: string
          email: string
          image_url: string
          total_ausstehend: number
          total_geprueft: number
          total_genehmigt: number
          rate: number
        }[]
      }
      search_invoices: {
        Args: {
          query_param: string
          items_per_page_param: number
          offset_param: number
        }
        Returns: {
          id: string
          amount: number
          hours: number
          date: string
          status: string
          name: string
          email: string
          image_url: string
          groupid: string
        }[]
      }
      search_invoices_division: {
        Args: {
          query_param: string
          sparte_param: string
          items_per_page_param: number
          offset_param: number
        }
        Returns: {
          id: string
          amount: number
          hours: number
          date: string
          status: string
          name: string
          email: string
          image_url: string
          groupid: string
        }[]
      }
      search_sparten: {
        Args: { query_param: string }
        Returns: {
          spartenname: string
          spartenleiter: string
          spartenleiter_email: string
        }[]
      }
    }
    Enums: {
      version_state: "inserted" | "updated" | "deleted"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      version_state: ["inserted", "updated", "deleted"],
    },
  },
} as const
