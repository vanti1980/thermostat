/**
 * Logger facade
 */
export class Logger {

  private _logger = console;

  constructor(private readonly name: string) {
  }

  debug(msg: string, ...optionalParams: any[]) {
    this._logger.debug(`${this.name}: ${msg}`, optionalParams);
  }

  info(msg: string, ...optionalParams: any[]) {
    this._logger.info(`${this.name}: ${msg}`, optionalParams);
  }

  warn(msg: string, ...optionalParams: any[]) {
    this._logger.warn(`${this.name}: ${msg}`, optionalParams);
  }

  error(msg: string, ...optionalParams: any[]) {
    this._logger.error(`${this.name}: ${msg}`, optionalParams);
  }

}

