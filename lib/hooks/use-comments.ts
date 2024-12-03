import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CommentService } from '@/lib/services/comment.service';
import { useAuth } from '@/lib/providers/auth-provider';
import type { Comment } from '@/types/linkable-objects';
import type { TargetType } from '@/types/linkable-objects';

export function useComments(params: {
  targetType: TargetType;
  targetId: string;
  parentId?: string;
}) {
  const { user, teamAccess } = useAuth();
  if (!user) throw new Error('User not found');
  const service = new CommentService({ userId: user.id, teamAccess });
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['comments', params],
    queryFn: () => service.getComments(params),
    enabled: !!(params.targetId && params.targetType)
  });
}

export function useCreateComment() {
  const queryClient = useQueryClient();
  const { user, teamAccess } = useAuth();
  if (!user) throw new Error('User not found');
  const service = new CommentService({ userId: user.id, teamAccess });

  return useMutation({
    mutationFn: ({
      comment,
      targetType,
      targetId
    }: {
      comment: Omit<Comment, 'id' | 'created_at' | 'updated_at' | 'created_by'>;
      targetType: TargetType;
      targetId: string;
    }) => service.createComment(comment, targetType, targetId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['comments', { targetType: variables.targetType, targetId: variables.targetId }]
      });
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
