export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      ai_analysis_requests: {
        Row: {
          analysis_type: string
          completed_at: string | null
          created_at: string
          id: string
          input_data: Json
          licitacao_id: string
          result: Json | null
          status: string | null
          tokens_used: number | null
          user_id: string
        }
        Insert: {
          analysis_type: string
          completed_at?: string | null
          created_at?: string
          id?: string
          input_data: Json
          licitacao_id: string
          result?: Json | null
          status?: string | null
          tokens_used?: number | null
          user_id: string
        }
        Update: {
          analysis_type?: string
          completed_at?: string | null
          created_at?: string
          id?: string
          input_data?: Json
          licitacao_id?: string
          result?: Json | null
          status?: string | null
          tokens_used?: number | null
          user_id?: string
        }
        Relationships: []
      }
      alert_matches: {
        Row: {
          alert_id: string
          created_at: string
          id: string
          licitacao_id: string
          matched_keywords: string[] | null
          notified: boolean | null
          relevance_score: number | null
        }
        Insert: {
          alert_id: string
          created_at?: string
          id?: string
          licitacao_id: string
          matched_keywords?: string[] | null
          notified?: boolean | null
          relevance_score?: number | null
        }
        Update: {
          alert_id?: string
          created_at?: string
          id?: string
          licitacao_id?: string
          matched_keywords?: string[] | null
          notified?: boolean | null
          relevance_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "alert_matches_alert_id_fkey"
            columns: ["alert_id"]
            isOneToOne: false
            referencedRelation: "user_alerts"
            referencedColumns: ["id"]
          },
        ]
      }
      licitacoes: {
        Row: {
          atualizado_em: string
          criado_em: string
          id: string
          objeto: string
          prazo: string | null
          raw_data: Json | null
          resumo_ia: string | null
          valor: number | null
        }
        Insert: {
          atualizado_em?: string
          criado_em?: string
          id?: string
          objeto: string
          prazo?: string | null
          raw_data?: Json | null
          resumo_ia?: string | null
          valor?: number | null
        }
        Update: {
          atualizado_em?: string
          criado_em?: string
          id?: string
          objeto?: string
          prazo?: string | null
          raw_data?: Json | null
          resumo_ia?: string | null
          valor?: number | null
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          ai_analysis: boolean | null
          api_access: boolean | null
          created_at: string
          description: string | null
          features: Json | null
          id: string
          max_alerts: number | null
          max_searches: number | null
          name: string
          price_monthly: number
          price_yearly: number | null
          priority_support: boolean | null
          updated_at: string
        }
        Insert: {
          ai_analysis?: boolean | null
          api_access?: boolean | null
          created_at?: string
          description?: string | null
          features?: Json | null
          id?: string
          max_alerts?: number | null
          max_searches?: number | null
          name: string
          price_monthly: number
          price_yearly?: number | null
          priority_support?: boolean | null
          updated_at?: string
        }
        Update: {
          ai_analysis?: boolean | null
          api_access?: boolean | null
          created_at?: string
          description?: string | null
          features?: Json | null
          id?: string
          max_alerts?: number | null
          max_searches?: number | null
          name?: string
          price_monthly?: number
          price_yearly?: number | null
          priority_support?: boolean | null
          updated_at?: string
        }
        Relationships: []
      }
      user_alerts: {
        Row: {
          created_at: string
          filters: Json | null
          id: string
          is_active: boolean | null
          keywords: string[]
          last_checked: string | null
          name: string
          notification_email: boolean | null
          notification_sms: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          filters?: Json | null
          id?: string
          is_active?: boolean | null
          keywords: string[]
          last_checked?: string | null
          name: string
          notification_email?: boolean | null
          notification_sms?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          filters?: Json | null
          id?: string
          is_active?: boolean | null
          keywords?: string[]
          last_checked?: string | null
          name?: string
          notification_email?: boolean | null
          notification_sms?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_analytics: {
        Row: {
          action: string
          created_at: string
          id: string
          metadata: Json | null
          resource_id: string | null
          resource_type: string | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          metadata?: Json | null
          resource_id?: string | null
          resource_type?: string | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          resource_id?: string | null
          resource_type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          payment_method: Json | null
          plan_id: string
          started_at: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          payment_method?: Json | null
          plan_id: string
          started_at?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          payment_method?: Json | null
          plan_id?: string
          started_at?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
