import { serve } from 'https://deno.land/std@0.208.0/http/server';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod';
import { createServerSupabase } from '../shared/supabase';
import { createApiResponse, ApiError } from '../shared/api-handler';
import type {
  TaskAutomationRequest,
  TaskPrediction,
  DependencyAnalysis
} from '../shared/types/tasks.ts';

const requestSchema = z.object({
  task_id: z.string().uuid(),
  action_type: z.enum(['predict_completion', 'analyze_dependencies'])
});

serve((req: Request) => {
  return createApiResponse(async () => {
    const supabase = createServerSupabase();
    const body = (await req.json()) as TaskAutomationRequest;
    const validatedBody = requestSchema.parse(body);

    switch (validatedBody.action_type) {
      case 'predict_completion': {
        const { data, error } = await supabase.rpc<TaskPrediction>(
          'predict_task_completion_time',
          { p_task_id: validatedBody.task_id }
        );

        if (error) throw new ApiError(error.message);
        return data;
      }

      case 'analyze_dependencies': {
        const { data, error } = await supabase.rpc<DependencyAnalysis>(
          'analyze_dependency_chain',
          {
            p_entity_type: 'task',
            p_entity_id: validatedBody.task_id
          }
        );

        if (error) throw new ApiError(error.message);
        return data;
      }

      default:
        throw new ApiError('Invalid action type');
    }
  });
});
