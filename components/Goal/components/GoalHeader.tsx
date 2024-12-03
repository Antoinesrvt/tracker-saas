 import { Clock, XCircle } from "lucide-react";
 import { Goal, GoalDetails } from "@/types/goals";
 import { TypeStyles } from '@/types/style';

 interface GoalHeaderProps {
   goal: Goal;
   styles: TypeStyles;
   onClose: () => void;
 }

 export const GoalHeader = ({
   goal,
   styles,
   onClose,
 }: GoalHeaderProps) => {
   return (
     <div className={`p-6 border-b border-white/10 ${styles.background}`}>
       <div className="flex justify-between items-start">
         <div>
           <div className="flex items-center gap-3 mb-2">
             <div
               className={`text-sm px-3 py-1 rounded-full ${styles.background} ${styles.text}`}
             >
               {goal.type}
             </div>
             <div className="flex items-center gap-2 text-white/60">
               <Clock className="h-4 w-4" />
               <span>Échéance: {goal.end_date}</span>
             </div>
           </div>
           <h2 className={`text-2xl font-bold ${styles.text} mb-1`}>
             {goal.title}
           </h2>
           <p className="text-white/60">{goal.description}</p>
         </div>
         <div className="flex items-center gap-4">
           <div className="text-right">
             <div className="text-white/60 text-sm mb-1">Progression</div>
             <div className={`text-2xl font-bold ${styles.text}`}>
               {goal.progress}%
             </div>
           </div>
           <button
             onClick={onClose}
             className="p-2 hover:bg-white/10 rounded-lg"
           >
             <XCircle className="h-6 w-6 text-white/60" />
           </button>
         </div>
       </div>
     </div>
   );
 };