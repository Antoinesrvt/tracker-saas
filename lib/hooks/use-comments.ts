import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CommentService, type Comment } from '@/lib/services/comment.service';
import { useAuth } from '@/lib/providers/auth-provider';
import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export function useComments(params: {
  objectType?: string;
  objectId?: string;
  updateId?: string;
  parentId?: string;
}) {
  const { user, teamAccess } = useAuth();
  if (!user) throw new Error('User not found');
  const service = new CommentService({ userId: user.id, teamAccess });
  const queryClient = useQueryClient();

  // Set up real-time subscription
  useEffect(() => {
    const supabase = createClient();
    const subscription = supabase
      .channel('comments')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments',
          filter: params.objectId
            ? `object_id=eq.${params.objectId}`
            : params.updateId
              ? `update_id=eq.${params.updateId}`
              : undefined
        },
        () => {
          queryClient.invalidateQueries({
            queryKey: ['comments', params]
          });
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [params, queryClient]);

  return useQuery({
    queryKey: ['comments', params],
    queryFn: () => service.getComments(params),
    enabled: !!(params.objectId || params.updateId)
  });
}

export function useCreateComment() {
  const queryClient = useQueryClient();
  const { user, teamAccess } = useAuth();
  if (!user) throw new Error('User not found');
  const service = new CommentService({ userId: user.id, teamAccess });

  return useMutation({
    mutationFn: (comment: Partial<Comment>) => service.createComment(comment),
    onSuccess: (_, variables) => {
      // Invalidate relevant queries
      if (variables.object_id) {
        queryClient.invalidateQueries({
          queryKey: ['comments', { objectId: variables.object_id }]
        });
      }
      if (variables.update_id) {
        queryClient.invalidateQueries({
          queryKey: ['comments', { updateId: variables.update_id }]
        });
      }
      if (variables.parent_id) {
        queryClient.invalidateQueries({
          queryKey: ['comments', { parentId: variables.parent_id }]
        });
      }
    }
  });
}

export function useUpdateComment() {
  const queryClient = useQueryClient();
  const { user, teamAccess } = useAuth();
  if (!user) throw new Error('User not found');
  const service = new CommentService({ userId: user.id, teamAccess });

  return useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) =>
      service.updateComment(id, { content }),
    onSuccess: (data) => {
      if (data.data) {
        // Invalidate all potentially affected queries
        queryClient.invalidateQueries({
          predicate: (query) =>
            query.queryKey[0] === 'comments' &&
            ((query.queryKey[1] as any)?.objectId === data.data?.object_id ||
              (query.queryKey[1] as any)?.updateId === data.data?.update_id ||
              (query.queryKey[1] as any)?.parentId === data.data?.parent_id)
        });
      }
    }
  });
}

export function useDeleteComment() {
  const queryClient = useQueryClient();
  const { user, teamAccess } = useAuth();
  if (!user) throw new Error('User not found');
  const service = new CommentService({ userId: user.id, teamAccess });

  return useMutation({
    mutationFn: (commentId: string) => service.deleteComment(commentId),
    onSuccess: (_, commentId) => {
      // Invalidate all comment queries since we don't know the context
      queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] === 'comments'
      });
    }
  });
}

// Specialized hooks for reactions and mentions
export function useCommentReactions(commentId: string) {
  const updateComment = useUpdateComment();

  const addReaction = async (reaction: string) => {
    const comment = await queryClient.getQueryData<Comment>([
      'comment',
      commentId
    ]);
    if (!comment) return;

    const updatedReactions = {
      ...comment.reactions,
      [reaction]: [...(comment.reactions[reaction] || []), user.id]
    };

    return updateComment.mutateAsync({
      id: commentId,
      updates: { reactions: updatedReactions }
    });
  };

  const removeReaction = async (reaction: string) => {
    const comment = await queryClient.getQueryData<Comment>([
      'comment',
      commentId
    ]);
    if (!comment) return;

    const updatedReactions = {
      ...comment.reactions,
      [reaction]:
        comment.reactions[reaction]?.filter((id) => id !== user.id) || []
    };

    return updateComment.mutateAsync({
      id: commentId,
      updates: { reactions: updatedReactions }
    });
  };

  return {
    addReaction,
    removeReaction,
    isUpdating: updateComment.isPending
  };
}
