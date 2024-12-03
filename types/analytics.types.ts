 import type { Database } from 'types_db';

 type Tables = Database['public']['Tables'];

 // Base Analytics Types
 export interface AnalyticsTimeframe {
   start_date: string;
   end_date: string;
   comparison_period?: 'previous_period' | 'previous_year' | 'custom';
   comparison_start?: string;
   comparison_end?: string;
 }

 export interface AnalyticsDimension {
   name: string;
   operator: 'equals' | 'contains' | 'greater_than' | 'less_than';
   value: string | number | boolean;
 }

 export interface AnalyticsMetric {
   name: string;
   aggregation: 'sum' | 'average' | 'count' | 'min' | 'max';
   field: string;
 }

 // Advanced Analytics Types
 export interface AdvancedAnalyticsQuery {
   timeframe: AnalyticsTimeframe;
   dimensions: AnalyticsDimension[];
   metrics: AnalyticsMetric[];
   filters?: AnalyticsDimension[];
   sort_by?: {
     field: string;
     direction: 'asc' | 'desc';
   };
   limit?: number;
 }

 export interface AnalyticsTrend {
   metric: string;
   data_points: Array<{
     timestamp: string;
     value: number;
     change_percentage?: number;
   }>;
   trend_direction: 'up' | 'down' | 'stable';
   forecast?: Array<{
     timestamp: string;
     predicted_value: number;
     confidence_interval: [number, number];
   }>;
 }

 export interface AnalyticsCorrelation {
   metric_a: string;
   metric_b: string;
   correlation_coefficient: number;
   significance_level: number;
   relationship_type: 'positive' | 'negative' | 'none';
 }

 export interface AnalyticsAnomaly {
   metric: string;
   timestamp: string;
   expected_value: number;
   actual_value: number;
   deviation_percentage: number;
   severity: 'low' | 'medium' | 'high';
   possible_causes?: string[];
 }

 // Visualization Types
 export interface VisualizationConfig {
   type: 'line' | 'bar' | 'pie' | 'scatter' | 'heatmap' | 'funnel' | 'gauge';
   data_source: AdvancedAnalyticsQuery;
   options: {
     title?: string;
     subtitle?: string;
     axis_labels?: {
       x?: string;
       y?: string;
     };
     color_scheme?: string[];
     show_legend?: boolean;
     interactive?: boolean;
     annotations?: Array<{
       type: 'line' | 'point' | 'range' | 'text';
       value: any;
       label?: string;
     }>;
   };
 }

 export interface DashboardConfig {
   layout: Array<{
     id: string;
     visualization: VisualizationConfig;
     position: {
       x: number;
       y: number;
       width: number;
       height: number;
     };
   }>;
   refresh_interval?: number;
   auto_refresh?: boolean;
 }

 // Response Types
 export interface AnalyticsResponse<T> {
   data: T;
   metadata: {
     query_time: number;
     data_freshness: string;
     applied_filters: AnalyticsDimension[];
   };
 }