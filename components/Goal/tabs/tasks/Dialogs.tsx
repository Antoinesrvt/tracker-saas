// TaskDialog.tsx
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui copy/dialog";
import { Input } from "@/components/ui/Input/index";
import { Textarea } from "@/components/ui copy/textarea";
import { Button } from "@/components/ui/Button/index";
import { DatePicker } from "@/components/ui copy/date-picker";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui copy/select";
import { Checkbox } from "@/components/ui copy/checkbox";
import { RecurringFrequency, Task, TaskTemplate, User } from "@/app/dashboard/types";

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
  templates: TaskTemplate[];
  onSubmit?: (task: Task) => void;
  onCreate?: (task: Omit<Task, "id" | "createdAt" | "updatedAt">) => void;
  selectedTemplate?: TaskTemplate | null;
  onTemplateSelect?: (template: TaskTemplate | null) => void;
}

export const TaskDialog: React.FC<TaskDialogProps> = ({
  open,
  onOpenChange,
  task,
  templates,
  onSubmit,
  onCreate,
  selectedTemplate,
  onTemplateSelect,
}) => {
  const [formData, setFormData] = useState<Partial<Task>>({
    title: "",
    description: "",
    status: "todo",
    priority: "medium",
    assignees: [],
    subtasks: [],
    checklist: [],
  });

  useEffect(() => {
    if (task) {
      setFormData(task);
    } else if (selectedTemplate) {
      setFormData({
        ...formData,
        title: selectedTemplate.title,
        description: selectedTemplate.description,
        priority: selectedTemplate.priority,
        estimatedTime: selectedTemplate.estimatedTime,
        checklist: selectedTemplate.checklist,
      });
    }
  }, [task, selectedTemplate]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-800 border-white/10">
        <DialogHeader>
          <DialogTitle className="text-white">
            {task ? "Modifier la tâche" : "Nouvelle tâche"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!task && templates.length > 0 && (
            <Select
              value={selectedTemplate?.id || ""}
              onValueChange={(value) => {
                const template = templates.find((t) => t.id === value);
                onTemplateSelect?.(template || null);
              }}
            >
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Choisir un template" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-white/10">
                <SelectItem value="">Aucun template</SelectItem>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <div className="space-y-2">
            <Input
              placeholder="Titre de la tâche"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="bg-white/5 border-white/10 text-white"
            />
          </div>

          <div className="space-y-2">
            <Textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="bg-white/5 border-white/10 text-white min-h-[100px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-white/60">Priorité</label>
              <Select
                value={formData.priority}
                onValueChange={(value: Task["priority"]) =>
                  setFormData({ ...formData, priority: value })
                }
              >
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-white/10">
                  <SelectItem value="low">Basse</SelectItem>
                  <SelectItem value="medium">Moyenne</SelectItem>
                  <SelectItem value="high">Haute</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-white/60">
                Estimation (heures)
              </label>
              <Input
                type="number"
                value={formData.estimatedTime || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    estimatedTime: parseInt(e.target.value) || undefined,
                  })
                }
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-white/60">Échéance</label>
            <DatePicker
              value={
                formData?.deadline ? new Date(formData.deadline) : undefined
              }
              onChange={(date) =>
                setFormData({
                  ...formData,
                  deadline: date?.toISOString(),
                })
              }
            />
          </div>

          {/* Tâches récurrentes */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={!!formData.recurring}
                onCheckedChange={(checked) =>
                  setFormData({
                    ...formData,
                    recurring: checked ? { frequency: "daily" } : undefined,
                  })
                }
              />
              <label className="text-sm text-white/60">Tâche récurrente</label>
            </div>

            {formData.recurring && (
              <Select
                value={formData.recurring?.frequency}
                onValueChange={(value: RecurringFrequency) =>
                  setFormData({
                    ...formData,
                    recurring: {
                      ...formData.recurring!,
                      frequency: value as RecurringFrequency,
                    },
                  })
                }
              >
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-white/10 text-white/40">
                  <SelectItem value="daily">Quotidien</SelectItem>
                  <SelectItem value="weekly">Hebdomadaire</SelectItem>
                  <SelectItem value="monthly">Mensuel</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Checklist */}
          <div className="space-y-2">
            <label className="text-sm text-white/60">Checklist</label>
            {formData.checklist?.map((item, index) => (
              <div key={item.id} className="flex items-center gap-2">
                <Checkbox
                  checked={item.completed}
                  onCheckedChange={(checked) => {
                    const newChecklist = [...(formData.checklist || [])];
                    newChecklist[index] = { ...item, completed: !!checked };
                    setFormData({ ...formData, checklist: newChecklist });
                  }}
                />
                <Input
                  value={item.text}
                  onChange={(e) => {
                    const newChecklist = [...(formData.checklist || [])];
                    newChecklist[index] = { ...item, text: e.target.value };
                    setFormData({ ...formData, checklist: newChecklist });
                  }}
                  className="bg-white/5 border-white/10 text-white"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setFormData({
                      ...formData,
                      checklist: formData.checklist?.filter(
                        (_, i) => i !== index
                      ),
                    });
                  }}
                >
                  ×
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setFormData({
                  ...formData,
                  checklist: [
                    ...(formData.checklist || []),
                    { id: crypto.randomUUID(), text: "", completed: false },
                  ],
                })
              }
            >
              Ajouter un item
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="bg-white/5 hover:bg-white/10 text-white border-white/10"
          >
            Annuler
          </Button>
          <Button
            onClick={() => {
              if (onSubmit) {
                onSubmit(formData as Task);
                onOpenChange(false);
              } else if (onCreate) {
                onCreate(formData as Omit<Task, "id" | "createdAt" | "updatedAt">);
                onOpenChange(false);
              }
            }}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            {task ? "Mettre à jour" : "Créer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// FiltersDialog.tsx
interface FiltersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: {
    assignee: string;
    priority: string;
    category: string;
    dateRange: { from: string; to: string };
    labels: string[];
  };
  onFiltersChange: (filters: FiltersDialogProps["filters"]) => void;
  teamMembers: User[];
}

export const FiltersDialog: React.FC<FiltersDialogProps> = ({
  open,
  onOpenChange,
  filters,
  onFiltersChange,
  teamMembers,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-800 border-white/10">
        <DialogHeader>
          <DialogTitle className="text-white">Filtres</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm text-white/60">Assigné à</label>
            <Select
              value={filters.assignee}
              onValueChange={(value) =>
                onFiltersChange({ ...filters, assignee: value })
              }
            >
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Tous les membres" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-white/10">
                <SelectItem value="">Tous les membres</SelectItem>
                {teamMembers.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-white/60">Priorité</label>
            <Select
              value={filters.priority}
              onValueChange={(value) =>
                onFiltersChange({ ...filters, priority: value })
              }
            >
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Toutes les priorités" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-white/10 text-white">
                <SelectItem value="all">Toutes les priorités</SelectItem>
                <SelectItem value="high">Haute</SelectItem>
                <SelectItem value="medium">Moyenne</SelectItem>
                <SelectItem value="low">Basse</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-white/60">Période</label>
            <div className="grid grid-cols-2 gap-4">
              <DatePicker
                value={
                  filters.dateRange.from
                    ? new Date(filters.dateRange.from)
                    : undefined
                }
                onChange={(date) =>
                  onFiltersChange({
                    ...filters,
                    dateRange: {
                      ...filters.dateRange,
                      from: date?.toISOString() || "",
                    },
                  })
                }
                placeholder="Date de début"
              />
              <DatePicker
                value={
                  filters.dateRange.to
                    ? new Date(filters.dateRange.to)
                    : undefined
                }
                onChange={(date) =>
                  onFiltersChange({
                    ...filters,
                    dateRange: {
                      ...filters.dateRange,
                      to: date?.toISOString() || "",
                    },
                  })
                }
                placeholder="Date de fin"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() =>
              onFiltersChange({
                assignee: "",
                priority: "",
                category: "",
                dateRange: { from: "", to: "" },
                labels: [],
              })
            }
            className="bg-white/5 hover:bg-white/10 text-white border-white/10"
          >
            Réinitialiser
          </Button>
          <Button
            onClick={() => onOpenChange(false)}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            Appliquer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
