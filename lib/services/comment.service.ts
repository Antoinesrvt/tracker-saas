import { BaseService } from './base.service';
import { createClient } from '@/lib/supabase/client';
import type { ServiceResponse } from '@/types/service.types';
import type { Comment } from '../../types/linkable-objects';
import { TargetType} from '../../types/linkable-objects';

export class CommentService extends BaseService {
  async getComments(params: {
    targetType: TargetType;
    targetId: string;
    parentId?: string;
  }): Promise<ServiceResponse<Comment[]>> {
    try {
      const { data } = await this.getLinkedObjects<Comment>(
        params.targetType,
        params.targetId,
        'comment'
      );

      if (params.parentId) {
        return {
          data: data?.filter(comment => comment.parent_id === params.parentId) || [],
          error: null
        };
      }

      return { data: data || [], error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  async createComment(
    comment: Omit<Comment, 'id' | 'created_at' | 'updated_at' | 'created_by'>,
    targetType: TargetType,
    targetId: string
  ): Promise<ServiceResponse<Comment>> {
    try {
      // Process mentions if any
      const mentions = extractMentions(comment.content);
      
      const newComment: Comment = {
        ...comment,
        mentions,
        reactions: {},
        type: 'comment'
      } as Comment;

      const result = await this.linkObject(newComment, targetType, targetId);

      // If comment was created successfully, handle notifications
      if (result.data && mentions.length > 0) {
        await this.notifyMentionedUsers(result.data);
      }

      return result;
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  async updateComment(
    id: string,
    updates: Pick<Comment, 'content'>
  ): Promise<ServiceResponse<Comment>> {
    try {
      const supabase = createClient();
      
      // Get current comment
      const { data: comment, error: getError } = await supabase
        .from('comments')
        .select('*')
        .eq('id', id)
        .single();

      if (getError) throw getError;

      // Check access
      if (comment.created_by !== this.context.userId) {
        await this.checkAccess(comment.target_type, comment.target_id, ['owner', 'admin']);
      }

      // Process new mentions
      const mentions = extractMentions(updates.content);

      const { data, error } = await supabase
        .from('comments')
        .update({
          content: updates.content,
          mentions,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  // Helper method for mentions
  private async notifyMentionedUsers(comment: Comment): Promise<void> {
    const supabase = createClient();

    const notifications = comment.mentions.map(userId => ({
      user_id: userId,
      type: 'mention',
      title: 'You were mentioned in a comment',
      content: comment.content,
      resource_type: comment.type,
      resource_id: comment.id
    }));

    await supabase.from('notifications').insert(notifications);
  }
}

// Helper function for extracting mentions
function extractMentions(content: string): string[] {
  const mentionRegex = /@\[([^\]]+)\]\(([^)]+)\)/g;
  const mentions: string[] = [];
  let match;

  while ((match = mentionRegex.exec(content)) !== null) {
    mentions.push(match[2]); // Extract user ID from mention format: @[username](user_id)
  }

  return mentions;
} 