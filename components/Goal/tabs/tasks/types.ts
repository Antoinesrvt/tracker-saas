import { Task, TaskTemplate, TaskStatus, TaskPriority } from '@/types/tasks';
import { TypeStyles } from '@/types/goals';
import { User } from '@/types/common';

export interface TasksTabProps {
  goalDetails: {
    tasks: Task[];
    taskTemplates: TaskTemplate[];
    team: User[];
  };
  styles: TypeStyles;
  onUpdateTask?: (task: Task) => void;
  onCreateTask?: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onDeleteTask?: (taskId: string) => void;
}

export interface TaskCardProps {
  task: Task;
  onEdit: () => void;
  onStatusChange: (status: TaskStatus) => void;
  onDelete: () => void;
  onToggleComplete?: () => void;
  style?: React.CSSProperties;
}

export interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
  templates: TaskTemplate[];
  onSubmit?: (task: Task) => void;
  onCreate?: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  selectedTemplate?: TaskTemplate | null;
  onTemplateSelect?: (template: TaskTemplate | null) => void;
}

export interface TaskFilters {
  assignee: string;
  priority: TaskPriority | '';
  category: string;
  dateRange: { from: string; to: string };
  labels: string[];
}

export interface FiltersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: TaskFilters;
  onFiltersChange: (filters: TaskFilters) => void;
  teamMembers: User[];
}

export interface KanbanProps {
  tasks: Task[];
  tasksByStatus: Record<TaskStatus, Task[]>;
  onUpdateTask?: (task: Task) => void;
  onDeleteTask?: (taskId: string) => void;
  setEditingTask: (taskId: string) => void;
}

export interface CalendarViewProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
} 