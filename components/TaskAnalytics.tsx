 'use client';

 import { useEffect, useState } from 'react';
 import { predictTaskCompletion, subscribeToTaskUpdates } from '@/lib/utils';

 export default function TaskAnalytics({ taskId }: { taskId: string }) {
   const [prediction, setPrediction] = useState<any>(null);

   useEffect(() => {
     // Get initial prediction
     predictTaskCompletion(taskId).then(setPrediction);

     // Subscribe to real-time updates
     const subscription = subscribeToTaskUpdates(taskId, (payload) => {
       // Re-fetch prediction when task is updated
       predictTaskCompletion(taskId).then(setPrediction);
     });

     return () => {
       subscription.unsubscribe();
     };
   }, [taskId]);

   return (
     <div>
       {prediction && (
         <div>
           <h3>Estimated Completion</h3>
           <p>Days: {prediction.estimated_days}</p>
           <p>
             Confidence: {prediction.confidence_range.min} -{' '}
             {prediction.confidence_range.max} days
           </p>
         </div>
       )}
     </div>
   );
 }