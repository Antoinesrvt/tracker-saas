'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Settings,
  Users,
  Building2,
  Goal,
  Bell,
  LogOut,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Organizations', href: '/dashboard/organizations', icon: Building2 },
  { name: 'Goals', href: '/dashboard/goals', icon: Goal },
  { name: 'Team', href: '/dashboard/team', icon: Users },
];

const bottomNavigation = [
  { name: 'Notifications', href: '/dashboard/notifications', icon: Bell },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export function SideNav() {
  const pathname = usePathname();
  const { signOut, userDetails } = useAuth();

  return (
    <div className="fixed left-0 top-0 h-full w-64 backdrop-blur-xl bg-black/50 border-r border-white/10 z-40">
      <div className="p-6 border-b border-white/10 bg-gradient-to-r from-white/[0.03] to-white/[0.01]">
        <Link href="/dashboard">
          <h1 className="text-xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent hover:opacity-80 transition-opacity">
            {userDetails?.full_name || 'Dashboard'}
          </h1>
        </Link>
      </div>

      <nav className="flex flex-col h-[calc(100%-theme(spacing.16))] justify-between">
        <motion.div 
          className="flex-1 px-3 py-4 space-y-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {navigation.map((item, index) => {
            const isActive = pathname === item.href;
            return (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href={item.href}>
                  <Button
                    variant="ghost"
                    className={cn(
                      'w-full justify-start gap-3 relative overflow-hidden rounded-lg',
                      'bg-transparent hover:bg-white/[0.06] active:bg-white/[0.08]',
                      'text-white/70 hover:text-white',
                      'transition-all duration-200 ease-out',
                      isActive && 'bg-white/[0.08] text-white shadow-inner'
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="font-medium">{item.name}</span>
                    {isActive && (
                      <motion.div
                        className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-blue-400 to-blue-600"
                        layoutId="activeNav"
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 30
                        }}
                      />
                    )}
                  </Button>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>

        <motion.div 
          className="p-3 pb-6 space-y-2 border-t border-white/10 bg-gradient-to-b from-transparent to-white/[0.02]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
        >
          {bottomNavigation.map((item) => (
            <Link key={item.name} href={item.href}>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 text-white/70 hover:text-white bg-transparent hover:bg-white/[0.06] active:bg-white/[0.08] transition-all duration-200 ease-out rounded-lg"
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.name}</span>
              </Button>
            </Link>
          ))}
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-red-400/90 hover:text-red-400 hover:bg-red-500/[0.08] active:bg-red-500/[0.12] transition-all duration-200 ease-out rounded-lg"
            onClick={signOut}
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">Logout</span>
          </Button>
        </motion.div>
      </nav>
    </div>
  );
} 