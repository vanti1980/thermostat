import {Body, Controller, Logger, Post, Request} from '@nestjs/common';

interface LogRequest {
  timestamp: number;
  level: 'ERROR' | 'WARN' | 'INFO' | 'DEBUG' | 'TRACE';
  loggingContext: string;
  message: string[];
}

@Controller('logs')
export class LogsController {
  constructor() {}

  private readonly logger = new Logger();

  @Post() async log(@Body() req: LogRequest[]) {

    req.forEach(logReq => {
      let log: (msg: string, ctx: string) => void = undefined;
      switch (logReq.level) {
        case 'TRACE':
          log = this.logger.verbose;
          break;
        case 'DEBUG':
          log = this.logger.debug;
          break;
        case 'INFO':
          log = this.logger.log;
          break;
        case 'WARN':
          log = this.logger.warn;
          break;
        case 'ERROR':
          log = this.logger.error;
          break;
      }
      log.bind(this.logger)(`${new Date(logReq.timestamp)} ${logReq.message.join(',')}`, logReq.loggingContext);
    });
  }
}
