import React, { useMemo, useState } from "react";
import { Task } from "@/app/dashboard/types";
import { Card } from "@/components/ui/Card/index";
import { Button } from "@/components/ui/Button/index";
import {
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Clock,
  Users,
  CheckCircle2,
} from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
  parseISO,
} from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui copy/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui copy/avatar";

interface CalendarViewProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

interface TaskWithDate extends Task {
  date: Date;
}

const priorityColors = {
  high: "bg-red-500/20 text-red-400",
  medium: "bg-yellow-500/20 text-yellow-400",
  low: "bg-blue-500/20 text-blue-400",
};

const statusColors = {
  todo: "bg-slate-500/20",
  in_progress: "bg-blue-500/20",
  completed: "bg-green-500/20",
};

export const CalendarView: React.FC<CalendarViewProps> = ({
  tasks,
  onTaskClick,
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Get all days in current month
  const daysInMonth = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  // Group tasks by date
  const tasksByDate = useMemo(() => {
    const grouped = new Map<string, TaskWithDate[]>();

    tasks.forEach((task) => {
      if (task.deadline) {
        const date = parseISO(task.deadline);
        const dateKey = format(date, "yyyy-MM-dd");

        if (!grouped.has(dateKey)) {
          grouped.set(dateKey, []);
        }
        grouped.get(dateKey)?.push({ ...task, date });
      }
    });

    return grouped;
  }, [tasks]);

  // Calendar navigation
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const previousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  // Render task preview
  const TaskPreview: React.FC<{ task: Task }> = ({ task }) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              "px-2 py-1 rounded-md text-sm mb-1 cursor-pointer transition-colors",
              statusColors[task.status],
              "hover:opacity-80"
            )}
            onClick={() => onTaskClick(task)}
          >
            <div className="flex items-center gap-1">
              <span className="truncate flex-1">{task.title}</span>
              {task.priority === "high" && (
                <AlertCircle className="h-3 w-3 text-red-400" />
              )}
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="right" className="bg-slate-800 border-white/10">
          <div className="space-y-2 p-1">
            <div className="font-medium">{task.title}</div>
            {task.description && (
              <div className="text-sm text-white/60">{task.description}</div>
            )}
            <div className="flex items-center gap-4 text-sm text-white/60">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{task.estimatedTime}h</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                <div className="flex -space-x-2">
                  {task.assignees.map((assignee) => (
                    <Avatar
                      key={assignee.id}
                      className="h-4 w-4 border border-slate-800"
                    >
                      <AvatarImage src={assignee.avatar} alt={assignee.name} />
                      <AvatarFallback className="text-[8px]">
                        {assignee.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                </div>
              </div>
              <div
                className={cn(
                  "px-2 py-0.5 rounded-full text-xs",
                  priorityColors[task.priority]
                )}
              >
                {task.priority}
              </div>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <Card className="bg-white/5 border-white/10">
      <div className="p-4">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">
            {format(currentMonth, "MMMM yyyy", { locale: fr })}
          </h2>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              className="bg-white/5 hover:bg-white/10 border-white/10"
              onClick={previousMonth}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="bg-white/5 hover:bg-white/10 border-white/10"
              onClick={nextMonth}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Weekday headers */}
          {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((day) => (
            <div
              key={day}
              className="text-center text-sm font-medium text-white/60 pb-2"
            >
              {day}
            </div>
          ))}

          {/* Calendar days */}
          {daysInMonth.map((date, index) => {
            const dateKey = format(date, "yyyy-MM-dd");
            const dayTasks = tasksByDate.get(dateKey) || [];
            const isCurrentMonth = isSameMonth(date, currentMonth);

            return (
              <div
                key={date.toString()}
                className={cn(
                  "min-h-[120px] p-2 rounded-lg border transition-colors",
                  isCurrentMonth ? "border-white/10" : "border-transparent",
                  isToday(date) && "bg-white/5",
                  !isCurrentMonth && "opacity-30"
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={cn(
                      "text-sm",
                      isToday(date) ? "text-white font-medium" : "text-white/60"
                    )}
                  >
                    {format(date, "d")}
                  </span>
                  {dayTasks.length > 0 && (
                    <span className="text-xs px-1.5 py-0.5 rounded-full bg-white/10 text-white/60">
                      {dayTasks.length}
                    </span>
                  )}
                </div>
                <div className="space-y-1">
                  {dayTasks.slice(0, 3).map((task) => (
                    <TaskPreview key={task.id} task={task} />
                  ))}
                  {dayTasks.length > 3 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-xs text-white/60 hover:text-white hover:bg-white/5"
                      onClick={() => {
                        // Handle showing more tasks
                        // Could open a dialog with all tasks for this day
                      }}
                    >
                      +{dayTasks.length - 3} more
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
};

export default CalendarView;
