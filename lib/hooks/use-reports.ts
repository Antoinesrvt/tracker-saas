 import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
 import { ReportService, type Report } from '@/lib/services/report.service';
 import { useAuth } from '@/lib/providers/auth-provider';

 export function useWorkspaceReports(workspaceId: string) {
   const { user, teamAccess } = useAuth();
   if (!user) throw new Error('User not found');
   const service = new ReportService({ userId: user.id, teamAccess });

   return useQuery({
     queryKey: ['workspace-reports', workspaceId],
     queryFn: () => service.getWorkspaceReports(workspaceId),
     enabled: !!workspaceId
   });
 }

 export function useReport(id: string) {
   const { user, teamAccess } = useAuth();
   if (!user) throw new Error('User not found');
   const service = new ReportService({ userId: user.id, teamAccess });

   return useQuery({
     queryKey: ['report', id],
     queryFn: () => service.getReport(id),
     enabled: !!id
   });
 }

 export function useGenerateReport() {
   const queryClient = useQueryClient();
   const { user, teamAccess } = useAuth();
   if (!user) throw new Error('User not found');
   const service = new ReportService({ userId: user.id, teamAccess });

   return useMutation({
     mutationFn: ({
       workspaceId,
       config
     }: {
       workspaceId: string;
       config: Parameters<ReportService['generateReport']>[1];
     }) => service.generateReport(workspaceId, config),
     onSuccess: (data, variables) => {
       queryClient.invalidateQueries({
         queryKey: ['workspace-reports', variables.workspaceId]
       });
       if (data.data?.id) {
         queryClient.invalidateQueries({ queryKey: ['report', data.data.id] });
       }
     }
   });
 }

 export function useDeleteReport() {
   const queryClient = useQueryClient();
   const { user, teamAccess } = useAuth();
   if (!user) throw new Error('User not found');
   const service = new ReportService({ userId: user.id, teamAccess });

   return useMutation({
     mutationFn: (reportId: string) => service.deleteReport(reportId),
     onSuccess: (_, reportId) => {
       queryClient.invalidateQueries({ queryKey: ['report', reportId] });
       queryClient.invalidateQueries({
         predicate: (query) => query.queryKey[0] === 'workspace-reports'
       });
     }
   });
 }

 // Specialized hooks for common report types
 export function usePerformanceReport(workspaceId: string) {
   const generateReport = useGenerateReport();

   const generate = async (dateRange: { start: string; end: string }) => {
     return generateReport.mutateAsync({
       workspaceId,
       config: {
         type: 'performance',
         format: 'pdf',
         sections: ['overview', 'goals', 'tasks', 'resources'],
         date_range: dateRange
       }
     });
   };

   return {
     generate,
     isGenerating: generateReport.isPending
   };
 }

 export function useResourceReport(workspaceId: string) {
   const generateReport = useGenerateReport();

   const generate = async (dateRange: { start: string; end: string }) => {
     return generateReport.mutateAsync({
       workspaceId,
       config: {
         type: 'resources',
         format: 'excel',
         sections: ['utilization', 'allocation', 'costs'],
         date_range: dateRange
       }
     });
   };

   return {
     generate,
     isGenerating: generateReport.isPending
   };
 }