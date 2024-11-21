"use client";

import React from "react";
import { motion } from "framer-motion";
import { ZoomIn, ZoomOut, Home, Map } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

interface ControlsProps {
  transform: { scale: number; x: number; y: number };
  setTransform: (transform: { scale: number; x: number; y: number }) => void;
  showMinimap: boolean;
  setShowMinimap: (show: boolean) => void;
  handleZoom: (value: number) => void;
}

export default function Controls({
  transform,
  setTransform,
  showMinimap,
  setShowMinimap,
  handleZoom,
}: ControlsProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-4 bg-white/5 backdrop-blur-md p-2 rounded-lg border border-white/10"
    >
      <Button
        variant="ghost"
        size="icon"
        className="bg-white/10 hover:bg-white/20"
        onClick={() => setTransform({ scale: 1, x: 0, y: 0 })}
      >
        <Home className="h-5 w-5 text-white" />
      </Button>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="bg-white/10 hover:bg-white/20"
          onClick={() => handleZoom(Math.max(0.5, transform.scale - 0.1))}
        >
          <ZoomOut className="h-4 w-4 text-white" />
        </Button>
        
        <Slider
          value={[transform.scale]}
          min={0.5}
          max={2}
          step={0.1}
          className="w-32"
          onValueChange={([value]) => handleZoom(value)}
        />
        
        <Button
          variant="ghost"
          size="icon"
          className="bg-white/10 hover:bg-white/20"
          onClick={() => handleZoom(Math.min(2, transform.scale + 0.1))}
        >
          <ZoomIn className="h-4 w-4 text-white" />
        </Button>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className={`bg-white/10 hover:bg-white/20 ${showMinimap ? 'bg-white/20' : ''}`}
        onClick={() => setShowMinimap(!showMinimap)}
      >
        <Map className="h-5 w-5 text-white" />
      </Button>
    </motion.div>
  );
}; 