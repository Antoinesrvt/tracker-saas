import { useMemo } from 'react';
import { Resource } from '@/types/resources';
import { ResourceFilters } from '@/components/Goal/tabs/resources/types';

export function useResourceFilters(resources: Resource[], filters: ResourceFilters) {
  return useMemo(() => {
    return resources.filter(resource => {
      const matchesType = filters.type === 'all' || resource.type === filters.type;
      
      const matchesSearch = !filters.search || 
        resource.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        resource.description?.toLowerCase().includes(filters.search.toLowerCase());
      
      const matchesTags = filters.tags.length === 0 || 
        filters.tags.every(tag => resource.tags?.some(t => t.id === tag));
      
      const matchesMilestone = !filters.milestoneId || 
        resource.relations.milestoneId === filters.milestoneId;
      
      const matchesTask = !filters.taskId || 
        resource.relations.taskId === filters.taskId;
      
      const matchesAddedBy = !filters.addedBy || 
        resource.addedBy.id === filters.addedBy;

      return matchesType && matchesSearch && matchesTags && 
             matchesMilestone && matchesTask && matchesAddedBy;
    });
  }, [resources, filters]);
}

export function useResourceStats(resources: Resource[]) {
  return useMemo(() => {
    const byType = {
      file: resources.filter(r => r.type === 'file').length,
      link: resources.filter(r => r.type === 'link').length,
    };

    const totalSize = resources.reduce((acc, r) => acc + (r.size || 0), 0);
    
    const uniqueTags = Array.from(
      new Set(resources.flatMap(r => r.tags?.map(t => t.id) || []))
    );

    const withRelations = resources.filter(
      r => r.relations.milestoneId || r.relations.taskId
    ).length;

    return {
      total: resources.length,
      byType,
      totalSize,
      uniqueTagsCount: uniqueTags.length,
      withRelations,
    };
  }, [resources]);
} 