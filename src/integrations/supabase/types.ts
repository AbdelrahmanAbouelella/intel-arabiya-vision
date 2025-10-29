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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      alert_history: {
        Row: {
          company_id: string
          id: string
          rule_id: string
          severity: Database["public"]["Enums"]["severity"]
          summary_ar: string | null
          summary_en: string | null
          triggered_at: string
        }
        Insert: {
          company_id: string
          id?: string
          rule_id: string
          severity: Database["public"]["Enums"]["severity"]
          summary_ar?: string | null
          summary_en?: string | null
          triggered_at?: string
        }
        Update: {
          company_id?: string
          id?: string
          rule_id?: string
          severity?: Database["public"]["Enums"]["severity"]
          summary_ar?: string | null
          summary_en?: string | null
          triggered_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "alert_history_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alert_history_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "alert_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      alert_rules: {
        Row: {
          actions: Json
          conditions: Json
          created_at: string
          id: string
          is_active: boolean | null
          name: string
          scope_filters: Json
          severity: Database["public"]["Enums"]["severity"]
          updated_at: string
          user_id: string
        }
        Insert: {
          actions: Json
          conditions: Json
          created_at?: string
          id?: string
          is_active?: boolean | null
          name: string
          scope_filters: Json
          severity?: Database["public"]["Enums"]["severity"]
          updated_at?: string
          user_id: string
        }
        Update: {
          actions?: Json
          conditions?: Json
          created_at?: string
          id?: string
          is_active?: boolean | null
          name?: string
          scope_filters?: Json
          severity?: Database["public"]["Enums"]["severity"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      companies: {
        Row: {
          country: Database["public"]["Enums"]["country_code"]
          created_at: string
          currency: string | null
          description_ar: string | null
          description_en: string | null
          exchange: string | null
          id: string
          isin: string | null
          logo_url: string | null
          market_cap_usd: number | null
          name_ar: string | null
          name_en: string
          risk_score: number | null
          sector: Database["public"]["Enums"]["sector"]
          ticker: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          country: Database["public"]["Enums"]["country_code"]
          created_at?: string
          currency?: string | null
          description_ar?: string | null
          description_en?: string | null
          exchange?: string | null
          id?: string
          isin?: string | null
          logo_url?: string | null
          market_cap_usd?: number | null
          name_ar?: string | null
          name_en: string
          risk_score?: number | null
          sector: Database["public"]["Enums"]["sector"]
          ticker?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          country?: Database["public"]["Enums"]["country_code"]
          created_at?: string
          currency?: string | null
          description_ar?: string | null
          description_en?: string | null
          exchange?: string | null
          id?: string
          isin?: string | null
          logo_url?: string | null
          market_cap_usd?: number | null
          name_ar?: string | null
          name_en?: string
          risk_score?: number | null
          sector?: Database["public"]["Enums"]["sector"]
          ticker?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      events: {
        Row: {
          company_id: string
          created_at: string
          event_date: string
          event_type: Database["public"]["Enums"]["event_type"]
          extracted_metrics: Json | null
          id: string
          sentiment: Database["public"]["Enums"]["sentiment"] | null
          severity: Database["public"]["Enums"]["severity"] | null
          source_type: string | null
          source_url: string | null
          summary_ar: string | null
          summary_en: string | null
          title_ar: string | null
          title_en: string
        }
        Insert: {
          company_id: string
          created_at?: string
          event_date: string
          event_type: Database["public"]["Enums"]["event_type"]
          extracted_metrics?: Json | null
          id?: string
          sentiment?: Database["public"]["Enums"]["sentiment"] | null
          severity?: Database["public"]["Enums"]["severity"] | null
          source_type?: string | null
          source_url?: string | null
          summary_ar?: string | null
          summary_en?: string | null
          title_ar?: string | null
          title_en: string
        }
        Update: {
          company_id?: string
          created_at?: string
          event_date?: string
          event_type?: Database["public"]["Enums"]["event_type"]
          extracted_metrics?: Json | null
          id?: string
          sentiment?: Database["public"]["Enums"]["sentiment"] | null
          severity?: Database["public"]["Enums"]["severity"] | null
          source_type?: string | null
          source_url?: string | null
          summary_ar?: string | null
          summary_en?: string | null
          title_ar?: string | null
          title_en?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      financials: {
        Row: {
          company_id: string
          created_at: string
          debt_to_equity: number | null
          ebitda_usd: number | null
          id: string
          net_income_usd: number | null
          net_margin: number | null
          operating_margin: number | null
          period: string
          period_type: string
          revenue_usd: number | null
          roe: number | null
          shareholders_equity_usd: number | null
          total_assets_usd: number | null
          total_debt_usd: number | null
        }
        Insert: {
          company_id: string
          created_at?: string
          debt_to_equity?: number | null
          ebitda_usd?: number | null
          id?: string
          net_income_usd?: number | null
          net_margin?: number | null
          operating_margin?: number | null
          period: string
          period_type: string
          revenue_usd?: number | null
          roe?: number | null
          shareholders_equity_usd?: number | null
          total_assets_usd?: number | null
          total_debt_usd?: number | null
        }
        Update: {
          company_id?: string
          created_at?: string
          debt_to_equity?: number | null
          ebitda_usd?: number | null
          id?: string
          net_income_usd?: number | null
          net_margin?: number | null
          operating_margin?: number | null
          period?: string
          period_type?: string
          revenue_usd?: number | null
          roe?: number | null
          shareholders_equity_usd?: number | null
          total_assets_usd?: number | null
          total_debt_usd?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "financials_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      forecasts: {
        Row: {
          company_id: string
          confidence_interval_high: number | null
          confidence_interval_low: number | null
          created_at: string
          forecast_date: string
          forecast_value: number | null
          id: string
          last_retrain_date: string | null
          mae: number | null
          mape: number | null
          metric: string
          model_version: string | null
        }
        Insert: {
          company_id: string
          confidence_interval_high?: number | null
          confidence_interval_low?: number | null
          created_at?: string
          forecast_date: string
          forecast_value?: number | null
          id?: string
          last_retrain_date?: string | null
          mae?: number | null
          mape?: number | null
          metric: string
          model_version?: string | null
        }
        Update: {
          company_id?: string
          confidence_interval_high?: number | null
          confidence_interval_low?: number | null
          created_at?: string
          forecast_date?: string
          forecast_value?: number | null
          id?: string
          last_retrain_date?: string | null
          mae?: number | null
          mape?: number | null
          metric?: string
          model_version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "forecasts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          preferred_language: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          preferred_language?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          preferred_language?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      saved_views: {
        Row: {
          created_at: string
          filters: Json
          id: string
          is_shared: boolean | null
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          filters: Json
          id?: string
          is_shared?: boolean | null
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          filters?: Json
          id?: string
          is_shared?: boolean | null
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      watchlist_companies: {
        Row: {
          added_at: string
          company_id: string
          watchlist_id: string
        }
        Insert: {
          added_at?: string
          company_id: string
          watchlist_id: string
        }
        Update: {
          added_at?: string
          company_id?: string
          watchlist_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "watchlist_companies_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "watchlist_companies_watchlist_id_fkey"
            columns: ["watchlist_id"]
            isOneToOne: false
            referencedRelation: "watchlists"
            referencedColumns: ["id"]
          },
        ]
      }
      watchlists: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_shared: boolean | null
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_shared?: boolean | null
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_shared?: boolean | null
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "org_admin" | "analyst" | "viewer"
      country_code: "SA" | "AE" | "EG" | "KW" | "QA" | "BH" | "OM"
      event_type:
        | "earnings_release"
        | "earnings_beat"
        | "earnings_miss"
        | "guidance_up"
        | "guidance_down"
        | "executive_change"
        | "ceo_change"
        | "board_change"
        | "litigation_filed"
        | "litigation_settled"
        | "merger_acquisition"
        | "ipo"
        | "dividend_announced"
        | "dividend_cut"
        | "debt_issuance"
        | "credit_rating_upgrade"
        | "credit_rating_downgrade"
        | "regulatory_action"
        | "esg_event"
        | "other"
      sector:
        | "banking"
        | "insurance"
        | "real_estate"
        | "retail"
        | "healthcare"
        | "technology"
        | "energy"
        | "telecommunications"
        | "manufacturing"
        | "transportation"
        | "construction"
        | "other"
      sentiment:
        | "very_negative"
        | "negative"
        | "neutral"
        | "positive"
        | "very_positive"
      severity: "low" | "medium" | "high" | "critical"
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
      app_role: ["org_admin", "analyst", "viewer"],
      country_code: ["SA", "AE", "EG", "KW", "QA", "BH", "OM"],
      event_type: [
        "earnings_release",
        "earnings_beat",
        "earnings_miss",
        "guidance_up",
        "guidance_down",
        "executive_change",
        "ceo_change",
        "board_change",
        "litigation_filed",
        "litigation_settled",
        "merger_acquisition",
        "ipo",
        "dividend_announced",
        "dividend_cut",
        "debt_issuance",
        "credit_rating_upgrade",
        "credit_rating_downgrade",
        "regulatory_action",
        "esg_event",
        "other",
      ],
      sector: [
        "banking",
        "insurance",
        "real_estate",
        "retail",
        "healthcare",
        "technology",
        "energy",
        "telecommunications",
        "manufacturing",
        "transportation",
        "construction",
        "other",
      ],
      sentiment: [
        "very_negative",
        "negative",
        "neutral",
        "positive",
        "very_positive",
      ],
      severity: ["low", "medium", "high", "critical"],
    },
  },
} as const
