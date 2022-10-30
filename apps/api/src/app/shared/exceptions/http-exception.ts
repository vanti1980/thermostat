export class HttpException {
  constructor(private readonly msg: string, private readonly status: HttpStatus) {}
}

export enum HttpStatus {
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  NOT_FOUND = 404
}
