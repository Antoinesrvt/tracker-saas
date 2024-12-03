import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';
import { createServerSupabase } from '../shared/supabase.ts';
import { createApiResponse, ApiError } from '../shared/api-handler.ts';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod';
import type {
  TimelineAnalysis,
  ResourceAnalysis,
  WorkspaceHealth,
  TimelineParams,
  ResourceParams,
  WorkspaceParams
} from '../shared/types/analytics';

// Define input parameter types for RPCs


const requestSchema = z.object({
  workspace_id: z.string().uuid(),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
  analysis_type: z.enum(['timeline', 'resources', 'performance', 'risks'])
});

serve(async (req: Request) => {
  return createApiResponse(async () => {
    const supabase = createServerSupabase();
    const body = await req.json();

    const { workspace_id, analysis_type, start_date, end_date } =
      requestSchema.parse(body);

    switch (analysis_type) {
      case 'timeline': {
        const { data, error } = await supabase.rpc<
          TimelineAnalysis,
          TimelineParams
        >('analyze_project_timeline', {
          p_workspace_id: workspace_id,
          p_start_date: start_date,
          p_end_date: end_date
        });
        if (error) throw new ApiError(error.message);
        return data;
      }

      case 'resources': {
        const { data, error } = await supabase.rpc<
          ResourceAnalysis,
          ResourceParams
        >('analyze_resource_utilization', {
          p_workspace_id: workspace_id,
          p_start_date: start_date
        });
        if (error) throw new ApiError(error.message);
        return data;
      }

      case 'performance': {
        const { data, error } = await supabase.rpc<
          WorkspaceHealth,
          WorkspaceParams
        >('calculate_workspace_health', { p_workspace_id: workspace_id });
        if (error) throw new ApiError(error.message);
        return data;
      }

      case 'risks': {
        // Combine multiple risk analyses
        const [timelineResult, resourceResult] = await Promise.all([
          supabase.rpc<TimelineAnalysis, WorkspaceParams>(
            'analyze_project_timeline',
            { p_workspace_id: workspace_id }
          ),
          supabase.rpc<ResourceAnalysis, WorkspaceParams>(
            'analyze_resource_utilization',
            { p_workspace_id: workspace_id }
          )
        ]);

        if (timelineResult.error)
          throw new ApiError(timelineResult.error.message);
        if (resourceResult.error)
          throw new ApiError(resourceResult.error.message);

        return {
          timeline_risks: timelineResult.data.risk_factors,
          resource_risks: resourceResult.data.optimization_suggestions,
          overall_risk_level: calculateOverallRisk(
            timelineResult.data,
            resourceResult.data
          )
        };
      }

      default:
        throw new ApiError('Invalid analysis type');
    }
  });
});

function calculateOverallRisk(
  timelineAnalysis: TimelineAnalysis,
  resourceAnalysis: ResourceAnalysis
): 'low' | 'medium' | 'high' {
  // Implement proper risk calculation logic
  const riskScores = {
    timeline: getRiskScore(timelineAnalysis.risk_factors.timeline_risk),
    resource: getRiskScore(timelineAnalysis.risk_factors.resource_risk),
    complexity: getRiskScore(timelineAnalysis.risk_factors.complexity_risk)
  };

  const avgScore =
    (riskScores.timeline + riskScores.resource + riskScores.complexity) / 3;

  return avgScore > 2 ? 'high' : avgScore > 1 ? 'medium' : 'low';
}

function getRiskScore(risk: 'high' | 'medium' | 'low'): number {
  switch (risk) {
    case 'high':
      return 3;
    case 'medium':
      return 2;
    case 'low':
      return 1;
  }
}
