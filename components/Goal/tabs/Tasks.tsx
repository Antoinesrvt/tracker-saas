"use client";

import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/Card/index";
import { Progress } from "@/components/ui copy/progress";
import { Plus, Filter, Columns, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/Button/index";
import { TaskFilters, TasksTabProps } from "./tasks/types";
import { TaskDialog } from "./tasks/components/TaskDialogs";
import { FiltersDialog } from "./tasks/components/FiltersDialog";
import { Kanban } from "./tasks/components/Kanban";
import { CalendarView } from "./tasks/components/Calendar";
import { useTaskFilters, useTaskCalculations } from "@/hooks/use-task-filters";
import { TaskTemplate } from "@/types/tasks";

export default function Tasks({
  goalDetails,
  styles,
  onUpdateTask,
  onCreateTask,
  onDeleteTask,
}: TasksTabProps) {
  // View state
  const [view, setView] = useState<'kanban' | 'calendar'>('kanban');
  const [showNewTaskDialog, setShowNewTaskDialog] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<TaskTemplate | null>(null);

  // Filters state
  const [filters, setFilters] = useState<TaskFilters>({
    assignee: "",
    priority: "",
    category: "",
    dateRange: { from: "", to: "" },
    labels: [] as string[],
  });

  // Use custom hooks for task filtering and calculations
  const filteredTasks = useTaskFilters(goalDetails.tasks, filters as TaskFilters);
  const {
    tasksByStatus,
    progress,
    subtasksProgress,
    checklistProgress,
    hasOverdueTasks,
  } = useTaskCalculations(filteredTasks);

  // Get the task being edited
  const taskBeingEdited = useMemo(() => 
    editingTask ? goalDetails.tasks.find(t => t.id === editingTask) ?? null : null,
    [editingTask, goalDetails.tasks]
  );

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">
            Liste des tâches
          </h3>
          <p className="text-sm text-white/60">
            {hasOverdueTasks
              ? "Certaines tâches sont en retard"
              : "Gérez vos tâches et leur progression"}
          </p>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center bg-white/5 rounded-lg p-1">
            <Button
              variant="ghost"
              size="sm"
              className={`px-3 py-2 ${
                view === 'kanban' ? 'bg-white/10 text-white' : 'text-white/60'
              }`}
              onClick={() => setView('kanban')}
            >
              <Columns className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`px-3 py-2 ${
                view === 'calendar' ? 'bg-white/10 text-white' : 'text-white/60'
              }`}
              onClick={() => setView('calendar')}
            >
              <CalendarIcon className="h-4 w-4" />
            </Button>
          </div>
          <Button
            variant="outline"
            className="bg-white/5 hover:bg-white/10 text-white border-white/10"
            onClick={() => setShowFilters(true)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtrer
          </Button>
          <Button
            className={`${styles.background} ${styles.text}`}
            onClick={() => setShowNewTaskDialog(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle tâche
          </Button>
        </div>
      </div>

      {/* Progress Overview */}
      {/* <Card className="bg-white/5 border-white/10">
        <CardContent className="p-4">
          <div className="grid grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Tâches</span>
                <span className="text-white">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Sous-tâches</span>
                <span className="text-white">{Math.round(subtasksProgress)}%</span>
              </div>
              <Progress value={subtasksProgress} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Checklists</span>
                <span className="text-white">{Math.round(checklistProgress)}%</span>
              </div>
              <Progress value={checklistProgress} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card> */}

      {/* Views */}
      <AnimatePresence mode="wait">
        {view === 'kanban' ? (
          <motion.div
            key="kanban"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Kanban
              tasks={filteredTasks}
              tasksByStatus={tasksByStatus}
              onUpdateTask={onUpdateTask}
              onDeleteTask={onDeleteTask}
              setEditingTask={(taskId) => setEditingTask(taskId)}
            />
          </motion.div>
        ) : (
          <motion.div
            key="calendar"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <CalendarView
              tasks={filteredTasks}
              onTaskClick={(task) => setEditingTask(task.id)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dialogs */}
      <TaskDialog
        open={showNewTaskDialog}
        onOpenChange={setShowNewTaskDialog}
        task={null}
        templates={goalDetails.taskTemplates}
        onCreate={onCreateTask}
        selectedTemplate={selectedTemplate}
        onTemplateSelect={(template) => setSelectedTemplate(template)}
      />

      <TaskDialog
        open={!!editingTask}
        onOpenChange={() => setEditingTask(null)}
        task={taskBeingEdited}
        templates={goalDetails.taskTemplates}
        onSubmit={onUpdateTask}
      />

      <FiltersDialog
        open={showFilters}
        onOpenChange={setShowFilters}
        filters={filters}
        onFiltersChange={setFilters}
        teamMembers={goalDetails.team}
      />
    </div>
  );
}