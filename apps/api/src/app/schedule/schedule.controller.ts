import { Schedule, ScheduleRequest } from '@models';
import { Body, Controller, Delete, Get, Headers, Param, Post, Put } from '@nestjs/common';
import { IdService } from '../id/id.service';
import { ScheduleService } from './schedule.service';

@Controller('schedules')
export class ScheduleController {
  constructor(private idSvc: IdService, private scheduleSvc: ScheduleService) {}

  @Get('') async getSchedules(@Headers('id') id: string): Promise<Schedule[]> {
    return this.idSvc
      .checkValidId(id)
      .then(() => this.scheduleSvc.getSchedules(id));
  }

  @Post('') async createSchedule(
    @Headers('id') id: string,
    @Body() scheduleRequest: ScheduleRequest
  ): Promise<Schedule> {
    return this.idSvc
      .checkValidId(id)
      .then(() => this.scheduleSvc.createSchedule(id, scheduleRequest));
  }

  @Delete(':scheduleId') async deleteSchedule(
    @Headers('id') id: string,
    @Param('scheduleId') scheduleId: string,
  ): Promise<void> {
    return this.idSvc
      .checkValidId(id)
      .then(() => this.scheduleSvc.deleteSchedule(scheduleId));
  }

  @Put(':scheduleId') async updateSchedule(
    @Headers('id') id: string,
    @Param('scheduleId') scheduleId: string,
    @Body() schedule: Schedule
  ): Promise<Schedule> {
    return this.idSvc
      .checkValidId(id)
      .then(() => this.scheduleSvc.updateSchedule(scheduleId, schedule));
  }

}
