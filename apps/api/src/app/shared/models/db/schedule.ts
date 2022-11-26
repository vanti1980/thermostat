import { CyclicItem } from '../../types/cyclic-item';
import { Schedule } from '../schedule';

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

export function toDb(request: Partial<Schedule>): Partial<DbSchedule> {
  const res: Partial<DbSchedule> = {};
  if (request.from) {
    res.from = request.from;
  }
  if (request.to) {
    res.to = request.to;
  }
  if (request.priority) {
    res.priority = request.priority;
  }
  if (request.set) {
    res.set = request.set;
  }
  if (request.recurring?.unit) {
    res.rUnit = request.recurring?.unit;
  }
  if (request.recurring?.count) {
    res.rCount = request.recurring?.count;
  }
  if (request.recurring?.days) {
    res.rDays = request.recurring?.days;
  }
  if (request.recurring?.from) {
    res.rFrom = request.recurring?.from;
  }
  if (request.recurring?.to) {
    res.rTo = request.recurring?.to;
  }

  return res;
}
