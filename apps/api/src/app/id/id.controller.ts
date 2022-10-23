import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Logger,
  Post,
} from '@nestjs/common';
import { IdService } from './id.service';

@Controller('id')
export class IdController {
  constructor(private idService: IdService) {}

  @Get('')
  async getIds(): Promise<string[]> {
    return this.idService.getIds().catch((err) => {
      Logger.error(`Could not query IDs`, err);
      throw new HttpException(
        `Could not query IDs`,
        HttpStatus.BAD_REQUEST
      );
    });
  }

  @Post('')
  async createId(@Body() id: string): Promise<string> {
    return this.idService.createId(id).catch((err) => {
      Logger.error(`Could not create ID ${id}`, err);
      throw new HttpException(
        `Could not create ID ${id}`,
        HttpStatus.BAD_REQUEST
      );
    });
  }
}
