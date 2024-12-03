 import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
 import { NotificationService } from '@/lib/services/notification.service';
 import { useAuth } from '@/lib/providers/auth-provider';
 import { useEffect } from 'react';
 import { createClient } from '@/lib/supabase/client';

 export function useNotifications() {
   const { user, teamAccess } = useAuth();
   if (!user) throw new Error('User not found');
   const service = new NotificationService({ userId: user.id, teamAccess });
   const queryClient = useQueryClient();

   // Set up real-time subscription
   useEffect(() => {
     const supabase = createClient();
     const subscription = supabase
       .channel('notifications')
       .on(
         'postgres_changes',
         {
           event: '*',
           schema: 'public',
           table: 'notifications',
           filter: `user_id=eq.${user.id}`
         },
         () => {
           queryClient.invalidateQueries({ queryKey: ['notifications'] });
         }
       )
       .subscribe();

     return () => {
       subscription.unsubscribe();
     };
   }, [user.id, queryClient]);

   return useQuery({
     queryKey: ['notifications'],
     queryFn: () => service.getNotifications()
   });
 }

 export function useMarkNotificationAsRead() {
   const queryClient = useQueryClient();
   const { user, teamAccess } = useAuth();
   if (!user) throw new Error('User not found');
   const service = new NotificationService({ userId: user.id, teamAccess });

   return useMutation({
     mutationFn: (notificationId: string) => service.markAsRead(notificationId),
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['notifications'] });
     }
   });
 }

 export function useMarkAllNotificationsAsRead() {
   const queryClient = useQueryClient();
   const { user, teamAccess } = useAuth();
   if (!user) throw new Error('User not found');
   const service = new NotificationService({ userId: user.id, teamAccess });

   return useMutation({
     mutationFn: () => service.markAllAsRead(),
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['notifications'] });
     }
   });
 }

 export function useDeleteNotification() {
   const queryClient = useQueryClient();
   const { user, teamAccess } = useAuth();
   if (!user) throw new Error('User not found');
   const service = new NotificationService({ userId: user.id, teamAccess });

   return useMutation({
     mutationFn: (notificationId: string) =>
       service.deleteNotification(notificationId),
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['notifications'] });
     }
   });
 }