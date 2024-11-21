import { Database } from '@/types_db';
import { SupabaseClient } from '@supabase/supabase-js';
import { cache } from 'react';

export type Task = Database['public']['Tables']['tasks']['Row'];
export type NewTask = Database['public']['Tables']['tasks']['Insert'];

// Read operations
export const getTasks = cache(async (
  supabase: SupabaseClient,
  milestoneId: string
): Promise<Task[]> => {
  const { data: tasks, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('milestone_id', milestoneId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch tasks: ${error.message}`);
  }

  return tasks;
});

// Real-time subscription helper
export const subscribeToTasks = (
  supabase: SupabaseClient,
  milestoneId: string,
  callback: (task: Task) => void
) => {
  const subscription = supabase
    .channel(`tasks:${milestoneId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'tasks',
        filter: `milestone_id=eq.${milestoneId}`
      },
      (payload) => {
        callback(payload.new as Task);
      }
    )
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
};

// Write operations with validation and error handling
export const createTask = async (
  supabase: SupabaseClient,
  task: NewTask
): Promise<Task> => {
  try {
    // Validate required fields
    if (!task.title || !task.milestone_id) {
      throw new Error('Title and milestone_id are required');
    }

    const { data, error } = await supabase
      .from('tasks')
      .insert(task)
      .select('*')
      .single();

    if (error) throw error;
    if (!data) throw new Error('No data returned from task creation');

    return data;
  } catch (error) {
    throw new Error(`Failed to create task: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const updateTask = async (
  supabase: SupabaseClient,
  taskId: string,
  updates: Partial<NewTask>
): Promise<Task> => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', taskId)
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('No data returned from task update');

    return data;
  } catch (error) {
    throw new Error(`Failed to update task: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const deleteTask = async (
  supabase: SupabaseClient,
  taskId: string
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (error) throw error;
  } catch (error) {
    throw new Error(`Failed to delete task: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Additional helper for checklist items
export const updateTaskProgress = async (
  supabase: SupabaseClient,
  taskId: string,
  progress: number
): Promise<void> => {
  try {
    if (progress < 0 || progress > 100) {
      throw new Error('Progress must be between 0 and 100');
    }

    const { error } = await supabase
      .from('tasks')
      .update({ progress })
      .eq('id', taskId);

    if (error) throw error;
  } catch (error) {
    throw new Error(`Failed to update task progress: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}; 