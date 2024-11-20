'use client'
  
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui copy/dialog';
import { TimeRange } from './metrics/types';
import { MetricsHeader } from './metrics/components/MetricsHeader';
import { MetricsChart } from './metrics/components/MetricsChart';
import { PerformanceMetricsCard } from './metrics/components/PerformanceMetricsCard';
import { PredictionsCard } from './metrics/components/PredictionsCard';
import { KPIGrid } from './metrics/components/KPIGrid';
import { KPIDetails } from './metrics/components/KPIDetails';
import { AddKPIForm } from './metrics/components/AddKPIForm';
import { useMetricsData } from '@/hooks/use-metrics-data';
import { KPI } from '@/types/metrics';
import { GoalDetails } from '@/types/goals';

interface MetricsTabProps {
  goalDetails: GoalDetails;
  styles: {
    background: string;
    text: string;
  };
  onAddKPI?: (kpi: Omit<KPI, 'id'>) => void;
  onUpdateKPI?: (kpi: KPI) => void;
  onDeleteKPI?: (kpiId: string) => void;
  onExport?: () => void;
}

export default function Metrics({
  goalDetails,
  styles,
  onAddKPI,
  onUpdateKPI,
  onDeleteKPI,
  onExport,
}: MetricsTabProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("1m");
  const [selectedKPI, setSelectedKPI] = useState<KPI | null>(null);
  const [showAddKPIDialog, setShowAddKPIDialog] = useState(false);

  const { filteredData, predictions, trends, currentMetrics } = useMetricsData(
    goalDetails?.historicalData,
    goalDetails?.metrics,
    timeRange
  );
  console.log(filteredData, predictions, trends, currentMetrics);


  // Guard clause for missing data
  if (!goalDetails || !goalDetails.metrics) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-white/60">Aucune donnée disponible</p>
      </div>
    );
  }

  const handleAddKPI = (kpi: Omit<KPI, "id">) => {
    onAddKPI?.(kpi);
    setShowAddKPIDialog(false);
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <MetricsHeader
        timeRange={timeRange}
        onTimeRangeChange={setTimeRange}
        onAddKPI={() => setShowAddKPIDialog(true)}
        onExport={onExport}
      />

      {/* Main Metrics Overview */}
      <div className="grid grid-cols-12 gap-6">
        {/* Performance Metrics - Now spans 4 columns */}
        <div className="col-span-4">
          <PerformanceMetricsCard metrics={currentMetrics} />
        </div>

        {/* Historical Data Chart */}
        <div className="col-span-8">
          <MetricsChart
            data={filteredData}
            timeRange={timeRange}
            onTimeRangeChange={setTimeRange}
          />
        </div>    

        {/* Predictions - Now spans 8 columns for better visibility */}
        {/* <div className="col-span-12">
          <PredictionsCard
            predictions={predictions}
            historicalData={filteredData}
            currentMetrics={currentMetrics}
          />
        </div> */}
      </div>

      {/* KPIs Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">
          Indicateurs de Performance (KPIs)
        </h3>
        <KPIGrid kpis={goalDetails.kpis} onSelect={setSelectedKPI} />
      </div>

      {/* Dialogs */}
      <Dialog open={!!selectedKPI} onOpenChange={() => setSelectedKPI(null)}>
        <DialogContent className="bg-slate-800 border-white/10 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">
              {selectedKPI?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedKPI && (
            <KPIDetails
              kpi={selectedKPI}
              onUpdate={onUpdateKPI}
              onDelete={onDeleteKPI}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showAddKPIDialog} onOpenChange={setShowAddKPIDialog}>
        <DialogContent className="bg-slate-800 border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">
              Ajouter un nouvel indicateur
            </DialogTitle>
          </DialogHeader>
          <AddKPIForm
            onSubmit={handleAddKPI}
            onCancel={() => setShowAddKPIDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}