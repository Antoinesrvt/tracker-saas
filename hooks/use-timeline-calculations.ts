import { useMemo } from 'react';
import { Milestone } from '@/types/milestones';
import { isAfter, isBefore, isToday } from 'date-fns';

export function useTimelineCalculations(milestones: Milestone[]) {
  return useMemo(() => {
    const now = new Date();
    const sortedMilestones = [...milestones].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const completedMilestones = milestones.filter(m => m.completed);
    const overdueMilestones = milestones.filter(
      m => !m.completed && isBefore(new Date(m.date), now)
    );
    const upcomingMilestones = milestones.filter(
      m => !m.completed && isAfter(new Date(m.date), now)
    );
    const todayMilestones = milestones.filter(
      m => !m.completed && isToday(new Date(m.date))
    );

    const progress = completedMilestones.length / milestones.length * 100;

    const nextMilestone = sortedMilestones.find(
      m => !m.completed && isAfter(new Date(m.date), now)
    );

    return {
      sortedMilestones,
      completedMilestones,
      overdueMilestones,
      upcomingMilestones,
      todayMilestones,
      progress,
      nextMilestone,
      hasOverdueMilestones: overdueMilestones.length > 0,
      hasTodayMilestones: todayMilestones.length > 0,
    };
  }, [milestones]);
} 