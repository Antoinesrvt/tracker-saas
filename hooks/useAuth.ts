 'use client';

 import { useContext, useEffect } from 'react';
 import { useRouter, usePathname } from 'next/navigation';
 import { AuthContext } from '@/contexts/AuthContext';

 export function useAuth(redirectTo = '/signin') {
   const context = useContext(AuthContext);
   const router = useRouter();
   const pathname = usePathname();

   if (context === undefined) {
     throw new Error('useAuth must be used within an AuthProvider');
   }

   useEffect(() => {
     if (!context.loading && !context.user) {
       router.push(`${redirectTo}?returnTo=${encodeURIComponent(pathname)}`);
     }
   }, [context.loading, context.user, redirectTo, router, pathname]);

   return context;
 }