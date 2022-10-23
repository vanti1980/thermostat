import { Module } from '@nestjs/common';

import { IdModule } from '../id/id.module';
import { ScheduleModule } from '../schedule/schedule.module';
import { StatusController } from './status.controller';
import { StatusService } from './status.service';

@Module({
  imports: [IdModule, ScheduleModule],
  controllers: [StatusController],
  providers: [StatusService],
  exports: [StatusService],
})
export class StatusModule {}
