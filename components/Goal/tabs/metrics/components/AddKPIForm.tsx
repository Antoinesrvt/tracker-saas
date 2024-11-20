import { useState } from 'react';
import { Input } from '@/components/ui/Input/index';
import { Button } from '@/components/ui/Button/index';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui copy/select';
import { KPI } from '@/types/metrics';

interface AddKPIFormProps {
  onSubmit: (kpi: Omit<KPI, 'id'>) => void;
  onCancel: () => void;
}

export const AddKPIForm = ({ onSubmit, onCancel }: AddKPIFormProps) => {
  const [formData, setFormData] = useState<Omit<KPI, 'id'>>({
    name: '',
    value: 0,
    target: 0,
    unit: '',
    type: 'number',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm text-white/60">Nom du KPI</label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="bg-white/5 border-white/10 text-white"
          placeholder="Ex: Taux de conversion"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm text-white/60">Valeur actuelle</label>
          <Input
            type="number"
            value={formData.value}
            onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
            className="bg-white/5 border-white/10 text-white"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-white/60">Objectif</label>
          <Input
            type="number"
            value={formData.target}
            onChange={(e) => setFormData({ ...formData, target: Number(e.target.value) })}
            className="bg-white/5 border-white/10 text-white"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm text-white/60">Type</label>
        <Select
          value={formData.type}
          onValueChange={(value: KPI['type']) => setFormData({ ...formData, type: value })}
        >
          <SelectTrigger className="bg-white/5 border-white/10 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-white/10">
            <SelectItem value="number">Nombre</SelectItem>
            <SelectItem value="percentage">Pourcentage</SelectItem>
            <SelectItem value="currency">Monétaire</SelectItem>
            <SelectItem value="time">Temps</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm text-white/60">Unité</label>
        <Input
          value={formData.unit}
          onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
          className="bg-white/5 border-white/10 text-white"
          placeholder="Ex: %"
        />
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
        <Button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white">
          Ajouter
        </Button>
      </div>
    </form>
  );
}; 