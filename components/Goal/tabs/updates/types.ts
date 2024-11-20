import {
  Update,
  ObjectUpdate,
  EventUpdate,
  UpdateAttachment,
  Comment,
} from "@/types/updates";
import { TypeStyles } from "@/types/goals";
import { User } from "@/types/common";

export type SelectedObject =
  | {
      type: Update["type"];
      id: string;
      title: string;
    }
  | undefined;

export interface BaseUpdateCardProps {
  onAddReaction?: (updateId: string, emoji: string) => void;
  onAddComment?: (updateId: string, content: string) => void;
  onDeleteUpdate?: (updateId: string) => void;
}

export interface EventUpdateCardProps extends BaseUpdateCardProps {
  update: EventUpdate;
}

export interface ObjectUpdateCardProps extends BaseUpdateCardProps {
  update: ObjectUpdate;
  selectedObject?: SelectedObject;
}

export interface UpdatesTabProps {
  goalDetails: {
    updates: Update[];
    team: User[];
    updateSettings?: {
      allowComments: boolean;
      allowReactions: boolean;
      allowAttachments: boolean;
      allowMentions: boolean;
    };
  };
  selectedObject?: SelectedObject;
  onAddUpdate?: (update: Omit<Update, "id" | "createdAt">) => void;
  onAddComment?: (updateId: string, comment: Omit<Comment, "id" | "createdAt">) => void;
  onRemoveReaction?: (updateId: string, emoji: string) => void;
  onAddAttachment?: (updateId: string, attachment: Omit<UpdateAttachment, "id">) => void;
  onRemoveAttachment?: (updateId: string, attachmentId: string) => void;
  onAddReaction?: (updateId: string, emoji: string) => void;
  styles?: TypeStyles;
}