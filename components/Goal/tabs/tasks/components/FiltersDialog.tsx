import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui copy/dialog';
import { Button } from '@/components/ui/Button/index';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui copy/select';
import { DatePicker } from '@/components/ui copy/date-picker';
import { TaskPriority } from '@/types/tasks';
import { FiltersDialogProps } from '../types';

export const FiltersDialog = ({
  open,
  onOpenChange,
  filters,
  onFiltersChange,
  teamMembers,
}: FiltersDialogProps) => {
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
              value={filters.priority || ''}
              onValueChange={(value) =>
                onFiltersChange({ ...filters, priority: value as TaskPriority | '' })
              }
            >
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Toutes les priorités" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-white/10">
                <SelectItem value="">Toutes les priorités</SelectItem>
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
                      from: date?.toISOString() || '',
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
                      to: date?.toISOString() || '',
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
                assignee: '',
                priority: '',
                category: '',
                dateRange: { from: '', to: '' },
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