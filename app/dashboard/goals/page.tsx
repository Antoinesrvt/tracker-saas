'use client';

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Goal, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Page() {
  return (
    <div className="p-6 space-y-8">
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-white/90 to-white/80 bg-clip-text text-transparent mb-2">
          Goals
        </h1>
        <p className="text-white/60">Track and manage your organization goals</p>
      </motion.header>

      <div className="flex justify-end">
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          New Goal
        </Button>
      </div>

      <motion.div 
        className="grid grid-cols-1 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="backdrop-blur-xl bg-white/5 border-white/10 p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-lg bg-white/5">
              <Goal className="h-6 w-6 text-white/80" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Coming Soon</h3>
              <p className="text-sm text-white/60">Goals feature is under development</p>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
} 