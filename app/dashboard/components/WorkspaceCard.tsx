import { Card, CardContent } from "@/components/ui/card";
import { Workspace } from "@/utils/supabase/queries/workspaces";
import { motion } from "framer-motion";
import { ArrowRight, Users } from "lucide-react";
import Link from "next/link";

interface WorkspaceCardProps {
  workspace: Workspace;
  organizationId: string;
}

export const WorkspaceCard = ({ workspace, organizationId }: WorkspaceCardProps) => {
  return (
    <Link href={`/workspace/${workspace.id}`}>
      <Card
        className="
        backdrop-blur-xl bg-white/5
        border-white/10 border
        hover:border-white/20 rounded-xl
        transition-all duration-300 ease-in-out
        hover:shadow-lg hover:shadow-black/20
        transform hover:-translate-y-1 hover:scale-105
        cursor-pointer
        relative
        h-[130px]
        opacity-100
      "
      >
        <CardContent className="p-4 h-full flex flex-col justify-between">
          <div>
            <div className="text-white/60 text-sm mb-1 flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>Workspace</span>
            </div>
            <h3 className="text-white font-semibold text-lg">
              {workspace.name}
            </h3>
          </div>

          <motion.div
            className="flex items-center gap-2 text-white/60"
            whileHover={{ x: 5 }}
          >
            <span className="text-sm">Open workspace</span>
            <ArrowRight className="h-4 w-4" />
          </motion.div>
        </CardContent>
      </Card>
    </Link>
  );
}; 