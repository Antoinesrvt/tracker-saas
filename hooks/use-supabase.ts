'use client'


import { createClient } from '@/lib/supabase/client'
import { useEffect, useState, useCallback } from 'react'
import type { User, Session, AuthError, RealtimeChannel } from '@supabase/supabase-js'
import type { Database, SupabaseClient } from '@/lib/supabase'

interface SupabaseState {
  user: User | null
  session: Session | null
  isLoading: boolean
  error: AuthError | null
}

interface AuthState extends SupabaseState {
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, metadata?: Record<string, any>) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updateProfile: (data: Partial<User>) => Promise<void>
  // New auth methods
  signInWithProvider: (provider: 'google' | 'github') => Promise<void>
  updatePassword: (newPassword: string) => Promise<void>
  // Real-time subscriptions
  subscribeToResource: <T extends keyof Database['public']['Tables']>(
    table: T,
    callback: (payload: Database['public']['Tables'][T]['Row']) => void
  ) => RealtimeChannel
}

export function useSupabase(): AuthState {
  const [supabase] = useState(() => createClient())
  const [state, setState] = useState<SupabaseState>({
    user: null,
    session: null,
    isLoading: true,
    error: null,
  })
  const [channels] = useState<Map<string, RealtimeChannel>>(new Map())

  // Enhanced sign in with OAuth providers
  const signInWithProvider = async (provider: 'google' | 'github') => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }))
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
    } catch (error) {
      setState(prev => ({ ...prev, error: error as AuthError }))
      throw error
    } finally {
      setState(prev => ({ ...prev, isLoading: false }))
    }
  }

   const updatePassword = async (newPassword: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }))
      
      // Password validation
      if (newPassword.length < 8) {
        throw new Error('Password must be at least 8 characters')
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })
      
      if (error) throw error
    } catch (error) {
      setState(prev => ({ ...prev, error: error as AuthError }))
      throw error
    } finally {
      setState(prev => ({ ...prev, isLoading: false }))
    }
  }

  // Real-time subscription handler
  const subscribeToResource = <T extends keyof Database['public']['Tables']>(
    table: T,
    callback: (payload: Database['public']['Tables'][T]['Row']) => void
  ) => {
    // Clean up existing subscription if any
    const existingChannel = channels.get(table)
    if (existingChannel) {
      existingChannel.unsubscribe()
    }

   // Create new subscription
    const channel = supabase
      .channel(`public:${table}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: table,
        },
        (payload) => {
          callback(payload.new as Database['public']['Tables'][T]['Row'])
        }
      )
      .subscribe()

    channels.set(table, channel)
    return channel
  }
  

   // Enhanced session refresh with retry logic
  const refreshSession = useCallback(async (retryCount = 3) => {
    const attempt = async (attemptNumber: number) => {
      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }))
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) throw error

        setState(prev => ({
          ...prev,
          session,
          user: session?.user ?? null,
          isLoading: false,
        }))
      } catch (error) {
        if (attemptNumber < retryCount) {
          // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attemptNumber) * 1000))
          return attempt(attemptNumber + 1)
        }
        setState(prev => ({
          ...prev,
          error: error as AuthError,
          isLoading: false,
        }))
      }
    }

    return attempt(0)
  }, [supabase])

  // Enhanced authentication methods
  const signIn = async (email: string, password: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }))
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
    } catch (error) {
      setState(prev => ({ ...prev, error: error as AuthError }))
      throw error
    } finally {
      setState(prev => ({ ...prev, isLoading: false }))
    }
  }

  const signUp = async (email: string, password: string, metadata?: Record<string, any>) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }))
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            ...metadata,
            default_role: 'user',
            created_at: new Date().toISOString(),
          },
        },
      })
      if (error) throw error
    } catch (error) {
      setState(prev => ({ ...prev, error: error as AuthError }))
      throw error
    } finally {
      setState(prev => ({ ...prev, isLoading: false }))
    }
  }

  const signOut = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }))
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error) {
      setState(prev => ({ ...prev, error: error as AuthError }))
      throw error
    } finally {
      setState(prev => ({ ...prev, isLoading: false }))
    }
  }

  const resetPassword = async (email: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }))
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })
      if (error) throw error
    } catch (error) {
      setState(prev => ({ ...prev, error: error as AuthError }))
      throw error
    } finally {
      setState(prev => ({ ...prev, isLoading: false }))
    }
  }

  const updateProfile = async (data: Partial<User>) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }))
      const { error } = await supabase.auth.updateUser({ data })
      if (error) throw error
    } catch (error) {
      setState(prev => ({ ...prev, error: error as AuthError }))
      throw error
    } finally {
      setState(prev => ({ ...prev, isLoading: false }))
    }
  }

  useEffect(() => {
    refreshSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setState(prev => ({
        ...prev,
        session,
        user: session?.user ?? null,
        isLoading: false,
      }))
    })
    

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, refreshSession])

  // Cleanup subscriptions on unmount
  useEffect(() => {
    return () => {
      channels.forEach(channel => {
        channel.unsubscribe()
      })
      channels.clear()
    }
  }, [channels])

  return {
    ...state,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile,
    signInWithProvider,
    updatePassword,
    subscribeToResource,
  }
}
