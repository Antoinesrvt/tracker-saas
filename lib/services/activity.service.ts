 import { BaseService } from './base.service';
 import { createClient } from '@/lib/supabase/client';
 import type { ServiceResponse } from '@/types/service.types';
 import type { ActivityEvent, ActivityAggregation } from '@/supabase/functions/shared/types/activity';

 export class ActivityService extends BaseService {
   async trackActivity(
     workspaceId: string,
     eventType: string,
     eventData?: Record<string, any>
   ): Promise<ServiceResponse<boolean>> {
     try {
       await this.checkAccess('workspace', workspaceId);

       const supabase = createClient();
       const { error } = await supabase.functions.invoke('activity', {
         body: {
           action: 'track',
           workspace_id: workspaceId,
           event_type: eventType,
           user_id: this.context.userId,
           event_data: eventData
         }
       });

       if (error) throw error;
       return { data: true, error: null };
     } catch (error) {
       return { data: false, error: error as Error };
     }
   }

   async getActivity(
     workspaceId: string,
     options: {
       eventType?: string;
       userId?: string;
       startDate?: string;
       endDate?: string;
       page?: number;
       perPage?: number;
     } = {}
   ): Promise<ServiceResponse<{ events: ActivityEvent[]; pagination: any }>> {
     try {
       await this.checkAccess('workspace', workspaceId);

       const supabase = createClient();
       const { data, error } = await supabase.functions.invoke('activity', {
         body: {
           action: 'get',
           workspace_id: workspaceId,
           event_type: options.eventType,
           user_id: options.userId,
           start_date: options.startDate,
           end_date: options.endDate,
           page: options.page || 1,
           per_page: options.perPage || 20
         }
       });

       if (error) throw error;
       return { data, error: null };
     } catch (error) {
       return { data: null, error: error as Error };
     }
   }

   async getActivityAggregation(
     workspaceId: string,
     startDate: string,
     endDate: string
   ): Promise<ServiceResponse<ActivityAggregation>> {
     try {
       await this.checkAccess('workspace', workspaceId);

       const supabase = createClient();
       const { data, error } = await supabase.functions.invoke('activity', {
         body: {
           action: 'aggregate',
           workspace_id: workspaceId,
           start_date: startDate,
           end_date: endDate
         }
       });

       if (error) throw error;
       return { data: data.aggregation, error: null };
     } catch (error) {
       return { data: null, error: error as Error };
     }
   }
 }