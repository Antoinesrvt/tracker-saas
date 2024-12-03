import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ObjectType } from '@/types/updates';
import { getSupabaseBrowserClient } from '@/utils/supabase/client';

export function useComments(objectType?: ObjectType, objectId?: string) {
  const queryClient = useQueryClient();
  const supabase = getSupabaseBrowserClient();

  const { data: comments, isLoading } = useQuery({
    queryKey: ['comments', objectType, objectId],
    queryFn: async () => {
      const query = supabase
        .from('comments')
        .select(`
          *,
          author:author_id(id, full_name, avatar_url),
          replies:comments!parent_id(
            *,
            author:author_id(id, full_name, avatar_url)
          )
        `)
        .order('created_at', { ascending: false });

      if (objectType && objectId) {
        query.eq('object_type', objectType).eq('object_id', objectId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  // ... mutation functions
} 