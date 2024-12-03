 import { BaseService } from './base.service';
 import { createClient } from '@/lib/supabase/client';
 import type { Organization, ServiceResponse } from '@/types/service.types';

 export class OrganizationService extends BaseService {
   async getOrganization(id: string): Promise<ServiceResponse<Organization>> {
     try {
       await this.checkAccess('organization', id);

       const supabase = createClient();
       const { data, error } = await supabase
         .from('organizations')
         .select(
           `
          *,
          workspaces (
            id,
            name,
            description,
            settings
          ),
          team_assignments (
            user_id,
            role
          )
        `
         )
         .eq('id', id)
         .single();

       if (error) throw error;
       return { data, error: null };
     } catch (error) {
       return { data: null, error: error as Error };
     }
   }

   async updateOrganizationSettings(
     id: string,
     settings: {
       branding?: Record<string, any>;
       workspace_defaults?: Record<string, any>;
       subscription?: Record<string, any>;
     }
   ): Promise<ServiceResponse<Organization>> {
     try {
       await this.checkAccess('organization', id, ['owner', 'admin']);

       const supabase = createClient();
       const { data, error } = await supabase
         .from('organizations')
         .update({
           branding_settings: settings.branding,
           default_workspace_settings: settings.workspace_defaults,
           settings: settings.subscription
         })
         .eq('id', id)
         .select()
         .single();

       if (error) throw error;
       return { data, error: null };
     } catch (error) {
       return { data: null, error: error as Error };
     }
   }

   // Add more methods for subscription management, team management, etc.
 }