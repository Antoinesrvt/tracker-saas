import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  AnalyticsService,
  type AnalyticsParams
} from '@/lib/services/analytics.service';
import { useAuth } from '@/lib/providers/auth-provider';

export function useWorkspaceAnalytics(params: AnalyticsParams) {
  const { user, teamAccess } = useAuth();
  if (!user) throw new Error('User not found');
  const service = new AnalyticsService({ userId: user.id, teamAccess });

  return useQuery({
    queryKey: ['workspace-analytics', params],
    queryFn: () => service.getAnalytics(params),
    enabled: !!params.workspace_id
  });
}

export function usePredictiveAnalytics(workspaceId: string) {
  const { user, teamAccess } = useAuth();
  if (!user) throw new Error('User not found');
  const service = new AnalyticsService({ userId: user.id, teamAccess });

  return useQuery({
    queryKey: ['predictive-analytics', workspaceId],
    queryFn: () => service.getPredictiveAnalytics(workspaceId),
    enabled: !!workspaceId
  });
}

export function useGenerateReport() {
  const { user, teamAccess } = useAuth();
  if (!user) throw new Error('User not found');
  const service = new AnalyticsService({ userId: user.id, teamAccess });

  return useMutation({
    mutationFn: ({
      workspaceId,
      config
    }: {
      workspaceId: string;
      config: Parameters<AnalyticsService['generateReport']>[1];
    }) => service.generateReport(workspaceId, config)
  });
}

export function useCustomMetrics(workspaceId: string, metricKeys: string[]) {
  const { user, teamAccess } = useAuth();
  if (!user) throw new Error('User not found');
  const service = new AnalyticsService({ userId: user.id, teamAccess });

  return useQuery({
    queryKey: ['custom-metrics', workspaceId, metricKeys],
    queryFn: () => service.getCustomMetrics(workspaceId, metricKeys),
    enabled: !!(workspaceId && metricKeys.length)
  });
}

// Specialized hooks for common analytics patterns
export function useResourceUtilization(workspaceId: string) {
  return useWorkspaceAnalytics({
    workspace_id: workspaceId,
    analysis_type: 'resources'
  });
}

export function usePerformanceMetrics(workspaceId: string) {
  return useWorkspaceAnalytics({
    workspace_id: workspaceId,
    analysis_type: 'performance'
  });
}

export function useRiskAnalysis(workspaceId: string) {
  return useWorkspaceAnalytics({
    workspace_id: workspaceId,
    analysis_type: 'risks'
  });
}

export function useTimelineAnalytics(workspaceId: string) {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 1);

  return useWorkspaceAnalytics({
    workspace_id: workspaceId,
    analysis_type: 'timeline',
    start_date: startDate.toISOString(),
    end_date: endDate.toISOString()
  });
}
