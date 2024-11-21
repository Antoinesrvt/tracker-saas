import { Database } from '@/types_db';
import { SupabaseClient } from '@supabase/supabase-js';
import { cache } from 'react';

export type Goal = Database['public']['Tables']['goals']['Row'];
export type NewGoal = Database['public']['Tables']['goals']['Insert'];

// Read operations
export const getGoals = cache(async (supabase: SupabaseClient, workspaceId: string): Promise<Goal[]>   => {
  const { data: goals, error } = await supabase
    .from('goals')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Failed to fetch goals: ${error.message}`);
  return goals;
});

// Real-time subscription helper
export const subscribeToGoals = (
  supabase: SupabaseClient,
  workspaceId: string,
  callback: (goal: Goal) => void
) => {
  const subscription = supabase
    .channel(`goals:${workspaceId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'goals',
        filter: `workspace_id=eq.${workspaceId}`
      },
      (payload) => {
        callback(payload.new as Goal);
      }
    )
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
};

// Write operations
export const createGoal = async (
  supabase: SupabaseClient,
  goal: NewGoal
): Promise<Goal> => {
  const { data, error } = await supabase
    .from('goals')
    .insert(goal)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create goal: ${error.message}`);
  }

  return data;
};

export const updateGoal = async (
  supabase: SupabaseClient,
  goalId: string,
  updates: Partial<NewGoal>
): Promise<Goal> => {
  const { data, error } = await supabase
    .from('goals')
    .update(updates)
    .eq('id', goalId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update goal: ${error.message}`);
  }

  return data;
};

export const deleteGoal = async (
  supabase: SupabaseClient,
  goalId: string
): Promise<void> => {
  const { error } = await supabase
    .from('goals')
    .delete()
    .eq('id', goalId);

  if (error) {
    throw new Error(`Failed to delete goal: ${error.message}`);
  }
}; 