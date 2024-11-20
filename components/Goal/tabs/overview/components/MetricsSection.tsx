import { Clock, AlertCircle } from 'lucide-react';
import { Progress } from '@/components/ui copy/progress';
import { Metrics } from '@/types/metrics';
import { User } from '@/types/common';

interface MetricsSectionProps {
  metrics: Metrics;
  team: User[];
}

export const MetricsSection = ({ metrics }: MetricsSectionProps) => {
  const timeProgress = (metrics.time.timeSpent / metrics.time.estimated) * 100;
  const budgetProgress = (metrics.budget.spent / metrics.budget.allocated) * 100;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-white/60">Temps passé</span>
            <span className="text-white">
              {metrics.time.timeSpent}h
            </span>
          </div>
          <Progress 
            value={timeProgress} 
            className={`h-2 ${timeProgress > 100 ? "bg-red-500/20" : "bg-white/10"}`}
          />
          {timeProgress > 100 && (
            <div className="flex items-center gap-1 mt-1 text-xs text-red-400">
              <AlertCircle className="h-3 w-3" />
              <span>Dépassement de {Math.round(timeProgress - 100)}%</span>
            </div>
          )}
        </div>
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-white/60">Budget utilisé</span>
            <span className="text-white">
              {Math.round(budgetProgress)}%
            </span>
          </div>
          <Progress 
            value={budgetProgress} 
            className={`h-2 ${budgetProgress > 100 ? "bg-red-500/20" : "bg-white/10"}`}
          />
          {budgetProgress > 100 && (
            <div className="flex items-center gap-1 mt-1 text-xs text-red-400">
              <AlertCircle className="h-3 w-3" />
              <span>Dépassement de {Math.round(budgetProgress - 100)}%</span>
            </div>
          )}
        </div>
      </div>

      {/* Risks Section */}
      <div>
        <h4 className="text-white/60 mb-2">Risques identifiés</h4>
        <div className="space-y-2">
          {metrics.risks.risks.map((risk, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 rounded bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    risk.severity === "high"
                      ? "bg-red-400"
                      : risk.severity === "medium"
                      ? "bg-yellow-400"
                      : "bg-blue-400"
                  }`}
                />
                <span className="text-white/80">{risk.title}</span>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity ${
                risk.severity === "high"
                  ? "bg-red-500/20 text-red-400"
                  : risk.severity === "medium"
                  ? "bg-yellow-500/20 text-yellow-400"
                  : "bg-blue-500/20 text-blue-400"
              }`}>
                {risk.severity}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}; 