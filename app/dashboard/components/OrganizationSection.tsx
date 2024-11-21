'use client';

import { Organization } from '@/utils/supabase/queries/organizations';
import { WorkspaceCard } from './WorkspaceCard';
import { CreateWorkspaceCard } from './CreateWorkspaceCard';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';

interface OrganizationSectionProps {
  organization: Organization;
}

export const OrganizationSection = ({ organization }: OrganizationSectionProps) => {
  const { workspaces, loading } = useAuth();

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48 bg-white/5" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full bg-white/5 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 1, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4 bg-transparent"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">
          {organization.name}
        </h2>
        <span className="text-sm text-white/60">
          {organization.subscription_plan}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {workspaces && workspaces.map((workspace) => (
          <WorkspaceCard
            key={workspace.id}
            workspace={workspace}
            organizationId={organization.id}
          />
        ))}
        <CreateWorkspaceCard organizationId={organization.id} />
      </div>
    </motion.section>
  );
} 