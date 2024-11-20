"use client";

import { GoalProvider } from '@/contexts/GoalContext';
import GoalDetailCard from '../../components/Goal/GoalDetailCard';

export default function TrackerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <GoalProvider>
      {children}
      <GoalDetailCard />
    </GoalProvider>
  );
} 