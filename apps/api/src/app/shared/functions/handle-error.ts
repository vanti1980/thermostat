import { Response } from 'express';
import { HttpStatus } from '../exceptions/http-exception';
import { Logger } from '../logger';

export function handleError(msg: string, res: Response, logger: Logger) {
  return function (err: any) {
    logger.error(msg, err);
    res.statusCode = err.status || HttpStatus.BAD_REQUEST;
    return res
      .json(msg)
      .status(err.status || HttpStatus.BAD_REQUEST)
      .end();
  };
}
