 import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';
 import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';
 import { createServerSupabase } from '../shared/supabase';
 import { createApiResponse, ApiError } from '../shared/api-handler';

 const notificationSchema = z.object({
   action: z.enum(['create', 'mark_read', 'mark_all_read', 'delete']),
   notification_id: z.string().uuid().optional(),
   user_id: z.string().uuid(),
   data: z
     .object({
       type: z.string(),
       title: z.string(),
       content: z.string().optional(),
       resource_type: z.string(),
       resource_id: z.string().uuid()
     })
     .optional()
 });

 serve((req: Request) => {
   return createApiResponse(async () => {
     const supabase = createServerSupabase();
     const body = await req.json();
     const { action, notification_id, user_id, data } =
       notificationSchema.parse(body);

     switch (action) {
       case 'create': {
         if (!data) throw new ApiError('Notification data is required');

         const { error } = await supabase.from('notifications').insert([
           {
             user_id,
             type: data.type,
             title: data.title,
             content: data.content,
             resource_type: data.resource_type,
             resource_id: data.resource_id
           }
         ]);

         if (error) throw new ApiError(error.message);
         return { success: true };
       }

       case 'mark_read': {
         if (!notification_id)
           throw new ApiError('Notification ID is required');

         const { error } = await supabase
           .from('notifications')
           .update({ is_read: true })
           .eq('id', notification_id)
           .eq('user_id', user_id);

         if (error) throw new ApiError(error.message);
         return { success: true };
       }

       case 'mark_all_read': {
         const { error } = await supabase
           .from('notifications')
           .update({ is_read: true })
           .eq('user_id', user_id)
           .eq('is_read', false);

         if (error) throw new ApiError(error.message);
         return { success: true };
       }

       case 'delete': {
         if (!notification_id)
           throw new ApiError('Notification ID is required');

         const { error } = await supabase
           .from('notifications')
           .delete()
           .eq('id', notification_id)
           .eq('user_id', user_id);

         if (error) throw new ApiError(error.message);
         return { success: true };
       }

       default:
         throw new ApiError('Invalid action');
     }
   });
 });