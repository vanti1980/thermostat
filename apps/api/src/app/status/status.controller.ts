import { Status, StatusRequest } from '@models';
import { Body, Controller, Get, Headers, Post, Query } from '@nestjs/common';
import { IdService } from '../id/id.service';
import { StatusService } from './status.service';

@Controller('')
export class StatusController {
  constructor(private idSvc: IdService, private statusSvc: StatusService) {}

  @Get('status') async getStatus(@Headers('id') id: string): Promise<Status> {
    return this.idSvc.checkValidId(id).then(() => this.statusSvc.getStatus(id));
  }

  @Post('status') async postStatus(
    @Headers('id') id: string,
    @Body() statusRequest: StatusRequest
  ): Promise<Status> {
    return this.idSvc
      .checkValidId(id)
      .then(() => this.statusSvc.postStatus(id, statusRequest));
  }

  @Get('statuses') async getStatuses(
    @Headers('id') id: string,
    @Query('from') from?: string,
    @Query('to') to?: string
  ): Promise<Status[]> {
    return this.idSvc
      .checkValidId(id)
      .then(() => this.statusSvc.getStatuses(id, from, to));
  }
}
