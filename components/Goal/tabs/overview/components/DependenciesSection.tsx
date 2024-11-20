import { LinkIcon } from "lucide-react";
import { DependenciesSectionProps } from "../types";

export const DependenciesSection = ({ dependencies, styles }: DependenciesSectionProps) => {
  return (
    <div className="grid grid-cols-2 gap-6">
      <div>
        <h4 className="text-white/60 text-sm mb-2">Bloqué par</h4>
        <div className="space-y-2">
          {dependencies.blockedBy.map((dep) => (
            <div
              key={dep.id}
              className="flex items-center gap-2 text-sm p-2 rounded bg-white/5"
            >
              <LinkIcon className="h-4 w-4 text-white/40" />
              <span className="text-white/80">{dep.title}</span>
              <span
                className={`ml-auto text-xs px-2 py-1 rounded-full ${
                  dep.status === "completed"
                    ? "bg-green-500/20 text-green-400"
                    : dep.status === "in_progress"
                    ? "bg-blue-500/20 text-blue-400"
                    : "bg-yellow-500/20 text-yellow-400"
                }`}
              >
                {dep.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-white/60 text-sm mb-2">Bloque</h4>
        <div className="space-y-2">
          {dependencies.blocking.map((dep) => (
            <div
              key={dep.id}
              className="flex items-center gap-2 text-sm p-2 rounded bg-white/5"
            >
              <LinkIcon className="h-4 w-4 text-white/40" />
              <span className="text-white/80">{dep.title}</span>
              <span className="ml-auto text-xs px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-400">
                {dep.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}; 