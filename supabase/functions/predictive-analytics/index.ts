 import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts'
import { createServerSupabase } from '../shared/supabase.ts'
import { createApiResponse, ApiError } from '../shared/api-handler.ts'

const requestSchema = z.object({
  workspace_id: z.string().uuid(),
  analysis_type: z.enum([
    'completion_prediction',
    'resource_forecast',
    'risk_prediction',
    'trend_analysis'
  ]),
  target_id: z.string().uuid().optional(),
  time_horizon: z.number().min(1).max(365).default(30)
})

serve((req: Request) => {
  return createApiResponse(async () => {
    const supabase = createServerSupabase()
    const body = await req.json()
    const validatedBody = requestSchema.parse(body)

    // Check access
    const { data: hasAccess } = await supabase.rpc('has_team_access', {
      target_type: 'workspace',
      target_id: validatedBody.workspace_id,
      required_roles: ['owner', 'admin', 'member']
    })

    if (!hasAccess) throw new ApiError('Insufficient permissions', 403)

    switch (validatedBody.analysis_type) {
      case 'completion_prediction':
        return await predictCompletionDates(supabase, validatedBody)
      
      case 'resource_forecast':
        return await forecastResourceNeeds(supabase, validatedBody)
      
      case 'risk_prediction':
        return await predictRisks(supabase, validatedBody)
      
      case 'trend_analysis':
        return await analyzeTrends(supabase, validatedBody)
      
      default:
        throw new ApiError('Invalid analysis type')
    }
  })
})

async function predictCompletionDates(supabase: any, params: any) {
  const { data: tasks } = await supabase
    .from('tasks')
    .select('*')
    .eq('workspace_id', params.workspace_id)
    .in('status', ['todo', 'in_progress'])

  const predictions = await Promise.all(
    tasks.map(async (task: any) => {
      const { data } = await supabase.rpc('predict_task_completion_time', {
        p_task_id: task.id
      })
      return {
        task_id: task.id,
        predicted_completion: data.estimated_completion_date,
        confidence: data.confidence_level
      }
    })
  )

  return {
    predictions,
    metadata: {
      model_version: '1.0',
      generated_at: new Date().toISOString()
    }
  }
}

// ... Implementation of other prediction functions