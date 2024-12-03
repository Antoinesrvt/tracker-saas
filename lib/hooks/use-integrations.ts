 import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
 import {
   IntegrationService,
   type Integration
 } from '@/lib/services/integration.service';
 import { useAuth } from '@/lib/providers/auth-provider';

 export function useIntegrations(workspaceId: string) {
   const { user, teamAccess } = useAuth();
   if (!user) throw new Error('User not found');
   const service = new IntegrationService({ userId: user.id, teamAccess });

   return useQuery({
     queryKey: ['integrations', workspaceId],
     queryFn: () => service.getIntegrations(workspaceId),
     enabled: !!workspaceId
   });
 }

 export function useConfigureIntegration() {
   const queryClient = useQueryClient();
   const { user, teamAccess } = useAuth();
   if (!user) throw new Error('User not found');
   const service = new IntegrationService({ userId: user.id, teamAccess });

   return useMutation({
     mutationFn: ({
       workspaceId,
       integration
     }: {
       workspaceId: string;
       integration: Partial<Integration>;
     }) => service.configureIntegration(workspaceId, integration),
     onSuccess: (_, variables) => {
       queryClient.invalidateQueries({
         queryKey: ['integrations', variables.workspaceId]
       });
     }
   });
 }

 export function useSyncIntegration() {
   const queryClient = useQueryClient();
   const { user, teamAccess } = useAuth();
   if (!user) throw new Error('User not found');
   const service = new IntegrationService({ userId: user.id, teamAccess });

   return useMutation({
     mutationFn: (integrationId: string) =>
       service.syncIntegration(integrationId),
     onSuccess: (_, integrationId) => {
       queryClient.invalidateQueries({
         queryKey: ['integrations']
       });
     }
   });
 }

 export function useDeleteIntegration() {
   const queryClient = useQueryClient();
   const { user, teamAccess } = useAuth();
   if (!user) throw new Error('User not found');
   const service = new IntegrationService({ userId: user.id, teamAccess });

   return useMutation({
     mutationFn: (integrationId: string) =>
       service.deleteIntegration(integrationId),
     onSuccess: () => {
       queryClient.invalidateQueries({
         queryKey: ['integrations']
       });
     }
   });
 }

 // Specialized hooks for specific integrations
 export function useGithubIntegration(workspaceId: string) {
   const { data: integrations } = useIntegrations(workspaceId);
   return integrations?.data?.find((i) => i.provider === 'github');
 }

 export function useJiraIntegration(workspaceId: string) {
   const { data: integrations } = useIntegrations(workspaceId);
   return integrations?.data?.find((i) => i.provider === 'jira');
 }

 export function useSlackIntegration(workspaceId: string) {
   const { data: integrations } = useIntegrations(workspaceId);
   return integrations?.data?.find((i) => i.provider === 'slack');
 }