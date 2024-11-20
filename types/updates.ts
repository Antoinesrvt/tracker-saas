import { User } from "@supabase/supabase-js";

 export interface Mention {
   userId: string;
   username: string;
   startIndex: number;
   endIndex: number;
 }

 export interface Reaction {
   emoji: string;
   count: number;
   users: string[]; // User IDs who reacted
 }

 export interface Comment {
   id: string;
   content: string;
   author: User;
   createdAt: string;
   editedAt?: string;
   mentions?: Mention[];
   reactions?: Reaction[];
 }

 export interface UpdateAttachment {
   id: string;
   type: "image" | "file" | "link";
   url: string;
   name: string;
   size?: number;
   mimeType?: string;
   thumbnail?: string;
 }

 export type UpdateObjectType =
   | "comment"
   | "milestone"
   | "task"
   | "resource"
   | "event";

 export interface BaseUpdate {
   id: string;
   content: string;
   createdAt: string;
   author: User;
   mentions?: Mention[];
   reactions?: Reaction[];
   comments?: Comment[];
   attachments?: UpdateAttachment[];
   edited?: boolean;
   editedAt?: string;
   editedBy?: string;
 }

 export interface ObjectUpdate extends BaseUpdate {
   type: Exclude<UpdateObjectType, "event">;
   objectId: string;
   objectTitle: string;
   objectIcon?: string;
 }

 export interface EventUpdate extends BaseUpdate {
   type: "event";
   eventType: "team_update" | "metrics_change" | "goal_update";
   metadata: {
     previous?: any;
     current?: any;
     action?: string;
   };
 }

 export type Update = ObjectUpdate | EventUpdate;