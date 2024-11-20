"use client";

import { Card, CardContent } from "@/components/ui/Card/index";
import { Button } from "@/components/ui/Button/index";
import { Download } from "lucide-react";
import { OverviewTabProps } from "./overview/types";
import { TeamSection } from "./overview/components/TeamSection";
import { TagsSection } from "./overview/components/TagsSection";
import { MetricsSection } from "./overview/components/MetricsSection";
import { DependenciesSection } from "./overview/components/DependenciesSection";
import { TasksSection } from "./overview/components/TasksSection";
import { StatisticsSection } from "./overview/components/StatisticsSection";

export default function Overview({
  goalDetails,
  styles,
  onExport,
  onTagAdd,
  onTagRemove,
}: OverviewTabProps) {
  return (
    <div className="grid grid-cols-12 gap-6">
      {/* Description Card - Adjusted to span 7 columns */}
      <Card className="col-span-7 bg-white/5 border-white/10">
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-semibold text-white">Description</h3>
            <Button
              variant="outline"
              size="sm"
              className="bg-white/5 hover:bg-white/10 border-white/10"
              onClick={onExport}
            >
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
          </div>

          <p className="text-white/80 mb-6">{goalDetails.description}</p>

          <TagsSection
            tags={goalDetails.tags}
            styles={styles}
            onTagAdd={onTagAdd}
            onTagRemove={onTagRemove}
          />

          <div className="grid grid-cols-2 gap-6">
            <TeamSection
              team={goalDetails.team}
              assignees={goalDetails.assignees}
              onAddMember={() => {}}
            />

            <div>
              <h4 className="text-white/60 mb-2">Priorité</h4>
              <div
                className={`inline-flex items-center gap-2 px-3 py-1 rounded-full
                ${styles.background} ${styles.text}`}
              >
                {goalDetails.priority}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metrics Card - Adjusted to span 3 columns */}
      <Card className="col-span-3 bg-white/5 border-white/10">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Métriques
          </h3>
          <MetricsSection
            metrics={goalDetails.metrics}
            team={goalDetails.team}
          />
        </CardContent>
      </Card>


      {/* Statistics Card - Spans 2 columns and all rows */}
      <Card className="col-span-2 row-span-3 bg-white/5 border-white/10">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Statistiques
          </h3>
          <StatisticsSection goalDetails={goalDetails} />
        </CardContent>
      </Card>

      {/* Tasks Card - Adjusted to span 5 columns */}
      <Card className="col-span-5 bg-white/5 border-white/10">
        <CardContent className="p-6">
          <TasksSection tasks={goalDetails.tasks} />
        </CardContent>
      </Card>

      {/* Dependencies Card - Adjusted to span 5 columns */}
      <Card className="col-span-5 bg-white/5 border-white/10">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Dépendances
          </h3>
          <DependenciesSection
            dependencies={goalDetails.dependencies}
            styles={styles}
          />
        </CardContent>
      </Card>
    </div>
  );
}
