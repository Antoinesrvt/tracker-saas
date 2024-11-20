import { useMemo } from 'react';
import { HistoricalData, Metrics, Prediction } from '@/types/metrics';
import { calculatePredictions } from '@/lib/metrics';
import { TimeRange } from '@/components/Goal/tabs/metrics/types';
import { subDays, subMonths, subYears } from 'date-fns';

export function useMetricsData(
  historicalData: HistoricalData | undefined,
  metrics: Metrics | undefined,
  timeRange: TimeRange
) {
  return useMemo(() => {
    // Handle undefined data
    if (!historicalData || !metrics) {
      return {
        filteredData: [],
        predictions: calculatePredictions([]),
        trends: {
          budget: 0,
          time: 0,
          efficiency: 0,
        },
        currentMetrics: undefined,
      };
    }

    // Filter data based on time range
    const now = new Date();
    const getStartDate = () => {
      switch (timeRange) {
        case '1w':
          return subDays(now, 7);
        case '1m':
          return subDays(now, 30);
        case '3m':
          return subMonths(now, 3);
        case '6m':
          return subMonths(now, 6);
        case '1y':
          return subYears(now, 1);
        default:
          return subDays(now, 30);
      }
    };

    const startDate = getStartDate();
    const filteredData = historicalData.filter(
      item => new Date(item.date) >= startDate
    );

    // Calculate predictions
    const predictions = calculatePredictions(filteredData);

    // Calculate trends
    const calculateTrend = (current: number, previous: number) => {
      if (!previous) return 0;
      return ((current - previous) / previous) * 100;
    };

    const trends = {
      budget: calculateTrend(
        metrics.budget.spent,
        filteredData[0]?.metrics.budget.spent || 0
      ),
      time: calculateTrend(
        metrics.time.timeSpent,
        filteredData[0]?.metrics.time.timeSpent || 0
      ),
      efficiency: calculateTrend(
        metrics.performance?.efficiency || 0,
        filteredData[0]?.metrics.performance?.efficiency || 0
      ),
    };

    return {
      filteredData,
      predictions,
      trends,
      currentMetrics: metrics,
    };
  }, [historicalData, metrics, timeRange]);
} 