import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui copy/dialog';
import { Button } from '@/components/ui/Button/index';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui copy/select';
import { Input } from '@/components/ui/Input/index';
import { ResourceFiltersDialogProps } from '../types';

export const ResourceFiltersDialog = ({
  open,
  onOpenChange,
  filters,
  onFiltersChange,
  team,
}: ResourceFiltersDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-800 border-white/10">
        <DialogHeader>
          <DialogTitle className="text-white">Filtrer les ressources</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm text-white/60">Type</label>
            <Select
              value={filters.type}
              onValueChange={(value) =>
                onFiltersChange({ ...filters, type: value as typeof filters.type })
              }
            >
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Tous les types" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-white/10">
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="file">Fichiers</SelectItem>
                <SelectItem value="link">Liens</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-white/60">Recherche</label>
            <Input
              value={filters.search}
              onChange={(e) =>
                onFiltersChange({ ...filters, search: e.target.value })
              }
              placeholder="Rechercher..."
              className="bg-white/5 border-white/10 text-white"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-white/60">Ajouté par</label>
            <Select
              value={filters.addedBy || ''}
              onValueChange={(value) =>
                onFiltersChange({ ...filters, addedBy: value || undefined })
              }
            >
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Tous les membres" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-white/10">
                <SelectItem value="">Tous les membres</SelectItem>
                {team.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() =>
              onFiltersChange({
                type: 'all',
                search: '',
                tags: [],
                addedBy: undefined,
                milestoneId: undefined,
                taskId: undefined,
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