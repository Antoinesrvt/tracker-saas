// TaskCard.tsx
import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Card, CardContent } from "@/components/ui/Card/index";
import { Progress } from "@/components/ui copy/progress";
import {
  MoreVertical,
  Clock,
  CheckSquare,
  AlertCircle,
  GripVertical,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui copy/dropdown-menu";
import { Task } from "@/app/dashboard/types";

interface TaskCardProps {
  task: Task;
  onEdit: () => void;
  onStatusChange: (status: Task["status"]) => void;
  onDelete: () => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onEdit,
  onStatusChange,
  onDelete,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const completedSubtasks = task.subtasks.filter((st) => st.completed).length;
  const completedChecklist = task.checklist.filter(
    (item) => item.completed
  ).length;
  const totalProgress =
    ((completedSubtasks + completedChecklist) /
      (task.subtasks.length + task.checklist.length)) *
    100;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`bg-white/5 border-white/10 ${
        isDragging ? "cursor-grabbing" : "cursor-grab"
      }`}
    >
      <CardContent className="p-4">
        {/* Handle pour le drag & drop */}
        <div
          {...attributes}
          {...listeners}
          className="absolute top-4 right-4 cursor-grab hover:text-white/80"
        >
          <GripVertical className="h-4 w-4 text-white/40" />
        </div>

        {/* En-tête de la carte */}
        <div className="flex items-start gap-3 mb-3">
          <button
            onClick={() =>
              onStatusChange(task.status === "completed" ? "todo" : "completed")
            }
            className="mt-1"
          >
            {task.status === "completed" ? (
              <CheckSquare className="h-5 w-5 text-green-400" />
            ) : (
              <div className="w-5 h-5 rounded-full border-2 border-white/20" />
            )}
          </button>

          <div className="flex-1">
            <div className="flex items-start justify-between">
              <span
                className={`text-white ${
                  task.status === "completed"
                    ? "line-through text-white/40"
                    : ""
                }`}
              >
                {task.title}
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="hover:bg-white/10 p-1 rounded">
                    <MoreVertical className="h-4 w-4 text-white/40" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-slate-800 border-white/10 text-white/40">
                  <DropdownMenuItem onClick={onEdit}>Modifier</DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onStatusChange("todo")}
                    disabled={task.status === "todo"}
                  >
                    Déplacer vers À faire
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onStatusChange("in_progress")}
                    disabled={task.status === "in_progress"}
                  >
                    Déplacer vers En cours
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onStatusChange("completed")}
                    disabled={task.status === "completed"}
                  >
                    Marquer comme terminée
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onDelete} className="text-red-400">
                    Supprimer
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {task.description && (
              <p className="text-sm text-white/60 mt-1 line-clamp-2">
                {task.description}
              </p>
            )}
          </div>
        </div>

        {/* Méta-informations */}
        <div className="flex flex-wrap gap-2 mb-3">
          {task.priority && (
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                task.priority === "high"
                  ? "bg-red-500/20 text-red-400"
                  : task.priority === "medium"
                  ? "bg-yellow-500/20 text-yellow-400"
                  : "bg-blue-500/20 text-blue-400"
              }`}
            >
              {task.priority === "high"
                ? "Haute"
                : task.priority === "medium"
                ? "Moyenne"
                : "Basse"}
            </span>
          )}

          {task.recurring && (
            <span className="text-xs px-2 py-1 rounded-full bg-purple-500/20 text-purple-400">
              {task.recurring.frequency === "daily"
                ? "Quotidien"
                : task.recurring.frequency === "weekly"
                ? "Hebdomadaire"
                : "Mensuel"}
            </span>
          )}

          {task.estimatedTime && (
            <span className="text-xs px-2 py-1 rounded-full bg-white/10 text-white/60 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {task.estimatedTime}h
            </span>
          )}
        </div>

        {/* Progression */}
        {(task.subtasks.length > 0 || task.checklist.length > 0) && (
          <div className="space-y-2 mb-3">
            <div className="flex justify-between text-xs text-white/40">
              <span>Progression</span>
              <span>
                {completedSubtasks + completedChecklist}/
                {task.subtasks.length + task.checklist.length}
              </span>
            </div>
            <Progress value={totalProgress} className="h-1" />
          </div>
        )}

        {/* Pied de carte */}
        <div className="flex justify-between items-center mt-4">
          <div className="flex items-center gap-2">
            {task.assignees.length > 0 && (
              <div className="flex -space-x-2">
                {task.assignees.map((assignee) => (
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

          <div className="flex items-center gap-2 text-sm">
            {task.deadline && (
              <span
                className={`text-white/40 ${
                  isOverdue(task.deadline) && task.status !== "completed"
                    ? "text-red-400"
                    : ""
                }`}
              >
                {format(new Date(task.deadline), "dd MMM", { locale: fr })}
              </span>
            )}
            {task.alert && <AlertCircle className="h-4 w-4 text-red-400" />}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Utilitaire pour vérifier si la date est dépassée
const isOverdue = (date: string): boolean => {
  return new Date(date) < new Date();
};
