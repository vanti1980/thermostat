import { ScheduleRequest } from './schedule-request';

export interface Schedule extends ScheduleRequest {
  id: string;
  priority: number;
}
