 import { BaseService } from './base.service';
 import { createClient } from '@/lib/supabase/client';
 import type { ServiceResponse } from '@/types/service.types';

 export interface Label {
   id: string;
   name: string;
   color: string;
   workspace_id: string;
   description?: string;
   parent_id?: string;
   metadata?: Record<string, any>;
 }

 export class LabelService extends BaseService {
   async getWorkspaceLabels(
     workspaceId: string
   ): Promise<ServiceResponse<Label[]>> {
     try {
       await this.checkAccess('workspace', workspaceId);

       const supabase = createClient();
       const { data, error } = await supabase
         .from('labels')
         .select('*')
         .eq('workspace_id', workspaceId)
         .order('name');

       if (error) throw error;
       return { data, error: null };
     } catch (error) {
       return { data: null, error: error as Error };
     }
   }

   // Add methods for CRUD operations on labels
 }