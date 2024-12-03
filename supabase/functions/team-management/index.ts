 import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';
 import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';
 import { createServerSupabase } from '../shared/supabase.ts';
 import { createApiResponse, ApiError } from '../shared/api-handler.ts';

 const requestSchema = z.object({
   action: z.enum(['assign', 'remove', 'update_role', 'bulk_assign']),
   resource_type: z.enum([
     'organization',
     'workspace',
     'goal',
     'task',
     'milestone'
   ]),
   resource_id: z.string().uuid(),
   user_ids: z.array(z.string().uuid()),
   role: z.enum(['owner', 'admin', 'member', 'viewer']).optional(),
   valid_period: z
     .object({
       start: z.string().datetime(),
       end: z.string().datetime().optional()
     })
     .optional()
 });

 serve((req: Request) => {
   return createApiResponse(async () => {
     const supabase = createServerSupabase();
     const body = await req.json();
     const {
       action,
       resource_type,
       resource_id,
       user_ids,
       role,
       valid_period
     } = requestSchema.parse(body);

     // First check if requester has permission
     const { data: hasAccess } = await supabase.rpc('has_team_access', {
       target_type: resource_type,
       target_id: resource_id,
       required_roles: ['owner', 'admin']
     });

     if (!hasAccess) {
       throw new ApiError('Insufficient permissions', 403);
     }

     switch (action) {
       case 'assign':
         return handleAssign(supabase, {
           resource_type,
           resource_id,
           user_ids,
           role: role || 'member',
           valid_period
         });

       case 'remove':
         return handleRemove(supabase, {
           resource_type,
           resource_id,
           user_ids
         });

       case 'update_role':
         if (!role) throw new ApiError('Role is required for role update');
         return handleRoleUpdate(supabase, {
           resource_type,
           resource_id,
           user_ids,
           role
         });

       case 'bulk_assign':
         return handleBulkAssign(supabase, {
           resource_type,
           resource_id,
           user_ids,
           role: role || 'member',
           valid_period
         });

       default:
         throw new ApiError('Invalid action');
     }
   });
 });

 async function handleAssign(supabase: any, params: any) {
   const { error } = await supabase.from('team_assignments').insert(
     params.user_ids.map((userId) => ({
       user_id: userId,
       assignable_type: params.resource_type,
       assignable_id: params.resource_id,
       role: params.role,
       valid_period: params.valid_period
         ? `[${params.valid_period.start},${params.valid_period.end || 'infinity'})`
         : null
     }))
   );

   if (error) throw error;
   return { success: true };
 }

 async function handleRemove(supabase: any, params: any) {
   const { error } = await supabase
     .from('team_assignments')
     .delete()
     .eq('assignable_type', params.resource_type)
     .eq('assignable_id', params.resource_id)
     .in('user_id', params.user_ids)
     .neq('role', 'owner'); // Prevent removing owners

   if (error) throw error;
   return { success: true };
 }

 async function handleRoleUpdate(supabase: any, params: any) {
   const { error } = await supabase
     .from('team_assignments')
     .update({ role: params.role })
     .eq('assignable_type', params.resource_type)
     .eq('assignable_id', params.resource_id)
     .in('user_id', params.user_ids)
     .neq('role', 'owner'); // Prevent modifying owner role

   if (error) throw error;
   return { success: true };
 }

 async function handleBulkAssign(supabase: any, params: any) {
   // Start a transaction
   const { error } = await supabase.rpc('bulk_team_assignment', {
     p_assignments: params.user_ids.map((userId) => ({
       user_id: userId,
       assignable_type: params.resource_type,
       assignable_id: params.resource_id,
       role: params.role,
       valid_period: params.valid_period
     }))
   });

   if (error) throw error;
   return { success: true };
 }