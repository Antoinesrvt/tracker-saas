import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

interface GoalCardProps {
  id: number;
  title: string;
  type: "fondation" | "action" | "strategie" | "vision";
  progress: number;
  description?: string;
  position: { x: number; y: number };
}

const typeStyles = {
  fondation: {
    background: "bg-purple-500/10",
    border: "border-purple-400/20",
    text: "text-purple-100",
    shadow: "shadow-purple-500/20",
    glow: "after:bg-purple-500/5",
    connection: "stroke-purple-400/30",
    progress: "bg-purple-400/50",
  },
  action: {
    background: "bg-blue-500/10",
    border: "border-blue-400/20",
    text: "text-blue-100",
    shadow: "shadow-blue-500/20",
    glow: "after:bg-blue-500/5",
    connection: "stroke-blue-400/30",
    progress: "bg-blue-400/50",
  },
  strategie: {
    background: "bg-emerald-500/10",
    border: "border-emerald-400/20",
    text: "text-emerald-100",
    shadow: "shadow-emerald-500/20",
    glow: "after:bg-emerald-500/5",
    connection: "stroke-emerald-400/30",
    progress: "bg-emerald-400/50",
  },
  vision: {
    background: "bg-amber-500/10",
    border: "border-amber-400/20",
    text: "text-amber-100",
    shadow: "shadow-amber-500/20",
    glow: "after:bg-amber-500/5",
    connection: "stroke-amber-400/30",
    progress: "bg-amber-400/50",
  },
};

export const GoalCard = ({
  id,
  title,
  type,
  progress,
  description,
  position,
}: GoalCardProps) => {
  const styles = typeStyles[type];
  const router = useRouter();

  return (
    // <motion.div
    //   key={id}
    //   className="absolute"
    //   style={{
    //     left: position.x,
    //     top: position.y,
    //   }}
    // >
      <Card
        className={`
          backdrop-blur-xl
          ${styles.background} ${styles.border} border
          hover:border-opacity-50 rounded-xl
          transition-all duration-300 ease-in-out
          hover:shadow-lg hover:shadow-black/20 ${styles.shadow}
          transform hover:-translate-y-1 hover:scale-105 group
          cursor-pointer
        `}
      >
        <div
          className={`absolute bottom-0 left-0 h-1 rounded-b-xl transition-all duration-300 ${styles.progress}`}
          style={{ width: `${progress}%` }}
        />

        <CardContent className="p-4 h-full flex flex-col justify-between relative z-10">
          <div>
            <div className={`text-xs opacity-70 mb-1 ${styles.text}`}>
              {description}
            </div>
            <div className={`font-semibold ${styles.text} text-lg`}>
              {title}
            </div>
          </div>

          <div className="flex justify-between items-center">
            <motion.div
              className="flex items-center gap-2"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div
                className={`
                  h-2 w-2 rounded-full transition-colors duration-300
                  ${progress >= 100 ? "bg-green-400" : "bg-white/30"}
                `}
              />
              <span className="text-white/80 text-sm">{progress}%</span>
            </motion.div>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.95 }}
              className="p-1 rounded-full hover:bg-white/10 transition-colors"
              onClick={() => router.push(`/tracker/new/card`)}
            >
              <Plus className="h-4 w-4 text-white/60 hover:text-white/90" />
            </motion.button>
          </div>
        </CardContent>
      </Card>
    // </motion.div>
  );
};

export { typeStyles };
