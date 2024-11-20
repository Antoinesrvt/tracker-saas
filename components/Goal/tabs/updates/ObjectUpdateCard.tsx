import { Card, CardContent } from '@/components/ui/Card/index';
import { formatDistance } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ObjectUpdateCardProps } from './types';
import { UpdateAttachments } from './components/UpdateAttachments';
import { UpdateReactions } from './components/UpdateReactions';
import { UpdateComments } from './components/UpdateComments';
import { useFormattedDate } from '@/hooks/use-formatted-date';

export const ObjectUpdateCard = ({ 
  update,
  selectedObject,
  onAddReaction,
  onAddComment,
  onDeleteUpdate 
}: ObjectUpdateCardProps) => {
  const formattedDate = useFormattedDate(update.createdAt);

  const getTypeStyles = () => {
    switch (update.type) {
      case "task":
        return "bg-blue-500/20 text-blue-400";
      case "milestone":
        return "bg-purple-500/20 text-purple-400";
      case "resource":
        return "bg-emerald-500/20 text-emerald-400";
      default:
        return "bg-white/10 text-white/60";
    }
  };

  return (
    <Card className="bg-white/5 border-white/10">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <img
            src={update.author.avatar}
            alt={update.author.name}
            className="w-8 h-8 rounded-full"
          />
          <div className="flex-1">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <span className="font-medium text-white">
                  {update.author.name}
                </span>
                <span className="text-white/40 text-sm">
                  {formattedDate}
                </span>
              </div>
              {!selectedObject && (
                <span className={`text-xs px-2 py-1 rounded-full ${getTypeStyles()}`}>
                  {update.objectTitle}
                </span>
              )}
            </div>

            <p className="text-white/80 whitespace-pre-wrap">
              {update.content}
            </p>

            <UpdateAttachments attachments={update.attachments || []} />
            
            {update.reactions && (
              <UpdateReactions
                reactions={update.reactions}
                onAddReaction={(emoji) => onAddReaction?.(update.id, emoji)}
              />
            )}

            {update.comments && (
              <UpdateComments
                comments={update.comments}
                onAddComment={(content) => onAddComment?.(update.id, content)}
              />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 