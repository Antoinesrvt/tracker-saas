import { useMemo } from 'react';
import { Task } from '@/types/tasks';
import { TaskFilters } from '@/components/Goal/tabs/tasks/types';
import { isWithinInterval } from 'date-fns';

export function useTaskFilters(tasks: Task[], filters: TaskFilters) {
  return useMemo(() => {
    return tasks.filter(task => {
      const matchesAssignee = !filters.assignee || 
        task.assignees?.some(a => a.id === filters.assignee);
      
      const matchesPriority = !filters.priority || 
        task.priority === filters.priority;
      
      const matchesCategory = !filters.category || 
        task.category === filters.category;
      
      const matchesDateRange = !filters.dateRange.from || !filters.dateRange.to || 
        (task.deadline && 
          isWithinInterval(new Date(task.deadline), {
            start: new Date(filters.dateRange.from),
            end: new Date(filters.dateRange.to),
          }));
      
      const matchesLabels = filters.labels.length === 0 || 
        filters.labels.every(label => task.labels?.includes(label));

      return matchesAssignee && matchesPriority && 
             matchesCategory && matchesDateRange && matchesLabels;
    });
  }, [tasks, filters]);
}

export function useTaskCalculations(tasks: Task[]) {
  return useMemo(() => {
    const tasksByStatus = {
      todo: tasks.filter(t => t.status === 'todo'),
      in_progress: tasks.filter(t => t.status === 'in_progress'),
      completed: tasks.filter(t => t.status === 'completed'),
    };

    const overdueTasks = tasks.filter(
      t => t.deadline && new Date(t.deadline) < new Date() && t.status !== 'completed'
    );

    const upcomingTasks = tasks.filter(
      t => t.deadline && new Date(t.deadline) > new Date() && t.status !== 'completed'
    ).sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime());

    const completedSubtasks = tasks.reduce((acc, task) => 
      acc + task.subtasks.filter(st => st.completed).length, 0
    );

    const totalSubtasks = tasks.reduce((acc, task) => 
      acc + task.subtasks.length, 0
    );

    const completedChecklists = tasks.reduce((acc, task) => 
      acc + task.checklist.filter(item => item.completed).length, 0
    );

    const totalChecklists = tasks.reduce((acc, task) => 
      acc + task.checklist.length, 0
    );

    return {
      tasksByStatus,
      overdueTasks,
      upcomingTasks,
      progress: tasks.length > 0 
        ? (tasks.filter(t => t.status === 'completed').length / tasks.length) * 100
        : 0,
      subtasksProgress: totalSubtasks > 0 
        ? (completedSubtasks / totalSubtasks) * 100 
        : 0,
      checklistProgress: totalChecklists > 0 
        ? (completedChecklists / totalChecklists) * 100 
        : 0,
      totalTasks: tasks.length,
      completedTasks: tasks.filter(t => t.status === 'completed').length,
      hasOverdueTasks: overdueTasks.length > 0,
    };
  }, [tasks]);
}
