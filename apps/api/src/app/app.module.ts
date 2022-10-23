import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';

import * as path from 'path';

import { IdModule } from './id/id.module';
import { ScheduleModule } from './schedule/schedule.module';
import { StatusModule } from './status/status.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: path.join(__dirname, '..', 'web'),
      exclude: ['/api*'],
      serveStaticOptions: {
        dotfiles: 'ignore',
        etag: false,
        extensions: [
          'htm',
          'html',
          'css',
          'js',
          'ico',
          'jpg',
          'jpeg',
          'png',
          'svg',
        ],
        index: ['index.html'],
        maxAge: '1m',
        redirect: false,
      },
    }),
    ConfigModule.forRoot(),
    // AuthModule,
    // LogsModule,
    IdModule,
    ScheduleModule,
    StatusModule,
  ],
})
export class AppModule {}
