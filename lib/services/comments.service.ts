import { BaseService } from './base.service';
import { createClient } from '@/lib/supabase/client';
import type { ServiceResponse } from '@/types/service.types';

export interface Comment {
  id: string;
  content: string;
  author_id: string;
  update_id?: string;
  object_type?: 'goal' | 'task' | 'milestone' | 'resource' | 'update';
  object_id?: string;
  parent_id?: string;
  created_at: string;
  edited_at?: string;
  mentions: string[];
  reactions: Record<string, string[]>;
  visibility: 'public' | 'team' | 'private';
  edited_by?: string;
  edit_history: Array<{
    content: string;
    edited_at: string;
    edited_by: string;
  }>;
}

export class CommentService extends BaseService {
  async getComments(params: {
    objectType?: string;
    objectId?: string;
    updateId?: string;
    parentId?: string;
  }): Promise<ServiceResponse<Comment[]>> {
    try {
      const supabase = createClient();
      let query = supabase.from('comments').select(`
        *,
        author:author_id(
          id,
          email,
          user_metadata
        )
      `);

      if (params.objectType && params.objectId) {
        query = query
          .eq('object_type', params.objectType)
          .eq('object_id', params.objectId);
      } else if (params.updateId) {
        query = query.eq('update_id', params.updateId);
      }

      if (params.parentId) {
        query = query.eq('parent_id', params.parentId);
      } else {
        query = query.is('parent_id', null);
      }

      const { data, error } = await query.order('created_at', {
        ascending: true
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  async createComment(
    comment: Partial<Comment>
  ): Promise<ServiceResponse<Comment>> {
    try {
      if (comment.object_type && comment.object_id) {
        await this.checkAccess(comment.object_type, comment.object_id);
      }

      const supabase = createClient();
      const { data, error } = await supabase
        .from('comments')
        .insert([
          {
            ...comment,
            author_id: this.context.userId,
            mentions: extractMentions(comment.content || ''),
            reactions: {}
          }
        ])
        .select()
        .single();

      if (error) throw error;

      // Process mentions and send notifications
      if (data.mentions?.length) {
        await this.notifyMentionedUsers(data);
      }

      return { data, error: null };
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

      // Get current comment to check access and preserve history
      const { data: comment, error: getError } = await supabase
        .from('comments')
        .select('*')
        .eq('id', id)
        .single();

      if (getError) throw getError;

      // Only author or admins can edit
      if (comment.author_id !== this.context.userId) {
        await this.checkAccess(comment.object_type!, comment.object_id!, [
          'owner',
          'admin'
        ]);
      }

      // Update comment with edit history
      const { data, error } = await supabase
        .from('comments')
        .update({
          content: updates.content,
          edited_at: new Date().toISOString(),
          edited_by: this.context.userId,
          mentions: extractMentions(updates.content),
          edit_history: [
            ...comment.edit_history,
            {
              content: comment.content,
              edited_at: comment.edited_at || comment.created_at,
              edited_by: comment.edited_by || comment.author_id
            }
          ]
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

  async deleteComment(id: string): Promise<ServiceResponse<boolean>> {
    try {
      const supabase = createClient();

      // Get comment to check access
      const { data: comment, error: getError } = await supabase
        .from('comments')
        .select('*')
        .eq('id', id)
        .single();

      if (getError) throw getError;

      // Only author or admins can delete
      if (comment.author_id !== this.context.userId) {
        await this.checkAccess(comment.object_type!, comment.object_id!, [
          'owner',
          'admin'
        ]);
      }

      const { error } = await supabase.from('comments').delete().eq('id', id);

      if (error) throw error;
      return { data: true, error: null };
    } catch (error) {
      return { data: false, error: error as Error };
    }
  }

  private async notifyMentionedUsers(comment: Comment) {
    const supabase = createClient();

    // Create notifications for mentioned users
    const notifications = comment.mentions.map((userId) => ({
      user_id: userId,
      type: 'mention',
      title: 'You were mentioned in a comment',
      content: comment.content,
      resource_type: comment.object_type || 'comment',
      resource_id: comment.object_id || comment.id
    }));

    await supabase.from('notifications').insert(notifications);
  }
}

function extractMentions(content: string): string[] {
  const mentionRegex = /@\[([^\]]+)\]\(([^)]+)\)/g;
  const mentions: string[] = [];
  let match;

  while ((match = mentionRegex.exec(content)) !== null) {
    mentions.push(match[2]); // Extract user ID from mention format: @[username](user_id)
  }

  return mentions;
}
