import { Card, CardContent } from "@/components/ui/Card/index";
import { Progress } from "@/components/ui copy/progress";
import { Metrics } from "@/types/metrics";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Clock, DollarSign, AlertTriangle } from "lucide-react";

interface PerformanceMetricsCardProps {
  metrics: Metrics | undefined;
}

export const PerformanceMetricsCard = ({ metrics }: PerformanceMetricsCardProps) => {
  if (!metrics) return null;

  const timeProgress = (metrics.time.timeSpent / metrics.time.estimated) * 100;
  const budgetProgress = (metrics.budget.spent / metrics.budget.allocated) * 100;
  const efficiency = metrics.performance?.efficiency || 0;

  const performanceMetrics = [
    {
      title: "Temps",
      value: `${metrics.time.timeSpent}h`,
      total: `${metrics.time.estimated}h`,
      progress: timeProgress,
      icon: Clock,
      color: timeProgress > 100 ? "text-red-400" : "text-blue-400",
      bgColor: timeProgress > 100 ? "bg-red-400" : "bg-blue-400",
    },
    {
      title: "Budget",
      value: `${Math.round(budgetProgress)}%`,
      total: `${metrics.budget.allocated}€`,
      progress: budgetProgress,
      icon: DollarSign,
      color: budgetProgress > 100 ? "text-red-400" : "text-green-400",
      bgColor: budgetProgress > 100 ? "bg-red-400" : "bg-green-400",
    },
    {
      title: "Efficacité",
      value: `${efficiency}%`,
      progress: efficiency,
      icon: efficiency >= 80 ? TrendingUp : TrendingDown,
      color: efficiency >= 80 ? "text-green-400" : "text-yellow-400",
      bgColor: efficiency >= 80 ? "bg-green-400" : "bg-yellow-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4">
      {performanceMetrics.map((metric) => (
        <Card key={metric.title} className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-sm text-white/60">{metric.title}</p>
                <div className="flex items-baseline gap-2">
                  <p className={`text-2xl font-bold ${metric.color}`}>
                    {metric.value}
                  </p>
                  {metric.total && (
                    <p className="text-sm text-white/40">/ {metric.total}</p>
                  )}
                </div>
              </div>
              <div className={`p-2 rounded-lg bg-white/5`}>
                <metric.icon className={`h-5 w-5 ${metric.color}`} />
              </div>
            </div>

            {metric.progress !== undefined && (
              <div className="space-y-2">
                <Progress 
                  value={metric.progress} 
                  className="h-1"
                  // indicatorClassName={`${metric.bgColor}/50`}
                />
                {metric.progress > 100 && (
                  <div className="flex items-center gap-1 text-xs text-red-400">
                    <AlertTriangle className="h-3 w-3" />
                    <span>Dépassement de {Math.round(metric.progress - 100)}%</span>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}; 