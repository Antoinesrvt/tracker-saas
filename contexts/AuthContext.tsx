 'use client';

 import { createContext, useContext, useEffect, useState } from 'react';
 import { createClient, User } from '@supabase/supabase-js';
 import { createSupabaseClient } from '@/utils/supabase/client';
 import { useRouter } from 'next/navigation';

 interface AuthContextType {
   user: User | null;
   loading: boolean;
   signOut: () => Promise<void>;
 }

 export const AuthContext = createContext<AuthContextType | undefined>(undefined);

 export function AuthProvider({ children }: { children: React.ReactNode }) {
   const [user, setUser] = useState<User | null>(null);
   const [loading, setLoading] = useState(true);
   const router = useRouter();
   const supabase = createSupabaseClient();

   useEffect(() => {
     const {
       data: { subscription }
     } = supabase.auth.onAuthStateChange(async (event, session) => {
       setUser(session?.user ?? null);
       setLoading(false);
       router.refresh();
     });

     return () => {
       subscription.unsubscribe();
     };
   }, [router, supabase]);

   const signOut = async () => {
     await supabase.auth.signOut();
     router.push('/signin');
   };

   return (
     <AuthContext.Provider value={{ user, loading, signOut }}>
       {children}
     </AuthContext.Provider>
   );
 }