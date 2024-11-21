import { useEffect, useState, useMemo } from 'react';
import { getSupabaseBrowserClient } from '@/utils/supabase/client';
import { Task, getTasks, subscribeToTasks } from '@/utils/supabase/queries/tasks';
import { useToast } from '@/components/ui/use-toast';

export interface TaskFilters {
  milestoneId?: string;
  type?: string;
  status?: string;
  priority?: string;
  assigneeId?: string;
  includePastDue?: boolean;
}

export function useTasks(goalId: string, filters: TaskFilters = {}) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const supabase = getSupabaseBrowserClient();
  const { toast } = useToast();

  // Memoized filtered tasks
  const filteredTasks = useMemo(() => {
    let filtered = [...tasks];

    if (filters.milestoneId) {
      filtered = filtered.filter(task => task.milestone_id === filters.milestoneId);
    }

    // if (filters.type) {
    //   filtered = filtered.filter(task => task. === filters.type);
    // }

    if (filters.status) {
      filtered = filtered.filter(task => task.status === filters.status);
    }

    if (filters.priority) {
      filtered = filtered.filter(task => task.priority === filters.priority);
    }

    // if (filters.assigneeId) {
    //   filtered = filtered.filter(task => task. === filters.assigneeId);
    // }

    if (filters.includePastDue === false) {
      const now = new Date();
      filtered = filtered.filter(task => {
        if (!task.deadline) return true;
        return new Date(task.deadline) >= now;
      });
    }

    return filtered;
  }, [tasks, filters]);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const loadTasks = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getTasks(supabase, goalId);
        setTasks(data);
      } catch (err) {
        const error = err as Error;
        setError(error);
        toast({
          title: "Error loading tasks",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    const setupSubscription = () => {
      unsubscribe = subscribeToTasks(supabase, goalId, (updatedTask) => {
        setTasks(current => {
          const exists = current.find(t => t.id === updatedTask.id);
          if (exists) {
            return current.map(t => 
              t.id === updatedTask.id ? updatedTask : t
            );
          }
          return [updatedTask, ...current];
        });
      });
    };

    loadTasks();
    setupSubscription();

    return () => {
      unsubscribe?.();
    };
  }, [goalId, supabase, toast]);

  // Additional utility functions for task management
  const taskUtils = useMemo(() => ({
    getOverdueTasks: () => {
      const now = new Date();
      return filteredTasks.filter(task => 
        task.deadline && new Date(task.deadline) < now
      );
    },
    getTasksByPriority: (priority: string) => {
      return filteredTasks.filter(task => task.priority === priority);
    },
      // getTasksByAssignee: (assigneeId: string) => {
      //   return filteredTasks.filter(task => task.assignee_id === assigneeId);
      // },
    getTasksByStatus: (status: string) => {
      return filteredTasks.filter(task => task.status === status);
    },
    getTasksWithoutMilestone: () => {
      return filteredTasks.filter(task => !task.milestone_id);
    }
  }), [filteredTasks]);

  return { 
    tasks: filteredTasks, 
    loading, 
    error,
    ...taskUtils
  };
} 