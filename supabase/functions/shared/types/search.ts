import { Goal, Task, Milestone, Resource } from '@/types/entities';
 
 export interface SearchRequest {
   query: string;
   workspace_id: string;
   types?: ('goals' | 'tasks' | 'milestones' | 'resources')[];
   filters?: Record<string, any>;
   page: number;
   per_page: number;
 }

 export interface SearchResult<T> {
   items: T[];
   total: number;
 }

 export interface SearchResponse {
   results: {
     goals?: SearchResult<Goal>;
     tasks?: SearchResult<Task>;
     milestones?: SearchResult<Milestone>;
     resources?: SearchResult<Resource>;
   };
   pagination: {
     page: number;
     per_page: number;
     total: number;
   };
 }

 export interface SearchQueryParams {
   type: string;
   query: string;
   workspace_id: string;
   filters?: Record<string, any>;
   limit: number;
   offset: number;
 }