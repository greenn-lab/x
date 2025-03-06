import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TerminusModule } from '@nestjs/terminus';
import { TypeOrmModule } from '@nestjs/typeorm';

import { HealthController } from '@app/health/health.controller';
import { HealthService } from '@app/health/health.service';

@Module({
  imports: [
    TerminusModule,
    HttpModule,
    TypeOrmModule.forFeature([]),
    MongooseModule,
  ],
  controllers: [HealthController],
  providers: [HealthService],
})
export class HealthModule {}
