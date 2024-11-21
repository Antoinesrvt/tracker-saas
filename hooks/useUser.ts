import { useEffect, useState } from 'react';
import { getSupabaseBrowserClient } from '@/utils/supabase/client';
import { Subscription, User } from '@supabase/supabase-js';
import { Database } from '@/types_db';
import { useToast } from '@/components/ui/use-toast';
import { getSubscription, getUserDetails } from '@/utils/supabase/queries';

// type UserDetails = Database['users']['Row'];
// type Subscription = Database['public']['Tables']['subscriptions']['Row'];

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [userDetails, setUserDetails] = useState<any | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const supabase = getSupabaseBrowserClient();
  const { toast } = useToast();

  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get auth user (from auth.users table)
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        setUser(user);

        if (user) {
          // Get user details and subscription in parallel
          const [details, sub] = await Promise.all([
            getUserDetails(supabase),
            getSubscription(supabase)
          ]);

          setUserDetails(details);
          setSubscription(sub);
        }
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

    // Set up auth state change listener
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          const [details, sub] = await Promise.all([
            getUserDetails(supabase),
            getSubscription(supabase)
          ]);
          setUserDetails(details);
          setSubscription(sub);
        } else {
          setUser(null);
          setUserDetails(null);
          setSubscription(null);
        }
      }
    );

    loadUserData();

    return () => {
      authSubscription.unsubscribe();
    };
  }, [supabase, toast]);

  return {
    user,        // Auth user from auth.users
    userDetails, // User details from getUserDetails query
    subscription, // Subscription from getSubscription query
    loading,
    error,
    isLoaded: !loading && !error,
  };
} 