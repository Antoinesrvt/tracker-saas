import { BaseService } from './base.service';
import { createClient } from '@/lib/supabase/client';
import type { ServiceResponse } from '@/types/service.types';

export interface AnalyticsParams {
  workspace_id: string;
  start_date?: string;
  end_date?: string;
  analysis_type: 'timeline' | 'resources' | 'performance' | 'risks';
}

export interface TimelineMetrics {
  total_goals: number;
  delayed_goals: number;
  at_risk_goals: number;
  resource_utilization: number;
  critical_path_length: number;
}

export interface RiskFactors {
  timeline_risk: 'high' | 'medium' | 'low';
  resource_risk: 'high' | 'medium' | 'low';
  complexity_risk: 'high' | 'medium' | 'low';
}

export interface OptimizationSuggestion {
  type: string;
  suggestion: string;
  impact: 'high' | 'medium' | 'low';
}

export interface AnalyticsResponse {
  timeline_metrics?: TimelineMetrics;
  risk_factors?: RiskFactors;
  optimization_suggestions?: OptimizationSuggestion[];
  performance_metrics?: {
    completion_rate: number;
    average_delay: number;
    resource_efficiency: number;
  };
  resource_metrics?: {
    utilization_by_type: Record<string, number>;
    bottlenecks: string[];
    optimization_opportunities: string[];
  };
}

export class AnalyticsService extends BaseService {
  async getAnalytics(
    params: AnalyticsParams
  ): Promise<ServiceResponse<AnalyticsResponse>> {
    try {
      await this.checkAccess('workspace', params.workspace_id);

      const supabase = createClient();
      const { data, error } = await supabase.functions.invoke('analytics', {
        body: {
          workspace_id: params.workspace_id,
          analysis_type: params.analysis_type,
          start_date: params.start_date,
          end_date: params.end_date
        }
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  async getPredictiveAnalytics(
    workspaceId: string
  ): Promise<ServiceResponse<any>> {
    try {
      await this.checkAccess('workspace', workspaceId);

      const supabase = createClient();
      const { data, error } = await supabase.functions.invoke(
        'predictive-analytics',
        {
          body: {
            workspace_id: workspaceId
          }
        }
      );

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  async generateReport(
    workspaceId: string,
    reportConfig: {
      sections: string[];
      format: 'pdf' | 'excel' | 'json';
      filters?: Record<string, any>;
    }
  ): Promise<ServiceResponse<{ url: string }>> {
    try {
      await this.checkAccess('workspace', workspaceId, ['owner', 'admin']);

      const supabase = createClient();
      const { data, error } = await supabase.functions.invoke(
        'generate-report',
        {
          body: {
            workspace_id: workspaceId,
            config: reportConfig
          }
        }
      );

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  async getCustomMetrics(
    workspaceId: string,
    metricKeys: string[]
  ): Promise<ServiceResponse<Record<string, any>>> {
    try {
      await this.checkAccess('workspace', workspaceId);

      const supabase = createClient();
      const { data, error } = await supabase.rpc('calculate_custom_metrics', {
        p_workspace_id: workspaceId,
        p_metric_keys: metricKeys
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }
}
