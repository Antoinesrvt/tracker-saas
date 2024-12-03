import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  AutomationService,
  type Automation
} from '@/lib/services/automation.service';
import { useAuth } from '@/lib/providers/auth-provider';
import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export function useWorkspaceAutomations(workspaceId: string) {
  const { user, teamAccess } = useAuth();
  if (!user) throw new Error('User not found');
  const service = new AutomationService({ userId: user.id, teamAccess });
  const queryClient = useQueryClient();

  // Set up real-time subscription
  useEffect(() => {
    const supabase = createClient();
    const subscription = supabase
      .channel('automations')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'automations',
          filter: `workspace_id=eq.${workspaceId}`
        },
        () => {
          queryClient.invalidateQueries({
            queryKey: ['workspace-automations', workspaceId]
          });
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [workspaceId, queryClient]);

  return useQuery({
    queryKey: ['workspace-automations', workspaceId],
    queryFn: () => service.getWorkspaceAutomations(workspaceId),
    enabled: !!workspaceId
  });
}

export function useCreateAutomation() {
  const queryClient = useQueryClient();
  const { user, teamAccess } = useAuth();
  if (!user) throw new Error('User not found');
  const service = new AutomationService({ userId: user.id, teamAccess });

  return useMutation({
    mutationFn: (automation: Partial<Automation>) =>
      service.createAutomation(automation),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['workspace-automations', variables.workspace_id]
      });
    }
  });
}

export function useUpdateAutomation() {
  const queryClient = useQueryClient();
  const { user, teamAccess } = useAuth();
  if (!user) throw new Error('User not found');
  const service = new AutomationService({ userId: user.id, teamAccess });

  return useMutation({
    mutationFn: ({
      id,
      updates
    }: {
      id: string;
      updates: Partial<Automation>;
    }) => service.updateAutomation(id, updates),
    onSuccess: (data) => {
      if (data.data?.workspace_id) {
        queryClient.invalidateQueries({
          queryKey: ['workspace-automations', data.data.workspace_id]
        });
      }
    }
  });
}

export function useDeleteAutomation() {
  const queryClient = useQueryClient();
  const { user, teamAccess } = useAuth();
  if (!user) throw new Error('User not found');
  const service = new AutomationService({ userId: user.id, teamAccess });

  return useMutation({
    mutationFn: (automationId: string) =>
      service.deleteAutomation(automationId),
    onSuccess: (_, automationId) => {
      queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] === 'workspace-automations'
      });
    }
  });
}

export function useExecuteAutomation() {
  const { user, teamAccess } = useAuth();
  if (!user) throw new Error('User not found');
  const service = new AutomationService({ userId: user.id, teamAccess });

  return useMutation({
    mutationFn: (automationId: string) =>
      service.executeAutomation(automationId)
  });
}

export function useAutomationHistory(automationId: string) {
  const { user, teamAccess } = useAuth();
  if (!user) throw new Error('User not found');
  const service = new AutomationService({ userId: user.id, teamAccess });

  return useQuery({
    queryKey: ['automation-history', automationId],
    queryFn: () => service.getAutomationHistory(automationId),
    enabled: !!automationId
  });
}
