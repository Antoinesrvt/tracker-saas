import { Update } from '@/types/updates';
import { formatDistance } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Card, CardContent } from '@/components/ui/card';

interface UpdateCardProps {
  update: Update;
}

export const UpdateCard = ({ update }: UpdateCardProps) => {
  const renderUpdateContent = () => {
    switch (update.type) {
      case 'comment':
        return (
          <p className="text-white/80">
            {update.content}
          </p>
        );
      case 'status_change':
        return (
          <p className="text-white/80">
            Status changed from {update.metadata.previous_status} to {update.metadata.new_status}
          </p>
        );
      case 'progress_update':
        return (
          <p className="text-white/80">
            Progress updated from {update.metadata.previous_progress}% to {update.metadata.new_progress}%
          </p>
        );
      case 'assignment':
        const { assigned_user } = update.metadata;
        return (
          <p className="text-white/80">
            {assigned_user?.name} was {assigned_user?.action} to this {update.object_type}
          </p>
        );
    }
  };

  return (
    <Card className="bg-white/5 border-white/10">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <img
            src={update.author.avatar_url ?? ''}
            alt={update.author.full_name ?? ''}
            className="w-8 h-8 rounded-full"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-white">
                {update.author.full_name}
              </span>
              <span className="text-white/40 text-sm">
                {formatDistance(new Date(update.created_at), new Date(), {
                  addSuffix: true,
                  locale: fr,
                })}
              </span>
            </div>
            
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs px-2 py-1 rounded-full bg-white/10">
                {update.metadata.object_name}
              </span>
            </div>

            {renderUpdateContent()}

            {/* Reuse existing UpdateComments and UpdateReactions components */}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 