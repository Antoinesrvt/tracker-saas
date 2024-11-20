import { useCallback, useEffect, useState } from 'react'
import { getSupabaseBrowserClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import type { Database } from '@/types/supabase'

export function useWorkspace() {
  const [workspace, setWorkspace] = useState<Database['public']['Tables']['workspaces']['Row'] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const router = useRouter()
  const supabase = getSupabaseBrowserClient();

  const fetchWorkspace = useCallback(async () => {
    try {
      setLoading(true)
      const { data: workspace, error: workspaceError } = await supabase
        .from('workspaces')
        .select('*, organization:organizations(*)')
        .limit(1)
        .single()

      if (workspaceError) {
        if (workspaceError.code === 'PGRST116') { // No data found
          router.push('/workspace/new')
          return
        }
        throw workspaceError
      }

      setWorkspace(workspace)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch workspace'))
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    fetchWorkspace()
  }, [fetchWorkspace])

  return { workspace, loading, error, refetch: fetchWorkspace }
} 