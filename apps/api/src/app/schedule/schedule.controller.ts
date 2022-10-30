import { Schedule, ScheduleRequest } from '../shared/models';

import express, { Request, Response } from 'express';
import { IdService } from '../id/id.service';
import { HttpStatus } from '../shared/exceptions/http-exception';
import { Logger } from '../shared/logger';
import { ScheduleService } from './schedule.service';

export class ScheduleController {
  private readonly logger = new Logger(ScheduleController.name);

  constructor(
    readonly app: express.Express,
    private idSvc: IdService,
    private scheduleSvc: ScheduleService,
  ) {
    app.get('/api/schedule', this.getSchedules.bind(this));
    app.post('/api/schedule', this.createSchedule.bind(this));
    app.delete('/api/schedule/:scheduleId', this.deleteSchedule.bind(this));
    app.put('/api/schedule/:scheduleId', this.updateSchedule.bind(this));
  }

  async getSchedules(req: Request, res: Response): Promise<void> {
    const id = req.headers.id as string;
    this.idSvc
      .checkValidId(id)
      .then(() => this.scheduleSvc.getSchedules(id))
      .then((schedules) => res.json(schedules).end())
      .catch((err) => {
        this.logger.error(`Could not query schedules`, err);
        res
          .json(`Could not query schedules`)
          .status(HttpStatus.BAD_REQUEST)
          .end();
      });
  }

  async createSchedule(req: Request, res: Response): Promise<Response> {
    const id = req.headers.id as string;
    const scheduleRequest: ScheduleRequest = req.body;

    return this.idSvc
      .checkValidId(id)
      .then(() => this.scheduleSvc.createSchedule(id, scheduleRequest))
      .then((schedule) => res.json(schedule).end())
      .catch((err) => {
        this.logger.error(`Could not create schedule`, err);
        return res
          .json(`Could not create schedule`)
          .status(HttpStatus.BAD_REQUEST)
          .end();
      });
  }

  async deleteSchedule(req: Request, res: Response): Promise<Response> {
    const id = req.headers.id as string;
    const scheduleId = req.params.scheduleId;

    return this.idSvc
      .checkValidId(id)
      .then(() => this.scheduleSvc.deleteSchedule(`${id}_${scheduleId}`))
      .then(() => res.status(HttpStatus.NO_CONTENT).end())
      .catch((err) => {
        this.logger.error(
          `Could not delete schedule with ID ${scheduleId}`,
          err,
        );
        return res
          .json(`Could not delete schedule`)
          .status(HttpStatus.BAD_REQUEST)
          .end();
      });
  }

  async updateSchedule(req: Request, res: Response): Promise<Response> {
    const id = req.headers.id as string;
    const schedule: Schedule = req.body;
    const scheduleId = req.params.scheduleId;

    return this.idSvc
      .checkValidId(id)
      .then(() => this.scheduleSvc.updateSchedule(`${id}_${scheduleId}`, schedule))
      .then(schedule => res.json(schedule).end())
      .catch((err) => {
        this.logger.error(
          `Could not update schedule with ID ${scheduleId}`,
          err,
        );
        return res
          .json(`Could not update schedule`)
          .status(HttpStatus.BAD_REQUEST)
          .end();
      });
  }
}
