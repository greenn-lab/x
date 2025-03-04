import {
  HttpStatusCode,
  ResponseMessage,
} from '@app/common/constants/response.constant';
import { ErrorResponse } from '@app/types/common/response.type';

export class ResponseErrorDto<T> implements ErrorResponse<T> {
  message: string;
  httpCode: number;
  result: T;

  constructor(message: string, httpCode: number, result: T) {
    this.message = message;
    this.httpCode = httpCode;
    this.result = result;
  }

  static error(
    message: string = ResponseMessage.FAILURE,
    httpCode: number = HttpStatusCode.NO,
    result?: any,
  ): ResponseErrorDto<any> {
    return new ResponseErrorDto(message, httpCode, result);
  }
}
