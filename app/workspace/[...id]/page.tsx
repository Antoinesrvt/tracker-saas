'use client';

import React from 'react';
import { WorkspaceProvider } from '@/contexts/WorkspaceContext';
import GoalTracker from './component'; // Assuming GoalTracker is the main component for this page

const WorkspacePage = ({ params }: { params: { id: string } }) => {
  const { id } = params; // Extract the workspace ID from the URL parameters

  return (
    <WorkspaceProvider workspaceId={id}>
      <GoalTracker />
    </WorkspaceProvider>
  );
};

export default WorkspacePage;
