"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import { TimelineTabProps } from "./timeline/types";
import { MilestoneCard } from "./timeline/components/MilestoneCard";
import { AddMilestoneForm } from "./timeline/components/AddMilestoneForm";
import { EditMilestoneForm } from "./timeline/components/EditMilestoneForm";
import { useTimelineCalculations } from "@/hooks/use-timeline-calculations";

export default function Timeline({
  goalDetails,
  styles,
  onFilterTasks,
  onAddMilestone,
  onUpdateMilestone,
  onDeleteMilestone,
  onToggleMilestoneComplete,
}: TimelineTabProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<string | null>(null);

  const {
    sortedMilestones,
    progress,
    hasOverdueMilestones,
    hasTodayMilestones,
  } = useTimelineCalculations(goalDetails.milestones);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">
            Jalons du projet
          </h3>
          <p className="text-sm text-white/60">
            {hasOverdueMilestones
              ? "Certains jalons sont en retard"
              : hasTodayMilestones
              ? "Des jalons sont prévus aujourd'hui"
              : "Progression des jalons"}
          </p>
        </div>
        <Button
          onClick={() => setShowAddDialog(true)}
          className={`${styles.background} ${styles.text}`}
        >
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un jalon
        </Button>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Progress line */}
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/10 -translate-y-1/2" />
        <div
          className="absolute top-1/2 left-0 h-0.5 -translate-y-1/2 bg-gradient-to-r from-green-400/50 to-green-400/0"
          style={{ width: `${progress}%` }}
        />

        {/* Milestones */}
        <div className="relative overflow-x-auto pb-4">
          <div className="flex gap-4 py-8 min-w-min">
            <AnimatePresence mode="popLayout">
              {sortedMilestones.map((milestone, index) => (
                <motion.div
                  key={milestone.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <MilestoneCard
                    milestone={milestone}
                    onToggleComplete={() => onToggleMilestoneComplete?.(milestone.id)}
                    onEdit={() => setEditingMilestone(milestone.id)}
                    onDelete={() => onDeleteMilestone?.(milestone.id)}
                    onClick={() => onFilterTasks(milestone)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Add Milestone Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="bg-slate-800 border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">
              Ajouter un nouveau jalon
            </DialogTitle>
          </DialogHeader>
          <AddMilestoneForm
            onSubmit={(milestone) => {
              onAddMilestone?.(milestone);
              setShowAddDialog(false);
            }}
            onCancel={() => setShowAddDialog(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Milestone Dialog */}
      <Dialog
        open={!!editingMilestone}
        onOpenChange={() => setEditingMilestone(null)}
      >
        <DialogContent className="bg-slate-800 border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">Modifier le jalon</DialogTitle>
          </DialogHeader>
          {editingMilestone && (
            <EditMilestoneForm
              milestone={
                goalDetails.milestones.find((m) => m.id === editingMilestone)!
              }
              onSubmit={(milestone) => {
                onUpdateMilestone?.(milestone);
                setEditingMilestone(null);
              }}
              onCancel={() => setEditingMilestone(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
