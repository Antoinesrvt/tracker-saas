 import type { Database } from 'types_db';

 type Tables = Database['public']['Tables'];
 type Tasks = Tables['tasks']['Row'];
 type Goals = Tables['goals']['Row'];

 export interface TaskPrediction {
   estimated_completion: string;
   confidence_level: number;
   factors: {
     historical_completion_time: number;
     team_velocity: number;
     complexity_score: number;
     dependency_impact: number;
     resource_availability: number;
   };
   risks: {
     type: 'timeline' | 'resource' | 'dependency';
     level: 'low' | 'medium' | 'high';
     description: string;
   }[];
 }

 export interface ResourceForecast {
   period: string;
   utilization: number;
   bottlenecks: {
     resource_type: string;
     impact_level: number;
     affected_tasks: string[];
   }[];
   recommendations: {
     action: string;
     impact: 'low' | 'medium' | 'high';
     details: string;
   }[];
 }