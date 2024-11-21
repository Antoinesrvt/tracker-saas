import { useCallback, useEffect, useState } from 'react'
import { getSupabaseBrowserClient } from '@/utils/supabase/client'
import type { Database } from 'types_db'
import { getGoals } from '@/utils/supabase/queries/goals'
import { getTeamAssignmentsForWorkspace } from '@/utils/supabase/queries/teamAssignments'
import { getWorkspace } from '@/utils/supabase/queries/workspaces'

export function useWorkspace(workspaceId: string) {
  const [workspace, setWorkspace] = useState<Database['public']['Tables']['workspaces']['Row'] | null>(null)
  const [goals, setGoals] = useState<Database['public']['Tables']['goals']['Row'][]>([])
  const [teams, setTeams] = useState<Database['public']['Tables']['team_assignments']['Row'][]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const supabase = getSupabaseBrowserClient();

  const fetchWorkspaceData = useCallback(async () => {
    try {
      setLoading(true)
      const workspaceData = await getWorkspace(supabase, workspaceId)
      setWorkspace(workspaceData)

      const goalsData = await getGoals(supabase, workspaceId)
      setGoals(goalsData)

      const teamAssignmentsData = await getTeamAssignmentsForWorkspace(
        supabase,
        workspaceId
      );
      setTeams(teamAssignmentsData)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch workspace data'))
    } finally {
      setLoading(false)
    }
  }, [supabase, workspaceId])

  useEffect(() => {
    if (workspaceId) {
      fetchWorkspaceData()
    }
  }, [fetchWorkspaceData, workspaceId])

  return { workspace, goals, teams, loading, error, refetch: fetchWorkspaceData }
} 