"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, FileIcon, Link2Icon, Filter } from "lucide-react";
import { Input } from "@/components/ui/Input/index";
import { Button } from "@/components/ui/Button/index";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui copy/dialog";
import { ResourcesTabProps, ResourceFilters } from "./resources/types";
import { ResourceCard } from "./resources/components/ResourceCard";
import { AddResourceForm } from "./resources/components/AddResourceForm";
import { ResourceFiltersDialog } from "./resources/components/ResourceFiltersDialog";
import { useResourceFilters, useResourceStats } from "@/hooks/use-resource-filters";

export default function Resources({
  goalDetails,
  styles,
  onAddResource,
  onDeleteResource,
  onUpdateResource,
}: ResourcesTabProps) {
  // State
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingResource, setEditingResource] = useState<string | null>(null);
  const [filters, setFilters] = useState<ResourceFilters>({
    type: 'all',
    search: '',
    tags: [],
    milestoneId: undefined,
    taskId: undefined,
    addedBy: undefined,
  });
  const [showFilters, setShowFilters] = useState(false);

  // Use custom hooks
  const filteredResources = useResourceFilters(goalDetails.resources, filters);
  const stats = useResourceStats(goalDetails.resources);

  // Get the resource being edited
  const resourceBeingEdited = editingResource
    ? goalDetails.resources.find(r => r.id === editingResource)
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">
            Ressources
          </h3>
          <p className="text-sm text-white/60">
            {stats.total} ressources ({stats.byType.file} fichiers, {stats.byType.link} liens)
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="bg-white/5 hover:bg-white/10 text-white border-white/10"
            onClick={() => setShowFilters(true)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtrer
          </Button>
          <Button
            className={`${styles.background} ${styles.text}`}
            onClick={() => setShowAddDialog(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter une ressource
          </Button>
        </div>
      </div>

      {/* Search and filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
          <Input
            placeholder="Rechercher..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="pl-10 bg-white/5 border-white/10 text-white"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            className={`${
              filters.type === 'all' || filters.type === 'file'
                ? 'bg-white/10 text-white'
                : 'text-white/60'
            }`}
            onClick={() =>
              setFilters(prev => ({
                ...prev,
                type: prev.type === 'file' ? 'all' : 'file',
              }))
            }
          >
            <FileIcon className="h-4 w-4 mr-2" />
            Fichiers
          </Button>
          <Button
            variant="ghost"
            className={`${
              filters.type === 'all' || filters.type === 'link'
                ? 'bg-white/10 text-white'
                : 'text-white/60'
            }`}
            onClick={() =>
              setFilters(prev => ({
                ...prev,
                type: prev.type === 'link' ? 'all' : 'link',
              }))
            }
          >
            <Link2Icon className="h-4 w-4 mr-2" />
            Liens
          </Button>
        </div>
      </div>

      {/* Resources Grid */}
      <div className="grid grid-cols-2 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredResources.map((resource) => (
            <motion.div
              key={resource.id}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 25,
              }}
            >
              <ResourceCard
                resource={resource}
                onEdit={() => setEditingResource(resource.id)}
                onDelete={() => onDeleteResource?.(resource.id)}
                onOpen={() => window.open(resource.url, "_blank")}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Add Resource Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="bg-slate-800 border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">
              Ajouter une ressource
            </DialogTitle>
          </DialogHeader>
          <AddResourceForm
            onSubmit={(resource) => {
              onAddResource?.(resource);
              setShowAddDialog(false);
            }}
            onCancel={() => setShowAddDialog(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Resource Dialog */}
      <Dialog
        open={!!editingResource}
        onOpenChange={() => setEditingResource(null)}
      >
        <DialogContent className="bg-slate-800 border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">
              Modifier la ressource
            </DialogTitle>
          </DialogHeader>
          {resourceBeingEdited && (
            <AddResourceForm
              onSubmit={(resource) => {
                onUpdateResource?.({
                  ...resourceBeingEdited,
                  ...resource,
                });
                setEditingResource(null);
              }}
              onCancel={() => setEditingResource(null)}
              initialData={resourceBeingEdited}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Filters Dialog */}
      <ResourceFiltersDialog
        open={showFilters}
        onOpenChange={setShowFilters}
        filters={filters}
        onFiltersChange={setFilters}
        team={goalDetails.team}
      />
    </div>
  );
} 