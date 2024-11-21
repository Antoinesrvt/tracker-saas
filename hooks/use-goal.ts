import { useCallback, useEffect, useState } from 'react'
import { getSupabaseBrowserClient } from '@/utils/supabase/client'
import type { Database } from 'types_db'
import { getMilestones } from '@/utils/supabase/queries/milestones'
import { getTasks } from '@/utils/supabase/queries/tasks'
import { getTeamAssignmentsForGoal } from '@/utils/supabase/queries/teamAssignments'

type Goal = Database['public']['Tables']['goals']['Row']
type Milestone = Database['public']['Tables']['milestones']['Row']
type Task = Database['public']['Tables']['tasks']['Row']
type TeamAssignment = Database['public']['Tables']['team_assignments']['Row']

export function useGoal(goalId: string) {
  const [goal, setGoal] = useState<Goal | null>(null)
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [teams, setTeams] = useState<TeamAssignment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const supabase = getSupabaseBrowserClient()

  const fetchGoalData = useCallback(async () => {
    try {
      setLoading(true)
      
      // Fetch goal details
      const { data: goalData, error: goalError } = await supabase
        .from('goals')
        .select('*')
        .eq('id', goalId)
        .single()

      if (goalError) throw goalError
      setGoal(goalData)

      // Fetch milestones
      const milestonesData = await getMilestones(supabase, goalId)
      setMilestones(milestonesData)

      // Fetch tasks for all milestones
      const allTasks = await Promise.all(
        milestonesData.map(milestone => getTasks(supabase, milestone.id))
      )
      setTasks(allTasks.flat())

      // Fetch team assignments
      const teamAssignmentsData = await getTeamAssignmentsForGoal(supabase, goalId)
      setTeams(teamAssignmentsData)

    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch goal data'))
    } finally {
      setLoading(false)
    }
  }, [supabase, goalId])

  const updateGoalProgress = async (progress: number) => {
    try {
      const { error } = await supabase
        .from('goals')
        .update({ progress })
        .eq('id', goalId)

      if (error) throw error
      setGoal(prev => prev ? { ...prev, progress } : null)
    } catch (err) {
      throw new Error(`Failed to update goal progress: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  useEffect(() => {
    if (goalId) {
      fetchGoalData()
    }
  }, [fetchGoalData, goalId])

  return {
    goal,
    milestones,
    tasks,
    teams,
    loading,
    error,
    refetch: fetchGoalData,
    updateGoalProgress
  }
} 