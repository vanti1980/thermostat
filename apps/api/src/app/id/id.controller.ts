import express, { Request, Response } from 'express';
import { HttpStatus } from '../shared/exceptions/http-exception';
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
      .catch((err) => {
        this.logger.error(`Could not query IDs`, err);
        res.json(`Could not query IDs`).status(HttpStatus.BAD_REQUEST).end();
      });
  }

  async createId(req: Request, res: Response): Promise<void> {
    const id = req.body;
    this.idService
      .createId(id)
      .then((val) => res.json(val).end())
      .catch((err) => {
        this.logger.error(`Could not create ID ${id}`, err);
        res
          .json(`Could not create ID ${id}`)
          .status(HttpStatus.BAD_REQUEST)
          .end();
      });
  }
}
