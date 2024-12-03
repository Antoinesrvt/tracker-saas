 import { BaseService } from './base.service';
 import { createClient } from '@/lib/supabase/client';
 import type { Milestone, ServiceResponse } from '@/types/service.types';

 export class MilestoneService extends BaseService {
   async getMilestone(id: string): Promise<ServiceResponse<Milestone>> {
     try {
       await this.checkAccess('milestone', id);

       const supabase = createClient();
       const { data, error } = await supabase
         .from('milestones')
         .select(
           `
          *,
          tasks (
            id,
            title,
            status,
            priority,
            assignees,
            deadline
          ),
          goal (
            id,
            title,
            status,
            type
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

   async getGoalMilestones(
     goalId: string
   ): Promise<ServiceResponse<Milestone[]>> {
     try {
       await this.checkAccess('goal', goalId);

       const supabase = createClient();
       const { data, error } = await supabase
         .from('milestones')
         .select(
           `
          *,
          tasks: tasks(count),
          completed_tasks: tasks(count)
        `
         )
         .eq('goal_id', goalId)
         .eq('tasks.status', 'completed')
         .order('target_date', { ascending: true });

       if (error) throw error;
       return { data, error: null };
     } catch (error) {
       return { data: null, error: error as Error };
     }
   }

   async createMilestone(
     milestone: Partial<Milestone>
   ): Promise<ServiceResponse<Milestone>> {
     try {
       await this.checkAccess('goal', milestone.goal_id!, ['owner', 'admin']);

       const supabase = createClient();
       const { data, error } = await supabase
         .from('milestones')
         .insert([milestone])
         .select()
         .single();

       if (error) throw error;
       return { data, error: null };
     } catch (error) {
       return { data: null, error: error as Error };
     }
   }

   async updateMilestone(
     id: string,
     updates: Partial<Milestone>
   ): Promise<ServiceResponse<Milestone>> {
     try {
       await this.checkAccess('milestone', id, ['owner', 'admin']);

       const supabase = createClient();
       const { data, error } = await supabase
         .from('milestones')
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

   async deleteMilestone(id: string): Promise<ServiceResponse<boolean>> {
     try {
       await this.checkAccess('milestone', id, ['owner', 'admin']);

       const supabase = createClient();
       const { error } = await supabase
         .from('milestones')
         .delete()
         .eq('id', id);

       if (error) throw error;
       return { data: true, error: null };
     } catch (error) {
       return { data: false, error: error as Error };
     }
   }

   async updateMilestoneProgress(id: string): Promise<ServiceResponse<number>> {
     try {
       await this.checkAccess('milestone', id);

       const supabase = createClient();
       const { data: tasks, error: tasksError } = await supabase
         .from('tasks')
         .select('status')
         .eq('milestone_id', id);

       if (tasksError) throw tasksError;

       const totalTasks = tasks.length;
       const completedTasks = tasks.filter(
         (t) => t.status === 'completed'
       ).length;
       const progress =
         totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

       const { error: updateError } = await supabase
         .from('milestones')
         .update({ progress })
         .eq('id', id);

       if (updateError) throw updateError;
       return { data: progress, error: null };
     } catch (error) {
       return { data: null, error: error as Error };
     }
   }
 }