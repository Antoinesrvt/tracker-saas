 import { createClient } from '@supabase/supabase-js';
 import { Database } from '../../../types/database.types';

 export const createServerSupabase = () => {
   const supabaseUrl = Deno.env.get('SUPABASE_URL');
   const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

   if (!supabaseUrl || !supabaseServiceKey) {
     throw new Error('Missing environment variables');
   }

   return createClient<Database>(supabaseUrl, supabaseServiceKey, {
     auth: {
       autoRefreshToken: false,
       persistSession: false
     }
   });
 };