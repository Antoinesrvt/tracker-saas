import type { Database } from 'types_db';

export type Goal = Database['public']['Tables']['goals']['Row'];
export type GoalConnection =
  Database['public']['Tables']['goal_connections']['Row'];

export interface GoalDetails {
  id: string;
  metrics: {
    completion: number;
    tasks_completed: number;
    total_tasks: number;
    days_remaining: number;
  };
  connections: {
    incoming: GoalConnection[];
    outgoing: GoalConnection[];
  };
  timeline: {
    start_date: string | null;
    end_date: string | null;
    duration: number;
    progress: number;
  };
}
