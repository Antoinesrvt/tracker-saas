"use client";
import React, { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/Card/index";
import { Progress } from "@/components/ui copy/progress";
import { AlertCircle, CheckCircle2, Flag, LinkIcon, Plus } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui copy/alert";
import { GoalDetails, TypeStyles } from "../../../types";
import { Button } from "@/components/ui/Button/index";
import { Download } from "lucide-react";
import { Input } from "@/components/ui/Input/index";
import { format } from "date-fns";
import { startOfWeek } from "date-fns";
import { groupBy } from "lodash";
import { ResponsiveContainer } from "recharts";
import { AreaChart, XAxis, YAxis, Area } from "recharts";

interface EnhancedOverviewProps {
  goalDetails: GoalDetails;
  styles: TypeStyles;
  onExport?: () => void;
  onTagAdd?: (tag: string) => void;
  onTagRemove?: (tag: string) => void;
}

export default function EnhancedOverview({
  goalDetails,
  styles,
  onExport,
  onTagAdd,
  onTagRemove,
}: EnhancedOverviewProps) {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [showTagInput, setShowTagInput] = useState(false);
  const [newTag, setNewTag] = useState("");

  const progressByWeek = useMemo(() => {
    // Calculer la progression hebdomadaire
    const weeks = groupBy(goalDetails.updates, (update) =>
      startOfWeek(new Date(update.createdAt)).toISOString()
    );  

    return Object.entries(weeks).map(([week, updates]) => ({
      week: format(new Date(week), "MMM dd"),
      progress: (updates as any[]).reduce((acc: number, update: any) => {
        if (update.type === "task" && update.status === "completed") {
          return acc + 1;
        }
        return acc;
      }, 0),
    }));
  }, [goalDetails.updates]);

  const nextPriorityActions = useMemo(() => {
    const incompleteTasks = goalDetails.tasks
      .filter((task) => task.status !== "completed")
      .sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      })
      .slice(0, 3);

    const upcomingMilestones = goalDetails.milestones
      .filter((m) => !m.completed && new Date(m.date) > new Date())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 2);

    return { tasks: incompleteTasks, milestones: upcomingMilestones };
  }, [goalDetails.tasks, goalDetails.milestones]);

  return (
    <div className="grid grid-cols-3 gap-6">
      {/* Informations générales avec tags */}
      <Card className="col-span-2 bg-white/5 border-white/10">
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

          <div className="flex flex-wrap gap-2 mb-6">
            {goalDetails.tags?.map((tag) => (
              <span
                key={tag.id}
                className={`px-3 py-1 rounded-full text-sm cursor-pointer
               ${selectedTag === tag.id ? styles.background : "bg-white/5"} 
               ${selectedTag === tag.id ? styles.text : "text-white/60"}`}
                onClick={() => setSelectedTag(tag.id === selectedTag ? null : tag.id)}
              >
                {tag.name}
                <button
                  className="ml-2 hover:text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    onTagRemove?.(tag.id);
                  }}
                >
                  ×
                </button>
              </span>
            ))}
            {showTagInput ? (
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newTag.trim()) {
                    onTagAdd?.(newTag.trim());
                    setNewTag("");
                    setShowTagInput(false);
                  }
                }}
                className="w-32 h-8 bg-white/5 border-white/10 text-white text-sm"
                autoFocus
              />
            ) : (
              <button
                className="px-3 py-1 rounded-full bg-white/5 text-white/60 text-sm hover:bg-white/10"
                onClick={() => setShowTagInput(true)}
              >
                + Tag
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Équipe et Priorité comme avant */}
          </div>
        </CardContent>
      </Card>

      {/* Graphique de progression */}
      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Progression</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={progressByWeek}>
              <defs>
                <linearGradient id="progress" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="week"
                stroke="rgba(255,255,255,0.4)"
                tickLine={false}
              />
              <YAxis
                stroke="rgba(255,255,255,0.4)"
                axisLine={false}
                tickLine={false}
              />
              <Area
                type="monotone"
                dataKey="progress"
                stroke="#4F46E5"
                fillOpacity={1}
                fill="url(#progress)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Prochaines étapes */}
      <Card className="col-span-2 bg-white/5 border-white/10">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Prochaines étapes
          </h3>
          <div className="space-y-4">
            {nextPriorityActions.tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-4 p-3 rounded bg-white/5"
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    task.priority === "high"
                      ? "bg-red-400"
                      : task.priority === "medium"
                      ? "bg-yellow-400"
                      : "bg-blue-400"
                  }`}
                />
                <span className="text-white flex-1">{task.title}</span>
                <span className="text-sm text-white/40">
                  {task.deadline && format(new Date(task.deadline), "dd MMM")}
                </span>
              </div>
            ))}
            {nextPriorityActions.milestones.map((milestone) => (
              <div
                key={milestone.id}
                className="flex items-center gap-4 p-3 rounded bg-white/5"
              >
                <Flag className="h-4 w-4 text-purple-400" />
                <span className="text-white flex-1">{milestone.title}</span>
                <span className="text-sm text-white/40">
                  {format(new Date(milestone.date), "dd MMM")}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Ressources allouées */}
      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Ressources allouées
          </h3>
          <div className="space-y-4">
            <div>
              <div className="text-sm text-white/60 mb-2">Budget</div>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-white">
                  {goalDetails.metrics.budget.allocated.toLocaleString()}€
                </span>
                <span className="text-sm text-white/40">
                  {Math.round(
                    (goalDetails.metrics.budget.spent /
                      goalDetails.metrics.budget.allocated) *
                      100
                  )}
                  % utilisé
                </span>
              </div>
            </div>

            <div>
              <div className="text-sm text-white/60 mb-2">Temps estimé</div>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-white">
                  {goalDetails.metrics.time.estimated}h
                </span>
                <span className="text-sm text-white/40">
                  {Math.round(
                    (goalDetails.metrics.time.timeSpent /
                      goalDetails.metrics.time.estimated) *
                      100
                  )}
                  % utilisé
                </span>
              </div>
            </div>

            <div>
              <div className="text-sm text-white/60 mb-2">Équipe</div>
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {goalDetails.assignees?.map((user) => (
                    <img
                      key={user.id}
                      src={user.avatar}
                      alt={user.name}
                      className="w-8 h-8 rounded-full border-2 border-slate-900"
                      title={user.name}
                    />
                  ))}
                </div>
                <span className="text-sm text-white/40 ml-2">
                  {goalDetails.assignees?.length} membres
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
