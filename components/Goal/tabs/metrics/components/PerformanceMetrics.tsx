import { PerformanceMetrics as PerformanceMetricsType } from '@/types/metrics';
import { Card, CardContent } from '@/components/ui/Card/index';
import { Progress } from '@/components/ui copy/progress';
import { BarChart3, Target } from 'lucide-react';

interface PerformanceMetricsProps {
  performance: PerformanceMetricsType;
}

export const PerformanceMetrics = ({ performance }: PerformanceMetricsProps) => {
  return (
    <div className="grid grid-cols-2 gap-6">
      {performance.qualityScore !== undefined && (
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-4">
              <div className="space-y-1">
                <div className="text-sm text-white/60">Qualité</div>
                <div className="text-2xl font-bold text-white">
                  {performance.qualityScore}%
                </div>
              </div>
              <Target className="h-5 w-5 text-white/40" />
            </div>
            <Progress value={performance.qualityScore} className="h-1" />
          </CardContent>
        </Card>
      )}

      {performance.efficiency !== undefined && (
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-4">
              <div className="space-y-1">
                <div className="text-sm text-white/60">Efficacité</div>
                <div className="text-2xl font-bold text-white">
                  {performance.efficiency}%
                </div>
              </div>
              <BarChart3 className="h-5 w-5 text-white/40" />
            </div>
            <Progress value={performance.efficiency} className="h-1" />
          </CardContent>
        </Card>
      )}
    </div>
  );
}; 