export interface TimelineParams {
  p_workspace_id: string;
  p_start_date?: string;
  p_end_date?: string;
}

export interface ResourceParams {
  p_workspace_id: string;
  p_start_date?: string;
}

export interface WorkspaceParams {
  p_workspace_id: string;
}

// Define return types for RPCs
export interface TimelineAnalysis {
  timeline_metrics: {
    total_goals: number;
    delayed_goals: number;
    at_risk_goals: number;
    resource_utilization: number;
    critical_path_length: number;
  };
  risk_factors: {
    timeline_risk: 'high' | 'medium' | 'low';
    resource_risk: 'high' | 'medium' | 'low';
    complexity_risk: 'high' | 'medium' | 'low';
  };
}

export interface ResourceAnalysis {
  resource_metrics: {
    utilization: number;
    allocation: number;
    efficiency: number;
  };
  optimization_suggestions: Array<{
    type: string;
    suggestion: string;
    priority: 'high' | 'medium' | 'low';
  }>;
}

export interface WorkspaceHealth {
  health_score: number;
  metrics: {
    goals: { total: number; active: number; completion_rate: number };
    tasks: { blocked: number; overdue: number };
    activity: { weekly_actions: number };
  };
}
