 import { BaseService } from './base.service';
 import { createClient } from '@/lib/supabase/client';
 import type { ServiceResponse } from '@/types/service.types';

 export interface Template {
   id: string;
   name: string;
   description?: string;
   type: 'goal' | 'task' | 'milestone' | 'workflow';
   content: Record<string, any>;
   variables: string[];
   organization_id: string;
   workspace_id?: string;
   category?: string;
   tags: string[];
   usage_count: number;
   is_public: boolean;
   created_by: string;
   created_at: string;
   updated_at: string;
   metadata: {
     preview?: string;
     thumbnail?: string;
     recommended_for?: string[];
     complexity?: 'simple' | 'medium' | 'complex';
     estimated_time?: number;
   };
 }

 export class TemplateService extends BaseService {
   async getTemplates(
     workspaceId: string
   ): Promise<ServiceResponse<Template[]>> {
     try {
       await this.checkAccess('workspace', workspaceId);

       const supabase = createClient();
       const { data, error } = await supabase
         .from('templates')
         .select('*')
         .or(`workspace_id.eq.${workspaceId},is_public.eq.true`)
         .order('usage_count', { ascending: false });

       if (error) throw error;
       return { data, error: null };
     } catch (error) {
       return { data: null, error: error as Error };
     }
   }

   async getTemplate(id: string): Promise<ServiceResponse<Template>> {
     try {
       const supabase = createClient();
       const { data: template, error: getError } = await supabase
         .from('templates')
         .select('*')
         .eq('id', id)
         .single();

       if (getError) throw getError;

       // Check access if template is not public
       if (!template.is_public) {
         await this.checkAccess('workspace', template.workspace_id!);
       }

       return { data: template, error: null };
     } catch (error) {
       return { data: null, error: error as Error };
     }
   }

   async createTemplate(
     template: Partial<Template>
   ): Promise<ServiceResponse<Template>> {
     try {
       if (template.workspace_id) {
         await this.checkAccess('workspace', template.workspace_id, [
           'owner',
           'admin'
         ]);
       }

       const supabase = createClient();
       const { data, error } = await supabase
         .from('templates')
         .insert([
           {
             ...template,
             created_by: this.context.userId,
             usage_count: 0
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

   async updateTemplate(
     id: string,
     updates: Partial<Template>
   ): Promise<ServiceResponse<Template>> {
     try {
       const supabase = createClient();

       // Get template to check access
       const { data: template, error: getError } = await supabase
         .from('templates')
         .select('workspace_id, created_by')
         .eq('id', id)
         .single();

       if (getError) throw getError;

       // Only template creator or workspace admins can update
       if (template.created_by !== this.context.userId) {
         await this.checkAccess('workspace', template.workspace_id!, [
           'owner',
           'admin'
         ]);
       }

       const { data, error } = await supabase
         .from('templates')
         .update(updates)
         .eq('id', id)
         .select()
         .single();

       if (error) throw error;
       return { data, error: null };
     } catch (error) {
       return { data: null, error: error as Error };
     }
   }

   async deleteTemplate(id: string): Promise<ServiceResponse<boolean>> {
     try {
       const supabase = createClient();

       // Get template to check access
       const { data: template, error: getError } = await supabase
         .from('templates')
         .select('workspace_id, created_by')
         .eq('id', id)
         .single();

       if (getError) throw getError;

       // Only template creator or workspace admins can delete
       if (template.created_by !== this.context.userId) {
         await this.checkAccess('workspace', template.workspace_id!, [
           'owner',
           'admin'
         ]);
       }

       const { error } = await supabase.from('templates').delete().eq('id', id);

       if (error) throw error;
       return { data: true, error: null };
     } catch (error) {
       return { data: false, error: error as Error };
     }
   }

   async applyTemplate(
     templateId: string,
     variables: Record<string, any>
   ): Promise<ServiceResponse<any>> {
     try {
       const supabase = createClient();
       const { data, error } = await supabase.functions.invoke(
         'apply-template',
         {
           body: {
             template_id: templateId,
             variables,
             user_id: this.context.userId
           }
         }
       );

       if (error) throw error;
       return { data, error: null };
     } catch (error) {
       return { data: null, error: error as Error };
     }
   }

   async incrementUsageCount(id: string): Promise<void> {
     try {
       const supabase = createClient();
       await supabase.rpc('increment_template_usage', { template_id: id });
     } catch (error) {
       console.error('Failed to increment template usage count:', error);
     }
   }
 }