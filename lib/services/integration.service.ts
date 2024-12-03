 import { BaseService } from './base.service';
 import { createClient } from '@/lib/supabase/client';
 import type { ServiceResponse } from '@/types/service.types';

 export interface Integration {
   id: string;
   workspace_id: string;
   provider: 'github' | 'jira' | 'slack' | 'gitlab' | 'azure_devops';
   config: Record<string, any>;
   status: 'active' | 'inactive' | 'error';
   last_sync: string;
   webhook_url?: string;
   webhook_secret?: string;
   created_at: string;
   updated_at: string;
 }

 export class IntegrationService extends BaseService {
   async getIntegrations(
     workspaceId: string
   ): Promise<ServiceResponse<Integration[]>> {
     try {
       await this.checkAccess('workspace', workspaceId);

       const supabase = createClient();
       const { data, error } = await supabase
         .from('integrations')
         .select('*')
         .eq('workspace_id', workspaceId);

       if (error) throw error;
       return { data, error: null };
     } catch (error) {
       return { data: null, error: error as Error };
     }
   }

   async configureIntegration(
     workspaceId: string,
     integration: Partial<Integration>
   ): Promise<ServiceResponse<Integration>> {
     try {
       await this.checkAccess('workspace', workspaceId, ['owner', 'admin']);

       const supabase = createClient();
       const { data, error } = await supabase
         .from('integrations')
         .upsert([
           {
             ...integration,
             workspace_id: workspaceId,
             updated_at: new Date().toISOString()
           }
         ])
         .select()
         .single();

       if (error) throw error;
       return { data, error: null };
     } catch (error) {
       return { data: null, error: error as Error };
     }
   }

   async syncIntegration(id: string): Promise<ServiceResponse<any>> {
     try {
       const supabase = createClient();
       const { data, error } = await supabase.functions.invoke(
         'integration-webhooks',
         {
           body: {
             integration_id: id,
             action: 'sync'
           }
         }
       );

       if (error) throw error;
       return { data, error: null };
     } catch (error) {
       return { data: null, error: error as Error };
     }
   }

   async deleteIntegration(id: string): Promise<ServiceResponse<boolean>> {
     try {
       const supabase = createClient();

       // Get integration to check access
       const { data: integration, error: getError } = await supabase
         .from('integrations')
         .select('workspace_id')
         .eq('id', id)
         .single();

       if (getError) throw getError;
       await this.checkAccess('workspace', integration.workspace_id, [
         'owner',
         'admin'
       ]);

       const { error } = await supabase
         .from('integrations')
         .delete()
         .eq('id', id);

       if (error) throw error;
       return { data: true, error: null };
     } catch (error) {
       return { data: false, error: error as Error };
     }
   }
 }