import { useState } from 'react';
import { Input } from '@/components/ui/Input/index';
import { Button } from '@/components/ui/Button/index';
import { Textarea } from '@/components/ui copy/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui copy/select';
import { ResourceType } from '@/types/common';
import { AddResourceFormProps } from '../types';

export const AddResourceForm = ({ onSubmit, onCancel, initialData }: AddResourceFormProps) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    type: initialData?.type || 'file' as ResourceType,
    url: initialData?.url || '',
    tags: initialData?.tags || [],
    relations: initialData?.relations || {},
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      addedBy: initialData?.addedBy!, // This should be the current user in a real app
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm text-white/60">Type de ressource</label>
        <Select
          value={formData.type}
          onValueChange={(value: ResourceType) => 
            setFormData({ ...formData, type: value })
          }
        >
          <SelectTrigger className="bg-white/5 border-white/10 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-white/10">
            <SelectItem value="file">Fichier</SelectItem>
            <SelectItem value="link">Lien</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm text-white/60">Nom</label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="bg-white/5 border-white/10 text-white"
          placeholder="Nom de la ressource"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm text-white/60">URL</label>
        <Input
          value={formData.url}
          onChange={(e) => setFormData({ ...formData, url: e.target.value })}
          className="bg-white/5 border-white/10 text-white"
          placeholder={formData.type === 'file' ? 'Chemin du fichier' : 'URL du lien'}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm text-white/60">Description</label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="bg-white/5 border-white/10 text-white min-h-[100px]"
          placeholder="Description de la ressource..."
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