"use client";

import React, { createContext, useContext } from 'react';
import { useGoal } from '@/hooks/use-goal';
import type { Database } from 'types_db';

type GoalContextType = {
  goal: Database['public']['Tables']['goals']['Row'] | null;
  milestones: Database['public']['Tables']['milestones']['Row'][];
  tasks: Database['public']['Tables']['tasks']['Row'][];
  teams: Database['public']['Tables']['team_assignments']['Row'][];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  updateGoalProgress: (progress: number) => Promise<void>;
};

export const GoalContext = createContext<GoalContextType | undefined>(undefined);

export const GoalProvider: React.FC<{
  goalId?: string;
  children: React.ReactNode;
}> = ({ goalId, children }) => {
  if (!goalId) {
   return;
  }

  const {
    goal,
    milestones,
    tasks,
    teams,
    loading,
    error,
    refetch,
    updateGoalProgress
  } = useGoal(goalId);

  return (
    <GoalContext.Provider
      value={{
        goal,
        milestones,
        tasks,
        teams,
        loading,
        error,
        refetch,
        updateGoalProgress
      }}
    >
      {children}
    </GoalContext.Provider>
  );
};

export const useGoalContext = () => {
  const context = useContext(GoalContext);
  if (context === undefined) {
    throw new Error('useGoalContext must be used within a GoalProvider');
  }
  return context;
}; 