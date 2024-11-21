'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User, Subscription } from '@supabase/supabase-js';
import { Database } from '@/types_db';
import { getSupabaseBrowserClient } from '@/utils/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';
import { 
  getSubscription, 
  getUserDetails,
} from '@/utils/supabase/queries';
import { getUserOrganizations } from '@/utils/supabase/queries/organizations';

type Workspace = Database['public']['Tables']['workspaces']['Row'];
type Organization = Database['public']['Tables']['organizations']['Row'];

interface AuthContextType {
  user: User | null;
  userDetails: any | null;
  subscription: Subscription | null;
  organizations: Organization[];
  workspace: Workspace | null;
  loading: boolean;
  error: Error | null;
  signOut: () => Promise<void>;
  refreshData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userDetails, setUserDetails] = useState<any | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const supabase = getSupabaseBrowserClient();
  const { toast } = useToast();
  const router = useRouter();

  const loadUserData = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      
      if (!user) {
        await signOut();
        return;
      }

      setUser(user);

      // Load all user-related data in parallel
      const [details, sub, orgs, ws] = await Promise.all([
        getUserDetails(supabase),
        getSubscription(supabase),
        getUserOrganizations(supabase),
        supabase
          .from('workspaces')
          .select('*, organization:organizations(*)')
          .limit(1)
          .single()
          .then(({ data, error }) => {
            if (error) throw error;
            return data;
          }),
      ]);

      setUserDetails(details);
      setSubscription(sub);
      setOrganizations(orgs);
      setWorkspace(ws);

      // Set up real-time subscriptions
      const orgSubscription = supabase
        .channel('org_changes')
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'organizations',
          filter: `user_id=eq.${user.id}`,
        }, async () => {
          const updatedOrgs = await getUserOrganizations(supabase);
          setOrganizations(updatedOrgs);
        })
        .subscribe();

        
        orgSubscription.unsubscribe();
      
    } catch (err) {
      const error = err as Error;
      setError(error);
      toast({
        title: "Error loading user data",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setUserDetails(null);
      setSubscription(null);
      setOrganizations([]);
      setWorkspace(null);
      router.push('/signin');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  useEffect(() => {
    const { data: { subscription: authSubscription } } = 
      supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          await loadUserData();
        } else {
          await signOut();
        }
      });

    loadUserData();

    return () => {
      authSubscription.unsubscribe();
    };
  }, []);

  const value: AuthContextType = {
    user,
    userDetails,
    subscription,
    organizations,
    workspace,
    loading,
    error,
    signOut,
    refreshData: loadUserData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(redirectTo = '/signin') {
  const context = useContext(AuthContext);
  const router = useRouter();

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  useEffect(() => {
    if (!context.loading && !context.user) {
      router.push(`${redirectTo}?returnTo=${encodeURIComponent(window.location.pathname)}`);
    }
  }, [context.loading, context.user, redirectTo, router]);

  return context;
} 