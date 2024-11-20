"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistance } from "date-fns";
import { fr } from "date-fns/locale";
import {
  MessageSquare,
  Plus,
  Image as ImageIcon,
  Link,
  Smile,
  MoreVertical,
  Clock,
  AtSign,
  Send,
  Users,
  BarChart3,
  Target,
  Bell,
  CheckSquare,
  Flag,
  FileText,
  InboxIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { EventUpdate, ObjectUpdate, Update, UpdateAttachment, UpdateObjectType, User } from "../../../types";
import { EventUpdateCard } from "./updates/EventUpdateCard";
import { ObjectUpdateCard } from "./updates/ObjectUpdateCard";
import EmojiPicker from 'emoji-picker-react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { useMediaQuery } from "@/hooks/use-media-query";


export type SelectedObject = {
  type: UpdateObjectType;
  id: string;
  title: string;
} | undefined;

interface UpdatesTabProps {
  goalDetails: {
    updates: Update[];
    team: User[];
  };
  selectedObject?: SelectedObject;
  onAddUpdate?: (update: Omit<Update, "id" | "createdAt">) => void;
  onAddComment?: (
    updateId: string,
    comment: Omit<Comment, "id" | "createdAt">
  ) => void;
  onRemoveReaction?: (updateId: string, emoji: string) => void;
  onAddAttachment?: (
    updateId: string,
    attachment: Omit<UpdateAttachment, "id">
  ) => void;
  onRemoveAttachment?: (updateId: string, attachmentId: string) => void;
  onAddReaction?: (updateId: string, emoji: string) => void;
  styles?: {
    background?: string;
    text?: string;
  };
}

const NewUpdates: React.FC<UpdatesTabProps> = ({
  goalDetails,
  selectedObject,
  onAddUpdate,
  onAddReaction,
  onRemoveReaction,
  styles,
}) => {
  const [newUpdateContent, setNewUpdateContent] = useState("");
  const [editingUpdate, setEditingUpdate] = useState<Update | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [showMentionSuggestions, setShowMentionSuggestions] = useState(false);
  const [mounted, setMounted] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [selectedFilter, setSelectedFilter] = useState<'all' | UpdateObjectType>('all');
  const [isNewUpdateOpen, setIsNewUpdateOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!goalDetails?.updates || !goalDetails.team) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Les mises à jour ne sont pas disponibles pour le moment.
        </AlertDescription>
      </Alert>
    );
  }

  // Updated filteredUpdates logic
  const filteredUpdates = useMemo(() => {
    let updates = goalDetails.updates;

    if (selectedObject) {
      updates = updates.filter((update) => {
        if (update.type === "event") return false;
        return (
          update.type === selectedObject.type &&
          update.objectId === selectedObject.id
        );
      });
    } else if (selectedFilter !== 'all') {
      updates = updates.filter(update => update.type === selectedFilter);
    }

    return updates.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [goalDetails.updates, selectedObject, selectedFilter]);

  // Add updateStats calculation
  const updateStats = useMemo(() => ({
    all: goalDetails.updates.length,
    task: goalDetails.updates.filter(u => u.type === 'task').length,
    milestone: goalDetails.updates.filter(u => u.type === 'milestone').length,
    resource: goalDetails.updates.filter(u => u.type === 'resource').length,
    event: goalDetails.updates.filter(u => u.type === 'event').length,
  }), [goalDetails.updates]);

  const handleSubmitUpdate = () => {
    if (!newUpdateContent.trim()) return;

    const newUpdate = {
      content: newUpdateContent,
      type: selectedObject?.type || 'comment',
      objectId: selectedObject?.id,
      objectTitle: selectedObject?.title,
      reactions: [],
      comments: [],
    };

    // onAddUpdate?.(newUpdate);
    setNewUpdateContent("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "@") {
      setShowMentionSuggestions(true);
      setMentionQuery("");
    }
  };

  const handleMentionSelect = (user: User) => {
    if (textareaRef.current) {
      const currentContent = textareaRef.current.value;
      const lastAtIndex = currentContent.lastIndexOf("@");
      const newContent =
        currentContent.substring(0, lastAtIndex) +
        `@${user.name} ` +
        currentContent.substring(lastAtIndex + mentionQuery.length + 1);
      setNewUpdateContent(newContent);
    }
    setShowMentionSuggestions(false);
  };

  const filteredTeamMembers = goalDetails.team.filter((member) =>
    member.name.toLowerCase().includes(mentionQuery.toLowerCase())
  );

  const UpdateForm = () => (
    <div className="space-y-4">
      <Textarea
        ref={textareaRef}
        placeholder="Partagez une mise à jour..."
        value={newUpdateContent}
        onChange={(e) => setNewUpdateContent(e.target.value)}
        onKeyDown={handleKeyPress}
        className="bg-transparent border-none resize-none text-white placeholder:text-white/40 focus-visible:ring-0"
        rows={4}
      />
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-white/60 hover:text-white hover:bg-white/10"
          >
            <ImageIcon className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-white/60 hover:text-white hover:bg-white/10"
          >
            <Link className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-white/60 hover:text-white hover:bg-white/10"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            <Smile className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-white/60 hover:text-white hover:bg-white/10"
            onClick={() => setShowMentionSuggestions(true)}
          >
            <AtSign className="h-5 w-5" />
          </Button>
        </div>
        <Button
          onClick={() => {
            handleSubmitUpdate();
            setIsNewUpdateOpen(false);
          }}
          className="bg-white/10 hover:bg-white/20 text-white"
        >
          <Send className="h-4 w-4 mr-2" />
          Publier
        </Button>
      </div>
    </div>
  );

  const renderObjectUpdate = (update: ObjectUpdate) => (
    <Card key={update.id} className="bg-white/5 border-white/10">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <img
            src={update.author.avatar}
            alt={update.author.name}
            className="w-8 h-8 rounded-full"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-white">
                {update.author.name}
              </span>
              <span className="text-white/40 text-sm">
                {formatDistance(new Date(update.createdAt), new Date(), {
                  addSuffix: true,
                  locale: fr,
                })}
              </span>
            </div>

            {!selectedObject && (
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    update.type === "task"
                      ? "bg-blue-500/20 text-blue-400"
                      : update.type === "milestone"
                      ? "bg-purple-500/20 text-purple-400"
                      : "bg-emerald-500/20 text-emerald-400"
                  }`}
                >
                  {update.objectTitle}
                </span>
              </div>
            )}

            <p className="text-white/80 whitespace-pre-wrap">
              {update.content}
            </p>

            {/* Réactions */}
            {update.reactions && update.reactions.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {update.reactions.map((reaction, index) => (
                  <button
                    key={index}
                    className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/5 hover:bg-white/10"
                    onClick={() => onAddReaction?.(update.id, reaction.emoji)}
                  >
                    <span>{reaction.emoji}</span>
                    <span className="text-sm text-white/60">
                      {reaction.users.length}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Commentaires */}
            {update.comments && update.comments.length > 0 && (
              <div className="mt-4 space-y-3 pl-4 border-l border-white/10">
                {update.comments.map((comment) => (
                  <div key={comment.id} className="space-y-1">
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
                        {formatDistance(
                          new Date(comment.createdAt),
                          new Date(),
                          {
                            addSuffix: true,
                            locale: fr,
                          }
                        )}
                      </span>
                    </div>
                    <p className="text-sm text-white/80">{comment.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* New Update Input */}
      {isDesktop ? (
        <Dialog open={isNewUpdateOpen} onOpenChange={setIsNewUpdateOpen}>
          <DialogContent className="sm:max-w-[425px] bg-gray-900 border-white/10">
            <div className="p-4">
              <h2 className="text-xl font-semibold text-white mb-4">Nouvelle mise à jour</h2>
              <UpdateForm />
            </div>
          </DialogContent>
        </Dialog>
      ) : (
        <Drawer open={isNewUpdateOpen} onOpenChange={setIsNewUpdateOpen}>
          <DrawerContent className="bg-gray-900 border-t border-white/10">
            <div className="p-4">
              <h2 className="text-xl font-semibold text-white mb-4">Nouvelle mise à jour</h2>
              <UpdateForm />
            </div>
          </DrawerContent>
        </Drawer>
      )}

      {/* Updated header with filters */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-white">
            {selectedObject
              ? `Historique - ${selectedObject.title}`
              : "Fil d'actualité"}
          </h3>
          <Button
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2
          ${styles?.background || 'bg-white/10'} ${styles?.text || 'text-white'}`}
            onClick={() => setIsNewUpdateOpen(true)}
          >
            <MessageSquare className="h-4 w-4" />
            <span>Nouvelle mise à jour</span>
          </Button>
        </div>

        {!selectedObject && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <Button
              variant="ghost"
              size="sm"
              className={`rounded-full px-4 ${
                selectedFilter === "all"
                  ? "bg-white/10 text-white"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
              onClick={() => setSelectedFilter("all")}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Tout
              <span className="ml-2 text-xs bg-white/10 px-2 py-0.5 rounded-full">
                {updateStats.all}
              </span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`rounded-full px-4 ${
                selectedFilter === "task"
                  ? "bg-white/10 text-white"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
              onClick={() => setSelectedFilter("task")}
            >
              <CheckSquare className="h-4 w-4 mr-2" />
              Tâches
              <span className="ml-2 text-xs bg-white/10 px-2 py-0.5 rounded-full">
                {updateStats.task}
              </span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`rounded-full px-4 ${
                selectedFilter === "milestone"
                  ? "bg-white/10 text-white"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
              onClick={() => setSelectedFilter("milestone")}
            >
              <Flag className="h-4 w-4 mr-2" />
              Jalons
              <span className="ml-2 text-xs bg-white/10 px-2 py-0.5 rounded-full">
                {updateStats.milestone}
              </span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`rounded-full px-4 ${
                selectedFilter === "resource"
                  ? "bg-white/10 text-white"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
              onClick={() => setSelectedFilter("resource")}
            >
              <FileText className="h-4 w-4 mr-2" />
              Ressources
              <span className="ml-2 text-xs bg-white/10 px-2 py-0.5 rounded-full">
                {updateStats.resource}
              </span>
            </Button>
          </div>
        )}
      </div>

      {/* Updated timeline with empty state */}
      <AnimatePresence mode="popLayout">
        <div className="space-y-4">
          {filteredUpdates.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-12 text-white/60"
            >
              <InboxIcon className="h-12 w-12 mb-4" />
              <p className="text-lg">Aucune mise à jour à afficher</p>
              <p className="text-sm">
                {selectedObject
                  ? "Cet élément n'a pas encore d'historique"
                  : "Utilisez les filtres ci-dessus pour afficher les mises à jour"}
              </p>
            </motion.div>
          ) : (
            filteredUpdates.map((update) =>
              update.type === "event" ? (
                <motion.div
                  key={update.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <EventUpdateCard update={update} />
                </motion.div>
              ) : (
                <motion.div
                  key={update.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <ObjectUpdateCard
                    update={update}
                    selectedObject={selectedObject}
                    onAddReaction={onAddReaction}
                  />
                </motion.div>
              )
            )
          )}
        </div>
      </AnimatePresence>

      {/* Add Emoji Picker */}
      {showEmojiPicker && (
        <div className="absolute z-50 mt-2">
          <EmojiPicker
            onEmojiClick={(emojiData) => {
              setNewUpdateContent((prev) => prev + emojiData.emoji);
              setShowEmojiPicker(false);
            }}
          />
        </div>
      )}

      {/* Add Mention Suggestions */}
      {showMentionSuggestions && (
        <div className="absolute z-50 mt-2 w-64 bg-white/10 backdrop-blur-lg rounded-lg border border-white/10 shadow-lg">
          <div className="p-2 space-y-1">
            {filteredTeamMembers.map((member) => (
              <button
                key={member.id}
                className="w-full text-left px-3 py-2 hover:bg-white/10 rounded-md flex items-center gap-2"
                onClick={() => handleMentionSelect(member)}
              >
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-6 h-6 rounded-full"
                />
                <span className="text-white">{member.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NewUpdates;
