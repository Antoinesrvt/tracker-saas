import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Check, MoreVertical } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card/index';
import { Button } from '@/components/ui/Button/index';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui copy/dropdown-menu';
import { MilestoneCardProps } from '../types';

export const MilestoneCard = ({
  milestone,
  onToggleComplete,
  onEdit,
  onDelete,
  onClick,
  style,
}: MilestoneCardProps) => {
  const getMilestoneStatus = () => {
    if (milestone.completed) {
      return {
        text: "Complété",
        className: "bg-green-500/20 text-green-400",
      };
    }
    if (new Date(milestone.date) < new Date()) {
      return {
        text: "En retard",
        className: "bg-red-500/20 text-red-400",
      };
    }
    if (milestone.tasksCount === milestone.completedTasksCount) {
      return {
        text: "Prêt",
        className: "bg-blue-500/20 text-blue-400",
      };
    }
    return {
      text: "En cours",
      className: "bg-white/10 text-white/60",
    };
  };

  const status = getMilestoneStatus();

  return (
    <div className="relative w-[300px] flex-shrink-0" style={style}>
      {/* Ligne verticale de connexion */}
      <div className="absolute top-0 left-1/2 h-8 w-px bg-white/10 -translate-x-1/2" />

      {/* Point du jalon */}
      <motion.div
        className={`relative z-10 w-6 h-6 mx-auto mb-4 rounded-full border-4 
        cursor-pointer transition-transform hover:scale-110 group`}
        style={{
          backgroundColor: milestone.completed
            ? "rgb(74 222 128)"
            : "rgb(255 255 255 / 0.1)",
          borderColor: "rgb(30 41 59)",
        }}
        onClick={onToggleComplete}
        whileHover={{ scale: 1.2 }}
      >
        {milestone.completed && (
          <Check className="h-3 w-3 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        )}
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          <div className="bg-slate-800 text-white text-xs px-2 py-1 rounded">
            Cliquer pour marquer comme{" "}
            {milestone.completed ? "incomplet" : "complet"}
          </div>
        </div>
      </motion.div>

      {/* Contenu du jalon */}
      <Card 
        className="bg-white/5 border-white/10 cursor-pointer group/card"
        onClick={onClick}
      >
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-2">
            <div className={`text-sm px-2 py-1 rounded-full ${status.className}`}>
              {status.text}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="opacity-0 group-hover/card:opacity-100 transition-opacity"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-slate-800 border-white/10">
                <DropdownMenuItem onClick={onEdit}>
                  Modifier
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={onDelete}
                  className="text-red-400"
                >
                  Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <h4 className="font-medium text-white mb-2">{milestone.title}</h4>
          
          {milestone.description && (
            <p className="text-sm text-white/60 mb-2">{milestone.description}</p>
          )}

          <div className="flex items-center justify-between text-sm text-white/60">
            <span>
              {format(new Date(milestone.date), "d MMMM yyyy", {
                locale: fr,
              })}
            </span>
            {milestone.assignees && milestone.assignees.length > 0 && (
              <div className="flex -space-x-2">
                {milestone.assignees.map((assignee) => (
                  <img
                    key={assignee.id}
                    src={assignee.avatar}
                    alt={assignee.name}
                    className="w-6 h-6 rounded-full border-2 border-slate-800"
                    title={assignee.name}
                  />
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 