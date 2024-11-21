import { useEffect, useState } from 'react';
import { getSupabaseBrowserClient } from '@/utils/supabase/client';
import { Goal, getGoals, subscribeToGoals } from '@/utils/supabase/queries/goals';
import { useToast } from '@/components/ui/use-toast';

export function useGoals(workspaceId: string) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = getSupabaseBrowserClient();
  const { toast } = useToast();

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const loadGoals = async () => {
      try {
        setLoading(true);
        const data = await getGoals(supabase, workspaceId);
        setGoals(data);
      } catch (error) {
        toast({
          title: "Error loading goals",
          description: error instanceof Error ? error.message : "Unknown error occurred",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    const setupSubscription = () => {
      unsubscribe = subscribeToGoals(supabase, workspaceId, (updatedGoal) => {
        setGoals(current => {
          const exists = current.find(goal => goal.id === updatedGoal.id);
          if (exists) {
            return current.map(goal => 
              goal.id === updatedGoal.id ? updatedGoal : goal
            );
          }
          return [updatedGoal, ...current];
        });
      });
    };

    loadGoals();
    setupSubscription();

    return () => {
      unsubscribe?.();
    };
  }, [workspaceId, supabase, toast]);

  return { goals, loading };
} 