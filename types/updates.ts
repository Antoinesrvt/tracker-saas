import { Database } from '@/types_db';

// Database table types
type TablesRow<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type UpdateRow = TablesRow<'updates'>;
export type CommentRow = TablesRow<'comments'>;
export type UpdateType = 'status_change' | 'progress_update' | 'assignment';
export type ObjectType = 'goal' | 'task' | 'milestone' | 'resource' | 'update';

// JSON field types for updates metadata
export interface UpdateMetadata {
  object_name: string;
  previous_status?: string;
  new_status?: string;
  previous_progress?: number;
  new_progress?: number;
  assigned_user?: {
    id: string;
    name: string;
    action: 'added' | 'removed';
  };
  reactions: Array<{
    emoji: string;
    user_ids: string[];
  }>;
}


export interface CommentWithAuthor extends CommentRow {
  author: TablesRow<'users'>;
}

export interface CommentThread {
  parent: CommentWithAuthor;
  replies: CommentWithAuthor[];
}