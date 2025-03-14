import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { Request, Response } from 'express';
import { I18nService } from 'nestjs-i18n';

import { ENVIRONMENT } from '@app/common/constants/environment.constant';
import { HttpStatusCode } from '@app/common/constants/response.constant';
import { ResponseErrorDto } from '@app/common/dto/response-error.dto';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  constructor(
    private readonly i18n: I18nService,
    private readonly config: ConfigService,
  ) {}

  catch(error: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const lang = request.headers['accept-language'] || 'ko';

    this.loggingForDebug(error);

    if (error instanceof HttpException) {
      const status = error.getStatus();
      const exceptionResponse = error.getResponse();
      let message = '';
      let data: Record<string, any> | null = null;

      if (typeof exceptionResponse === 'object') {
        const exceptionObj = exceptionResponse as Record<string, any>;

        if ('message' in exceptionObj) {
          message = this.i18n.translate(exceptionObj.message, { lang });
        }

        if ('data' in exceptionObj) {
          data = exceptionObj.data as Record<string, any>;
        }
      } else if (typeof exceptionResponse === 'string') {
        message = this.i18n.translate(exceptionResponse, { lang });
      }

      const errorResponse: ResponseErrorDto<typeof data> = {
        message,
        httpCode: status,
        result: data,
      };

      return response.status(status).json(errorResponse);
    } else {
      return response.status(HttpStatusCode.NO).json(ResponseErrorDto.error());
    }
  }

  private loggingForDebug(error: Error) {
    if (this.config.get('NODE_ENV') !== ENVIRONMENT.PRODUCTION) {
      this.logger.error(error.stack);
    }
  }
}
