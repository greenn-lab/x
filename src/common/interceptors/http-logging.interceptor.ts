import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { ENVIRONMENT } from '@app/common/constants/environment.constant';
import { HTTP_LOG_TYPE, HttpLogType } from '@app/common/constants/log.constant';

interface HttpLogData {
  type: HttpLogType;
  method: string;
  url: string;
  timestamp: string;
  userAgent?: string;
  ip?: string;
  query?: Record<string, unknown>;
  body?: unknown;
  headers?: Record<string, unknown>;
  statusCode?: number;
  responseTime?: number;
  response?: unknown;
}

interface RequestData {
  method: string;
  url: string;
  body: unknown;
  headers: Record<string, unknown>;
  query: Record<string, unknown>;
}

@Injectable()
export class HttpLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(HttpLoggingInterceptor.name);

  constructor(private readonly configService: ConfigService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const requestData: RequestData = {
      method: request.method,
      url: request.url,
      body: request.body,
      headers: request.headers as Record<string, unknown>,
      query: request.query as Record<string, unknown>,
    };
    const requestTime = Date.now();
    const isProd =
      this.configService.get('NODE_ENV') === ENVIRONMENT.PRODUCTION;

    if (isProd) {
      const logData: HttpLogData = {
        type: HTTP_LOG_TYPE.REQUEST,
        method: requestData.method,
        url: requestData.url,
        timestamp: new Date().toISOString(),
        userAgent: requestData.headers['user-agent'] as string,
        ip: request.ip,
      };
      this.logger.log(logData);
    } else {
      const logData: HttpLogData = {
        type: HTTP_LOG_TYPE.REQUEST,
        method: requestData.method,
        url: requestData.url,
        query: requestData.query,
        body: requestData.body,
        headers: requestData.headers,
        timestamp: new Date().toISOString(),
        userAgent: requestData.headers['user-agent'] as string,
        ip: request.ip,
      };
      this.logger.debug(logData);
    }

    return next.handle().pipe(
      tap({
        next: (response) => {
          const responseTime = Date.now() - requestTime;
          const statusCode = context
            .switchToHttp()
            .getResponse<Response>().statusCode;

          if (isProd) {
            const logData: HttpLogData = {
              type: HTTP_LOG_TYPE.RESPONSE,
              method: requestData.method,
              url: requestData.url,
              statusCode,
              responseTime,
              timestamp: new Date().toISOString(),
            };
            this.logger.log(logData);
          } else {
            const logData: HttpLogData = {
              type: HTTP_LOG_TYPE.RESPONSE,
              method: requestData.method,
              url: requestData.url,
              statusCode,
              responseTime,
              response,
              timestamp: new Date().toISOString(),
            };
            this.logger.debug(logData);
          }

          const slowResponseThreshold = this.configService.get<number>(
            'HTTP_SLOW_RESPONSE_THRESHOLD',
            1000,
          );
          if (responseTime > slowResponseThreshold) {
            const logData: HttpLogData = {
              type: HTTP_LOG_TYPE.SLOW_RESPONSE,
              method: requestData.method,
              url: requestData.url,
              responseTime,
              timestamp: new Date().toISOString(),
            };
            this.logger.warn(logData);
          }
        },
      }),
    );
  }
}
