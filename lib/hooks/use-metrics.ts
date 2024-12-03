 import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
 import {
   MetricsService,
   type KPI,
   type KPIHistory
 } from '@/lib/services/metrics.service';
 import { useAuth } from '@/lib/providers/auth-provider';
 import { useEffect } from 'react';
 import { createClient } from '@/lib/supabase/client';

 // KPI Hooks
 export function useGoalKPIs(goalId: string) {
   const { user, teamAccess } = useAuth();
   if (!user) throw new Error('User not found');
   const service = new MetricsService({ userId: user.id, teamAccess });
   const queryClient = useQueryClient();

   // Set up real-time subscription
   useEffect(() => {
     const supabase = createClient();
     const subscription = supabase
       .channel('kpi-updates')
       .on(
         'postgres_changes',
         {
           event: '*',
           schema: 'public',
           table: 'kpis',
           filter: `goal_id=eq.${goalId}`
         },
         () => {
           queryClient.invalidateQueries({ queryKey: ['goal-kpis', goalId] });
         }
       )
       .subscribe();

     return () => {
       subscription.unsubscribe();
     };
   }, [goalId, queryClient]);

   return useQuery({
     queryKey: ['goal-kpis', goalId],
     queryFn: () => service.getGoalKPIs(goalId),
     enabled: !!goalId
   });
 }

 export function useCreateKPI() {
   const queryClient = useQueryClient();
   const { user, teamAccess } = useAuth();
   if (!user) throw new Error('User not found');
   const service = new MetricsService({ userId: user.id, teamAccess });

   return useMutation({
     mutationFn: (kpi: Partial<KPI>) => service.createKPI(kpi),
     onSuccess: (data, variables) => {
       queryClient.invalidateQueries({
         queryKey: ['goal-kpis', variables.goal_id]
       });
       if (data.data?.id) {
         queryClient.invalidateQueries({ queryKey: ['kpi', data.data.id] });
       }
     }
   });
 }

 export function useUpdateKPI() {
   const queryClient = useQueryClient();
   const { user, teamAccess } = useAuth();
   if (!user) throw new Error('User not found');
   const service = new MetricsService({ userId: user.id, teamAccess });

   return useMutation({
     mutationFn: ({ id, updates }: { id: string; updates: Partial<KPI> }) =>
       service.updateKPI(id, updates),
     onSuccess: (data) => {
       if (data.data) {
         queryClient.invalidateQueries({ queryKey: ['kpi', data.data.id] });
         queryClient.invalidateQueries({
           queryKey: ['goal-kpis', data.data.goal_id]
         });
       }
     }
   });
 }

 export function useKPIHistory(kpiId: string, period: string = '30 days') {
   const { user, teamAccess } = useAuth();
   if (!user) throw new Error('User not found');
   const service = new MetricsService({ userId: user.id, teamAccess });
   const queryClient = useQueryClient();

   // Set up real-time subscription
   useEffect(() => {
     const supabase = createClient();
     const subscription = supabase
       .channel('kpi-history-updates')
       .on(
         'postgres_changes',
         {
           event: 'INSERT',
           schema: 'public',
           table: 'kpi_history',
           filter: `kpi_id=eq.${kpiId}`
         },
         () => {
           queryClient.invalidateQueries({
             queryKey: ['kpi-history', kpiId, period]
           });
         }
       )
       .subscribe();

     return () => {
       subscription.unsubscribe();
     };
   }, [kpiId, period, queryClient]);

   return useQuery({
     queryKey: ['kpi-history', kpiId, period],
     queryFn: () => service.getKPIHistory(kpiId, period),
     enabled: !!kpiId
   });
 }

 export function useRecordKPIValue() {
   const queryClient = useQueryClient();
   const { user, teamAccess } = useAuth();
   if (!user) throw new Error('User not found');
   const service = new MetricsService({ userId: user.id, teamAccess });

   return useMutation({
     mutationFn: ({
       kpiId,
       value,
       target
     }: {
       kpiId: string;
       value: number;
       target: number;
     }) => service.recordKPIValue(kpiId, value, target),
     onSuccess: (_, variables) => {
       queryClient.invalidateQueries({
         queryKey: ['kpi-history', variables.kpiId]
       });
       queryClient.invalidateQueries({
         predicate: (query) => query.queryKey[0] === 'goal-kpis'
       });
     }
   });
 }

 // Specialized hooks for common operations
 export function useKPITrend(kpiId: string, period: string = '7 days') {
   const { data: history } = useKPIHistory(kpiId, period);

   if (!history.data || history.data.length === 0) {
     return {
       trend: 'neutral' as const,
       percentage: 0
     };
   }

   const values = history.data.map((h) => h.value);
   const firstValue = values[0];
   const lastValue = values[values.length - 1];
   const percentage = ((lastValue - firstValue) / firstValue) * 100;

   return {
     trend:
       percentage > 0
         ? ('up' as const)
         : percentage < 0
           ? ('down' as const)
           : ('neutral' as const),
     percentage: Math.abs(percentage)
   };
 }

 export function useKPIProgress(kpiId: string) {
   const { data: kpis } = useGoalKPIs(kpiId);
   const kpi = kpis.data?.find((k) => k.id === kpiId);

   if (!kpi) {
     return {
       progress: 0,
       status: 'unknown' as const
     };
   }

   const progress = (kpi.value / kpi.target) * 100;
   const status =
     progress >= 100
       ? ('achieved' as const)
       : progress >= 75
         ? ('on_track' as const)
         : progress >= 50
           ? ('at_risk' as const)
           : ('behind' as const);

   return {
     progress,
     status
   };
 }