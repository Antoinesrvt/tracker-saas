import { Database } from '@/types_db';
import { SupabaseClient } from '@supabase/supabase-js';
import { cache } from 'react';

export type Workspace = Database['public']['Tables']['workspaces']['Row'];
export type NewWorkspace = Database['public']['Tables']['workspaces']['Insert'];

// Helper function to check workspace access
const checkWorkspaceAccess = async (
  supabase: SupabaseClient,
  workspaceId: string
): Promise<boolean> => {
  const { data: workspace } = await supabase
    .from('workspaces')
    .select('organization_id')
    .eq('id', workspaceId)
    .single();

  if (!workspace) return false;

  const { data: hasAccess } = await supabase
    .from('team_assignments')
    .select()
    .eq('assignable_type', 'organization')
    .eq('assignable_id', workspace.organization_id)
    .single();

  return !!hasAccess;
};

// Secure read operations
export const getWorkspace = cache(async (
  supabase: SupabaseClient,
  workspaceId: string
): Promise<Workspace> => {
  const hasAccess = await checkWorkspaceAccess(supabase, workspaceId);
  if (!hasAccess) {
    throw new Error('Unauthorized: You do not have access to this workspace');
  }

  const { data: workspace, error } = await supabase
    .from('workspaces')
    .select('*')
    .eq('id', workspaceId)
    .single();

  if (error) throw new Error(`Failed to fetch workspace: ${error.message}`);
  if (!workspace) throw new Error('Workspace not found');

  return workspace;
});

// Get all workspaces user has access to through organizations
export const getUserWorkspaces = cache(async (
  supabase: SupabaseClient
): Promise<Workspace[]> => {

  const userId = (await supabase.auth.getUser()).data.user?.id;

  console.log("userId", userId);

  const { data: workspaces, error } = await supabase
    .from('workspaces')
    .select('*')
    .eq('owner_id', userId);

  console.log("workspaces", workspaces);


  if (error) throw new Error(`Failed to fetch workspaces: ${error.message}`);

  return workspaces;
}); 

export const getWorkspacesByOrganizationId = cache(async (
  supabase: SupabaseClient,
  organizationId: string
): Promise<Workspace[]> => {
  const { data: workspaces, error } = await supabase
    .from('workspaces')
    .select('*')
    .eq('organization_id', organizationId);

  if (error) throw new Error(`Failed to fetch workspaces: ${error.message}`);
  return workspaces;
});


export const createWorkspace= async (
  supabase: SupabaseClient,
  name: string,
  userId: string,
  organizationId: string
) => {
  console.log('Starting workspace creation...', { name, userId });

  try {

    // Create workspace
    const { data: workspace, error: wsError } = await supabase
      .from('workspaces')
      .insert({
        name,
        organization_id: organizationId,
        settings: {},
        is_active: true
      })
      .select()
      .single();

    if (wsError) {
      console.error('Workspace creation failed:', wsError);
      throw wsError;
    }

    console.log('Workspace created:', workspace);

    // Create team assignment
    const { error: assignError } = await supabase
      .from('team_assignments')
      .insert({
        user_id: userId,
        assignable_type: 'workspace',
        assignable_id: workspace.id,
        role: 'owner'
      });

    if (assignError) {
      console.error('Team assignment failed:', assignError);
      throw assignError;
    }

    console.log('Team assignment created');
    return workspace;
  } catch (error) {
    console.error('Workspace creation failed:', error);
    throw error;
  }
};
