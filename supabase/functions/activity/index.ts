import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';
import { createServerSupabase } from '../shared/supabase.ts';
import { createApiResponse, ApiError } from '../shared/api-handler.ts';
import type {
  ActivityEvent,
  ActivityResponse
} from '../shared/types/activity.ts';

const requestSchema = z.object({
  action: z.enum(['track', 'get', 'aggregate']),
  workspace_id: z.string().uuid(),
  event_type: z
    .enum([
      'goal_created',
      'goal_updated',
      'task_completed',
      'milestone_reached',
      'comment_added',
      'resource_uploaded'
    ])
    .optional(),
  user_id: z.string().uuid().optional(),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
  event_data: z.record(z.any()).optional(),
  page: z.number().min(1).default(1),
  per_page: z.number().min(1).max(100).default(20)
});

serve((req: Request) => {
  return createApiResponse(async () => {
    const supabase = createServerSupabase();
    const body = await req.json();
    const validatedBody = requestSchema.parse(body);

    // Check workspace access
    const { data: hasAccess } = await supabase.rpc('has_team_access', {
      target_type: 'workspace',
      target_id: validatedBody.workspace_id
    });

    if (!hasAccess) {
      throw new ApiError('Insufficient permissions', 403);
    }

    switch (validatedBody.action) {
      case 'track':
        return await trackActivity(supabase, {
          workspace_id: validatedBody.workspace_id,
          event_type: validatedBody.event_type!,
          user_id: validatedBody.user_id!,
          event_data: validatedBody.event_data
        });

      case 'get':
        return await getActivity(supabase, {
          workspace_id: validatedBody.workspace_id,
          event_type: validatedBody.event_type,
          user_id: validatedBody.user_id,
          start_date: validatedBody.start_date,
          end_date: validatedBody.end_date,
          page: validatedBody.page,
          per_page: validatedBody.per_page
        });

      case 'aggregate':
        return await aggregateActivity(supabase, {
          workspace_id: validatedBody.workspace_id,
          start_date: validatedBody.start_date!,
          end_date: validatedBody.end_date!
        });

      default:
        throw new ApiError('Invalid action');
    }
  });
});

async function trackActivity(supabase: any, params: any) {
  const { error } = await supabase.from('activity_events').insert([
    {
      workspace_id: params.workspace_id,
      user_id: params.user_id,
      event_type: params.event_type,
      metadata: params.event_data || {}
    }
  ]);

  if (error) throw new ApiError(error.message);
  return { success: true };
}

async function getActivity(supabase: any, params: any) {
  let query = supabase
    .from('activity_events')
    .select('*', { count: 'exact' })
    .eq('workspace_id', params.workspace_id)
    .order('created_at', { ascending: false })
    .range(
      (params.page - 1) * params.per_page,
      params.page * params.per_page - 1
    );

  if (params.event_type) {
    query = query.eq('event_type', params.event_type);
  }

  if (params.user_id) {
    query = query.eq('user_id', params.user_id);
  }

  if (params.start_date) {
    query = query.gte('created_at', params.start_date);
  }

  if (params.end_date) {
    query = query.lte('created_at', params.end_date);
  }

  const { data, error, count } = await query;

  if (error) throw new ApiError(error.message);

  return {
    events: data,
    pagination: {
      total: count,
      page: params.page,
      per_page: params.per_page
    }
  };
}

async function aggregateActivity(supabase: any, params: any) {
  const { data: aggregation, error } = await supabase.rpc(
    'aggregate_activity',
    {
      p_workspace_id: params.workspace_id,
      p_start_date: params.start_date,
      p_end_date: params.end_date
    }
  );

  if (error) throw new ApiError(error.message);

  return {
    aggregation,
    period_start: params.start_date,
    period_end: params.end_date
  };
}
