// Base interface for all linkable objects
export interface LinkableObject {
  id: string;
  created_at: string;
  updated_at: string;
  created_by: string;
}

// Specific interfaces for each type
export interface KPIConfig extends LinkableObject {
  type: 'kpi';
  metric_name: string;
  target_value: number;
  current_value: number;
  frequency: 'daily' | 'weekly' | 'monthly';
}

export interface TeamAssignment extends LinkableObject {
  type: 'team';
  user_id: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  permissions: string[];
}

export interface Update extends LinkableObject {
  type: 'update';
  content: string;
  status: 'draft' | 'published';
  visibility: 'public' | 'team' | 'private';
}

export interface Comment extends LinkableObject {
  type: 'comment';
  content: string;
  parent_id?: string;
  mentions: string[];
  reactions: Record<string, string[]>;
}

// Type union for all linkable objects
export type LinkableObjectType = KPIConfig | TeamAssignment | Update | Comment;

// Target types
export type TargetType = 'goal' | 'milestone' | 'task' | 'workspace'; 