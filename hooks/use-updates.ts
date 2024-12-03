import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { Update, UpdateMetadata } from '@/types/updates';
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

    const addComment = useMutation({
      mutationFn: async ({
        updateId,
        comment
      }: {
        updateId: string;
        comment: Omit<Comment, 'id' | 'created_at' | 'author'>;
      }) => {
        const { data, error } = await supabase
          .from('comments')
          .insert({
            update_id: updateId,
            content: comment.content,
            author_id: comment.author_id,
            mentions: comment.mentions
          })
          .select()
          .single();
        if (error) throw error;
        return data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['updates'] });
      }
    });

   const addReaction = useMutation({
    mutationFn: async ({ emoji, userId, updateId }: { emoji: string; userId: string; updateId: string }) => {
      const { data: update, error: fetchError } = await supabase
        .from('updates')
        .select('metadata')
        .eq('id', updateId)
        .single();

      if (fetchError) throw fetchError;

      const currentReactions = (update.metadata as any as UpdateMetadata)?.reactions || [];
      const existingReactionIndex = currentReactions.findIndex(r => r.emoji === emoji);

      let updatedReactions;
      if (existingReactionIndex >= 0) {
        // Add user to existing reaction if not already there
        if (!currentReactions[existingReactionIndex].user_ids.includes(userId)) {
          updatedReactions = [...currentReactions];
          updatedReactions[existingReactionIndex].user_ids.push(userId);
        }
      } else {
        // Create new reaction
        updatedReactions = [...currentReactions, { emoji, user_ids: [userId] }];
      }

      const { error } = await supabase
        .from('updates')
        .update({
          metadata: { 
            ...(update.metadata as any),
            reactions: updatedReactions 
          }
        })
        .eq('id', updateId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['updates'] });
    }
  });

  return {
    updates,
    isLoading,
    addUpdate: addUpdate.mutate,
    addComment: addComment.mutate,
    addReaction: addReaction.mutate
  };
} 