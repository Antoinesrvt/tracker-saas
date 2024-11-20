import { Button } from "@/components/ui/Button/index";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui copy/select";
import { Plus, Download } from "lucide-react";
import { TimeRange } from "../types";
import { timeRangeOptions } from "../constants";

interface MetricsHeaderProps {
  timeRange: TimeRange;
  onTimeRangeChange: (range: TimeRange) => void;
  onAddKPI: () => void;
  onExport?: () => void;
}

export const MetricsHeader = ({
  timeRange,
  onTimeRangeChange,
  onAddKPI,
  onExport,
}: MetricsHeaderProps) => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h3 className="text-lg font-semibold text-white mb-1">
          Métriques & KPIs
        </h3>
        <p className="text-sm text-white/60">
          Suivez la progression et les indicateurs clés du projet
        </p>
      </div>
      <div className="flex gap-2">
        <Select value={timeRange} onValueChange={onTimeRangeChange}>
          <SelectTrigger className="bg-white/5 border-white/10 text-white w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-white/10">
            {timeRangeOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {onExport && (
          <Button
            variant="outline"
            className="bg-white/5 hover:bg-white/10 text-white border-white/10"
            onClick={onExport}
          >
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
        )}
        <Button
          className="bg-blue-500 hover:bg-blue-600 text-white"
          onClick={onAddKPI}
        >
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un KPI
        </Button>
      </div>
    </div>
  );
}; 