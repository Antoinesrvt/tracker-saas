"use client"

import { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Search, FileIcon, Link2Icon, ExternalLinkIcon, MoreVertical, Clock } from "lucide-react";
import { formatDistance } from "date-fns";
import { fr } from "date-fns/locale";
import { Input } from "@/components/ui/Input/index";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui copy/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui copy/dropdown-menu";
import { Alert, AlertDescription } from "@/components/ui copy/alert";
import { GoalDetails, Resource, TypeStyles } from '../../../types';

interface ResourceTabProps {
  goalDetails: GoalDetails;
  styles: TypeStyles;
  onAddResource?: (resource: Omit<Resource, "id" | "createdAt" | "updatedAt">) => void;
  onDeleteResource?: (resourceId: string) => void;
  onUpdateResource?: (resource: Resource) => void;
}

const ResourcesTab: React.FC<ResourceTabProps> = ({
  goalDetails,
  styles,
  onAddResource,
  onDeleteResource,
  onUpdateResource,
}) => {
  const [mounted, setMounted] = useState(false);


  // create a context for the resources

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!goalDetails?.resources) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Les ressources du projet ne sont pas disponibles.
        </AlertDescription>
      </Alert>
    );
  }

  const [selectedType, setSelectedType] = useState<"all" | Resource["type"]>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showAddResource, setShowAddResource] = useState<boolean>(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [relatedMilestone, setRelatedMilestone] = useState<string | null>(null);
  const [relatedTask, setRelatedTask] = useState<string | null>(null);

  // Extraction de tous les tags uniques
  const allTags = useMemo(
    () =>
      Array.from(new Set(goalDetails.resources.flatMap((r) => r.tags || []))),
    [goalDetails.resources]
  );

  // Filtrage des ressources
  const filteredResources = useMemo(() => {
    return goalDetails.resources.filter((resource) => {
      const matchesType =
        selectedType === "all" || resource.type === selectedType;
      const matchesSearch =
        resource.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTags =
        selectedTags.length === 0 ||
        selectedTags.every((tag) => resource.tags?.includes(tag));
      const matchesMilestone =
        !relatedMilestone ||
        resource.relations.milestoneId === relatedMilestone;
      const matchesTask =
        !relatedTask || resource.relations.taskId === relatedTask;

      return (
        matchesType &&
        matchesSearch &&
        matchesTags &&
        matchesMilestone &&
        matchesTask
      );
    });
  }, [
    goalDetails.resources,
    selectedType,
    searchQuery,
    selectedTags,
    relatedMilestone,
    relatedTask,
  ]);

  return (
    <div className="space-y-6">
      {/* Header avec recherche et filtres */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold text-white">Ressources</h3>
          <div className="flex items-center bg-white/5 rounded-lg p-1">
            <button
              className={`px-3 py-1 rounded-md text-sm transition-colors ${
                selectedType === "all"
                  ? "bg-white/10 text-white"
                  : "text-white/60 hover:text-white"
              }`}
              onClick={() => setSelectedType("all")}
            >
              Tout
            </button>
            <button
              className={`px-3 py-1 rounded-md text-sm transition-colors ${
                selectedType === "file"
                  ? "bg-white/10 text-white"
                  : "text-white/60 hover:text-white"
              }`}
              onClick={() => setSelectedType("file")}
            >
              Fichiers
            </button>
            <button
              className={`px-3 py-1 rounded-md text-sm transition-colors ${
                selectedType === "link"
                  ? "bg-white/10 text-white"
                  : "text-white/60 hover:text-white"
              }`}
              onClick={() => setSelectedType("link")}
            >
              Liens
            </button>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`px-4 py-2 rounded-lg transition-colors ${styles?.background} ${styles?.text}
          flex items-center gap-2`}
          onClick={() => setShowAddResource(true)}
        >
          <Plus className="h-4 w-4" />
          Ajouter une ressource
        </motion.button>
      </div>

      {/* Barre de filtres */}
      <div className="grid grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
          <Input
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/5 border-white/10 text-white"
          />
        </div>

        <Select
          value={relatedMilestone || "all"}
          onValueChange={(value) => setRelatedMilestone(value === "all" ? null : value)}
        >
          <SelectTrigger className="border-white/10 text-white bg-white/5">
            <SelectValue placeholder="Filtrer par jalon" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-white/10">
            <SelectItem value="all">Tous les jalons</SelectItem>
            {goalDetails.milestones.map((milestone) => (
              <SelectItem key={milestone.id} value={milestone.id}>
                {milestone.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={relatedTask || "all"}
          onValueChange={(value) => setRelatedTask(value === "all" ? null : value)}
        >
          <SelectTrigger className="border-white/10 text-white bg-white/5">
            <SelectValue placeholder="Filtrer par tâche" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-white/10">
            <SelectItem value="all">Toutes les tâches</SelectItem>
            {goalDetails.tasks.map((task) => (
              <SelectItem key={task.id} value={task.id.toString()}>
                {task.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tags */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() =>
                setSelectedTags((prev) =>
                  prev.includes(tag)
                    ? prev.filter((t) => t !== tag)
                    : [...prev, tag]
                )
              }
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                selectedTags.includes(tag)
                  ? `${styles?.background} ${styles?.text}`
                  : "bg-white/5 text-white/60 hover:bg-white/10"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Liste des ressources */}
      <div className="grid grid-cols-2 gap-4">
        {filteredResources.map((resource) => (
          <motion.div
            key={resource.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-lg backdrop-blur-sm ${styles?.background} 
            border border-white/10 hover:border-white/20 transition-colors`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                {resource.type === "file" ? (
                  <FileIcon className="h-10 w-10 text-white/60" />
                ) : (
                  <Link2Icon className="h-10 w-10 text-white/60" />
                )}
                <div>
                  <h4 className="font-medium text-white group">
                    {resource.name}
                    <ExternalLinkIcon className="h-4 w-4 inline ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h4>
                  {resource.description && (
                    <p className="text-sm text-white/60 mt-1">
                      {resource.description}
                    </p>
                  )}
                  {resource.tags && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {resource.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs px-2 py-1 rounded-full bg-white/5 text-white/60"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-1 hover:bg-white/10 rounded">
                    <MoreVertical className="h-4 w-4 text-white/60" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-slate-800 border-white/10">
                  <DropdownMenuItem
                    onClick={() => window.open(resource.url, "_blank")}
                  >
                    Ouvrir
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setEditingResource(resource)}
                  >
                    Modifier
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onDeleteResource?.(resource.id)}
                    className="text-red-400"
                  >
                    Supprimer
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-white/40">
                  <Clock className="h-4 w-4" />
                  {mounted ? (
                    formatDistance(new Date(resource.updatedAt), new Date(), {
                      addSuffix: true,
                      locale: fr,
                    })
                  ) : (
                    <span>Chargement...</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {resource.relations.milestoneId && (
                    <span className="text-xs px-2 py-1 rounded-full bg-white/5 text-white/60">
                      {
                        goalDetails.milestones.find(
                          (m) => m.id === resource.relations.milestoneId
                        )?.title
                      }
                    </span>
                  )}
                  {resource.relations.taskId && (
                    <span className="text-xs px-2 py-1 rounded-full bg-white/5 text-white/60">
                      {
                        goalDetails.tasks.find(
                          (t) => t.id === resource.relations.taskId
                        )?.title
                      }
                    </span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Dialogs pour l'ajout et la modification - similaires aux autres tabs */}
    </div>
  );
};

export default ResourcesTab;
