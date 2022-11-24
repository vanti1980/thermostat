import express, { Request, Response } from 'express';
import { IdService } from '../id/id.service';
import { handleError } from '../shared/functions/handle-error';
import { Logger } from '../shared/logger';
import { StatusRequest } from '../shared/models';
import { StatusService } from './status.service';

export class StatusController {
  private readonly logger = new Logger(StatusController.name);

  constructor(
    readonly app: express.Express,
    private idSvc: IdService,
    private statusSvc: StatusService,
  ) {
    app.get('/api/status', this.getStatus.bind(this));
    app.post('/api/status', this.postStatus.bind(this));
    app.get('/api/statuses', this.getStatuses.bind(this));
  }

  async getStatus(req: Request, res: Response): Promise<Response> {
    const id = req.headers.id as string;

    return this.idSvc
      .checkValidId(id)
      .then(() => this.statusSvc.getStatus(id))
      .then((val) => res.json(val).end())
      .catch(handleError(`Could not query status`, res, this.logger));
  }

  async postStatus(req: Request, res: Response): Promise<Response> {
    const id = req.headers.id as string;
    const statusRequest: StatusRequest = req.body;

    return this.idSvc
      .checkValidId(id)
      .then(() => this.statusSvc.postStatus(id, statusRequest))
      .then((status) => res.json(status).end())
      .catch(handleError(`Could not create status`, res, this.logger));
  }

  async getStatuses(req: Request, res: Response): Promise<Response> {
    const id = req.headers.id as string;
    const from = req.query.from as string;
    const to = req.query.to as string;
    return this.idSvc
      .checkValidId(id)
      .then(() => this.statusSvc.getStatuses(id, from, to))
      .then((statuses) => res.json(statuses).end())
      .catch(handleError(`Could not query statuses`, res, this.logger));
  }
}
