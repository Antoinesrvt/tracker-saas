"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useItemContext } from "@/contexts/ItemContext";
import { GoalProvider, useGoalContext } from "@/contexts/GoalContext";
import { GoalHeader } from "./components/GoalHeader";
import { GoalNavigation, TabType } from "./components/GoalNavigation";
import { GoalContent } from "./components/GoalContent";
import { TypeStyles, typeStyles } from "@/types/style";
import { Loader2, AlertCircle } from "lucide-react";

const LoadingState = () => (
  <div className="flex flex-col items-center justify-center h-full">
    <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
    <p className="text-muted-foreground">Loading goal details...</p>
  </div>
);

const ErrorState = ({ message }: { message: string }) => (
  <div className="flex flex-col items-center justify-center h-full">
    <AlertCircle className="w-8 h-8 text-destructive mb-4" />
    <p className="text-destructive font-semibold mb-2">Something went wrong</p>
    <p className="text-muted-foreground text-sm text-center max-w-md">
      {message}
    </p>
  </div>
);

const GoalDetailCard = () => {
  const { closeModal } = useItemContext();
  const { goal, milestones, tasks, teams, loading, error } = useGoalContext();
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  // Default to a loading style if no goal is available yet
  const styles = goal ? typeStyles[goal.type] : typeStyles.fondation;
  const goalDetails = { milestones, tasks, teams };

  const renderContent = () => {
    if (loading) return <LoadingState />;
    if (error) return <ErrorState message={error.message} />;
    if (!goal) return <ErrorState message="Goal not found" />;

    return (
      <>
        <GoalHeader
          goal={goal}
          styles={styles}
          onClose={closeModal}
        />
        <GoalNavigation
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab as TabType)}
          styles={styles}
        />
        {/* <GoalContent
          activeTab={activeTab}
          styles={styles}
        /> */}
      </>
    );
  };

  return (
    <div
      className="fixed inset-0 z-20 backdrop-blur-sm p-12"
      onClick={closeModal}
    >
      <motion.div
        className="relative w-full h-full z-50 bg-slate-900/95 rounded-xl backdrop-blur-xl border border-white/10 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 30,
          duration: 0.3
        }}
      >
        {renderContent()}
      </motion.div>
    </div>
  );
};

const GoalDetailComponent = () => {
  const selectedGoalId = useItemContext().selectedGoalId;

  if (!selectedGoalId) {
    return null;
  }

  return <GoalProvider goalId={selectedGoalId}><GoalDetailCard /></GoalProvider>;
};

export default GoalDetailComponent;
