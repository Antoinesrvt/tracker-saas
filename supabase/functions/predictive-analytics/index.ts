import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts'
import { createServerSupabase } from '../shared/supabase.ts'
import { createApiResponse, ApiError } from '../shared/api-handler.ts'
import type { Database } from '@/types/database.types'
import type { TaskPrediction, ResourceForecast } from '../shared/types/predictive.ts'

type Tables = Database['public']['Tables']
type Tasks = Tables['tasks']['Row']

const requestSchema = z.object({
  workspace_id: z.string().uuid(),
  analysis_type: z.enum([
    'task_completion',
    'resource_forecast',
    'risk_analysis',
    'trend_prediction'
  ]),
  target_id: z.string().uuid().optional(),
  time_horizon: z.number().min(1).max(365).default(30),
  include_historical: z.boolean().default(true)
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
      case 'task_completion':
        if (!validatedBody.target_id) {
          throw new ApiError('Task ID is required for completion prediction')
        }
        return await predictTaskCompletion(supabase, validatedBody.target_id)

      case 'resource_forecast':
        return await forecastResources(
          supabase,
          validatedBody.workspace_id,
          validatedBody.time_horizon
        )

      case 'risk_analysis':
        return await analyzeRisks(
          supabase,
          validatedBody.workspace_id,
          validatedBody.time_horizon
        )

      case 'trend_prediction':
        return await predictTrends(
          supabase,
          validatedBody.workspace_id,
          validatedBody.time_horizon,
          validatedBody.include_historical
        )

      default:
        throw new ApiError('Invalid analysis type')
    }
  })
})

async function predictTaskCompletion(
  supabase: any,
  taskId: string
): Promise<TaskPrediction> {
  const { data, error } = await supabase.rpc('predict_task_completion_time', {
    p_task_id: taskId
  })

  if (error) throw error

  // Transform raw prediction data into structured response
  return {
    estimated_completion: new Date(
      Date.now() + data.estimated_days * 86400000
    ).toISOString(),
    confidence_level: data.confidence_level,
    factors: {
      historical_completion_time: data.factors.historical_avg,
      team_velocity: data.factors.team_velocity,
      complexity_score: data.factors.complexity_factor,
      dependency_impact: data.factors.dependency_impact,
      resource_availability: data.factors.resource_availability
    },
    risks: calculateTaskRisks(data)
  }
}

async function forecastResources(
  supabase: any,
  workspaceId: string,
  timeHorizon: number
): Promise<ResourceForecast> {
  const { data, error } = await supabase.rpc('forecast_resource_utilization', {
    p_workspace_id: workspaceId,
    p_time_horizon: timeHorizon
  })

  if (error) throw error

  return {
    period: `${timeHorizon} days`,
    utilization: data.utilization,
    bottlenecks: data.bottlenecks.map((b: any) => ({
      resource_type: b.type,
      impact_level: b.impact,
      affected_tasks: b.tasks
    })),
    recommendations: data.recommendations.map((r: any) => ({
      action: r.action,
      impact: r.impact_level,
      details: r.description
    }))
  }
}

// Helper functions
function calculateTaskRisks(predictionData: any) {
  const risks = []

  if (predictionData.factors.dependency_impact > 0.5) {
    risks.push({
      type: 'dependency',
      level: 'high',
      description: 'Complex dependency chain detected'
    })
  }

  if (predictionData.factors.team_velocity < 70) {
    risks.push({
      type: 'resource',
      level: 'medium',
      description: 'Team velocity below optimal level'
    })
  }

  return risks
}

// Implementation of other analysis functions



