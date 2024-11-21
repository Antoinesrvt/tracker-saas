'use client';

import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Organization } from '@/utils/supabase/queries/organizations';
import { Card } from '@/components/ui/card';
import { Building2, Plus, Users } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Page() {
  const { organizations, loading } = useAuth();

  if (loading) {
    return <OrganizationsSkeleton />;
  }

  return (
    <div className="p-6 space-y-8">
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-white/90 to-white/80 bg-clip-text text-transparent mb-2">
          Organizations
        </h1>
        <p className="text-white/60">Manage your organizations and teams</p>
      </motion.header>

      <motion.div 
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {organizations?.map((org: Organization) => (
          <OrganizationCard key={org.id} organization={org} />
        ))}
        <CreateOrganizationCard />
      </motion.div>
    </div>
  );
}

function OrganizationCard({ organization }: { organization: Organization }) {
  return (
    <Link href={`/dashboard/organizations/${organization.id}`}>
      <Card className="
        backdrop-blur-xl
        bg-white/5 border-white/10 border
        hover:border-white/20 rounded-xl
        transition-all duration-300 ease-in-out
        hover:shadow-lg hover:shadow-black/20
        transform hover:-translate-y-1
        cursor-pointer
        p-6
      ">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 rounded-lg bg-white/5">
            <Building2 className="h-6 w-6 text-white/80" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">{organization.name}</h3>
            <p className="text-sm text-white/60">{organization.subscription_plan}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-white/40">
          <Users className="h-4 w-4" />
          <span className="text-sm">View details</span>
        </div>
      </Card>
    </Link>
  );
}

function CreateOrganizationCard() {
  return (
    <Button
      variant="ghost"
      className="h-[160px] border-2 border-dashed border-white/10 hover:border-white/20 rounded-xl flex flex-col items-center justify-center gap-2 group"
    >
      <div className="p-3 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors">
        <Plus className="h-6 w-6 text-white/60 group-hover:text-white/80" />
      </div>
      <span className="text-white/60 group-hover:text-white/80">Create Organization</span>
    </Button>
  );
}

function OrganizationsSkeleton() {
  return (
    <div className="p-6 space-y-8">
      <div className="space-y-2">
        <div className="h-12 w-64 bg-white/5 rounded-lg animate-pulse" />
        <div className="h-6 w-48 bg-white/5 rounded-lg animate-pulse" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-[160px] bg-white/5 rounded-xl animate-pulse" />
        ))}
      </div>
    </div>
  );
} 