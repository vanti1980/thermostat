import express, { Request, Response } from 'express';
import { Status, StatusRequest } from '../shared/models';
import { IdService } from '../id/id.service';
import { StatusService } from './status.service';
import { HttpStatus } from '../shared/exceptions/http-exception';
import { Logger } from '../shared/logger';

export class StatusController {

  private readonly logger = new Logger(StatusController.name);

  constructor(
    readonly app: express.Express,
    private idSvc: IdService,
    private statusSvc: StatusService
  ) {
    app.get('/api/status', this.getStatus.bind(this));
    app.post('/api/status', this.postStatus.bind(this));
    app.get('/api/statuses', this.getStatuses.bind(this));

  }

  async getStatus(req: Request, res: Response): Promise<Response> {
    const id = req.headers.id as string;

    return this.idSvc.checkValidId(id)
    .then(() => this.statusSvc.getStatus(id))
    .then(val => res.json(val).end())
    .catch((err) => {
      this.logger.error(`Could not query status`, err);
      return res.json(`Could not query status`).status(HttpStatus.BAD_REQUEST).end();
    });
  }

  async postStatus(req: Request, res: Response): Promise<Response> {
    const id = req.headers.id as string;
    const statusRequest: StatusRequest = req.body;

    return this.idSvc
      .checkValidId(id)
      .then(() => this.statusSvc.postStatus(id, statusRequest))
      .then(status => res.json(status).end())
      .catch((err) => {
        this.logger.error(`Could not create status`, err);
        return res.json(`Could not create status`).status(HttpStatus.BAD_REQUEST).end();
      });

  }

  async getStatuses(req: Request, res: Response): Promise<Response> {
    const id = req.headers.id as string;
    const from = req.query.from as string;
    const to = req.query.to as string;
    return this.idSvc
      .checkValidId(id)
      .then(() => this.statusSvc.getStatuses(id, from, to))
      .then(statuses => res.json(statuses).end())
      .catch((err) => {
        this.logger.error(`Could not query statuses`, err);
        return res.json(`Could not query statuses`).status(HttpStatus.BAD_REQUEST).end();
      });
  }
}
