import { Comment } from '@/types/updates';
import { useFormattedDate } from '@/hooks/use-formatted-date';
import { Button } from '@/components/ui/Button/index';
import { Input } from '@/components/ui/Input/index';
import { useState } from 'react';

interface UpdateCommentsProps {
  comments: Comment[];
  onAddComment: (content: string) => void;
}

export const UpdateComments = ({ comments, onAddComment }: UpdateCommentsProps) => {
  const [newComment, setNewComment] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      onAddComment(newComment);
      setNewComment('');
    }
  };

  return (
    <div className="mt-4 space-y-3 pl-4 border-l border-white/10">
      {comments.map((comment) => (
        <CommentItem key={comment.id} comment={comment} />
      ))}
      
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Ajouter un commentaire..."
          className="flex-1 bg-white/5 border-white/10 text-white"
        />
        <Button 
          type="submit" 
          variant="ghost"
          className="text-white/60 hover:text-white hover:bg-white/10"
        >
          Envoyer
        </Button>
      </form>
    </div>
  );
};

const CommentItem = ({ comment }: { comment: Comment }) => {
  const formattedDate = useFormattedDate(comment.createdAt);

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <img
          src={comment.author.avatar}
          alt={comment.author.name}
          className="w-6 h-6 rounded-full"
        />
        <span className="font-medium text-sm text-white">
          {comment.author.name}
        </span>
        <span className="text-white/40 text-xs">
          {formattedDate}
        </span>
      </div>
      <p className="text-sm text-white/80">{comment.content}</p>
    </div>
  );
}; 