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
      candidate_applications: {
        Row: {
          bio: string | null
          created_at: string | null
          election_id: string
          feedback: string | null
          id: string
          image_url: string | null
          name: string
          position: string
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          bio?: string | null
          created_at?: string | null
          election_id: string
          feedback?: string | null
          id?: string
          image_url?: string | null
          name: string
          position: string
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          bio?: string | null
          created_at?: string | null
          election_id?: string
          feedback?: string | null
          id?: string
          image_url?: string | null
          name?: string
          position?: string
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "candidate_applications_election_id_fkey"
            columns: ["election_id"]
            isOneToOne: false
            referencedRelation: "elections"
            referencedColumns: ["id"]
          },
        ]
      }
      candidates: {
        Row: {
          bio: string | null
          created_at: string | null
          created_by: string | null
          department: string | null
          election_id: string | null
          id: string
          image_url: string | null
          name: string
          position: string
          student_id: string | null
          year_level: string | null
        }
        Insert: {
          bio?: string | null
          created_at?: string | null
          created_by?: string | null
          department?: string | null
          election_id?: string | null
          id?: string
          image_url?: string | null
          name: string
          position: string
          student_id?: string | null
          year_level?: string | null
        }
        Update: {
          bio?: string | null
          created_at?: string | null
          created_by?: string | null
          department?: string | null
          election_id?: string | null
          id?: string
          image_url?: string | null
          name?: string
          position?: string
          student_id?: string | null
          year_level?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "candidates_election_id_fkey"
            columns: ["election_id"]
            isOneToOne: false
            referencedRelation: "elections"
            referencedColumns: ["id"]
          },
        ]
      }
      elections: {
        Row: {
          access_code: string | null
          banner_urls: string[] | null
          candidacy_end_date: string | null
          candidacy_start_date: string | null
          created_at: string | null
          created_by: string | null
          department: string | null
          departments: string[] | null
          description: string | null
          eligible_year_levels: string[] | null
          end_date: string
          id: string
          is_private: boolean | null
          positions: string[] | null
          restrict_voting: boolean | null
          start_date: string
          status: string
          title: string
          updated_at: string | null
        }
        Insert: {
          access_code?: string | null
          banner_urls?: string[] | null
          candidacy_end_date?: string | null
          candidacy_start_date?: string | null
          created_at?: string | null
          created_by?: string | null
          department?: string | null
          departments?: string[] | null
          description?: string | null
          eligible_year_levels?: string[] | null
          end_date: string
          id?: string
          is_private?: boolean | null
          positions?: string[] | null
          restrict_voting?: boolean | null
          start_date: string
          status: string
          title: string
          updated_at?: string | null
        }
        Update: {
          access_code?: string | null
          banner_urls?: string[] | null
          candidacy_end_date?: string | null
          candidacy_start_date?: string | null
          created_at?: string | null
          created_by?: string | null
          department?: string | null
          departments?: string[] | null
          description?: string | null
          eligible_year_levels?: string[] | null
          end_date?: string
          id?: string
          is_private?: boolean | null
          positions?: string[] | null
          restrict_voting?: boolean | null
          start_date?: string
          status?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      eligible_voters: {
        Row: {
          added_by: string
          created_at: string
          election_id: string
          id: string
          user_id: string
        }
        Insert: {
          added_by: string
          created_at?: string
          election_id: string
          id?: string
          user_id: string
        }
        Update: {
          added_by?: string
          created_at?: string
          election_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "eligible_voters_election_id_fkey"
            columns: ["election_id"]
            isOneToOne: false
            referencedRelation: "elections"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          department: string | null
          email: string
          first_name: string
          id: string
          image_url: string | null
          is_verified: boolean | null
          last_name: string
          student_id: string | null
          updated_at: string
          year_level: string | null
        }
        Insert: {
          created_at?: string
          department?: string | null
          email: string
          first_name: string
          id: string
          image_url?: string | null
          is_verified?: boolean | null
          last_name: string
          student_id?: string | null
          updated_at?: string
          year_level?: string | null
        }
        Update: {
          created_at?: string
          department?: string | null
          email?: string
          first_name?: string
          id?: string
          image_url?: string | null
          is_verified?: boolean | null
          last_name?: string
          student_id?: string | null
          updated_at?: string
          year_level?: string | null
        }
        Relationships: []
      }
      settings: {
        Row: {
          category: string
          created_at: string
          id: string
          settings_value: Json
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          settings_value?: Json
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          settings_value?: Json
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: []
      }
      votes: {
        Row: {
          candidate_id: string | null
          election_id: string | null
          id: string
          position: string | null
          timestamp: string | null
          user_id: string | null
        }
        Insert: {
          candidate_id?: string | null
          election_id?: string | null
          id?: string
          position?: string | null
          timestamp?: string | null
          user_id?: string | null
        }
        Update: {
          candidate_id?: string | null
          election_id?: string | null
          id?: string
          position?: string | null
          timestamp?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "votes_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "votes_election_id_fkey"
            columns: ["election_id"]
            isOneToOne: false
            referencedRelation: "elections"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["user_role"]
        }
        Returns: boolean
      }
    }
    Enums: {
      user_role: "admin" | "voter"
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
      user_role: ["admin", "voter"],
    },
  },
} as const
