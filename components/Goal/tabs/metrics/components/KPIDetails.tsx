import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/Card/index";
import { Button } from "@/components/ui/Button/index";
import { Input } from "@/components/ui/Input/index";
import { KPI } from "@/types/metrics";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { TrendingUp, TrendingDown, AlertCircle, Target, Calendar, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface KPIDetailsProps {
  kpi: KPI;
  onDelete?: (kpiId: string) => void;
  onUpdate?: (kpi: KPI) => void;
  predictions?: {
    nextValue: number;
    predictedDate: string;
    confidence: number;
    trend: number;
  };
}

export const KPIDetails = ({ kpi, onDelete, onUpdate, predictions }: KPIDetailsProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedValue, setEditedValue] = useState(kpi.value.toString());

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

  const getProgressColor = () => {
    const progress = (kpi.value / kpi.target) * 100;
    if (progress >= 90) return "text-green-400";
    if (progress >= 75) return "text-yellow-400";
    return "text-red-400";
  };

  const handleSave = () => {
    const numericValue = parseFloat(editedValue);
    if (!isNaN(numericValue)) {
      onUpdate?.({
        ...kpi,
        value: numericValue
      });
    }
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Main KPI Info */}
      <div className="grid grid-cols-2 gap-6">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Valeur actuelle</h3>
            <div className="space-y-4">
              {isEditing ? (
                <div className="flex gap-2">
                  <Input
                    value={editedValue}
                    onChange={(e) => setEditedValue(e.target.value)}
                    className="bg-white/5 border-white/10 text-white"
                  />
                  <Button
                    variant="outline"
                    className="bg-white/5 hover:bg-white/10 border-white/10"
                    onClick={handleSave}
                  >
                    Sauvegarder
                  </Button>
                </div>
              ) : (
                <div className="flex items-baseline gap-2">
                  <span className={`text-4xl font-bold ${getProgressColor()}`}>
                    {formatValue(kpi.value)}
                  </span>
                  <span className="text-lg text-white/40">
                    / {formatValue(kpi.target)}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-2"
                    onClick={() => setIsEditing(true)}
                  >
                    Éditer
                  </Button>
                </div>
              )}

              {/* Progress and Trend */}
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${getProgressColor()}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((kpi.value / kpi.target) * 100, 100)}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
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
                    {kpi.trend.direction === "up" ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                    <span>{Math.abs(kpi.trend.value)}%</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Predictions Card */}
        {predictions && (
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Prédictions</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-blue-400" />
                    <span className="text-white/60">Valeur prévue</span>
                  </div>
                  <span className="text-xl font-semibold text-blue-400">
                    {formatValue(predictions.nextValue)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-purple-400" />
                    <span className="text-white/60">Date prévue</span>
                  </div>
                  <span className="text-white">
                    {format(new Date(predictions.predictedDate), "d MMMM yyyy", {
                      locale: fr,
                    })}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-yellow-400" />
                    <span className="text-white/60">Confiance</span>
                  </div>
                  <span className="text-white">{predictions.confidence}%</span>
                </div>

                {predictions.trend !== 0 && (
                  <div
                    className={`flex items-center gap-2 p-2 rounded-lg ${
                      predictions.trend > 0
                        ? "bg-green-500/20 text-green-400"
                        : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {predictions.trend > 0 ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                    <span>
                      Tendance de {Math.abs(predictions.trend)}% {predictions.trend > 0 ? "à la hausse" : "à la baisse"}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Historical Chart */}
      {kpi.history && kpi.history.length > 0 && (
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Historique</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={kpi.history.filter(entry => entry && entry.value !== undefined && entry.date)}
                  margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis
                    dataKey="date"
                    stroke="rgba(255,255,255,0.4)"
                    fontSize={12}
                    tickFormatter={(date) => date ? format(new Date(date), "d MMM", { locale: fr }) : ''}
                  />
                  <YAxis 
                    stroke="rgba(255,255,255,0.4)" 
                    fontSize={12}
                    allowDecimals={false}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length || !payload[0]?.payload) return null;
                      return (
                        <div className="bg-slate-800 border border-white/10 rounded-lg p-2 text-sm">
                          <div className="text-white/60">
                            {format(new Date(payload[0].payload.date), "d MMMM yyyy", {
                              locale: fr,
                            })}
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
                    connectNulls
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-2">
        {onDelete && (
          <Button
            variant="destructive"
            onClick={() => onDelete(kpi.id)}
            className="bg-red-500/20 hover:bg-red-500/30 text-red-400"
          >
            Supprimer
          </Button>
        )}
      </div>
    </div>
  );
}; 