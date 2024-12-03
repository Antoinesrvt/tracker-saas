 import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';
 import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';
 import { createServerSupabase } from '../shared/supabase.ts';
 import { createApiResponse, ApiError } from '../shared/api-handler.ts';

 const requestSchema = z.object({
   workspace_id: z.string().uuid(),
   report_type: z.enum([
     'performance',
     'resources',
     'timeline',
     'risks',
     'custom'
   ]),
   format: z.enum(['pdf', 'excel', 'json']),
   date_range: z.object({
     start: z.string().datetime(),
     end: z.string().datetime()
   }),
   sections: z.array(z.string()),
   filters: z.record(z.any()).optional(),
   custom_metrics: z.array(z.string()).optional()
 });

 serve((req: Request) => {
   return createApiResponse(async () => {
     const supabase = createServerSupabase();
     const body = await req.json();
     const validatedBody = requestSchema.parse(body);

     // Check access
     const { data: hasAccess } = await supabase.rpc('has_team_access', {
       target_type: 'workspace',
       target_id: validatedBody.workspace_id,
       required_roles: ['owner', 'admin', 'member']
     });

     if (!hasAccess) throw new ApiError('Insufficient permissions', 403);

     // Gather report data
     const reportData = await gatherReportData(supabase, validatedBody);

     // Generate report in requested format
     const report = await generateReport(reportData, validatedBody.format);

     // Store report
     const { data: storedReport, error: storageError } = await supabase.storage
       .from('reports')
       .upload(
         `${validatedBody.workspace_id}/${new Date().toISOString()}.${validatedBody.format}`,
         report
       );

     if (storageError) throw storageError;

     // Create report record
     const { error: recordError } = await supabase.from('reports').insert([
       {
         workspace_id: validatedBody.workspace_id,
         type: validatedBody.report_type,
         format: validatedBody.format,
         url: storedReport.path,
         metadata: {
           sections: validatedBody.sections,
           filters: validatedBody.filters,
           date_range: validatedBody.date_range
         }
       }
     ]);

     if (recordError) throw recordError;

     return {
       url: storedReport.path,
       generated_at: new Date().toISOString()
     };
   });
 });

 async function gatherReportData(supabase: any, params: any) {
   const [goals, tasks, milestones, metrics, resources, activities] =
     await Promise.all([
       getGoalsData(supabase, params),
       getTasksData(supabase, params),
       getMilestonesData(supabase, params),
       getMetricsData(supabase, params),
       getResourcesData(supabase, params),
       getActivityData(supabase, params)
     ]);

   return {
     goals,
     tasks,
     milestones,
     metrics,
     resources,
     activities,
     summary: generateSummary({
       goals,
       tasks,
       milestones,
       metrics,
       resources,
       activities
     })
   };
 }

 async function generateReport(data: any, format: string): Promise<Uint8Array> {
   switch (format) {
     case 'pdf':
       return generatePDFReport(data);
     case 'excel':
       return generateExcelReport(data);
     case 'json':
       return new TextEncoder().encode(JSON.stringify(data));
     default:
       throw new ApiError('Unsupported format');
   }
 }

 // Helper functions for gathering specific data types
 async function getGoalsData(supabase: any, params: any) {
   const { data, error } = await supabase
     .from('goals')
     .select('*, tasks(count), milestones(count)')
     .eq('workspace_id', params.workspace_id)
     .gte('created_at', params.date_range.start)
     .lte('created_at', params.date_range.end);

   if (error) throw error;
   return data;
 }

 // ... Similar functions for other data types

 // Report generation helpers
 async function generatePDFReport(data: any): Promise<Uint8Array> {
   // Implement PDF generation logic
   throw new Error('PDF generation not implemented');
 }

 async function generateExcelReport(data: any): Promise<Uint8Array> {
   // Implement Excel generation logic
   throw new Error('Excel generation not implemented');
 }

 function generateSummary(data: any) {
   return {
     total_goals: data.goals.length,
     completed_tasks: data.tasks.filter((t: any) => t.status === 'completed')
       .length,
     active_milestones: data.milestones.filter(
       (m: any) => m.status === 'active'
     ).length,
     resource_utilization: calculateResourceUtilization(data.resources),
     key_metrics: summarizeMetrics(data.metrics)
   };
 }