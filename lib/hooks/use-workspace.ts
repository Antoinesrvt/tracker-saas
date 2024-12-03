 import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
 import { WorkspaceService } from '@/lib/services/workspace.service';
 import { useAuth } from '@/lib/providers/auth-provider';
 import type { Workspace } from '@/types/service.types';

 export function useWorkspace(id: string) {
   const { user, teamAccess } = useAuth();
   if (!user) throw new Error('User not found');
   const service = new WorkspaceService({ userId: user.id, teamAccess }); 

   return useQuery({
     queryKey: ['workspace', id],
     queryFn: () => service.getWorkspace(id)
   });
 }

 export function useWorkspaces(organizationId: string) {
   const { user, teamAccess } = useAuth();
   if (!user) throw new Error('User not found');
   const service = new WorkspaceService({ userId: user.id, teamAccess });

   return useQuery({
     queryKey: ['workspaces', organizationId],
     queryFn: () => service.getWorkspaces(organizationId)
   });
 }

 export function useCreateWorkspace() {
   const queryClient = useQueryClient();
   const { user, teamAccess } = useAuth();
   if (!user) throw new Error('User not found');
   const service = new WorkspaceService({ userId: user.id, teamAccess });

   return useMutation({
     mutationFn: (workspace: Partial<Workspace>) =>
       service.createWorkspace(workspace),
     onSuccess: (data, variables) => {
       queryClient.invalidateQueries({
         queryKey: ['workspaces', variables.organization_id]
       });
     }
   });
 }