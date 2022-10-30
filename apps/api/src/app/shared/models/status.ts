import { Schedule } from './schedule';

export interface Status {
  temp: number;
  ts: string /* Date */;
  schedule?: Schedule;
}
