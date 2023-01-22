import { Schedule, ScheduleRequest } from '../shared/models';

import express, { Request, Response } from 'express';
import { IdService } from '../id/id.service';
import { HttpException, HttpStatus } from '../shared/exceptions/http-exception';
import { Logger } from '../shared/logger';
import { ScheduleService } from './schedule.service';
import { handleError } from '../shared/functions/handle-error';
import { ScheduleOrderRequest } from '../shared/models/schedule-order-request';

export class ScheduleController {
  private readonly logger = new Logger(ScheduleController.name);

  constructor(
    readonly app: express.Express,
    private idSvc: IdService,
    private scheduleSvc: ScheduleService,
  ) {
    app.get('/api/schedule', this.getSchedules.bind(this));
    app.patch('/api/schedule', this.reorderSchedules.bind(this));
    app.post('/api/schedule', this.createSchedule.bind(this));
    app.get('/api/schedule/:scheduleId', this.getSchedule.bind(this));
    app.delete('/api/schedule/:scheduleId', this.deleteSchedule.bind(this));
    app.patch('/api/schedule/:scheduleId', this.updateSchedule.bind(this));
  }

  async getSchedules(req: Request, res: Response): Promise<Response> {
    const id = req.headers.id as string;
    const status = req.query.status as string || 'all';
    if (status !== 'active' && status !== 'all') {
      throw new HttpException(
        `Invalid status parameter. Allowed values: active | all`,
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.idSvc
      .checkValidId(id)
      .then(() => this.scheduleSvc.getSchedules(id, status))
      .then((schedules) => res.json(schedules).end())
      .catch(handleError(`Could not query schedules`, res, this.logger));
  }

  async reorderSchedules(req: Request, res: Response): Promise<Response> {
    const id = req.headers.id as string;
    const scheduleRequest: ScheduleOrderRequest[] = req.body;

    return this.idSvc
      .checkValidId(id)
      .then(() => this.scheduleSvc.reorderSchedules(id, scheduleRequest))
      .then(() => res.status(201).end())
      .catch(handleError(`Could not reorder schedules`, res, this.logger));
  }

  async getSchedule(req: Request, res: Response): Promise<Response> {
    const id = req.headers.id as string;
    const scheduleId = req.params.scheduleId;

    return this.idSvc
      .checkValidId(id)
      .then(() => this.scheduleSvc.getSchedule(`${id}_${scheduleId}`))
      .then((schedule) => {
        if (!schedule) {
          throw new HttpException(
            `Schedule with ID ${scheduleId} does not exist`,
            HttpStatus.NOT_FOUND,
          );
        }
        return schedule;
      })
      .then((schedule) => res.json(schedule).end())
      .catch(
        handleError(
          `Could not get schedule with ID ${scheduleId}`,
          res,
          this.logger,
        ),
      );
  }

  async createSchedule(req: Request, res: Response): Promise<Response> {
    const id = req.headers.id as string;
    const scheduleRequest: ScheduleRequest = req.body;

    return this.idSvc
      .checkValidId(id)
      .then(() => this.scheduleSvc.createSchedule(id, scheduleRequest))
      .then((schedule) => res.json(schedule).end())
      .catch(handleError(`Could not create schedule`, res, this.logger));
  }

  async deleteSchedule(req: Request, res: Response): Promise<Response> {
    const id = req.headers.id as string;
    const scheduleId = req.params.scheduleId;

    return this.idSvc
      .checkValidId(id)
      .then(() => this.scheduleSvc.getSchedule(`${id}_${scheduleId}`))
      .then((existingSched) => {
        if (!existingSched) {
          throw new HttpException(
            `Schedule with ID ${scheduleId} does not exist`,
            HttpStatus.NOT_FOUND,
          );
        }
        return existingSched;
      })
      .then(() => this.scheduleSvc.deleteSchedule(`${id}_${scheduleId}`))
      .then(() => res.status(HttpStatus.NO_CONTENT).end())
      .catch(
        handleError(
          `Could not delete schedule with ID ${scheduleId}`,
          res,
          this.logger,
        ),
      );
  }

  async updateSchedule(req: Request, res: Response): Promise<Response> {
    const id = req.headers.id as string;
    const schedule: Schedule = req.body;
    const scheduleId = req.params.scheduleId;

    return this.idSvc
      .checkValidId(id)
      .then(() =>
        this.scheduleSvc.updateSchedule(`${id}_${scheduleId}`, schedule),
      )
      .then((schedule) => res.json(schedule).end())
      .catch(
        handleError(
          `Could not update schedule with ID ${scheduleId}`,
          res,
          this.logger,
        ),
      );
  }
}
