import { Card, CardContent } from "@/components/ui/Card/index";
import { motion } from "framer-motion";
import { Prediction, Metrics, HistoricalData } from "@/types/metrics";
import { TrendingUp, TrendingDown, Clock, DollarSign, Target, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from "recharts";
import { calculateFuturePredictions, getPredictionConfidence } from "@/lib/predictions";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui copy/select";
import { useState } from "react";

interface PredictionsCardProps {
  predictions?: Prediction;
  historicalData?: HistoricalData;
  currentMetrics?: Metrics;
}

const PREDICTION_RANGES = [
  { value: "3", label: "3 mois" },
  { value: "6", label: "6 mois" },
  { value: "12", label: "1 an" },
  { value: "24", label: "2 ans" },
  { value: "36", label: "3 ans" },
];

export const PredictionsCard = ({ predictions, historicalData, currentMetrics }: PredictionsCardProps) => {
  const [predictionRange, setPredictionRange] = useState("12");

  if (!predictions || !currentMetrics || !historicalData?.length) {
    return (
      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-[300px] text-white/60">
            Données insuffisantes pour les prédictions
          </div>
        </CardContent>
      </Card>
    );
  }

  const confidence = getPredictionConfidence(historicalData);
  const futureData = calculateFuturePredictions(historicalData, predictions, parseInt(predictionRange));

  const getConfidenceColor = (value: number) => {
    if (value >= 80) return "text-green-400";
    if (value >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <Card className="bg-white/5 border-white/10">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-semibold text-white">Prédictions</h3>
            <p className="text-sm text-white/60">
              Basé sur {historicalData.length} points de données
            </p>
          </div>
          <Select value={predictionRange} onValueChange={setPredictionRange}>
            <SelectTrigger className="w-36 bg-white/5 border-white/10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PREDICTION_RANGES.map(range => (
                <SelectItem key={range.value} value={range.value}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Prediction Chart */}
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-9">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={futureData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis 
                    dataKey="date" 
                    stroke="rgba(255,255,255,0.4)"
                    tick={{ fill: 'rgba(255,255,255,0.6)' }}
                  />
                  <YAxis 
                    stroke="rgba(255,255,255,0.4)"
                    tick={{ fill: 'rgba(255,255,255,0.6)' }}
                    domain={[0, 100]}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(30, 41, 59, 0.95)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                    }}
                  />
                  <ReferenceLine y={100} stroke="rgba(255,255,255,0.2)" strokeDasharray="3 3" />
                  
                  {/* Prediction lines */}
                  <Line
                    type="monotone"
                    dataKey="budget"
                    name="Budget"
                    stroke="#10B981"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="time"
                    name="Temps"
                    stroke="#4F46E5"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="efficiency"
                    name="Efficacité"
                    stroke="#F59E0B"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Confidence Indicators */}
          <div className="col-span-3 flex flex-col gap-4">
            {[
              { label: "Budget", value: confidence.budget, icon: DollarSign },
              { label: "Temps", value: confidence.time, icon: Clock },
              { label: "Efficacité", value: confidence.efficiency, icon: Target },
            ].map((item) => (
              <div
                key={item.label}
                className="flex flex-col p-3 rounded-lg bg-white/5"
              >
                <div className="flex items-center gap-2 mb-2">
                  <item.icon className="h-4 w-4 text-white/60" />
                  <span className="text-white/60">{item.label}</span>
                </div>
                <span className={`font-semibold ${getConfidenceColor(item.value)}`}>
                  {item.value}% fiable
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 