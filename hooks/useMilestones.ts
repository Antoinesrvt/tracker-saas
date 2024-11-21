import { useEffect, useState } from 'react';
import { getSupabaseBrowserClient } from '@/utils/supabase/client';
import { Milestone, getMilestones, subscribeToMilestones } from '@/utils/supabase/queries/milestones';
import { useToast } from '@/components/ui/use-toast';

export function useMilestones(goalId: string) {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const supabase = getSupabaseBrowserClient();
  const { toast } = useToast();

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const loadMilestones = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getMilestones(supabase, goalId);
        setMilestones(data);
      } catch (err) {
        const error = err as Error;
        setError(error);
        toast({
          title: "Error loading milestones",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    const setupSubscription = () => {
      unsubscribe = subscribeToMilestones(supabase, goalId, (updatedMilestone) => {
        setMilestones(current => {
          const exists = current.find(m => m.id === updatedMilestone.id);
          if (exists) {
            return current.map(m => 
              m.id === updatedMilestone.id ? updatedMilestone : m
            );
          }
          return [updatedMilestone, ...current];
        });
      });
    };

    loadMilestones();
    setupSubscription();

    return () => {
      unsubscribe?.();
    };
  }, [goalId, supabase, toast]);

  return { milestones, loading, error };
} 