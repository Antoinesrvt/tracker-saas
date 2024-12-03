 import { BaseService } from './base.service';
 import { createClient } from '@/lib/supabase/client';
 import type { ServiceResponse } from '@/types/service.types';

 export interface KPI {
   id: string;
   name: string;
   value: number;
   target: number;
   unit: string;
   type: 'percentage' | 'number' | 'currency' | 'time';
   color?: string;
   trend_direction?: 'up' | 'down' | 'neutral';
   comparison_period?: string;
   alert_thresholds?: Record<string, number>;
   data_source?: string;
   goal_id: string;
   created_at: string;
   updated_at: string;
 }

 export interface KPIHistory {
   id: string;
   kpi_id: string;
   value: number;
   target: number;
   recorded_at: string;
 }

 export class MetricsService extends BaseService {
   async getGoalKPIs(goalId: string): Promise<ServiceResponse<KPI[]>> {
     try {
       await this.checkAccess('goal', goalId);

       const supabase = createClient();
       const { data, error } = await supabase
         .from('kpis')
         .select(
           `
          *,
          history:kpi_history(
            value,
            target,
            recorded_at
          )
        `
         )
         .eq('goal_id', goalId)
         .order('created_at', { ascending: false });

       if (error) throw error;
       return { data, error: null };
     } catch (error) {
       return { data: null, error: error as Error };
     }
   }

   async createKPI(kpi: Partial<KPI>): Promise<ServiceResponse<KPI>> {
     try {
       await this.checkAccess('goal', kpi.goal_id!, ['owner', 'admin']);

       const supabase = createClient();
       const { data, error } = await supabase
         .from('kpis')
         .insert([kpi])
         .select()
         .single();

       if (error) throw error;
       return { data, error: null };
     } catch (error) {
       return { data: null, error: error as Error };
     }
   }

   async updateKPI(
     id: string,
     updates: Partial<KPI>
   ): Promise<ServiceResponse<KPI>> {
     try {
       const supabase = createClient();

       // First get the KPI to check access
       const { data: kpi, error: kpiError } = await supabase
         .from('kpis')
         .select('goal_id')
         .eq('id', id)
         .single();

       if (kpiError) throw kpiError;
       await this.checkAccess('goal', kpi.goal_id, ['owner', 'admin']);

       const { data, error } = await supabase
         .from('kpis')
         .update(updates)
         .eq('id', id)
         .select()
         .single();

       if (error) throw error;
       return { data, error: null };
     } catch (error) {
       return { data: null, error: error as Error };
     }
   }

   async recordKPIValue(
     kpiId: string,
     value: number,
     target: number
   ): Promise<ServiceResponse<KPIHistory>> {
     try {
       const supabase = createClient();

       // First get the KPI to check access
       const { data: kpi, error: kpiError } = await supabase
         .from('kpis')
         .select('goal_id')
         .eq('id', kpiId)
         .single();

       if (kpiError) throw kpiError;
       await this.checkAccess('goal', kpi.goal_id, ['owner', 'admin']);

       // Record the new value
       const { data, error } = await supabase
         .from('kpi_history')
         .insert([
           {
             kpi_id: kpiId,
             value,
             target
           }
         ])
         .select()
         .single();

       if (error) throw error;
       return { data, error: null };
     } catch (error) {
       return { data: null, error: error as Error };
     }
   }

   async getKPIHistory(
     kpiId: string,
     period: string = '30 days'
   ): Promise<ServiceResponse<KPIHistory[]>> {
     try {
       const supabase = createClient();

       // First get the KPI to check access
       const { data: kpi, error: kpiError } = await supabase
         .from('kpis')
         .select('goal_id')
         .eq('id', kpiId)
         .single();

       if (kpiError) throw kpiError;
       await this.checkAccess('goal', kpi.goal_id);

       const { data, error } = await supabase
         .from('kpi_history')
         .select('*')
         .eq('kpi_id', kpiId)
         .gte(
           'recorded_at',
           new Date(Date.now() - parsePeriod(period)).toISOString()
         )
         .order('recorded_at', { ascending: true });

       if (error) throw error;
       return { data, error: null };
     } catch (error) {
       return { data: null, error: error as Error };
     }
   }

   async calculateMetrics(goalId: string): Promise<ServiceResponse<any>> {
     try {
       await this.checkAccess('goal', goalId, ['owner', 'admin']);

       const supabase = createClient();
       const { data, error } = await supabase.rpc('calculate_metrics', {
         p_goal_id: goalId
       });

       if (error) throw error;
       return { data, error: null };
     } catch (error) {
       return { data: null, error: error as Error };
     }
   }
 }

 // Helper function to parse period string to milliseconds
 function parsePeriod(period: string): number {
   const [amount, unit] = period.split(' ');
   const units: Record<string, number> = {
     day: 24 * 60 * 60 * 1000,
     days: 24 * 60 * 60 * 1000,
     week: 7 * 24 * 60 * 60 * 1000,
     weeks: 7 * 24 * 60 * 60 * 1000,
     month: 30 * 24 * 60 * 60 * 1000,
     months: 30 * 24 * 60 * 60 * 1000
   };
   return parseInt(amount) * (units[unit] || units.days);
 }