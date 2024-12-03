import { motion } from 'framer-motion';
import { CheckSquare, Flag, FileText, TrendingUp, AlertCircle } from 'lucide-react';
import { GoalDetails } from '@/types/goals';

interface StatisticsSectionProps {
  goalDetails: GoalDetails;
}

export const StatisticsSection = ({ goalDetails }: StatisticsSectionProps) => {


  // Get calculus on a context with tasks and milestones data

  const completedTasks = goalDetails.tasks.filter(t => t.status === 'completed').length;
  const completedMilestones = goalDetails.milestones.filter(m => m.completed).length;
  const overdueTasks = goalDetails.tasks.filter(t => 
    t.deadline && new Date(t.deadline) < new Date() && t.status !== 'completed'
  ).length;

  const stats = [
    {
      title: 'Tâches complétées',
      value: `${completedTasks}/${goalDetails.tasks.length}`,
      icon: CheckSquare,
      color: 'text-green-400',
      bgColor: 'bg-green-400/10',
      progress: (completedTasks / goalDetails.tasks.length) * 100
    },
    {
      title: 'Jalons atteints',
      value: `${completedMilestones}/${goalDetails.milestones.length}`,
      icon: Flag,
      color: 'text-blue-400',
      bgColor: 'bg-blue-400/10',
      progress: (completedMilestones / goalDetails.milestones.length) * 100
    },
    {
      title: 'Ressources',
      value: goalDetails.resources.length.toString(),
      icon: FileText,
      color: 'text-purple-400',
      bgColor: 'bg-purple-400/10',
    },
    {
      title: 'Tâches en retard',
      value: overdueTasks.toString(),
      icon: AlertCircle,
      color: 'text-red-400',
      bgColor: 'bg-red-400/10',
      alert: overdueTasks > 0
    }
  ];

  return (
    <div className="space-y-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className={`p-4 rounded-lg ${stat.bgColor} group hover:bg-opacity-20 transition-all cursor-pointer`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <div className="text-sm text-white/60">{stat.title}</div>
                <div className="text-xl font-bold text-white">{stat.value}</div>
              </div>
            </div>
            {stat.progress !== undefined && (
              <div className={`text-lg font-semibold ${stat.color}`}>
                {Math.round(stat.progress)}%
              </div>
            )}
            {stat.alert && (
              <div className="text-red-400 animate-pulse">
                <AlertCircle className="h-5 w-5" />
              </div>
            )}
          </div>
          {stat.progress !== undefined && (
            <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${stat.color.replace('text', 'bg')}`}
                initial={{ width: 0 }}
                animate={{ width: `${stat.progress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}; 