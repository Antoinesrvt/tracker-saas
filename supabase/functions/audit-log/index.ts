 import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';
 import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';
 import { createServerSupabase } from '../shared/supabase.ts';
 import { createApiResponse, ApiError } from '../shared/api-handler.ts';

 const requestSchema = z.object({
   action: z.enum(['log', 'query', 'export']),
   workspace_id: z.string().uuid(),
   event_data: z
     .object({
       actor_id: z.string().uuid(),
       action_type: z.string(),
       resource_type: z.string(),
       resource_id: z.string(),
       changes: z.record(z.any()).optional(),
       metadata: z.record(z.any()).optional()
     })
     .optional(),
   query_params: z
     .object({
       start_date: z.string().datetime(),
       end_date: z.string().datetime(),
       actor_id: z.string().uuid().optional(),
       resource_type: z.string().optional(),
       action_type: z.string().optional(),
       page: z.number().min(1).default(1),
       per_page: z.number().min(1).max(100).default(50)
     })
     .optional(),
   export_format: z.enum(['csv', 'json']).optional()
 });

 serve((req: Request) => {
   return createApiResponse(async () => {
     const supabase = createServerSupabase();
     const body = await req.json();
     const validatedBody = requestSchema.parse(body);

     // Check access permissions
     const { data: hasAccess } = await supabase.rpc('has_team_access', {
       target_type: 'workspace',
       target_id: validatedBody.workspace_id,
       required_roles: ['owner', 'admin']
     });

     if (!hasAccess) throw new ApiError('Insufficient permissions', 403);

     switch (validatedBody.action) {
       case 'log':
         return await logAuditEvent(supabase, validatedBody);
       case 'query':
         return await queryAuditLogs(supabase, validatedBody);
       case 'export':
         return await exportAuditLogs(supabase, validatedBody);
       default:
         throw new ApiError('Invalid action');
     }
   });
 });

 async function logAuditEvent(supabase: any, data: any) {
   const { workspace_id, event_data } = data;

   const { error } = await supabase.from('audit_logs').insert([
     {
       workspace_id,
       actor_id: event_data.actor_id,
       action_type: event_data.action_type,
       resource_type: event_data.resource_type,
       resource_id: event_data.resource_id,
       changes: event_data.changes || {},
       metadata: event_data.metadata || {}
     }
   ]);

   if (error) throw error;
   return { success: true };
 }

 async function queryAuditLogs(supabase: any, data: any) {
   const { workspace_id, query_params } = data;
   const {
     start_date,
     end_date,
     actor_id,
     resource_type,
     action_type,
     page,
     per_page
   } = query_params;

   let query = supabase
     .from('audit_logs')
     .select('*', { count: 'exact' })
     .eq('workspace_id', workspace_id)
     .gte('created_at', start_date)
     .lte('created_at', end_date)
     .order('created_at', { ascending: false })
     .range((page - 1) * per_page, page * per_page - 1);

   if (actor_id) query = query.eq('actor_id', actor_id);
   if (resource_type) query = query.eq('resource_type', resource_type);
   if (action_type) query = query.eq('action_type', action_type);

   const { data: logs, error, count } = await query;

   if (error) throw error;
   return {
     logs,
     pagination: {
       total: count,
       page,
       per_page
     }
   };
 }

 async function exportAuditLogs(supabase: any, data: any) {
   const { workspace_id, query_params, export_format } = data;

   // Get all logs matching criteria
   const { data: logs, error } = await supabase
     .from('audit_logs')
     .select('*')
     .eq('workspace_id', workspace_id)
     .gte('created_at', query_params.start_date)
     .lte('created_at', query_params.end_date)
     .order('created_at', { ascending: true });

   if (error) throw error;

   // Format logs based on export format
   const formattedData =
     export_format === 'csv'
       ? formatLogsAsCsv(logs)
       : JSON.stringify(logs, null, 2);

   // Store export file
   const fileName = `audit_logs_${workspace_id}_${new Date().toISOString()}.${export_format}`;
   const { data: file, error: uploadError } = await supabase.storage
     .from('exports')
     .upload(fileName, formattedData);

   if (uploadError) throw uploadError;

   return {
     download_url: file.path,
     generated_at: new Date().toISOString()
   };
 }

 function formatLogsAsCsv(logs: any[]): string {
   // Implement CSV formatting logic
   const headers = ['timestamp', 'actor', 'action', 'resource', 'changes'];
   const rows = logs.map((log) => [
     log.created_at,
     log.actor_id,
     log.action_type,
     `${log.resource_type}:${log.resource_id}`,
     JSON.stringify(log.changes)
   ]);

   return [headers, ...rows].map((row) => row.join(',')).join('\n');
 }