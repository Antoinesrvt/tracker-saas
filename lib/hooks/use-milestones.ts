 import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
 import { MilestoneService } from '@/lib/services/milestone.service';
 import { useAuth } from '@/lib/providers/auth-provider';
 import type { Milestone } from '@/types/service.types';

 export function useMilestone(id: string) {
   const { user, teamAccess } = useAuth();
   if (!user) throw new Error('User not found');
   const service = new MilestoneService({ userId: user.id, teamAccess });

   return useQuery({
     queryKey: ['milestone', id],
     queryFn: () => service.getMilestone(id),
     enabled: !!id
   });
 }

 export function useGoalMilestones(goalId: string) {
   const { user, teamAccess } = useAuth();
   if (!user) throw new Error('User not found');
   const service = new MilestoneService({ userId: user.id, teamAccess });

   return useQuery({
     queryKey: ['goal-milestones', goalId],
     queryFn: () => service.getGoalMilestones(goalId),
     enabled: !!goalId
   });
 }

 export function useCreateMilestone() {
   const queryClient = useQueryClient();
   const { user, teamAccess } = useAuth();
   if (!user) throw new Error('User not found');
   const service = new MilestoneService({ userId: user.id, teamAccess });

   return useMutation({
     mutationFn: (milestone: Partial<Milestone>) =>
       service.createMilestone(milestone),
     onSuccess: (data, variables) => {
       queryClient.invalidateQueries({
         queryKey: ['goal-milestones', variables.goal_id]
       });
       queryClient.invalidateQueries({
         queryKey: ['milestone', data.data?.id]
       });
     }
   });
 }

 export function useUpdateMilestone() {
   const queryClient = useQueryClient();
   const { user, teamAccess } = useAuth();
   if (!user) throw new Error('User not found');
   const service = new MilestoneService({ userId: user.id, teamAccess });

   return useMutation({
     mutationFn: ({
       id,
       updates
     }: {
       id: string;
       updates: Partial<Milestone>;
     }) => service.updateMilestone(id, updates),
     onSuccess: (data, variables) => {
       queryClient.invalidateQueries({ queryKey: ['milestone', variables.id] });
       if (data.data?.goal_id) {
         queryClient.invalidateQueries({
           queryKey: ['goal-milestones', data.data.goal_id]
         });
       }
     }
   });
 }

 export function useDeleteMilestone() {
   const queryClient = useQueryClient();
   const { user, teamAccess } = useAuth();
   if (!user) throw new Error('User not found');
   const service = new MilestoneService({ userId: user.id, teamAccess });

   return useMutation({
     mutationFn: (milestoneId: string) => service.deleteMilestone(milestoneId),
     onSuccess: (_, milestoneId) => {
       queryClient.invalidateQueries({ queryKey: ['milestone', milestoneId] });
       queryClient.invalidateQueries({
         predicate: (query) => query.queryKey[0] === 'goal-milestones'
       });
     }
   });
 }

 export function useMilestoneProgress(milestoneId: string) {
   const { user, teamAccess } = useAuth();
   if (!user) throw new Error('User not found');
   const service = new MilestoneService({ userId: user.id, teamAccess });

   return useQuery({
     queryKey: ['milestone-progress', milestoneId],
     queryFn: () => service.updateMilestoneProgress(milestoneId),
     enabled: !!milestoneId
   });
 }