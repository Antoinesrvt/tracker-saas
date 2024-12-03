import { Plus } from 'lucide-react';
import { TeamSectionProps } from '../types';
import { useGoalContext } from '@/contexts/GoalContext';

export const TeamSection = ({ team, assignees, onAddMember }: TeamSectionProps) => {
  // Get team from goal
  const { teams } = useGoalContext();

  // Get user profile from teams's user_id

  return (
    <div>
      <h4 className="text-white/60 mb-2">Équipe</h4>
      <div className="flex -space-x-2">
        {teams?.map((user) => (
          <img
            key={user.id}
            src={user.avatar}
            alt={user.name}
            className="w-8 h-8 rounded-full border-2 border-slate-900"
            title={user.name}
          />
        ))}
        <button 
          className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
          onClick={onAddMember}
        >
          <Plus className="h-4 w-4 text-white/60" />
        </button>
      </div>
    </div>
  );
}; 