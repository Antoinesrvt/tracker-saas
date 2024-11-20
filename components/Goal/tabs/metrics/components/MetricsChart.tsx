import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Card, CardContent } from '@/components/ui/Card/index';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui copy/select';
import { TimeRange } from '../types';
import { timeRangeOptions } from '../constants';
import { HistoricalData } from '@/types/metrics';

interface MetricsChartProps {
  data: HistoricalData;
  timeRange: TimeRange;
  onTimeRangeChange: (range: TimeRange) => void;
}

export const MetricsChart = ({ data, timeRange, onTimeRangeChange }: MetricsChartProps) => {
  const chartData = useMemo(() => {
    return data?.map(item => ({
      date: new Date(item.date).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' }),
      budget: (item.metrics.budget.spent / item.metrics.budget.allocated) * 100,
      time: (item.metrics.time.timeSpent / item.metrics.time.estimated) * 100,
      efficiency: item.metrics.performance?.efficiency || 0,
    }));
  }, [data]);

  return (
    <Card className="bg-white/5 border-white/10">
      <CardContent className="p-6">
        {/* <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-white">Évolution des métriques</h3>
        </div> */}

        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="budgetGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="timeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="efficiencyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="date" 
                stroke="rgba(255,255,255,0.4)"
                fontSize={12}
              />
              <YAxis 
                stroke="rgba(255,255,255,0.4)"
                fontSize={12}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(30, 41, 59, 0.95)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: 'rgba(255,255,255,0.8)' }}
                itemStyle={{ color: 'rgba(255,255,255,0.6)' }}
              />

              <Area
                type="monotone"
                dataKey="budget"
                name="Budget"
                stroke="#10B981"
                fill="url(#budgetGradient)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="time"
                name="Temps"
                stroke="#4F46E5"
                fill="url(#timeGradient)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="efficiency"
                name="Efficacité"
                stroke="#F59E0B"
                fill="url(#efficiencyGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}; 