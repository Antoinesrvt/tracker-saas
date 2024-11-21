export const goalCardAnimations = {
  card: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 },
    hover: {
      scale: 1.05,
      y: -5,
      transition: { duration: 0.2 }
    },
    tap: { scale: 0.95 }
  },
  progress: {
    initial: { width: 0 },
    animate: (progress: number) => ({
      width: `${progress}%`,
      transition: { duration: 0.8, ease: "easeOut" }
    })
  },
  connection: {
    initial: { pathLength: 0, opacity: 0 },
    animate: { 
      pathLength: 1, 
      opacity: 0.6,
      transition: { duration: 1, ease: "easeInOut" }
    }
  },
  section: {
    initial: { opacity: 0, y: 20 },
    animate: (delay: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: delay * 0.1, duration: 0.5 }
    })
  }
};

export const zoomAnimations = {
  button: {
    hover: { scale: 1.1 },
    tap: { scale: 0.9 },
    transition: { type: "spring", stiffness: 400, damping: 17 }
  },
  tooltip: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 10 }
  }
}; 