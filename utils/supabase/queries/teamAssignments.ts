 import { Database } from '@/types_db';
 import { SupabaseClient } from '@supabase/supabase-js';
 import { cache } from 'react';

 export type TeamAssignment =
   Database['public']['Tables']['team_assignments']['Row'];

 export const getTeamAssignmentsForWorkspace = cache(
   async (
     supabase: SupabaseClient,
     workspaceId: string
   ): Promise<TeamAssignment[]> => {
     const { data: assignments, error } = await supabase
       .from('team_assignments')
       .select('*')
       .eq('assignable_type', 'workspace')
       .eq('assignable_id', workspaceId);

     if (error)
       throw new Error(`Failed to fetch team assignments: ${error.message}`);
     return assignments || [];
   }
 );

 export const getTeamAssignmentsForGoal = cache(
   async (
     supabase: SupabaseClient,
     goalId: string
   ): Promise<TeamAssignment[]> => {
     const { data: assignments, error } = await supabase
       .from('team_assignments')
       .select('*')
       .eq('assignable_type', 'goal')
       .eq('assignable_id', goalId);

     if (error)
       throw new Error(`Failed to fetch team assignments for goal: ${error.message}`);
     return assignments || [];
   }
 );

 export const getTeamAssignmentsForMilestone = cache(
   async (
     supabase: SupabaseClient,
     milestoneId: string
   ): Promise<TeamAssignment[]> => {
     const { data: assignments, error } = await supabase
       .from('team_assignments')
       .select('*')
       .eq('assignable_type', 'milestone')
       .eq('assignable_id', milestoneId);

     if (error)
       throw new Error(`Failed to fetch team assignments for milestone: ${error.message}`);
     return assignments || [];
   }
 );

 export const getTeamAssignmentsForOrganisation = cache(
   async (
     supabase: SupabaseClient,
     organisationId: string
   ): Promise<TeamAssignment[]> => {
     const { data: assignments, error } = await supabase
       .from('team_assignments')
       .select('*')
       .eq('assignable_type', 'organisation')
       .eq('assignable_id', organisationId);

     if (error)
       throw new Error(`Failed to fetch team assignments for organisation: ${error.message}`);
     return assignments || [];
   }
 );

 export const getTeamAssignmentsForTask = cache(
   async (
     supabase: SupabaseClient,
     taskId: string
   ): Promise<TeamAssignment[]> => {
     const { data: assignments, error } = await supabase
       .from('team_assignments')
       .select('*')
       .eq('assignable_type', 'task')
       .eq('assignable_id', taskId);

     if (error)
       throw new Error(`Failed to fetch team assignments for task: ${error.message}`);
     return assignments || [];
   }
 );
