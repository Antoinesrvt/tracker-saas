"use client";

import React, { createContext, useContext, useState } from 'react';
import { Database } from '@/types/supabase';
import { createSupabaseClient } from '@/utils/supabase/client';
import type { GoalDetails } from '@/types/goals';

type Goal = Database['public']['Tables']['goals']['Row'];
type GoalConnection = Database['public']['Tables']['goal_connections']['Row'];

interface GoalContextType {
  selectedGoal: Goal | null;
  goalDetails: GoalDetails | null;
  isCardOpen: boolean;
  openGoalCard: (goal: Goal) => Promise<void>;
  closeGoalCard: () => void;
  updateGoalProgress: (goalId: string, progress: number) => Promise<void>;
}

const GoalContext = createContext<GoalContextType | undefined>(undefined);

export function GoalProvider({ children }: { children: React.ReactNode }) {
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [goalDetails, setGoalDetails] = useState<GoalDetails | null>(null);
  const [isCardOpen, setIsCardOpen] = useState(false);
  const supabase = createSupabaseClient();

  const fetchGoalDetails = async (goalId: string): Promise<GoalDetails> => {
    // Fetch connections
    const { data: connections, error: connError } = await supabase
      .from('goal_connections')
      .select('*')
      .or(`source_goal_id.eq.${goalId},target_goal_id.eq.${goalId}`);

    if (connError) throw connError;

    // Fetch tasks
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('*')
      .eq('goal_id', goalId);

    if (tasksError) throw tasksError;

    const completedTasks = tasks?.filter(t => t.status === 'completed') || [];

    // Calculate metrics
    const details: GoalDetails = {
      id: goalId,
      metrics: {
        completion: selectedGoal?.progress || 0,
        tasks_completed: completedTasks.length,
        total_tasks: tasks?.length || 0,
        days_remaining: calculateDaysRemaining(selectedGoal?.end_date || null)
      },
      connections: {
        incoming: connections?.filter(c => c.target_goal_id === goalId) || [],
        outgoing: connections?.filter(c => c.source_goal_id === goalId) || []
      },
      timeline: {
        start_date: selectedGoal?.start_date || null,
        end_date: selectedGoal?.end_date || null,
        duration: calculateDuration(selectedGoal?.start_date || null, selectedGoal?.end_date || null),
        progress: selectedGoal?.progress || 0
      }
    };

    return details;
  };

  const openGoalCard = async (goal: Goal) => {
    setSelectedGoal(goal);
    try {
      const details = await fetchGoalDetails(goal.id);
      setGoalDetails(details);
      setIsCardOpen(true);
    } catch (error) {
      console.error('Error fetching goal details:', error);
      // Handle error appropriately
    }
  };

  const closeGoalCard = () => {
    setIsCardOpen(false);
    setSelectedGoal(null);
    setGoalDetails(null);
  };

  const updateGoalProgress = async (goalId: string, progress: number) => {
    const { error } = await supabase
      .from('goals')
      .update({ progress })
      .eq('id', goalId);

    if (error) throw error;

    setSelectedGoal(prev => {
      if (prev && prev.id === goalId) {
        return { ...prev, progress };
      }
      return prev;
    });
  };

  return (
    <GoalContext.Provider 
      value={{
        selectedGoal,
        goalDetails,
        isCardOpen,
        openGoalCard,
        closeGoalCard,
        updateGoalProgress,
      }}
    >
      {children}
    </GoalContext.Provider>
  );
}

// Helper functions
function calculateDaysRemaining(endDate: string | null): number {
  if (!endDate) return 0;
  const end = new Date(endDate);
  const now = new Date();
  const diff = end.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function calculateDuration(startDate: string | null, endDate: string | null): number {
  if (!startDate || !endDate) return 0;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diff = end.getTime() - start.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function useGoal() {
  const context = useContext(GoalContext);
  if (context === undefined) {
    throw new Error('useGoal must be used within a GoalProvider');
  }
  return context;
} 