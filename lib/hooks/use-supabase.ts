 import { createClient, supabaseService } from '@/lib/services/supabase';
 import { useQuery, useMutation } from '@tanstack/react-query';

 export function useGoals(workspaceId: string) {
   return useQuery({
     queryKey: ['goals', workspaceId],
     queryFn: () => supabaseService.getGoals(workspaceId)
   });
 }

 export function useTasks(goalId: string) {
   return useQuery({
     queryKey: ['tasks', goalId],
     queryFn: () => supabaseService.getTasks(goalId)
   });
 }

 export function useWorkspaceAnalytics(workspaceId: string) {
   return useQuery({
     queryKey: ['workspace-analytics', workspaceId],
     queryFn: () => supabaseService.getWorkspaceAnalytics(workspaceId)
   });
 }