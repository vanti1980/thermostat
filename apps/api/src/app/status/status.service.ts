import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { Status, StatusRequest } from '@models';
import * as db from 'cyclic-dynamodb';
import { format, formatISO, set, sub } from 'date-fns';
import { ScheduleService } from '../schedule/schedule.service';

type Unit = 'd' | 'w' | 'm';

// in order to be able to query exactly the days which are present (to not get keys which are not available)
// key: <ID>_YYYY, value: ["20221001","20221002"]
// collection would contain (per ID) 1 entry per year = 365 * 11 + 2 = 4017 bytes
// const COLL_STATUS_DAYS = 'statusDays';

// key: <ID>_<UUID>, value: {"from":"2022-10-03T10:00:00Z","priority":1,"set":19,"rUnit":"w","rDays":[0,1,2,3,4],"rFrom":"0700","rTo":"1700"} -> for recurring setting
// key: <ID>_<UUID>, value: {"from":"2022-10-03T10:00:00Z","to":"2022-10-03T16:00:00Z","priority":10,"set":21} -> for one-time setting
const COLL_SCHEDULE = 'schedule';

// key: <ID>_YYYYMMDD, value: [{"1005":21.5,"1010":21.75}]
// each day a JSON string of 24*12=288 entries (with 5 min refresh), ca. 12*288=3500 bytes
// collection would yearly contain (per ID) 365 entries = 365 * (50 + 3500) = ca. 1.3 MB
const COLL_STATUS = 'status';

const MAX_LOOK_BEHIND = 30;

@Injectable()
export class StatusService {
  private readonly logger = new Logger(StatusService.name);

  constructor(private scheduleSvc: ScheduleService) {}

  async getStatus(id: string): Promise<Status> {
    this.logger.debug(`getStatus id=${id}`);
    const statusColl = db.collection(COLL_STATUS);
    let statusItem: Status | undefined = undefined;
    let iterations = 0;
    let latestDate = new Date();
    do {
      const key = `${id}_${format(latestDate, 'yyyyMMdd')}`;
      statusItem = await statusColl.get(key);
      latestDate = sub(latestDate, {days: 1});
    } while (!statusItem && iterations++ < MAX_LOOK_BEHIND);

    if (statusItem) {
      const latestStatus = this.getStatusesFromItem(statusItem).pop();
      if (latestStatus) {
        return latestStatus;
      } else {
        throw new HttpException(
          'Could not retrieve status because no status found',
          HttpStatus.NOT_FOUND
        );
      }
    } else {
      throw new HttpException(
        'Could not retrieve status because no status found',
        HttpStatus.NOT_FOUND
      );
    }
  }

  async getStatuses(id: string, from?: string, to?: string): Promise<Status[]> {
    this.logger.debug(`getStatuses id=${id}, from=${from}, to=${to}`);
    const briefStatusItems = await db.collection(COLL_STATUS).list();
    const statusItems = await Promise.all(
      briefStatusItems.results
        .filter((item) => item.key.startsWith(`${id}_`))
        .map((item) => db.collection(COLL_STATUS).get(item.key))
    );
    return statusItems.map((item) => this.getStatusesFromItem(item)).flat();
  }

  async postStatus(id: string, statusRequest: StatusRequest): Promise<Status> {
    this.logger.debug(`postStatus id=${id}, statusRequest=${JSON.stringify(statusRequest)}`);
    const now = new Date();
    const key = `${id}_${format(now, 'yyyyMMdd')}`;
    const statusColl = db.collection(COLL_STATUS);
    const props = {};
    props[format(now, 'HHmm')] = statusRequest.temp;
    await statusColl.set(key, props);
    const schedule = await this.scheduleSvc.getEffectiveSchedule(id);
    return {
      temp: statusRequest.temp,
      ts: formatISO(now),
      schedule,
    };
  }

  /**
   *
   * @param {CyclicItem} item
   * @returns {Status[]}
   */
  private getStatusesFromItem(item: any): Status[] {
    return Object.entries(item.props)
      .filter(([key]) => /\d{4}/.test(key))
      .map(([key, value]) => ({
        temp: value as number,
        ts: formatISO(
          set(new Date(), {
            ...this.getStatusKeyDateSetProps(item.key),
            ...this.getStatusValueKeyTimeSetProps(key),
          })
        ),
      }));
  }

  /**
   * Returns status key latter part as properties settable with date-fns.
   * @param {string} key <ID>_yyyyMMdd
   * @returns {object}
   */
  private getStatusKeyDateSetProps(
    key: string
  ): Partial<Parameters<typeof set>[1]> {
    const parts = key.split('_');
    if (parts.length < 2) {
      console.warn(`Invalid status key ${key}!`);
      return {};
    }
    return {
      year: +parts[parts.length - 1].substring(0, 4),
      month: (+parts[parts.length - 1].substring(4, 6)) - 1,
      date: +parts[parts.length - 1].substring(6, 8),
    };
  }

  /**
   * Returns status value key as properties settable with date-fns.
   * @param {string} key HHmm
   * @returns {object}
   */
  private getStatusValueKeyTimeSetProps(
    key: string
  ): Partial<Parameters<typeof set>[1]> {
    return {
      hours: +key.substring(0, 2),
      minutes: +key.substring(2, 4),
      seconds: 0,
      milliseconds: 0,
    };
  }
}
