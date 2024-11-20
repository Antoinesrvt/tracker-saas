import { useEffect, useState } from 'react';
import { formatDistance } from 'date-fns';
import { fr } from 'date-fns/locale';

export function useFormattedDate(date: string) {
  const [formattedDate, setFormattedDate] = useState<string>('');

  useEffect(() => {
    setFormattedDate(
      formatDistance(new Date(date), new Date(), {
        addSuffix: true,
        locale: fr,
      })
    );

    // Optional: Update the relative time periodically
    const timer = setInterval(() => {
      setFormattedDate(
        formatDistance(new Date(date), new Date(), {
          addSuffix: true,
          locale: fr,
        })
      );
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, [date]);

  return formattedDate;
} 