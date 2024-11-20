 import { TypeStyles } from "@/types/goals";

 interface GoalNavigationProps {
   activeTab: string;
   onTabChange: (tab: string) => void;
   styles: TypeStyles;
 }

 const TABS = [
   "overview",
   "tasks",
   "timeline",
   "metrics",
   "updates",
   "ressources",
 ] as const;
 export type TabType = (typeof TABS)[number];

 export const GoalNavigation = ({
   activeTab,
   onTabChange,
   styles,
 }: GoalNavigationProps) => {
   return (
     <div className="flex border-b border-white/10">
       {TABS.map((tab) => (
         <button
           key={tab}
           className={`px-6 py-3 text-sm font-medium transition-colors
            ${
              activeTab === tab
                ? `${styles.text} border-b-2 ${styles.border}`
                : "text-white/60 hover:text-white/90"
            }`}
           onClick={() => onTabChange(tab)}
         >
           {tab.charAt(0).toUpperCase() + tab.slice(1)}
         </button>
       ))}
     </div>
   );
 };