import { useGoalContext } from '@/contexts/GoalContext';

import { CheckCircle2 } from 'lucide-react';


export const TasksSection = () => {
  const {tasks} = useGoalContext()

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-white">
          Tâches en cours
        </h3>
        <button className="text-sm text-white/60 hover:text-white">
          Voir tout
        </button>
      </div>
      <div className="space-y-2 max-h-[200px] overflow-y-auto">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="flex items-center justify-between p-2 rounded bg-white/5"
          >
            <div className="flex items-center gap-3">
              <div className="cursor-pointer">
                {task.status === "completed" ? (
                  <CheckCircle2 className="h-5 w-5 text-green-400" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-white/20" />
                )}
              </div>
              <span
                className={
                  task.status === "completed"
                    ? "text-white/40 line-through"
                    : "text-white"
                }
              >
                {task.title}
              </span>
            </div>
            {task.deadline && (
              <span className="text-sm text-white/40">
                {new Date(task.deadline).toLocaleDateString()}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}; 