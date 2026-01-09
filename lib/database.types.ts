export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      grocery_items: {
        Row: {
          barcode: string | null
          brand: string | null
          categories: string | null
          created_at: string
          food_groups: string | null
          household_id: string | null
          id: string
          image_url: string | null
          is_global: boolean
          name: string | null
          quantity: number | null
          quantity_unit: string | null
          user_id: string | null
        }
        Insert: {
          barcode?: string | null
          brand?: string | null
          categories?: string | null
          created_at?: string
          food_groups?: string | null
          household_id?: string | null
          id?: string
          image_url?: string | null
          is_global?: boolean
          name?: string | null
          quantity?: number | null
          quantity_unit?: string | null
          user_id?: string | null
        }
        Update: {
          barcode?: string | null
          brand?: string | null
          categories?: string | null
          created_at?: string
          food_groups?: string | null
          household_id?: string | null
          id?: string
          image_url?: string | null
          is_global?: boolean
          name?: string | null
          quantity?: number | null
          quantity_unit?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "grocery_items_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grocery_items_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      household_invites: {
        Row: {
          created_at: string
          expires_at: string | null
          household_id: string
          id: string
          max_uses: number | null
          token: string
          used_count: number
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          household_id: string
          id?: string
          max_uses?: number | null
          token: string
          used_count?: number
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          household_id?: string
          id?: string
          max_uses?: number | null
          token?: string
          used_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "household_invites_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      household_users: {
        Row: {
          created_at: string
          household_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          household_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          household_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "household_users_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "household_users_user_id_fkey1"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      households: {
        Row: {
          created_at: string
          id: string
          image_path: string | null
          name: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_path?: string | null
          name?: string | null
          user_id?: string
        }
        Update: {
          created_at?: string
          id?: string
          image_path?: string | null
          name?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "households_user_id_fkey1"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      list_items: {
        Row: {
          checked: boolean
          created_at: string
          grocery_item_id: string
          household_id: string
          id: string
          total_quantity: number
          user_id: string
        }
        Insert: {
          checked?: boolean
          created_at?: string
          grocery_item_id: string
          household_id: string
          id?: string
          total_quantity?: number
          user_id: string
        }
        Update: {
          checked?: boolean
          created_at?: string
          grocery_item_id?: string
          household_id?: string
          id?: string
          total_quantity?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "list_items_grocery_item_id_fkey"
            columns: ["grocery_item_id"]
            isOneToOne: false
            referencedRelation: "grocery_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "list_items_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "list_items_user_id_fkey1"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pantry_batches: {
        Row: {
          created_at: string
          expires_at: string | null
          grocery_item_id: string
          household_id: string
          id: string
          initial_quantity: number
          remaining_quantity: number
          user_id: string | null
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          grocery_item_id: string
          household_id: string
          id?: string
          initial_quantity?: number
          remaining_quantity?: number
          user_id?: string | null
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          grocery_item_id?: string
          household_id?: string
          id?: string
          initial_quantity?: number
          remaining_quantity?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pantry_batches_grocery_item_id_fkey"
            columns: ["grocery_item_id"]
            isOneToOne: false
            referencedRelation: "grocery_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pantry_batches_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pantry_batches_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pantry_events: {
        Row: {
          batch_id: string | null
          created_at: string
          event: Database["public"]["Enums"]["pantry_event_type"]
          id: string
          quantity: number
          user_id: string | null
        }
        Insert: {
          batch_id?: string | null
          created_at?: string
          event: Database["public"]["Enums"]["pantry_event_type"]
          id?: string
          quantity?: number
          user_id?: string | null
        }
        Update: {
          batch_id?: string | null
          created_at?: string
          event?: Database["public"]["Enums"]["pantry_event_type"]
          id?: string
          quantity?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pantry_events_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "pantry_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pantry_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          image_url: string | null
          username: string | null
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id: string
          image_url?: string | null
          username?: string | null
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          image_url?: string | null
          username?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      pantry_items: {
        Row: {
          brand: string | null
          grocery_item_id: string | null
          household_id: string | null
          image_url: string | null
          is_global: boolean | null
          name: string | null
          next_expiration: string | null
          quantity: number | null
          quantity_unit: string | null
          total_quantity: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pantry_batches_grocery_item_id_fkey"
            columns: ["grocery_item_id"]
            isOneToOne: false
            referencedRelation: "grocery_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pantry_batches_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      add_household_user: {
        Args: { p_email: string; p_household_id: string }
        Returns: string
      }
      add_list_item: {
        Args: {
          p_grocery_item_id: string
          p_household_id: string
          p_quantity: number
        }
        Returns: undefined
      }
      add_pantry_batches: {
        Args: { p_household_id: string; p_items: Json }
        Returns: undefined
      }
      checkout_list_items: {
        Args: { p_household_id: string }
        Returns: undefined
      }
      consume_pantry_item: {
        Args: {
          p_grocery_item_id: string
          p_household_id: string
          p_quantity: number
        }
        Returns: undefined
      }
      create_household: { Args: { p_name: string }; Returns: string }
      create_household_invite: {
        Args: { p_expires_in_days?: number; p_household_id: string }
        Returns: string
      }
      delete_user: { Args: never; Returns: undefined }
      get_invite_info_by_token: {
        Args: { p_token: string }
        Returns: {
          creator_display_name: string
          creator_id: string
          creator_username: string
          household_created_at: string
          household_id: string
          household_image_url: string
          household_name: string
          invite_expires_at: string
          invite_id: string
          is_already_member: boolean
        }[]
      }
      is_household_user: { Args: { p_household_id: string }; Returns: boolean }
      merge_grocery_items: {
        Args: { p_source_id: string; p_target_id: string }
        Returns: boolean
      }
      redeem_household_invite: {
        Args: { p_invite_token: string; p_user_id: string }
        Returns: string
      }
      remove_list_item: {
        Args: {
          p_grocery_item_id: string
          p_household_id: string
          p_quantity: number
        }
        Returns: undefined
      }
      toggle_list_item_checked: {
        Args: { p_grocery_item_id: string; p_household_id: string }
        Returns: boolean
      }
    }
    Enums: {
      pantry_event_type: "consume" | "add" | "expire"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      pantry_event_type: ["consume", "add", "expire"],
    },
  },
} as const

