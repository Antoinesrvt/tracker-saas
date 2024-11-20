import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui copy/dialog';
import { Input } from '@/components/ui/Input/index';
import { Textarea } from '@/components/ui copy/textarea';
import { Button } from '@/components/ui/Button/index';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui copy/select';
import { Checkbox } from '@/components/ui copy/checkbox';
import { DatePicker } from '@/components/ui copy/date-picker';
import { Task, TaskTemplate, TaskPriority, RecurringFrequency } from '@/types/tasks';
import { User } from '@/types/common';
import { TaskDialogProps } from '../types';

export const TaskDialog = ({
  open,
  onOpenChange,
  task,
  templates,
  onSubmit,
  onCreate,
  selectedTemplate,
  onTemplateSelect,
}: TaskDialogProps) => {
  const [formData, setFormData] = useState<Partial<Task>>({
    title: task?.title || selectedTemplate?.title || '',
    description: task?.description || selectedTemplate?.description || '',
    status: task?.status || 'todo',
    priority: task?.priority || selectedTemplate?.priority || 'medium',
    assignees: task?.assignees || [],
    subtasks: task?.subtasks || [],
    checklist: task?.checklist || selectedTemplate?.checklist || [],
    deadline: task?.deadline,
    estimatedTime: task?.estimatedTime || selectedTemplate?.estimatedTime,
    category: task?.category || selectedTemplate?.category,
    labels: task?.labels || selectedTemplate?.labels || [],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (task && onSubmit) {
      onSubmit({ ...task, ...formData } as Task);
    } else if (onCreate) {
      onCreate(formData as Omit<Task, 'id' | 'createdAt' | 'updatedAt'>);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-800 border-white/10">
        <DialogHeader>
          <DialogTitle className="text-white">
            {task ? 'Modifier la tâche' : 'Nouvelle tâche'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!task && templates.length > 0 && (
            <Select
              value={selectedTemplate?.id || ''}
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
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="bg-white/5 border-white/10 text-white"
            />
          </div>

          <div className="space-y-2">
            <Textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="bg-white/5 border-white/10 text-white min-h-[100px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-white/60">Priorité</label>
              <Select
                value={formData.priority}
                onValueChange={(value: TaskPriority) =>
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
              <label className="text-sm text-white/60">Estimation (heures)</label>
              <Input
                type="number"
                value={formData.estimatedTime || ''}
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
              value={formData.deadline ? new Date(formData.deadline) : undefined}
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
                    recurring: checked ? { frequency: 'daily' } : undefined,
                  })
                }
              />
              <label className="text-sm text-white/60">Tâche récurrente</label>
            </div>

            {formData.recurring && (
              <Select
                value={formData.recurring.frequency}
                onValueChange={(value: RecurringFrequency) =>
                  setFormData({
                    ...formData,
                    recurring: {
                      ...formData.recurring!,
                      frequency: value,
                    },
                  })
                }
              >
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-white/10">
                  <SelectItem value="daily">Quotidien</SelectItem>
                  <SelectItem value="weekly">Hebdomadaire</SelectItem>
                  <SelectItem value="monthly">Mensuel</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="bg-white/5 hover:bg-white/10 text-white border-white/10"
            >
              Annuler
            </Button>
            <Button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white">
              {task ? 'Mettre à jour' : 'Créer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}; 