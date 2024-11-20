import { KPI, Metrics, PerformanceMetrics } from '@/types/metrics';
import { TypeStyles } from '@/types/goals';

export type TimeRange = '1w' | '1m' | '3m' | '6m' | '1y';

export interface MetricsTabProps {
  goalDetails: {
    metrics: Metrics;
    kpis: KPI[];
  };
  styles: TypeStyles;
  onAddKPI?: (kpi: Omit<KPI, 'id'>) => void;
  onUpdateKPI?: (kpi: KPI) => void;
  onDeleteKPI?: (kpiId: string) => void;
}

export interface MetricsOverviewProps {
  metrics: Metrics;
}

export interface PerformanceMetricsProps {
  performance: PerformanceMetrics;
}

export interface KPICardProps {
  kpi: KPI;
  onSelect?: (kpi: KPI) => void;
}

export interface KPIDetailsProps {
  kpi: KPI;
  onUpdate?: (kpi: KPI) => void;
  onDelete?: () => void;
}

export interface AddKPIFormProps {
  onSubmit: (kpi: Omit<KPI, 'id'>) => void;
  onCancel: () => void;
  initialData?: Partial<Omit<KPI, 'id'>>;
} 