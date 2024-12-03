import { BaseService } from './base.service';
import { createClient } from '@/lib/supabase/client';
import type { Task, ServiceResponse } from '@/types/service.types';

export class TaskService extends BaseService {
  async getTask(id: string): Promise<ServiceResponse<Task>> {
    try {
      await this.checkAccess('task', id);

      const supabase = createClient();
      const { data, error } = await supabase
        .from('tasks')
        .select(
          `
          *,
          subtasks (*),
          checklist_items (*),
          goal (
            id,
            title,
            status
          ),
          milestone (
            id,
            title,
            target_date
          )
        `
        )
        .eq('id', id)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  async updateTaskStatus(
    id: string,
    status: string
  ): Promise<ServiceResponse<Task>> {
    try {
      await this.checkAccess('task', id);

      const supabase = createClient();
      const { data, error } = await supabase
        .from('tasks')
        .update({ status: status as Task['status'] })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  async predictCompletion(id: string): Promise<ServiceResponse<any>> {
    try {
      await this.checkAccess('task', id);

      const supabase = createClient();
      const { data, error } = await supabase.functions.invoke(
        'task-automation',
        {
          body: {
            task_id: id,
            action_type: 'predict_completion'
          }
        }
      );

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  async getGoalTasks(goalId: string): Promise<ServiceResponse<Task[]>> {
    try {
      await this.checkAccess('goal', goalId);
      
      const supabase = createClient();
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          subtasks (
            id,
            title,
            completed
          ),
          checklist_items (
            id,
            text,
            completed
          )
        `)
        .eq('goal_id', goalId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  async createTask(task: Partial<Task>): Promise<ServiceResponse<Task>> {
    try {
      await this.checkAccess('goal', task.goal_id!, ['owner', 'admin', 'member']);
      
      const supabase = createClient();
      const { data, error } = await supabase
        .from('tasks')
        .insert([{ ...task, creator_id: this.context.userId }])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  async updateTask(
    id: string,
    updates: Partial<Task>
  ): Promise<ServiceResponse<Task>> {
    try {
      await this.checkAccess('task', id);
      
      const supabase = createClient();
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  async deleteTask(id: string): Promise<ServiceResponse<boolean>> {
    try {
      await this.checkAccess('task', id, ['owner', 'admin']);
      
      const supabase = createClient();
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { data: true, error: null };
    } catch (error) {
      return { data: false, error: error as Error };
    }
  }

  async getTasksWithDependencies(
    goalId: string
  ): Promise<ServiceResponse<Task[]>> {
    try {
      await this.checkAccess('goal', goalId);
      
      const supabase = createClient();
      const { data, error } = await supabase.rpc('get_tasks_with_dependencies', {
        p_goal_id: goalId
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  async bulkUpdateTaskStatus(
    taskIds: string[],
    status: Task['status']
  ): Promise<ServiceResponse<boolean>> {
    try {
      await Promise.all(
        taskIds.map(id => this.checkAccess('task', id))
      );
      
      const supabase = createClient();
      const { error } = await supabase
        .from('tasks')
        .update({ status })
        .in('id', taskIds);

      if (error) throw error;
      return { data: true, error: null };
    } catch (error) {
      return { data: false, error: error as Error };
    }
  }
}