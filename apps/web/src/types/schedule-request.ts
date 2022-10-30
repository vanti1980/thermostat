import { Recurring } from './recurring';

export interface ScheduleRequest {
  from?: string /* Date */;
  to?: string /* Date */;
  set: number;
  recurring?: Recurring;
}
