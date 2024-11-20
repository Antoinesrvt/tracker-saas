import { Milestone } from '@/types/milestones';
import { TypeStyles } from '@/types/goals';

export interface TimelineTabProps {
  goalDetails: {
    progress: number;
    milestones: Milestone[];
  };
  styles: TypeStyles;
  onFilterTasks: (milestone: Milestone) => void;
  onAddMilestone?: (milestone: Omit<Milestone, 'id'>) => void;
  onUpdateMilestone?: (milestone: Milestone) => void;
  onDeleteMilestone?: (milestoneId: string) => void;
  onToggleMilestoneComplete?: (milestoneId: string) => void;
}

export interface MilestoneCardProps {
  milestone: Milestone;
  onToggleComplete: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onClick: () => void;
  style?: React.CSSProperties;
}

export interface AddMilestoneFormProps {
  onSubmit: (milestone: Omit<Milestone, 'id'>) => void;
  onCancel: () => void;
  initialData?: Partial<Omit<Milestone, 'id'>>;
}

export interface EditMilestoneFormProps {
  milestone: Milestone;
  onSubmit: (milestone: Milestone) => void;
  onCancel: () => void;
} 