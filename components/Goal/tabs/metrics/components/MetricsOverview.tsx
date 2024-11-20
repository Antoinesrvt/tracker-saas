import { Metrics } from '@/types/metrics';
import { Card, CardContent } from '@/components/ui/Card/index';
import { Progress } from '@/components/ui copy/progress';
import { Clock, DollarSign, AlertTriangle } from 'lucide-react';

interface MetricsOverviewProps {
  metrics: Metrics;
}

export const MetricsOverview = ({ metrics }: MetricsOverviewProps) => {
  const timeProgress = (metrics.time.timeSpent / metrics.time.estimated) * 100;
  const budgetProgress = (metrics.budget.spent / metrics.budget.allocated) * 100;

  return (
    <div className="grid grid-cols-3 gap-6">
      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-4">
            <div className="space-y-1">
              <div className="text-sm text-white/60">Temps</div>
              <div className="text-2xl font-bold text-white">
                {metrics.time.timeSpent}h
              </div>
            </div>
            <Clock className="h-5 w-5 text-white/40" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-white/60">
              <span>Progression</span>
              <span>{Math.round(timeProgress)}%</span>
            </div>
            <Progress value={timeProgress} className="h-1" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-4">
            <div className="space-y-1">
              <div className="text-sm text-white/60">Budget</div>
              <div className="text-2xl font-bold text-white">
                {metrics.budget.spent}€
              </div>
            </div>
            <DollarSign className="h-5 w-5 text-white/40" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-white/60">
              <span>Utilisation</span>
              <span>{Math.round(budgetProgress)}%</span>
            </div>
            <Progress value={budgetProgress} className="h-1" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-4">
            <div className="space-y-1">
              <div className="text-sm text-white/60">Risques</div>
              <div className="text-2xl font-bold text-white">
                {metrics.risks.risks.length}
              </div>
            </div>
            <AlertTriangle className="h-5 w-5 text-white/40" />
          </div>
          <div className="space-y-2">
            {metrics.risks.risks.slice(0, 2).map((risk, index) => (
              <div
                key={index}
                className="text-sm px-2 py-1 rounded bg-white/5 text-white/60"
              >
                {risk.title}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 