import { ImageIcon, Link } from 'lucide-react';
import { UpdateAttachment } from '@/types/updates';

interface UpdateAttachmentsProps {
  attachments: UpdateAttachment[];
  onRemove?: (attachmentId: string) => void;
}

export const UpdateAttachments = ({ attachments, onRemove }: UpdateAttachmentsProps) => {
  if (!attachments?.length) return null;

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {attachments.map((attachment) => (
        <div
          key={attachment.id}
          className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 text-white/60 text-sm group"
        >
          {attachment.type === "image" ? (
            <ImageIcon className="h-4 w-4" />
          ) : (
            <Link className="h-4 w-4" />
          )}
          <span>{attachment.name}</span>
          {onRemove && (
            <button
              onClick={() => onRemove(attachment.id)}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              ×
            </button>
          )}
        </div>
      ))}
    </div>
  );
}; 