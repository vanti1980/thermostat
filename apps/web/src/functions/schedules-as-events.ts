import { EventInput } from '@fullcalendar/core';
import {
  add,
  differenceInCalendarDays,
  differenceInCalendarMonths,
  differenceInCalendarWeeks,
  formatISO,
  getDate,
  getDay,
  isAfter,
  isBefore,
  nextFriday,
  parseISO,
  set,
} from 'date-fns';
import { Schedule } from '../types';

type Unit = 'd' | 'w' | 'm';
const BG_COLORS = [
  '#3788d8',
  '#88d837',
  '#d83788',
  '#37d888',
  '#3788d8',
]

export function schedulesAsEvents(
  schedules: Schedule[],
  date: Date,
): EventInput[] {
  const filtered = schedules
    .filter(
      (schedule) =>
        (!schedule.from || !isAfter(parseISO(schedule.from), date)) &&
        (!schedule.to || !isBefore(parseISO(schedule.to), date)),
    )
    .filter(
      (schedule) =>
        !schedule.recurring?.unit ||
        recurringOnDate(
          date,
          schedule.from ? parseISO(schedule.from) : undefined,
          schedule.recurring.unit,
          schedule.recurring.count,
          schedule.recurring.from!,
          schedule.recurring.to!,
        ) ||
        recurringInWeek(
          date,
          schedule.from ? parseISO(schedule.from) : undefined,
          schedule.recurring.unit,
          schedule.recurring.count,
          schedule.recurring.days,
          schedule.recurring.from!,
          schedule.recurring.to!,
        ) ||
        recurringInMonth(
          date,
          schedule.from ? parseISO(schedule.from) : undefined,
          schedule.recurring.unit,
          schedule.recurring.count,
          schedule.recurring.days,
          schedule.recurring.from!,
          schedule.recurring.to!,
        ),
    )
    .map((schedule) => ({
      id: schedule.id,
      title: `${schedule.set} °C`,
      start: schedule.recurring?.from
        ? dateWithHoursMins(date, schedule.recurring?.from)
        : parseISO(schedule.from!),
      end: schedule.recurring?.to
        ? dateWithHoursMins(date, schedule.recurring?.to)
        : parseISO(schedule.to!),
      backgroundColor: BG_COLORS[0],
    }))
    .reverse();

  for (let ix = 0; ix < filtered.length; ix++) {
    const curr = filtered[ix];

    const prevs = filtered.slice(0, ix);
    for (let prevIx = 0; prevIx < prevs.length; prevIx++) {
      const prev = prevs[prevIx];
      if (isBefore(curr.start, prev.start)) {
        if (isBefore(curr.end, prev.end)) {
          prev.start = add(curr.end, { seconds: 1});
        } else {
          // remove prev
          filtered.splice(prevIx, 1);
          prevIx--;
          continue;
        }
      } else if (isAfter(curr.start, prev.start)) {
        const prevColorIx = BG_COLORS.findIndex(bgColor => bgColor === prev.backgroundColor);
        if (isBefore(curr.end, prev.end)) {
          filtered.splice(prevIx + 1, 0, {
            ...prev,
            start: add(curr.end, { seconds: 1 }),
            end: prev.end,
          });
          curr.backgroundColor = prevColorIx >= 0 ? BG_COLORS[prevColorIx + 1] : BG_COLORS[0];
        }
        if (isBefore(curr.start, prev.end)) {
          prev.end = add(curr.start, { seconds: -1 });
        }
      }
    }
  }

  return filtered.map(
    (event) =>
      ({
        ...event,
        start: formatISO(event.start),
        end: formatISO(event.end),
      } as EventInput),
  );
}

/**
 *
 * @param {Date} now
 * @param {Date} from
 * @param {'d'|'w'|'m'} rUnit Unit
 * @param {number} rCount
 * @param {string} rFrom
 * @param {string} rTo
 * @returns {boolean}
 */
function recurringOnDate(
  now: Date,
  from: Date | undefined,
  rUnit: Unit,
  rCount: number | undefined,
  rFrom: string,
  rTo: string,
): boolean {
  const res =
    rUnit === 'd' &&
    (!from || differenceInCalendarDays(now, from) % (rCount || 1) === 0); /* &&
      inHourMinInterval(now, rFrom, rTo) */
  return res;
}

/**
 *
 * @param {Date} now
 * @param {Date} from
 * @param {'d'|'w'|'m'} rUnit Unit
 * @param {number} rCount
 * @param {Array<number>} rDays
 * @param {string} rFrom
 * @param {string} rTo
 * @returns {boolean}
 */
function recurringInWeek(
  now: Date,
  from: Date | undefined,
  rUnit: Unit,
  rCount: number | undefined,
  rDays: number[] | undefined,
  rFrom: string,
  rTo: string,
) {
  const res =
    rUnit === 'w' &&
    (!from || differenceInCalendarWeeks(now, from) % (rCount || 1) === 0) &&
    (rDays || []).includes(getDay(now)); /* &&
      inHourMinInterval(now, rFrom, rTo) */
  return res;
}

/**
 *
 * @param {Date} now
 * @param {Date} from
 * @param {'d'|'w'|'m'} rUnit Unit
 * @param {number} rCount
 * @param {Array<number>} rDays
 * @param {string} rFrom
 * @param {string} rTo
 * @returns {boolean}
 */
function recurringInMonth(
  now: Date,
  from: Date | undefined,
  rUnit: Unit,
  rCount: number | undefined,
  rDays: number[] | undefined,
  rFrom: string,
  rTo: string,
): boolean {
  return (
    rUnit === 'm' &&
    (!from || differenceInCalendarMonths(now, from) % (rCount || 1) === 0) &&
    (rDays || []).includes(getDate(now)) /* &&
      inHourMinInterval(now, rFrom, rTo) */
  );
}

/**
 *
 * @param date
 * @param {string} hourMin
 * @returns {Date}
 */
function dateWithHoursMins(date: Date, hourMin: string): Date {
  return set(date, {
    hours: +hourMin.substring(0, 2),
    minutes: +hourMin.substring(2, 4),
    seconds: 0,
    milliseconds: 0,
  });
}

/**
 *
 * @param {Date} now
 * @param {string} rFrom
 * @param {string} rTo
 * @returns {boolean}
 */
function inHourMinInterval(date: Date, rFrom: string, rTo: string): boolean {
  return (
    isBefore(dateWithHoursMins(date, rFrom), date) &&
    isAfter(dateWithHoursMins(date, rTo), date)
  );
}
