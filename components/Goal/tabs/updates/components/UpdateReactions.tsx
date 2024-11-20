import { Reaction } from '@/types/updates';

interface UpdateReactionsProps {
  reactions: Reaction[];
  onAddReaction: (emoji: string) => void;
}

export const UpdateReactions = ({ reactions, onAddReaction }: UpdateReactionsProps) => {
  if (!reactions?.length) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {reactions.map((reaction, index) => (
        <button
          key={index}
          className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/5 hover:bg-white/10"
          onClick={() => onAddReaction(reaction.emoji)}
        >
          <span>{reaction.emoji}</span>
          <span className="text-sm text-white/60">
            {reaction.users.length}
          </span>
        </button>
      ))}
    </div>
  );
}; 