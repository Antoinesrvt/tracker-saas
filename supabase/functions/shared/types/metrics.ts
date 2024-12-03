 export interface WorkspaceMetricRequest {
   workspace_id: string;
   metric_type: 'workspace_health' | 'project_timeline';
   start_date?: string;
   end_date?: string;
 }

 export interface WorkspaceHealth {
   health_score: number;
   metrics: {
     goals: {
       total: number;
       active: number;
       completion_rate: number;
     };
     tasks: {
       blocked: number;
       overdue: number;
     };
     activity: {
       weekly_actions: number;
     };
   };
   issues: Array<{
     type: string;
     severity: 'high' | 'medium' | 'low';
     count: number;
   }>;
   recommendations: Array<{
     type: string;
     action: string;
     priority: 'high' | 'medium' | 'low';
   }>;
 }

 export interface ProjectTimeline {
   timeline_metrics: {
     total_goals: number;
     delayed_goals: number;
     at_risk_goals: number;
     resource_utilization: number;
     critical_path_length: number;
   };
   risk_factors: {
     timeline_risk: 'high' | 'medium' | 'low';
     resource_risk: 'high' | 'medium' | 'low';
     complexity_risk: 'high' | 'medium' | 'low';
   };
   optimization_suggestions: Array<{
     type: string;
     suggestion: string;
     impact: 'high' | 'medium' | 'low';
   }>;
 }