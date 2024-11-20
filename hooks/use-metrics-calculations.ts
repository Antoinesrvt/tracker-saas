import { useMemo } from 'react';
import { Metrics, KPI } from '@/types/metrics';

export function useMetricsCalculations(metrics: Metrics, timeRange: string) {
  return useMemo(() => {
    const timeProgress = (metrics.time.timeSpent / metrics.time.estimated) * 100;
    const budgetProgress = (metrics.budget.spent / metrics.budget.allocated) * 100;
    const riskScore = metrics.risks.riskScore || 
      (metrics.risks.risks.length > 0 
        ? metrics.risks.risks.reduce((acc, risk) => {
            const score = risk.severity === 'high' ? 3 : risk.severity === 'medium' ? 2 : 1;
            return acc + score;
          }, 0) / metrics.risks.risks.length
        : 0);

    return {
      timeProgress,
      budgetProgress,
      riskScore,
      isOverBudget: budgetProgress > 100,
      isOverTime: timeProgress > 100,
      efficiency: metrics.performance?.efficiency || 
        ((metrics.time.estimated / metrics.time.timeSpent) * 100),
    };
  }, [metrics, timeRange]);
}

export function useKPITrends(kpis: KPI[]) {
  return useMemo(() => {
    return kpis.map(kpi => {
      if (!kpi.history || kpi.history.length < 2) return kpi;

      const lastValue = kpi.history[kpi.history.length - 1].value;
      const previousValue = kpi.history[kpi.history.length - 2].value;
      const trend = ((lastValue - previousValue) / previousValue) * 100;

      return {
        ...kpi,
        trend: {
          value: Math.abs(trend),
          direction: trend >= 0 ? 'up' : 'down',
          isPositive: (trend >= 0) === (kpi.target >= kpi.value),
        },
      };
    });
  }, [kpis]);
} 