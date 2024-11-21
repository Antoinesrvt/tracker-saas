import { Database } from '@/types_db';
import { SupabaseClient } from '@supabase/supabase-js';
import { cache } from 'react';

export type Organization = Database['public']['Tables']['organizations']['Row'];
export type NewOrganization = Database['public']['Tables']['organizations']['Insert'];

// Secure read operations with access control
export const getOrganization = cache(async (
  supabase: SupabaseClient,
  organizationId: string
): Promise<Organization> => {
  const { data: userRole } = await supabase
    .from('team_assignments')
    .select('role')
    .eq('assignable_type', 'organization')
    .eq('assignable_id', organizationId)
    .single();

  if (!userRole) {
    throw new Error('Unauthorized: You do not have access to this organization');
  }

  const { data: organization, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', organizationId)
    .single();

  if (error) throw new Error(`Failed to fetch organization: ${error.message}`);
  if (!organization) throw new Error('Organization not found');

  return organization;
});

// Get all organizations user has access to
export const getUserOrganizations = cache(async (
  supabase: SupabaseClient
): Promise<Organization[]> => {
  const { data: assignments, error: assignmentError } = await supabase
    .from('team_assignments')
    .select('assignable_id')
    .eq('assignable_type', 'organization');

  if (assignmentError) throw new Error(`Failed to fetch organization access: ${assignmentError.message}`);

  const organizationIds = assignments?.map(a => a.assignable_id) || [];

  if (organizationIds.length === 0) return [];

  const { data: organizations, error } = await supabase
    .from('organizations')
    .select("*")
    .in('id', organizationIds);

  if (error) throw new Error(`Failed to fetch organizations: ${error.message}`);

  return organizations;
});

// Secure write operations
export const createOrganization = async (
  supabase: SupabaseClient,
  organization: NewOrganization
): Promise<Organization> => {
  const { data: newOrg, error: orgError } = await supabase
    .from('organizations')
    .insert(organization)
    .select()
    .single();

  if (orgError) throw new Error(`Failed to create organization: ${orgError.message}`);
  if (!newOrg) throw new Error('No data returned from organization creation');

  // Automatically assign creator as owner
  const { error: assignmentError } = await supabase
    .from('team_assignments')
    .insert({
      assignable_type: 'organization',
      assignable_id: newOrg.id,
      role: 'owner'
    });

  if (assignmentError) {
    // Rollback organization creation
    await supabase.from('organizations').delete().eq('id', newOrg.id);
    throw new Error(`Failed to set organization ownership: ${assignmentError.message}`);
  }

  return newOrg;
}; 