import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthGuard } from '@app/auth/guards/auth.guard';
import { MemberGuard } from '@app/auth/guards/member.guard';
import { RolesGuard } from '@app/auth/guards/roles.guard';
import { ModuleLoader } from '@app/common/utils/module-loader.util';
import { getMongoConfig } from '@app/config/mongo.config';
import { getRdbConfig } from '@app/config/rdb.config';
import { validationSchema } from '@app/config/validation.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema,
    }),
    TypeOrmModule.forRootAsync({
      useFactory: getRdbConfig,
      inject: [ConfigService],
    }),
    MongooseModule.forRootAsync({
      useFactory: getMongoConfig,
      inject: [ConfigService],
    }),
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: MemberGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {
  static async registerAsync(): Promise<DynamicModule> {
    const featureModules = await ModuleLoader.loadModules();

    return {
      module: AppModule,
      imports: featureModules,
    };
  }
}
