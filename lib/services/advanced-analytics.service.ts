 import { BaseService } from './base.service';
 import { createClient } from '@/lib/supabase/client';
 import type { ServiceResponse } from '@/types/service.types';
 import type {
   AdvancedAnalyticsQuery,
   AnalyticsTrend,
   AnalyticsCorrelation,
   AnalyticsAnomaly,
   AnalyticsResponse
 } from '@/types/analytics.types';

 export class AdvancedAnalyticsService extends BaseService {
   async runAnalyticsQuery<T>(
     workspaceId: string,
     query: AdvancedAnalyticsQuery
   ): Promise<ServiceResponse<AnalyticsResponse<T>>> {
     try {
       await this.checkAccess('workspace', workspaceId);

       const supabase = createClient();
       const { data, error } = await supabase.functions.invoke(
         'advanced-analytics',
         {
           body: {
             workspace_id: workspaceId,
             query
           }
         }
       );

       if (error) throw error;
       return { data, error: null };
     } catch (error) {
       return { data: null, error: error as Error };
     }
   }

   async getTrends(
     workspaceId: string,
     metrics: string[],
     timeframe: AdvancedAnalyticsQuery['timeframe']
   ): Promise<ServiceResponse<AnalyticsTrend[]>> {
     try {
       await this.checkAccess('workspace', workspaceId);

       const supabase = createClient();
       const { data, error } = await supabase.functions.invoke(
         'advanced-analytics',
         {
           body: {
             workspace_id: workspaceId,
             action: 'analyze_trends',
             metrics,
             timeframe
           }
         }
       );

       if (error) throw error;
       return { data, error: null };
     } catch (error) {
       return { data: null, error: error as Error };
     }
   }

   async findCorrelations(
     workspaceId: string,
     metrics: string[],
     timeframe: AdvancedAnalyticsQuery['timeframe']
   ): Promise<ServiceResponse<AnalyticsCorrelation[]>> {
     try {
       await this.checkAccess('workspace', workspaceId);

       const supabase = createClient();
       const { data, error } = await supabase.functions.invoke(
         'advanced-analytics',
         {
           body: {
             workspace_id: workspaceId,
             action: 'find_correlations',
             metrics,
             timeframe
           }
         }
       );

       if (error) throw error;
       return { data, error: null };
     } catch (error) {
       return { data: null, error: error as Error };
     }
   }

   async detectAnomalies(
     workspaceId: string,
     metrics: string[],
     timeframe: AdvancedAnalyticsQuery['timeframe']
   ): Promise<ServiceResponse<AnalyticsAnomaly[]>> {
     try {
       await this.checkAccess('workspace', workspaceId);

       const supabase = createClient();
       const { data, error } = await supabase.functions.invoke(
         'advanced-analytics',
         {
           body: {
             workspace_id: workspaceId,
             action: 'detect_anomalies',
             metrics,
             timeframe
           }
         }
       );

       if (error) throw error;
       return { data, error: null };
     } catch (error) {
       return { data: null, error: error as Error };
     }
   }
 }