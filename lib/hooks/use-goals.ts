import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { GoalService } from '@/lib/services/goal.service';
import { useAuth } from '@/lib/providers/auth-provider';
import type { Goal } from '@/types/service.types';

export function useGoal(id: string) {
  const { user, teamAccess } = useAuth();
  if (!user) throw new Error('User not found');
  const service = new GoalService({ userId: user.id, teamAccess });

  return useQuery({
    queryKey: ['goal', id],
    queryFn: () => service.getGoal(id),
    enabled: !!id
  });
}

export function useWorkspaceGoals(workspaceId: string) {
  const { user, teamAccess } = useAuth();
  if (!user) throw new Error('User not found');
  const service = new GoalService({ userId: user.id, teamAccess });

  return useQuery({
    queryKey: ['workspace-goals', workspaceId],
    queryFn: () => service.getWorkspaceGoals(workspaceId),
    enabled: !!workspaceId
  });
}

export function useCreateGoal() {
  const queryClient = useQueryClient();
  const { user, teamAccess } = useAuth();
  if (!user) throw new Error('User not found');
  const service = new GoalService({ userId: user.id, teamAccess });

  return useMutation({
    mutationFn: (goal: Partial<Goal>) => service.createGoal(goal),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['workspace-goals', variables.workspace_id] });
      if (data.data?.id) {
        queryClient.invalidateQueries({ queryKey: ['goal', data.data.id] });
      }
    }
  });
}

export function useUpdateGoal() {
  const queryClient = useQueryClient();
  const { user, teamAccess } = useAuth();
  if (!user) throw new Error('User not found');
  const service = new GoalService({ userId: user.id, teamAccess });

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Goal> }) =>
      service.updateGoal(id, updates),
    onSuccess: (data) => {
      if (data.data) {
        queryClient.invalidateQueries({ queryKey: ['goal', data.data.id] });
        queryClient.invalidateQueries({ 
          queryKey: ['workspace-goals', data.data.workspace_id] 
        });
      }
    }
  });
}

export function useDeleteGoal() {
  const queryClient = useQueryClient();
  const { user, teamAccess } = useAuth();
  if (!user) throw new Error('User not found');
  const service = new GoalService({ userId: user.id, teamAccess });

  return useMutation({
    mutationFn: (goalId: string) => service.deleteGoal(goalId),
    onSuccess: (_, goalId) => {
      queryClient.invalidateQueries({ queryKey: ['goal', goalId] });
      queryClient.invalidateQueries({ 
        predicate: (query) => query.queryKey[0] === 'workspace-goals'
      });
    }
  });
}

export function useGoalTeam() {
  const queryClient = useQueryClient();
  const { user, teamAccess } = useAuth();
  if (!user) throw new Error('User not found');
  const service = new GoalService({ userId: user.id, teamAccess });

  return useMutation({
    mutationFn: ({ 
      goalId, 
      assignments 
    }: { 
      goalId: string; 
      assignments: { userId: string; role: string }[] 
    }) => service.updateGoalTeam(goalId, assignments),
    onSuccess: (_, { goalId }) => {
      queryClient.invalidateQueries({ queryKey: ['goal', goalId] });
    }
  });
}

export function useGoalAnalytics(goalId: string) {
  const { user, teamAccess } = useAuth();
  if (!user) throw new Error('User not found');
  const service = new GoalService({ userId: user.id, teamAccess });

  return useQuery({
    queryKey: ['goal-analytics', goalId],
    queryFn: () => service.getGoalAnalytics(goalId),
    enabled: !!goalId
  });
}