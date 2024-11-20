import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import type { Database } from "@/types/supabase";
import type { Position } from "@/hooks/use-goal-calculations";

type Goal = Database['public']['Tables']['goals']['Row'];
type GoalStatus = Database['public']['Enums']['goal_status'];
type GoalType = Database['public']['Enums']['goal_type'];

interface TypeStyles {
  background: string;
  border: string;
  text: string;
  shadow: string;
  progress: string;
}

interface GoalCardProps {
  goal: Goal;
  styles: TypeStyles;
  onOpen: (goal: Goal) => void;
  position?: Position;
}

export const GoalCard = ({
  goal,
  styles,
  onOpen,
  position,
}: GoalCardProps) => {
  const isBlocked = goal.status === 'blocked';
  const isCompleted = goal.progress >= 100;

  return (
    <motion.div
      key={goal.id}
      className="absolute"
      style={{
        left: position?.x,
        top: position?.y,
      }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        className={`
          backdrop-blur-xl
          ${styles.background} ${styles.border} border
          hover:border-opacity-50 rounded-xl
          transition-all duration-300 ease-in-out
          hover:shadow-lg hover:shadow-black/20 ${styles.shadow}
          transform hover:-translate-y-1 hover:scale-105 group
          cursor-pointer
          relative
          w-[264px]
          ${isBlocked ? 'opacity-75 hover:opacity-90' : ''}
        `}
        onClick={() => onOpen(goal)}
      >
        {isBlocked && (
          <div className="absolute -top-2 -right-2 z-20">
            <AlertCircle className="h-5 w-5 text-red-400" />
          </div>
        )}

        <div
          className={`absolute bottom-0 left-0 h-1 rounded-b-xl transition-all duration-500 ease-in-out transform origin-left ${styles.progress}`}
          style={{ width: `${goal.progress}%` }}
        />

        <CardContent className="p-4 h-full flex flex-col justify-between relative z-10">
          <div>
            <div className={`text-xs opacity-70 mb-1 ${styles.text}`}>
              {goal.type.charAt(0).toUpperCase() + goal.type.slice(1)}
            </div>
            <div className={`font-semibold ${styles.text} text-lg line-clamp-2`}>
              {goal.title}
            </div>
            {goal.description && (
              <div className={`text-xs opacity-70 mt-1 ${styles.text} line-clamp-2`}>
                {goal.description}
              </div>
            )}
          </div>

          <div className="flex justify-between items-center mt-4">
            <motion.div
              className="flex items-center gap-2"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div
                className={`
                  h-2 w-2 rounded-full transition-colors duration-300
                  ${isCompleted ? "bg-green-400" : "bg-white/30"}
                `}
              />
              <span className={`${styles.text} text-sm opacity-80`}>
                {goal.progress}%
              </span>
            </motion.div>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.95 }}
              className="p-1 rounded-full hover:bg-white/10 transition-colors"
            >
              <Plus className="h-4 w-4 text-white/60 hover:text-white/90" />
            </motion.button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}; 