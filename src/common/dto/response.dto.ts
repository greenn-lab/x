import { HttpStatus } from '@nestjs/common';

import {
  ResponseMessage,
  HttpStatusCode,
} from '@app/common/constants/response.constant';
import { BaseResponseType } from '@app/types/common/response.type';

export class ResponseDto<T> implements BaseResponseType<T> {
  message: string;
  httpCode: number;
  data: T;

  constructor(message: string, httpCode: number, data: T) {
    this.message = message;
    this.httpCode = httpCode;
    this.data = data;
  }

  static success<T>(
    data: T,
    message = ResponseMessage.SUCCESS,
    httpCode = HttpStatusCode.OK,
  ): ResponseDto<T> {
    return new ResponseDto(message, httpCode, data);
  }

  static create<T>(
    data: T,
    message = ResponseMessage.SUCCESS,
    httpCode = HttpStatus.CREATED,
  ): ResponseDto<T> {
    return new ResponseDto(message, httpCode, data);
  }
}
