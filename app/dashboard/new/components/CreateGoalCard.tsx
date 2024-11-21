import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Database } from 'types_db';
import { Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { createGoal } from '@/utils/supabase/queries';
import { getSupabaseBrowserClient } from '@/utils/supabase/client';
import { useToast } from '@/components/ui/use-toast';

type Priority = Database['public']['Enums']['task_priority'];

export const CreateGoalCard = ({ workspaceId }: { workspaceId: string }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const supabase = getSupabaseBrowserClient();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    priority: 'medium' as Priority
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const goal = await createGoal(supabase, {
        workspace_id: workspaceId,
        title: formData.title,
        description: formData.description,
        end_date: formData.date,
        status: "active",
        progress: 0,
        type: "fondation",
        config_id: ""
      });

      toast({
        title: "Goal created",
        description: "Your goal has been created successfully.",
      });

      setOpen(false);
      setFormData({
        title: '',
        description: '',
        date: '',
        priority: 'medium'
      });
    } catch (error) {
      console.error('Error creating goal:', error);
      toast({
        title: "Error",
        description: "Failed to create goal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Card
          className={`
              border-dashed border-2 border-white/30
              backdrop-blur-xl
              rounded-xl
              transition-all duration-300 ease-in-out
              hover:shadow-lg hover:shadow-black/20
              transform hover:-translate-y-1 hover:scale-105 group
              cursor-pointer
              bg-gray-850
              relative
              w-[264px]
              h-[130px] // Match the height of existing goal cards
            `}
          onClick={() => setOpen(true)}
        >
          <CardContent className="p-4 h-full flex flex-col justify-center items-center relative z-10">
            <div className="flex flex-col items-center">
              <Plus className="h-6 w-6 text-white/60" />
              <span className="text-sm text-white/70 mt-2">
                Create New Goal
              </span>
            </div>
          </CardContent>
        </Card>
      </motion.div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-white/10 backdrop-blur-md shadow-lg border border-white/20">
          <DialogHeader>
            <DialogTitle className="text-white">Create New Goal</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-white/60">Goal Title</label>
              <Input
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="bg-white/5 border-white/10 text-white"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-white/60">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="bg-white/5 border-white/10 text-white min-h-[100px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-white/60">Due Date</label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-white/60">Priority</label>
                <Select
                  value={formData.priority}
                  onValueChange={(value: Priority) =>
                    setFormData({ ...formData, priority: value })
                  }
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 text-white border-white/10">
                    <SelectItem className="cursor-pointer" value="low">
                      Low
                    </SelectItem>
                    <SelectItem className="cursor-pointer" value="medium">
                      Medium
                    </SelectItem>
                    <SelectItem className="cursor-pointer" value="high">
                      High
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="bg-white/5 hover:bg-white/10 text-white border-white/10"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white"
                disabled={loading}
              >
                Create
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}; 