import { BarChart3, ImageIcon, Link, Target } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card/index';
import { Users } from 'lucide-react';
import React from 'react'
import { fr } from 'date-fns/locale';
import { formatDistance } from 'date-fns';
import { useState, useEffect } from 'react';
import { EventUpdate } from '../../../../app/tracker/types';


const EventUpdateCard = ({ update }: { update: EventUpdate }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, [])
  return (
    <Card key={update.id} className="bg-white/5 border-white/10">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
            {update.eventType === "team_update" ? (
              <Users className="h-4 w-4 text-white/60" />
            ) : update.eventType === "metrics_change" ? (
              <BarChart3 className="h-4 w-4 text-white/60" />
            ) : (
              <Target className="h-4 w-4 text-white/60" />
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-medium text-white">
                {update.author.name}
              </span>
              <span className="text-white/40 text-sm">
                {mounted ? (
                  formatDistance(new Date(update.createdAt), new Date(), {
                    addSuffix: true,
                    locale: fr,
                  })
                ) : (
                  <span>Chargement...</span>
                )}
              </span>
            </div>
            <p className="text-white/80">{update.content}</p>

            {update.attachments && update.attachments.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {update.attachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 text-white/60 text-sm"
                  >
                    {attachment.type === "image" ? (
                      <ImageIcon className="h-4 w-4" />
                    ) : (
                      <Link className="h-4 w-4" />
                    )}
                    {attachment.name}
                  </div>
                ))}
              </div>
            )}
            {update.metadata && (
              <div className="mt-2 p-2 rounded bg-white/5">
                {/* Rendu personnalisé selon le type d'événement */}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default EventUpdateCard;