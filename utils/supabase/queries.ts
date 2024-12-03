import { Database } from '@/types_db';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { cache } from 'react';

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const getUser = cache(async (supabase: SupabaseClient) => {
  const {
    data: { user }
  } = await supabase.auth.getUser();
  return user;
});

export const getSubscription = cache(async (supabase: SupabaseClient) => {
  const { data: subscription, error } = await supabase
    .from('subscriptions')
    .select('*, prices(*, products(*))')
    .in('status', ['trialing', 'active'])
    .maybeSingle();

  if(error) {
    console.error('Error fetching subscription:', error);
    return null;
  }

  return subscription;
});

export const getProducts = cache(async (supabase: SupabaseClient) => {
  const { data: products, error } = await supabase
    .from('products')
    .select('*, prices(*)')
    .eq('active', true)
    .eq('prices.active', true)
    .order('metadata->index')
    .order('unit_amount', { referencedTable: 'prices' });

  if(error) {
    console.error('Error fetching products:', error);
    return null;
  }
  return products;
});

export const getUserDetails = cache(async (supabase: SupabaseClient) => {
  const { data: userDetails, error } = await supabase
    .from('users')
    .select('*')
    .single();
  
     if (error) {
       console.error('Error fetching user details:', error);
    return null;
  }
  return userDetails;
});

export const getWorkspaces = cache(async (supabase: SupabaseClient) => {
  const { data: workspaces, error } = await supabase
    .from('workspaces')
    .select(`
      id,
      name,
      settings,
      is_active,
      organization: organizations (
        id,
        name,
        subscription_plan
      ),
      team_assignments (
        role,
        user_id
      )
    `)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return workspaces;
});

export const getWorkspaceDetails = cache(async (supabase: SupabaseClient, workspaceId: string) => {
  const { data: workspace, error } = await supabase
    .from('workspaces')
    .select(`
      *,
      organization:organizations (
        id,
        name,
        subscription_plan
      ),
      tasks (
        id,
        title,
        status,
        priority
      ),
      goals (
        id,
        title,
        status,
        progress
      )
    `)
    .eq('id', workspaceId)
    .single();

  if (error) throw error;
  return workspace;
});

export const createWorkspaceWithOrg = async (
  supabase: SupabaseClient,
  name: string,
  userId: string
) => {
  console.log('Starting workspace creation...', { name, userId });

  try {
    // Create organization
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .insert({
        name: `${name}'s Organization`,
        user_id: userId,
        subscription_plan: 'free'
      })
      .select()
      .single();

    if (orgError) {
      console.error('Organization creation failed:', orgError);
      throw orgError;
    }

    console.log('Organization created:', org);

    // Create workspace
    const { data: workspace, error: wsError } = await supabase
      .from('workspaces')
      .insert({
        name,
        organization_id: org.id,
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
        assignable_type: 'organization',
        assignable_id: org.id,
        role: 'owner'
      });

    if (assignError) {
      console.error('Team assignment failed:', assignError);
      throw assignError;
    }

       const { error: newAssignError } = await supabase
         .from('team_assignments')
         .insert({
           user_id: userId,
           assignable_type: 'workspace',
           assignable_id: workspace.id,
           role: 'owner'
         });

    if (newAssignError) {
      console.error('Team assignment failed:', newAssignError);
      throw newAssignError;
    }

    console.log('Team assignment created');
    return workspace;
  } catch (error) {
    console.error('Workspace creation failed:', error);
    throw error;
  }
};


export const createGoal = async (supabase: SupabaseClient, goal: Database['public']['Tables']['goals']['Insert']) => {
  try {
    const { data: newGoal, error } = await supabase.from('goals').insert(goal).select().single();

    if (error) {
      throw new Error(`Failed to create goal: ${error.message}`);
    }

    return newGoal;
  } catch (err) {
    console.error('Error creating goal:', err);
    throw new Error('An error occurred while creating the goal. Please try again later.');
  }
};