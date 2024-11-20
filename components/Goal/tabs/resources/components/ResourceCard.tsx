import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { FileIcon, Link2Icon, ExternalLinkIcon, MoreVertical, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card/index';
import { Button } from '@/components/ui/Button/index';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui copy/dropdown-menu';
import { ResourceCardProps } from '../types';
import { useFormattedDate } from '@/hooks/use-formatted-date';

export const ResourceCard = ({
  resource,
  onEdit,
  onDelete,
  onOpen,
}: ResourceCardProps) => {
  const formattedDate = useFormattedDate(resource.updatedAt);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 rounded-lg backdrop-blur-sm bg-white/5 
      border border-white/10 hover:border-white/20 transition-colors`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          {resource.type === "file" ? (
            <FileIcon className="h-10 w-10 text-white/60" />
          ) : (
            <Link2Icon className="h-10 w-10 text-white/60" />
          )}
          <div>
            <h4 className="font-medium text-white group">
              {resource.name}
              <ExternalLinkIcon className="h-4 w-4 inline ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
            </h4>
            {resource.description && (
              <p className="text-sm text-white/60 mt-1">
                {resource.description}
              </p>
            )}
            {resource.tags && (
              <div className="flex flex-wrap gap-2 mt-2">
                {resource.tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="text-xs px-2 py-1 rounded-full bg-white/5 text-white/60"
                    style={{ backgroundColor: `${tag.color}20` }}
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="text-white/60">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-slate-800 border-white/10">
            <DropdownMenuItem onClick={onOpen}>
              Ouvrir
            </DropdownMenuItem>
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

      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-white/40">
            <Clock className="h-4 w-4" />
            {formattedDate}
          </div>
          <div className="flex items-center gap-2">
            {resource.relations.milestoneId && (
              <span className="text-xs px-2 py-1 rounded-full bg-white/5 text-white/60">
                Jalon lié
              </span>
            )}
            {resource.relations.taskId && (
              <span className="text-xs px-2 py-1 rounded-full bg-white/5 text-white/60">
                Tâche liée
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}; 