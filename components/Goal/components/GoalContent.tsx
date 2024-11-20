 import { GoalDetails, TypeStyles } from "@/types/goals";
 import { TabType } from "./GoalNavigation";
 import Overview from "../tabs/Overview";
 import Updates from "../tabs/Updates";
 import Tasks from "../tabs/Tasks";
 import Timeline from "../tabs/Timeline";
 import Metrics from "../tabs/Metrics";
 import Resources from "../tabs/Resources";

 interface GoalContentProps {
   activeTab: TabType;
   goalDetails: GoalDetails;
   styles: TypeStyles;
 }

 export const GoalContent = ({
   activeTab,
   goalDetails,
   styles,
 }: GoalContentProps) => {
   const renderContent = () => {
     switch (activeTab) {
       case "overview":
         return <Overview goalDetails={goalDetails} styles={styles} />;
       case "updates":
         return <Updates goalDetails={goalDetails} styles={styles} />;
       case "tasks":
         return <Tasks goalDetails={goalDetails} styles={styles} />;
       case "timeline":
         return (
           <Timeline
             goalDetails={goalDetails}
             onFilterTasks={() => {}}
             styles={styles}
           />
         );
       case "metrics":
         return <Metrics goalDetails={goalDetails} styles={styles} />;
       case "ressources":
         return <Resources goalDetails={goalDetails} styles={styles} />;
       default:
         return null;
     }
   };

   return (
     <div className="p-6 h-[calc(90vh-200px)] overflow-y-auto">
       {renderContent()}
     </div>
   );
 };