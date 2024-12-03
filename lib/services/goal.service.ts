import { BaseService } from './base.service'
import { createClient } from '@/lib/supabase/client'
import type { Goal, ServiceResponse } from '@/types/service.types'

export class GoalService extends BaseService {
  async getGoal(id: string): Promise<ServiceResponse<Goal>> {
    try {
      await this.checkAccess('goal', id)
      
      const supabase = createClient()
      const { data, error } = await supabase
        .from('goals')
        .select(`
          *,
          milestones (
            id,
            title,
            status,
            target_date,
            progress,
            is_critical
          ),
          tasks (
            id,
            title,
            status,
            priority,
            assignees,
            deadline
          ),
          parent_goal:goals!parent_goal_id (
            id,
            title,
            status,
            type
          ),
          team_assignments (
            user_id,
            role
          )
        `)
        .eq('id', id)
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }

  async getWorkspaceGoals(workspaceId: string): Promise<ServiceResponse<Goal[]>> {
    try {
      await this.checkAccess('workspace', workspaceId)
      
      const supabase = createClient()
      const { data, error } = await supabase
        .from('goals')
        .select(`
          *,
          tasks: tasks(count),
          milestones: milestones(count),
          team_assignments (
            user_id,
            role
          )
        `)
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }

  async createGoal(goal: Partial<Goal>): Promise<ServiceResponse<Goal>> {
    try {
      await this.checkAccess('workspace', goal.workspace_id!, ['owner', 'admin'])
      
      const supabase = createClient()
      const { data, error } = await supabase
        .from('goals')
        .insert([goal])
        .select()
        .single()

      if (error) throw error

      // Create initial team assignment for creator
      if (data) {
        const { error: assignmentError } = await supabase
          .from('team_assignments')
          .insert([{
            user_id: this.context.userId,
            assignable_type: 'goal',
            assignable_id: data.id,
            role: 'owner'
          }])

        if (assignmentError) throw assignmentError
      }

      return { data, error: null }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }

  async updateGoal(id: string, updates: Partial<Goal>): Promise<ServiceResponse<Goal>> {
    try {
      await this.checkAccess('goal', id, ['owner', 'admin'])
      
      const supabase = createClient()
      const { data, error } = await supabase
        .from('goals')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }

  async deleteGoal(id: string): Promise<ServiceResponse<boolean>> {
    try {
      await this.checkAccess('goal', id, ['owner'])
      
      const supabase = createClient()
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', id)

      if (error) throw error
      return { data: true, error: null }
    } catch (error) {
      return { data: false, error: error as Error }
    }
  }

  async updateGoalTeam(
    id: string,
    assignments: { userId: string; role: string }[]
  ): Promise<ServiceResponse<boolean>> {
    try {
      await this.checkAccess('goal', id, ['owner', 'admin'])
      
      const supabase = createClient()
      
      // First, remove existing assignments
      const { error: deleteError } = await supabase
        .from('team_assignments')
        .delete()
        .eq('assignable_type', 'goal')
        .eq('assignable_id', id)
        .neq('role', 'owner') // Preserve owner assignment

      if (deleteError) throw deleteError

      // Then, add new assignments
      if (assignments.length > 0) {
        const { error: insertError } = await supabase
          .from('team_assignments')
          .insert(
            assignments.map(a => ({
              user_id: a.userId,
              assignable_type: 'goal',
              assignable_id: id,
              role: a.role
            }))
          )

        if (insertError) throw insertError
      }

      return { data: true, error: null }
    } catch (error) {
      return { data: false, error: error as Error }
    }
  }

  async calculateProgress(id: string): Promise<ServiceResponse<number>> {
    try {
      await this.checkAccess('goal', id)
      
      const supabase = createClient()
      const { data, error } = await supabase.rpc('calculate_goal_progress', {
        p_goal_id: id
      })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }

  async getGoalAnalytics(id: string): Promise<ServiceResponse<any>> {
    try {
      await this.checkAccess('goal', id)
      
      const supabase = createClient()
      const { data, error } = await supabase.functions.invoke('analytics', {
        body: {
          goal_id: id,
          analysis_type: 'goal_performance'
        }
      })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }
}