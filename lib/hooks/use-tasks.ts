 import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
 import { TaskService } from '@/lib/services/task.service';
 import { useAuth } from '@/lib/providers/auth-provider';
 import type { Task } from '@/types/service.types';

 export function useTask(id: string) {
   const { user, teamAccess } = useAuth();
   if (!user) throw new Error('User not found');
   const service = new TaskService({ userId: user.id, teamAccess });

   return useQuery({
     queryKey: ['task', id],
     queryFn: () => service.getTask(id),
     enabled: !!id
   });
 }

 export function useGoalTasks(goalId: string) {
   const { user, teamAccess } = useAuth();
   if (!user) throw new Error('User not found');
   const service = new TaskService({ userId: user.id, teamAccess });

   return useQuery({
     queryKey: ['goal-tasks', goalId],
     queryFn: () => service.getGoalTasks(goalId),
     enabled: !!goalId
   });
 }

 export function useCreateTask() {
   const queryClient = useQueryClient();
   const { user, teamAccess } = useAuth();
   if (!user) throw new Error('User not found');
   const service = new TaskService({ userId: user.id, teamAccess });

   return useMutation({
     mutationFn: (task: Partial<Task>) => service.createTask(task),
     onSuccess: (data, variables) => {
       queryClient.invalidateQueries({
         queryKey: ['goal-tasks', variables.goal_id]
       });
       queryClient.invalidateQueries({ queryKey: ['task', data.data?.id] });
     }
   });
 }

 export function useUpdateTask() {
   const queryClient = useQueryClient();
   const { user, teamAccess } = useAuth();
   if (!user) throw new Error('User not found');
   const service = new TaskService({ userId: user.id, teamAccess });

   return useMutation({
     mutationFn: ({ id, updates }: { id: string; updates: Partial<Task> }) =>
       service.updateTask(id, updates),
     onSuccess: (data, variables) => {
       queryClient.invalidateQueries({ queryKey: ['task', variables.id] });
       if (data.data?.goal_id) {
         queryClient.invalidateQueries({
           queryKey: ['goal-tasks', data.data.goal_id]
         });
       }
     }
   });
 }

 export function useDeleteTask() {
   const queryClient = useQueryClient();
   const { user, teamAccess } = useAuth();
   if (!user) throw new Error('User not found');
   const service = new TaskService({ userId: user.id, teamAccess });

   return useMutation({
     mutationFn: (taskId: string) => service.deleteTask(taskId),
     onSuccess: (_, taskId) => {
       queryClient.invalidateQueries({ queryKey: ['task', taskId] });
       // We'll need to invalidate the parent goal's tasks
       queryClient.invalidateQueries({
         predicate: (query) => query.queryKey[0] === 'goal-tasks'
       });
     }
   });
 }

 // Specialized hooks for common operations
 export function useUpdateTaskStatus() {
   const { mutate, isLoading, error } = useUpdateTask();

   return {
     updateStatus: (taskId: string, status: Task['status']) =>
       mutate({ id: taskId, updates: { status } }),
     isLoading,
     error
   };
 }

 export function useUpdateTaskAssignees() {
   const { mutate, isLoading, error } = useUpdateTask();

   return {
     updateAssignees: (taskId: string, assignees: string[]) =>
       mutate({ id: taskId, updates: { assignees } }),
     isLoading,
     error
   };
 }

 export function useTaskPrediction(taskId: string) {
   const { user, teamAccess } = useAuth();
   if (!user) throw new Error('User not found');
   const service = new TaskService({ userId: user.id, teamAccess });

   return useQuery({
     queryKey: ['task-prediction', taskId],
     queryFn: () => service.predictCompletion(taskId),
     enabled: !!taskId
   });
 }