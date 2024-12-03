 import { createBrowserClient } from '@supabase/ssr';
 import { Database } from 'types_db';

 export const createClient = () => {
   const supabase = createBrowserClient<Database>(
     process.env.NEXT_PUBLIC_SUPABASE_URL!,
     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
   );
   return supabase;
 };

 // Service methods
 export const supabaseService = {

  // Goals
  async getGoals(workspaceId: string) {
     const { data, error } = await createClient()
       .from('goals')
       .select('*')
       .eq('workspace_id', workspaceId);
     if (error) throw error;
     return data;
   },

   // Tasks
   async getTasks(goalId: string) {
     const { data, error } = await createClient()
       .from('tasks')
       .select('*')
       .eq('goal_id', goalId);
     if (error) throw error;
     return data;
   },

   // Analytics
   async getWorkspaceAnalytics(workspaceId: string) {
     const { data, error } = await createClient().functions.invoke(
       'analytics',
       {
         body: { workspace_id: workspaceId }
       }
     );
     if (error) throw error;
     return data;
   }
 };