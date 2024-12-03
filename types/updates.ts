import { Database } from '@/types_db';

export type UpdateType = 'status_change' | 'progress_update' | 'assignment';
export type ObjectType = 'goal' | 'task' | 'milestone' | 'resource' | 'update';

type User = Database['public']['Tables']['users']['Row'];

// Base update interface
interface BaseUpdate {
  id: string;
  type: UpdateType;
  object_type: ObjectType;
  object_id: string;
  content: string;
  creator_id: string;
  created_at: string;
  metadata: UpdateMetadata;
}

// Specific update types
export interface StatusChangeUpdate extends BaseUpdate {
  type: 'status_change';
  metadata: {
    object_name: string;
    previous_status: string;
    new_status: string;
    comments_count: number;
  };
}

export interface ProgressUpdate extends BaseUpdate {
  type: 'progress_update';
  metadata: {
    object_name: string;
    previous_progress: number;
    new_progress: number;
    comments_count: number;
  };
}

export interface AssignmentUpdate extends BaseUpdate {
  type: 'assignment';
  metadata: {
    object_name: string;
    assigned_user: {
      id: string;
      name: string;
      action: 'added' | 'removed';
    };
    comments_count: number;
  };
}

// Union type for all update types
export type Update = 
  | StatusChangeUpdate 
  | ProgressUpdate 
  | AssignmentUpdate;

export interface Comment {
  id: string;
  content: string;
  author_id: string;
  created_at: string;
  edited_at?: string;
  mentions: string[];
  reactions: Reaction[];
  object_type?: ObjectType;
  object_id?: string;
  update_id?: string;
  parent_id?: string;
}

export interface Reaction {
  emoji: string;
  user_ids: string[];
}

export interface UpdateMetadata {
  reactions?: Reaction[];
  comments_count: number;
  object_name?: string;
  previous_status?: string;
  new_status?: string;
  previous_progress?: number;
  new_progress?: number;
  assigned_user?: {
    id: string;
    name: string;
    action: 'added' | 'removed';
  };
}

// Type for comment with resolved author
export interface CommentWithAuthor extends Omit<Comment, 'author_id'> {
  author: User;
}

// Type for reaction with resolved users
export interface ReactionWithUsers extends Omit<Reaction, 'user_ids'> {
  users: User[];
}

// Database table types
export type UpdatesTable = Database['public']['Tables']['updates']['Row'];
export type CommentsTable = Database['public']['Tables']['comments']['Row'];

export interface CommentThread {
  parent: CommentWithAuthor;
  replies: CommentWithAuthor[];
}