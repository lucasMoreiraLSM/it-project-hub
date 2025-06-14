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
      custom_field_options: {
        Row: {
          created_at: string
          field_name: string
          id: string
          option_value: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          field_name: string
          id?: string
          option_value: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          field_name?: string
          id?: string
          option_value?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          nome: string | null
          password_set: boolean
          perfil: Database["public"]["Enums"]["user_profile"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id: string
          nome?: string | null
          password_set?: boolean
          perfil?: Database["public"]["Enums"]["user_profile"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          nome?: string | null
          password_set?: boolean
          perfil?: Database["public"]["Enums"]["user_profile"]
          updated_at?: string | null
        }
        Relationships: []
      }
      project_history: {
        Row: {
          created_at: string
          data_atualizacao: string
          farol: string
          id: string
          percentual_desvio: number
          percentual_previsto_total: number
          percentual_realizado_total: number
          project_id: string
          total_dias: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          data_atualizacao?: string
          farol?: string
          id?: string
          percentual_desvio?: number
          percentual_previsto_total?: number
          percentual_realizado_total?: number
          project_id: string
          total_dias?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          data_atualizacao?: string
          farol?: string
          id?: string
          percentual_desvio?: number
          percentual_previsto_total?: number
          percentual_realizado_total?: number
          project_id?: string
          total_dias?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      project_locks: {
        Row: {
          expires_at: string
          id: string
          locked_at: string
          project_id: string
          user_id: string
          user_name: string
        }
        Insert: {
          expires_at?: string
          id?: string
          locked_at?: string
          project_id: string
          user_id: string
          user_name: string
        }
        Update: {
          expires_at?: string
          id?: string
          locked_at?: string
          project_id?: string
          user_id?: string
          user_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_locks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: true
            referencedRelation: "projetos"
            referencedColumns: ["id"]
          },
        ]
      }
      projetos: {
        Row: {
          area_negocio: string | null
          created_at: string | null
          created_by_user_id: string | null
          cronograma: Json | null
          escopo: Json | null
          estrategico_tatico: string | null
          etapas_executadas: Json | null
          gerente_projetos: string | null
          gerente_projetos_user_id: string | null
          id: string
          inovacao_melhoria: string | null
          last_updated_at: string | null
          last_updated_by_name: string | null
          lider_projeto_user_id: string | null
          lider_projetos_ti: string | null
          nome: string
          objetivos: Json | null
          pontos_atencao: Json | null
          product_owner: string | null
          proximas_etapas: Json | null
          sponsor: string | null
          time_ti: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          area_negocio?: string | null
          created_at?: string | null
          created_by_user_id?: string | null
          cronograma?: Json | null
          escopo?: Json | null
          estrategico_tatico?: string | null
          etapas_executadas?: Json | null
          gerente_projetos?: string | null
          gerente_projetos_user_id?: string | null
          id?: string
          inovacao_melhoria?: string | null
          last_updated_at?: string | null
          last_updated_by_name?: string | null
          lider_projeto_user_id?: string | null
          lider_projetos_ti?: string | null
          nome: string
          objetivos?: Json | null
          pontos_atencao?: Json | null
          product_owner?: string | null
          proximas_etapas?: Json | null
          sponsor?: string | null
          time_ti?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          area_negocio?: string | null
          created_at?: string | null
          created_by_user_id?: string | null
          cronograma?: Json | null
          escopo?: Json | null
          estrategico_tatico?: string | null
          etapas_executadas?: Json | null
          gerente_projetos?: string | null
          gerente_projetos_user_id?: string | null
          id?: string
          inovacao_melhoria?: string | null
          last_updated_at?: string | null
          last_updated_by_name?: string | null
          lider_projeto_user_id?: string | null
          lider_projetos_ti?: string | null
          nome?: string
          objetivos?: Json | null
          pontos_atencao?: Json | null
          product_owner?: string | null
          proximas_etapas?: Json | null
          sponsor?: string | null
          time_ti?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_delete_project: {
        Args: { project_id: string; user_id: string }
        Returns: boolean
      }
      can_edit_project: {
        Args: { project_id: string; user_id: string }
        Returns: boolean
      }
      cleanup_expired_locks: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_user_profile: {
        Args: { user_id: string }
        Returns: Database["public"]["Enums"]["user_profile"]
      }
    }
    Enums: {
      user_profile: "administrador" | "gerencia" | "colaborador"
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
      user_profile: ["administrador", "gerencia", "colaborador"],
    },
  },
} as const
