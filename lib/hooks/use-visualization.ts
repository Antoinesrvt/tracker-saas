 import { useMemo } from 'react';
 import { useKPIHistory } from './use-metrics';
 import { useGoalProgress } from './use-goals';
 import { useWorkspaceAnalytics } from './use-workspace';
 import type { KPIHistory } from '@/lib/services/metrics.service';

 interface ChartData {
   labels: string[];
   datasets: {
     label: string;
     data: number[];
     backgroundColor?: string;
     borderColor?: string;
     fill?: boolean;
   }[];
 }

 interface GaugeData {
   value: number;
   min: number;
   max: number;
   thresholds: {
     color: string;
     value: number;
   }[];
 }

 // KPI Trend Chart
 export function useKPITrendChart(kpiId: string, period: string = '30 days') {
   const { data: history } = useKPIHistory(kpiId, period);

   return useMemo(() => {
     if (!history?.data) return null;

     const sortedData = [...history.data].sort(
       (a, b) =>
         new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime()
     );

     const chartData: ChartData = {
       labels: sortedData.map((d) =>
         new Date(d.recorded_at).toLocaleDateString()
       ),
       datasets: [
         {
           label: 'Actual',
           data: sortedData.map((d) => d.value),
           borderColor: '#2563eb',
           backgroundColor: 'rgba(37, 99, 235, 0.1)',
           fill: true
         },
         {
           label: 'Target',
           data: sortedData.map((d) => d.target),
           borderColor: '#9333ea',
           backgroundColor: 'rgba(147, 51, 234, 0.1)',
           fill: true
         }
       ]
     };

     return chartData;
   }, [history]);
 }

 // Progress Gauge
 export function useProgressGauge(goalId: string) {
   const { data: progress } = useGoalProgress(goalId);

   return useMemo(() => {
     if (!progress?.data) return null;

     const gaugeData: GaugeData = {
       value: progress.data,
       min: 0,
       max: 100,
       thresholds: [
         { value: 33, color: '#ef4444' }, // red
         { value: 66, color: '#f59e0b' }, // yellow
         { value: 100, color: '#10b981' } // green
       ]
     };

     return gaugeData;
   }, [progress]);
 }

 // Timeline Distribution
 export function useTimelineDistribution(workspaceId: string) {
   const { data: analytics } = useWorkspaceAnalytics(workspaceId);

   return useMemo(() => {
     if (!analytics?.data) return null;

     const { timeline_metrics } = analytics.data;

     const chartData: ChartData = {
       labels: ['On Track', 'At Risk', 'Delayed'],
       datasets: [
         {
           label: 'Goals Distribution',
           data: [
             timeline_metrics.total_goals -
               timeline_metrics.at_risk_goals -
               timeline_metrics.delayed_goals,
             timeline_metrics.at_risk_goals,
             timeline_metrics.delayed_goals
           ],
           backgroundColor: [
             '#10b981', // green
             '#f59e0b', // yellow
             '#ef4444' // red
           ]
         }
       ]
     };

     return chartData;
   }, [analytics]);
 }

 // Resource Utilization Heatmap
 export function useResourceHeatmap(workspaceId: string) {
   const { data: analytics } = useWorkspaceAnalytics(workspaceId);

   return useMemo(() => {
     if (!analytics?.data) return null;

     // Format data for a heatmap visualization
     const { resource_metrics } = analytics.data;
     const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
     const timeSlots = Array.from({ length: 8 }, (_, i) => `${i + 9}:00`);

     const heatmapData = days.map((day) => ({
       day,
       slots: timeSlots.map((time) => ({
         time,
         value: resource_metrics.utilization_by_time?.[day]?.[time] || 0
       }))
     }));

     return heatmapData;
   }, [analytics]);
 }

 // Trend Analysis
 export function useTrendAnalysis(data: KPIHistory[]) {
   return useMemo(() => {
     if (!data.length) return null;

     const sortedData = [...data].sort(
       (a, b) =>
         new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime()
     );

     // Calculate moving average
     const windowSize = 3;
     const movingAverage = sortedData.map((_, index) => {
       if (index < windowSize - 1) return null;
       const window = sortedData.slice(index - windowSize + 1, index + 1);
       return window.reduce((sum, item) => sum + item.value, 0) / windowSize;
     });

     // Calculate trend line using linear regression
     const xValues = sortedData.map((_, i) => i);
     const yValues = sortedData.map((d) => d.value);
     const { slope, intercept } = calculateLinearRegression(xValues, yValues);
     const trendLine = xValues.map((x) => slope * x + intercept);

     return {
       movingAverage: movingAverage.filter((v) => v !== null),
       trendLine,
       slope,
       trend: slope > 0 ? 'up' : slope < 0 ? 'down' : 'stable'
     };
   }, [data]);
 }

 // Helper function for linear regression
 function calculateLinearRegression(x: number[], y: number[]) {
   const n = x.length;
   const sumX = x.reduce((a, b) => a + b, 0);
   const sumY = y.reduce((a, b) => a + b, 0);
   const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
   const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);

   const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
   const intercept = (sumY - slope * sumX) / n;

   return { slope, intercept };
 }