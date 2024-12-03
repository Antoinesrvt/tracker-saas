import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';
import { createServerSupabase } from '../shared/supabase';
import { createApiResponse, ApiError } from '../shared/api-handler';
import type {
  WorkspaceMetricRequest,
  WorkspaceHealth,
  ProjectTimeline
} from '../shared/types/metrics.ts';

const requestSchema = z.object({
  workspace_id: z.string().uuid(),
  metric_type: z.enum(['workspace_health', 'project_timeline']),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional()
});

serve((req: Request) => {
  return createApiResponse(async () => {
    const supabase = createServerSupabase();
    const body = (await req.json()) as WorkspaceMetricRequest;
    const validatedBody = requestSchema.parse(body);

    switch (validatedBody.metric_type) {
      case 'workspace_health': {
        const { data, error } = await supabase.rpc<WorkspaceHealth>(
          'calculate_workspace_health',
          { p_workspace_id: validatedBody.workspace_id }
        );

        if (error) throw new ApiError(error.message);
        return data;
      }

      case 'project_timeline': {
        const { data, error } = await supabase.rpc<ProjectTimeline>(
          'analyze_project_timeline',
          {
            p_workspace_id: validatedBody.workspace_id,
            p_start_date: validatedBody.start_date,
            p_end_date: validatedBody.end_date
          }
        );

        if (error) throw new ApiError(error.message);
        return data;
      }

      default:
        throw new ApiError('Invalid metric type');
    }
  });
});
