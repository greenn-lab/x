export const HTTP_LOG_TYPE = {
  REQUEST: 'HTTP_REQUEST',
  RESPONSE: 'HTTP_RESPONSE',
  SLOW_RESPONSE: 'SLOW_RESPONSE',
} as const;

export type HttpLogType = (typeof HTTP_LOG_TYPE)[keyof typeof HTTP_LOG_TYPE];

export const LOG_LEVEL = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug',
} as const;

export type LogLevel = (typeof LOG_LEVEL)[keyof typeof LOG_LEVEL];
