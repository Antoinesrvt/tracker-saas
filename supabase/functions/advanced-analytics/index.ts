 import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';
 import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';
 import { createServerSupabase } from '../shared/supabase.ts';
 import { createApiResponse, ApiError } from '../shared/api-handler.ts';
 import type {
   AdvancedAnalyticsQuery,
   AnalyticsTrend,
   AnalyticsCorrelation,
   AnalyticsAnomaly
 } from '../shared/types/analytics.ts';

 const requestSchema = z.object({
   workspace_id: z.string().uuid(),
   action: z.enum([
     'analyze_trends',
     'find_correlations',
     'detect_anomalies',
     'custom_query'
   ]),
   metrics: z.array(z.string()).optional(),
   timeframe: z.object({
     start_date: z.string().datetime(),
     end_date: z.string().datetime(),
     comparison_period: z
       .enum(['previous_period', 'previous_year', 'custom'])
       .optional(),
     comparison_start: z.string().datetime().optional(),
     comparison_end: z.string().datetime().optional()
   }),
   query: z.any().optional() // For custom queries
 });

 serve((req: Request) => {
   return createApiResponse(async () => {
     const supabase = createServerSupabase();
     const body = await req.json();
     const validatedBody = requestSchema.parse(body);

     // Check access
     const { data: hasAccess } = await supabase.rpc('has_team_access', {
       target_type: 'workspace',
       target_id: validatedBody.workspace_id,
       required_roles: ['owner', 'admin', 'member']
     });

     if (!hasAccess) throw new ApiError('Insufficient permissions', 403);

     switch (validatedBody.action) {
       case 'analyze_trends':
         return await analyzeTrends(supabase, validatedBody);
       case 'find_correlations':
         return await findCorrelations(supabase, validatedBody);
       case 'detect_anomalies':
         return await detectAnomalies(supabase, validatedBody);
       case 'custom_query':
         return await runCustomQuery(supabase, validatedBody);
       default:
         throw new ApiError('Invalid action');
     }
   });
 });

 async function analyzeTrends(
   supabase: any,
   params: any
 ): Promise<AnalyticsTrend[]> {
   const { data: metrics, error: metricsError } = await supabase.rpc(
     'calculate_metric_trends',
     {
       p_workspace_id: params.workspace_id,
       p_metrics: params.metrics,
       p_start_date: params.timeframe.start_date,
       p_end_date: params.timeframe.end_date,
       p_comparison_period: params.timeframe.comparison_period
     }
   );

   if (metricsError) throw metricsError;

   // Process and format trend data
   return metrics.map((m: any) => ({
     metric: m.metric_name,
     data_points: m.data_points,
     trend_direction: calculateTrendDirection(m.data_points),
     forecast: m.forecast_points
   }));
 }

 async function findCorrelations(
   supabase: any,
   params: any
 ): Promise<AnalyticsCorrelation[]> {
   const { data: correlations, error } = await supabase.rpc(
     'analyze_metric_correlations',
     {
       p_workspace_id: params.workspace_id,
       p_metrics: params.metrics,
       p_start_date: params.timeframe.start_date,
       p_end_date: params.timeframe.end_date
     }
   );

   if (error) throw error;

   return correlations.map((c: any) => ({
     metric_a: c.metric_a,
     metric_b: c.metric_b,
     correlation_coefficient: c.coefficient,
     significance_level: c.significance,
     relationship_type: determineRelationshipType(c.coefficient)
   }));
 }

 async function detectAnomalies(
   supabase: any,
   params: any
 ): Promise<AnalyticsAnomaly[]> {
   const { data: anomalies, error } = await supabase.rpc(
     'detect_metric_anomalies',
     {
       p_workspace_id: params.workspace_id,
       p_metrics: params.metrics,
       p_start_date: params.timeframe.start_date,
       p_end_date: params.timeframe.end_date
     }
   );

   if (error) throw error;

   return anomalies.map((a: any) => ({
     metric: a.metric_name,
     timestamp: a.detected_at,
     expected_value: a.expected_value,
     actual_value: a.actual_value,
     deviation_percentage: a.deviation,
     severity: calculateAnomalySeverity(a.deviation),
     possible_causes: analyzePossibleCauses(a)
   }));
 }

 async function runCustomQuery(supabase: any, params: any) {
   const { query } = params;

   // Validate and sanitize custom query parameters
   if (!query.metrics?.length || !query.dimensions?.length) {
     throw new ApiError('Invalid query configuration');
   }

   const { data, error } = await supabase.rpc('execute_custom_analytics', {
     p_workspace_id: params.workspace_id,
     p_query_config: query
   });

   if (error) throw error;
   return data;
 }

 // Helper functions
 function calculateTrendDirection(dataPoints: any[]): 'up' | 'down' | 'stable' {
   // Implement trend calculation logic
   const values = dataPoints.map((p) => p.value);
   const firstHalf = values.slice(0, Math.floor(values.length / 2));
   const secondHalf = values.slice(Math.floor(values.length / 2));

   const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
   const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

   const change = ((secondAvg - firstAvg) / firstAvg) * 100;

   if (Math.abs(change) < 5) return 'stable';
   return change > 0 ? 'up' : 'down';
 }

 function determineRelationshipType(
   coefficient: number
 ): 'positive' | 'negative' | 'none' {
   if (Math.abs(coefficient) < 0.1) return 'none';
   return coefficient > 0 ? 'positive' : 'negative';
 }

 function calculateAnomalySeverity(
   deviation: number
 ): 'low' | 'medium' | 'high' {
   const absDeviation = Math.abs(deviation);
   if (absDeviation > 50) return 'high';
   if (absDeviation > 25) return 'medium';
   return 'low';
 }

 function analyzePossibleCauses(anomaly: any): string[] {
   const causes = [];

   if (anomaly.correlated_events?.length > 0) {
     causes.push(
       ...anomaly.correlated_events.map(
         (e: any) =>
           `Correlated with ${e.event_type} (confidence: ${e.confidence}%)`
       )
     );
   }

   if (anomaly.deviation > 50) {
     causes.push('Significant deviation from historical patterns');
   }

   return causes;
 }