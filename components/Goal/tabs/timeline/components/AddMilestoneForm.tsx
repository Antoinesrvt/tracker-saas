import { useState } from 'react';
import { Input } from '@/components/ui/Input/index';
import { Button } from '@/components/ui/Button/index';
import { Textarea } from '@/components/ui copy/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui copy/select';
import { Priority } from '@/types/common';
import { AddMilestoneFormProps } from '../types';
import { format } from 'date-fns';

export const AddMilestoneForm = ({ onSubmit, onCancel, initialData }: AddMilestoneFormProps) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    date: initialData?.date || format(new Date(), 'yyyy-MM-dd'),
    priority: initialData?.priority || 'medium' as Priority,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      completed: false,
      dependencies: [],
      tasksCount: 0,
      completedTasksCount: 0,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm text-white/60">Titre du jalon</label>
        <Input
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="bg-white/5 border-white/10 text-white"
          placeholder="Ex: Lancement de la version beta"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm text-white/60">Description</label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="bg-white/5 border-white/10 text-white min-h-[100px]"
          placeholder="Description du jalon..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm text-white/60">Date d'échéance</label>
          <Input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="bg-white/5 border-white/10 text-white"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-white/60">Priorité</label>
          <Select
            value={formData.priority}
            onValueChange={(value: Priority) => 
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
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="bg-white/5 hover:bg-white/10 text-white border-white/10"
        >
          Annuler
        </Button>
        <Button 
          type="submit"
          className="bg-blue-500 hover:bg-blue-600 text-white"
        >
          Ajouter
        </Button>
      </div>
    </form>
  );
}; 