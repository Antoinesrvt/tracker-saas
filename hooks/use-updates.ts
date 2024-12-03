import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { Update } from '@/types/updates';
import { getSupabaseBrowserClient } from '@/utils/supabase/client';

export function useUpdates(objectId?: string) {
  const queryClient = useQueryClient();
  const supabase = getSupabaseBrowserClient();

  const { data: updates, isLoading } = useQuery({
    queryKey: ['updates', objectId],
    queryFn: async () => {
      const query = supabase
        .from('updates')
        .select(`
          *,
          author:creator_id(id, name, avatar_url),
          comments(
            *,
            author:author_id(id, name, avatar_url)
          )
        `)
        .order('created_at', { ascending: false });

      if (objectId) {
        query.eq('object_id', objectId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  const addUpdate = useMutation({
    mutationFn: async (
      newUpdate: Omit<Update, 'id' | 'created_at' | 'author'> & {
        target_id: string;
      }
    ) => {
      const { data, error } = await supabase
        .from('updates')
        .insert(newUpdate)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['updates'] });
    }
  });

  return {
    updates,
    isLoading,
    addUpdate: addUpdate.mutate
  };
} 