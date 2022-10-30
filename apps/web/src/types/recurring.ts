export interface Recurring {
  unit: 'd' | 'w' | 'm';
  count?: number;
  days?: number[];
  from?: string /* Date */;
  to?: string /* Date */;
}
