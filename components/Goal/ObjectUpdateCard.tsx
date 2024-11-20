import React from 'react'
import { Card, CardContent } from '@/components/ui/Card/index';
import { formatDistance } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ObjectUpdate } from '../../../../app/tracker/types';

import { SelectedObject } from '../Updates';

type ObjectUpdateCardProps = {  
  update: ObjectUpdate;
  selectedObject?: SelectedObject;
  onAddReaction?: (updateId: string, emoji: string) => void;
};

function ObjectUpdateCard({ update, selectedObject, onAddReaction }: ObjectUpdateCardProps) {


  return (
    <Card key={update.id} className="bg-white/5 border-white/10">
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
                  {formatDistance(new Date(update.createdAt), new Date(), {
                    addSuffix: true,
                    locale: fr,
                  })}
                </span>
              </div>
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
}

export default ObjectUpdateCard



      // <AnimatePresence>
        
      //     <motion.div
      //       initial={{ opacity: 0, y: 10 }}
      //       animate={{ opacity: 1, y: 0 }}
      //       exit={{ opacity: 0, y: 10 }}
      //       className="absolute bottom-full left-0 w-64 bg-slate-800 border border-white/10 rounded-lg shadow-xl overflow-hidden"
      //     >
      //       {filteredTeamMembers.map((member) => (
      //         <button
      //           key={member.id}
      //           onClick={() => handleMentionSelect(member)}
      //           className="w-full px-4 py-2 text-left hover:bg-white/10 text-white/80 hover:text-white"
      //         >
      //           {member.name}
      //         </button>
      //       ))}
      //     </motion.div>
       
      // </AnimatePresence>