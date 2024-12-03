 import { BaseService } from './base.service';
 import { createClient } from '@/lib/supabase/client';
 import type { ServiceResponse } from '@/types/service.types';

 export interface Report {
   id: string;
   workspace_id: string;
   type: 'performance' | 'resources' | 'timeline' | 'risks' | 'custom';
   format: 'pdf' | 'excel' | 'json';
   url: string;
   metadata: {
     sections: string[];
     filters?: Record<string, any>;
     date_range: {
       start: string;
       end: string;
     };
   };
   created_at: string;
   created_by: string;
   status: 'pending' | 'processing' | 'completed' | 'failed';
   error_message?: string;
 }

 export class ReportService extends BaseService {
   async generateReport(
     workspaceId: string,
     config: {
       type: Report['type'];
       format: Report['format'];
       sections: string[];
       filters?: Record<string, any>;
       date_range: { start: string; end: string };
     }
   ): Promise<ServiceResponse<Report>> {
     try {
       await this.checkAccess('workspace', workspaceId, [
         'owner',
         'admin',
         'member'
       ]);

       const supabase = createClient();
       const { data, error } = await supabase.functions.invoke(
         'generate-report',
         {
           body: {
             workspace_id: workspaceId,
             report_type: config.type,
             format: config.format,
             sections: config.sections,
             filters: config.filters,
             date_range: config.date_range
           }
         }
       );

       if (error) throw error;
       return { data, error: null };
     } catch (error) {
       return { data: null, error: error as Error };
     }
   }

   async getWorkspaceReports(
     workspaceId: string
   ): Promise<ServiceResponse<Report[]>> {
     try {
       await this.checkAccess('workspace', workspaceId);

       const supabase = createClient();
       const { data, error } = await supabase
         .from('reports')
         .select('*')
         .eq('workspace_id', workspaceId)
         .order('created_at', { ascending: false });

       if (error) throw error;
       return { data, error: null };
     } catch (error) {
       return { data: null, error: error as Error };
     }
   }

   async getReport(id: string): Promise<ServiceResponse<Report>> {
     try {
       const supabase = createClient();
       const { data: report, error: getError } = await supabase
         .from('reports')
         .select('*')
         .eq('id', id)
         .single();

       if (getError) throw getError;
       await this.checkAccess('workspace', report.workspace_id);

       return { data: report, error: null };
     } catch (error) {
       return { data: null, error: error as Error };
     }
   }

   async deleteReport(id: string): Promise<ServiceResponse<boolean>> {
     try {
       const supabase = createClient();

       // Get report to check access
       const { data: report, error: getError } = await supabase
         .from('reports')
         .select('workspace_id')
         .eq('id', id)
         .single();

       if (getError) throw getError;
       await this.checkAccess('workspace', report.workspace_id, [
         'owner',
         'admin'
       ]);

       // Delete report file from storage
       const { error: storageError } = await supabase.storage
         .from('reports')
         .remove([report.url]);

       if (storageError) throw storageError;

       // Delete report record
       const { error: deleteError } = await supabase
         .from('reports')
         .delete()
         .eq('id', id);

       if (deleteError) throw deleteError;
       return { data: true, error: null };
     } catch (error) {
       return { data: false, error: error as Error };
     }
   }
 }