import { Schedule, ScheduleRequest } from '../shared/models';
import db from 'cyclic-dynamodb';
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
import { Logger } from '../shared/logger';
import { HttpException, HttpStatus } from '../shared/exceptions/http-exception';
import { CyclicCollection, CyclicItem } from '../shared/types/cyclic-item';
import { DbSchedule, fromDb, toDb } from '../shared/models/db/schedule';
import { TStatus } from '../shared/types/status';

type Unit = 'd' | 'w' | 'm';

// in order to be able to query exactly the days which are present (to not get keys which are not available)
// key: <ID>_YYYY, value: ["20221001","20221002"]
// collection would contain (per ID) 1 entry per year = 365 * 11 + 2 = 4017 bytes
// const COLL_STATUS_DAYS = 'statusDays';

// key: <ID>_<UUID>, value: {"from":"2022-10-03T10:00:00Z","priority":1,"set":19,"rUnit":"w","rDays":[0,1,2,3,4],"rFrom":"0700","rTo":"1700"} -> for recurring setting
// key: <ID>_<UUID>, value: {"from":"2022-10-03T10:00:00Z","to":"2022-10-03T16:00:00Z","priority":10,"set":21} -> for one-time setting
const COLL_SCHEDULE = 'schedule';

export class ScheduleService {
  private readonly logger = new Logger(ScheduleService.name);

  constructor() {}

  async getSchedule(scheduleId: string): Promise<Schedule> {
    const schedule: CyclicItem<DbSchedule> = await db.collection(COLL_SCHEDULE).get(scheduleId);
    if (!schedule) {
      throw new HttpException(
        `Could not get schedule with ID ${scheduleId}`,
        HttpStatus.NOT_FOUND,
      );
    }

    return fromDb(schedule);
  }

  /**
   * Handles when thermostat send a status.
   * @param id
   */
  async getSchedules(id: string, status: TStatus = 'active'): Promise<Schedule[]> {
    const activeSchedules = await this.getSchedulesWithStatus(id, status, true);
    return activeSchedules;
  }

  async createSchedule(
    id: string,
    request: ScheduleRequest,
  ): Promise<Schedule> {
    // key: <ID>_<UUID>, value: {"from":"2022-10-03T10:00:00Z","priority":1,"set":19,"rUnit":"w","rDays":[0,1,2,3,4],"rFrom":"0700","rTo":"1700"} -> for recurring setting
    const key = `${id}_${uuid()}`;
    const schedules = await this.getAllSchedules(id);
    const priority =
      schedules.reduce((prev, curr) => Math.max(prev, curr.priority), 0) + 1;
    await db.collection(COLL_SCHEDULE).set(key, toDb(request));
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
        HttpStatus.NOT_FOUND,
      );
    }
  }

  async updateSchedule(
    scheduleId: string,
    request: Partial<Schedule>,
  ): Promise<Schedule> {
    // key: <ID>_<UUID>, value: {"from":"2022-10-03T10:00:00Z","priority":1,"set":19,"rUnit":"w","rDays":[0,1,2,3,4],"rFrom":"0700","rTo":"1700"} -> for recurring setting
    const schedule: CyclicItem<DbSchedule> = await db.collection(COLL_SCHEDULE).get(scheduleId);
    if (!schedule) {
      throw new HttpException(
        `Could not find schedule with ID ${scheduleId}`,
        HttpStatus.NOT_FOUND,
      );
    }
    await db.collection(COLL_SCHEDULE).set(scheduleId, toDb(request));

    return fromDb(await db.collection(COLL_SCHEDULE).get(scheduleId));
  }

  private async getAllSchedules(id: string): Promise<Schedule[]> {
    // TODO solve with filter
    const briefScheduleItems: CyclicCollection<DbSchedule> = await db
      .collection(COLL_SCHEDULE)
      .list();
    const briefSchedules = briefScheduleItems.results.filter((item) =>
      item.key.startsWith(`${id}_`),
    );
    const schedules = (await Promise.all(
      briefSchedules.map((sch) => db.collection(COLL_SCHEDULE).get(sch.key)),
    )) as CyclicItem<DbSchedule>[];
    schedules.sort((a, b) => a.props.priority - b.props.priority);

    return schedules.map(fromDb);
  }

  /**
   * Returns schedules in effect.
   *
   * @param id Thermostat Id
   * @param status Statuses of schedules to be returned
   * @param cleanup If obsolete schedules should be cleaned up
   * @returns {Promise<Schedule[]>}
   */
  private async getSchedulesWithStatus(id: string, status: TStatus, cleanup?: boolean): Promise<Schedule[]> {
    let schedules = await this.getAllSchedules(id);
    if (cleanup) {
      schedules = await this.deleteObsoleteSchedules(schedules);
    }
    const now = new Date();
    return status === 'active' ? (schedules || [])
      .filter(
        (schedule) =>
          (!schedule.from || !isAfter(parseISO(schedule.from), now)) &&
          (!schedule.to || !isBefore(parseISO(schedule.to), now)),
      )
      .filter(
        (schedule) =>
          !schedule.recurring?.unit ||
          this.recurringToday(
            now,
            parseISO(schedule.from),
            schedule.recurring.unit,
            schedule.recurring.count,
            schedule.recurring.from,
            schedule.recurring.to,
          ) ||
          this.recurringThisWeek(
            now,
            parseISO(schedule.from),
            schedule.recurring.unit,
            schedule.recurring.count,
            schedule.recurring.days,
            schedule.recurring.from,
            schedule.recurring.to,
          ) ||
          this.recurringThisMonth(
            now,
            parseISO(schedule.from),
            schedule.recurring.unit,
            schedule.recurring.count,
            schedule.recurring.days,
            schedule.recurring.from,
            schedule.recurring.to,
          ),
      ) : schedules;
  }

  async deleteObsoleteSchedules(schedules: Schedule[]): Promise<Schedule[]> {
    const now = new Date();
    const toDelete: Schedule[] = [];
    const filteredSchedules = schedules.filter((schedule) => {
      if (schedule.to && isAfter(now, parseISO(schedule.to))) {
        toDelete.push(schedule);
        return false;
      }
      return true;
    });

    await Promise.all(
      toDelete.map((schedule) =>
        db.collection(COLL_SCHEDULE).delete(schedule.id),
      ),
    );
    return filteredSchedules;
  }

  /**
   *
   * @param {string} id
   * @returns {Promise<Schedule | undefined>}
   */
  async getEffectiveSchedule(id: string): Promise<Schedule> {
    const schedules = await this.getSchedulesWithStatus(id, 'active', false);
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
    rTo?: string,
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
    rTo?: string,
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
    rTo?: string,
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
