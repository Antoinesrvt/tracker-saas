import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/Card/index";
import { KPI } from "@/types/metrics";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { LineChart, Line, ResponsiveContainer, Tooltip } from "recharts";

interface KPICardProps {
  kpi: KPI;
  onSelect: (kpi: KPI) => void;
}

export const KPICard = ({ kpi, onSelect }: KPICardProps) => {
  const getProgressColor = () => {
    const progress = (kpi.value / kpi.target) * 100;
    if (progress >= 90) return "text-green-400";
    if (progress >= 75) return "text-yellow-400";
    return "text-red-400";
  };

  const getTrendIcon = () => {
    if (!kpi.trend) return <Minus className="h-4 w-4" />;
    return kpi.trend.direction === "up" ? (
      <TrendingUp className="h-4 w-4" />
    ) : (
      <TrendingDown className="h-4 w-4" />
    );
  };

  const formatValue = (value: number) => {
    switch (kpi.type) {
      case "percentage":
        return `${value}%`;
      case "currency":
        return `${value}€`;
      default:
        return `${value}${kpi.unit ? ` ${kpi.unit}` : ""}`;
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(kpi)}
    >
      <Card className="bg-white/5 border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <div>
              <h4 className="text-sm text-white/60 mb-1">{kpi.name}</h4>
              <div className="flex items-baseline gap-2">
                <span className={`text-2xl font-bold ${getProgressColor()}`}>
                  {formatValue(kpi.value)}
                </span>
                <span className="text-sm text-white/40">
                  / {formatValue(kpi.target)}
                </span>
              </div>
            </div>
            {kpi.trend && (
              <div
                className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm
                  ${
                    kpi.trend.isPositive
                      ? "bg-green-500/20 text-green-400"
                      : "bg-red-500/20 text-red-400"
                  }`}
              >
                {getTrendIcon()}
                <span>{Math.abs(kpi.trend.value)}%</span>
              </div>
            )}
          </div>

          {/* Mini Chart */}
          {kpi.history && kpi.history.length > 0 && (
            <div className="h-[50px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={kpi.history}>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      return (
                        <div className="bg-slate-800 border border-white/10 rounded-lg p-2 text-xs">
                          <div className="text-white/60">
                            {new Date(payload[0].payload.date).toLocaleDateString()}
                          </div>
                          <div className="text-white font-medium">
                            {formatValue(payload[0].value as number)}
                          </div>
                        </div>
                      );
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={kpi.color || "#60A5FA"}
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Progress Bar */}
          <div className="mt-4 h-1 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{
                backgroundColor: kpi.color || "#60A5FA",
                width: `${Math.min((kpi.value / kpi.target) * 100, 100)}%`,
              }}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((kpi.value / kpi.target) * 100, 100)}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}; 