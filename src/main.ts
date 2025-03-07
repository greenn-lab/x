import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { WinstonModule } from 'nest-winston';

import { AppModule } from '@app/app.module';
import { ENVIRONMENT } from '@app/common/constants/environment.constant';
import { createWinstonConfig } from '@app/config/winston.config';

export const SERVICE_PORT = 3000;

async function bootstrap() {
  const app = await NestFactory.create(await AppModule.registerAsync());
  const configService = app.get(ConfigService);

  app.useLogger(
    WinstonModule.createLogger(
      createWinstonConfig(
        configService.get<string>('PROJECT_NAME') ?? 'a.biz',
        configService.get<string>('NODE_ENV') ?? ENVIRONMENT.DEVELOPMENT,
      ),
    ),
  );

  const config = new DocumentBuilder()
    .setTitle(configService.get('PROJECT_TITLE', 'Project'))
    .setDescription(configService.get('PROJECT_DESCRIPTION', ''))
    .setVersion('1.0')
    .addSecurityRequirements('x-timblo-token')
    .addApiKey(
      {
        type: 'apiKey',
        in: 'header',
        name: 'x-timblo-token',
        description: '암호를 말하라🤨',
      },
      'x-timblo-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('doc', app, document);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.listen(process.env.PORT ?? SERVICE_PORT);
}

bootstrap().catch((err: Error) => {
  const logger = new Logger('Bootstrap');
  logger.error('Application failed to start', err);
  process.exit(1);
});
