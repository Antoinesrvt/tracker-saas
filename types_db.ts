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
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
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
      checklist_items: {
        Row: {
          completed: boolean
          created_at: string
          id: string
          task_id: string
          text: string
        }
        Insert: {
          completed?: boolean
          created_at?: string
          id?: string
          task_id: string
          text: string
        }
        Update: {
          completed?: boolean
          created_at?: string
          id?: string
          task_id?: string
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "checklist_items_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          author_id: string
          content: string
          created_at: string
          edited_at: string | null
          id: string
          mentions: Json | null
          reactions: Json | null
          update_id: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          edited_at?: string | null
          id?: string
          mentions?: Json | null
          reactions?: Json | null
          update_id: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          edited_at?: string | null
          id?: string
          mentions?: Json | null
          reactions?: Json | null
          update_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_update_id_fkey"
            columns: ["update_id"]
            isOneToOne: false
            referencedRelation: "updates"
            referencedColumns: ["id"]
          },
        ]
      }
      goal_configs: {
        Row: {
          created_at: string
          custom_fields: Json
          id: string
          notification_rules: Json
          permission_matrix: Json
          updated_at: string
          visualization_settings: Json
        }
        Insert: {
          created_at?: string
          custom_fields?: Json
          id?: string
          notification_rules?: Json
          permission_matrix?: Json
          updated_at?: string
          visualization_settings?: Json
        }
        Update: {
          created_at?: string
          custom_fields?: Json
          id?: string
          notification_rules?: Json
          permission_matrix?: Json
          updated_at?: string
          visualization_settings?: Json
        }
        Relationships: []
      }
      goal_connections: {
        Row: {
          created_at: string
          description: string | null
          id: string
          source_goal_id: string
          status: Database["public"]["Enums"]["connection_status"] | null
          strength: Database["public"]["Enums"]["connection_strength"] | null
          target_goal_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          source_goal_id: string
          status?: Database["public"]["Enums"]["connection_status"] | null
          strength?: Database["public"]["Enums"]["connection_strength"] | null
          target_goal_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          source_goal_id?: string
          status?: Database["public"]["Enums"]["connection_status"] | null
          strength?: Database["public"]["Enums"]["connection_strength"] | null
          target_goal_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "goal_connections_source_goal_id_fkey"
            columns: ["source_goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goal_connections_target_goal_id_fkey"
            columns: ["target_goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
        ]
      }
      goals: {
        Row: {
          config_id: string
          connections: Json
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          level: number
          parent_goal_id: string | null
          progress: number
          start_date: string | null
          status: Database["public"]["Enums"]["goal_status"]
          title: string
          type: Database["public"]["Enums"]["goal_type"]
          updated_at: string
          workspace_id: string
        }
        Insert: {
          config_id: string
          connections?: Json
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          level?: number
          parent_goal_id?: string | null
          progress?: number
          start_date?: string | null
          status?: Database["public"]["Enums"]["goal_status"]
          title: string
          type: Database["public"]["Enums"]["goal_type"]
          updated_at?: string
          workspace_id: string
        }
        Update: {
          config_id?: string
          connections?: Json
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          level?: number
          parent_goal_id?: string | null
          progress?: number
          start_date?: string | null
          status?: Database["public"]["Enums"]["goal_status"]
          title?: string
          type?: Database["public"]["Enums"]["goal_type"]
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "goals_config_id_fkey"
            columns: ["config_id"]
            isOneToOne: false
            referencedRelation: "goal_configs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goals_parent_goal_id_fkey"
            columns: ["parent_goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goals_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      kpis: {
        Row: {
          color: string | null
          created_at: string
          goal_id: string
          id: string
          name: string
          target: number
          type: string
          unit: string
          updated_at: string
          value: number
        }
        Insert: {
          color?: string | null
          created_at?: string
          goal_id: string
          id?: string
          name: string
          target: number
          type: string
          unit: string
          updated_at?: string
          value: number
        }
        Update: {
          color?: string | null
          created_at?: string
          goal_id?: string
          id?: string
          name?: string
          target?: number
          type?: string
          unit?: string
          updated_at?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "kpis_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
        ]
      }
      metric_configs: {
        Row: {
          calculation_rules: Json
          created_at: string
          id: string
          refresh_rate: unknown
          required_datapoints: string[] | null
          thresholds: Json
        }
        Insert: {
          calculation_rules?: Json
          created_at?: string
          id?: string
          refresh_rate?: unknown
          required_datapoints?: string[] | null
          thresholds?: Json
        }
        Update: {
          calculation_rules?: Json
          created_at?: string
          id?: string
          refresh_rate?: unknown
          required_datapoints?: string[] | null
          thresholds?: Json
        }
        Relationships: []
      }
      metrics: {
        Row: {
          config_id: string
          current_values: Json
          historical_values: Json
          id: string
          last_calculated: string
          target_id: string
        }
        Insert: {
          config_id: string
          current_values?: Json
          historical_values?: Json
          id?: string
          last_calculated?: string
          target_id: string
        }
        Update: {
          config_id?: string
          current_values?: Json
          historical_values?: Json
          id?: string
          last_calculated?: string
          target_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "metrics_config_id_fkey"
            columns: ["config_id"]
            isOneToOne: false
            referencedRelation: "metric_configs"
            referencedColumns: ["id"]
          },
        ]
      }
      milestones: {
        Row: {
          created_at: string
          description: string | null
          goal_id: string | null
          id: string
          is_critical: boolean
          position: number
          start_date: string | null
          status: Database["public"]["Enums"]["goal_status"]
          target_date: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          goal_id?: string | null
          id?: string
          is_critical?: boolean
          position?: number
          start_date?: string | null
          status?: Database["public"]["Enums"]["goal_status"]
          target_date?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          goal_id?: string | null
          id?: string
          is_critical?: boolean
          position?: number
          start_date?: string | null
          status?: Database["public"]["Enums"]["goal_status"]
          target_date?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "milestones_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          name: string
          settings: Json
          subscription_plan: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          settings?: Json
          subscription_plan?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          settings?: Json
          subscription_plan?: string
          user_id?: string
        }
        Relationships: []
      }
      resource_targets: {
        Row: {
          attached_at: string
          id: string
          resource_id: string
          target_id: string
          target_type: string
        }
        Insert: {
          attached_at?: string
          id?: string
          resource_id: string
          target_id: string
          target_type: string
        }
        Update: {
          attached_at?: string
          id?: string
          resource_id?: string
          target_id?: string
          target_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "resource_targets_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
        ]
      }
      resources: {
        Row: {
          created_at: string
          creator_id: string
          id: string
          is_active: boolean
          location: string | null
          metadata: Json | null
          organization_id: string
          title: string
          type: Database["public"]["Enums"]["resource_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          creator_id: string
          id?: string
          is_active?: boolean
          location?: string | null
          metadata?: Json | null
          organization_id: string
          title: string
          type: Database["public"]["Enums"]["resource_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          creator_id?: string
          id?: string
          is_active?: boolean
          location?: string | null
          metadata?: Json | null
          organization_id?: string
          title?: string
          type?: Database["public"]["Enums"]["resource_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "resources_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      subtasks: {
        Row: {
          completed: boolean
          created_at: string
          id: string
          task_id: string
          title: string
          updated_at: string
        }
        Insert: {
          completed?: boolean
          created_at?: string
          id?: string
          task_id: string
          title: string
          updated_at?: string
        }
        Update: {
          completed?: boolean
          created_at?: string
          id?: string
          task_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subtasks_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_templates: {
        Row: {
          category: string | null
          checklist: Json | null
          created_at: string
          description: string | null
          estimated_time: number | null
          id: string
          labels: string[] | null
          priority: Database["public"]["Enums"]["task_priority"]
          title: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          category?: string | null
          checklist?: Json | null
          created_at?: string
          description?: string | null
          estimated_time?: number | null
          id?: string
          labels?: string[] | null
          priority?: Database["public"]["Enums"]["task_priority"]
          title: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          category?: string | null
          checklist?: Json | null
          created_at?: string
          description?: string | null
          estimated_time?: number | null
          id?: string
          labels?: string[] | null
          priority?: Database["public"]["Enums"]["task_priority"]
          title?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_templates_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          actual_cost: number | null
          actual_hours: number | null
          budget: number | null
          created_at: string
          custom_fields: Json | null
          deadline: string | null
          description: string | null
          estimated_hours: number | null
          goal_id: string
          id: string
          milestone_id: string | null
          priority: Database["public"]["Enums"]["task_priority"]
          status: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at: string
        }
        Insert: {
          actual_cost?: number | null
          actual_hours?: number | null
          budget?: number | null
          created_at?: string
          custom_fields?: Json | null
          deadline?: string | null
          description?: string | null
          estimated_hours?: number | null
          goal_id: string
          id?: string
          milestone_id?: string | null
          priority?: Database["public"]["Enums"]["task_priority"]
          status?: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at?: string
        }
        Update: {
          actual_cost?: number | null
          actual_hours?: number | null
          budget?: number | null
          created_at?: string
          custom_fields?: Json | null
          deadline?: string | null
          description?: string | null
          estimated_hours?: number | null
          goal_id?: string
          id?: string
          milestone_id?: string | null
          priority?: Database["public"]["Enums"]["task_priority"]
          status?: Database["public"]["Enums"]["task_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_milestone_id_fkey"
            columns: ["milestone_id"]
            isOneToOne: false
            referencedRelation: "milestones"
            referencedColumns: ["id"]
          },
        ]
      }
      team_assignments: {
        Row: {
          assignable_id: string
          assignable_type: string
          created_at: string
          id: string
          role: Database["public"]["Enums"]["team_role"]
          updated_at: string
          user_id: string
          valid_period: unknown
        }
        Insert: {
          assignable_id: string
          assignable_type: string
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["team_role"]
          updated_at?: string
          user_id: string
          valid_period?: unknown
        }
        Update: {
          assignable_id?: string
          assignable_type?: string
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["team_role"]
          updated_at?: string
          user_id?: string
          valid_period?: unknown
        }
        Relationships: []
      }
      updates: {
        Row: {
          created_at: string
          creator_id: string
          id: string
          mentions: string[] | null
          payload: Json
          target_id: string
          type: Database["public"]["Enums"]["update_type"]
        }
        Insert: {
          created_at?: string
          creator_id: string
          id?: string
          mentions?: string[] | null
          payload?: Json
          target_id: string
          type: Database["public"]["Enums"]["update_type"]
        }
        Update: {
          created_at?: string
          creator_id?: string
          id?: string
          mentions?: string[] | null
          payload?: Json
          target_id?: string
          type?: Database["public"]["Enums"]["update_type"]
        }
        Relationships: []
      }
      workspaces: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          name: string
          organization_id: string
          settings: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          organization_id: string
          settings?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          organization_id?: string
          settings?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspaces_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_goal_progress: {
        Args: {
          goal_id: string
        }
        Returns: number
      }
      calculate_metrics: {
        Args: {
          target_id: string
        }
        Returns: Json
      }
      gtrgm_compress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gtrgm_decompress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gtrgm_in: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gtrgm_options: {
        Args: {
          "": unknown
        }
        Returns: undefined
      }
      gtrgm_out: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      set_limit: {
        Args: {
          "": number
        }
        Returns: number
      }
      show_limit: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      show_trgm: {
        Args: {
          "": string
        }
        Returns: string[]
      }
    }
    Enums: {
      audit_action: "create" | "update" | "delete" | "archive" | "restore"
      connection_status: "active" | "blocked" | "completed"
      connection_strength: "strong" | "weak" | "medium"
      goal_status: "draft" | "active" | "completed" | "archived" | "blocked"
      goal_type: "fondation" | "action" | "strategie" | "vision"
      resource_type: "file" | "link" | "document"
      task_priority: "low" | "medium" | "high" | "critical"
      task_status: "todo" | "in_progress" | "completed" | "blocked"
      team_role: "owner" | "admin" | "member" | "viewer"
      update_type:
        | "comment"
        | "status_change"
        | "progress_update"
        | "milestone"
        | "assignment"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  storage: {
    Tables: {
      buckets: {
        Row: {
          allowed_mime_types: string[] | null
          avif_autodetection: boolean | null
          created_at: string | null
          file_size_limit: number | null
          id: string
          name: string
          owner: string | null
          owner_id: string | null
          public: boolean | null
          updated_at: string | null
        }
        Insert: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id: string
          name: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          updated_at?: string | null
        }
        Update: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id?: string
          name?: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      migrations: {
        Row: {
          executed_at: string | null
          hash: string
          id: number
          name: string
        }
        Insert: {
          executed_at?: string | null
          hash: string
          id: number
          name: string
        }
        Update: {
          executed_at?: string | null
          hash?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      objects: {
        Row: {
          bucket_id: string | null
          created_at: string | null
          id: string
          last_accessed_at: string | null
          metadata: Json | null
          name: string | null
          owner: string | null
          owner_id: string | null
          path_tokens: string[] | null
          updated_at: string | null
          user_metadata: Json | null
          version: string | null
        }
        Insert: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          user_metadata?: Json | null
          version?: string | null
        }
        Update: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          user_metadata?: Json | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "objects_bucketId_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      s3_multipart_uploads: {
        Row: {
          bucket_id: string
          created_at: string
          id: string
          in_progress_size: number
          key: string
          owner_id: string | null
          upload_signature: string
          user_metadata: Json | null
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          id: string
          in_progress_size?: number
          key: string
          owner_id?: string | null
          upload_signature: string
          user_metadata?: Json | null
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          id?: string
          in_progress_size?: number
          key?: string
          owner_id?: string | null
          upload_signature?: string
          user_metadata?: Json | null
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      s3_multipart_uploads_parts: {
        Row: {
          bucket_id: string
          created_at: string
          etag: string
          id: string
          key: string
          owner_id: string | null
          part_number: number
          size: number
          upload_id: string
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          etag: string
          id?: string
          key: string
          owner_id?: string | null
          part_number: number
          size?: number
          upload_id: string
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          etag?: string
          id?: string
          key?: string
          owner_id?: string | null
          part_number?: number
          size?: number
          upload_id?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_parts_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "s3_multipart_uploads_parts_upload_id_fkey"
            columns: ["upload_id"]
            isOneToOne: false
            referencedRelation: "s3_multipart_uploads"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_insert_object: {
        Args: {
          bucketid: string
          name: string
          owner: string
          metadata: Json
        }
        Returns: undefined
      }
      extension: {
        Args: {
          name: string
        }
        Returns: string
      }
      filename: {
        Args: {
          name: string
        }
        Returns: string
      }
      foldername: {
        Args: {
          name: string
        }
        Returns: string[]
      }
      get_size_by_bucket: {
        Args: Record<PropertyKey, never>
        Returns: {
          size: number
          bucket_id: string
        }[]
      }
      list_multipart_uploads_with_delimiter: {
        Args: {
          bucket_id: string
          prefix_param: string
          delimiter_param: string
          max_keys?: number
          next_key_token?: string
          next_upload_token?: string
        }
        Returns: {
          key: string
          id: string
          created_at: string
        }[]
      }
      list_objects_with_delimiter: {
        Args: {
          bucket_id: string
          prefix_param: string
          delimiter_param: string
          max_keys?: number
          start_after?: string
          next_token?: string
        }
        Returns: {
          name: string
          id: string
          metadata: Json
          updated_at: string
        }[]
      }
      operation: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      search: {
        Args: {
          prefix: string
          bucketname: string
          limits?: number
          levels?: number
          offsets?: number
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          name: string
          id: string
          updated_at: string
          created_at: string
          last_accessed_at: string
          metadata: Json
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
