 import { BaseService } from './base.service';
 import { createClient } from '@/lib/supabase/client';
 import type { Workspace, ServiceResponse } from '@/types/service.types';

 export class WorkspaceService extends BaseService {
   async getWorkspace(id: string): Promise<ServiceResponse<Workspace>> {
     try {
       await this.checkAccess('workspace', id);

       const supabase = createClient();
       const { data, error } = await supabase
         .from('workspaces')
         .select('*')
         .eq('id', id)
         .single();

       if (error) throw error;
       return { data, error: null };
     } catch (error) {
       return { data: null, error: error as Error };
     }
   }

   async getWorkspaces(
     organizationId: string
   ): Promise<ServiceResponse<Workspace[]>> {
     try {
       await this.checkAccess('organization', organizationId);

       const supabase = createClient();
       const { data, error } = await supabase
         .from('workspaces')
         .select('*')
         .eq('organization_id', organizationId)
         .order('created_at', { ascending: false });

       if (error) throw error;
       return { data, error: null };
     } catch (error) {
       return { data: null, error: error as Error };
     }
   }

   async createWorkspace(
     workspace: Partial<Workspace>
   ): Promise<ServiceResponse<Workspace>> {
     try {
       await this.checkAccess('organization', workspace.organization_id!, [
         'owner',
         'admin'
       ]);

       const supabase = createClient();
       const { data, error } = await supabase
         .from('workspaces')
         .insert([workspace])
         .select()
         .single();

       if (error) throw error;
       return { data, error: null };
     } catch (error) {
       return { data: null, error: error as Error };
     }
   }
 }