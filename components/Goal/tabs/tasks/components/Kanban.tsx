import { DndContext, DragEndEvent, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Card, CardContent } from '@/components/ui/Card/index';
import { TaskStatus } from '@/types/tasks';
import { KanbanProps } from '../types';
import { TaskCard } from './TaskCard';

const statusConfig = {
  todo: {
    title: 'À faire',
    className: 'border-l-blue-500/50',
  },
  in_progress: {
    title: 'En cours',
    className: 'border-l-yellow-500/50',
  },
  completed: {
    title: 'Terminé',
    className: 'border-l-green-500/50',
  },
} as const;

export const Kanban = ({
  tasks,
  tasksByStatus,
  onUpdateTask,
  onDeleteTask,
  setEditingTask,
}: KanbanProps) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const task = tasks.find((t) => t.id === active.id);
    if (!task) return;

    const newStatus = over.id as TaskStatus;
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
        {(Object.keys(tasksByStatus) as TaskStatus[]).map((status) => (
          <Card 
            key={status} 
            className={`bg-white/5 border-white/10 border-l-4 ${statusConfig[status].className}`}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white/60 font-medium">
                  {statusConfig[status].title}
                </h3>
                <span className="text-sm px-2 py-1 rounded-full bg-white/10 text-white/60">
                  {tasksByStatus[status].length}
                </span>
              </div>

              <SortableContext 
                items={tasksByStatus[status].map(t => t.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {tasksByStatus[status].map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onEdit={() => setEditingTask?.(task.id)}
                      onStatusChange={(newStatus) =>
                        onUpdateTask?.({ ...task, status: newStatus })
                      }
                      onDelete={() => onDeleteTask?.(task.id)}
                      onToggleComplete={() =>
                        onUpdateTask?.({
                          ...task,
                          status: task.status === 'completed' ? 'todo' : 'completed',
                        })
                      }
                    />
                  ))}
                </div>
              </SortableContext>
            </CardContent>
          </Card>
        ))}
      </div>
    </DndContext>
  );
}; 