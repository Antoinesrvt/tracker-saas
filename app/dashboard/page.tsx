'use client';

import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { Organization } from '@/utils/supabase/queries/organizations';
import { OrganizationSection } from './components/OrganizationSection';
import { useAuth } from '@/contexts/AuthContext';

export default function Page() {
  const { organizations, loading, userDetails } = useAuth();

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="p-6 space-y-8">
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10"
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-white/90 to-white/80 bg-clip-text text-transparent mb-2">
          Welcome back, {userDetails?.full_name}
        </h1>
        <p className="text-white/60">Manage your organizations and workspaces</p>
      </motion.header>

      <motion.div 
        className="space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {organizations?.map((org: Organization) => (
          <OrganizationSection key={org.id} organization={org} />
        ))}
      </motion.div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="p-6 space-y-8">
      <Skeleton className="h-14 w-72 bg-white/5 rounded-lg" />
      <div className="space-y-8">
        {[1, 2].map((i) => (
          <div key={i} className="space-y-4">
            <Skeleton className="h-8 w-48 bg-white/5 rounded-lg" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((j) => (
                <Skeleton key={j} className="h-32 w-full bg-white/5 rounded-xl" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}