 import React, { forwardRef } from "react";
 import { motion } from "framer-motion";

 interface GoalCanvasProps {
   transform: { scale: number; x: number; y: number };
   isDragging: boolean;
   onWheel: (e: React.WheelEvent) => void;
   dimensions: { width: number; height: number };
   children: React.ReactNode;
 }

 export const GoalCanvas = forwardRef<HTMLDivElement, GoalCanvasProps>(
   ({ transform, isDragging, onWheel, dimensions, children }, ref) => {
     return (
       <div
         ref={ref}
         className="w-full h-full cursor-grab active:cursor-grabbing"
         onWheel={onWheel}
       >
         <motion.div
           className="relative w-full h-full"
           style={{
             transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
             transformOrigin: "0 0",
             transition: isDragging ? "none" : "transform 0.1s ease-out",
           }}
         >
           <div
             className="absolute"
             style={{
               left: "50%",
               top: "50%",
               transform: "translate(-50%, -50%)",
               width: dimensions.width,
               height: dimensions.height,
             }}
           >
             {children}
           </div>
         </motion.div>
       </div>
     );
   }
 );

 GoalCanvas.displayName = "GoalCanvas";