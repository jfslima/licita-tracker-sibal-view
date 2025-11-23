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
      alerts: {
        Row: {
          alert_type: string | null
          created_at: string | null
          id: number
          metadata: Json | null
          notice_id: string | null
          risk_score: number | null
          title: string | null
        }
        Insert: {
          alert_type?: string | null
          created_at?: string | null
          id?: number
          metadata?: Json | null
          notice_id?: string | null
          risk_score?: number | null
          title?: string | null
        }
        Update: {
          alert_type?: string | null
          created_at?: string | null
          id?: number
          metadata?: Json | null
          notice_id?: string | null
          risk_score?: number | null
          title?: string | null
        }
        Relationships: []
      }
      deadline_monitoring_results: {
        Row: {
          company_id: string
          created_at: string | null
          critical_deadlines: number | null
          id: string
          monitoring_date: string | null
          monitoring_result: Json
          total_deadlines: number | null
        }
        Insert: {
          company_id: string
          created_at?: string | null
          critical_deadlines?: number | null
          id?: string
          monitoring_date?: string | null
          monitoring_result: Json
          total_deadlines?: number | null
        }
        Update: {
          company_id?: string
          created_at?: string | null
          critical_deadlines?: number | null
          id?: string
          monitoring_date?: string | null
          monitoring_result?: Json
          total_deadlines?: number | null
        }
        Relationships: []
      }
      document_processing_results: {
        Row: {
          confidence_score: number | null
          created_at: string | null
          document_id: string
          document_type: string
          document_url: string | null
          file_hash: string | null
          file_size_bytes: number | null
          id: string
          notice_id: string
          processing_result: Json
          processing_status: string | null
          processing_time_ms: number | null
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string | null
          document_id: string
          document_type: string
          document_url?: string | null
          file_hash?: string | null
          file_size_bytes?: number | null
          id?: string
          notice_id: string
          processing_result: Json
          processing_status?: string | null
          processing_time_ms?: number | null
        }
        Update: {
          confidence_score?: number | null
          created_at?: string | null
          document_id?: string
          document_type?: string
          document_url?: string | null
          file_hash?: string | null
          file_size_bytes?: number | null
          id?: string
          notice_id?: string
          processing_result?: Json
          processing_status?: string | null
          processing_time_ms?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "document_processing_results_notice_id_fkey"
            columns: ["notice_id"]
            isOneToOne: false
            referencedRelation: "notices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_processing_results_notice_id_fkey"
            columns: ["notice_id"]
            isOneToOne: false
            referencedRelation: "notices_with_stats"
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
      mcp_logs: {
        Row: {
          company_id: string | null
          cost_estimate: number | null
          created_at: string | null
          error_message: string | null
          execution_time_ms: number | null
          id: string
          ip_address: unknown
          method: string
          parameters: Json | null
          request_id: string | null
          response_data: Json | null
          response_status: string
          tokens_used: number | null
          tool_name: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          company_id?: string | null
          cost_estimate?: number | null
          created_at?: string | null
          error_message?: string | null
          execution_time_ms?: number | null
          id?: string
          ip_address?: unknown
          method: string
          parameters?: Json | null
          request_id?: string | null
          response_data?: Json | null
          response_status: string
          tokens_used?: number | null
          tool_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          company_id?: string | null
          cost_estimate?: number | null
          created_at?: string | null
          error_message?: string | null
          execution_time_ms?: number | null
          id?: string
          ip_address?: unknown
          method?: string
          parameters?: Json | null
          request_id?: string | null
          response_data?: Json | null
          response_status?: string
          tokens_used?: number | null
          tool_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      notices: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          detailed_summary: Json | null
          document_urls: string[] | null
          estimated_value: number | null
          external_id: string | null
          id: string
          modality: string
          opening_date: string | null
          organ: string
          risk_analysis: Json | null
          risk_level: string | null
          risk_score: number | null
          source_system: string | null
          status: string | null
          submission_deadline: string
          summary: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
          updated_by: string | null
          url: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          detailed_summary?: Json | null
          document_urls?: string[] | null
          estimated_value?: number | null
          external_id?: string | null
          id?: string
          modality: string
          opening_date?: string | null
          organ: string
          risk_analysis?: Json | null
          risk_level?: string | null
          risk_score?: number | null
          source_system?: string | null
          status?: string | null
          submission_deadline: string
          summary?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          updated_by?: string | null
          url?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          detailed_summary?: Json | null
          document_urls?: string[] | null
          estimated_value?: number | null
          external_id?: string | null
          id?: string
          modality?: string
          opening_date?: string | null
          organ?: string
          risk_analysis?: Json | null
          risk_level?: string | null
          risk_score?: number | null
          source_system?: string | null
          status?: string | null
          submission_deadline?: string
          summary?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          updated_by?: string | null
          url?: string | null
        }
        Relationships: []
      }
      proposal_insights: {
        Row: {
          company_id: string | null
          generated_at: string | null
          id: string
          insights: Json
          is_active: boolean | null
          notice_id: string
          recommended_bid_value: number | null
          updated_at: string | null
          version: number | null
          win_probability_score: number | null
        }
        Insert: {
          company_id?: string | null
          generated_at?: string | null
          id?: string
          insights: Json
          is_active?: boolean | null
          notice_id: string
          recommended_bid_value?: number | null
          updated_at?: string | null
          version?: number | null
          win_probability_score?: number | null
        }
        Update: {
          company_id?: string | null
          generated_at?: string | null
          id?: string
          insights?: Json
          is_active?: boolean | null
          notice_id?: string
          recommended_bid_value?: number | null
          updated_at?: string | null
          version?: number | null
          win_probability_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "proposal_insights_notice_id_fkey"
            columns: ["notice_id"]
            isOneToOne: false
            referencedRelation: "notices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposal_insights_notice_id_fkey"
            columns: ["notice_id"]
            isOneToOne: false
            referencedRelation: "notices_with_stats"
            referencedColumns: ["id"]
          },
        ]
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
      user_follows: {
        Row: {
          alert_types: string[] | null
          company_id: string | null
          followed_at: string | null
          id: string
          is_active: boolean | null
          last_notification_sent: string | null
          notice_id: string
          notification_preferences: Json | null
          user_id: string
        }
        Insert: {
          alert_types?: string[] | null
          company_id?: string | null
          followed_at?: string | null
          id?: string
          is_active?: boolean | null
          last_notification_sent?: string | null
          notice_id: string
          notification_preferences?: Json | null
          user_id: string
        }
        Update: {
          alert_types?: string[] | null
          company_id?: string | null
          followed_at?: string | null
          id?: string
          is_active?: boolean | null
          last_notification_sent?: string | null
          notice_id?: string
          notification_preferences?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_follows_notice_id_fkey"
            columns: ["notice_id"]
            isOneToOne: false
            referencedRelation: "notices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_follows_notice_id_fkey"
            columns: ["notice_id"]
            isOneToOne: false
            referencedRelation: "notices_with_stats"
            referencedColumns: ["id"]
          },
        ]
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
      mcp_metrics_dashboard: {
        Row: {
          avg_execution_time: number | null
          date: string | null
          requests_count: number | null
          response_status: string | null
          tool_name: string | null
          total_cost: number | null
          total_tokens: number | null
        }
        Relationships: []
      }
      notices_with_stats: {
        Row: {
          created_at: string | null
          created_by: string | null
          days_until_deadline: number | null
          description: string | null
          detailed_summary: Json | null
          document_urls: string[] | null
          documents_processed: number | null
          estimated_value: number | null
          external_id: string | null
          followers_count: number | null
          id: string | null
          insights_generated: number | null
          modality: string | null
          opening_date: string | null
          organ: string | null
          risk_analysis: Json | null
          risk_level: string | null
          risk_score: number | null
          source_system: string | null
          status: string | null
          submission_deadline: string | null
          summary: string | null
          tags: string[] | null
          title: string | null
          updated_at: string | null
          updated_by: string | null
          url: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      search_notices: {
        Args: {
          limit_count?: number
          offset_count?: number
          search_query: string
        }
        Returns: {
          description: string
          estimated_value: number
          id: string
          modality: string
          organ: string
          rank: number
          submission_deadline: string
          title: string
        }[]
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
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
