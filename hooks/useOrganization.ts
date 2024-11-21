import { useEffect, useState } from 'react';
import { getSupabaseBrowserClient } from '@/utils/supabase/client';
import { Organization, getUserOrganizations } from '@/utils/supabase/queries/organizations';
import { useToast } from '@/components/ui/use-toast';

export function useOrganization() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const supabase = getSupabaseBrowserClient();
  const { toast } = useToast();

  useEffect(() => {
    const loadOrganizations = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getUserOrganizations(supabase);
        setOrganizations(data);

        // Set up real-time subscription
        const subscription = supabase
          .channel('organizations_changes')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'organizations'
            },
            async (payload) => {
              // Reload organizations when changes occur
              const updatedData = await getUserOrganizations(supabase);
              setOrganizations(updatedData);
            }
          )
          .subscribe();

        return () => {
          subscription.unsubscribe();
        };
      } catch (err) {
        const error = err as Error;
        setError(error);
        toast({
          title: "Error loading organizations",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadOrganizations();
  }, [supabase, toast]);

  return { organizations, loading, error };
} 