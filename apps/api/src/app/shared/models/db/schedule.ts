import { CyclicItem } from "../../types/cyclic-item";
import { Schedule } from "../schedule";

export interface DbSchedule {
  priority: number;
  from: string;
  to: string;
  set: number;
  rUnit: 'd' | 'w' | 'm';
  rCount: number;
  rDays: number[];
  rFrom: string;
  rTo: string;

}

export function fromDb(dbSchedule: CyclicItem<DbSchedule>): Schedule {
  return {
    id: dbSchedule.key.substring(dbSchedule.key.lastIndexOf('_') + 1),
    priority: dbSchedule.props.priority,
    set: dbSchedule.props.set,
    from: dbSchedule.props.from,
    to: dbSchedule.props.to,
    recurring: dbSchedule.props.rUnit
      ? {
          unit: dbSchedule.props.rUnit,
          count: dbSchedule.props.rCount,
          days: dbSchedule.props.rDays,
          from: dbSchedule.props.rFrom,
          to: dbSchedule.props.rTo,
        }
      : undefined,
  };
}

export function toDb(request: Partial<Schedule>): DbSchedule {
  return {
    from: request.from,
    to: request.to,
    priority: request.priority,
    set: request.set,
    rUnit: request.recurring?.unit,
    rCount: request.recurring?.count,
    rDays: request.recurring?.days,
    rFrom: request.recurring?.from,
    rTo: request.recurring?.to,
  };
}
