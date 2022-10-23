import { Schedule, ScheduleRequest } from '@models';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import * as db from 'cyclic-dynamodb';
import { v4 as uuid } from 'uuid';

import {
  differenceInCalendarDays,
  differenceInCalendarMonths,
  differenceInCalendarWeeks,
  getDate,
  getDay,
  isAfter,
  isBefore,
  parseISO,
  set,
} from 'date-fns';

type Unit = 'd' | 'w' | 'm';

// in order to be able to query exactly the days which are present (to not get keys which are not available)
// key: <ID>_YYYY, value: ["20221001","20221002"]
// collection would contain (per ID) 1 entry per year = 365 * 11 + 2 = 4017 bytes
// const COLL_STATUS_DAYS = 'statusDays';

// key: <ID>_<UUID>, value: {"from":"2022-10-03T10:00:00Z","priority":1,"set":19,"rUnit":"w","rDays":[0,1,2,3,4],"rFrom":"0700","rTo":"1700"} -> for recurring setting
// key: <ID>_<UUID>, value: {"from":"2022-10-03T10:00:00Z","to":"2022-10-03T16:00:00Z","priority":10,"set":21} -> for one-time setting
const COLL_SCHEDULE = 'schedule';

@Injectable()
export class ScheduleService {
  private readonly logger = new Logger(ScheduleService.name);

  constructor() {}

  /**
   * Handles when thermostat send a status.
   *
   * @param {Request} req
   * @param {Response} res
   */
  async getSchedules(id: string): Promise<Schedule[]> {
    return await this.getActiveSchedules(id);
  }

  async createSchedule(
    id: string,
    request: ScheduleRequest
  ): Promise<Schedule> {
    // key: <ID>_<UUID>, value: {"from":"2022-10-03T10:00:00Z","priority":1,"set":19,"rUnit":"w","rDays":[0,1,2,3,4],"rFrom":"0700","rTo":"1700"} -> for recurring setting
    const key = `${id}_${uuid()}`;
    const priority =
      (await db.collection(COLL_SCHEDULE).list()).results.length + 1;
    await db.collection(COLL_SCHEDULE).set(key, {
      from: request.from,
      to: request.to,
      priority,
      set: request.set,
      rUnit: request.recurring?.unit,
      rCount: request.recurring?.count,
      rDays: request.recurring?.days,
      rFrom: request.recurring?.from,
      rTo: request.recurring?.to,
    });
    return {
      ...request,
      id: key,
      priority,
    };
  }

  async deleteSchedule(scheduleId: string): Promise<void> {
    const schedule = await db.collection(COLL_SCHEDULE).delete(scheduleId);
    if (!schedule) {
      throw new HttpException(
        `Could not delete schedule with ID ${scheduleId}`,
        HttpStatus.NOT_FOUND
      );
    }
  }

  async updateSchedule(
    scheduleId: string,
    request: Schedule
  ): Promise<Schedule> {
    // key: <ID>_<UUID>, value: {"from":"2022-10-03T10:00:00Z","priority":1,"set":19,"rUnit":"w","rDays":[0,1,2,3,4],"rFrom":"0700","rTo":"1700"} -> for recurring setting
    const schedule = await db.collection(COLL_SCHEDULE).get(scheduleId);
    if (!schedule) {
      throw new HttpException(
        `Could not find schedule with ID ${scheduleId}`,
        HttpStatus.NOT_FOUND
      );
    }
    const updatedSchedule = {
      ...schedule,
      from: request.from,
      to: request.to,
      set: request.set,
      rUnit: request.recurring?.unit,
      rCount: request.recurring?.count,
      rDays: request.recurring?.days,
      rFrom: request.recurring?.from,
      rTo: request.recurring?.to,
    };
    await db.collection(COLL_SCHEDULE).set(scheduleId, updatedSchedule);
    return updatedSchedule;
  }

  /**
   * Returns schedules in effect.
   *
   * @param {string} id Thermostat ID
   * @returns {Promise<Schedule[]>}
   */
  private async getActiveSchedules(id: string): Promise<Schedule[]> {
    // TODO solve with filter
    const briefScheduleItems = await db.collection(COLL_SCHEDULE).list();
    const briefSchedules = briefScheduleItems.results.filter((item) =>
      item.key.startsWith(`${id}_`)
    );
    const schedules = await Promise.all(
      briefSchedules.map((sch) => db.collection(COLL_SCHEDULE).get(sch.key))
    );
    schedules.sort((a, b) => a.props.priority - b.props.priority);
    const now = new Date();
    return (schedules || [])
      .map((schedule) => ({ id: schedule.key, ...schedule.props }))
      .filter(
        (props) =>
          (!props.from || !isAfter(parseISO(props.from), now)) &&
          (!props.to || !isBefore(parseISO(props.to), now))
      )
      .filter(
        (props) =>
          !props.rUnit ||
          this.recurringToday(
            now,
            parseISO(props.from),
            props.rUnit,
            props.rCount,
            props.rFrom,
            props.rTo
          ) ||
          this.recurringThisWeek(
            now,
            parseISO(props.from),
            props.rUnit,
            props.rCount,
            props.rDays,
            props.rFrom,
            props.rTo
          ) ||
          this.recurringThisMonth(
            now,
            parseISO(props.from),
            props.rUnit,
            props.rCount,
            props.rDays,
            props.rFrom,
            props.rTo
          )
      );
  }

  /**
   *
   * @param {string} id
   * @returns {Promise<Schedule | undefined>}
   */
  async getEffectiveSchedule(id: string): Promise<Schedule> {
    const schedules = await this.getActiveSchedules(id);
    return schedules.pop();
  }

  /**
   *
   * @param {Date} now
   * @param {string} rFrom
   * @param {string} rTo
   * @returns {boolean}
   */
  private inHourMinInterval(now: Date, rFrom?: string, rTo?: string): boolean {
    return (
      isBefore(this.todayHoursMins(rFrom), now) &&
      isAfter(this.todayHoursMins(rTo), now)
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
  private recurringToday(
    now: Date,
    from: Date,
    rUnit: Unit,
    rCount?: number,
    rFrom?: string,
    rTo?: string
  ): boolean {
    return (
      rUnit === 'd' &&
      differenceInCalendarDays(now, from) % (rCount || 1) === 0 &&
      this.inHourMinInterval(now, rFrom, rTo)
    );
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
  private recurringThisWeek(
    now: Date,
    from: Date,
    rUnit: Unit,
    rCount: number | undefined,
    rDays: number[],
    rFrom?: string,
    rTo?: string
  ) {
    return (
      rUnit === 'w' &&
      differenceInCalendarWeeks(now, from) % (rCount || 1) === 0 &&
      (rDays || []).includes(getDay(now)) &&
      this.inHourMinInterval(now, rFrom, rTo)
    );
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
  private recurringThisMonth(
    now: Date,
    from: Date,
    rUnit: Unit,
    rCount: number | undefined,
    rDays: number[],
    rFrom?: string,
    rTo?: string
  ): boolean {
    return (
      rUnit === 'm' &&
      differenceInCalendarMonths(now, from) % (rCount || 1) === 0 &&
      (rDays || []).includes(getDate(now)) &&
      this.inHourMinInterval(now, rFrom, rTo)
    );
  }

  /**
   *
   * @param {string} hourMin
   * @returns {Date}
   */
  private todayHoursMins(hourMin: string): Date {
    return set(new Date(), {
      hours: +hourMin.substring(0, 2),
      minutes: +hourMin.substring(2, 4),
    });
  }
}
