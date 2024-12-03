 import type { Database } from '@/types/database.types';

 type Tables = Database['public']['Tables'];
 type Reports = Tables['reports']['Row'];

 // JSON field types
 export interface ReportMetadata {
   sections: string[];
   filters?: Record<string, any>;
   date_range: {
     start: string;
     end: string;
   };
   generated_by: string;
   generation_time: number;
   version: string;
 }

 export interface ReportSummary {
   total_items: number;
   completion_rate: number;
   timeline_status: 'on_track' | 'delayed' | 'at_risk';
   key_metrics: {
     name: string;
     value: number;
     trend: 'up' | 'down' | 'stable';
   }[];
 }

 export interface ReportSection {
   title: string;
   type: 'metrics' | 'timeline' | 'resources' | 'tasks';
   data: Record<string, any>;
   visualizations?: {
     type: 'chart' | 'table' | 'gauge';
     config: Record<string, any>;
   }[];
 }