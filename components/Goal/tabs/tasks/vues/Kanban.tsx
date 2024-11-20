import { DndContext, DragEndEvent, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import React from 'react'

import { Task } from '@/app/dashboard/types';
import { TaskCard } from '../TaskCard';

type KanbanProps = {
  tasks: Task[];
  tasksByStatus: Record<string, Task[]>;
  onUpdateTask?: (task: Task) => void;
  onDeleteTask?: (taskId: string) => void;
  setEditingTask?: (task: Task) => void;
};

const Kanban = ({ tasks, tasksByStatus, onUpdateTask, onDeleteTask, setEditingTask }: KanbanProps) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handlers
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const task = tasks.find((t) => t.id === active.id);
    if (!task) return;

    const newStatus = over.id as Task["status"];
    if (task.status !== newStatus) {
      onUpdateTask?.({
        ...task,
        status: newStatus,
      });
    }
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-3 gap-6">
        {Object.entries(tasksByStatus).map(([status, tasks]) => (
          <div key={status} className="space-y-4">
            <div className="flex items-center justify-between px-4 py-2 bg-white/5 rounded-lg">
              <h4 className="text-white/60 font-medium">
                {status === "todo"
                  ? "À faire"
                  : status === "in_progress"
                  ? "En cours"
                  : "Terminé"}
              </h4>
              <span className="text-sm px-2 py-1 rounded-full bg-white/10 text-white/60">
                {tasks.length}
              </span>
            </div>
            <SortableContext items={tasks.map((t) => t.id)}>
              <div className="space-y-3">
                {tasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onEdit={() => setEditingTask?.(task)}
                    onStatusChange={(newStatus) =>
                      onUpdateTask?.({ ...task, status: newStatus })
                    }
                    onDelete={() => onDeleteTask?.(task.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </div>
        ))}
      </div>
    </DndContext>
  );
};

export default Kanban