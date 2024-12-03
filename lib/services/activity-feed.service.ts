import { BaseService } from './base.service';
import { createClient } from '@/lib/supabase/client';
import type { ServiceResponse } from '@/types/service.types';
import type { Comment, Update } from '../../types/linkable-objects';

export type ActivityItem = (Comment | Update) & {
  object_type: string;
  object_title: string;
  object_path: string[];
};

interface FeedOptions {
  limit?: number;
  before?: string;
  after?: string;
  types?: ('comment' | 'update')[];
}

export class ActivityFeedService extends BaseService {
  async getRecentActivity(
    rootType: 'workspace' | 'organization' | 'goal',
    rootId: string,
    options: FeedOptions = {}
  ): Promise<ServiceResponse<ActivityItem[]>> {
    try {
      await this.checkAccess(rootType, rootId);
      
      const supabase = createClient();
      const {
        limit = 20,
        before,
        after,
        types = ['comment', 'update']
      } = options;

      // Get all object IDs under the root object
      const { data: hierarchy, error: hierarchyError } = await supabase
        .from('object_hierarchy')
        .select('object_id, object_type')
        .eq('root_id', rootId)
        .eq('root_type', rootType);

      if (hierarchyError) throw hierarchyError;

      const objectIds = hierarchy.map(h => h.object_id);

      // Build the query for comments and updates
      const queries = types.map(type => {
        let query = supabase
          .from(type === 'comment' ? 'comments' : 'updates')
          .select(`
            *,
            target:target_id (
              id,
              title,
              type
            )
          `)
          .in('target_id', objectIds)
          .order('created_at', { ascending: false })
          .limit(limit);

        if (before) {
          query = query.lt('created_at', before);
        }
        if (after) {
          query = query.gt('created_at', after);
        }

        return query;
      });

      // Execute queries in parallel
      const results = await Promise.all(queries);
      const errors = results.filter(r => r.error);
      if (errors.length > 0) throw errors[0].error;

      // Combine and sort results
      const combinedResults = results
        .flatMap(r => r.data || [])
        .sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        .slice(0, limit)
        .map(item => ({
          ...item,
          object_type: item.target.type,
          object_title: item.target.title,
          object_path: this.buildObjectPath(item.target, hierarchy)
        }));

      return { data: combinedResults, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  private buildObjectPath(target: any, hierarchy: any[]): string[] {
    const path = [];
    let current = target;
    
    while (current) {
      path.unshift(current.title);
      current = hierarchy.find(h => 
        h.object_id === current.parent_id
      )?.target;
    }
    
    return path;
  }
} 