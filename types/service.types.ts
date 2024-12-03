 import { Database } from 'types_db';

 // Service Response Types
 export interface ServiceResponse<T> {
   data: T | null;
   error: Error | null;
 }

 // Team Access Types
 export interface TeamAccess {
   role: 'owner' | 'admin' | 'member' | 'viewer';
   resourceType: 'organization' | 'workspace' | 'goal' | 'task';
   resourceId: string;
 }

 // Service Context
 export interface ServiceContext {
   userId: string;
   teamAccess: TeamAccess[];
 }

 // Database Types
 export type Tables = Database['public']['Tables'];
 export type Goal = Tables['goals']['Row'];
 export type Task = Tables['tasks']['Row'];
 export type Workspace = Tables['workspaces']['Row'];
 export type Organization = Tables['organizations']['Row'];
 export type Milestone = Tables['milestones']['Row'];
