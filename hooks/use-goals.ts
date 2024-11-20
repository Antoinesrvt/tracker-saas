import { useCallback, useEffect, useState } from 'react'
import { createSupabaseClient } from '@/utils/supabase/client'
import type { Database } from '@/types/supabase'
import { RealtimeChannel } from '@supabase/supabase-js'

type Goal = Database['public']['Tables']['goals']['Row']
type GoalConnection = Database['public']['Tables']['goal_connections']['Row']

interface GoalWithConnections extends Goal {
  connections: GoalConnection[]
}

export function useGoals(workspaceId?: string) {
  const [goals, setGoals] = useState<GoalWithConnections[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const supabase = createSupabaseClient()

  const fetchGoals = useCallback(async () => {
    if (!workspaceId) return
    try {
      setLoading(true)
      const { data: goalsData, error: goalsError } = await supabase
        .from('goals')
        .select(`
          *,
          connections:goal_connections(*)
        `)
        .eq('workspace_id', workspaceId)
        .order('level', { ascending: true })

      if (goalsError) throw goalsError
      setGoals(goalsData || [])
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch goals'))
    } finally {
      setLoading(false)
    }
  }, [workspaceId])

  useEffect(() => {
    let channel: RealtimeChannel | null = null

    if (workspaceId) {
      fetchGoals()

      channel = supabase
        .channel(`goals:${workspaceId}`)
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'goals',
            filter: `workspace_id=eq.${workspaceId}`
          }, 
          () => {
            fetchGoals()
          }
        )
        .subscribe()
    }

    return () => {
      channel?.unsubscribe()
    }
  }, [workspaceId, fetchGoals])

  return { goals, loading, error, refetch: fetchGoals }
} 