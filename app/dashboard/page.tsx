"use client";

import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Plus, ZoomIn, ZoomOut, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GoalCard } from "./new/components/GoalCard";
import { useGoal } from "@/contexts/GoalContext";
import { useGoalCalculations } from "@/hooks/use-goal-calculations";
import { typeStyles } from "@/types/style";
import { useGoals } from '@/hooks/use-goals'
import { useWorkspace } from '@/hooks/use-workspace'

const TYPE_LABELS = {
  fondation: "Fondations",
  action: "Actions",
  strategie: "Stratégies",
  vision: "Vision Stratégique",
} as const;

// Update these constants for better spacing
const CARD_WIDTH = 264;
const CARD_HEIGHT = 120; // Increased from 36 to account for actual card height
const HORIZONTAL_GAP = 120;  // Increased from 70 for better separation
const VERTICAL_GAP = 80;    // Increased from 50 for better separation

export default function GoalTracker() {
  const [transform, setTransform] = useState({ scale: 1, x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [dragStartTime, setDragStartTime] = useState(0);
  const canvasRef = useRef<HTMLDivElement>(null);
  
  const { openGoalCard } = useGoal();

  const { workspace } = useWorkspace()
  const { goals, loading, error } = useGoals(workspace?.id)

  // Early return for loading state
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
          <p className="text-white/70">Loading workspace...</p>
        </div>
      </div>
    )
  }

  // Early return for error state
  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-red-500 bg-red-500/10 px-4 py-2 rounded-lg">
          {error.message}
        </div>
      </div>
    )
  }

  // Use the calculations hook
  const {
    goalsWithPositions,
    sectionLabels,
    connections,
    dimensions,
  } = useGoalCalculations(goals);

  // Gestion du zoom et du pan
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      setTransform((t) => ({
        ...t,
        scale: Math.min(Math.max(t.scale * delta, 0.2), 2),
      }));
    } else {
      setTransform((t) => ({
        ...t,
        x: t.x - e.deltaX,
        y: t.y - e.deltaY,
      }));
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || e.button === 0) {
      setIsDragging(true);
      setStartPos({
        x: e.clientX - transform.x,
        y: e.clientY - transform.y,
      });
      setDragStartTime(Date.now());
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setTransform((t) => ({
        ...t,
        x: e.clientX - startPos.x,
        y: e.clientY - startPos.y,
      }));
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    const dragDuration = Date.now() - dragStartTime;
    setIsDragging(false);
    
    // If the drag duration is less than 200ms, consider it a click
    if (dragDuration < 200) {
      const target = e.target as HTMLElement;
      const goalCard = target.closest('[data-goal-id]');
      if (goalCard) {
        const goalId = goalCard.getAttribute('data-goal-id');
        const goal = goalsWithPositions.find(g => g.id.toString() === goalId);
        if (goal) {
          openGoalCard(goal);
        }
      }
    }
  };

  const renderConnections = () => {
    return connections.map((connection) => {
      if (!connection) return null;
      // const { id, source, target, type } = connection;

      // Calculate the actual connection points
      // const startX = source.x + CARD_WIDTH; // Start from right edge of source
      // const startY = source.y + CARD_HEIGHT / 2; // Middle of card
      // const endX = target.x; // End at left edge of target
      // const endY = target.y + CARD_HEIGHT / 2; // Middle of card

      // Calculate control points for a smooth curve
      // const midX = (startX + endX) / 2;
      
      // return (
      //   <path
      //     key={id}
      //     d={`M ${startX} ${startY} 
      //         C ${midX} ${startY},
      //           ${midX} ${endY},
      //           ${endX} ${endY}`}
      //     className={`${typeStyles[type].connection} fill-none stroke-2`}
      //     strokeDasharray="5,5"
      //     style={{ opacity: 0.6 }}
      //   />
      // );
   return null
    });
  };

  // Update the section labels positioning
  const renderSectionLabels = () => {
    return sectionLabels.map(({ type, position }) => (
      <React.Fragment key={type}>
        <div
          className="absolute flex flex-col items-center gap-2"
          style={{
            left: position.x + CARD_WIDTH/2, // Center under the cards
            top: position.y - 60, // Move up a bit more
            transform: 'translateX(-50%)'
          }}
        >
          <h2 className="text-white/70 font-medium text-sm tracking-wider uppercase">
            {TYPE_LABELS[type]}
          </h2>
          <div className="h-[20px] w-[1px] bg-gradient-to-b from-white/20 to-transparent" />
        </div>
        
        {/* Vertical Separator */}
        {type !== 'vision' && (
          <div
            className="absolute top-0 bottom-0 border-r border-dashed border-white/10"
            style={{
              left: position.x + CARD_WIDTH + HORIZONTAL_GAP/2,
            }}
          />
        )}
      </React.Fragment>
    ));
  };

  // Update the canvas container to ensure proper centering
  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="fixed top-4 left-4 z-20 flex gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="bg-white/10 hover:bg-white/20"
          onClick={() => setTransform({ scale: 1, x: 0, y: 0 })}
        >
          <Home className="h-5 w-5 text-white" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="bg-white/10 hover:bg-white/20"
          onClick={() => setTransform((t) => ({ ...t, scale: t.scale * 1.2 }))}
        >
          <ZoomIn className="h-5 w-5 text-white" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="bg-white/10 hover:bg-white/20"
          onClick={() => setTransform((t) => ({ ...t, scale: t.scale * 0.8 }))}
        >
          <ZoomOut className="h-5 w-5 text-white" />
        </Button>
      </div>

      <div
        ref={canvasRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => setIsDragging(false)}
      >
        <div
          className="relative w-full h-full"
          style={{
            transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
            transformOrigin: "0 0",
            transition: isDragging ? "none" : "transform 0.1s ease-out",
          }}
        >
          {/* Center the content initially */}
          <div 
            className="absolute"
            style={{
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)'
            }}
          >
            {renderSectionLabels()}
            <svg 
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{
                width: dimensions.width + HORIZONTAL_GAP,
                height: dimensions.height + VERTICAL_GAP,
                left: -HORIZONTAL_GAP/2,
                top: -VERTICAL_GAP/2,
              }}
            >
              {renderConnections()}
            </svg>
            {goalsWithPositions.map((goal) => (
              <div key={goal.id} data-goal-id={goal.id}>
                <GoalCard
                  goal={goal}
                  styles={typeStyles[goal.type]}
                  onOpen={openGoalCard}
                  position={goal.position}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
