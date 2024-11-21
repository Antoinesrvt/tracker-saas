import { Database } from '@/types_db';
import { SupabaseClient } from '@supabase/supabase-js';
import { cache } from 'react';

export type Milestone = Database['public']['Tables']['milestones']['Row'];
export type NewMilestone = Database['public']['Tables']['milestones']['Insert'];

// Read operations
export const getMilestones = cache(async (
  supabase: SupabaseClient,
  goalId: string
): Promise<Milestone[]> => {
  const { data: milestones, error } = await supabase
    .from('milestones')
    .select('*')
    .eq('goal_id', goalId)
    .order('due_date', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch milestones: ${error.message}`);
  }

  return milestones;
});

// Real-time subscription helper
export const subscribeToMilestones = (
  supabase: SupabaseClient,
  goalId: string,
  callback: (milestone: Milestone) => void
) => {
  const subscription = supabase
    .channel(`milestones:${goalId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'milestones',
        filter: `goal_id=eq.${goalId}`
      },
      (payload) => {
        callback(payload.new as Milestone);
      }
    )
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
};

// Write operations with enhanced error handling
export const createMilestone = async (
  supabase: SupabaseClient,
  milestone: NewMilestone
): Promise<Milestone> => {
  try {
    const { data, error } = await supabase
      .from('milestones')
      .insert(milestone)
      .select('*')
      .single();

    if (error) throw error;
    if (!data) throw new Error('No data returned from milestone creation');

    return data;
  } catch (error) {
    throw new Error(`Failed to create milestone: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const updateMilestone = async (
  supabase: SupabaseClient,
  milestoneId: string,
  updates: Partial<NewMilestone>
): Promise<Milestone> => {
  try {
    const { data, error } = await supabase
      .from('milestones')
      .update(updates)
      .eq('id', milestoneId)
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('No data returned from milestone update');

    return data;
  } catch (error) {
    throw new Error(`Failed to update milestone: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const deleteMilestone = async (
  supabase: SupabaseClient,
  milestoneId: string
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('milestones')
      .delete()
      .eq('id', milestoneId);

    if (error) throw error;
  } catch (error) {
    throw new Error(`Failed to delete milestone: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}; 