import { Resource } from '@/types/resources';
import { TypeStyles } from '@/types/goals';
import { ResourceType, User } from '@/types/common';

export interface ResourcesTabProps {
  goalDetails: {
    resources: Resource[];
    team: User[];
  };
  styles: TypeStyles;
  onAddResource?: (resource: Omit<Resource, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onDeleteResource?: (resourceId: string) => void;
  onUpdateResource?: (resource: Resource) => void;
}

export interface ResourceFilters {
  type: ResourceType | 'all';
  search: string;
  tags: string[];
  milestoneId?: string;
  taskId?: string;
  addedBy?: string;
}

export interface ResourceCardProps {
  resource: Resource;
  onEdit: () => void;
  onDelete: () => void;
  onOpen: () => void;
}

export interface AddResourceFormProps {
  onSubmit: (resource: Omit<Resource, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  initialData?: Partial<Omit<Resource, 'id' | 'createdAt' | 'updatedAt'>>;
}

export interface EditResourceFormProps {
  resource: Resource;
  onSubmit: (resource: Resource) => void;
  onCancel: () => void;
}

export interface ResourceFiltersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: ResourceFilters;
  onFiltersChange: (filters: ResourceFilters) => void;
  team: User[];
} 