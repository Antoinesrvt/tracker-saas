import { GoalDetails, TypeStyles } from '@/types/goals';
import { User } from '@/types/common';

export interface OverviewTabProps {
  goalDetails: GoalDetails;
  styles: TypeStyles;
  onExport?: () => void;
  onTagAdd?: (tag: string) => void;
  onTagRemove?: (tag: string) => void;
}

export interface TeamSectionProps {
  team: User[];
  assignees: User[];
  onAddMember?: () => void;
}

export interface TagsSectionProps {
  tags: GoalDetails['tags'];
  styles: TypeStyles;
  onTagAdd?: (tag: string) => void;
  onTagRemove?: (tagId: string) => void;
}

export interface MetricsSectionProps {
  metrics: GoalDetails['metrics'];
  team: User[];
}

export interface DependenciesSectionProps {
  dependencies: GoalDetails['dependencies'];
  styles: TypeStyles;
} 