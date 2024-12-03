 import { createContext, useContext, useEffect, useState } from 'react';
 import { createClient } from '@/lib/supabase/client';
 import type { User } from '@supabase/supabase-js';
 import type { TeamAccess } from '@/types/service.types';
 

 interface AuthContextType {
   user: User | null;
   teamAccess: TeamAccess[];
   loading: boolean;
 }

 const AuthContext = createContext<AuthContextType>({
   user: null,
   teamAccess: [],
   loading: true
 });

 export function AuthProvider({ children }: { children: React.ReactNode }) {
   const [user, setUser] = useState<User | null>(null);
   const [teamAccess, setTeamAccess] = useState<TeamAccess[]>([]);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
     const supabase = createClient();

     // Get initial session
     supabase.auth.getSession().then(({ data: { session } }) => {
       setUser(session?.user ?? null);
       if (session?.user) {
         loadTeamAccess(session.user.id);
       }
     });

     // Listen for changes
     const {
       data: { subscription }
     } = supabase.auth.onAuthStateChange(async (event, session) => {
       setUser(session?.user ?? null);
       if (session?.user) {
         await loadTeamAccess(session.user.id);
       } else {
         setTeamAccess([]);
       }
       setLoading(false);
     });

     return () => {
       subscription.unsubscribe();
     };
   }, []);

   async function loadTeamAccess(userId: string) {
     const supabase = createClient();
     const { data, error } = await supabase
       .from('team_assignments')
       .select('*')
       .eq('user_id', userId);

     if (!error && data) {
       setTeamAccess(
         data.map((assignment) => ({
           role: assignment.role,
           resourceType: assignment.assignable_type as string,
           resourceId: assignment.assignable_id
         })) as TeamAccess[]
       );
     }
   }

   return (
     <AuthContext.Provider value={{ user, teamAccess, loading }}>
       {children}
     </AuthContext.Provider>
   );
 }

 export const useAuth = () => useContext(AuthContext);