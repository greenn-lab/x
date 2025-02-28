export interface BaseResponseType<T> {
  message: string;
  httpCode: number;
  data: T;
}

export interface PaginatedResponseType<T> {
  count: number;
  totalPage: number;
  items: T[];
}

export interface ErrorResponse<T> {
  httpCode: number;
  message: string;
  result: T;
}
