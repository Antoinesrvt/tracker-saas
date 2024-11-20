import { motion, AnimatePresence } from "framer-motion";
import { KPI } from "@/types/metrics";
import { KPICard } from "./KPICard";
import { Card, CardContent } from "@/components/ui/Card/index";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui copy/tabs";
import { useState, useMemo } from "react";
import { Target, TrendingUp, DollarSign, Clock } from "lucide-react";

interface KPIGridProps {
  kpis: KPI[];
  onSelect: (kpi: KPI) => void;
}

type KPICategory = "performance" | "quality" | "financial" | "time";

interface CategoryConfig {
  label: string;
  icon: typeof Target;
  description: string;
}

const CATEGORIES: Record<KPICategory, CategoryConfig> = {
  performance: {
    label: "Performance",
    icon: Target,
    description: "Indicateurs de performance globale",
  },
  quality: {
    label: "Qualité",
    icon: TrendingUp,
    description: "Métriques de qualité et satisfaction",
  },
  financial: {
    label: "Finance",
    icon: DollarSign,
    description: "Indicateurs financiers",
  },
  time: {
    label: "Temps",
    icon: Clock,
    description: "Métriques temporelles",
  },
};

// Helper function to categorize KPIs
const categorizeKPIs = (kpis: KPI[]) => {
  const categorized: Record<KPICategory, KPI[]> = {
    performance: [],
    quality: [],
    financial: [],
    time: [],
  };

  kpis.forEach(kpi => {
    if (kpi.type === "currency") {
      categorized.financial.push(kpi);
    } else if (kpi.type === "time") {
      categorized.time.push(kpi);
    } else if (kpi.name.toLowerCase().includes("qualit") || 
               kpi.name.toLowerCase().includes("satisfaction")) {
      categorized.quality.push(kpi);
    } else {
      categorized.performance.push(kpi);
    }
  });

  return categorized;
};

export const KPIGrid = ({ kpis, onSelect }: KPIGridProps) => {
  const [activeCategory, setActiveCategory] = useState<KPICategory>("performance");
  const categorizedKPIs = useMemo(() => categorizeKPIs(kpis), [kpis]);

  return (
    <Tabs 
      value={activeCategory} 
      onValueChange={(value) => setActiveCategory(value as KPICategory)}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <TabsList className="bg-white/5">
          {Object.entries(CATEGORIES).map(([key, category]) => (
            <TabsTrigger
              key={key}
              value={key}
              className="data-[state=active]:bg-white/10"
            >
              <div className="flex items-center gap-2">
                <category.icon className="h-4 w-4" />
                <span>{category.label}</span>
              </div>
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      {Object.entries(CATEGORIES).map(([key, category]) => (
        <TabsContent key={key} value={key} className="space-y-6 mt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">
                {category.label}
              </h3>
              <p className="text-sm text-white/60">
                {category.description}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {categorizedKPIs[key as KPICategory].map((kpi, index) => (
                <motion.div
                  key={kpi.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 25,
                    delay: index * 0.05,
                  }}
                >
                  <KPICard kpi={kpi} onSelect={onSelect} />
                </motion.div>
              ))}

              {/* Empty State */}
              {categorizedKPIs[key as KPICategory].length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="col-span-3"
                >
                  <Card className="bg-white/5 border-white/10">
                    <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                      <category.icon className="h-8 w-8 text-white/20 mb-2" />
                      <p className="text-white/60">
                        Aucun KPI dans cette catégorie
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
}; 