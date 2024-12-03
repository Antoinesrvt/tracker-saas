 import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
 import {
   TemplateService,
   type Template
 } from '@/lib/services/template.service';
 import { useAuth } from '@/lib/providers/auth-provider';

 export function useTemplates(workspaceId: string) {
   const { user, teamAccess } = useAuth();
   if (!user) throw new Error('User not found');
   const service = new TemplateService({ userId: user.id, teamAccess });

   return useQuery({
     queryKey: ['templates', workspaceId],
     queryFn: () => service.getTemplates(workspaceId),
     enabled: !!workspaceId
   });
 }

 export function useTemplate(id: string) {
   const { user, teamAccess } = useAuth();
   if (!user) throw new Error('User not found');
   const service = new TemplateService({ userId: user.id, teamAccess });

   return useQuery({
     queryKey: ['template', id],
     queryFn: () => service.getTemplate(id),
     enabled: !!id
   });
 }

 export function useCreateTemplate() {
   const queryClient = useQueryClient();
   const { user, teamAccess } = useAuth();
   if (!user) throw new Error('User not found');
   const service = new TemplateService({ userId: user.id, teamAccess });

   return useMutation({
     mutationFn: (template: Partial<Template>) =>
       service.createTemplate(template),
     onSuccess: (data, variables) => {
       if (variables.workspace_id) {
         queryClient.invalidateQueries({
           queryKey: ['templates', variables.workspace_id]
         });
       }
       if (data.data?.id) {
         queryClient.invalidateQueries({
           queryKey: ['template', data.data.id]
         });
       }
     }
   });
 }

 export function useUpdateTemplate() {
   const queryClient = useQueryClient();
   const { user, teamAccess } = useAuth();
   if (!user) throw new Error('User not found');
   const service = new TemplateService({ userId: user.id, teamAccess });

   return useMutation({
     mutationFn: ({
       id,
       updates
     }: {
       id: string;
       updates: Partial<Template>;
     }) => service.updateTemplate(id, updates),
     onSuccess: (data) => {
       if (data.data) {
         queryClient.invalidateQueries({
           queryKey: ['template', data.data.id]
         });
         if (data.data.workspace_id) {
           queryClient.invalidateQueries({
             queryKey: ['templates', data.data.workspace_id]
           });
         }
       }
     }
   });
 }

 export function useDeleteTemplate() {
   const queryClient = useQueryClient();
   const { user, teamAccess } = useAuth();
   if (!user) throw new Error('User not found');
   const service = new TemplateService({ userId: user.id, teamAccess });

   return useMutation({
     mutationFn: (templateId: string) => service.deleteTemplate(templateId),
     onSuccess: (_, templateId) => {
       queryClient.invalidateQueries({ queryKey: ['template', templateId] });
       queryClient.invalidateQueries({
         predicate: (query) => query.queryKey[0] === 'templates'
       });
     }
   });
 }

 export function useApplyTemplate() {
   const queryClient = useQueryClient();
   const { user, teamAccess } = useAuth();
   if (!user) throw new Error('User not found');
   const service = new TemplateService({ userId: user.id, teamAccess });

   return useMutation({
     mutationFn: async ({
       templateId,
       variables
     }: {
       templateId: string;
       variables: Record<string, any>;
     }) => {
       const result = await service.applyTemplate(templateId, variables);
       await service.incrementUsageCount(templateId);
       return result;
     },
     onSuccess: (_, variables) => {
       queryClient.invalidateQueries({
         queryKey: ['template', variables.templateId]
       });
     }
   });
 }

 // Specialized hooks for template categories
 export function useTemplatesByType(
   workspaceId: string,
   type: Template['type']
 ) {
   const { data: templates } = useTemplates(workspaceId);
   return templates?.data?.filter((t) => t.type === type) || [];
 }

 export function useTemplatesByCategory(workspaceId: string, category: string) {
   const { data: templates } = useTemplates(workspaceId);
   return templates?.data?.filter((t) => t.category === category) || [];
 }

 export function usePopularTemplates(workspaceId: string, limit = 5) {
   const { data: templates } = useTemplates(workspaceId);
   return (
     templates?.data
       ?.sort((a, b) => b.usage_count - a.usage_count)
       .slice(0, limit) || []
   );
 }