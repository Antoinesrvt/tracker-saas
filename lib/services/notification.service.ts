 import { BaseService } from './base.service';
 import { createClient } from '@/lib/supabase/client';
 import type { ServiceResponse } from '@/types/service.types';

 export interface Notification {
   id: string;
   user_id: string;
   type: string;
   title: string;
   content?: string;
   resource_type: string;
   resource_id: string;
   is_read: boolean;
   created_at: string;
 }

 export class NotificationService extends BaseService {
   async getNotifications(): Promise<ServiceResponse<Notification[]>> {
     try {
       const supabase = createClient();
       const { data, error } = await supabase
         .from('notifications')
         .select('*')
         .eq('user_id', this.context.userId)
         .order('created_at', { ascending: false });

       if (error) throw error;
       return { data, error: null };
     } catch (error) {
       return { data: null, error: error as Error };
     }
   }

   async markAsRead(notificationId: string): Promise<ServiceResponse<boolean>> {
     try {
       const supabase = createClient();
       const { error } = await supabase.functions.invoke('notifications', {
         body: {
           action: 'mark_read',
           notification_id: notificationId,
           user_id: this.context.userId
         }
       });

       if (error) throw error;
       return { data: true, error: null };
     } catch (error) {
       return { data: false, error: error as Error };
     }
   }

   async markAllAsRead(): Promise<ServiceResponse<boolean>> {
     try {
       const supabase = createClient();
       const { error } = await supabase.functions.invoke('notifications', {
         body: {
           action: 'mark_all_read',
           user_id: this.context.userId
         }
       });

       if (error) throw error;
       return { data: true, error: null };
     } catch (error) {
       return { data: false, error: error as Error };
     }
   }

   async deleteNotification(
     notificationId: string
   ): Promise<ServiceResponse<boolean>> {
     try {
       const supabase = createClient();
       const { error } = await supabase.functions.invoke('notifications', {
         body: {
           action: 'delete',
           notification_id: notificationId,
           user_id: this.context.userId
         }
       });

       if (error) throw error;
       return { data: true, error: null };
     } catch (error) {
       return { data: false, error: error as Error };
     }
   }
 }