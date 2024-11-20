export const timeRangeOptions = [
  { value: '1w', label: '7 derniers jours' },
  { value: '1m', label: '30 derniers jours' },
  { value: '3m', label: '3 derniers mois' },
  { value: '6m', label: '6 derniers mois' },
  { value: '1y', label: 'Année' },
] as const;

export type TimeRange = typeof timeRangeOptions[number]['value']; 