'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, ZoomIn, ZoomOut, Home, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GoalCard } from '../components/GoalCard';
import {
  GoalWithPosition,
  useGoalCalculations
} from '@/hooks/use-goal-calculations';
import { typeStyles } from '@/types/style';
import { CreateGoalCard } from '../components/CreateGoalCard';
import mockGoals from '../../dashboard/mockGoals';
import { Database } from 'types_db';
import { useRouter } from 'next/navigation';
import { useWorkspaceContext } from '@/contexts/WorkspaceContext';
import { getUserDetails } from '@/utils/supabase/queries';
import { getSupabaseBrowserClient } from '@/utils/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useItemContext } from '@/contexts/ItemContext';

type Goal = Database['public']['Tables']['goals']['Row'];
type User = Database['public']['Tables']['users']['Row'];

const TYPE_LABELS = {
  fondation: 'Fondations',
  action: 'Actions',
  strategie: 'Stratégies',
  vision: 'Vision Stratégique'
} as const;

// Update these constants for better spacing
const CARD_WIDTH = 264;
const CARD_HEIGHT = 120; // Increased from 36 to account for actual card height
const HORIZONTAL_GAP = 120; // Increased from 70 for better separation
const VERTICAL_GAP = 80; // Increased from 50 for better separation

export default function GoalTracker() {
  const supabase = getSupabaseBrowserClient();
  const types = ['fondation', 'action', 'strategie', 'vision'];
  // Calculate initial center position based on window size
  const [transform, setTransform] = useState(() => {
    if (typeof window !== 'undefined') {
      return {
        scale: 1,
        x: window.innerWidth / 2 - (CARD_WIDTH * 2 + HORIZONTAL_GAP * 1.5),
        y: window.innerHeight / 2 - CARD_HEIGHT
      };
    }
    return { scale: 1, x: 0, y: 0 };
  });
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [dragStartTime, setDragStartTime] = useState(0);
  const canvasRef = useRef<HTMLDivElement>(null);

  const { workspace, goals: otherGoals, loading, error, teams } = useWorkspaceContext();
  const { organizations } = useAuth();
  const { openGoalModal } = useItemContext();

  const goals = mockGoals;
  // Move the calculations hook before any early returns
  const sectionLabels = types.map((type, index) => ({
    type,
    position: {
      x: index * (CARD_WIDTH + HORIZONTAL_GAP),
      y: -VERTICAL_GAP
    }
  }));

  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const userDetails = await getUserDetails(supabase);
      setUsers(userDetails);
    };
    fetchUsers();
  }, []);

  // Early return for loading state
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
          <p className="text-white/70">Loading workspace...</p>
        </div>
      </div>
    );
  }

  // Early return for error state
  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-red-500 bg-red-500/10 px-4 py-2 rounded-lg">
          {error.message}
        </div>
      </div>
    );
  }

  // Gestion du zoom et du pan
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      setTransform((t) => ({
        ...t,
        scale: Math.min(Math.max(t.scale * delta, 0.2), 2)
      }));
    } else {
      setTransform((t) => ({
        ...t,
        x: t.x - e.deltaX,
        y: t.y - e.deltaY
      }));
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || e.button === 0) {
      setIsDragging(true);
      setStartPos({
        x: e.clientX - transform.x,
        y: e.clientY - transform.y
      });
      setDragStartTime(Date.now());
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setTransform((t) => ({
        ...t,
        x: e.clientX - startPos.x,
        y: e.clientY - startPos.y
      }));
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    const dragDuration = Date.now() - dragStartTime;
    setIsDragging(false);

    // If the drag duration is less than 200ms, consider it a click
    if (dragDuration < 200) {
      const target = e.target as HTMLElement;
      const goalCard = target.closest('[data-goal-id]');
      if (goalCard) {
        const goalId = goalCard.getAttribute('data-goal-id');
        const goal = goals.find((g) => g.id.toString() === goalId);
        if (goal) {
          openGoalModal(goal.id);
        }
      }
    }
  };

  const renderSectionLabel = (type: string) => {
    const position = sectionLabels.find((label) => label.type === type)
      ?.position || { x: 0, y: 0 };
    return (
      <React.Fragment key={type}>
        <div
          className="absolute flex flex-col items-center gap-2"
          style={{
            left: position.x + CARD_WIDTH / 2, // Center under the cards
            top: position.y - 60, // Move up a bit more
            transform: 'translateX(-50%)'
          }}
        >
          <h2 className="text-white/70 font-medium text-sm tracking-wider uppercase">
            {TYPE_LABELS[type as keyof typeof TYPE_LABELS]}
          </h2>
          <div className="h-[20px] w-[1px] bg-gradient-to-b from-white/20 to-transparent" />
        </div>

        {/* Vertical Separator */}
        {type !== 'vision' && (
          <div
            className="absolute top-0 bottom-0 border-r border-dashed border-white/10"
            style={{
              left: position.x + CARD_WIDTH + HORIZONTAL_GAP / 2
            }}
          />
        )}
      </React.Fragment>
    );
  };

  const setOpen = (goalId: string) => {
    setTransform({ scale: 1, x: 0, y: 0 })
    openGoalModal(goalId);
  };

  // Group goals by type
  const groupedGoals = goals.reduce(
    (acc, goal) => {
      if (!acc[goal.type]) acc[goal.type] = [];
      acc[goal.type].push(goal);
      return acc;
    },
    {} as Record<string, Goal[]>
  );

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="fixed top-4 left-4 z-10 flex gap-2">
        <Button
          variant="ghost"
          size="default"
          className="bg-white/10 hover:bg-white/20"
          onClick={() => router.push('/dashboard')}
        >
          <span className="text-white">Dashboard</span>
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="bg-white/10 hover:bg-white/20"
          onClick={() =>
            setTransform({
              scale: 1,
              x: window.innerWidth / 2 - (CARD_WIDTH * 2 + HORIZONTAL_GAP * 1.5),
              y: window.innerHeight / 2 - CARD_HEIGHT
            })
          }
        >
          <Home className="h-5 w-5 text-white" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="bg-white/10 hover:bg-white/20"
          onClick={() => setTransform((t) => ({ ...t, scale: t.scale * 1.2 }))}
        >
          <ZoomIn className="h-5 w-5 text-white" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="bg-white/10 hover:bg-white/20"
          onClick={() => setTransform((t) => ({ ...t, scale: t.scale * 0.8 }))}
        >
          <ZoomOut className="h-5 w-5 text-white" />
        </Button>
      </div>
      <div className="fixed bottom-4 left-4 z-20 flex gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="bg-white/10 hover:bg-white/20"
          onClick={() => router.push('/settings')}
        >
          <Settings className="h-5 w-5 text-white" />
        </Button>
      </div>

      <div className="absolute top-6 left-1/2 transform -translate-x-1/2 flex items-center gap-3">
        <h2 className="text-2xl text-white font-bold opacity-70 text-shadow-md">
          {workspace?.name?.toUpperCase()}
        </h2>
        {organizations?.find((org) => org.id === workspace?.organization_id)
          ?.subscription_plan === 'pro' ? (
          <span className="px-2 py-0.5 text-xs font-semibold bg-gradient-to-r from-amber-400 to-amber-600 text-white rounded-full shadow-lg">
            PRO
          </span>
        ) : (
          <span className="px-2 py-0.5 text-xs font-semibold bg-gradient-to-r from-slate-400 to-slate-600 text-white rounded-full opacity-70">
            FREE
          </span>
        )}
      </div>

      <div className="fixed bottom-4 right-4 z-20 bg-white/10 rounded-lg p-4 shadow-lg">
        <h2 className="text-white font-semibold">Team</h2>
        <div className="flex space-x-2">
          {/* {users.map((user) => (
            <img key={user.id} src={user.avatar_url} alt={user.full_name} className="w-8 h-8 rounded-full border-2 border-white" />
          ))} */}
        </div>
      </div>

      <div
        ref={canvasRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => setIsDragging(false)}
      >
        <div
          className="relative w-full h-full"
          style={{
            transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
            transformOrigin: '0 0',
            transition: isDragging ? 'none' : 'transform 0.1s ease-out'
          }}
        >
          {/* Centering Section Labels
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2">
            {renderSectionLabels()}
          </div> */}

            {/* Render goals in a flexbox layout */}
            <div className="flex justify-between">
              {Object.entries(groupedGoals).map(([type, goals]) => (
                <div key={type} className="flex flex-col mb-8 w-1/4">
                  {renderSectionLabel(type)}
                  <div className="flex flex-col gap-4">
                    {/* Add CreateGoalCard for the "fondation" type */}
                    {goals.map((goal) => (
                      <GoalCard
                        key={goal.id}
                        goal={goal}
                        styles={typeStyles[goal.type]}
                        setOpen={setOpen}
                      />
                    ))}
                    {type === 'fondation' && (
                      <CreateGoalCard workspaceId={workspace?.id || ''} />
                    )}
                  </div>
                </div>
              ))}
            </div>
        </div>
      </div>
    </div>
  );
}
