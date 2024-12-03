 export interface TaskAutomationRequest {
   task_id: string;
   action_type: 'predict_completion' | 'analyze_dependencies';
 }

 export interface TaskPrediction {
   estimated_days: number;
   confidence_range: {
     min: number;
     max: number;
   };
   factors: {
     historical_avg: number;
     complexity_factor: number;
     team_velocity: number;
     dependency_impact: number;
   };
 }

 export interface DependencyAnalysis {
   chain_length: number;
   blocking_items: Array<{
     type: string;
     id: string;
     status: string;
   }>;
   critical_path: string[];
   risk_score: number;
 }