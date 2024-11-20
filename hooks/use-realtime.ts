 'use client'

import { useEffect, useRef } from 'react'
import { useSupabaseContext } from '@/providers/supabase-provider'
import type { RealtimeChannel } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/database.types'

type TableName = keyof Database['public']['Tables']
type RowType<T extends TableName> = Database['public']['Tables'][T]['Row']

interface RealtimeOptions<T extends TableName> {
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*'
  filter?: string
  onData: (payload: RowType<T>) => void
  onError?: (error: Error) => void
}

export function useRealtime<T extends TableName>(
  table: T,
  options: RealtimeOptions<T>
) {
  const { supabase } = useSupabaseContext()
  const channelRef = useRef<RealtimeChannel | null>(null)

  useEffect(() => {
    const channel = supabase
      .channel(`public:${table}`)
      .on(
        'postgres_changes',
        {
          event: options.event || '*',
          schema: 'public',
          table: table,
          filter: options.filter,
        },
        (payload) => {
          try {
            options.onData(payload.new as RowType<T>)
          } catch (error) {
            options.onError?.(error as Error)
          }
        }
      )
      .subscribe((status) => {
        if (status === 'CLOSED') {
          options.onError?.(new Error('Subscription closed unexpectedly'))
        }
      })

    channelRef.current = channel

    return () => {
      channel.unsubscribe()
    }
  }, [table, options, supabase])

  return {
    unsubscribe: () => channelRef.current?.unsubscribe(),
  }
}