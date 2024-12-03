import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { createClient } from './supabase/client';

export const supabase = createClient();

// Task Management
export async function predictTaskCompletion(taskId: string) {
  const { data, error } = await supabase.functions.invoke('task-automation', {
    body: { task_id: taskId, action_type: 'predict_completion' }
  });
  if (error) throw error;
  return data;
}

export async function analyzeDependencies(taskId: string) {
  const { data, error } = await supabase.functions.invoke('task-automation', {
    body: { task_id: taskId, action_type: 'analyze_dependencies' }
  });
  if (error) throw error;
  return data;
}

// Workspace Analytics
export async function getWorkspaceHealth(workspaceId: string) {
  const { data, error } = await supabase.functions.invoke('process-metrics', {
    body: { workspace_id: workspaceId, metric_type: 'workspace_health' }
  });
  if (error) throw error;
  return data;
}

export async function analyzeProjectTimeline(workspaceId: string) {
  const { data, error } = await supabase.functions.invoke('process-metrics', {
    body: { workspace_id: workspaceId, metric_type: 'project_timeline' }
  });
  if (error) throw error;
  return data;
}

// Real-time subscriptions
export function subscribeToTaskUpdates(
  taskId: string,
  callback: (payload: any) => void
) {
  return supabase
    .channel('task_updates')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'tasks',
        filter: `id=eq.${taskId}`
      },
      callback
    )
    .subscribe();
}

export function subscribeToWorkspaceMetrics(
  workspaceId: string,
  callback: (payload: any) => void
) {
  return supabase
    .channel('workspace_metrics')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'performance_metrics',
        filter: `workspace_id=eq.${workspaceId}`
      },
      callback
    )
    .subscribe();
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
} 