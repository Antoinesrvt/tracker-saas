'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { Database } from '@/types_db';
import { getSupabaseBrowserClient } from '@/utils/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { 
  getSubscription, 
  getUserDetails,
} from '@/utils/supabase/queries';
import { getUserOrganizations } from '@/utils/supabase/queries/organizations';
import { getUserWorkspaces } from '@/utils/supabase/queries/workspaces';

type Workspace = Database['public']['Tables']['workspaces']['Row'];
type Organization = Database['public']['Tables']['organizations']['Row'];

type AuthContextType = {
  user: User | null;
  userDetails: any | null;
  subscription: any | null;
  organizations: Organization[];
  workspaces: Workspace[] | null;
  loading: boolean;
  error: Error | null;
  signOut: () => Promise<void>;
  refreshOrganizations: () => Promise<void>;
  refreshWorkspaces: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userDetails, setUserDetails] = useState<any | null>(null);
  const [subscription, setSubscription] = useState<any | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const supabase = getSupabaseBrowserClient();
  const { toast } = useToast();

  const loadUserData = useCallback(async (currentUser: User) => {
    if (!currentUser?.id || userDetails?.id === currentUser.id) return;

    try {
      setError(null);
      const [details, sub] = await Promise.all([
        getUserDetails(supabase),
        getSubscription(supabase),
      ]);

      setUserDetails(details);
      setSubscription(sub);

      // Only fetch organizations and workspaces if we don't have them
      if (!organizations.length || !workspaces) {
        const [orgs, ws] = await Promise.all([
          getUserOrganizations(supabase),
          getUserWorkspaces(supabase),
        ]);
        setOrganizations(orgs || []);
        setWorkspaces(ws || null);
      }
    } catch (err) {
      console.error('Error loading user data:', err);
      setError(err as Error);
    }
  }, [supabase, organizations.length, workspaces, userDetails?.id]);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          await loadUserData(session.user);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsInitialized(true);
        setLoading(false);
      }
    };

    if (!isInitialized) {
      initializeAuth();
    }
  }, [isInitialized, loadUserData]);

  // Set up auth state listener only after initialization
  useEffect(() => {
    if (!isInitialized) return;

    const { data: { subscription: authSubscription } } = 
      supabase.auth.onAuthStateChange(async (event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        
        if (currentUser) {
          await loadUserData(currentUser);
        } else {
          setUserDetails(null);
          setSubscription(null);
          setOrganizations([]);
          setWorkspaces(null);
        }
        setLoading(false);
      });

    return () => {
      authSubscription.unsubscribe();
    };
  }, [isInitialized, loadUserData]);

  const signOut = async (): Promise<void> => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setUserDetails(null);
      setSubscription(null);
      setOrganizations([]);
      setWorkspaces(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const refreshOrganizations = async (): Promise<void> => {
    try {
      const orgs = await getUserOrganizations(supabase);
      setOrganizations(orgs);
    } catch (error) {
      console.error('Error refreshing organizations:', error);
    }
  };

  const refreshWorkspaces = async (): Promise<void> => {
    try {
      const ws = await getUserWorkspaces(supabase);
      setWorkspaces(ws);
    } catch (error) {
      console.error('Error refreshing workspaces:', error);
    }
  };

  const value: AuthContextType = {
    user,
    userDetails,
    subscription,
    organizations,
    workspaces,
    loading,
    error,
    signOut,
    refreshWorkspaces,
    refreshOrganizations,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(redirectTo = '/signin') {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
} 