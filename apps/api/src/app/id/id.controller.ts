import express, { Request, Response } from 'express';
import { HttpStatus } from '../shared/exceptions/http-exception';
import { handleError } from '../shared/functions/handle-error';
import { Logger } from '../shared/logger';
import { IdService } from './id.service';
export class IdController {
  private readonly logger = new Logger(IdController.name);

  constructor(readonly app: express.Express, private idService: IdService) {
    app.get('/api/id', this.getIds.bind(this));
    app.post('/api/id', this.createId.bind(this));
  }

  async getIds(req: Request, res: Response): Promise<void> {
    this.idService
      .getIds()
      .then((val) => res.json(val).end())
      .catch(handleError(`Could not query IDs`, res, this.logger));
  }

  async createId(req: Request, res: Response): Promise<void> {
    const id = req.body;
    this.idService
      .createId(id)
      .then((val) => res.json(val).end())
      .catch(handleError(`Could not create ID ${id}`, res, this.logger));
  }
}
