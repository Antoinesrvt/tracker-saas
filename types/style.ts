import type { Database } from "@/types_db";
type GoalType = Database['public']['Enums']['goal_type'];

export interface TypeStyles {
  background: string;
  border: string;
  text: string;
  shadow: string;
  glow: string;
  connection: string;
  progress: string;
}


export const typeStyles: Record<GoalType, TypeStyles> = {
  fondation: {
    background: 'bg-purple-500/10',
    border: 'border-purple-400/20',
    text: 'text-purple-100',
    shadow: 'shadow-purple-500/20',
    glow: 'after:bg-purple-500/5',
    connection: 'stroke-purple-400/30',
    progress: 'bg-purple-400/50'
  },
  action: {
    background: 'bg-blue-500/10',
    border: 'border-blue-400/20',
    text: 'text-blue-100',
    shadow: 'shadow-blue-500/20',
    glow: 'after:bg-blue-500/5',
    connection: 'stroke-blue-400/30',
    progress: 'bg-blue-400/50'
  },
  strategie: {
    background: 'bg-emerald-500/10',
    border: 'border-emerald-400/20',
    text: 'text-emerald-100',
    shadow: 'shadow-emerald-500/20',
    glow: 'after:bg-emerald-500/5',
    connection: 'stroke-emerald-400/30',
    progress: 'bg-emerald-400/50'
  },
  vision: {
    background: 'bg-amber-500/10',
    border: 'border-amber-400/20',
    text: 'text-amber-100',
    shadow: 'shadow-amber-500/20',
    glow: 'after:bg-amber-500/5',
    connection: 'stroke-amber-400/30',
    progress: 'bg-amber-400/50'
  }
};
