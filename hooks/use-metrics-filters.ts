import { useMemo } from 'react';
import { KPI } from '@/types/metrics';
import { subDays, subMonths, subYears, isAfter } from 'date-fns';

type TimeRange = '1w' | '1m' | '3m' | '6m' | '1y';

export function useMetricsFilters(kpis: KPI[], timeRange: TimeRange) {
  return useMemo(() => {
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
      }
    };

    const startDate = getStartDate();

    return kpis.map(kpi => {
      if (!kpi.history) return kpi;

      const filteredHistory = kpi.history.filter(item => 
        isAfter(new Date(item.date), startDate)
      );

      if (filteredHistory.length < 2) return kpi;

      const firstValue = filteredHistory[0].value;
      const lastValue = filteredHistory[filteredHistory.length - 1].value;
      const trend = ((lastValue - firstValue) / firstValue) * 100;

      return {
        ...kpi,
        history: filteredHistory,
        trend: {
          value: Math.abs(trend),
          direction: trend >= 0 ? 'up' : 'down',
          isPositive: (trend >= 0) === (kpi.target >= kpi.value),
        },
      };
    });
  }, [kpis, timeRange]);
} 