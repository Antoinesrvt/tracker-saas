import { serve } from '@/lib/utils/edge-function';
import { z } from 'zod';
import { createServerSupabase } from '../shared/supabase.ts';
import { createApiResponse, ApiError } from '../shared/api-handler.ts';
import type { Database } from 'types_db';

type Tables = Database['public']['Tables'];
type Templates = Tables['templates']['Row'];
type Goals = Tables['goals']['Row'];
type Tasks = Tables['tasks']['Row'];
type Milestones = Tables['milestones']['Row'];

const requestSchema = z.object({
  template_id: z.string().uuid(),
  variables: z.record(z.any()),
  target_id: z.string().uuid().optional(),
  workspace_id: z.string().uuid(),
  user_id: z.string().uuid()
});

serve((req: Request) => {
  return createApiResponse(async () => {
    const supabase = createServerSupabase();
    const body = await req.json();
    const validatedBody = requestSchema.parse(body);

    // Get template
    const { data: template, error: templateError } = await supabase
      .from('templates')
      .select('*')
      .eq('id', validatedBody.template_id)
      .single();

    if (templateError) throw templateError;

    // Check access
    const { data: hasAccess } = await supabase.rpc('has_team_access', {
      target_type: 'workspace',
      target_id: validatedBody.workspace_id,
      required_roles: ['owner', 'admin', 'member']
    });

    if (!hasAccess) throw new ApiError('Insufficient permissions', 403);

    // Validate required variables
    const missingVars = template.variables.filter(
      (v: string) => !validatedBody.variables[v]
    );
    if (missingVars.length > 0) {
      throw new ApiError(
        `Missing required variables: ${missingVars.join(', ')}`
      );
    }

    // Apply template based on type
    switch (template.type) {
      case 'goal':
        return await applyGoalTemplate(supabase, template, validatedBody);
      case 'task':
        return await applyTaskTemplate(supabase, template, validatedBody);
      case 'milestone':
        return await applyMilestoneTemplate(supabase, template, validatedBody);
      case 'workflow':
        return await applyWorkflowTemplate(supabase, template, validatedBody);
      default:
        throw new ApiError('Invalid template type');
    }
  });
});

async function applyGoalTemplate(
  supabase: any,
  template: Templates,
  params: any
) {
  const goalData = interpolateVariables(template.content, params.variables);

  const { data: goal, error } = await supabase
    .from('goals')
    .insert([
      {
        ...goalData,
        workspace_id: params.workspace_id,
        created_by: params.user_id
      }
    ])
    .select()
    .single();

  if (error) throw error;
  return goal;
}

async function applyTaskTemplate(
  supabase: any,
  template: Templates,
  params: any
) {
  const taskData = interpolateVariables(template.content, params.variables);

  const { data: task, error } = await supabase
    .from('tasks')
    .insert([
      {
        ...taskData,
        goal_id: params.target_id,
        created_by: params.user_id
      }
    ])
    .select()
    .single();

  if (error) throw error;
  return task;
}

// Similar implementations for milestone and workflow templates...

function interpolateVariables(
  content: any,
  variables: Record<string, any>
): any {
  const contentStr = JSON.stringify(content);
  const interpolated = contentStr.replace(
    /\${(\w+)}/g,
    (_, key) => variables[key] || ''
  );
  return JSON.parse(interpolated);
}
