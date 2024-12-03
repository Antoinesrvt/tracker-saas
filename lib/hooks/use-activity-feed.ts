import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { ActivityFeedService } from '@/lib/services/activity-feed.service';
import { useAuth } from '@/lib/providers/auth-provider';
import type { ActivityItem } from '@/lib/services/activity-feed.service';

export function useActivityFeed(params: {
  rootType: 'workspace' | 'organization' | 'goal';
  rootId: string;
  limit?: number;
  types?: ('comment' | 'update')[];
}) {
  const { user, teamAccess } = useAuth();
  if (!user) throw new Error('User not found');
  const service = new ActivityFeedService({ userId: user.id, teamAccess });

  return useQuery({
    queryKey: ['activity-feed', params],
    queryFn: () => service.getRecentActivity(
      params.rootType,
      params.rootId,
      {
        limit: params.limit,
        types: params.types
      }
    ),
    enabled: !!(params.rootId && params.rootType)
  });
}

// Hook for infinite scrolling
export function useInfiniteActivityFeed(params: {
  rootType: 'workspace' | 'organization' | 'goal';
  rootId: string;
  limit?: number;
  types?: ('comment' | 'update')[];
}) {
  const { user, teamAccess } = useAuth();
  if (!user) throw new Error('User not found');
  const service = new ActivityFeedService({ userId: user.id, teamAccess });

  return useInfiniteQuery<ServiceResponse<ActivityItem[]>, Error, InfiniteData<ServiceResponse<ActivityItem[]>>, (string | typeof params)[], string | null>({
    queryKey: ['activity-feed-infinite', params],
    queryFn: ({ pageParam }) => service.getRecentActivity(
      params.rootType,
      params.rootId,
      {
        limit: params.limit,
        before: (pageParam as unknown)as string | undefined,
        types: params.types
      }
    ),
    initialPageParam: null,
    getNextPageParam: (lastPage) => {
      if (!lastPage.data?.length) return undefined;
      return lastPage.data[lastPage.data.length - 1].created_at;
    },
    enabled: !!(params.rootId && params.rootType)
  });
} 