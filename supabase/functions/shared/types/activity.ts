 export type ActivityEventType =
   | 'goal_created'
   | 'goal_updated'
   | 'task_completed'
   | 'milestone_reached'
   | 'comment_added'
   | 'resource_uploaded';

 export interface ActivityEvent {
   id: string;
   workspace_id: string;
   user_id: string;
   event_type: ActivityEventType;
   target_id: string;
   target_type: 'goal' | 'task' | 'milestone' | 'resource';
   metadata: Record<string, any>;
   created_at: string;
 }

 export interface ActivityAggregation {
   total_events: number;
   events_by_type: Record<ActivityEventType, number>;
   active_users: number;
   completion_rate: number;
   trending_resources: Array<{
     id: string;
     type: string;
     access_count: number;
   }>;
 }

 export interface ActivityResponse {
   events?: ActivityEvent[];
   aggregation?: ActivityAggregation;
   period_start?: string;
   period_end?: string;
   pagination?: {
     total: number;
     page: number;
     per_page: number;
   };
 }