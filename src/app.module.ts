import path from 'node:path';

import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';

import {
  AcceptLanguageResolver,
  HeaderResolver,
  I18nJsonLoader,
  I18nModule,
  QueryResolver,
} from 'nestjs-i18n';

import { AuthGuard } from '@app/auth/guards/auth.guard';
import { MemberGuard } from '@app/auth/guards/member.guard';
import { RolesGuard } from '@app/auth/guards/roles.guard';
import { ENVIRONMENT } from '@app/common/constants/environment.constant';
import { HttpExceptionFilter } from '@app/common/filters/http-exception.filter';
import { HttpLoggingInterceptor } from '@app/common/interceptors/http-logging.interceptor';
import { ModuleLoader } from '@app/common/utils/module-loader.util';
import { getMongoConfig } from '@app/config/mongo.config';
import { getRdbConfig } from '@app/config/rdb.config';
import { validationSchema } from '@app/config/validation.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`.env.${process.env.NODE_ENV || 'local'}`, '.env'],
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
    I18nModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        fallbackLanguage: configService.get('FALLBACK_LANGUAGE', 'ko'),
        loaderOptions: {
          path: path.join(__dirname, '../i18n/'),
          watch: configService.get('NODE_ENV') !== ENVIRONMENT.PRODUCTION,
        },
      }),
      resolvers: [
        { use: QueryResolver, options: ['lang', 'locale', 'l'] },
        new HeaderResolver(['x-custom-lang']),
        AcceptLanguageResolver,
      ],
      inject: [ConfigService],
      loader: I18nJsonLoader,
    }),
  ],
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
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: HttpLoggingInterceptor,
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
