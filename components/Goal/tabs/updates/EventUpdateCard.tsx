import { Users, BarChart3, Target } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card/index';
import { EventUpdateCardProps } from './types';
import { UpdateAttachments } from './components/UpdateAttachments';
import { UpdateReactions } from './components/UpdateReactions';
import { useFormattedDate } from '@/hooks/use-formatted-date';

export const EventUpdateCard = ({ 
  update,
  onAddReaction,
  onDeleteUpdate 
}: EventUpdateCardProps) => {
  const formattedDate = useFormattedDate(update.createdAt);

  const getEventIcon = () => {
    switch (update.eventType) {
      case "team_update":
        return <Users className="h-4 w-4 text-white/60" />;
      case "metrics_change":
        return <BarChart3 className="h-4 w-4 text-white/60" />;
      case "goal_update":
        return <Target className="h-4 w-4 text-white/60" />;
    }
  };

  return (
    <Card className="bg-white/5 border-white/10">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
            {getEventIcon()}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-medium text-white">
                {update.author.name}
              </span>
              <span className="text-white/40 text-sm">
                {formattedDate}
              </span>
            </div>
            <p className="text-white/80">{update.content}</p>

            <UpdateAttachments attachments={update.attachments || []} />
            
            {update.reactions && (
              <UpdateReactions
                reactions={update.reactions}
                onAddReaction={(emoji) => onAddReaction?.(update.id, emoji)}
              />
            )}

            {update.metadata && (
              <div className="mt-2 p-2 rounded bg-white/5">
                {/* Render metadata based on event type */}
                {/* This could be extracted to a separate component if needed */}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 