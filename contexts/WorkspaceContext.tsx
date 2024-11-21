import React, { createContext, useContext } from 'react';
import { useWorkspace } from '@/hooks/use-workspace';
import type { Database } from 'types_db';

type WorkspaceContextType = {
  workspace: Database['public']['Tables']['workspaces']['Row'] | null;
  goals: Database['public']['Tables']['goals']['Row'][];
  teams: Database['public']['Tables']['team_assignments']['Row'][];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
};

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const WorkspaceProvider: React.FC<{ workspaceId: string; children: React.ReactNode }> = ({ workspaceId, children }) => {
  const { workspace, goals, teams, loading, error, refetch } = useWorkspace(workspaceId);

  return (
    <WorkspaceContext.Provider value={{ workspace, goals, teams, loading, error, refetch }}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspaceContext = () => {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error('useWorkspaceContext must be used within a WorkspaceProvider');
  }
  return context;
}; 