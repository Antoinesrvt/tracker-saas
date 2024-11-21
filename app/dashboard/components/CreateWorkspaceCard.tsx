'use client';

import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { createWorkspace } from "@/utils/supabase/queries/workspaces";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useState } from "react";
import { getSupabaseBrowserClient } from "@/utils/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface CreateWorkspaceCardProps {
  organizationId: string;
}

export const CreateWorkspaceCard = ({ organizationId }: CreateWorkspaceCardProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const supabase = getSupabaseBrowserClient();
  const { toast } = useToast();
  const { user } = useAuth();
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      await createWorkspace(supabase, name, user.id, organizationId);

      toast({
        title: "Workspace created",
        description: "Your new workspace has been created successfully.",
      });
      setOpen(false);
      setName('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create workspace. Please try again.",
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
          className="
            border-dashed border-2 border-white/30
            backdrop-blur-xl
            rounded-xl
            transition-all duration-300 ease-in-out
            hover:shadow-lg hover:shadow-black/20
            transform hover:-translate-y-1 hover:scale-105 group
            cursor-pointer
            bg-white/5
            relative
            h-[130px]
          "
          onClick={() => setOpen(true)}
        >
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-2 text-white/60 group-hover:text-white/90">
              <Plus className="h-6 w-6" />
              <span className="text-sm font-medium">Create Workspace</span>
            </div>
          </div>
        </Card>
      </motion.div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-white/10 backdrop-blur-md shadow-lg border border-white/20">
          <DialogHeader>
            <DialogTitle className="text-white">Create New Workspace</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-white/60">Workspace Name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-white/5 border-white/10 text-white"
                placeholder="Enter workspace name"
              />
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
                disabled={loading || !name.trim()}
              >
                {loading ? 'Creating...' : 'Create'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}; 