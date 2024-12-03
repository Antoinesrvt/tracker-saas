import { Database } from 'types_db'

// Export convenience types
export type Tables<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> = 
  Database['public']['Enums'][T]


// Table types
export type Organization = Tables<'organizations'>
export type Workspace = Tables<'workspaces'>
export type Goal = Tables<'goals'>
export type Task = Tables<'tasks'>
export type TeamAssignment = Tables<'team_assignments'>

// Enum types
export type GoalStatus = Enums<'goal_status'>
export type TaskPriority = Enums<'task_priority'>
export type TeamRole = Enums<'team_role'> 