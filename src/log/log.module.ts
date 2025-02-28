import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Schema } from 'mongoose';

import { LogController } from '@app/log/log.controller';
import { LogService } from '@app/log/log.service';
import { Log, LogSchema } from '@app/log/schemas/log.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Log.name,
        schema: LogSchema as Schema,
      },
    ]),
  ],
  controllers: [LogController],
  providers: [LogService],
  exports: [LogService],
})
export class LogModule {}
