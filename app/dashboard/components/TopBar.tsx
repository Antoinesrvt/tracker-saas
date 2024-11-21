'use client';

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell } from "lucide-react";
import { useRouter } from 'next/navigation';

export function TopBar() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <div className="h-16 border-b border-white/10 backdrop-blur-xl bg-black/50 px-6 flex items-center justify-between">
        <div className="flex-1" />
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-white/10 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="h-16 border-b border-white/10 backdrop-blur-xl bg-black/50 px-6 flex items-center justify-between">
      <div className="flex-1" />
      
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="text-white/60 hover:text-white"
        >
          <Bell className="h-5 w-5" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar>
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback>
                  {user?.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push('/account')}>
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push('/account/billing')}>
              Billing
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push('/account/team')}>
              Team
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push('/account/subscription')}>
              Subscription
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-red-600"
              onClick={signOut}
            >
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
} 