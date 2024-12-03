import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ActivityService } from '@/lib/services/activity.service';
import { useAuth } from '@/lib/providers/auth-provider';
import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { ActivityEvent } from '@/supabase/functions/shared/types/activity';

export function useActivity(params: {
  workspaceId: string;
  eventType?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  perPage?: number;
}) {
  const { user, teamAccess } = useAuth();
  if (!user) throw new Error('User not found');
  const service = new ActivityService({ userId: user.id, teamAccess });
  const queryClient = useQueryClient();

  // Set up real-time subscription
  useEffect(() => {
    const supabase = createClient();
    const subscription = supabase
      .channel('activity')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'activity_events',
          filter: `workspace_id=eq.${params.workspaceId}`
        },
        () => {
          queryClient.invalidateQueries({
            queryKey: ['activity', params.workspaceId]
          });
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [params.workspaceId, queryClient]);

  return useQuery({
    queryKey: ['activity', params.workspaceId, params],
    queryFn: () => service.getActivity(params),
    enabled: !!params.workspaceId
  });
}

export function useTrackActivity() {
  const queryClient = useQueryClient();
  const { user, teamAccess } = useAuth();
  if (!user) throw new Error('User not found');
  const service = new ActivityService({ userId: user.id, teamAccess });

  return useMutation({
    mutationFn: (params: {
      workspaceId: string;
      eventType: ActivityEvent['event_type'];
      eventData?: Record<string, any>;
    }) =>
      service.trackActivity(
        params.workspaceId,
        params.eventType,
        params.eventData
      ),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['activity', variables.workspaceId]
      });
    }
  });
}

export function useActivityAggregation(params: {
  workspaceId: string;
  startDate: string;
  endDate: string;
}) {
  const { user, teamAccess } = useAuth();
  if (!user) throw new Error('User not found');
  const service = new ActivityService({ userId: user.id, teamAccess });

  return useQuery({
    queryKey: ['activity-aggregation', params],
    queryFn: () =>
      service.getActivityAggregation(
        params.workspaceId,
        params.startDate,
        params.endDate
      ),
    enabled: !!(params.workspaceId && params.startDate && params.endDate)
  });
}

// Specialized hooks for common activity patterns
export function useUserActivity(userId: string, workspaceId: string) {
  return useActivity({
    workspaceId,
    userId,
    page: 1,
    perPage: 20
  });
}

export function useRecentActivity(workspaceId: string) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 7);

  return useActivity({
    workspaceId,
    startDate: startDate.toISOString(),
    page: 1,
    perPage: 10
  });
}

export function useActivityByType(
  workspaceId: string,
  eventType: ActivityEvent['event_type']
) {
  return useActivity({
    workspaceId,
    eventType,
    page: 1,
    perPage: 20
  });
}

// Hook for activity trends
export function useActivityTrends(workspaceId: string) {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 1);

  const { data: aggregation } = useActivityAggregation({
    workspaceId,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString()
  });

  if (!aggregation?.data) {
    return {
      totalEvents: 0,
      activeUsers: 0,
      topEventTypes: [],
      activityTrend: 'stable' as const
    };
  }

  const { total_events, events_by_type, active_users } = aggregation.data;

  const topEventTypes = Object.entries(events_by_type)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([type, count]) => ({ type, count }));

  return {
    totalEvents: total_events,
    activeUsers: active_users,
    topEventTypes,
    activityTrend:
      total_events > 100
        ? ('up' as const)
        : total_events < 50
          ? ('down' as const)
          : ('stable' as const)
  };
}
