import * as Joi from 'joi';

import { ENVIRONMENT } from '@app/common/constants/environment.constant';

export const validationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid(ENVIRONMENT.DEVELOPMENT, ENVIRONMENT.PRODUCTION, ENVIRONMENT.LOCAL)
    .default(ENVIRONMENT.DEVELOPMENT),
  PROJECT_NAME: Joi.string(),
  DB_TYPE: Joi.string().valid('mariadb', 'postgres').required(),
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().required(),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_DATABASE: Joi.string().required(),
  MONGODB_URI: Joi.string().required(),
  MONGODB_DATABASE: Joi.string().required(),
  HTTP_SLOW_RESPONSE_THRESHOLD: Joi.number()
    .default(1000)
    .description('느린 응답 기준 시간 (밀리초)'),
});
