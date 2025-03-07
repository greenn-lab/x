import { utilities as nestWinstonModuleUtilities } from 'nest-winston';
import winston from 'winston';
import 'winston-daily-rotate-file';

import { ENVIRONMENT } from '@app/common/constants/environment.constant';
import { LOG_LEVEL } from '@app/common/constants/log.constant';

export const createWinstonConfig = (projectName: string, nodeEnv: string) => ({
  transports: [
    new winston.transports.Console({
      level:
        nodeEnv === ENVIRONMENT.PRODUCTION ? LOG_LEVEL.INFO : LOG_LEVEL.DEBUG,
      format: winston.format.combine(
        winston.format.timestamp(),
        nestWinstonModuleUtilities.format.nestLike(projectName, {
          prettyPrint: true,
          colors: true,
        }),
      ),
    }),
    new winston.transports.DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxSize: '50m',
      maxFiles: '30d',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
    }),
    new winston.transports.DailyRotateFile({
      filename: 'logs/combined-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '200m',
      maxFiles: '30d',
      level: 'debug', // 생략하면 info가 기본값
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
    }),
  ],
});
